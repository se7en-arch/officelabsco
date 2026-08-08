import { redirect, notFound } from 'next/navigation';
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

export default async function DealerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getDealerSession();
  if (!session) redirect('/dealers');
  if (session.status !== 'APPROVED') redirect('/dealers/pending');

  const [dealer, order] = await Promise.all([
    prisma.dealer.findUnique({ where: { id: session.id }, select: { companyName: true, discountPercent: true } }),
    prisma.dealerOrder.findUnique({
      where: { id },
      include: { items: true },
    }),
  ]);

  if (!dealer) redirect('/dealers');
  if (!order || order.dealerId !== session.id) notFound();

  return (
    <>
      <DealerNav companyName={dealer.companyName} discount={dealer.discountPercent} active="orders" />
      <div className="dl-page">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <Link href="/dealers/orders" className="dl-btn dl-btn--outline dl-btn--sm">← Поръчки</Link>
          <h1 className="dl-title" style={{ margin: 0 }}>
            Поръчка #{order.id.slice(-8).toUpperCase()}
          </h1>
          <span className={`dl-badge dl-badge--${order.status}`}>{STATUS_LABELS[order.status] ?? order.status}</span>
        </div>

        <div className="dl-stat-row" style={{ marginBottom: 24 }}>
          <div className="dl-stat" style={{ padding: '12px 20px' }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>Дата</div>
            <div style={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div className="dl-stat" style={{ padding: '12px 20px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em' }}>Общо</div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>{fmt(order.total)} лв.</div>
          </div>
        </div>

        <div className="dl-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <div className="dl-table-wrap">
            <table className="dl-order-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }} />
                  <th>Продукт</th>
                  <th>Цвят</th>
                  <th style={{ textAlign: 'right' }}>Ед. цена</th>
                  <th style={{ textAlign: 'right' }}>Кат. цена</th>
                  <th style={{ textAlign: 'center' }}>Бр.</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image ? (
                        <img src={item.image} alt={item.productName} style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 6 }} />
                      ) : <div style={{ width: 48, height: 48, background: '#F3F4F6', borderRadius: 6 }} />}
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.productName}</td>
                    <td style={{ color: '#6B7280' }}>{item.color ?? '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#B45309' }}>{fmt(item.unitPrice)} лв.</td>
                    <td style={{ textAlign: 'right', color: '#9CA3AF', textDecoration: 'line-through', fontSize: 13 }}>{fmt(item.retailPrice)} лв.</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{fmt(item.unitPrice * item.quantity)} лв.</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {order.notes && (
          <div className="dl-card">
            <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Бележки</div>
            <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{order.notes}</p>
          </div>
        )}
      </div>
    </>
  );
}
