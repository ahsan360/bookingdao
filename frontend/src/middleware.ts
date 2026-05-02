import { NextRequest, NextResponse } from 'next/server';

const ROOT_DOMAINS = ['bookease.com', 'www.bookease.com', 'api.bookease.com', 'localhost'];
const RESERVED_SUBDOMAINS = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'staging', 'dev'];

export function middleware(req: NextRequest) {
    const host = req.headers.get('host')?.toLowerCase().split(':')[0] || '';
    const url = req.nextUrl;

    // Skip Next.js internals, API, and static files
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api') ||
        url.pathname.includes('.') // files like favicon.ico, images
    ) {
        return NextResponse.next();
    }

    // Root domain → show landing page as normal
    if (ROOT_DOMAINS.includes(host)) {
        return NextResponse.next();
    }

    // Extract subdomain from e.g. "salon.bookease.com" or "salon.lvh.me"
    const parts = host.split('.');
    const subdomain = parts.length >= 2 ? parts[0] : null;

    // No subdomain, or reserved subdomain → let through
    if (!subdomain || RESERVED_SUBDOMAINS.includes(subdomain)) {
        return NextResponse.next();
    }

    // Already rewritten (avoid infinite loop)
    if (url.pathname.startsWith('/book/')) {
        return NextResponse.next();
    }

    // Dashboard / login / register → keep on root (not tenant-specific)
    // You may want to redirect dashboard routes to root domain instead
    if (
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register') ||
        url.pathname.startsWith('/onboarding') ||
        url.pathname.startsWith('/forgot-password')
    ) {
        // Redirect to root domain for auth/dashboard
        const rootUrl = req.nextUrl.clone();
        rootUrl.host = 'bookease.com';
        return NextResponse.redirect(rootUrl);
    }

    // Rewrite tenant subdomain → /book/[subdomain]
    url.pathname = `/book/${subdomain}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: [
        // Match all paths except Next.js internals
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
