import { prisma } from './prisma';

// The running campaign (e.g. Black Friday) — the same active/scheduled
// promo popup and promo code the cart auto-apply and the card badge both
// read, so none of them can drift out of sync with each other.
export async function getActiveCampaignPromo(): Promise<{ code: string; discountPercent: number } | null> {
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
    select: { code: true, discount: true },
  });
  if (!promo) return null;
  return { code: promo.code, discountPercent: promo.discount };
}

// The discount % to badge every product card with while that campaign runs.
export async function getActiveCampaignDiscount(): Promise<number | null> {
  const promo = await getActiveCampaignPromo();
  return promo?.discountPercent ?? null;
}
