import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(promos);
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, discount } = await req.json() as { code: string; discount: number };
  if (!code?.trim() || !discount || discount < 1 || discount > 100) {
    return NextResponse.json({ error: 'Невалидни данни' }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.create({
      data: { code: code.trim().toUpperCase(), discount: Math.round(discount) },
    });
    return NextResponse.json(promo);
  } catch {
    return NextResponse.json({ error: 'Кодът вече съществува' }, { status: 409 });
  }
}
