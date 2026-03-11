import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth((req) => {
    const { pathname, search } = req.nextUrl;

    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    const isAuthenticated = Boolean(req.auth?.user?.id);
    const isAdmin = req.auth?.user?.role === 'ADMIN';

    if (!isAuthenticated) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*'],
};
