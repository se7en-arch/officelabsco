import type { Metadata } from 'next';
import AuthView from '@/components/auth/AuthView';

export const metadata: Metadata = {
  title: 'Вход – FairSpace',
};

export default function LoginPage() {
  return <AuthView mode="login" />;
}
