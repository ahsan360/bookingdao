/**
 * ScheduleService — business logic for schedules and breaks.
 */
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../utils/errors';

/**
 * Returns all schedules (with breaks) for a tenant, ordered by day then start time.
 */
export async function getSchedulesByTenant(tenantId: string) {
    return prisma.schedule.findMany({
        where: { tenantId },
        include: { breaks: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
}

/**
 * Creates a new schedule for a tenant.
 */
export async function createSchedule(
    tenantId: string,
    data: {
        name: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        slotDuration: number;
        price?: number;
    }
) {
    return prisma.schedule.create({
        data: {
            tenantId,
            name: data.name,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
            slotDuration: data.slotDuration,
            price: data.price || 0,
        },
    });
}

/**
 * Updates an existing schedule, verifying it belongs to the tenant.
 */
export async function updateSchedule(
    tenantId: string,
    scheduleId: string,
    data: Record<string, any>
) {
    const existing = await prisma.schedule.findFirst({
        where: { id: scheduleId, tenantId },
    });

    if (!existing) {
        throw new NotFoundError('Schedule');
    }

    return prisma.schedule.update({
        where: { id: scheduleId },
        data,
        include: { breaks: true },
    });
}

/**
 * Deletes a schedule, verifying it belongs to the tenant.
 */
export async function deleteSchedule(tenantId: string, scheduleId: string) {
    const existing = await prisma.schedule.findFirst({
        where: { id: scheduleId, tenantId },
    });

    if (!existing) {
        throw new NotFoundError('Schedule');
    }

    await prisma.schedule.delete({
        where: { id: scheduleId },
    });
}

/**
 * Adds a break to a schedule, verifying the schedule belongs to the tenant.
 */
export async function addBreak(
    tenantId: string,
    scheduleId: string,
    data: { startTime: string; endTime: string }
) {
    const schedule = await prisma.schedule.findFirst({
        where: { id: scheduleId, tenantId },
    });

    if (!schedule) {
        throw new NotFoundError('Schedule');
    }

    return prisma.scheduleBreak.create({
        data: {
            scheduleId,
            startTime: data.startTime,
            endTime: data.endTime,
        },
    });
}

/**
 * Deletes a break, verifying it belongs to a tenant's schedule.
 */
export async function deleteBreak(tenantId: string, breakId: string) {
    const breakTime = await prisma.scheduleBreak.findFirst({
        where: { id: breakId },
        include: { schedule: true },
    });

    if (!breakTime || breakTime.schedule.tenantId !== tenantId) {
        throw new NotFoundError('Break');
    }

    await prisma.scheduleBreak.delete({
        where: { id: breakId },
    });
}
