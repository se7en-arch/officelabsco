import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

// The cart page is a client component, so its metadata lives in this layout.
export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLocale()) === 'en';
  return en
    ? { title: 'Cart — OfficeLabs Co' }
    : { title: 'Количка — OfficeLabs Co' };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
