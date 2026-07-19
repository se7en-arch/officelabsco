import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import OrderSearchInput from '@/components/admin/OrderSearchInput';

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

function buildWhere(filterStatus?: string, q?: string) {
  const statusClause = filterStatus ? { status: filterStatus } : undefined;
  const searchClause = q?.trim() ? {
    OR: [
      { firstName: { contains: q } },
      { lastName:  { contains: q } },
      { email:     { contains: q } },
      { phone:     { contains: q } },
      { company:   { contains: q } },
    ],
  } : undefined;

  if (statusClause && searchClause) return { AND: [statusClause, searchClause] };
  return statusClause ?? searchClause ?? undefined;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string }>;
}) {
  const { status: filterStatus, page: pageParam, q } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? '1'));
  const perPage = 25;
  const searchQuery = q?.trim() || undefined;

  const where = buildWhere(filterStatus, searchQuery);

  const [orders, counts, totalRevenue, filteredCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { items: true },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.order.count({ where }),
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Suspense>
            <OrderSearchInput defaultValue={searchQuery} />
          </Suspense>
          <a href={`/api/admin/orders/export${filterStatus ? `?status=${filterStatus}` : ''}`} className="admin-action-btn admin-action-btn--secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Изнеси CSV
          </a>
        </div>
      </div>

      <div className="admin-card">

        {/* Status tabs */}
        <div className="orders-tabs">
          {tabs.map(tab => {
            const isActive = (filterStatus ?? '') === tab.key;
            const params = new URLSearchParams();
            if (tab.key) params.set('status', tab.key);
            if (searchQuery) params.set('q', searchQuery);
            const href = params.size ? `/adminpanel/orders?${params.toString()}` : '/adminpanel/orders';
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

        {/* Search result hint */}
        {searchQuery && (
          <div style={{ padding: '10px 20px', fontSize: 13, color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
            {filteredCount === 0
              ? `Няма резултати за „${searchQuery}"`
              : `${filteredCount} резултата за „${searchQuery}"`}
          </div>
        )}

        {/* Table */}
        {orders.length === 0 ? (
          <div className="admin-empty">Няма поръчки</div>
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
        {filteredCount > perPage && (
          <div className="orders-pagination">
            {page > 1 && (
              <Link
                href={(() => {
                  const params = new URLSearchParams();
                  if (filterStatus) params.set('status', filterStatus);
                  if (searchQuery) params.set('q', searchQuery);
                  params.set('page', String(page - 1));
                  return `/adminpanel/orders?${params.toString()}`;
                })()}
                className="orders-pag-btn"
              >
                ← Предишна
              </Link>
            )}
            <span className="orders-pag-info">
              Страница {page} от {Math.ceil(filteredCount / perPage)}
            </span>
            {page < Math.ceil(filteredCount / perPage) && (
              <Link
                href={(() => {
                  const params = new URLSearchParams();
                  if (filterStatus) params.set('status', filterStatus);
                  if (searchQuery) params.set('q', searchQuery);
                  params.set('page', String(page + 1));
                  return `/adminpanel/orders?${params.toString()}`;
                })()}
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
