'use client';
import { useState, useEffect } from 'react';
import type { ColorVariant } from './ProductColorGallery';

// Mirrors the colour switcher's own default (index 0) so the price shown
// before any click matches what Add to Cart would actually charge.
export default function ProductPrice({ basePrice, variants }: {
  basePrice: number;
  variants?: ColorVariant[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (!variants) return;
    function onVariantChange(e: Event) {
      setActiveIdx((e as CustomEvent<number>).detail);
    }
    window.addEventListener('colorVariantChange', onVariantChange);
    return () => window.removeEventListener('colorVariantChange', onVariantChange);
  }, [variants]);

  const price = variants?.[activeIdx]?.price ?? basePrice;

  return <span className="product-info__price-val">{price} €</span>;
}
