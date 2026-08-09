import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// M-02: 20 attempts per 10 minutes per IP
const isRateLimited = createRateLimiter(20, 10 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const { code } = await req.json() as { code: string };
  if (!code?.trim()) {
    return NextResponse.json({ error: 'empty' }, { status: 400 });
  }

  const promo = await prisma.promoCode.findFirst({
    where: { code: code.trim().toUpperCase().slice(0, 50), active: true },
    select: { discount: true },
  });

  if (!promo) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 });
  }

  return NextResponse.json({ discount: promo.discount });
}
