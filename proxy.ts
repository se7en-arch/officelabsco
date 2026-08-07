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

  // Always allow the under-construction page and the unlock API
  if (pathname === '/under-construction' || pathname.startsWith('/api/unlock')) {
    return NextResponse.next();
  }

  // If PREVIEW_SECRET is set, site is locked — check bypass cookie
  if (PREVIEW_SECRET) {
    const bypass = req.cookies.get(BYPASS_COOKIE)?.value;
    if (bypass !== PREVIEW_SECRET) {
      return NextResponse.redirect(new URL('/under-construction', req.url));
    }
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|api|adminpanel|table|catalog|.*\\..*).*)'],
};
