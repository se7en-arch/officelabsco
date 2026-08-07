import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const STATUS_LABEL: Record<string, string> = { PENDING: 'Чака', APPROVED: 'Одобрен', REJECTED: 'Отказан' };
const STATUS_PILL: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: '#fef9c3', color: '#854d0e' },
  APPROVED: { bg: '#dcfce7', color: '#166534' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b' },
};

export default async function AdminDealersPage({
  searchParams,
}: { searchParams: Promise<{ status?: string }> }) {
  const { status: filterStatus } = await searchParams;

  const [dealers, counts] = await Promise.all([
    prisma.dealer.findMany({
      where: filterStatus ? { status: filterStatus } : undefined,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dealer.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) countMap[c.status] = c._count._all;
  const totalAll = Object.values(countMap).reduce((s, n) => s + n, 0);

  const tabs = [
    { key: '', label: 'Всички', count: totalAll },
    { key: 'PENDING',  label: 'Чакащи',  count: countMap['PENDING']  ?? 0 },
    { key: 'APPROVED', label: 'Одобрени', count: countMap['APPROVED'] ?? 0 },
    { key: 'REJECTED', label: 'Отказани', count: countMap['REJECTED'] ?? 0 },
  ];

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h1>Дилъри</h1>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{totalAll} регистрирани дилъри</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="orders-tabs">
          {tabs.map(tab => {
            const isActive = (filterStatus ?? '') === tab.key;
            const href = tab.key ? `/adminpanel/dealers?status=${tab.key}` : '/adminpanel/dealers';
            return (
              <Link key={tab.key} href={href} className={`orders-tab${isActive ? ' orders-tab--active' : ''}`}>
                {tab.label}
                <span className={`orders-tab__count${isActive ? ' orders-tab__count--active' : ''}`}>{tab.count}</span>
              </Link>
            );
          })}
        </div>

        {dealers.length === 0 ? (
          <div className="admin-empty">Няма дилъри</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Фирма</th>
                  <th>Контакт</th>
                  <th>Имейл</th>
                  <th>ЕИК</th>
                  <th style={{ textAlign: 'right' }}>Отстъпка</th>
                  <th style={{ textAlign: 'right' }}>Поръчки</th>
                  <th>Дата</th>
                  <th>Статус</th>
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {dealers.map(d => {
                  const pill = STATUS_PILL[d.status] ?? { bg: '#f3f4f6', color: '#374151' };
                  return (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.companyName}</td>
                      <td>
                        <div style={{ fontSize: 13 }}>{d.contactName}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.phone}</div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--muted)' }}>{d.email}</td>
                      <td style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'monospace' }}>{d.eik}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: d.discountPercent > 0 ? '#16a34a' : 'var(--muted)' }}>
                        {d.discountPercent}%
                      </td>
                      <td style={{ textAlign: 'right' }}>{d._count.orders}</td>
                      <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {new Date(d.createdAt).toLocaleDateString('bg-BG')}
                      </td>
                      <td>
                        <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                          {STATUS_LABEL[d.status] ?? d.status}
                        </span>
                      </td>
                      <td>
                        <Link href={`/adminpanel/dealers/${d.id}`} className="admin-row-btn admin-row-btn--view" title="Управление">
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
      </div>
    </>
  );
}
