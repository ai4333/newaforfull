import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
    const url = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // 1. Identify if we are on an "admin" subdomain
    // This handles: admin.localhost:3000, admin.aforprint.com, etc.
    const isAdminSubdomain = hostname.startsWith('admin.');

    // 2. Prevent direct access to "/admin" from the main domain
    // NOTE: For local development, we allow /admin access on localhost:3000 to simplify testing.
    const isDevelopment = process.env.NODE_ENV === 'development' || hostname.includes('localhost');
    if (!isAdminSubdomain && url.pathname.startsWith('/admin') && !isDevelopment) {
        return NextResponse.rewrite(new URL('/404', req.url));
    }

    // 3. Routing for Admin Subdomain
    if (isAdminSubdomain) {
        // Check if user is authenticated and is an ADMIN
        const userRole = req.auth?.user?.role;

        // If not admin, redirect to login or show 403
        if (userRole !== 'ADMIN') {
            // Allow access to login/api/auth if needed, or just redirect
            if (
                url.pathname.startsWith('/api/auth') ||
                url.pathname.startsWith('/auth/login') ||
                url.pathname.startsWith('/admin/login')
            ) {
                return NextResponse.next();
            }
            // For now, let's redirect non-admins or unauthenticated users
            return NextResponse.rewrite(new URL('/404', req.url));
        }

        // Rewrite internal path: admin.example.com/users -> /admin/users
        // Avoid double-rewriting if the path already starts with /admin
        if (url.pathname.startsWith('/admin')) {
            return NextResponse.rewrite(new URL(url.pathname, req.url));
        }
        return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
    }

    return NextResponse.next();
});

// Configure which paths the middleware runs on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
