'use client';
import { useState, useEffect } from 'react';
import ProductGallery from './ProductGallery';

export type ColorVariant = {
  name: string;
  color: string;
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

  useEffect(() => {
    function onVariantChange(e: Event) {
      setActiveIdx((e as CustomEvent<number>).detail);
    }
    window.addEventListener('colorVariantChange', onVariantChange);
    return () => window.removeEventListener('colorVariantChange', onVariantChange);
  }, []);

  const active = variants[activeIdx];

  return (
    <div className="product-gallery__main">
      <ProductGallery
        key={activeIdx}
        image={active.images[0]}
        images={active.images}
        productName={productName}
      />
    </div>
  );
}
