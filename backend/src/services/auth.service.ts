/**
 * AuthService — handles token generation, user formatting, and subdomain checks.
 * Extracted from auth.routes.ts for reuse and testability.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { RESERVED_SUBDOMAINS, BCRYPT_ROUNDS, OTP_CONFIG } from '../utils/constants';
import { normalizePhone, isValidBDPhone } from '../utils/phone.util';
import { ConflictError, ValidationError, UnauthorizedError, RateLimitError } from '../utils/errors';

interface TokenPayload {
    id: string;
    tenantId: string | null;
    email: string | null;
    phone: string | null;
    role: string;
}

interface UserForResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    role: string;
    tenantId: string | null;
}

export function generateToken(user: TokenPayload): string {
    return jwt.sign(
        {
            userId: user.id,
            tenantId: user.tenantId || '',
            identifier: user.email || user.phone || '',
            role: user.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
    );
}

export function formatUserResponse(user: UserForResponse) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phone,
        role: user.role,
        hasCompletedOnboarding: !!user.tenantId,
    };
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Validates and normalizes signup/login identifiers.
 */
export function validateIdentifier(email?: string, phone?: string) {
    if (!email && !phone) {
        throw new ValidationError('Email or phone number is required');
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new ValidationError('Invalid email format');
    }

    if (phone) {
        const normalized = normalizePhone(phone);
        if (!isValidBDPhone(normalized)) {
            throw new ValidationError('Invalid phone number. Use format: 01XXXXXXXXX');
        }
        return { email: email || null, phone: normalized };
    }

    return { email: email || null, phone: null };
}

/**
 * Checks if email or phone is already registered.
 */
export async function checkExistingUser(email: string | null, phone: string | null) {
    if (email) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) throw new ConflictError('Email already registered');
    }
    if (phone) {
        const existing = await prisma.user.findUnique({ where: { phone } });
        if (existing) throw new ConflictError('Phone number already registered');
    }
}

export function isSubdomainReserved(subdomain: string): boolean {
    return (RESERVED_SUBDOMAINS as readonly string[]).includes(subdomain);
}

export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
    if (isSubdomainReserved(subdomain)) return false;
    const existing = await prisma.tenant.findUnique({ where: { subdomain } });
    return !existing;
}

/**
 * Resolves firstName/lastName from new or legacy name fields.
 */
export function resolveNames(fields: { firstName?: string; lastName?: string; name?: string }) {
    const firstName = fields.firstName || (fields.name ? fields.name.split(' ')[0] : '');
    const lastName = fields.lastName || (fields.name ? fields.name.split(' ').slice(1).join(' ') : '');
    if (!firstName) throw new ValidationError('Name is required');
    return { firstName, lastName };
}

/**
 * Generates a 6-digit OTP and stores it.
 */
export async function createOtp(identifier: string, type: string): Promise<string> {
    // Rate limit check
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.otpVerification.count({
        where: { identifier, createdAt: { gte: oneHourAgo } },
    });

    if (recentCount >= OTP_CONFIG.RATE_LIMIT_PER_HOUR) {
        throw new RateLimitError('Too many OTP requests. Try again later.');
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await prisma.otpVerification.create({
        data: {
            identifier,
            code,
            type,
            expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000),
        },
    });

    // TODO: Send OTP via SMS (SSLWireless) or Email
    console.log(`[OTP] ${identifier}: ${code} (type: ${type})`);

    return code;
}

/**
 * Verifies an OTP code. Returns true if valid.
 */
export async function verifyOtp(identifier: string, code: string, type: string): Promise<boolean> {
    const otp = await prisma.otpVerification.findFirst({
        where: {
            identifier,
            type,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
        throw new ValidationError('OTP expired or not found. Request a new one.');
    }

    if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await prisma.otpVerification.update({
            where: { id: otp.id },
            data: { used: true },
        });
        throw new ValidationError('Too many attempts. Request a new OTP.');
    }

    if (otp.code !== code) {
        await prisma.otpVerification.update({
            where: { id: otp.id },
            data: { attempts: otp.attempts + 1 },
        });
        throw new UnauthorizedError('Invalid OTP code');
    }

    await prisma.otpVerification.update({
        where: { id: otp.id },
        data: { used: true },
    });

    return true;
}

/**
 * Assigns starter plan to a tenant.
 */
export async function assignStarterPlan(tx: any, tenantId: string) {
    try {
        const starterPlan = await tx.plan.findFirst({ where: { name: 'starter' } });
        if (starterPlan) {
            await tx.tenant.update({
                where: { id: tenantId },
                data: { planId: starterPlan.id },
            });
        }
    } catch {
        // Plans table may not exist yet
    }
}

/**
 * Gets plan limits for a tenant.
 */
export async function getTenantPlanLimits(tenantId: string): Promise<{ maxAdmins: number }> {
    let maxAdmins = 2;
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { planId: true },
        });

        if (tenant?.planId) {
            const plan = await prisma.plan.findUnique({
                where: { id: tenant.planId },
                select: { maxAdmins: true },
            });
            if (plan) maxAdmins = plan.maxAdmins;
        } else {
            // Auto-assign starter plan
            const starterPlan = await prisma.plan.findFirst({ where: { name: 'starter' } });
            if (starterPlan) {
                await prisma.tenant.update({
                    where: { id: tenantId },
                    data: { planId: starterPlan.id },
                });
                maxAdmins = starterPlan.maxAdmins;
            }
        }
    } catch {
        // Plans table may not exist yet
    }
    return { maxAdmins };
}
