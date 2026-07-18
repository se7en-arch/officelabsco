import type { ReactNode } from 'react';
import './admin.css';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bg">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
