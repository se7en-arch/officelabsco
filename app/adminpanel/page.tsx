import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from '@/components/admin/LoginForm';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    const { next } = await searchParams;
    redirect(next && next.startsWith('/') && !next.startsWith('//') ? next : '/adminpanel/dashboard');
  }

  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
