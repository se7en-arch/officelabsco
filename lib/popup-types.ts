// Client-safe shared types/constants for the admin-managed popups.
export const POPUP_TYPES = ['bundle', 'promo', 'email', 'bar'] as const;
export const POPUP_PAGES = ['shop', 'home', 'all'] as const;
export const POPUP_FREQUENCIES = ['always', 'days', 'session'] as const;

export type PopupType = (typeof POPUP_TYPES)[number];
export type PopupPages = (typeof POPUP_PAGES)[number];
export type PopupFrequency = (typeof POPUP_FREQUENCIES)[number];

// What the storefront receives from /api/popups/active (already localized).
export type PopupPublic = {
  id: number;
  type: PopupType;
  version: number;
  frequency: PopupFrequency;
  frequencyDays: number;
  delaySeconds: number;
  accent: string;
  title: string;
  text: string;
  image: string | null;
  ctaLabel: string;
  ctaLink: string;
  promoCode: string | null;
  discountPercent: number | null;
  endsAt: string | null;
  showCountdown: boolean;
};

// Full row as the admin panel sees/edits it.
export type PopupAdmin = {
  id: number;
  name: string;
  type: PopupType;
  active: boolean;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  pages: PopupPages;
  frequency: PopupFrequency;
  frequencyDays: number;
  delaySeconds: number;
  title: string | null;
  titleEn: string | null;
  text: string | null;
  textEn: string | null;
  image: string | null;
  ctaLabel: string | null;
  ctaLabelEn: string | null;
  ctaLink: string | null;
  promoCode: string | null;
  accent: string;
  showCountdown: boolean;
  version: number;
};

// Aggregated numbers shown next to each popup in the admin list.
export type PopupStats = {
  views: number;
  clicks: number;
  closes: number;
  signups: number;
  orders: number;
  revenue: number;
  last14: number[]; // views per day, oldest -> newest
};
