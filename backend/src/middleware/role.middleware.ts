import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

/**
 * Middleware: Only allows users with "owner" role to proceed.
 * Must be used AFTER authenticate middleware.
 */
export const requireOwner = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'owner') {
        return res.status(403).json({ error: 'Only the business owner can perform this action' });
    }

    next();
};

/**
 * Middleware: Allows both "owner" and "admin" roles (any authenticated user).
 * This is essentially the same as authenticate, but explicit about intent.
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== 'owner' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }

    next();
};
