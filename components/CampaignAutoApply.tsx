'use client';
import { useEffect } from 'react';
import { useCart } from '@/lib/cart-store';

// Auto-applies the running campaign's discount (e.g. Black Friday) to the
// cart for the whole time its popup is scheduled to run — no need for the
// visitor to see the popup or type the code themselves. Never replaces a
// promo code the visitor already has applied.
export default function CampaignAutoApply() {
  useEffect(() => {
    let cancelled = false;

    function applyIfNeeded() {
      if (cancelled || useCart.getState().promoCode) return;
      fetch('/api/campaign/active')
        .then((r) => r.json())
        .then((data: { code: string | null; discountPercent: number }) => {
          if (cancelled || !data.code || useCart.getState().promoCode) return;
          useCart.getState().setPromo(data.code, data.discountPercent);
        })
        .catch(() => {});
    }

    if (useCart.persist.hasHydrated()) {
      applyIfNeeded();
      return () => { cancelled = true; };
    }
    const unsub = useCart.persist.onFinishHydration(applyIfNeeded);
    return () => { cancelled = true; unsub(); };
  }, []);

  return null;
}
