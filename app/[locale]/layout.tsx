import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import '../globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartInitializer from '@/components/CartInitializer';
import UTMCapture from '@/components/UTMCapture';
import PopupHost from '@/components/PopupHost';
import TopBar from '@/components/TopBar';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const en = locale === 'en';
  const title = en ? "OfficeLabs Co – Premium furniture" : "OfficeLabs Co – Премиум мебели";
  const description = en ? "Designer furniture in four series: ASTRA, TERRA, NOVA, LOFT. Desks, tables, cabinets and shelving." : "Авторски мебели в четири серии: ASTRA, TERRA, NOVA, LOFT. Бюра, маси, шкафове, етажерки.";
  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: 'OfficeLabs Co',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'bg' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={inter.variable}>
      <body suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <CartInitializer />
          <UTMCapture />
          <TopBar />
          <Navbar />
          <div className="ol-page-content">{children}</div>
          <Footer />
          <PopupHost />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
