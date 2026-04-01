import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireOwner } from '../../middleware/role.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { createAuditLog } from '../../utils/audit.util';
import { prisma } from '../../lib/prisma';
import { VALID_BOOKING_MODES } from '../../utils/constants';

const router = Router();

/**
 * GET /api/admin/settings — get tenant settings
 */
router.get('/', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                businessName: true,
                subdomain: true,
                email: true,
                bookingMode: true,
            },
        });

        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        res.json(tenant);
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

/**
 * PATCH /api/admin/settings — update tenant settings
 */
router.patch(
    '/',
    authenticate,
    requireOwner,
    [
        body('bookingMode')
            .optional()
            .isIn(VALID_BOOKING_MODES)
            .withMessage(`Booking mode must be one of: ${VALID_BOOKING_MODES.join(', ')}`),
        body('businessName').optional().trim().notEmpty().withMessage('Business name cannot be empty'),
        body('email').optional({ nullable: true }).trim(),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const tenantId = getTenantId(req);
            const { bookingMode, businessName, email } = req.body;

            // Build update data — only include fields that were sent
            const updateData: Record<string, any> = {};
            if (bookingMode !== undefined) updateData.bookingMode = bookingMode;
            if (businessName !== undefined) updateData.businessName = businessName;
            if (email !== undefined) updateData.email = email || null;

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            const updated = await prisma.tenant.update({
                where: { id: tenantId },
                data: updateData,
                select: {
                    id: true,
                    businessName: true,
                    subdomain: true,
                    email: true,
                    bookingMode: true,
                },
            });

            await createAuditLog({
                tenantId,
                userId: req.user!.userId,
                userEmail: req.user!.identifier,
                userRole: req.user!.role,
                action: 'update',
                resourceType: 'settings',
                resourceId: tenantId,
                details: { updated: updateData },
            });

            res.json(updated);
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }
);

export default router;
