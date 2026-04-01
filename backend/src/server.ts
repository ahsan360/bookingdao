import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import appointmentRoutes from './routes/appointment.routes';
import paymentRoutes from './routes/payment.routes';
import paymentConfigRoutes from './routes/admin/payment-config.routes';
import pageConfigRoutes from './routes/admin/page-config.routes';
import teamRoutes from './routes/admin/team.routes';
import auditLogRoutes from './routes/admin/audit-log.routes';
import campaignRoutes from './routes/admin/campaign.routes';
import customerRoutes from './routes/admin/customer.routes';
import settingsRoutes from './routes/admin/settings.routes';
import { extractSubdomain } from './middleware/subdomain';
import { errorHandler } from './middleware/error.middleware';



dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(generalLimiter);

// Special handling for payment webhooks (raw body needed)
app.use('/api/payments/ipn', express.raw({ type: 'application/json' }));
app.use('/api/payments/success', express.urlencoded({ extended: true }));
app.use('/api/payments/fail', express.urlencoded({ extended: true }));
app.use('/api/payments/cancel', express.urlencoded({ extended: true }));

// Regular JSON parsing for other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Subdomain extraction middleware (must be before routes)
app.use(extractSubdomain);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/payment-config', paymentConfigRoutes);
app.use('/api/admin/page-config', pageConfigRoutes);
app.use('/api/admin/team', teamRoutes);
app.use('/api/admin/audit-log', auditLogRoutes);
app.use('/api/admin/campaigns', campaignRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Centralized error handler (must be after all routes)
app.use(errorHandler);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Appointment expiry cleanup - runs every 2 minutes
import { prisma } from './lib/prisma';
const CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutes

async function cleanupExpiredAppointments() {
    try {
        // Find expired pending appointments
        const expired = await prisma.appointment.findMany({
            where: {
                status: 'pending',
                lockedUntil: { lt: new Date() },
            },
            select: { id: true },
        });

        if (expired.length > 0) {
            const ids = expired.map(a => a.id);
            // Soft cancel: mark expired appointments and their payments
            await prisma.$transaction(async (tx) => {
                await tx.payment.updateMany({
                    where: { appointmentId: { in: ids } },
                    data: { status: 'expired' },
                });
                await tx.appointment.updateMany({
                    where: { id: { in: ids } },
                    data: {
                        status: 'expired',
                        cancelReason: 'Payment timeout - automatically expired',
                        cancelledAt: new Date(),
                    },
                });
            });
            console.log(`Expired ${expired.length} pending appointment(s)`);
        }
    } catch (error) {
        console.error('Appointment cleanup error:', error);
    }
}

// Run immediately on startup, then every 2 minutes
cleanupExpiredAppointments();
const cleanupTimer = setInterval(cleanupExpiredAppointments, CLEANUP_INTERVAL);

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    clearInterval(cleanupTimer);
    await prisma.$disconnect();
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

export default app;
