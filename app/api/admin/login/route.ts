import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, getAdminToken } from '@/lib/admin-auth';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// H-01: 5 attempts per 15 minutes per IP
const isRateLimited = createRateLimiter(5, 15 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след 15 минути.' }, { status: 429 });
  }

  const { username, password } = await req.json() as { username: string; password: string };

  if (!(await verifyCredentials(username, password))) {
    return NextResponse.json({ error: 'Грешно потребителско име или парола' }, { status: 401 });
  }

  const token = await getAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return res;
}
