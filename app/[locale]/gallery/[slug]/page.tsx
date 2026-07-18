import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import GalleryLightbox from '@/components/GalleryLightbox';

type GalleryData = {
  tag:      string;
  title:    string;
  subtitle: string;
  images:   string[];
};

function makeImages(slug: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/gallery/${slug}/${slug}-${i + 1}.webp`);
}

const galleries: Record<string, GalleryData> = {
  nova: {
    tag:      'NOVA СЕРИЯ',
    title:    'NOVA',
    subtitle: 'Проектирана за хора, на които работното пространство казва нещо за тях.\nЧисти форми, умишлени детайли, интериор с характер.',
    images:   makeImages('nova', 8),
  },
  astra: {
    tag:      'ASTRA СЕРИЯ',
    title:    'ASTRA',
    subtitle: 'За интериори, в които мащабът има значение и всяка мебел носи присъствие.\nASTRA задава тона на корпоративното пространство.',
    images:   makeImages('astra', 11),
  },
  terra: {
    tag:      'TERRA СЕРИЯ',
    title:    'TERRA',
    subtitle: 'Топлота в детайла, ред в пространството, естествена светлина като съдизайнер.\nTERRA се вписва там, където материалът има значение.',
    images:   makeImages('terra', 11),
  },
  loft: {
    tag:      'LOFT СЕРИЯ',
    title:    'LOFT',
    subtitle: 'Сурови материали, обработени с прецизност и усет за пропорция.\nЗа офиси, в които автентичността е по-важна от перфекцията.',
    images:   makeImages('loft', 10),
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = galleries[slug];
  if (!g) return {};
  return { title: `${g.tag} — Галерия | .office labs` };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const g = galleries[slug];
  if (!g) notFound();

  return (
    <main className="gal-page">
      <div className="page-wrap">

        {/* ── Header ── */}
        <div className="gal-header">
          <h1 className="gal-title">{g.title}</h1>
          <p className="gal-subtitle">
            {g.subtitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>

        {/* ── Grid + Lightbox (client) ── */}
        <GalleryLightbox images={g.images} tag={g.tag} />

        {/* ── Footer CTA ── */}
        <div className="gal-footer">
          <Link href="/about" className="gal-back-btn">
            ← Назад към сериите
          </Link>
          <Link href={`/shop?series=${slug}`} className="gal-shop-btn">
            Разгледай продуктите →
          </Link>
        </div>

      </div>
    </main>
  );
}
