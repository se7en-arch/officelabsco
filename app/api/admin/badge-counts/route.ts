import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [newCustomerOrders, newDealerOrders, pendingDealers] = await Promise.all([
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.dealerOrder.count({ where: { status: 'new' } }),
    prisma.dealer.count({ where: { status: 'PENDING' } }),
  ]);

  return NextResponse.json({
    newOrders:      newCustomerOrders + newDealerOrders,
    pendingDealers,
  }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
