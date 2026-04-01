// Shared types used across the application

export interface Appointment {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    status: string;
    price: number;
    notes?: string;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface Stats {
    appointments: {
        total: number;
        confirmed: number;
        pending: number;
        cancelled: number;
        completed: number;
        today: number;
    };
    revenue: {
        daily: number;
        monthly: number;
        yearly: number;
    };
}

export interface Customer {
    name: string;
    phone: string;
    email: string | null;
    bookingCount: number;
    completedCount: number;
    totalSpent: number;
    lastBooking: string;
}

export interface Campaign {
    id: string;
    title: string;
    message: string;
    channel: string;
    status: string;
    sentCount: number;
    failCount: number;
    sentAt: string | null;
    createdAt: string;
}

export interface TeamMember {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string | null;
    phone: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
}

export interface AuditEntry {
    id: string;
    userId: string;
    userEmail: string;
    userRole: string;
    action: string;
    resourceType: string;
    resourceId: string;
    details: any;
    createdAt: string;
}

export interface PageConfig {
    id?: string;
    headline?: string;
    description?: string;
    aboutText?: string;
    logoUrl?: string;
    bannerUrl?: string;
    galleryUrls?: string[];
    primaryColor?: string;
    phone?: string;
    address?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialWhatsapp?: string;
}

export interface SaleAppointment {
    id: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    customerName: string;
    customerPhone: string;
    price: number;
}

export interface Period {
    key: string;
    label: string;
    count: number;
    total: number;
    appointments: SaleAppointment[];
}

export interface SalesReport {
    from: string;
    to: string;
    group: string;
    grandTotal: number;
    grandCount: number;
    periods: Period[];
}
