/**
 * AppointmentService — shared appointment business logic.
 */
import { prisma } from '../lib/prisma';
import { generateTimeSlots, generateAvailableSlots, calculateEndTime, deduplicateSlots } from '../utils/time-slot.util';
import { APPOINTMENT_STATUSES, ACTIVE_STATUSES, BOOKABLE_STATUSES, LOCK_TTL_SECONDS } from '../utils/constants';
import { NotFoundError, ValidationError, ConflictError, ForbiddenError } from '../utils/errors';

/**
 * Gets available booking slots for a given date and tenant.
 */
export async function getAvailableSlots(tenantId: string, date: Date) {
    const dayOfWeek = date.getDay();

    const schedules = await prisma.schedule.findMany({
        where: { tenantId, dayOfWeek, isActive: true },
        include: { breaks: true },
    });

    if (schedules.length === 0) return [];

    const existing = await prisma.appointment.findMany({
        where: {
            tenantId,
            appointmentDate: date,
            status: { in: [...BOOKABLE_STATUSES] },
        },
        select: { startTime: true },
    });

    const bookedSlots = new Set(existing.map(a => a.startTime));

    const allSlots = schedules
        .flatMap(schedule => generateAvailableSlots(schedule, bookedSlots))
        .sort((a, b) => a.time.localeCompare(b.time));

    return deduplicateSlots(allSlots);
}

/**
 * Gets all slots (booked + available) for admin calendar view.
 */
export async function getDaySlots(tenantId: string, date: Date) {
    const dayOfWeek = date.getDay();
    const dateString = date.toISOString().split('T')[0];

    const schedules = await prisma.schedule.findMany({
        where: { tenantId, dayOfWeek, isActive: true },
        include: { breaks: true },
    });

    if (schedules.length === 0) {
        return { date: dateString, slots: [], summary: { total: 0, available: 0, confirmed: 0, pending: 0, cancelled: 0 } };
    }

    const appointments = await prisma.appointment.findMany({
        where: { tenantId, appointmentDate: date },
        orderBy: { startTime: 'asc' },
    });

    const bookedMap = new Map(
        appointments.map(apt => [apt.startTime, {
            status: apt.status,
            customerName: apt.customerName,
            customerPhone: apt.customerPhone || undefined,
            id: apt.id,
        }])
    );

    const allSlots = schedules.flatMap(schedule => {
        const times = generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration, schedule.breaks);
        return times.map(time => {
            const endTime = calculateEndTime(time, schedule.slotDuration);
            const booking = bookedMap.get(time);
            return {
                time,
                endTime,
                price: schedule.price,
                duration: schedule.slotDuration,
                status: booking ? booking.status : 'available',
                customerName: booking?.customerName || null,
                customerPhone: booking?.customerPhone || null,
                appointmentId: booking?.id || null,
            };
        });
    });

    const uniqueSlots = deduplicateSlots(allSlots.sort((a, b) => a.time.localeCompare(b.time)));

    const summary = {
        total: uniqueSlots.length,
        available: uniqueSlots.filter(s => s.status === 'available').length,
        confirmed: uniqueSlots.filter(s => s.status === APPOINTMENT_STATUSES.CONFIRMED).length,
        pending: uniqueSlots.filter(s => s.status === APPOINTMENT_STATUSES.PENDING).length,
        cancelled: uniqueSlots.filter(s => s.status === APPOINTMENT_STATUSES.CANCELLED).length,
    };

    return { date: dateString, slots: uniqueSlots, summary };
}

/**
 * Creates a public booking (pending, awaiting payment).
 */
export async function createPublicBooking(tenantId: string, data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    appointmentDate: Date;
    startTime: string;
    notes?: string;
}) {
    const dayOfWeek = data.appointmentDate.getDay();

    const schedule = await prisma.schedule.findFirst({
        where: { tenantId, dayOfWeek, isActive: true },
    });

    if (!schedule) throw new ValidationError('No schedule available for this day');

    const endTime = calculateEndTime(data.startTime, schedule.slotDuration);

    // Check for existing booking
    const existing = await prisma.appointment.findFirst({
        where: {
            tenantId,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            status: { in: [...BOOKABLE_STATUSES] },
        },
    });

    if (existing) throw new ConflictError('This time slot is already booked');

    const lockedUntil = new Date(Date.now() + LOCK_TTL_SECONDS * 1000);

    return prisma.appointment.create({
        data: {
            tenantId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            endTime,
            status: APPOINTMENT_STATUSES.PENDING,
            notes: data.notes,
            price: schedule.price,
            lockedUntil,
        },
    });
}

/**
 * Creates an admin booking (confirmed immediately, no payment needed).
 */
export async function createAdminBooking(tenantId: string, data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    appointmentDate: Date;
    startTime: string;
    notes?: string;
}) {
    const dayOfWeek = data.appointmentDate.getDay();

    const schedule = await prisma.schedule.findFirst({
        where: { tenantId, dayOfWeek, isActive: true },
    });

    if (!schedule) throw new ValidationError('No schedule available for this day');

    const endTime = calculateEndTime(data.startTime, schedule.slotDuration);

    const existing = await prisma.appointment.findFirst({
        where: {
            tenantId,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            status: { in: [...BOOKABLE_STATUSES] },
        },
    });

    if (existing) throw new ConflictError('This time slot is already booked');

    return prisma.appointment.create({
        data: {
            tenantId,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            customerEmail: data.customerEmail,
            appointmentDate: data.appointmentDate,
            startTime: data.startTime,
            endTime,
            status: APPOINTMENT_STATUSES.CONFIRMED,
            notes: data.notes,
            price: schedule.price,
        },
    });
}

/**
 * Marks an appointment as completed.
 */
export async function markCompleted(tenantId: string, appointmentId: string) {
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, tenantId },
    });

    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.status !== APPOINTMENT_STATUSES.CONFIRMED) {
        throw new ValidationError('Only confirmed appointments can be marked as completed');
    }

    return prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: APPOINTMENT_STATUSES.COMPLETED, completedAt: new Date() },
    });
}

/**
 * Cancels an appointment with permission checks.
 */
export async function cancelAppointment(tenantId: string, appointmentId: string, userId: string, userRole: string, reason?: string) {
    const appointment = await prisma.appointment.findFirst({
        where: { id: appointmentId, tenantId },
    });

    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.status === APPOINTMENT_STATUSES.CANCELLED) {
        throw new ValidationError('Appointment is already cancelled');
    }

    // Check paid appointment permission
    const payment = await prisma.payment.findFirst({
        where: { appointmentId, status: 'succeeded' },
    });

    if (payment && userRole !== 'owner') {
        throw new ForbiddenError('Only the business owner can cancel paid appointments');
    }

    await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: APPOINTMENT_STATUSES.CANCELLED,
            cancelledBy: userId,
            cancelledAt: new Date(),
            cancelReason: reason || null,
        },
    });

    return { appointment, hadPayment: !!payment, paymentAmount: payment?.amount || 0 };
}

/**
 * Gets today's currently running (in-progress) appointments.
 * Only returns appointments where startTime <= now < endTime.
 * Auto-completes appointments whose endTime has already passed.
 */
export async function getRunningAppointments(tenantId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const confirmed = await prisma.appointment.findMany({
        where: {
            tenantId,
            appointmentDate: { gte: todayStart, lt: todayEnd },
            status: APPOINTMENT_STATUSES.CONFIRMED,
        },
        orderBy: { startTime: 'asc' },
    });

    // Current time as HH:mm for comparison
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const pastIds: string[] = [];
    const currentlyRunning = [];

    for (const apt of confirmed) {
        if (apt.endTime <= currentTime) {
            // Already finished — auto-complete
            pastIds.push(apt.id);
        } else if (apt.startTime <= currentTime && currentTime < apt.endTime) {
            // Currently in progress
            currentlyRunning.push(apt);
        }
        // else: upcoming — don't include
    }

    // Auto-complete past appointments in background
    if (pastIds.length > 0) {
        prisma.appointment.updateMany({
            where: { id: { in: pastIds } },
            data: {
                status: APPOINTMENT_STATUSES.COMPLETED,
                completedAt: new Date(),
            },
        }).catch(err => console.error('Auto-complete error:', err));
    }

    return currentlyRunning;
}

/**
 * Gets a single appointment by ID.
 */
export async function getAppointmentById(id: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) throw new NotFoundError('Appointment');
    return appointment;
}

/**
 * Paginated list of appointments for a tenant (admin).
 */
export async function listAppointments(
    tenantId: string,
    filters: { status?: string; date?: string },
    page: number,
    limit: number
) {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.date) where.appointmentDate = new Date(filters.date);

    const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
            where,
            orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
            skip,
            take: limit,
        }),
        prisma.appointment.count({ where }),
    ]);

    return { appointments, total };
}

/**
 * Sales report with date range and grouping (daily / weekly / monthly).
 */
export async function getSalesReport(
    tenantId: string,
    fromDate: Date,
    toDate: Date,
    group: string
) {
    toDate.setHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            status: { in: [...ACTIVE_STATUSES] },
            appointmentDate: { gte: fromDate, lte: toDate },
        },
        select: {
            id: true, appointmentDate: true, startTime: true, endTime: true,
            customerName: true, customerPhone: true, price: true,
        },
        orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
    });

    const grouped: Record<string, { label: string; appointments: typeof appointments; total: number; count: number }> = {};

    for (const apt of appointments) {
        const date = new Date(apt.appointmentDate);
        let key: string;
        let label: string;

        if (group === 'weekly') {
            const day = date.getDay();
            const monday = new Date(date);
            monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            key = monday.toISOString().split('T')[0];
            label = `${monday.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else if (group === 'monthly') {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            label = date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
        } else {
            key = date.toISOString().split('T')[0];
            label = date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        }

        if (!grouped[key]) grouped[key] = { label, appointments: [], total: 0, count: 0 };
        grouped[key].appointments.push(apt);
        grouped[key].total += apt.price || 0;
        grouped[key].count += 1;
    }

    const periods = Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([key, data]) => ({ key, label: data.label, count: data.count, total: data.total, appointments: data.appointments }));

    return {
        from: fromDate.toISOString().split('T')[0],
        to: toDate.toISOString().split('T')[0],
        group,
        grandTotal: appointments.reduce((sum, a) => sum + (a.price || 0), 0),
        grandCount: appointments.length,
        periods,
    };
}

/**
 * Gets dashboard stats.
 */
export async function getStats(tenantId: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const activeStatuses = [...ACTIVE_STATUSES];

    const [total, confirmed, pending, cancelled, completed, today, daily, monthly, yearly] = await Promise.all([
        prisma.appointment.count({ where: { tenantId } }),
        prisma.appointment.count({ where: { tenantId, status: APPOINTMENT_STATUSES.CONFIRMED } }),
        prisma.appointment.count({ where: { tenantId, status: APPOINTMENT_STATUSES.PENDING } }),
        prisma.appointment.count({ where: { tenantId, status: APPOINTMENT_STATUSES.CANCELLED } }),
        prisma.appointment.count({ where: { tenantId, status: APPOINTMENT_STATUSES.COMPLETED } }),
        prisma.appointment.count({ where: { tenantId, appointmentDate: { gte: todayStart, lt: todayEnd }, status: { in: activeStatuses } } }),
        prisma.appointment.aggregate({ where: { tenantId, status: { in: activeStatuses }, appointmentDate: { gte: todayStart, lt: todayEnd } }, _sum: { price: true } }),
        prisma.appointment.aggregate({ where: { tenantId, status: { in: activeStatuses }, appointmentDate: { gte: monthStart, lt: monthEnd } }, _sum: { price: true } }),
        prisma.appointment.aggregate({ where: { tenantId, status: { in: activeStatuses }, appointmentDate: { gte: yearStart, lt: yearEnd } }, _sum: { price: true } }),
    ]);

    return {
        appointments: { total, confirmed, pending, cancelled, completed, today },
        revenue: {
            daily: daily._sum.price || 0,
            monthly: monthly._sum.price || 0,
            yearly: yearly._sum.price || 0,
        },
    };
}
