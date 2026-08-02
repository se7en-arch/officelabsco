import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg" className={inter.className}>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
