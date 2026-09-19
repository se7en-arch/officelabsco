import { prisma } from '@/lib/prisma';

// The shop popup's auto-provisioned code (see /api/bundle-deal). Kept here so
// every place that needs to special-case it (validate-promo, order creation)
// references the same constant instead of a hardcoded string.
export const BUNDLE_PROMO_CODE = 'BUNDLE10';

async function findQualifyingSeries(itemIds: number[]) {
  if (itemIds.length === 0) return [];
  const cartIds = new Set(itemIds);

  const seriesList = await prisma.series.findMany({
    select: {
      products: { where: { archived: false }, select: { id: true } },
    },
  });

  return seriesList.filter(
    (s) => s.products.length > 0 && s.products.every((p) => cartIds.has(p.id))
  );
}

// Whether a cart made up of these product ids qualifies for
// BUNDLE_PROMO_CODE: it must fully contain exactly one series' complete
// active product lineup — not zero, and not two-or-more. Without this
// check, anyone could type "BUNDLE10" into the cart's promo field with an
// arbitrary/partial cart and get the same discount the popup's "add whole
// set" flow is meant to reward; requiring exactly one (rather than "at
// least one") also stops a second series' bundle from being added on top
// of an already-discounted cart to get 10% off both combined.
export async function cartQualifiesForBundle(itemIds: number[]): Promise<boolean> {
  const qualifying = await findQualifyingSeries(itemIds);
  return qualifying.length === 1;
}

// Same check, but also returns the product ids of the one qualifying
// series' bundle (or null if the cart doesn't qualify) — the client needs
// this list to know which specific items, if removed, should drop the
// discount (see cart-store's bundleProductIds).
export async function cartQualifyingBundleProductIds(itemIds: number[]): Promise<number[] | null> {
  const qualifying = await findQualifyingSeries(itemIds);
  if (qualifying.length !== 1) return null;
  return qualifying[0].products.map((p) => p.id);
}
