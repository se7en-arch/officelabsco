import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  const header = ['ID', 'Статус', 'Дата', 'Клиент', 'Email', 'Телефон', 'Фирма', 'Доставчик', 'Град', 'Адрес', 'Плащане', 'Общо (€)', 'Продукти'];
  const rows = orders.map(o => [
    o.id,
    o.status,
    new Date(o.createdAt).toLocaleString('bg-BG'),
    `${o.firstName} ${o.lastName}`,
    o.email,
    o.phone,
    o.company ?? '',
    o.carrier,
    o.city,
    o.address ?? '',
    o.payment,
    o.total.toFixed(2),
    o.items.map(i => `${i.name} x${i.quantity}`).join('; '),
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="orders-${Date.now()}.csv"`,
    },
  });
}
