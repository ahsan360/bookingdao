import SSLCommerzPayment from 'sslcommerz-lts';

interface PaymentInitData {
    amount: number;
    currency: string;
    transactionId: string;
    productName: string;
    productCategory: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress?: string;
    customerCity?: string;
    customerPostcode?: string;
    customerCountry?: string;
}

interface SSLCommerzConfig {
    storeId: string;
    storePassword: string;
    sandboxMode: boolean;
}

interface PaymentInitResponse {
    status: string;
    sessionkey?: string;
    GatewayPageURL?: string;
    failedreason?: string;
}

interface PaymentValidationResponse {
    status: string;
    tran_date?: string;
    tran_id?: string;
    val_id?: string;
    amount?: string;
    store_amount?: string;
    currency?: string;
    bank_tran_id?: string;
    card_type?: string;
    card_no?: string;
    card_issuer?: string;
    card_brand?: string;
    card_issuer_country?: string;
    error?: string;
}

class SSLCommerzService {
    /**
     * Initialize payment session with SSL Commerz
     */
    async initPayment(
        config: SSLCommerzConfig,
        paymentData: PaymentInitData,
        successUrl: string,
        failUrl: string,
        cancelUrl: string,
        ipnUrl: string
    ): Promise<PaymentInitResponse> {
        try {
            // SSLCommerzPayment(store_id, store_passwd, is_live)
            // If sandboxMode is true, is_live should be false.
            const sslcz = new SSLCommerzPayment(
                config.storeId,
                config.storePassword,
                !config.sandboxMode
            );

            const data = {
                total_amount: paymentData.amount,
                currency: paymentData.currency,
                tran_id: paymentData.transactionId,
                success_url: successUrl,
                fail_url: failUrl,
                cancel_url: cancelUrl,
                ipn_url: ipnUrl,
                shipping_method: 'NO',
                product_name: paymentData.productName,
                product_category: paymentData.productCategory,
                product_profile: 'general',
                cus_name: paymentData.customerName,
                cus_email: paymentData.customerEmail || 'customer@example.com',
                cus_add1: paymentData.customerAddress || 'Dhaka',
                cus_city: paymentData.customerCity || 'Dhaka',
                cus_postcode: paymentData.customerPostcode || '1000',
                cus_country: paymentData.customerCountry || 'Bangladesh',
                cus_phone: paymentData.customerPhone || '01711111111', // SSLCommerz requires phone
                ship_name: paymentData.customerName,
                ship_add1: paymentData.customerAddress || 'Dhaka',
                ship_city: paymentData.customerCity || 'Dhaka',
                ship_postcode: paymentData.customerPostcode || '1000',
                ship_country: paymentData.customerCountry || 'Bangladesh',
            };

            const response = await sslcz.init(data);
            return response as PaymentInitResponse;
        } catch (error: any) {
            console.error('SSL Commerz init payment error:', error);
            throw new Error(error.message || 'Failed to initialize payment');
        }
    }

    /**
     * Validate payment with SSL Commerz
     */
    async validatePayment(
        config: SSLCommerzConfig,
        validationId: string
    ): Promise<PaymentValidationResponse> {
        try {
            const sslcz = new SSLCommerzPayment(
                config.storeId,
                config.storePassword,
                config.sandboxMode
            );

            const response = await sslcz.validate({ val_id: validationId });
            return response as PaymentValidationResponse;
        } catch (error) {
            console.error('SSL Commerz validate payment error:', error);
            throw new Error('Failed to validate payment');
        }
    }

    /**
     * Initiate refund (if needed)
     */
    async initiateRefund(
        config: SSLCommerzConfig,
        bankTransactionId: string,
        refundAmount: number,
        refundRemarks: string
    ): Promise<any> {
        try {
            const sslcz = new SSLCommerzPayment(
                config.storeId,
                config.storePassword,
                config.sandboxMode
            );

            const data = {
                bank_tran_id: bankTransactionId,
                refund_amount: refundAmount,
                refund_remarks: refundRemarks,
            };

            const response = await sslcz.initiateRefund(data);
            return response;
        } catch (error) {
            console.error('SSL Commerz refund error:', error);
            throw new Error('Failed to initiate refund');
        }
    }

    /**
     * Query transaction status
     */
    async transactionQueryByTransactionId(
        config: SSLCommerzConfig,
        transactionId: string
    ): Promise<any> {
        try {
            const sslcz = new SSLCommerzPayment(
                config.storeId,
                config.storePassword,
                config.sandboxMode
            );

            const response = await sslcz.transactionQueryByTransactionId(transactionId);
            return response;
        } catch (error) {
            console.error('SSL Commerz transaction query error:', error);
            throw new Error('Failed to query transaction');
        }
    }

    /**
     * Query transaction status by session key
     */
    async transactionQueryBySessionKey(
        config: SSLCommerzConfig,
        sessionKey: string
    ): Promise<any> {
        try {
            const sslcz = new SSLCommerzPayment(
                config.storeId,
                config.storePassword,
                config.sandboxMode
            );

            const response = await sslcz.transactionQueryBySessionkey(sessionKey);
            return response;
        } catch (error) {
            console.error('SSL Commerz session query error:', error);
            throw new Error('Failed to query session');
        }
    }
}

export const sslCommerzService = new SSLCommerzService();
export default sslCommerzService;
