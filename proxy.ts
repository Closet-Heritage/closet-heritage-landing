import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken, CONTROL_COOKIE_NAME } from './lib/control-auth';

/**
 * Gate every /control route behind a valid signed session cookie.
 * Login page + login POST are the only exceptions.
 *
 * Renamed from `middleware.ts` to `proxy.ts` in R-Ctrl10 — Next.js 16
 * deprecated the middleware convention. The matcher stays the same.
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only care about /control
    if (!pathname.startsWith('/control')) return NextResponse.next();

    // Login page is public. Server actions POST back to the same page URL
    // (Next.js dispatches them via the same route), so no separate exempt
    // path is needed.
    if (pathname === '/control/login') {
        return NextResponse.next();
    }

    const token = request.cookies.get(CONTROL_COOKIE_NAME)?.value;
    const session = await verifyToken(token);
    if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = '/control/login';
        url.searchParams.set('next', pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/control/:path*'],
};
