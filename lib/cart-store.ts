'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  seriesName: string;
  categoryName: string;
  quantity: number;
  slug: string;
  selectedColor?: string;
};

type CartStore = {
  items: CartItem[];
  promoCode: string | null;
  discountPercent: number;
  // Product ids that make up the currently-applied bundle discount (empty
  // for a regular, non-bundle promo code). Removing any of these items
  // drops the promo — the discount is only valid while the full set is
  // still in the cart.
  bundleProductIds: number[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, quantity: number) => void;
  clear: () => void;
  setPromo: (code: string, discountPercent: number, bundleProductIds?: number[]) => void;
  clearPromo: () => void;
  total: () => number;
  // Euro amount the current promo actually knocks off. For a bundle promo
  // (bundleProductIds non-empty) only those line items count toward it —
  // everything else in the cart stays at full price. For a regular,
  // non-bundle code it's the usual flat percentage of the whole cart.
  discountAmount: () => number;
  discountedTotal: () => number;
  count: () => number;
};

type PromoState = { promoCode: string | null; discountPercent: number; bundleProductIds: number[] };
const CLEARED_PROMO: PromoState = { promoCode: null, discountPercent: 0, bundleProductIds: [] };

// If the item being removed belongs to the active bundle, the discount no
// longer applies — drop the promo along with it.
function dropBundlePromoIfNeeded(state: PromoState, removedId: number): Partial<PromoState> {
  return state.bundleProductIds.includes(removedId) ? CLEARED_PROMO : {};
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discountPercent: 0,
      bundleProductIds: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.id === item.id && i.selectedColor === item.selectedColor
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id && i.selectedColor === item.selectedColor
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          ...dropBundlePromoIfNeeded(state, id),
        })),

      updateQty: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.id !== id),
              ...dropBundlePromoIfNeeded(state, id),
            };
          }
          return { items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)) };
        }),

      clear: () => set({ items: [], promoCode: null, discountPercent: 0, bundleProductIds: [] }),

      setPromo: (code, discountPercent, bundleProductIds = []) =>
        set({ promoCode: code, discountPercent, bundleProductIds }),

      clearPromo: () => set({ promoCode: null, discountPercent: 0, bundleProductIds: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      discountAmount: () => {
        const { items, discountPercent, bundleProductIds } = get();
        if (discountPercent <= 0) return 0;
        const bundleSet = new Set(bundleProductIds);
        const discountBase = bundleSet.size > 0
          ? items.filter((i) => bundleSet.has(i.id)).reduce((sum, i) => sum + i.price * i.quantity, 0)
          : items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return +(discountBase * discountPercent / 100).toFixed(2);
      },

      discountedTotal: () => {
        const raw = get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        return +(raw - get().discountAmount()).toFixed(2);
      },

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'officelabsco-cart', skipHydration: true }
  )
);
