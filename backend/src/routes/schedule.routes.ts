import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { ensureTenantContext, getTenantId } from '../middleware/tenant.middleware';
import * as ScheduleService from '../services/schedule.service';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(ensureTenantContext);

// Create schedule
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Schedule name is required'),
        body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
        body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
        body('slotDuration').isIn([15, 30, 60]).withMessage('Slot duration must be 15, 30, or 60 minutes'),
        body('price').optional().isInt({ min: 0 }).withMessage('Price must be a positive integer'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { name, dayOfWeek, startTime, endTime, slotDuration, price } = req.body;

            const schedule = await ScheduleService.createSchedule(tenantId, {
                name, dayOfWeek, startTime, endTime, slotDuration, price,
            });

            res.status(201).json(schedule);
        } catch (error) {
            console.error('Create schedule error:', error);
            res.status(500).json({ error: 'Failed to create schedule' });
        }
    }
);

// Get all schedules for tenant
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const schedules = await ScheduleService.getSchedulesByTenant(tenantId);
        res.json(schedules);
    } catch (error) {
        console.error('Get schedules error:', error);
        res.status(500).json({ error: 'Failed to get schedules' });
    }
});

// Update schedule
router.put(
    '/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        body('slotDuration').optional().isIn([15, 30, 60]),
        body('price').optional().isInt({ min: 0 }),
        body('isActive').optional().isBoolean(),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { id } = req.params;

            const schedule = await ScheduleService.updateSchedule(tenantId, id, req.body);
            res.json(schedule);
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Update schedule error:', error);
            res.status(500).json({ error: 'Failed to update schedule' });
        }
    }
);

// Delete schedule
router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { id } = req.params;

        await ScheduleService.deleteSchedule(tenantId, id);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Delete schedule error:', error);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
});

// Add break to schedule
router.post(
    '/:id/breaks',
    [
        body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
        body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const tenantId = getTenantId(req);
            const { id } = req.params;
            const { startTime, endTime } = req.body;

            const breakTime = await ScheduleService.addBreak(tenantId, id, { startTime, endTime });
            res.status(201).json(breakTime);
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Add break error:', error);
            res.status(500).json({ error: 'Failed to add break' });
        }
    }
);

// Delete break
router.delete('/breaks/:breakId', async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { breakId } = req.params;

        await ScheduleService.deleteBreak(tenantId, breakId);
        res.json({ message: 'Break deleted successfully' });
    } catch (error: any) {
        if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
        console.error('Delete break error:', error);
        res.status(500).json({ error: 'Failed to delete break' });
    }
});

export default router;
