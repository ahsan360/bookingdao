import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

// Extend Express Request type to include tenant data
declare global {
    namespace Express {
        interface Request {
            tenantId?: string;
            tenant?: any;
        }
    }
}

export const extractSubdomain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let host = req.headers.host || '';

        // If host is localhost (API calls from frontend), check Origin or Referer
        if (host.startsWith('localhost')) {
            const origin = req.headers.origin || req.headers.referer || '';
            if (origin) {
                try {
                    // Extract host from origin URL
                    const url = new URL(origin);
                    host = url.host;
                } catch (e) {
                    // Invalid URL, keep original host
                }
            }
        }

        // Extract subdomain from host
        // Examples:
        // - goal.localhost:3000 -> goal
        // - goal.myapp.com -> goal
        // - localhost:3000 -> null (no subdomain)

        const parts = host.split(':')[0].split('.'); // Remove port first, then split by dot

        console.log('🔍 Subdomain Debug:', {
            originalHost: req.headers.host,
            origin: req.headers.origin,
            extractedHost: host,
            parts
        });

        // Check if we have a subdomain (more than 1 part for localhost, more than 2 for domain)
        if (parts.length >= 2 && parts[0] !== 'www' && parts[0] !== 'api') {
            const subdomain = parts[0];

            // Skip if it's just 'localhost' or an IP address
            if (subdomain !== 'localhost' && !subdomain.match(/^\d+$/)) {
                console.log('🔎 Looking up subdomain:', subdomain);

                // Look up tenant by subdomain
                const tenant = await prisma.tenant.findUnique({
                    where: { subdomain },
                    select: {
                        id: true,
                        businessName: true,
                        subdomain: true,
                        email: true,
                    },
                });

                if (tenant) {
                    console.log('✅ Tenant found:', tenant.businessName);
                    req.tenantId = tenant.id;
                    req.tenant = tenant;
                } else {
                    console.log('❌ No tenant found for subdomain:', subdomain);
                }
            }
        }

        next();
    } catch (error) {
        console.error('Subdomain extraction error:', error);
        next(); // Continue even if subdomain extraction fails
    }
};
