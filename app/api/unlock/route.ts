import { NextRequest, NextResponse } from 'next/server';
import { previewToken } from '@/lib/preview';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

const BYPASS_COOKIE = 'ol_preview';
const PREVIEW_SECRET = process.env.PREVIEW_SECRET ?? '';

// 10 attempts per 15 minutes per IP — the lock password is short and must not be brute-forced.
const isRateLimited = createRateLimiter(10, 15 * 60_000, 'unlock');

export async function POST(req: NextRequest) {
  if (!PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Not in preview mode' }, { status: 400 });
  }
  if (await isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след 15 минути.' }, { status: 429 });
  }

  const { password } = await req.json() as { password?: string };
  if (!password || password !== PREVIEW_SECRET) {
    return NextResponse.json({ error: 'Грешна парола' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(BYPASS_COOKIE, await previewToken(PREVIEW_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return res;
}
