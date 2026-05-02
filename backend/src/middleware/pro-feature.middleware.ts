import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { tenantHasFeature, ProFeature } from '../services/entitlements.service';

/**
 * Gates a route behind a Pro feature. Returns 402 Payment Required if the
 * tenant is on Free and the requested feature is not included.
 *
 * Must be used AFTER authenticate middleware.
 */
export const requireProFeature = (feature: ProFeature) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user?.tenantId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        try {
            const allowed = await tenantHasFeature(req.user.tenantId, feature);
            if (!allowed) {
                return res.status(402).json({
                    error: 'This feature requires a Pro plan',
                    feature,
                    upgradeUrl: '/pricing',
                });
            }
            next();
        } catch (error) {
            console.error('Pro feature check failed:', error);
            return res.status(500).json({ error: 'Entitlement check failed' });
        }
    };
};
