/**
 * PaymentService — business logic for payment initialization and callbacks.
 */
import { v4 as uuidv4 } from 'uuid';
import SSLCommerzPayment from 'sslcommerz-lts';
import { prisma } from '../lib/prisma';
import { decrypt } from '../utils/encryption.util';
import sslCommerzService from './sslcommerz.service';
import { DEFAULT_CURRENCY, SSLCOMMERZ_DEFAULTS } from '../utils/constants';
import { NotFoundError, ValidationError } from '../utils/errors';

/**
 * Build the tenant-specific frontend URL using their subdomain.
 */
export function getTenantFrontendUrl(subdomain: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const url = new URL(frontendUrl);
    url.hostname = `${subdomain}.${url.hostname}`;
    return url.origin;
}

/**
 * Get decrypted SSLCommerz credentials for a tenant.
 */
export async function getTenantGatewayConfig(tenantId: string) {
    const config = await prisma.paymentGatewayConfig.findUnique({
        where: { tenantId },
    });

    if (!config || !config.isActive) {
        return null;
    }

    return {
        storeId: decrypt(config.storeId),
        storePassword: decrypt(config.storePassword),
        sandboxMode: config.sandboxMode,
    };
}

/**
 * Initialize a payment (or auto-confirm for manual/free bookings).
 */
export async function initializePayment(
    appointmentId: string,
    amount: number,
    manualPayment?: boolean
) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
    });

    if (!appointment) {
        throw new NotFoundError('Appointment');
    }

    if (appointment.status !== 'pending') {
        throw new ValidationError('Appointment is not in pending status');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: appointment.tenantId },
        select: { businessName: true, bookingMode: true },
    });

    if (!tenant) {
        throw new NotFoundError('Tenant');
    }

    const isManualBooking =
        tenant.bookingMode === 'manual_only' ||
        (tenant.bookingMode === 'both' && manualPayment === true) ||
        amount === 0;

    if (manualPayment && tenant.bookingMode === 'payment_required') {
        throw new ValidationError('This business requires online payment for bookings');
    }

    // MANUAL / FREE BOOKING: confirm immediately without payment gateway
    if (isManualBooking) {
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'confirmed', lockedUntil: null },
        });

        return {
            free: true,
            message: tenant.bookingMode === 'manual_only'
                ? 'Booking confirmed (manual payment)'
                : 'Booking confirmed (free appointment)',
            appointmentId,
        };
    }

    // Get per-tenant payment gateway credentials
    const gateway = await getTenantGatewayConfig(appointment.tenantId);
    if (!gateway) {
        throw new ValidationError('Payment gateway not configured for this business. Please contact the business owner.');
    }

    const transactionId = `TXN-${appointment.tenantId.slice(0, 8)}-${Date.now()}`;
    const idempotencyKey = uuidv4();

    const payment = await prisma.payment.create({
        data: {
            tenantId: appointment.tenantId,
            appointmentId,
            amount,
            currency: DEFAULT_CURRENCY,
            gatewayType: 'sslcommerz',
            gatewayTransactionId: transactionId,
            idempotencyKey,
            status: 'pending',
        },
    });

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

    const sslcz = new SSLCommerzPayment(
        gateway.storeId,
        gateway.storePassword,
        !gateway.sandboxMode
    );

    const paymentPayload = {
        total_amount: amount,
        currency: DEFAULT_CURRENCY,
        tran_id: transactionId,
        success_url: `${baseUrl}/api/payments/success`,
        fail_url: `${baseUrl}/api/payments/fail`,
        cancel_url: `${baseUrl}/api/payments/cancel`,
        ipn_url: `${baseUrl}/api/payments/ipn`,
        cus_name: appointment.customerName,
        cus_email: appointment.customerEmail || SSLCOMMERZ_DEFAULTS.customerEmail,
        cus_add1: SSLCOMMERZ_DEFAULTS.address,
        cus_city: SSLCOMMERZ_DEFAULTS.city,
        cus_postcode: SSLCOMMERZ_DEFAULTS.postcode,
        cus_country: SSLCOMMERZ_DEFAULTS.country,
        cus_phone: appointment.customerPhone,
        shipping_method: SSLCOMMERZ_DEFAULTS.shippingMethod,
        product_name: `Appointment - ${tenant.businessName || 'Booking'}`,
        product_category: SSLCOMMERZ_DEFAULTS.productCategory,
        product_profile: SSLCOMMERZ_DEFAULTS.productProfile,
        num_of_item: 1,
        value_a: appointmentId,
        value_b: appointment.tenantId,
    };

    const response = await sslcz.init(paymentPayload);

    if (response.status !== 'SUCCESS') {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' },
        });

        throw new ValidationError(`Failed to initialize payment: ${response.failedreason || 'Unknown error'}`);
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: { sessionKey: response.sessionkey },
    });

    return {
        paymentId: payment.id,
        transactionId,
        gatewayPageURL: response.GatewayPageURL,
        sessionKey: response.sessionkey,
    };
}

/**
 * Process a successful payment callback.
 * Returns the redirect URL.
 */
export async function processPaymentSuccess(tran_id: string, val_id: string): Promise<string> {
    const payment = await prisma.payment.findFirst({
        where: { gatewayTransactionId: tran_id },
    });

    if (!payment) {
        throw new NotFoundError('Payment');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: payment.tenantId },
        select: { subdomain: true },
    });

    const gateway = await getTenantGatewayConfig(payment.tenantId);
    if (!gateway) {
        throw new ValidationError('Payment gateway not configured');
    }

    const sslcz = new SSLCommerzPayment(
        gateway.storeId,
        gateway.storePassword,
        !gateway.sandboxMode
    );

    const validationResponse = await sslcz.validate({ val_id });

    if (validationResponse.status !== 'VALID' && validationResponse.status !== 'VALIDATED') {
        throw new ValidationError('Payment validation failed');
    }

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'succeeded', validationId: val_id },
        });

        await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: { status: 'confirmed', lockedUntil: null },
        });
    });

    console.log('Payment confirmed and appointment booked');

    const tenantUrl = getTenantFrontendUrl(tenant!.subdomain);
    return `${tenantUrl}/booking/success?appointmentId=${payment.appointmentId}`;
}

/**
 * Process a failed payment callback.
 * Returns the redirect URL.
 */
export async function processPaymentFail(tran_id: string): Promise<string> {
    const payment = await prisma.payment.findFirst({
        where: { gatewayTransactionId: tran_id },
    });

    if (!payment) {
        throw new NotFoundError('Payment');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: payment.tenantId },
        select: { subdomain: true },
    });

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' },
        });

        await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: {
                status: 'cancelled',
                cancelReason: 'Payment failed',
                cancelledAt: new Date(),
            },
        });
    });

    const tenantUrl = getTenantFrontendUrl(tenant!.subdomain);
    return `${tenantUrl}/booking/failed?reason=payment_failed`;
}

/**
 * Process a cancelled payment callback.
 * Returns the redirect URL.
 */
export async function processPaymentCancel(tran_id: string): Promise<string> {
    const payment = await prisma.payment.findFirst({
        where: { gatewayTransactionId: tran_id },
    });

    if (!payment) {
        throw new NotFoundError('Payment');
    }

    const tenant = await prisma.tenant.findUnique({
        where: { id: payment.tenantId },
        select: { subdomain: true },
    });

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'cancelled' },
        });

        await tx.appointment.update({
            where: { id: payment.appointmentId },
            data: {
                status: 'cancelled',
                cancelReason: 'Payment cancelled by customer',
                cancelledAt: new Date(),
            },
        });
    });

    const tenantUrl = getTenantFrontendUrl(tenant!.subdomain);
    console.log('Redirecting to tenant URL after cancellation:', `${tenantUrl}`);
    return `${tenantUrl}/booking/cancelled`;
}
