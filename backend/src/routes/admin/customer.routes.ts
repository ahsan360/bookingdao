import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireProFeature } from '../../middleware/pro-feature.middleware';
import { getTenantId } from '../../middleware/tenant.middleware';
import { prisma } from '../../lib/prisma';
import { getCustomersByTenant, filterCustomers, sortCustomers } from '../../services/customer.service';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination.util';

const router = Router();

// CRM is a Pro feature
router.use(authenticate, requireProFeature('customerCRM'));

/**
 * GET /api/admin/customers — paginated, searchable, sortable customer list
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { search, sort = 'bookings', order = 'desc' } = req.query;
        const { page, limit } = parsePagination(req.query as any, 50);

        let customers = await getCustomersByTenant(tenantId);

        if (search && typeof search === 'string') {
            customers = filterCustomers(customers, search);
        }

        customers = sortCustomers(customers, sort as string, order as 'asc' | 'desc');

        const total = customers.length;
        const start = (page - 1) * limit;
        const paginated = customers.slice(start, start + limit);

        res.json({
            data: paginated,
            pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ error: 'Failed to get customers' });
    }
});

/**
 * GET /api/admin/customers/:phone — single customer with booking history
 */
router.get('/:phone', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { phone } = req.params;

        const appointments = await prisma.appointment.findMany({
            where: { tenantId, customerPhone: phone },
            orderBy: { appointmentDate: 'desc' },
        });

        if (appointments.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer = {
            name: appointments[0].customerName,
            phone: appointments[0].customerPhone,
            email: appointments[0].customerEmail || null,
            bookingCount: appointments.length,
            completedCount: appointments.filter(a => a.status === 'completed').length,
            cancelledCount: appointments.filter(a => a.status === 'cancelled').length,
            totalSpent: appointments
                .filter(a => ['confirmed', 'completed'].includes(a.status))
                .reduce((sum, a) => sum + (a.price || 0), 0),
            firstBooking: appointments[appointments.length - 1].createdAt,
            lastBooking: appointments[0].createdAt,
            appointments,
        };

        res.json(customer);
    } catch (error) {
        console.error('Get customer detail error:', error);
        res.status(500).json({ error: 'Failed to get customer details' });
    }
});

export default router;
