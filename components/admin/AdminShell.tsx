import type { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';
import { prisma } from '@/lib/prisma';

export default async function AdminShell({ children }: { children: ReactNode }) {
  const [newCustomerOrders, newDealerOrders, pendingDealers] = await Promise.all([
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.dealerOrder.count({ where: { status: 'new' } }),
    prisma.dealer.count({ where: { status: 'PENDING' } }),
  ]);
  const newOrders = newCustomerOrders + newDealerOrders;

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
        <AdminSidebar newOrders={newOrders} pendingDealers={pendingDealers} />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
