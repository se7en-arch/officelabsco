import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const review = await prisma.review.update({
    where: { id: parseInt(id) },
    data: {
      ...(body.verified !== undefined ? { verified: body.verified } : {}),
      ...(body.rating !== undefined ? { rating: body.rating } : {}),
      ...(body.text !== undefined ? { text: body.text } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
    },
  });
  return NextResponse.json(review);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await prisma.review.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ ok: true });
}
