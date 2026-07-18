import { NextRequest, NextResponse } from 'next/server';

const BYPASS_COOKIE = 'ol_preview';
const PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? '';

export async function POST(req: NextRequest) {
  if (!PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Not in preview mode' }, { status: 400 });
  }

  const { password } = await req.json() as { password?: string };

  if (!password || password !== PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Грешна парола' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(BYPASS_COOKIE, PREVIEW_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
