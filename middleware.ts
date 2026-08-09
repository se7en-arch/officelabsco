import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const BYPASS_COOKIE = 'ol_preview';
const PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? '';

export default function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? '';
  const { pathname } = req.nextUrl;

  // Dealers subdomain → rewrite to /dealers/*
  if (hostname.startsWith('dealers.')) {
    if (!pathname.startsWith('/dealers') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone();
      url.pathname = `/dealers${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // M-07: CSRF check for admin API mutations (all except /api/admin/login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const method = req.method;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = req.headers.get('origin');
      const host = req.headers.get('host') ?? '';
      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
              status: 403,
              headers: { 'content-type': 'application/json' },
            });
          }
        } catch {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'content-type': 'application/json' },
          });
        }
      }
    }
    return NextResponse.next();
  }

  // Pass all other API and admin panel routes through unmodified
  if (pathname.startsWith('/api') || pathname.startsWith('/adminpanel')) {
    return NextResponse.next();
  }

  // Always allow the under-construction page and the unlock API
  if (pathname === '/under-construction' || pathname.startsWith('/api/unlock')) {
    return NextResponse.next();
  }

  // If PREVIEW_SECRET is set, site is locked — check bypass cookie
  // M-06: catalog and table are now included (not excluded from matcher)
  if (PREVIEW_SECRET) {
    const bypass = req.cookies.get(BYPASS_COOKIE)?.value;
    if (bypass !== PREVIEW_SECRET) {
      return NextResponse.redirect(new URL('/under-construction', req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Match everything except Next.js internals and static files
  // M-06: removed table|catalog from exclusion so preview lock covers them
  matcher: ['/((?!_next|_vercel|.*\\..*).*)','/api/admin/:path*'],
};
