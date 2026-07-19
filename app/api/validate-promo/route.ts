import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { code } = await req.json() as { code: string };
  if (!code?.trim()) {
    return NextResponse.json({ error: 'empty' }, { status: 400 });
  }

  const promo = await prisma.promoCode.findFirst({
    where: { code: code.trim().toUpperCase(), active: true },
    select: { discount: true },
  });

  if (!promo) {
    return NextResponse.json({ error: 'invalid' }, { status: 404 });
  }

  return NextResponse.json({ discount: promo.discount });
}
