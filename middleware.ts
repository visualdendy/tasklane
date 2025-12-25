import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-key'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('tasklane-token')?.value;
    const { pathname } = request.nextUrl;

    // Public paths
    const isPublicPath = pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api/auth');

    if (isPublicPath) {
        // If user is already authenticated and trying to access auth pages, redirect to boards
        if (token && (pathname === '/' || pathname.startsWith('/auth'))) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/boards', request.url));
            } catch (error) {
                // Token invalid, let them stay on public path
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!token) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.next();
    } catch (error) {
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        // Instead of just redirecting, we should also clear the invalid cookie to avoid loops
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('tasklane-token');
        return response;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
