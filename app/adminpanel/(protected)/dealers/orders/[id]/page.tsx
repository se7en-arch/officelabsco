import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import DealerOrderStatusSelect from '@/components/admin/DealerOrderStatusSelect';

const STATUS_LABELS: Record<string, string> = {
  new: 'Нова', processing: 'В обработка', shipped: 'Изпратена',
  completed: 'Завършена', cancelled: 'Отменена',
};
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  new:        { bg: '#EFF6FF', color: '#1E40AF' },
  processing: { bg: '#FEF9C3', color: '#854d0e' },
  shipped:    { bg: '#F5F3FF', color: '#5B21B6' },
  completed:  { bg: '#DCFCE7', color: '#166534' },
  cancelled:  { bg: '#F3F4F6', color: '#6B7280' },
};

function fmt(n: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AdminDealerOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.dealerOrder.findUnique({
    where: { id },
    include: {
      items: true,
      dealer: {
        select: { id: true, companyName: true, contactName: true, email: true, phone: true },
      },
    },
  });

  if (!order) notFound();

  const pill = STATUS_PILL[order.status] ?? { bg: '#F3F4F6', color: '#374151' };

  return (
    <>
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Link href={`/adminpanel/dealers/${order.dealer.id}`} className="admin-action-btn admin-action-btn--secondary" style={{ marginTop: 2, flexShrink: 0 }}>
            ← {order.dealer.companyName}
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1>Поръчка #{order.orderCode ?? String(order.orderNumber ?? 0).padStart(5, '0')}</h1>
              <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '3px 10px', borderRadius: 20, fontWeight: 700, letterSpacing: '.04em' }}>
                ДИЛЪРСКА ПОРЪЧКА
              </span>
            </div>
            <p>
              {new Date(order.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}{order.dealer.companyName}
            </p>
          </div>
        </div>
        <DealerOrderStatusSelect orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="admin-order-detail-grid">
        {/* Left — items */}
        <div>
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div className="admin-card__header"><h2>Артикули</h2></div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 56 }} />
                  <th>Продукт</th>
                  <th>Цвят</th>
                  <th style={{ textAlign: 'right' }}>Дилърска ед. цена</th>
                  <th style={{ textAlign: 'right' }}>Клиентска цена</th>
                  <th style={{ textAlign: 'center' }}>Бр.</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      {item.image
                        ? <img src={item.image} alt={item.productName} className="admin-table__img" />
                        : <div className="admin-table__img" />}
                    </td>
                    <td>
                      <div className="admin-product-name">{item.productName}</div>
                      {item.productSlug && <div className="admin-product-sku">{item.productSlug}</div>}
                    </td>
                    <td style={{ color: 'var(--muted)' }}>{item.color ?? '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.unitPrice)} €</td>
                    <td style={{ textAlign: 'right', color: 'var(--muted)', textDecoration: 'line-through', fontSize: 12 }}>{fmt(item.retailPrice)} €</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800 }}>{fmt(item.unitPrice * item.quantity)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-order-total">
              <span>Общо</span>
              <span>{fmt(order.total)} €</span>
            </div>
          </div>

          {order.notes && (
            <div className="admin-card">
              <div className="admin-card__header"><h2>Бележки</h2></div>
              <div className="admin-card__body">
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right — dealer info */}
        <div className="admin-order-detail-right">
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Дилър</h2>
              <Link href={`/adminpanel/dealers/${order.dealer.id}`} className="admin-card__link">Профил →</Link>
            </div>
            <div className="admin-card__body">
              {[
                ['Фирма',    order.dealer.companyName],
                ['Контакт',  order.dealer.contactName],
                ['Имейл',    order.dealer.email],
                ['Телефон',  order.dealer.phone],
                ['Отстъпка при поръчка', `${order.discountPercent}%`],
              ].map(([label, value]) => (
                <div key={label} className="admin-detail-row">
                  <span className="admin-detail-row__label">{label}</span>
                  <span className="admin-detail-row__value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
