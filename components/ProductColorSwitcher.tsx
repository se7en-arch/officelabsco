'use client';
import { useState } from 'react';
import type { ColorVariant } from './ProductColorGallery';

export default function ProductColorSwitcher({ variants }: { variants: ColorVariant[] }) {
  const [activeIdx, setActiveIdx] = useState(0);

  function select(i: number) {
    setActiveIdx(i);
    window.dispatchEvent(new CustomEvent('colorVariantChange', { detail: i }));
  }

  return (
    <div className="color-switcher">
      <span className="color-switcher__label">Цвят:</span>
      <div className="color-switcher__options">
        {variants.map((v, i) => (
          <button
            key={v.name}
            onClick={() => select(i)}
            className={`color-switcher__btn${i === activeIdx ? ' color-switcher__btn--active' : ''}`}
            title={v.name}
          >
            <span className="color-switcher__swatch" style={{ background: v.color }} />
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
}
