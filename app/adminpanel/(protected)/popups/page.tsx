import { prisma } from '@/lib/prisma';
import { toAdminPopup } from '@/lib/popup-serialize';
import { BUNDLE_PROMO_CODE } from '@/lib/bundle-constants';
import type { PopupStats } from '@/lib/popup-types';
import PopupsManager from '@/components/admin/PopupsManager';

export const dynamic = 'force-dynamic';

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

export default async function PopupsPage() {
  const [popups, promos] = await Promise.all([
    prisma.popup.findMany({ orderBy: [{ priority: 'desc' }, { id: 'asc' }] }),
    prisma.promoCode.findMany({ where: { active: true }, orderBy: { code: 'asc' }, select: { code: true, discount: true } }),
  ]);
  const ids = popups.map((p) => p.id);

  const [statRows, signupRows] = await Promise.all([
    prisma.popupStat.findMany({ where: { popupId: { in: ids } } }),
    prisma.subscriber.groupBy({ by: ['popupId'], where: { popupId: { in: ids } }, _count: { _all: true } }),
  ]);

  // Last 14 days (UTC, same bucketing the tracker uses), oldest → newest.
  const days = Array.from({ length: 14 }, (_, i) => dayKey(new Date(Date.now() - (13 - i) * 86_400_000)));
  const signups = new Map(signupRows.map((r) => [r.popupId, r._count._all]));

  // Orders that used the popup's code (bundle popup → BUNDLE10) since it
  // started. Attribution is by code: the same code typed in manually counts too.
  const stats: Record<number, PopupStats> = {};
  await Promise.all(popups.map(async (p) => {
    const rows = statRows.filter((r) => r.popupId === p.id);
    const code = p.type === 'bundle' ? BUNDLE_PROMO_CODE : p.promoCode;
    const agg = code
      ? await prisma.order.aggregate({
          where: { promoCode: code, status: { not: 'cancelled' }, ...(p.startsAt ? { createdAt: { gte: p.startsAt } } : {}) },
          _count: { _all: true }, _sum: { total: true },
        })
      : null;
    stats[p.id] = {
      views: rows.reduce((s, r) => s + r.views, 0),
      clicks: rows.reduce((s, r) => s + r.clicks, 0),
      closes: rows.reduce((s, r) => s + r.closes, 0),
      signups: signups.get(p.id) ?? 0,
      orders: agg?._count._all ?? 0,
      revenue: agg?._sum.total ?? 0,
      last14: days.map((d) => rows.find((r) => r.day === d)?.views ?? 0),
    };
  }));

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Попъпи</h1>
          <p className="admin-page__subtitle">Пускай и спирай попъпите и лентите на сайта — без deploy. Един попъп и една лента наведнъж.</p>
        </div>
      </div>
      <PopupsManager initialPopups={popups.map(toAdminPopup)} promos={promos} stats={stats} />
    </div>
  );
}
