import { redirect } from 'next/navigation';
import { getDealerSession } from '@/lib/dealer-auth';
import { prisma } from '@/lib/prisma';
import DealerNav from '@/components/dealers/DealerNav';
import Link from 'next/link';

const STATUS_LABELS: Record<string, string> = {
  new: 'Нова', processing: 'В обработка', shipped: 'Изпратена',
  completed: 'Завършена', cancelled: 'Отменена',
};

function fmt(n: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function DealerOrdersPage() {
  const session = await getDealerSession();
  if (!session) redirect('/dealers');
  if (session.status !== 'APPROVED') redirect('/dealers/pending');

  const [dealer, orders] = await Promise.all([
    prisma.dealer.findUnique({ where: { id: session.id }, select: { companyName: true, discountPercent: true } }),
    prisma.dealerOrder.findMany({
      where: { dealerId: session.id },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  if (!dealer) redirect('/dealers');

  return (
    <>
      <DealerNav companyName={dealer.companyName} discount={dealer.discountPercent} active="orders" />
      <div className="dl-page">
        <h1 className="dl-title">Моите поръчки</h1>
        <p className="dl-subtitle">{orders.length} поръчки</p>

        {orders.length === 0 ? (
          <div className="dl-card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📦</div>
            <p style={{ color: '#6B7280' }}>Все още нямате поръчки.</p>
            <Link href="/dealers/dashboard" className="dl-btn dl-btn--primary" style={{ display: 'inline-flex', marginTop: 16 }}>
              Към каталога
            </Link>
          </div>
        ) : (
          <div className="dl-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="dl-table-wrap">
              <table className="dl-order-table">
                <thead>
                  <tr>
                    <th>№ поръчка</th>
                    <th>Дата</th>
                    <th>Артикули</th>
                    <th style={{ textAlign: 'right' }}>Сума</th>
                    <th>Статус</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, fontFamily: 'monospace' }}>#Order{String(o.orderNumber ?? 0).padStart(5, '0')}</td>
                      <td style={{ color: '#6B7280' }}>{new Date(o.createdAt).toLocaleDateString('bg-BG')}</td>
                      <td>{o.items.reduce((s, i) => s + i.quantity, 0)} бр.</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(o.total)} лв.</td>
                      <td><span className={`dl-badge dl-badge--${o.status}`}>{STATUS_LABELS[o.status] ?? o.status}</span></td>
                      <td>
                        <Link href={`/dealers/orders/${o.id}`} className="dl-btn dl-btn--outline dl-btn--sm">
                          Детайли
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
