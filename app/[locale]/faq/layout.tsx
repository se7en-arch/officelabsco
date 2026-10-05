import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// The FAQ page is a client component, so its metadata lives in this layout.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq');
  return { title: t('meta'), description: t('metaDesc') };
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
