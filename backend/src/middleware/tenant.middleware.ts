import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const ensureTenantContext = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.tenantId) {
        return res.status(403).json({ error: 'Tenant context required' });
    }
    next();
};

export const getTenantId = (req: AuthRequest): string => {
    if (!req.user?.tenantId) {
        throw new Error('Tenant ID not found in request context');
    }
    return req.user.tenantId;
};
