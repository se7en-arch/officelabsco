import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDealerSession } from '@/lib/dealer-auth';

export async function GET() {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.status !== 'APPROVED') return NextResponse.json({ error: 'Not approved' }, { status: 403 });

  const orders = await prisma.dealerOrder.findMany({
    where: { dealerId: session.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.status !== 'APPROVED') return NextResponse.json({ error: 'Not approved' }, { status: 403 });

  try {
    const { items, notes } = await req.json();
    if (!items?.length) return NextResponse.json({ error: 'Кошницата е празна.' }, { status: 400 });

    const total = items.reduce((sum: number, i: { unitPrice: number; quantity: number }) => sum + i.unitPrice * i.quantity, 0);

    const order = await prisma.dealerOrder.create({
      data: {
        dealerId: session.id,
        total,
        notes: notes || null,
        items: {
          create: items.map((i: {
            productId?: number;
            productName: string;
            productSlug: string;
            quantity: number;
            unitPrice: number;
            retailPrice: number;
            color?: string;
            image?: string;
          }) => ({
            productId: i.productId ?? null,
            productName: i.productName,
            productSlug: i.productSlug,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            retailPrice: i.retailPrice,
            color: i.color ?? null,
            image: i.image ?? null,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Грешка при поръчката.' }, { status: 500 });
  }
}
