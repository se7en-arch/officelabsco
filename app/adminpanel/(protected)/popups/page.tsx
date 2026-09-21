import { prisma } from '@/lib/prisma';
import { toAdminPopup } from '@/lib/popup-serialize';
import PopupsManager from '@/components/admin/PopupsManager';

export const dynamic = 'force-dynamic';

export default async function PopupsPage() {
  const [popups, promos] = await Promise.all([
    prisma.popup.findMany({ orderBy: [{ priority: 'desc' }, { id: 'asc' }] }),
    prisma.promoCode.findMany({ where: { active: true }, orderBy: { code: 'asc' }, select: { code: true, discount: true } }),
  ]);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Попъпи</h1>
          <p className="admin-page__subtitle">Пускай и спирай попъпите на сайта — без deploy. Показва се само един наведнъж.</p>
        </div>
      </div>
      <PopupsManager initialPopups={popups.map(toAdminPopup)} promos={promos} />
    </div>
  );
}
