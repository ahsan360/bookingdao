/**
 * CustomerService — aggregates customer data from appointments.
 * Single source of truth for customer deduplication logic.
 * Used by both /admin/customers and /admin/campaigns routes.
 */
import { prisma } from '../lib/prisma';

export interface AggregatedCustomer {
    name: string;
    phone: string;
    email: string | null;
    bookingCount: number;
    completedCount: number;
    totalSpent: number;
    lastBooking: Date;
}

/**
 * Gets deduplicated customer list from appointment history.
 * Aggregates by phone number with booking stats.
 */
export async function getCustomersByTenant(tenantId: string): Promise<AggregatedCustomer[]> {
    const appointments = await prisma.appointment.findMany({
        where: {
            tenantId,
            status: { notIn: ['cancelled', 'expired'] },
        },
        select: {
            customerName: true,
            customerPhone: true,
            customerEmail: true,
            status: true,
            price: true,
            createdAt: true,
        },
    });

    const customerMap = new Map<string, AggregatedCustomer>();

    for (const apt of appointments) {
        const key = apt.customerPhone;
        const existing = customerMap.get(key);

        if (existing) {
            existing.bookingCount++;
            if (apt.status === 'completed') existing.completedCount++;
            existing.totalSpent += apt.price || 0;
            if (apt.createdAt > existing.lastBooking) {
                existing.lastBooking = apt.createdAt;
                existing.name = apt.customerName;
                if (apt.customerEmail) existing.email = apt.customerEmail;
            }
        } else {
            customerMap.set(key, {
                name: apt.customerName,
                phone: apt.customerPhone,
                email: apt.customerEmail || null,
                bookingCount: 1,
                completedCount: apt.status === 'completed' ? 1 : 0,
                totalSpent: apt.price || 0,
                lastBooking: apt.createdAt,
            });
        }
    }

    return Array.from(customerMap.values());
}

/**
 * Filters customers by search term (name, phone, or email).
 */
export function filterCustomers(customers: AggregatedCustomer[], search: string): AggregatedCustomer[] {
    const s = search.toLowerCase();
    return customers.filter(c =>
        c.name.toLowerCase().includes(s) ||
        c.phone.includes(s) ||
        (c.email && c.email.toLowerCase().includes(s))
    );
}

/**
 * Sorts customers by field.
 */
export function sortCustomers(
    customers: AggregatedCustomer[],
    field: string,
    order: 'asc' | 'desc' = 'desc'
): AggregatedCustomer[] {
    const dir = order === 'asc' ? 1 : -1;
    return [...customers].sort((a, b) => {
        switch (field) {
            case 'name': return a.name.localeCompare(b.name) * dir;
            case 'bookings': return (a.bookingCount - b.bookingCount) * dir;
            case 'spent': return (a.totalSpent - b.totalSpent) * dir;
            case 'recent': return (a.lastBooking.getTime() - b.lastBooking.getTime()) * dir;
            default: return (a.bookingCount - b.bookingCount) * dir;
        }
    });
}

/**
 * Gets contact lists for campaign targeting.
 */
export async function getCustomerContacts(tenantId: string) {
    const customers = await getCustomersByTenant(tenantId);
    return {
        customers,
        total: customers.length,
        withPhone: customers.filter(c => c.phone).length,
        withEmail: customers.filter(c => c.email).length,
    };
}
