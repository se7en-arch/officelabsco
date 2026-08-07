import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? '';
  const isDealers = hostname.startsWith('dealers.');

  if (isDealers) {
    const url = req.nextUrl.clone();
    const { pathname } = url;
    if (!pathname.startsWith('/dealers') && !pathname.startsWith('/_next') && !pathname.startsWith('/api')) {
      url.pathname = `/dealers${pathname === '/' ? '' : pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp).*)'],
};
