import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-key'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('tasklane-token')?.value;
    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Request: ${pathname} | Token: ${token ? 'Present' : 'Missing'}`);

    if (!process.env.JWT_SECRET) {
        console.error('[Middleware] CRITICAL: JWT_SECRET is not defined in environment variables!');
    }

    // Public paths
    const isPublicPath = pathname === '/' ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api/auth');

    if (isPublicPath) {
        if (token && (pathname === '/' || pathname.startsWith('/auth'))) {
            try {
                await jwtVerify(token, JWT_SECRET);
                console.log('[Middleware] Valid token on public path, redirecting to /boards');
                return NextResponse.redirect(new URL('/boards', request.url));
            } catch (error: any) {
                console.log(`[Middleware] Public path token verification failed: ${error.message}`);
                return NextResponse.next();
            }
        }
        return NextResponse.next();
    }

    // Protected paths
    if (!token) {
        console.log(`[Middleware] No token for protected path ${pathname}, redirecting to login`);
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
        await jwtVerify(token, JWT_SECRET);
        console.log(`[Middleware] Token verified for ${pathname}`);
        return NextResponse.next();
    } catch (error: any) {
        console.error(`[Middleware] VERIFICATION FAILED for ${pathname}: ${error.message}`);
        if (pathname.startsWith('/api')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
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
