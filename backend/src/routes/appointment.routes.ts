import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { getTenantId } from '../middleware/tenant.middleware';
import { createAuditLog } from '../utils/audit.util';
import { prisma } from '../lib/prisma';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.util';
import * as AppointmentService from '../services/appointment.service';

const router = Router();

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────

/**
 * GET /api/appointments/tenant-info — tenant info from subdomain
 */
router.get('/tenant-info', async (req: Request, res: Response) => {
    try {
        if (!req.tenantId) return res.status(404).json({ error: 'Tenant not found' });

        const tenant = await prisma.tenant.findUnique({
            where: { id: req.tenantId },
            select: { id: true, businessName: true, subdomain: true, bookingMode: true, pageConfig: true },
        });

        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
        res.json(tenant);
    } catch (error) {
        console.error('Get tenant info error:', error);
        res.status(500).json({ error: 'Failed to get tenant info' });
    }
});

/**
 * GET /api/appointments/available-slots — public slot availability
 */
router.get(
    '/available-slots',
    [query('date').isISO8601().withMessage('Valid date is required')],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const tenantId = req.tenantId || req.query.tenantId as string;
            if (!tenantId) return res.status(400).json({ error: 'Tenant not found' });

            const date = new Date(req.query.date as string);
            const slots = await AppointmentService.getAvailableSlots(tenantId, date);
            res.json({ slots });
        } catch (error) {
            console.error('Get available slots error:', error);
            res.status(500).json({ error: 'Failed to get available slots' });
        }
    }
);

/**
 * GET /api/appointments/slots/today/:tenantId — today's available slots (public)
 */
router.get('/slots/today/:tenantId', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const slots = await AppointmentService.getAvailableSlots(req.params.tenantId, today);
        res.json({ slots: slots.map(s => s.time), date: today.toISOString() });
    } catch (error) {
        console.error('Get today slots error:', error);
        res.status(500).json({ error: "Failed to get today's slots" });
    }
});

/**
 * POST /api/appointments — create public booking (pending, awaiting payment)
 */
router.post(
    '/',
    [
        body('customerName').trim().notEmpty().withMessage('Customer name is required'),
        body('customerPhone').trim().notEmpty().withMessage('Phone number is required'),
        body('customerEmail').optional().trim().isEmail().withMessage('Valid email is required'),
        body('appointmentDate').isISO8601().withMessage('Valid date is required'),
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
        body('notes').optional().trim(),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const tenantId = req.tenantId || req.body.tenantId;
            if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

            const appointment = await AppointmentService.createPublicBooking(tenantId, {
                customerName: req.body.customerName,
                customerPhone: req.body.customerPhone,
                customerEmail: req.body.customerEmail,
                appointmentDate: new Date(req.body.appointmentDate),
                startTime: req.body.startTime,
                notes: req.body.notes,
            });

            res.status(201).json({
                ...appointment,
                message: 'Appointment created. Please complete payment within 10 minutes.',
                lockedUntil: appointment.lockedUntil,
            });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Create appointment error:', error);
            res.status(500).json({ error: 'Failed to create appointment' });
        }
    }
);

// ─── ADMIN ROUTES ────────────────────────────────────────────────────

/**
 * POST /api/appointments/admin-book — manual booking (confirmed immediately)
 */
router.post(
    '/admin-book',
    authenticate,
    [
        body('customerName').trim().notEmpty().withMessage('Customer name is required'),
        body('customerPhone').trim().notEmpty().withMessage('Phone number is required'),
        body('customerEmail').optional().trim().isEmail().withMessage('Valid email is required'),
        body('appointmentDate').isISO8601().withMessage('Valid date is required'),
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
        body('notes').optional().trim(),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const tenantId = getTenantId(req);

            const appointment = await AppointmentService.createAdminBooking(tenantId, {
                customerName: req.body.customerName,
                customerPhone: req.body.customerPhone,
                customerEmail: req.body.customerEmail,
                appointmentDate: new Date(req.body.appointmentDate),
                startTime: req.body.startTime,
                notes: req.body.notes,
            });

            await createAuditLog({
                tenantId,
                userId: req.user!.userId,
                userEmail: req.user!.identifier,
                userRole: req.user!.role,
                action: 'create',
                resourceType: 'appointment',
                resourceId: appointment.id,
                details: {
                    customerName: req.body.customerName,
                    customerPhone: req.body.customerPhone,
                    appointmentDate: req.body.appointmentDate,
                    startTime: req.body.startTime,
                    price: appointment.price,
                    manualBooking: true,
                },
            });

            res.status(201).json({ ...appointment, message: 'Appointment booked successfully (manual)' });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Admin book error:', error);
            res.status(500).json({ error: 'Failed to create appointment' });
        }
    }
);

/**
 * GET /api/appointments/day-slots — admin calendar view
 */
router.get('/day-slots', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Date is required' });

        const result = await AppointmentService.getDaySlots(tenantId, new Date(date as string));
        res.json(result);
    } catch (error) {
        console.error('Get day slots error:', error);
        res.status(500).json({ error: 'Failed to get day slots' });
    }
});

/**
 * GET /api/appointments/stats — dashboard stats
 */
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const stats = await AppointmentService.getStats(tenantId);
        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

/**
 * GET /api/appointments/sales-report — sales with date range and grouping
 */
router.get('/sales-report', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { from, to, group = 'daily' } = req.query;

        const now = new Date();
        const fromDate = from ? new Date(from as string) : new Date(now.getFullYear(), now.getMonth(), 1);
        const toDate = to ? new Date(to as string) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const report = await AppointmentService.getSalesReport(tenantId, fromDate, toDate, group as string);
        res.json(report);
    } catch (error) {
        console.error('Sales report error:', error);
        res.status(500).json({ error: 'Failed to generate sales report' });
    }
});

/**
 * GET /api/appointments — paginated list (admin)
 */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { status, date } = req.query;
        const { page, limit } = parsePagination(req.query as any);

        const { appointments, total } = await AppointmentService.listAppointments(
            tenantId,
            { status: status as string | undefined, date: date as string | undefined },
            page,
            limit
        );

        res.json({
            data: appointments,
            pagination: buildPaginationMeta(page, limit, total),
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to get appointments' });
    }
});

/**
 * GET /api/appointments/running — today's confirmed appointments
 * Must be before /:id to avoid route conflict
 */
router.get('/running', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const running = await AppointmentService.getRunningAppointments(tenantId);
        res.json(running);
    } catch (error) {
        console.error('Get running appointments error:', error);
        res.status(500).json({ error: 'Failed to get running appointments' });
    }
});

/**
 * GET /api/appointments/:id — single appointment (public)
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const appointment = await AppointmentService.getAppointmentById(req.params.id);
        res.json(appointment);
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Get appointment error:', error);
        res.status(500).json({ error: 'Failed to get appointment' });
    }
});

/**
 * PATCH /api/appointments/:id/complete — mark as completed
 */
router.patch('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const updated = await AppointmentService.markCompleted(tenantId, req.params.id);

        await createAuditLog({
            tenantId,
            userId: req.user!.userId,
            userEmail: req.user!.identifier,
            userRole: req.user!.role,
            action: 'update',
            resourceType: 'appointment',
            resourceId: req.params.id,
            details: {
                action: 'marked_completed',
                customerName: updated.customerName,
                appointmentDate: updated.appointmentDate,
                startTime: updated.startTime,
            },
        });

        res.json(updated);
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Complete appointment error:', error);
        res.status(500).json({ error: 'Failed to complete appointment' });
    }
});

/**
 * DELETE /api/appointments/:id — cancel appointment
 */
router.delete(
    '/:id',
    authenticate,
    [body('reason').optional().trim()],
    async (req: AuthRequest, res: Response) => {
        try {
            const tenantId = getTenantId(req);
            const { reason } = req.body || {};

            const result = await AppointmentService.cancelAppointment(
                tenantId, req.params.id, req.user!.userId, req.user!.role, reason
            );

            await createAuditLog({
                tenantId,
                userId: req.user!.userId,
                userEmail: req.user!.identifier,
                userRole: req.user!.role,
                action: 'cancel',
                resourceType: 'appointment',
                resourceId: req.params.id,
                details: {
                    reason: reason || 'No reason provided',
                    customerName: result.appointment.customerName,
                    customerPhone: result.appointment.customerPhone,
                    appointmentDate: result.appointment.appointmentDate,
                    startTime: result.appointment.startTime,
                    price: result.appointment.price,
                    hadPayment: result.hadPayment,
                    paymentAmount: result.paymentAmount,
                },
            });

            res.json({ message: 'Appointment cancelled successfully' });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Cancel appointment error:', error);
            res.status(500).json({ error: 'Failed to cancel appointment' });
        }
    }
);

export default router;
