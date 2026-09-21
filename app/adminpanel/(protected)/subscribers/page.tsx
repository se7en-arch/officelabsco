import { prisma } from '@/lib/prisma';
import SubscribersManager from '@/components/admin/SubscribersManager';

export const dynamic = 'force-dynamic';

export default async function SubscribersPage() {
  const [total, rows] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' }, take: 1000 }),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header" style={{ gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 className="admin-page__title">Абонати</h1>
          <p className="admin-page__subtitle">
            {total} {total === 1 ? 'имейл' : 'имейла'} — събрани от имейл попъпа и формата в магазина, всички със съгласие.
          </p>
        </div>
        <a className="admin-action-btn" href="/api/admin/subscribers/export" style={{ padding: '9px 20px', textDecoration: 'none' }}>
          ⬇ Изтегли CSV
        </a>
      </div>
      <SubscribersManager
        initial={rows.map((r) => ({ id: r.id, email: r.email, locale: r.locale, source: r.source, createdAt: r.createdAt.toISOString() }))}
        total={total}
      />
    </div>
  );
}
