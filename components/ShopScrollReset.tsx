'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function ShopScrollReset() {
  const params   = useSearchParams();
  const page     = params.get('page') ?? '1';
  const ready    = useRef(false);

  useEffect(() => {
    if (!ready.current) { ready.current = true; return; }
    const el = document.getElementById('shop-products');
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80; // 80px = navbar
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }, [page]);

  return null;
}
