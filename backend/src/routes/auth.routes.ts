import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { normalizePhone } from '../utils/phone.util';
import { RESERVED_SUBDOMAINS } from '../utils/constants';
import {
    generateToken, formatUserResponse, hashPassword, verifyPassword,
    validateIdentifier, checkExistingUser, isSubdomainAvailable,
    resolveNames, createOtp, verifyOtp, assignStarterPlan,
} from '../services/auth.service';

const router = Router();

// ─── SIGNUP ──────────────────────────────────────────────────────────
router.post(
    '/signup',
    [
        body('firstName').trim().notEmpty().withMessage('First name is required'),
        body('lastName').trim().notEmpty().withMessage('Last name is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { firstName, lastName, password } = req.body;
            const { email, phone } = validateIdentifier(req.body.email, req.body.phone);
            await checkExistingUser(email, phone);

            const user = await prisma.user.create({
                data: {
                    firstName, lastName,
                    email, phone,
                    password: await hashPassword(password),
                    role: 'owner',
                },
            });

            res.status(201).json({
                token: generateToken(user),
                user: formatUserResponse(user),
            });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Signup error:', error);
            res.status(500).json({ error: 'Signup failed' });
        }
    }
);

// ─── LEGACY REGISTER (backward compat) ──────────────────────────────
router.post(
    '/register',
    [
        body('businessName').trim().notEmpty().withMessage('Business name is required'),
        body('subdomain')
            .trim().notEmpty().isLength({ min: 3, max: 20 })
            .matches(/^[a-z0-9-]+$/).withMessage('Subdomain must be lowercase letters, numbers, and hyphens')
            .custom(value => !(RESERVED_SUBDOMAINS as readonly string[]).includes(value)).withMessage('This subdomain is reserved'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { businessName, subdomain, password } = req.body;
            const { email, phone } = validateIdentifier(req.body.email, req.body.phone);
            const { firstName, lastName } = resolveNames(req.body);

            await checkExistingUser(email, phone);
            if (!await isSubdomainAvailable(subdomain)) {
                return res.status(400).json({ error: 'Subdomain already taken' });
            }

            const hashedPw = await hashPassword(password);

            const result = await prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: { businessName, subdomain, email },
                });
                await assignStarterPlan(tx, tenant.id);

                const user = await tx.user.create({
                    data: { tenantId: tenant.id, email, phone, password: hashedPw, firstName, lastName, role: 'owner' },
                });

                return { tenant, user };
            });

            res.status(201).json({
                token: generateToken(result.user),
                user: formatUserResponse(result.user),
                tenant: { id: result.tenant.id, businessName: result.tenant.businessName, subdomain: result.tenant.subdomain },
            });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }
);

// ─── ONBOARDING ─────────────────────────────────────────────────────
router.post(
    '/onboarding',
    authenticate,
    [
        body('businessName').trim().notEmpty().withMessage('Business name is required'),
        body('subdomain')
            .trim().notEmpty().isLength({ min: 3, max: 20 })
            .matches(/^[a-z0-9-]+$/).withMessage('Subdomain must be lowercase letters, numbers, and hyphens')
            .custom(value => !(RESERVED_SUBDOMAINS as readonly string[]).includes(value)).withMessage('This subdomain is reserved'),
    ],
    async (req: AuthRequest, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const userId = req.user!.userId;
            const { businessName, subdomain } = req.body;

            const existingUser = await prisma.user.findUnique({ where: { id: userId } });
            if (existingUser?.tenantId) {
                return res.status(400).json({ error: 'You already have a business set up' });
            }

            if (!await isSubdomainAvailable(subdomain)) {
                return res.status(400).json({ error: 'Subdomain already taken' });
            }

            const result = await prisma.$transaction(async (tx) => {
                const tenant = await tx.tenant.create({
                    data: { businessName, subdomain, email: existingUser?.email || null },
                });
                await assignStarterPlan(tx, tenant.id);

                const user = await tx.user.update({
                    where: { id: userId },
                    data: { tenantId: tenant.id },
                });

                return { tenant, user };
            });

            res.status(201).json({
                token: generateToken(result.user),
                user: formatUserResponse(result.user),
                tenant: { id: result.tenant.id, businessName: result.tenant.businessName, subdomain: result.tenant.subdomain },
            });
        } catch (error) {
            console.error('Onboarding error:', error);
            res.status(500).json({ error: 'Onboarding failed' });
        }
    }
);

// ─── LOGIN ──────────────────────────────────────────────────────────
router.post(
    '/login',
    [body('password').notEmpty().withMessage('Password is required')],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { email, phone, identifier, password } = req.body;
            const loginId = email || phone || identifier;
            if (!loginId) return res.status(400).json({ error: 'Email or phone number is required' });

            const isEmail = loginId.includes('@');
            let user;

            if (isEmail) {
                user = await prisma.user.findUnique({ where: { email: loginId }, include: { tenant: true } });
            } else {
                user = await prisma.user.findUnique({ where: { phone: normalizePhone(loginId) }, include: { tenant: true } });
            }

            if (!user) return res.status(401).json({ error: 'Invalid credentials' });
            if (!user.isActive) return res.status(403).json({ error: 'Your account has been deactivated. Contact the business owner.' });
            if (!await verifyPassword(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });

            const response: any = { token: generateToken(user), user: formatUserResponse(user) };
            if (user.tenant) {
                response.tenant = { id: user.tenant.id, businessName: user.tenant.businessName, subdomain: user.tenant.subdomain };
            }

            res.json(response);
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }
);

// ─── SEND OTP ───────────────────────────────────────────────────────
router.post(
    '/send-otp',
    [
        body('identifier').trim().notEmpty().withMessage('Phone number or email is required'),
        body('type').isIn(['phone_verify', 'email_verify', 'password_reset']).withMessage('Invalid OTP type'),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { identifier, type } = req.body;

            if (type === 'password_reset') {
                const isEmail = identifier.includes('@');
                const user = isEmail
                    ? await prisma.user.findUnique({ where: { email: identifier } })
                    : await prisma.user.findUnique({ where: { phone: normalizePhone(identifier) } });

                if (!user) return res.json({ message: 'If an account exists, OTP has been sent' });
            }

            await createOtp(identifier, type);
            res.json({ message: 'OTP sent successfully' });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Send OTP error:', error);
            res.status(500).json({ error: 'Failed to send OTP' });
        }
    }
);

// ─── VERIFY OTP ─────────────────────────────────────────────────────
router.post(
    '/verify-otp',
    [
        body('identifier').trim().notEmpty().withMessage('Phone number or email is required'),
        body('code').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
        body('type').isIn(['phone_verify', 'email_verify', 'password_reset']).withMessage('Invalid OTP type'),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { identifier, code, type } = req.body;
            await verifyOtp(identifier, code, type);

            // Mark user as verified for phone/email verification
            if (type === 'phone_verify' || type === 'email_verify') {
                const isEmail = identifier.includes('@');
                const updateField = isEmail ? 'emailVerified' : 'phoneVerified';
                const whereField = isEmail ? { email: identifier } : { phone: identifier };
                await prisma.user.updateMany({ where: whereField, data: { [updateField]: true } });
            }

            // For password reset, return a short-lived reset token
            if (type === 'password_reset') {
                const resetToken = jwt.sign(
                    { identifier, purpose: 'password_reset' },
                    process.env.JWT_SECRET!,
                    { expiresIn: '15m' }
                );
                return res.json({ verified: true, resetToken });
            }

            res.json({ verified: true });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Verify OTP error:', error);
            res.status(500).json({ error: 'Verification failed' });
        }
    }
);

// ─── FORGOT PASSWORD ────────────────────────────────────────────────
router.post(
    '/forgot-password',
    [body('identifier').trim().notEmpty().withMessage('Phone number or email is required')],
    async (req: Request, res: Response) => {
        try {
            const { identifier } = req.body;
            const isEmail = identifier.includes('@');
            const normalizedId = isEmail ? identifier : normalizePhone(identifier);

            const user = isEmail
                ? await prisma.user.findUnique({ where: { email: identifier } })
                : await prisma.user.findUnique({ where: { phone: normalizedId } });

            if (!user) return res.json({ message: 'If an account exists, a reset code has been sent' });

            await createOtp(normalizedId, 'password_reset');
            res.json({ message: 'If an account exists, a reset code has been sent' });
        } catch (error: any) {
            if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
            console.error('Forgot password error:', error);
            res.status(500).json({ error: 'Failed to process request' });
        }
    }
);

// ─── RESET PASSWORD ─────────────────────────────────────────────────
router.post(
    '/reset-password',
    [
        body('resetToken').notEmpty().withMessage('Reset token is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req: Request, res: Response) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

            const { resetToken, newPassword } = req.body;

            let decoded: any;
            try {
                decoded = jwt.verify(resetToken, process.env.JWT_SECRET!);
            } catch {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }

            if (decoded.purpose !== 'password_reset') return res.status(400).json({ error: 'Invalid token' });

            const { identifier } = decoded;
            const isEmail = identifier.includes('@');
            const user = isEmail
                ? await prisma.user.findUnique({ where: { email: identifier } })
                : await prisma.user.findUnique({ where: { phone: identifier } });

            if (!user) return res.status(404).json({ error: 'User not found' });

            await prisma.user.update({
                where: { id: user.id },
                data: { password: await hashPassword(newPassword) },
            });

            res.json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ error: 'Failed to reset password' });
        }
    }
);

// ─── CHECK SUBDOMAIN ────────────────────────────────────────────────
router.get('/check-subdomain/:subdomain', async (req: Request, res: Response) => {
    try {
        const available = await isSubdomainAvailable(req.params.subdomain);
        res.json({ available });
    } catch (error) {
        res.status(500).json({ error: 'Check failed' });
    }
});

// ─── GET CURRENT USER ───────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: {
                id: true, firstName: true, lastName: true, email: true, phone: true,
                role: true, tenantId: true,
                tenant: { select: { id: true, businessName: true, subdomain: true } },
            },
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            ...user,
            name: `${user.firstName} ${user.lastName}`.trim(),
            hasCompletedOnboarding: !!user.tenantId,
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
