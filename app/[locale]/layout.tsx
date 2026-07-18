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

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '.office labs – Премиум мебели',
  description: 'Авторски мебели в четири серии: ASTRA, TERRA, NOVA, LOFT. Бюра, маси, шкафове, етажерки.',
};

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
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
