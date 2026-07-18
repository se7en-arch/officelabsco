import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Магазин | .office labs — Премиум офис мебели',
  description: 'Разгледай всички серии офис мебели — NOVA, ASTRA, TERRA, LOFT. Бюра, маси, шкафове, етажерки. Безплатна доставка.',
  openGraph: {
    title: 'Магазин | .office labs',
    description: 'Разгледай всички серии офис мебели — NOVA, ASTRA, TERRA, LOFT.',
    type: 'website',
    siteName: '.office labs',
  },
};
import ProductCard from '@/components/ProductCard';
import ShopSidebar from '@/components/ShopSidebar';
import SortSelect from '@/components/SortSelect';
import AnimatedGrid from '@/components/AnimatedGrid';
import CategoryDropdown from '@/components/CategoryDropdown';

const PER_PAGE = 6;

type SearchParams = Promise<{
  series?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
  page?: string;
}>;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const t = await getTranslations('shop');
  const locale = await getLocale();
  const en = locale === 'en';
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? '1', 10));
  const skip = (page - 1) * PER_PAGE;

  const [allSeries, allCategories, totalCount] = await Promise.all([
    prisma.series.findMany({ orderBy: { id: 'asc' } }),
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
    prisma.product.count({ where: { archived: false } }),
  ]);

  const where: Record<string, unknown> = { archived: false };
  if (sp.series) where.series = { slug: sp.series };
  if (sp.category) where.category = { slug: sp.category };
  if (sp.min || sp.max) {
    where.price = {
      ...(sp.min && { gte: parseFloat(sp.min) }),
      ...(sp.max && { lte: parseFloat(sp.max) }),
    };
  }

  const orderBy =
    sp.sort === 'price-asc' ? { price: 'asc' as const } :
    sp.sort === 'price-desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  const [products, filteredCount] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: PER_PAGE,
      include: {
        series: { select: { name: true, slug: true } },
        category: { select: { name: true, nameEn: true, slug: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(filteredCount / PER_PAGE);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (sp.series) params.set('series', sp.series);
    if (sp.category) params.set('category', sp.category);
    if (sp.sort) params.set('sort', sp.sort);
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  }

  function pageNumbers(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  }

  const recommended = await prisma.product.findMany({
    where: { featured: true, archived: false },
    take: 4,
    include: {
      series: { select: { name: true, slug: true } },
      category: { select: { name: true, nameEn: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main style={{ background: '#F5F5F5' }}>
      {/* ── SHOP HERO ── */}
      <section className="shop-hero-apple">
        <div className="shop-hero-apple__wrap">
          <div className="shop-hero-apple__card">
            <div className="shop-hero-apple__bg" />
            <div className="shop-hero-apple__content">
              <h1 className="shop-hero-apple__heading">{t('heroTitle')}</h1>
              <p className="shop-hero-apple__tagline">{t('heroTagline')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOP BODY ── */}
      <div className="shop-outer">
        <div className="shop-layout">
          <Suspense>
            <ShopSidebar
              series={allSeries}
              categories={allCategories}
              totalCount={totalCount}
            />
          </Suspense>

          <div>
            <Suspense>
              <CategoryDropdown series={allSeries} categories={allCategories} />
            </Suspense>

            <div className="grid-topbar">
              <div>
                <div className="grid-topbar__title">{t('furniture')}</div>
                <div className="grid-topbar__count">{t('productsCount', { count: filteredCount })}</div>
              </div>
              <Suspense>
                <SortSelect currentSort={sp.sort} />
              </Suspense>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__title">{t('noResults')}</div>
                <div className="empty-state__sub">{t('tryFilters')}</div>
                <Link href="/shop" className="btn-primary">{t('showAll')}</Link>
              </div>
            ) : (
              <AnimatedGrid animKey={`${sp.category ?? ''}-${sp.series ?? ''}-${page}`}>
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={en ? (p.nameEn || p.name) : p.name}
                      slug={p.slug}
                      price={p.price}
                      originalPrice={p.originalPrice}
                      image={p.image}
                      badge={p.badge}
                      seriesName={p.series.name}
                      categoryName={en ? (p.category.nameEn || p.category.name) : p.category.name}
                      description={en ? (p.descriptionEn || p.description) : p.description}
                      stock={p.stock}
                    />
                  ))}
                </div>
              </AnimatedGrid>
            )}

            {/* ── PAGINATION ── */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination__pages">
                  {pageNumbers().map((n, i) =>
                    n === '…' ? (
                      <span key={`sep-${i}`} className="pagination__sep">…</span>
                    ) : (
                      <Link
                        key={n}
                        href={pageUrl(n)}
                        className={`pagination__page${n === page ? ' active' : ''}`}
                      >
                        {n}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RECOMMENDATIONS ── */}
      {recommended.length > 0 && (
        <section className="reco-section">
          <div className="reco-outer">
            <div className="reco-header">
              <h2 className="reco-title">{t('recommended')}</h2>
              <div className="reco-arrows">
                <button className="reco-arrow" aria-label={t('back')}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button className="reco-arrow" aria-label={t('forward')}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="reco-grid">
              {recommended.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={en ? (p.nameEn || p.name) : p.name}
                  slug={p.slug}
                  price={p.price}
                  originalPrice={p.originalPrice}
                  image={p.image}
                  badge={p.badge}
                  seriesName={p.series.name}
                  categoryName={en ? (p.category.nameEn || p.category.name) : p.category.name}
                  description={en ? (p.descriptionEn || p.description) : p.description}
                  stock={p.stock}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div>
            <h2 className="cta-title">{t('ctaTitle')}</h2>
            <div className="cta-form">
              <input className="cta-input" placeholder={t('ctaEmail')} type="email" />
              <button className="cta-submit">{t('ctaSend')}</button>
            </div>
          </div>
          <div>
            <div className="cta-right-title">{t('ctaRightTitle')}</div>
            <p className="cta-right-text">{t('ctaRightText')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
