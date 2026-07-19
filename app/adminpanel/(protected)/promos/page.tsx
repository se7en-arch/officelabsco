import { prisma } from '@/lib/prisma';
import PromoManager from '@/components/admin/PromoManager';

export const dynamic = 'force-dynamic';

export default async function PromosPage() {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Промо кодове</h1>
          <p className="admin-page__subtitle">{promos.length} кода</p>
        </div>
      </div>
      <PromoManager initialPromos={promos} />
    </div>
  );
}
