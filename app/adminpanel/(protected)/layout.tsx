import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import AdminShell from '@/components/admin/AdminShell';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect('/adminpanel');

  return <AdminShell>{children}</AdminShell>;
}
