import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <>
      {/* ── Desktop-only block ── */}
      <div className="admin-mobile-block">
        <div className="admin-mobile-block__box">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <h1>Само десктоп</h1>
          <p>Административният панел е достъпен единствено от компютър. Моля, отворете го от десктоп браузър.</p>
        </div>
      </div>

      {/* ── Normal desktop layout ── */}
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
