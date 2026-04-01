/**
 * Application-wide constants.
 */

export const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'localhost', 'bookdao', 'mail', 'ftp', 'staging', 'dev'] as const;

export const APPOINTMENT_STATUSES = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
} as const;

export const ACTIVE_STATUSES = [APPOINTMENT_STATUSES.CONFIRMED, APPOINTMENT_STATUSES.COMPLETED] as const;
export const BOOKABLE_STATUSES = [APPOINTMENT_STATUSES.CONFIRMED, APPOINTMENT_STATUSES.PENDING] as const;

export const OTP_TYPES = ['phone_verify', 'email_verify', 'password_reset'] as const;

export const CAMPAIGN_CHANNELS = ['sms', 'email', 'both'] as const;

export const LOCK_TTL_SECONDS = 600; // 10 minutes for payment lock

export const OTP_CONFIG = {
    EXPIRY_MINUTES: 5,
    MAX_ATTEMPTS: 3,
    RATE_LIMIT_PER_HOUR: 5,
} as const;

export const BCRYPT_ROUNDS = 10;

export const BOOKING_MODES = {
    PAYMENT_REQUIRED: 'payment_required',
    MANUAL_ONLY: 'manual_only',
    BOTH: 'both',
} as const;

export const VALID_BOOKING_MODES = Object.values(BOOKING_MODES);

// Currency
export const DEFAULT_CURRENCY = 'BDT';

// Rate limits
export const RATE_LIMITS = {
    GENERAL: { windowMs: 1 * 60 * 1000, max: 100 },
    AUTH: { windowMs: 15 * 60 * 1000, max: 10 },
};

// Cleanup
export const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;

// SSLCommerz defaults
export const SSLCOMMERZ_DEFAULTS = {
    customerEmail: 'customer@booking.com',
    address: 'N/A',
    city: 'Dhaka',
    postcode: '1000',
    country: 'Bangladesh',
    shippingMethod: 'NO',
    productCategory: 'Service',
    productProfile: 'general',
};

// User roles
export const ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
} as const;

// Page config defaults
export const PAGE_CONFIG_DEFAULTS = {
    primaryColor: '#4F46E5',
    maxGalleryImages: 6,
    maxFileSizeMB: 5,
};
