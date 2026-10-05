import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { previewToken } from './lib/preview';

const intlMiddleware = createMiddleware(routing);

const BYPASS_COOKIE = 'ol_preview';
const PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? '';

// Per-request nonce so the only inline scripts that run are Next.js' own.
function makeNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export default async function middleware(req: NextRequest) {
  const nonce = makeNonce();
  const csp = buildCsp(nonce);
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set('x-nonce', nonce);
  reqHeaders.set('Content-Security-Policy', csp);

  const res = await route(req, reqHeaders);
  res.headers.set('Content-Security-Policy', csp);
  return res;
}

async function route(req: NextRequest, reqHeaders: Headers): Promise<NextResponse> {
  const next = () => NextResponse.next({ request: { headers: reqHeaders } });
  const hostname = req.headers.get('host') ?? '';
  const { pathname } = req.nextUrl;

  // Dealers subdomain → rewrite to /dealers/*
  if (hostname.startsWith('dealers.')) {
    if (!pathname.startsWith('/dealers') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      const url = req.nextUrl.clone();
      url.pathname = `/dealers${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url, { request: { headers: reqHeaders } });
    }
    return next();
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
    return next();
  }

  // Pass API and admin panel (incl. the /adminpanel/table, /adminpanel/catalog,
  // /adminpanel/calculator internal tools) through unmodified — own auth, not locale-based
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/adminpanel')
  ) {
    return next();
  }

  // Always allow the under-construction page and the unlock API
  if (pathname === '/under-construction' || pathname.startsWith('/api/unlock')) {
    return next();
  }

  // If PREVIEW_SECRET is set, site is locked — check bypass cookie
  if (PREVIEW_SECRET) {
    const bypass = req.cookies.get(BYPASS_COOKIE)?.value;
    if (bypass !== await previewToken(PREVIEW_SECRET)) {
      return NextResponse.redirect(new URL('/under-construction', req.url));
    }
  }

  return intlMiddleware(new NextRequest(req.url, { headers: reqHeaders }));
}

export const config = {
  // Match everything except Next.js internals and static files
  matcher: ['/((?!_next|_vercel|.*\\..*).*)','/api/admin/:path*'],
};
