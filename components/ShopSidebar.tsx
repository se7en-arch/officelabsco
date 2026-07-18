'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

type Series = { id: number; name: string; slug: string; color: string };
type Category = { id: number; name: string; nameEn?: string | null; slug: string };

type Props = {
  series: Series[];
  categories: Category[];
  totalCount: number;
};

export default function ShopSidebar({ series, categories, totalCount }: Props) {
  const t = useTranslations('shop');
  const locale = useLocale();
  const dn = (name: string, nameEn?: string | null) => locale === 'en' ? (nameEn || name) : name;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSeries = searchParams.get('series') ?? '';
  const activeCategory = searchParams.get('category') ?? '';

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function toggleSeries(slug: string) { update('series', activeSeries === slug ? '' : slug); }
  function toggleCategory(slug: string) { update('category', activeCategory === slug ? '' : slug); }
  function clearAll() { router.push(pathname, { scroll: false }); }

  const hasFilters = activeSeries || activeCategory;
  const isAll = !activeSeries && !activeCategory;

  return (
    <aside className="sidebar">
      <div className="sidebar__heading">{t('category')}</div>

      <div className={`cat-all${isAll ? ' active' : ''}`} onClick={clearAll}>
        <span className="cat-all__left">{t('allProducts')}</span>
        <span className="cat-all__badge">{totalCount}</span>
      </div>

      {categories.map((c) => (
        <div
          key={c.id}
          className={`cat-item${activeCategory === c.slug ? ' active' : ''}`}
          onClick={() => toggleCategory(c.slug)}
        >
          {dn(c.name, c.nameEn)}
        </div>
      ))}

      <div className="sidebar__divider" />

      <div className="sidebar__heading">{t('collections')}</div>

      {series.map((s) => (
        <div
          key={s.id}
          className={`cat-item${activeSeries === s.slug ? ' active' : ''}`}
          onClick={() => toggleSeries(s.slug)}
        >
          {s.name}
        </div>
      ))}

    </aside>
  );
}
