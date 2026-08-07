import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setDealerCookie, clearDealerCookie } from '@/lib/dealer-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Имейл и парола са задължителни.' }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { email: email.toLowerCase() } });
    if (!dealer) {
      return NextResponse.json({ error: 'Грешен имейл или парола.' }, { status: 401 });
    }

    const hash = await hashPassword(password);
    if (hash !== dealer.passwordHash) {
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
