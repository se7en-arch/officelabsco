import { prisma } from '@/lib/prisma';

export { BUNDLE_PROMO_CODE } from '@/lib/bundle-constants';

// Product ids of one series whose complete active lineup is fully present in
// the cart (or null if none qualifies). The cart may contain other items
// too — those simply aren't discounted; see how the returned ids are used
// to price only the matching line items at 10% off and everything else at
// full price. If more than one series happens to be fully present, only the
// first is returned/discounted — the offer is for one set, not stacking
// multiple complete series under the same code.
export async function cartQualifyingBundleProductIds(itemIds: number[]): Promise<number[] | null> {
  if (itemIds.length === 0) return null;
  const cartIds = new Set(itemIds);

  const seriesList = await prisma.series.findMany({
    select: {
      products: { where: { archived: false }, select: { id: true } },
    },
  });

  const qualifying = seriesList.find(
    (s) => s.products.length > 0 && s.products.every((p) => cartIds.has(p.id))
  );

  return qualifying ? qualifying.products.map((p) => p.id) : null;
}

export async function cartQualifiesForBundle(itemIds: number[]): Promise<boolean> {
  return (await cartQualifyingBundleProductIds(itemIds)) !== null;
}
