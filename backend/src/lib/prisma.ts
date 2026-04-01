import { PrismaClient } from '@prisma/client';

// Singleton pattern: reuse a single PrismaClient across the app.
// In development, hot-reloading can create multiple instances — globalThis prevents that.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
