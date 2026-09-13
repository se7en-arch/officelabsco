'use client';
import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/lib/cart-store';
import { useTranslations } from 'next-intl';

type Props = {
  product: Omit<CartItem, 'quantity' | 'selectedColor'>;
  stock?: number;
  variants?: { name: string; color: string }[];
};

// Made-to-order: every product is produced and delivered after the order is
// placed, so purchasing is never gated on `stock` — that field is kept only
// for the admin panel's own optional record-keeping.
export default function AddToCartButton({ product, variants }: Props) {
  const t = useTranslations('product');
  const addItem = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    variants?.[0]?.name
  );

  useEffect(() => {
    if (!variants) return;
    function onVariantChange(e: Event) {
      const idx = (e as CustomEvent<number>).detail;
      setSelectedColor(variants![idx]?.name);
    }
    window.addEventListener('colorVariantChange', onVariantChange);
    return () => window.removeEventListener('colorVariantChange', onVariantChange);
  }, [variants]);

  function handleAdd() {
    for (let i = 0; i < qty; i++) addItem({ ...product, selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      <div className="qty-row">
        <div className="qty">
          <button className="qty__btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="qty__val">{qty}</span>
          <button className="qty__btn" onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
        </div>
        <button className="btn-add-cart" onClick={handleAdd}>
          {added ? t('added') : t('addToCart')}
        </button>
      </div>
    </div>
  );
}
