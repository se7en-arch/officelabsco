import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';
import { BUNDLE_PROMO_CODE } from '@/lib/bundle-check';

export const dynamic = 'force-dynamic';

const isRateLimited = createRateLimiter(30, 60_000);

// Ensured lazily here (rather than requiring manual setup in
// /adminpanel/promos) so the popup always has a working code — an admin can
// still see/deactivate it there like any other promo code. Whether it's
// actually allowed to apply to a given cart is enforced separately in
// /api/validate-promo and /api/orders (see lib/bundle-check.ts).
const BUNDLE_DISCOUNT = 10;

const SERIES_SLUGS = ['astra', 'terra', 'nova', 'loft'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const [seriesList, allProducts] = await Promise.all([
    prisma.series.findMany({
      where: { slug: { in: SERIES_SLUGS } },
      select: { name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { series: { slug: { in: SERIES_SLUGS } }, archived: false },
      select: {
        id: true, name: true, nameEn: true, slug: true, price: true, image: true,
        series: { select: { slug: true } },
        category: { select: { name: true, nameEn: true } },
      },
      orderBy: { id: 'asc' },
    }),
  ]);

  if (seriesList.length === 0 || allProducts.length === 0) {
    return NextResponse.json({ error: 'no_series' }, { status: 404 });
  }

  await prisma.promoCode.upsert({
    where: { code: BUNDLE_PROMO_CODE },
    update: {},
    create: { code: BUNDLE_PROMO_CODE, discount: BUNDLE_DISCOUNT, active: true },
  }).catch(() => {});

  const bundles = shuffle(seriesList)
    .map((series) => {
      const products = allProducts.filter((p) => p.series.slug === series.slug);
      if (products.length === 0) return null;
      const bundleTotal = products.reduce((s, p) => s + p.price, 0);
      const discountedTotal = +(bundleTotal * (1 - BUNDLE_DISCOUNT / 100)).toFixed(2);
      return {
        series: { name: series.name, slug: series.slug },
        products: products.map((p) => ({
          id: p.id, name: p.name, nameEn: p.nameEn, slug: p.slug, price: p.price, image: p.image,
          categoryName: p.category.name, categoryNameEn: p.category.nameEn,
        })),
        promoCode: BUNDLE_PROMO_CODE,
        discountPercent: BUNDLE_DISCOUNT,
        bundleTotal: +bundleTotal.toFixed(2),
        discountedTotal,
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null);

  if (bundles.length === 0) {
    return NextResponse.json({ error: 'no_series' }, { status: 404 });
  }

  return NextResponse.json({ bundles });
}
