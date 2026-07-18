'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SortSelect({ currentSort }: { currentSort?: string }) {
  const t = useTranslations('shop');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      className="sort-select"
      value={currentSort ?? 'newest'}
      onChange={handleChange}
    >
      <option value="newest">{t('sortNewest')}</option>
      <option value="price-asc">{t('sortPriceAsc')}</option>
      <option value="price-desc">{t('sortPriceDesc')}</option>
    </select>
  );
}
