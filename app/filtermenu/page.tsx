import type { Metadata } from 'next';
import Header from '@/components/Header';
import FilterMenuPage from '@/components/filtermenu/FilterMenuPage';

export const metadata: Metadata = {
  title: 'Filter Menu Demo – FairSpace',
};

export default function FilterMenuRoute() {
  return (
    <>
      <Header />
      <FilterMenuPage />
    </>
  );
}
