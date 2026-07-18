import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from '@/components/admin/LoginForm';

export default async function AdminLoginPage() {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) redirect('/adminpanel/dashboard');

  return <LoginForm />;
}
