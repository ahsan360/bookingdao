import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import sslCommerzService from '../services/sslcommerz.service';
import { prisma } from '../lib/prisma';
import * as PaymentService from '../services/payment.service';

const router = Router();

/**
 * Initialize SSL Commerz payment
 * POST /api/payments/init
 *
 * Respects tenant bookingMode:
 * - "manual_only": auto-confirms without payment
 * - "payment_required": requires SSLCommerz payment
 * - "both": frontend sends `manualPayment: true` to skip gateway
 */
router.post(
    '/init',
    [
        body('appointmentId').notEmpty().withMessage('Appointment ID is required'),
        body('amount').isInt({ min: 0 }).withMessage('Amount must be a non-negative integer'),
        body('manualPayment').optional().isBoolean(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { appointmentId, amount, manualPayment } = req.body;
            const result = await PaymentService.initializePayment(appointmentId, amount, manualPayment);
            res.json(result);
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Payment init error:', error);
            res.status(500).json({ error: error.message || 'Failed to initialize payment' });
        }
    }
);

/**
 * Handle successful payment callback
 * POST /api/payments/success
 */
router.post('/success', async (req: Request, res: Response) => {
    try {
        const { val_id, tran_id } = req.body;
        console.log('Payment success callback:', { val_id, tran_id });

        const redirectUrl = await PaymentService.processPaymentSuccess(tran_id, val_id);
        res.redirect(redirectUrl);
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Payment success handler error:', error);
        res.status(500).json({ error: 'Failed to process payment success' });
    }
});

/**
 * Handle failed payment callback
 * POST /api/payments/fail
 */
router.post('/fail', async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.body;
        const redirectUrl = await PaymentService.processPaymentFail(tran_id);
        res.redirect(redirectUrl);
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Payment fail handler error:', error);
        res.status(500).json({ error: 'Failed to process payment failure' });
    }
});

/**
 * Handle cancelled payment callback
 * POST /api/payments/cancel
 */
router.post('/cancel', async (req: Request, res: Response) => {
    try {
        const { tran_id } = req.body;
        const redirectUrl = await PaymentService.processPaymentCancel(tran_id);
        res.redirect(redirectUrl);
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Payment cancel handler error:', error);
        res.status(500).json({ error: 'Failed to process payment cancellation' });
    }
});

/**
 * Handle IPN (Instant Payment Notification)
 * POST /api/payments/ipn
 */
router.post('/ipn', async (req: Request, res: Response) => {
    try {
        const { val_id, tran_id, status } = req.body;

        console.log('IPN received:', { val_id, tran_id, status });

        const payment = await prisma.payment.findFirst({
            where: { gatewayTransactionId: tran_id },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Get per-tenant credentials
        const gateway = await PaymentService.getTenantGatewayConfig(payment.tenantId);
        if (!gateway) {
            return res.status(400).json({ error: 'Payment gateway not configured' });
        }

        // Validate payment
        const validationResponse = await sslCommerzService.validatePayment(
            {
                storeId: gateway.storeId,
                storePassword: gateway.storePassword,
                sandboxMode: gateway.sandboxMode,
            },
            val_id
        );

        if (validationResponse.status === 'VALID' || validationResponse.status === 'VALIDATED') {
            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: 'succeeded',
                        validationId: val_id,
                    },
                });

                await tx.appointment.update({
                    where: { id: payment.appointmentId },
                    data: {
                        status: 'confirmed',
                        lockedUntil: null,
                    },
                });
            });

            console.log('IPN: Payment confirmed');
        }

        res.json({ status: 'OK' });
    } catch (error) {
        console.error('IPN handler error:', error);
        res.status(500).json({ error: 'Failed to process IPN' });
    }
});

/**
 * Get payment status
 * GET /api/payments/:appointmentId
 */
router.get('/:appointmentId', async (req: Request, res: Response) => {
    try {
        const { appointmentId } = req.params;

        const payment = await prisma.payment.findFirst({
            where: { appointmentId },
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            select: {
                id: true,
                customerName: true,
                appointmentDate: true,
                startTime: true,
                endTime: true,
                status: true,
            },
        });

        res.json({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            gatewayType: payment.gatewayType,
            transactionId: payment.gatewayTransactionId,
            createdAt: payment.createdAt,
            appointment,
        });
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ error: 'Failed to get payment' });
    }
});

export default router;
