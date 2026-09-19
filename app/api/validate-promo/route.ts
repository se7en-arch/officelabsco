import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';
import { BUNDLE_PROMO_CODE, cartQualifiesForBundle } from '@/lib/bundle-check';

// M-02: 20 attempts per 10 minutes per IP
const isRateLimited = createRateLimiter(20, 10 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const body = await req.json() as { code: string; items?: unknown };
  const { code } = body;
  if (!code?.trim()) {
    return NextResponse.json({ error: 'empty' }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase().slice(0, 50);

  const promo = await prisma.promoCode.findFirst({
    where: { code: normalizedCode, active: true },
    select: { code: true, discount: true },
  });

  if (!promo) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 });
  }

  // BUNDLE10 (the shop popup's code) only applies when the cart actually
  // contains a complete series bundle — never for an arbitrary/partial cart
  // just because the code string was typed in manually.
  if (promo.code === BUNDLE_PROMO_CODE) {
    const itemIds = Array.isArray(body.items)
      ? body.items.filter((id): id is number => typeof id === 'number')
      : [];
    if (!(await cartQualifiesForBundle(itemIds))) {
      return NextResponse.json({ error: 'invalid' }, { status: 404 });
    }
  }

  return NextResponse.json({ discount: promo.discount });
}
