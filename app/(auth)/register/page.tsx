import type { Metadata } from 'next';
import AuthView from '@/components/auth/AuthView';

export const metadata: Metadata = {
  title: 'Регистрация – FairSpace',
};

export default function RegisterPage() {
  return <AuthView mode="register" />;
}
