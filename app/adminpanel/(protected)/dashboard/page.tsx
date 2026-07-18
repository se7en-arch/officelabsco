import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { RevenueChart } from '@/components/admin/DashboardCharts';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Нова', processing: 'В обработка', shipped: 'Изпратена',
  delivered: 'Доставена', cancelled: 'Отказана',
};
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:  { bg: '#dcfce7', color: '#166534' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

export default async function DashboardPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    allOrders,
    recentOrders,
    activeProducts,
    archivedProducts,
    lowStockCount,
    outOfStock,
    totalCategories,
    totalSeries,
    pendingOrders,
    recentProducts,
  ] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, total: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { items: { take: 1 } },
    }),
    prisma.product.count({ where: { archived: false } }),
    prisma.product.count({ where: { archived: true } }),
    prisma.product.count({ where: { stock: { lte: 5, gt: 0 }, archived: false } }),
    prisma.product.count({ where: { stock: 0, archived: false } }),
    prisma.category.count(),
    prisma.series.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.product.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { series: { select: { name: true } }, category: { select: { name: true } } },
    }),
  ]);

  const totalRevenue = allOrders.reduce((s, o) => s + o.total, 0);
  const monthlyRevenue = allOrders.filter(o => o.createdAt >= startOfMonth).reduce((s, o) => s + o.total, 0);
  const todayRevenue = allOrders.filter(o => o.createdAt >= startOfToday).reduce((s, o) => s + o.total, 0);
  const totalOrderCount = allOrders.length;

  const statusCounts: Record<string, number> = {};
  allOrders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });

  // Build 6-month chart data
  const monthKeys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  const chartData = monthKeys.map((key, idx) => {
    const d = new Date(key + '-01');
    const label = d.toLocaleDateString('bg-BG', { month: 'short' });
    const monthOrders = allOrders.filter(o => o.createdAt.toISOString().startsWith(key));
    return {
      month: label,
      revenue: parseFloat(monthOrders.reduce((s, o) => s + o.total, 0).toFixed(2)),
      orders: monthOrders.length,
      isCurrent: idx === 5,
    };
  });

  const statusData = [
    { key: 'pending',    name: 'Нова',         color: '#854d0e', bg: '#fef9c3' },
    { key: 'processing', name: 'В обработка',  color: '#1e40af', bg: '#dbeafe' },
    { key: 'shipped',    name: 'Изпратена',    color: '#5b21b6', bg: '#ede9fe' },
    { key: 'delivered',  name: 'Доставена',    color: '#166534', bg: '#dcfce7' },
    { key: 'cancelled',  name: 'Отказана',     color: '#991b1b', bg: '#fee2e2' },
  ].map(s => ({ ...s, count: statusCounts[s.key] ?? 0 }));

  const maxStatus = Math.max(...statusData.map(s => s.count), 1);

  return (
    <>
      {/* ── Welcome header ── */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-welcome__title">Dashboard</h1>
          <p className="dash-welcome__sub">
            {now.toLocaleDateString('bg-BG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {pendingOrders > 0 && (
            <Link href="/adminpanel/orders?status=pending" className="dash-alert-btn">
              <span className="dash-alert-dot" />
              {pendingOrders} нови поръчки
            </Link>
          )}
          <Link href="/adminpanel/products/new" className="admin-action-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Нов продукт
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="dash-kpi-grid">

        <div className="dash-kpi dash-kpi--dark">
          <div className="dash-kpi__eyebrow">Общ приход</div>
          <div className="dash-kpi__value">€{totalRevenue.toFixed(2)}</div>
          <div className="dash-kpi__sub">
            {monthlyRevenue > 0
              ? `€${monthlyRevenue.toFixed(2)} този месец`
              : todayRevenue > 0
              ? `€${todayRevenue.toFixed(2)} днес`
              : 'Няма приход тази седмица'}
          </div>
          <svg className="dash-kpi__watermark" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".07">
            <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi__icon" style={{ background: '#EFF6FF' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="dash-kpi__eyebrow">Поръчки</div>
          <div className="dash-kpi__value">{totalOrderCount}</div>
          <div className="dash-kpi__sub" style={pendingOrders > 0 ? { color: '#854d0e', fontWeight: 600 } : {}}>
            {pendingOrders > 0 ? `${pendingOrders} чакат действие` : 'Всички обработени'}
          </div>
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi__icon" style={{ background: '#F0FDF4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="dash-kpi__eyebrow">Активни продукти</div>
          <div className="dash-kpi__value">{activeProducts}</div>
          <div className="dash-kpi__sub">{archivedProducts} архивирани · {totalCategories} категории</div>
        </div>

        <div className="dash-kpi">
          <div className="dash-kpi__icon" style={{ background: lowStockCount > 0 ? '#FFFBEB' : '#F9FAFB' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={lowStockCount > 0 ? '#CA8A04' : '#9CA3AF'} strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="dash-kpi__eyebrow">Ниска наличност</div>
          <div className="dash-kpi__value" style={lowStockCount > 0 ? { color: '#CA8A04' } : {}}>
            {lowStockCount}
          </div>
          <div className="dash-kpi__sub">{outOfStock} изчерпани · {totalSeries} серии</div>
        </div>

      </div>

      {/* ── Charts row ── */}
      <div className="dash-charts-row">

        {/* Revenue bar chart */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card__header">
            <div>
              <h2>Приход по месеци</h2>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Последни 6 месеца</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.5px' }}>€{totalRevenue.toFixed(2)}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>общо за периода</div>
            </div>
          </div>
          <div style={{ padding: '8px 16px 16px' }}>
            <RevenueChart data={chartData} />
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card__header">
            <h2>Статус поръчки</h2>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>{totalOrderCount}</span>
          </div>
          <div className="admin-card__body" style={{ paddingTop: 12 }}>
            {statusData.map(s => (
              <div key={s.key} className="dash-status-row">
                <span className="dash-status-dot" style={{ background: s.color }} />
                <span className="dash-status-name">{s.name}</span>
                <div className="dash-status-bar-wrap">
                  <div
                    className="dash-status-bar"
                    style={{ width: `${(s.count / maxStatus) * 100}%`, background: s.color }}
                  />
                </div>
                <span className="dash-status-count">{s.count}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
              <Link href="/adminpanel/orders" className="admin-action-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}>
                Всички поръчки →
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom row: Recent Orders + Recent Products ── */}
      <div className="dash-bottom-row">

        {/* Recent orders table */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card__header">
            <h2>Последни поръчки</h2>
            <Link href="/adminpanel/orders" className="admin-card__link">Виж всички →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Клиент</th>
                  <th>Продукти</th>
                  <th>Дата</th>
                  <th>Сума</th>
                  <th>Статус</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr><td colSpan={7} className="admin-empty">Все още няма поръчки</td></tr>
                )}
                {recentOrders.map(order => {
                  const pill = STATUS_PILL[order.status] ?? { bg: '#f3f4f6', color: '#374151' };
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: 'var(--muted)', fontSize: 12 }}>
                        #{String(order.id).padStart(4, '0')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{order.firstName} {order.lastName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{order.email}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{order.items.length} бр.</td>
                      <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('bg-BG')}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: 14 }}>€{order.total.toFixed(2)}</td>
                      <td>
                        <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/adminpanel/orders/${order.id}`} className="admin-row-btn admin-row-btn--view">
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
        </div>

        {/* Recently added products */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <div className="admin-card__header">
            <h2>Последно добавени</h2>
            <Link href="/adminpanel/products" className="admin-card__link">Всички →</Link>
          </div>
          <div>
            {recentProducts.map(p => (
              <div key={p.id} className="admin-recent-item">
                <div className="admin-recent-item__img">
                  <Image src={p.image} alt={p.name} width={36} height={36} style={{ objectFit: 'contain' }} />
                </div>
                <div className="admin-recent-item__info">
                  <div className="admin-recent-item__name">{p.name}</div>
                  <div className="admin-recent-item__meta">{p.series.name} · {p.category.name}</div>
                </div>
                <div className="admin-recent-item__price">{p.price} €</div>
                <Link href={`/adminpanel/products/${p.id}/edit`} className="admin-row-btn admin-row-btn--view">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
