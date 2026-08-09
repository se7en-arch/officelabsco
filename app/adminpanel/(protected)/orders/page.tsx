import Link from 'next/link';
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import OrderSearchInput from '@/components/admin/OrderSearchInput';

// Normalise raw DB statuses to unified tab keys
const C_STATUS: Record<string, string> = {
  pending: 'new', processing: 'processing', shipped: 'shipped',
  delivered: 'done', cancelled: 'cancelled',
};
const D_STATUS: Record<string, string> = {
  new: 'new', processing: 'processing', shipped: 'shipped',
  completed: 'done', cancelled: 'cancelled',
};
const STATUS_LABEL: Record<string, string> = {
  new: 'Нова', processing: 'В обработка', shipped: 'Изпратена',
  done: 'Завършена', cancelled: 'Отказана',
};
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  new:        { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped:    { bg: '#ede9fe', color: '#5b21b6' },
  done:       { bg: '#dcfce7', color: '#166534' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

type UnifiedOrder = {
  type: 'customer' | 'dealer';
  id: string;
  orderNumber: number;
  orderCode: string | null;
  displayName: string;
  email: string;
  phone: string;
  itemCount: number;
  total: number;
  statusKey: string;
  rawStatus: string;
  createdAt: Date;
  href: string;
};

export default async function OrdersPage({
  searchParams,
}: { searchParams: Promise<{ status?: string; page?: string; q?: string }> }) {
  const { status: filterStatus, page: pageParam, q } = await searchParams;
  const page    = Math.max(1, parseInt(pageParam ?? '1'));
  const perPage = 25;
  const sq      = q?.trim().toLowerCase() || undefined;

  // Fetch both order types
  const [customerOrders, dealerOrders] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2000,
      include: { items: { select: { id: true } } },
    }),
    prisma.dealerOrder.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2000,
      include: {
        items: { select: { id: true, quantity: true } },
        dealer: { select: { companyName: true, contactName: true, email: true, phone: true } },
      },
    }),
  ]);

  // Normalise
  const unified: UnifiedOrder[] = [
    ...customerOrders.map(o => ({
      type:        'customer' as const,
      id:          String(o.id),
      orderNumber: o.orderNumber ?? o.id,
      orderCode:   o.orderCode ?? null,
      displayName: `${o.firstName} ${o.lastName}`,
      email:       o.email,
      phone:       o.phone,
      itemCount:   o.items.length,
      total:       o.total,
      statusKey:   C_STATUS[o.status] ?? o.status,
      rawStatus:   o.status,
      createdAt:   o.createdAt,
      href:        `/adminpanel/orders/${o.id}`,
    })),
    ...dealerOrders.map(o => ({
      type:        'dealer' as const,
      id:          o.id,
      orderNumber: o.orderNumber ?? 0,
      orderCode:   o.orderCode ?? null,
      displayName: o.dealer.companyName,
      email:       o.dealer.email,
      phone:       o.dealer.phone,
      itemCount:   o.items.reduce((s, i) => s + i.quantity, 0),
      total:       o.total,
      statusKey:   D_STATUS[o.status] ?? o.status,
      rawStatus:   o.status,
      createdAt:   o.createdAt,
      href:        `/adminpanel/dealers/orders/${o.id}`,
    })),
  ];

  // Sort by newest first
  unified.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Search filter
  const searched = sq
    ? unified.filter(o =>
        o.displayName.toLowerCase().includes(sq) ||
        o.email.toLowerCase().includes(sq) ||
        o.phone.includes(sq)
      )
    : unified;

  // Status filter
  const filtered = filterStatus ? searched.filter(o => o.statusKey === filterStatus) : searched;

  // Paginate
  const paginated    = filtered.slice((page - 1) * perPage, page * perPage);
  const totalRevenue = unified.reduce((s, o) => s + o.total, 0);

  const countsByStatus: Record<string, number> = {};
  for (const o of searched) countsByStatus[o.statusKey] = (countsByStatus[o.statusKey] ?? 0) + 1;

  const tabs = [
    { key: '',           label: 'Всички',       count: searched.length },
    { key: 'new',        label: 'Нова',         count: countsByStatus['new']        ?? 0 },
    { key: 'processing', label: 'В обработка',  count: countsByStatus['processing'] ?? 0 },
    { key: 'shipped',    label: 'Изпратена',    count: countsByStatus['shipped']    ?? 0 },
    { key: 'done',       label: 'Завършена',    count: countsByStatus['done']       ?? 0 },
    { key: 'cancelled',  label: 'Отказана',     count: countsByStatus['cancelled']  ?? 0 },
  ];

  return (
    <>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1>Поръчки</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            {unified.length} поръчки · €{totalRevenue.toFixed(2)} общ приход
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Suspense>
            <OrderSearchInput defaultValue={q} />
          </Suspense>
          <a
            href={`/api/admin/orders/export${filterStatus ? `?status=${filterStatus}` : ''}`}
            className="admin-action-btn admin-action-btn--secondary"
          >
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
            if (sq) params.set('q', q!);
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

        {/* Search hint */}
        {sq && (
          <div style={{ padding: '10px 20px', fontSize: 13, color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>
            {filtered.length === 0
              ? `Няма резултати за „${q}"`
              : `${filtered.length} резултата за „${q}"`}
          </div>
        )}

        {/* Table */}
        {paginated.length === 0 ? (
          <div className="admin-empty">Няма поръчки</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Клиент / Дилър</th>
                  <th>Телефон</th>
                  <th>Продукти</th>
                  <th>Сума</th>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Статус</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {paginated.map(o => {
                  const pill      = STATUS_PILL[o.statusKey] ?? { bg: '#f3f4f6', color: '#374151' };
                  const isDealer  = o.type === 'dealer';
                  return (
                    <tr key={`${o.type}-${o.id}`}>
                      <td style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                        #{o.orderCode ?? String(o.orderNumber).padStart(5, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                          {o.displayName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.email}</div>
                      </td>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{o.phone}</td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{o.itemCount} бр.</td>
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
                        <span style={{
                          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '.05em', padding: '2px 8px', borderRadius: 20,
                          background: isDealer ? '#FEF3C7' : '#EFF6FF',
                          color:      isDealer ? '#92400E' : '#1E40AF',
                          border:     `1px solid ${isDealer ? '#FDE68A' : '#BFDBFE'}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {isDealer ? 'Дилър' : 'Клиент'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                          {STATUS_LABEL[o.statusKey] ?? o.rawStatus}
                        </span>
                      </td>
                      <td>
                        <Link href={o.href} className="admin-row-btn admin-row-btn--view" title="Виж поръчката">
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
        {filtered.length > perPage && (
          <div className="orders-pagination">
            {page > 1 && (
              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  if (filterStatus) p.set('status', filterStatus);
                  if (sq) p.set('q', q!);
                  p.set('page', String(page - 1));
                  return `/adminpanel/orders?${p.toString()}`;
                })()}
                className="orders-pag-btn"
              >
                ← Предишна
              </Link>
            )}
            <span className="orders-pag-info">
              Страница {page} от {Math.ceil(filtered.length / perPage)}
            </span>
            {page < Math.ceil(filtered.length / perPage) && (
              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  if (filterStatus) p.set('status', filterStatus);
                  if (sq) p.set('q', q!);
                  p.set('page', String(page + 1));
                  return `/adminpanel/orders?${p.toString()}`;
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
