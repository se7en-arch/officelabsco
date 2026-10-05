import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

// The contact page is a client component (form state), so its metadata lives in this layout.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact');
  return { title: t('meta'), description: t('metaDesc') };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
