'use client';
import { useEffect } from 'react';
import { useCart } from '@/lib/cart-store';

export default function CartInitializer() {
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);
  return null;
}
