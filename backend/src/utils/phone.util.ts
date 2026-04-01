/**
 * Phone number utilities for Bangladesh (BD) market.
 * Format: 01XXXXXXXXX (11 digits, starts with 01[3-9])
 */

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

/**
 * Strips whitespace, dashes, plus signs, and converts +880/880 prefix to 0.
 * Example: "+8801712345678" → "01712345678"
 */
export function normalizePhone(phone: string): string {
    return phone.replace(/[\s\-+]/g, '').replace(/^880/, '0');
}

/**
 * Validates a BD phone number after normalization.
 */
export function isValidBDPhone(phone: string): boolean {
    return BD_PHONE_REGEX.test(normalizePhone(phone));
}

/**
 * Normalizes if valid, returns null otherwise.
 */
export function normalizePhoneOrNull(phone: string | undefined | null): string | null {
    if (!phone) return null;
    const normalized = normalizePhone(phone);
    return isValidBDPhone(normalized) ? normalized : null;
}
