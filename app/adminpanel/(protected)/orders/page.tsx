import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Нова',
  processing: 'В обработка',
  shipped: 'Изпратена',
  delivered: 'Доставена',
  cancelled: 'Отказана',
};
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:  { bg: '#dcfce7', color: '#166534' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status: filterStatus, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1'));
  const perPage = 25;

  const [orders, counts, totalRevenue] = await Promise.all([
    prisma.order.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { items: true },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;
  const totalAll = Object.values(countMap).reduce((s, n) => s + n, 0);

  const totalOrderRevenue = totalRevenue._sum.total ?? 0;

  const tabs = [
    { key: '', label: 'Всички', count: totalAll },
    { key: 'pending',    label: 'Нова',          count: countMap['pending']    ?? 0 },
    { key: 'processing', label: 'В обработка',   count: countMap['processing'] ?? 0 },
    { key: 'shipped',    label: 'Изпратена',     count: countMap['shipped']    ?? 0 },
    { key: 'delivered',  label: 'Доставена',     count: countMap['delivered']  ?? 0 },
    { key: 'cancelled',  label: 'Отказана',      count: countMap['cancelled']  ?? 0 },
  ];

  return (
    <>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Поръчки</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {totalAll} поръчки · €{totalOrderRevenue.toFixed(2)} общ приход
          </p>
        </div>
        <a href="/api/admin/orders/export" className="admin-action-btn admin-action-btn--secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Изнеси CSV
        </a>
      </div>

      <div className="admin-card">

        {/* Status tabs */}
        <div className="orders-tabs">
          {tabs.map(tab => {
            const isActive = (filterStatus ?? '') === tab.key;
            const href = tab.key ? `/adminpanel/orders?status=${tab.key}` : '/adminpanel/orders';
            return (
              <Link
                key={tab.key}
                href={href}
                className={`orders-tab${isActive ? ' orders-tab--active' : ''}`}
              >
                {tab.label}
                <span className={`orders-tab__count${isActive ? ' orders-tab__count--active' : ''}`}>
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Table */}
        {orders.length === 0 ? (
          <div className="admin-empty">Няма поръчки за избрания статус</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Клиент</th>
                  <th>Телефон</th>
                  <th>Продукти</th>
                  <th>Доставка</th>
                  <th>Плащане</th>
                  <th>Сума</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const pill = STATUS_PILL[o.status] ?? { bg: '#f3f4f6', color: '#374151' };
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        #{String(o.id).padStart(4, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                          {o.firstName} {o.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.email}</div>
                        {o.company && (
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.company}</div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{o.phone}</td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                        {o.items.length} бр.
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {o.carrier}
                        <div style={{ fontSize: 11 }}>
                          {o.delivType === 'address' ? 'До адрес' : 'До офис'}
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {o.payment === 'card' ? 'Карта' : 'Наложен платеж'}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
                        €{o.total.toFixed(2)}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(o.createdAt).toLocaleDateString('bg-BG')}
                        <div style={{ fontSize: 11 }}>
                          {new Date(o.createdAt).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                          {STATUS_LABELS[o.status] ?? o.status}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/adminpanel/orders/${o.id}`}
                          className="admin-row-btn admin-row-btn--view"
                          title="Виж поръчката"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalAll > perPage && (
          <div className="orders-pagination">
            {page > 1 && (
              <Link
                href={filterStatus
                  ? `/adminpanel/orders?status=${filterStatus}&page=${page - 1}`
                  : `/adminpanel/orders?page=${page - 1}`}
                className="orders-pag-btn"
              >
                ← Предишна
              </Link>
            )}
            <span className="orders-pag-info">
              Страница {page} от {Math.ceil(totalAll / perPage)}
            </span>
            {page < Math.ceil(totalAll / perPage) && (
              <Link
                href={filterStatus
                  ? `/adminpanel/orders?status=${filterStatus}&page=${page + 1}`
                  : `/adminpanel/orders?page=${page + 1}`}
                className="orders-pag-btn"
              >
                Следваща →
              </Link>
            )}
          </div>
        )}

      </div>
    </>
  );
}
