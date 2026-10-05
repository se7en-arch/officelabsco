import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDealerSession } from '@/lib/dealer-auth';
import { generateOrderCode } from '@/lib/order-code';

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

    // H-03: Look up real prices from DB — never trust client-submitted prices.
    // Every line must be an active product with an integer quantity 1–999.
    for (const i of items as Array<{ productId?: unknown; quantity?: unknown }>) {
      if (!Number.isInteger(i.productId) || (i.productId as number) <= 0 ||
          !Number.isInteger(i.quantity) || (i.quantity as number) < 1 || (i.quantity as number) > 999) {
        return NextResponse.json({ error: 'Невалидни артикули в поръчката.' }, { status: 400 });
      }
    }
    const productIds = [...new Set((items as Array<{ productId: number }>).map(i => i.productId))];
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, archived: false },
      select: { id: true, price: true },
    });
    const priceMap = new Map(dbProducts.map(p => [p.id, p.price]));
    if (priceMap.size !== productIds.length) {
      return NextResponse.json({ error: 'Някой от артикулите вече не е наличен.' }, { status: 400 });
    }

    const validatedItems = (items as Array<{
      productId: number;
      productName: string;
      productSlug: string;
      quantity: number;
      color?: string;
      image?: string;
    }>).map(i => {
      const retailPrice = priceMap.get(i.productId)!;
      const unitPrice = +(retailPrice * (1 - session.discountPercent / 100)).toFixed(2);
      return {
        productId:   i.productId,
        productName: String(i.productName ?? '').slice(0, 200),
        productSlug: String(i.productSlug ?? '').slice(0, 200),
        quantity:    i.quantity,
        unitPrice,
        retailPrice,
        color: i.color ? String(i.color).slice(0, 100) : null,
        image: i.image ? String(i.image).slice(0, 500) : null,
      };
    });

    const total = +validatedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0).toFixed(2);
    if (!(total > 0)) {
      return NextResponse.json({ error: 'Невалидна сума на поръчката.' }, { status: 400 });
    }

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

    // Global sequential orderNumber + date-based orderCode
    const [orderAgg, dealerAgg, orderCode] = await Promise.all([
      prisma.order.aggregate({ _max: { orderNumber: true } }),
      prisma.dealerOrder.aggregate({ _max: { orderNumber: true } }),
      generateOrderCode(),
    ]);
    const orderNumber = Math.max(orderAgg._max.orderNumber ?? 0, dealerAgg._max.orderNumber ?? 0) + 1;

    const order = await prisma.dealerOrder.create({
      data: {
        dealerId:        session.id,
        orderNumber,
        orderCode,
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
