import { prisma } from '@/lib/prisma';

// The shop popup's auto-provisioned code (see /api/bundle-deal). Kept here so
// every place that needs to special-case it (validate-promo, order creation)
// references the same constant instead of a hardcoded string.
export const BUNDLE_PROMO_CODE = 'BUNDLE10';

// Whether a cart made up of these product ids fully contains at least one
// series' complete active product lineup — the only condition under which
// BUNDLE_PROMO_CODE is allowed to apply. Without this check, anyone could
// type "BUNDLE10" into the cart's promo field with an arbitrary/partial cart
// and get the same discount the popup's "add whole set" flow is meant to
// reward.
export async function cartQualifiesForBundle(itemIds: number[]): Promise<boolean> {
  if (itemIds.length === 0) return false;
  const cartIds = new Set(itemIds);

  const seriesList = await prisma.series.findMany({
    select: {
      products: { where: { archived: false }, select: { id: true } },
    },
  });

  return seriesList.some(
    (s) => s.products.length > 0 && s.products.every((p) => cartIds.has(p.id))
  );
}
