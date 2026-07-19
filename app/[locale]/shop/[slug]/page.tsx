import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import AddToCartButton from '@/components/AddToCartButton';
import BuyNowPayLater from '@/components/BuyNowPayLater';
import ProductCard from '@/components/ProductCard';
import ProductGallery from '@/components/ProductGallery';
import ProductTabs from '@/components/ProductTabs';

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const en = locale === 'en';
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { series: true, category: true },
  });
  if (!product || product.archived) return {};

  const displayName = en ? (product.nameEn || product.name) : product.name;
  const title = `${displayName} | OfficeLabs Co`;
  const description = (en ? product.descriptionEn : null) ?? product.description ?? `${displayName} — ${product.series.name} серия офис мебели`;
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com'}${product.image}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: displayName }],
      type: 'website',
      siteName: 'OfficeLabs Co',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations('product');
  const locale = await getLocale();
  const en = locale === 'en';

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { series: true, category: true },
  });

  if (!product || product.archived) notFound();

  const displayName = en ? (product.nameEn || product.name) : product.name;
  const displayDesc = en ? (product.descriptionEn || product.description) : product.description;
  const displayCategoryName = en ? (product.category.nameEn || product.category.name) : product.category.name;

  const rawReviews = await prisma.review.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: 'asc' },
  });
  const reviews = rawReviews.map(r => ({
    id: r.id,
    name: r.name,
    rating: r.rating,
    text: r.text,
    verified: r.verified,
    createdAt: r.createdAt.toISOString(),
  }));

  const related = await prisma.product.findMany({
    where: {
      seriesId: product.seriesId,
      id: { not: product.id },
      archived: false,
    },
    take: 4,
    include: {
      series: { select: { name: true, slug: true } },
      category: { select: { name: true, nameEn: true, slug: true } },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com';
  const imageUrl = product.image.startsWith('http') ? product.image : `${siteUrl}${product.image}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: imageUrl,
    sku: product.sku ?? undefined,
    brand: { '@type': 'Brand', name: 'OfficeLabs Co' },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/shop/${product.slug}`,
    },
  };

  return (
    <div className="page-wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="breadcrumb">
        <Link href="/">{t('breadHome')}</Link>
        <span className="breadcrumb__sep">/</span>
        <Link href="/shop">{t('breadShop')}</Link>
        <span className="breadcrumb__sep">/</span>
        <Link href={`/shop?series=${product.series.slug}`}>{product.series.name}</Link>
        <span className="breadcrumb__sep">/</span>
        <span style={{ color: 'var(--text)' }}>{displayName}</span>
      </nav>

      <div className="product-detail">
        {/* Gallery */}
        <div className="product-gallery">
          <div className="product-gallery__main">
            <ProductGallery
            image={product.image}
            images={(() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })()}
            productName={displayName}
          />
          </div>
        </div>

        {/* Info */}
        <div className="product-info">
          <h1 className="product-info__name">{displayName}</h1>
          <p className="product-info__price-hint">
            <span className="product-info__price-val">{product.price} €</span>{' '}
            {t('priceHint', { monthly: (product.price / 12).toFixed(2) })}
          </p>
          <AddToCartButton
            stock={product.stock}
            product={{
              id: product.id,
              name: displayName,
              slug: product.slug,
              price: product.price,
              image: product.image,
              seriesName: product.series.name,
              categoryName: displayCategoryName,
            }}
          />
          <BuyNowPayLater price={product.price} />

          <div className="product-specs">
            <div className="product-specs__title">{t('specs')}</div>
            {product.sku && (
              <div className="spec-row">
                <span className="spec-label">{t('sku')}</span>
                <span className="spec-value">{product.sku}</span>
              </div>
            )}
            <div className="spec-row">
              <span className="spec-label">{t('series')}</span>
              <span className="spec-value">{product.series.name}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">{t('category')}</span>
              <span className="spec-value">{displayCategoryName}</span>
            </div>
            <div className="spec-row">
              <span className="spec-label">{t('availability')}</span>
              <span className="spec-value" style={{ color: product.stock === 0 ? '#ef4444' : product.stock <= 3 ? '#D97706' : '#16a34a' }}>
                {product.stock === 0 ? t('outOfStock') : product.stock <= 3 ? t('limitedStock') : t('stockCount', { count: product.stock })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProductTabs
        description={displayDesc}
        seriesName={product.series.name}
        categoryName={displayCategoryName}
        dimensions={product.dimensions}
        weight={product.weight}
        colors={en ? (product.colorsEn || product.colors) : product.colors}
        material={en ? (product.materialEn || product.material) : product.material}
        productId={product.id}
        reviews={reviews}
      />

      {/* Related */}
      {related.length > 0 && (
        <section style={{ paddingBottom: 80 }}>
          <div className="section-header" style={{ marginBottom: 32 }}>
            <div className="section-eyebrow">{t('fromSeries', { series: product.series.name })}</div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>{t('related')}</h2>
          </div>
          <div className="featured-grid">
            {related.map((p) => (
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
                stock={p.stock}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
