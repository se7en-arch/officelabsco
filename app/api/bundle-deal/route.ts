import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const isRateLimited = createRateLimiter(30, 60_000);

// One shared, always-active code for the shop bundle popup. Ensured lazily
// here (rather than requiring manual setup in /adminpanel/promos) so the
// popup always has a working code — an admin can still see/deactivate it
// there like any other promo code.
const BUNDLE_PROMO_CODE = 'BUNDLE10';
const BUNDLE_DISCOUNT = 10;

const SERIES_SLUGS = ['astra', 'terra', 'nova', 'loft'];

export async function GET(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'too_many' }, { status: 429 });
  }

  const slug = SERIES_SLUGS[Math.floor(Math.random() * SERIES_SLUGS.length)];

  const [series, products] = await Promise.all([
    prisma.series.findUnique({
      where: { slug },
      select: { name: true, slug: true },
    }),
    prisma.product.findMany({
      where: { series: { slug }, archived: false },
      select: {
        id: true, name: true, nameEn: true, slug: true, price: true, image: true,
        category: { select: { name: true, nameEn: true } },
      },
      orderBy: { id: 'asc' },
    }),
  ]);

  if (!series || products.length === 0) {
    return NextResponse.json({ error: 'no_series' }, { status: 404 });
  }

  await prisma.promoCode.upsert({
    where: { code: BUNDLE_PROMO_CODE },
    update: {},
    create: { code: BUNDLE_PROMO_CODE, discount: BUNDLE_DISCOUNT, active: true },
  }).catch(() => {});

  const bundleTotal = products.reduce((s, p) => s + p.price, 0);
  const discountedTotal = +(bundleTotal * (1 - BUNDLE_DISCOUNT / 100)).toFixed(2);

  return NextResponse.json({
    series: { name: series.name, slug: series.slug },
    products: products.map(p => ({
      id: p.id, name: p.name, nameEn: p.nameEn, slug: p.slug, price: p.price, image: p.image,
      categoryName: p.category.name, categoryNameEn: p.category.nameEn,
    })),
    promoCode: BUNDLE_PROMO_CODE,
    discountPercent: BUNDLE_DISCOUNT,
    bundleTotal: +bundleTotal.toFixed(2),
    discountedTotal,
  });
}
