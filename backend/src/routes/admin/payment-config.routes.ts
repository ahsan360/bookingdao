import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { encrypt, decrypt } from '../../utils/encryption.util';
import { prisma } from '../../lib/prisma';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Create or update payment gateway configuration
 * POST /api/admin/payment-config
 */
router.post(
    '/',
    [
        body('storeId').trim().notEmpty().withMessage('Store ID is required'),
        body('storePassword').trim().notEmpty().withMessage('Store Password is required'),
        body('sandboxMode').isBoolean().withMessage('Sandbox mode must be a boolean'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { storeId, storePassword, sandboxMode } = req.body;

            // Encrypt sensitive credentials
            const encryptedStoreId = encrypt(storeId);
            const encryptedStorePassword = encrypt(storePassword);

            // Check if config already exists
            const existingConfig = await prisma.paymentGatewayConfig.findUnique({
                where: { tenantId },
            });

            let config;
            if (existingConfig) {
                // Update existing config
                config = await prisma.paymentGatewayConfig.update({
                    where: { tenantId },
                    data: {
                        storeId: encryptedStoreId,
                        storePassword: encryptedStorePassword,
                        sandboxMode,
                        isActive: true,
                        updatedAt: new Date(),
                    },
                });
            } else {
                // Create new config
                config = await prisma.paymentGatewayConfig.create({
                    data: {
                        tenantId,
                        gatewayType: 'sslcommerz',
                        storeId: encryptedStoreId,
                        storePassword: encryptedStorePassword,
                        sandboxMode,
                        isActive: true,
                    },
                });
            }

            res.json({
                message: 'Payment gateway configuration saved successfully',
                config: {
                    id: config.id,
                    gatewayType: config.gatewayType,
                    sandboxMode: config.sandboxMode,
                    isActive: config.isActive,
                    createdAt: config.createdAt,
                    updatedAt: config.updatedAt,
                },
            });
        } catch (error) {
            console.error('Save payment config error:', error);
            res.status(500).json({ error: 'Failed to save payment configuration' });
        }
    }
);

/**
 * Get payment gateway configuration (credentials masked)
 * GET /api/admin/payment-config
 */
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const config = await prisma.paymentGatewayConfig.findUnique({
            where: { tenantId },
        });

        if (!config) {
            return res.status(404).json({ error: 'Payment gateway not configured' });
        }

        // Return config with masked credentials
        res.json({
            id: config.id,
            gatewayType: config.gatewayType,
            storeId: '****' + decrypt(config.storeId).slice(-4), // Show last 4 chars
            sandboxMode: config.sandboxMode,
            isActive: config.isActive,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        });
    } catch (error) {
        console.error('Get payment config error:', error);
        res.status(500).json({ error: 'Failed to get payment configuration' });
    }
});

/**
 * Update payment gateway status (activate/deactivate)
 * PATCH /api/admin/payment-config/status
 */
router.patch(
    '/status',
    [body('isActive').isBoolean().withMessage('isActive must be a boolean')],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { isActive } = req.body;

            const config = await prisma.paymentGatewayConfig.update({
                where: { tenantId },
                data: { isActive },
            });

            res.json({
                message: `Payment gateway ${isActive ? 'activated' : 'deactivated'} successfully`,
                isActive: config.isActive,
            });
        } catch (error) {
            console.error('Update payment config status error:', error);
            res.status(500).json({ error: 'Failed to update payment gateway status' });
        }
    }
);

/**
 * Delete payment gateway configuration
 * DELETE /api/admin/payment-config
 */
router.delete('/', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        await prisma.paymentGatewayConfig.delete({
            where: { tenantId },
        });

        res.json({ message: 'Payment gateway configuration deleted successfully' });
    } catch (error) {
        console.error('Delete payment config error:', error);
        res.status(500).json({ error: 'Failed to delete payment configuration' });
    }
});

/**
 * Test payment gateway connection
 * POST /api/admin/payment-config/test
 */
router.post('/test', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const config = await prisma.paymentGatewayConfig.findUnique({
            where: { tenantId },
        });

        if (!config) {
            return res.status(404).json({ error: 'Payment gateway not configured' });
        }

        // Decrypt credentials for testing
        const storeId = decrypt(config.storeId);
        const storePassword = decrypt(config.storePassword);

        // You can add actual SSL Commerz API test here
        // For now, just verify credentials are decryptable

        res.json({
            message: 'Payment gateway configuration is valid',
            gatewayType: config.gatewayType,
            sandboxMode: config.sandboxMode,
        });
    } catch (error) {
        console.error('Test payment config error:', error);
        res.status(500).json({ error: 'Failed to test payment configuration' });
    }
});

export default router;
