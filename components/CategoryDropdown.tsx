'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

type Series   = { id: number; name: string; nameEn?: string | null; slug: string };
type Category = { id: number; name: string; nameEn?: string | null; slug: string };

type Props = {
  series: Series[];
  categories: Category[];
};

export default function CategoryDropdown({ series, categories }: Props) {
  const t = useTranslations('shop');
  const locale = useLocale();
  const dn = (name: string, nameEn?: string | null) => locale === 'en' ? (nameEn || name) : name;
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeCategory = searchParams.get('category') ?? '';
  const activeSeries   = searchParams.get('series')   ?? '';

  const activecat = categories.find(c => c.slug === activeCategory);
  const activeseries = series.find(s => s.slug === activeSeries);
  const label =
    (activecat ? dn(activecat.name, activecat.nameEn) : null) ??
    (activeseries ? dn(activeseries.name, activeseries.nameEn) : null) ??
    t('allProducts');

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (key === 'category') { params.delete('series');   }
    if (key === 'series')   { params.delete('category'); }
    if (value) params.set(key, value); else { params.delete('category'); params.delete('series'); }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  }

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="cat-dropdown" ref={ref}>
      <button className="cat-dropdown__btn" onClick={() => setOpen(o => !o)}>
        <span>{label}</span>
        <svg
          width="14" height="14" viewBox="0 0 16 16" fill="none"
          stroke="currentColor" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="cat-dropdown__panel">
          {/* All */}
          <div
            className={`cat-dropdown__item${!activeCategory && !activeSeries ? ' active' : ''}`}
            onClick={() => navigate('', '')}
          >
            {t('allProducts')}
          </div>

          {/* Categories */}
          <div className="cat-dropdown__section">{t('category')}</div>
          {categories.map(c => (
            <div
              key={c.id}
              className={`cat-dropdown__item${activeCategory === c.slug ? ' active' : ''}`}
              onClick={() => navigate('category', c.slug)}
            >
              {dn(c.name, c.nameEn)}
            </div>
          ))}

          {/* Series */}
          <div className="cat-dropdown__section">{t('collections')}</div>
          {series.map(s => (
            <div
              key={s.id}
              className={`cat-dropdown__item${activeSeries === s.slug ? ' active' : ''}`}
              onClick={() => navigate('series', s.slug)}
            >
              {dn(s.name, s.nameEn)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
