import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

// The checkout page is a client component, so its metadata lives in this layout.
export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  return en
    ? { title: 'Checkout — OfficeLabs Co' }
    : { title: 'Поръчка — OfficeLabs Co' };
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
