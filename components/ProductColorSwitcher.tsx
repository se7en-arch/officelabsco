'use client';
import { useState } from 'react';
import type { ColorVariant } from './ProductColorGallery';
import { useLocale, useTranslations } from 'next-intl';
import { colourLabel } from '@/lib/i18n-labels';

export default function ProductColorSwitcher({ variants }: { variants: ColorVariant[] }) {
  const t = useTranslations('ui');
  const locale = useLocale();
  const [activeIdx, setActiveIdx] = useState(0);

  function select(i: number) {
    setActiveIdx(i);
    window.dispatchEvent(new CustomEvent('colorVariantChange', { detail: i }));
  }

  return (
    <div className="color-switcher">
      <span className="color-switcher__label">{t('colorLabel')}</span>
      <div className="color-switcher__options">
        {variants.map((v, i) => (
          <button
            key={v.name}
            onClick={() => select(i)}
            className={`color-switcher__btn${i === activeIdx ? ' color-switcher__btn--active' : ''}`}
            title={colourLabel(v.name, locale)}
          >
            <span className="color-switcher__swatch" style={{ background: v.color }} />
            {colourLabel(v.name, locale)}
          </button>
        ))}
      </div>
    </div>
  );
}
