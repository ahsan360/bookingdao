/**
 * Centralized error handling middleware.
 * Catches AppError instances and formats consistent JSON responses.
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
    // Structured AppError — return its status and message
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            ...(err.code && { code: err.code }),
        });
    }

    // Prisma known request error (e.g. unique constraint)
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaErr = err as any;
        if (prismaErr.code === 'P2002') {
            const field = prismaErr.meta?.target?.[0] || 'field';
            return res.status(409).json({
                error: `A record with this ${field} already exists`,
                code: 'DUPLICATE',
            });
        }
        if (prismaErr.code === 'P2025') {
            return res.status(404).json({
                error: 'Record not found',
                code: 'NOT_FOUND',
            });
        }
    }

    // Unhandled error — log and return 500
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
}
