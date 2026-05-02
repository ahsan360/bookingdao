import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireOwner } from '../../middleware/role.middleware';
import { requireProFeature } from '../../middleware/pro-feature.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { prisma } from '../../lib/prisma';

const router = Router();

// Audit log is a Pro feature; also requires owner role.
router.use(authenticate, requireOwner, requireProFeature('auditLog'));

/**
 * Get audit logs (owner only)
 * GET /api/admin/audit-log
 * Query params: page, limit, action, resourceType, userId, from, to
 */
router.get('/', authenticate, requireOwner, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const {
            page = '1',
            limit = '50',
            action,
            resourceType,
            userId,
            from,
            to,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
        const skip = (pageNum - 1) * limitNum;

        const where: any = { tenantId };

        if (action) where.action = action;
        if (resourceType) where.resourceType = resourceType;
        if (userId) where.userId = userId;
        if (from || to) {
            where.createdAt = {};
            if (from) where.createdAt.gte = new Date(from as string);
            if (to) {
                const toDate = new Date(to as string);
                toDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = toDate;
            }
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma.auditLog.count({ where }),
        ]);

        res.json({
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({ error: 'Failed to get audit logs' });
    }
});

export default router;
