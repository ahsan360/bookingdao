import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireOwner } from '../../middleware/role.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { createAuditLog } from '../../utils/audit.util';
import { prisma } from '../../lib/prisma';
import {
    hashPassword, validateIdentifier, checkExistingUser,
    resolveNames, getTenantPlanLimits,
} from '../../services/auth.service';

const router = Router();

/**
 * GET /api/admin/team — list team members (owner only)
 */
router.get('/', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const users = await prisma.user.findMany({
            where: { tenantId },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
            orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
        });

        const membersWithName = users.map(u => ({
            ...u,
            name: `${u.firstName} ${u.lastName}`.trim(),
        }));

        const { maxAdmins } = await getTenantPlanLimits(tenantId);

        res.json({
            members: membersWithName,
            limits: { maxAdmins, currentCount: users.length, canAdd: users.length < maxAdmins },
        });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Failed to get team members' });
    }
});

/**
 * POST /api/admin/team — add a new admin (owner only)
 */
router.post(
    '/',
    authenticate,
    requireOwner,
    [
        body('firstName').trim().notEmpty().withMessage('First name is required'),
        body('lastName').trim().notEmpty().withMessage('Last name is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const tenantId = getTenantId(req);
            const { password } = req.body;
            const { firstName, lastName } = resolveNames(req.body);
            const { email, phone } = validateIdentifier(req.body.email, req.body.phone);

            const { maxAdmins } = await getTenantPlanLimits(tenantId);
            const currentCount = await prisma.user.count({ where: { tenantId } });
            if (currentCount >= maxAdmins) {
                return res.status(403).json({ error: `Your plan allows maximum ${maxAdmins} team member(s). Upgrade to add more.` });
            }

            await checkExistingUser(email, phone);

            const newAdmin = await prisma.user.create({
                data: {
                    tenantId, firstName, lastName, email, phone,
                    password: await hashPassword(password),
                    role: 'admin',
                },
                select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
            });

            await createAuditLog({
                tenantId,
                userId: req.user!.userId,
                userEmail: req.user!.identifier,
                userRole: req.user!.role,
                action: 'create',
                resourceType: 'admin',
                resourceId: newAdmin.id,
                details: { adminName: `${firstName} ${lastName}`.trim(), adminEmail: email, adminPhone: phone },
            });

            res.status(201).json({ ...newAdmin, name: `${newAdmin.firstName} ${newAdmin.lastName}`.trim() });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Add admin error:', error);
            res.status(500).json({ error: 'Failed to add team member' });
        }
    }
);

/**
 * DELETE /api/admin/team/:id — remove an admin (owner only)
 */
router.delete('/:id', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const userToRemove = await prisma.user.findFirst({ where: { id, tenantId } });
        if (!userToRemove) return res.status(404).json({ error: 'Team member not found' });
        if (userToRemove.role === 'owner') return res.status(403).json({ error: 'Cannot remove the business owner' });

        await prisma.user.delete({ where: { id } });

        await createAuditLog({
            tenantId,
            userId: req.user!.userId,
            userEmail: req.user!.identifier,
            userRole: req.user!.role,
            action: 'delete',
            resourceType: 'admin',
            resourceId: id,
            details: {
                removedName: `${userToRemove.firstName} ${userToRemove.lastName}`.trim(),
                removedEmail: userToRemove.email,
                removedPhone: userToRemove.phone,
            },
        });

        res.json({ message: 'Team member removed successfully' });
    } catch (error) {
        console.error('Remove admin error:', error);
        res.status(500).json({ error: 'Failed to remove team member' });
    }
});

/**
 * PATCH /api/admin/team/:id/toggle — toggle admin active status (owner only)
 */
router.patch('/:id/toggle', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        const user = await prisma.user.findFirst({ where: { id, tenantId } });
        if (!user) return res.status(404).json({ error: 'Team member not found' });
        if (user.role === 'owner') return res.status(403).json({ error: 'Cannot deactivate the business owner' });

        const updated = await prisma.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
        });

        await createAuditLog({
            tenantId,
            userId: req.user!.userId,
            userEmail: req.user!.identifier,
            userRole: req.user!.role,
            action: 'update',
            resourceType: 'admin',
            resourceId: id,
            details: { toggled: updated.isActive ? 'activated' : 'deactivated', adminName: `${user.firstName} ${user.lastName}`.trim() },
        });

        res.json({ ...updated, name: `${updated.firstName} ${updated.lastName}`.trim() });
    } catch (error) {
        console.error('Toggle admin error:', error);
        res.status(500).json({ error: 'Failed to update team member' });
    }
});

export default router;
