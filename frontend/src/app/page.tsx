'use client';

import { useState, useEffect } from 'react';
import LandingPage from '@/components/home/LandingPage';
import TenantBooking from '@/components/booking/TenantBooking';
import { Loader2 } from 'lucide-react';

export default function Home() {
    const [isSubdomain, setIsSubdomain] = useState<boolean | null>(null);

    useEffect(() => {
        // Check hostname to determine if we are on a subdomain
        const hostname = window.location.hostname;
        const parts = hostname.split('.');

        // Examples:
        // localhost -> parts=['localhost'] (length 1) - Main Domain
        // goal.localhost -> parts=['goal', 'localhost'] (length 2) - Subdomain
        // myapp.com -> parts=['myapp', 'com'] (length 2) - Main Domain? No, usually length 2 is main domain for com. 
        // 
        // Logic needs to be robust for localhost vs production.
        // For localhost, 1 part is main. 2+ parts is subdomain.
        // For production (e.g., app.com), 2 parts is main. 3+ parts (goal.app.com) is subdomain.

        let isSub = false;

        if (hostname === 'localhost') {
            isSub = false;
        } else if (hostname.endsWith('.localhost')) {
            // e.g. goal.localhost
            isSub = true;
        } else {
            // Production logic (simplified)
            // Assuming standard top-level domains. 
            // If parts > 2 (e.g. sub.domain.com), it's a subdomain.
            // But if it's 'domain.com' (parts=2), it's main.
            // Exception: 'co.uk' etc. 
            // For now, let's assume we configure this via ENV or just check against specific main domains.

            // Allow list of main domains or reserved subdomains (www, app, api)
            if (parts[0] === 'www' || parts[0] === 'app' || parts[0] === 'api') {
                isSub = false;
            } else if (parts.length > 2) {
                isSub = true;
            } else {
                // e.g. domain.com
                isSub = false;
            }
        }

        setIsSubdomain(isSub);
    }, []);

    if (isSubdomain === null) {
        // Loading state while checking domain
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    // Render appropriate page based on domain
    return isSubdomain ? <TenantBooking /> : <LandingPage />;
}
