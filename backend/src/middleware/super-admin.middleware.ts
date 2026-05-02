import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from './auth.middleware';

const prisma = new PrismaClient();

/**
 * Allows only platform-level super admins (User.isSuperAdmin = true).
 * Must be used AFTER authenticate middleware.
 */
export const requireSuperAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { isSuperAdmin: true },
        });

        if (!user?.isSuperAdmin) {
            return res.status(403).json({ error: 'Super admin access required' });
        }

        next();
    } catch (error) {
        console.error('Super admin check failed:', error);
        return res.status(500).json({ error: 'Authorization check failed' });
    }
};
