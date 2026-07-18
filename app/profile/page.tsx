import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfilePage from '@/components/profile/ProfilePage';

export const metadata: Metadata = {
  title: 'Моят профил – FairSpace',
};

export default function ProfileRoute() {
  return (
    <>
      <Header />
      <ProfilePage />
      <Footer />
    </>
  );
}
