import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireProFeature } from '../../middleware/pro-feature.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { createAuditLog } from '../../utils/audit.util';
import { prisma } from '../../lib/prisma';
import { getCustomerContacts } from '../../services/customer.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';

const router = Router();

// All campaigns endpoints require auth + Pro feature
router.use(authenticate, requireProFeature('campaigns'));

/**
 * GET /api/admin/campaigns — list campaigns with pagination
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { page, limit, skip } = parsePagination(req.query as any);

        const [campaigns, total] = await Promise.all([
            prisma.campaign.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.campaign.count({ where: { tenantId } }),
        ]);

        res.json({
            data: campaigns,
            pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({ error: 'Failed to get campaigns' });
    }
});

/**
 * GET /api/admin/campaigns/customers — customer contacts for targeting
 */
router.get('/customers', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const contacts = await getCustomerContacts(tenantId);
        res.json(contacts);
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to get customers' });
    }
});

/**
 * POST /api/admin/campaigns — create and send a campaign
 */
router.post(
    '/',
    authenticate,
    [
        body('title').trim().notEmpty().withMessage('Campaign title is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
        body('channel').isIn(['sms', 'email', 'both']).withMessage('Channel must be sms, email, or both'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { title, message, channel } = req.body;

            const { customers } = await getCustomerContacts(tenantId);
            let sentCount = 0;
            let failCount = 0;

            for (const customer of customers) {
                try {
                    if ((channel === 'sms' || channel === 'both') && customer.phone) {
                        // TODO: Integrate with SSLWireless SMS API
                        console.log(`[CAMPAIGN SMS] To: ${customer.phone} | Message: ${message}`);
                        sentCount++;
                    }

                    if ((channel === 'email' || channel === 'both') && customer.email) {
                        // TODO: Integrate with email service
                        console.log(`[CAMPAIGN EMAIL] To: ${customer.email} | Subject: ${title}`);
                        if (channel === 'email') sentCount++;
                    }
                } catch {
                    failCount++;
                }
            }

            const campaign = await prisma.campaign.create({
                data: {
                    tenantId,
                    title,
                    message,
                    channel,
                    status: 'sent',
                    sentCount,
                    failCount,
                    sentAt: new Date(),
                },
            });

            await createAuditLog({
                tenantId,
                userId: req.user!.userId,
                userEmail: req.user!.identifier,
                userRole: req.user!.role,
                action: 'create',
                resourceType: 'settings',
                resourceId: campaign.id,
                details: { type: 'campaign', title, channel, sentCount, failCount, totalCustomers: customers.length },
            });

            res.status(201).json({
                ...campaign,
                message: `Campaign sent to ${sentCount} customer(s)`,
            });
        } catch (error) {
            console.error('Send campaign error:', error);
            res.status(500).json({ error: 'Failed to send campaign' });
        }
    }
);

export default router;
