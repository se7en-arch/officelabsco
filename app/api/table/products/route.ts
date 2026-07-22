import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const products = await prisma.product.findMany({
    include: { series: true, category: true },
    orderBy: { id: 'asc' },
  });
  return NextResponse.json(products);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    id: number;
    name?: string;
    sku?: string;
    price?: number;
    costPrice?: number | null;
    description?: string;
    stock?: number;
    has3dModel?: boolean;
    hasDrawing?: boolean;
    hasVisualization?: boolean;
  };

  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const updated = await prisma.product.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true, product: updated });
}
