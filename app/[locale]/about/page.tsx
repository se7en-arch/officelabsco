import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'За нас — .office labs',
  description: 'Авторски мебели, създадени с убеждението, че средата, в която работиш, определя кой ставаш.',
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  const beliefs = [
    { num: '01', title: t('belief1Title'), text: t('belief1Text') },
    { num: '02', title: t('belief2Title'), text: t('belief2Text') },
    { num: '03', title: t('belief3Title'), text: t('belief3Text') },
  ];

  const seriesList = [
    { slug: 'astra', name: 'ASTRA', image: '/images/about-astra.jpg', headline: t('astraHeadline'), text: t('astraText') },
    { slug: 'terra', name: 'TERRA', image: '/images/about-terra.jpg', headline: t('terraHeadline'), text: t('terraText') },
    { slug: 'nova',  name: 'NOVA',  image: '/images/about-nova.jpg',  headline: t('novaHeadline'),  text: t('novaText') },
    { slug: 'loft',  name: 'LOFT',  image: '/images/about-loft.jpg',  headline: t('loftHeadline'),  text: t('loftText') },
  ];

  return (
    <>
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__bg-img" />
        <div className="about-hero__inner page-wrap">
          <p className="about-hero__eyebrow">{t('heroEyebrow')}</p>
          <h1 className="about-hero__title">
            {t('heroTitle').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="about-hero__sub">
            {t('heroSub').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br className="about-hero__br" />}</span>
            ))}
          </p>
          <div className="about-hero__divider" />
          <p className="about-hero__note">{t('heroNote')}</p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="about-story">
        <div className="page-wrap">
          <div className="about-story__grid">
            <div className="about-story__left">
              <p className="section-eyebrow">{t('storyEyebrow')}</p>
              <h2 className="about-story__title">
                {t('storyTitle').split('\n').map((line, i, arr) => (
                  <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                ))}
              </h2>
            </div>
            <div className="about-story__right">
              <p><strong>.office labs</strong> {t('storyP1').replace('.office labs ', '')}</p>
              <p>{t('storyP2')}</p>
              <p>{t('storyP3')}</p>
            </div>
          </div>

          <div className="about-numbers">
            <div className="about-number">
              <span className="about-number__val">4</span>
              <span className="about-number__label">{t('statSeries')}</span>
            </div>
            <div className="about-number">
              <span className="about-number__val">24+</span>
              <span className="about-number__label">{t('statModels')}</span>
            </div>
            <div className="about-number">
              <span className="about-number__val">8</span>
              <span className="about-number__label">{t('statCategories')}</span>
            </div>
            <div className="about-number">
              <span className="about-number__val">100%</span>
              <span className="about-number__label">{t('statDesign')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── BELIEFS ── */}
      <section className="about-beliefs">
        <div className="about-beliefs__bg-img" />
        <div className="page-wrap">
          <div className="section-header" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto 48px', position: 'relative', zIndex: 1 }}>
            <p className="section-eyebrow">{t('beliefsEyebrow')}</p>
            <h2 className="section-title">{t('beliefsTitle')}</h2>
          </div>
          <div className="about-beliefs__grid">
            {beliefs.map((b) => (
              <div key={b.num} className="about-belief">
                <span className="about-belief__num">{b.num}</span>
                <h3 className="about-belief__title">{b.title}</h3>
                <p className="about-belief__text">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERIES ── */}
      <section className="about-series-sec">
        <div className="page-wrap">
          <div className="section-header" style={{ marginBottom: 40 }}>
            <p className="section-eyebrow">{t('collEyebrow')}</p>
            <h2 className="section-title">
              {t('collTitle').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="section-sub">{t('collSub')}</p>
          </div>
          <div className="about-series-grid">
            {seriesList.map((s) => (
              <Link key={s.slug} href={`/gallery/${s.slug}`} className="about-series-card">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  className="about-series-card__img"
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 25vw"
                />
                <div className="about-series-card__overlay" />
                <div className="about-series-card__body">
                  <span className="about-series-card__tag">{s.name}</span>
                  <h3 className="about-series-card__title">{s.headline}</h3>
                  <p className="about-series-card__text">{s.text}</p>
                  <span className="about-series-card__link">{t('exploreSeries')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="about-cta__bg-img" />
        <div className="page-wrap">
          <div className="about-cta__inner">
            <p className="section-eyebrow">{t('ctaEyebrow')}</p>
            <h2 className="about-cta__title">
              {t('ctaTitle').split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="about-cta__text">{t('ctaText')}</p>
            <div className="about-cta__actions">
              <Link href="/shop" className="about-cta__btn-primary">
                {t('ctaBtn')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
