import { prisma } from './prisma';

// The discount % to badge every product card with while a promo campaign
// (e.g. Black Friday) is running — derived from the same active/scheduled
// promo popup and promo code the cart discount itself uses, so the badge
// never drifts out of sync with what checkout actually applies.
export async function getActiveCampaignDiscount(): Promise<number | null> {
  const now = new Date();
  const promoPopups = await prisma.popup.findMany({
    where: { active: true, type: 'promo' },
    orderBy: [{ priority: 'desc' }, { id: 'asc' }],
  });

  const live = promoPopups.find(
    (r) => (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt > now) && r.promoCode
  );
  if (!live?.promoCode) return null;

  const promo = await prisma.promoCode.findFirst({
    where: { code: live.promoCode, active: true },
    select: { discount: true },
  });
  return promo?.discount ?? null;
}
