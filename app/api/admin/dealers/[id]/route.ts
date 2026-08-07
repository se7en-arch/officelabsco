import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, discountPercent, notes } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (discountPercent !== undefined) data.discountPercent = Number(discountPercent);
  if (notes !== undefined) data.notes = notes;

  const dealer = await prisma.dealer.update({ where: { id }, data });
  return NextResponse.json(dealer);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: { orders: { include: { items: true }, orderBy: { createdAt: 'desc' } } },
  });

  if (!dealer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(dealer);
}
