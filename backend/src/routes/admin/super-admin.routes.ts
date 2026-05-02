import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireSuperAdmin } from '../../middleware/super-admin.middleware';

const router = Router();
const prisma = new PrismaClient();

// All routes require auth + super admin
router.use(authenticate, requireSuperAdmin);

// ─── LIST ALL TENANTS ────────────────────────────────────────────
router.get('/tenants', async (_req: AuthRequest, res: Response) => {
    try {
        const tenants = await prisma.tenant.findMany({
            select: {
                id: true,
                businessName: true,
                subdomain: true,
                email: true,
                proUntil: true,
                createdAt: true,
                _count: {
                    select: { users: true, appointments: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const now = Date.now();
        const enriched = tenants.map(t => ({
            id: t.id,
            businessName: t.businessName,
            subdomain: t.subdomain,
            email: t.email,
            proUntil: t.proUntil,
            tier: t.proUntil && t.proUntil.getTime() > now ? 'pro' : 'free',
            createdAt: t.createdAt,
            userCount: t._count.users,
            appointmentCount: t._count.appointments,
        }));

        res.json({ tenants: enriched });
    } catch (error) {
        console.error('List tenants error:', error);
        res.status(500).json({ error: 'Failed to list tenants' });
    }
});

// ─── GRANT PRO ───────────────────────────────────────────────────
router.post('/tenants/:id/grant-pro', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { proUntil } = req.body as { proUntil?: string };

        if (!proUntil) {
            return res.status(400).json({ error: 'proUntil (ISO date string) is required' });
        }

        const date = new Date(proUntil);
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid proUntil date' });
        }
        if (date.getTime() <= Date.now()) {
            return res.status(400).json({ error: 'proUntil must be in the future' });
        }

        const tenant = await prisma.tenant.update({
            where: { id },
            data: { proUntil: date },
            select: { id: true, businessName: true, proUntil: true },
        });

        res.json({ ok: true, tenant });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        console.error('Grant Pro error:', error);
        res.status(500).json({ error: 'Failed to grant Pro' });
    }
});

// ─── REVOKE PRO ──────────────────────────────────────────────────
router.post('/tenants/:id/revoke-pro', async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const tenant = await prisma.tenant.update({
            where: { id },
            data: { proUntil: null },
            select: { id: true, businessName: true, proUntil: true },
        });
        res.json({ ok: true, tenant });
    } catch (error: any) {
        if (error?.code === 'P2025') {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        console.error('Revoke Pro error:', error);
        res.status(500).json({ error: 'Failed to revoke Pro' });
    }
});

export default router;
