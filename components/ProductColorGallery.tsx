'use client';
import { useState } from 'react';
import ProductGallery from './ProductGallery';

export type ColorVariant = {
  name: string;
  color: string; // swatch hex
  images: string[];
};

export default function ProductColorGallery({
  variants,
  productName,
}: {
  variants: ColorVariant[];
  productName: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = variants[activeIdx];

  return (
    <div>
      <div className="product-gallery__main">
        <ProductGallery
          key={activeIdx}
          image={active.images[0]}
          images={active.images}
          productName={productName}
        />
      </div>

      {/* Color switcher */}
      <div className="color-switcher">
        <span className="color-switcher__label">Цвят:</span>
        <div className="color-switcher__options">
          {variants.map((v, i) => (
            <button
              key={v.name}
              onClick={() => setActiveIdx(i)}
              className={`color-switcher__btn${i === activeIdx ? ' color-switcher__btn--active' : ''}`}
              title={v.name}
            >
              <span
                className="color-switcher__swatch"
                style={{ background: v.color }}
              />
              {v.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
