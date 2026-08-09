import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAndUpgrade, setDealerCookie, clearDealerCookie } from '@/lib/dealer-auth';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// H-02: 5 attempts per 15 minutes per IP
const isRateLimited = createRateLimiter(5, 15 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след 15 минути.' }, { status: 429 });
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Имейл и парола са задължителни.' }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { email: email.toLowerCase() } });

    // H-04: verifyAndUpgrade auto-migrates legacy SHA-256 → bcrypt on successful login
    const passwordOk = dealer ? await verifyAndUpgrade(password, dealer) : false;

    if (!dealer || !passwordOk) {
      return NextResponse.json({ error: 'Грешен имейл или парола.' }, { status: 401 });
    }

    await setDealerCookie(dealer.id, dealer.passwordHash);
    return NextResponse.json({ ok: true, status: dealer.status });
  } catch {
    return NextResponse.json({ error: 'Грешка при вход.' }, { status: 500 });
  }
}

export async function DELETE() {
  await clearDealerCookie();
  return NextResponse.json({ ok: true });
}
