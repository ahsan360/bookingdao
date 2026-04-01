/**
 * Time slot generation utilities.
 * Extracted from appointment.routes.ts to be reusable.
 */

interface BreakPeriod {
    startTime: string;
    endTime: string;
}

function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function minutesToTime(minutes: number): string {
    return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/**
 * Generates time slot start times for a schedule, excluding break periods.
 */
export function generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
    breaks: BreakPeriod[]
): string[] {
    const slots: string[] = [];
    let current = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    while (current + slotDuration <= end) {
        const slotEnd = current + slotDuration;

        const overlapsBreak = breaks.some(b => {
            const bStart = timeToMinutes(b.startTime);
            const bEnd = timeToMinutes(b.endTime);
            return (current >= bStart && current < bEnd) ||
                   (slotEnd > bStart && slotEnd <= bEnd) ||
                   (current <= bStart && slotEnd >= bEnd);
        });

        if (!overlapsBreak) {
            slots.push(minutesToTime(current));
        }

        current += slotDuration;
    }

    return slots;
}

/**
 * Generates slots with price, filtering out already-booked times.
 */
export function generateAvailableSlots(
    schedule: { startTime: string; endTime: string; slotDuration: number; price: number; breaks: BreakPeriod[] },
    bookedSlots: Set<string>
): { time: string; price: number }[] {
    return generateTimeSlots(schedule.startTime, schedule.endTime, schedule.slotDuration, schedule.breaks)
        .filter(slot => !bookedSlots.has(slot))
        .map(slot => ({ time: slot, price: schedule.price }));
}

/**
 * Calculates end time given a start time and duration in minutes.
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
    return minutesToTime(timeToMinutes(startTime) + durationMinutes);
}

/**
 * Deduplicates slots by time, keeping the first occurrence.
 */
export function deduplicateSlots<T extends { time: string }>(slots: T[]): T[] {
    const seen = new Set<string>();
    return slots.filter(s => {
        if (seen.has(s.time)) return false;
        seen.add(s.time);
        return true;
    });
}
