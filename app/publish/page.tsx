import type { Metadata } from 'next';
import Header from '@/components/Header';
import PublishPage from '@/components/publish/PublishPage';

export const metadata: Metadata = {
  title: 'Публикувай обява – FairSpace',
};

export default function PublishRoute() {
  return (
    <>
      <Header />
      <PublishPage />
    </>
  );
}
