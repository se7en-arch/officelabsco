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
    const { items, notes, deliveryAddressId } = await req.json();
    if (!items?.length) return NextResponse.json({ error: 'Кошницата е празна.' }, { status: 400 });
    if (items.length > 50) return NextResponse.json({ error: 'Твърде много артикули.' }, { status: 400 });

    // H-03: Look up real prices from DB — never trust client-submitted prices
    const productIds = (items as Array<{ productId?: number }>)
      .map(i => i.productId)
      .filter((id): id is number => typeof id === 'number' && id > 0);

    const dbProducts = productIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: productIds }, archived: false },
          select: { id: true, price: true },
        })
      : [];
    const priceMap = new Map(dbProducts.map(p => [p.id, p.price]));

    const validatedItems = (items as Array<{
      productId?: number;
      productName: string;
      productSlug: string;
      quantity: number;
      color?: string;
      image?: string;
    }>).map(i => {
      const retailPrice = i.productId && priceMap.has(i.productId)
        ? priceMap.get(i.productId)!
        : 0;
      const unitPrice = +(retailPrice * (1 - session.discountPercent / 100)).toFixed(2);
      return {
        productId:   i.productId ?? null,
        productName: String(i.productName ?? '').slice(0, 200),
        productSlug: String(i.productSlug ?? '').slice(0, 200),
        quantity:    Math.min(Math.max(1, Number(i.quantity) || 1), 999),
        unitPrice,
        retailPrice,
        color: i.color ? String(i.color).slice(0, 100) : null,
        image: i.image ? String(i.image).slice(0, 500) : null,
      };
    });

    const total = +validatedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2);

    // Delivery address snapshot
    let delivSnap: {
      deliveryAddressId?: string;
      deliveryLabel?: string;
      deliveryAddress?: string;
      deliveryCity?: string;
      deliveryPostcode?: string | null;
    } = {};

    if (deliveryAddressId) {
      const addr = await prisma.dealerAddress.findUnique({ where: { id: deliveryAddressId } });
      if (addr && addr.dealerId === session.id) {
        delivSnap = {
          deliveryAddressId: addr.id,
          deliveryLabel:     addr.label,
          deliveryAddress:   addr.address,
          deliveryCity:      addr.city,
          deliveryPostcode:  addr.postcode ?? null,
        };
      }
    }

    // Global sequential orderNumber across both Order and DealerOrder tables
    const [orderAgg, dealerAgg] = await Promise.all([
      prisma.order.aggregate({ _max: { orderNumber: true } }),
      prisma.dealerOrder.aggregate({ _max: { orderNumber: true } }),
    ]);
    const orderNumber = Math.max(orderAgg._max.orderNumber ?? 0, dealerAgg._max.orderNumber ?? 0) + 1;

    const order = await prisma.dealerOrder.create({
      data: {
        dealerId:        session.id,
        orderNumber,
        total,
        discountPercent: session.discountPercent,
        notes:           notes ? String(notes).slice(0, 1000) : null,
        ...delivSnap,
        items:           { create: validatedItems },
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: 'Грешка при поръчката.' }, { status: 500 });
  }
}
