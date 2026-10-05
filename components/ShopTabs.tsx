'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Series = { id: number; name: string; slug: string };

export default function ShopTabs({ series }: { series: Series[] }) {
  const t = useTranslations('ui');
  const searchParams = useSearchParams();
  const active = searchParams.get('series') ?? '';

  const makeHref = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('series', slug); else params.delete('series');
    params.delete('category');
    return `/shop${params.size ? `?${params}` : ''}`;
  };

  return (
    <nav className="shop-tabs" aria-label={t('seriesNav')}>
      <Link href="/shop" className={`shop-tab${!active ? ' active' : ''}`}>
        {t('allSeries')}
      </Link>
      {series.map((s) => (
        <Link
          key={s.id}
          href={makeHref(s.slug)}
          className={`shop-tab${active === s.slug ? ' active' : ''}`}
        >
          {s.name}
        </Link>
      ))}
    </nav>
  );
}
