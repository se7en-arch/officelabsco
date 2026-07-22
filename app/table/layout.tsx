import type { ReactNode } from 'react';

export default function TableLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg">
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
