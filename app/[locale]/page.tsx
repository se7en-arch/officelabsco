import HomeSlider from '@/components/HomeSlider';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('slides');

  const SLIDES = [
    {
      title: 'Astra',
      subtitle: t('astraSubtitle'),
      bgImage: '/images/hero ASTRA.webp',
      href: '/shop?series=astra',
      btnText: t('exploreBtn'),
    },
    {
      title: 'Loft',
      subtitle: t('loftSubtitle'),
      bgImage: '/images/hero LOFT.webp',
      href: '/shop?series=loft',
      btnText: t('exploreBtn'),
    },
    {
      title: 'Terra',
      subtitle: t('terraSubtitle'),
      bgImage: '/images/hero TERRA.webp',
      href: '/shop?series=terra',
      btnText: t('exploreBtn'),
    },
    {
      title: 'Nova',
      subtitle: t('novaSubtitle'),
      bgImage: '/images/hero NOVA.webp',
      href: '/shop?series=nova',
      btnText: t('exploreBtn'),
    },
  ];

  return <HomeSlider slides={SLIDES} />;
}
