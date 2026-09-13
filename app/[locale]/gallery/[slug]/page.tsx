import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

type Feature = {
  image: string;
  headline: string;
  text: string;
};

type SeriesData = {
  tag: string;
  title: string;
  accent: string;
  heroImage: string | null;
  headline: string;
  intro: string[];
  features: Feature[];
};

const series: Record<string, SeriesData> = {
  astra: {
    tag: 'ASTRA СЕРИЯ',
    title: 'ASTRA',
    accent: '#3b82f6',
    heroImage: '/images/gallery-hero-astra.webp',
    headline: 'Минимализъм, който говори с присъствие.',
    intro: [
      'ASTRA е доказателство, че по-малкото наистина може да бъде по-смело. Всяка форма в колекцията е сведена до най-важното — права линия, чист ъгъл, прецизна пропорция — без нищо излишно, което да отвлича вниманието от работата.',
      'Матиран метал, неутрална палитра и кръгли метални дръжки изграждат единен език през бюрото, шкафовете и системите за съхранение. Резултатът е пространство, което изглежда завършено само по себе си — без да се налага усилие.',
    ],
    features: [
      { image: '/products/desk-1.png', headline: 'Работният плот, около който се изгражда всичко', text: 'Бюрото ASTRA носи характера на цялата серия в компактен формат — стабилна конструкция, матирани метални крака и достатъчно плот за монитор, документи и ежедневието на офиса.' },
      { image: '/products/astra-table-angora-1.png', headline: 'Плот, който кани за пауза', text: 'Ниска и геометрична, кафе масата ASTRA пренася същия чист език от бюрото в зоната за почивка — с място за книги и декорация в отвореното отделение под плота.' },
      { image: '/products/low-cab-1.png', headline: 'Съхранение, което не привлича внимание', text: 'Отворени и закрити отделения в едно тяло — за класьори, документи и всичко, което трябва да е под ръка, но не и на показ.' },
      { image: '/products/high-cab-1.png', headline: 'Вертикално съхранение с дисциплина', text: 'Висок, тесен и организиран — шкафът ASTRA поема документи и класьори, без да заема повече под от необходимото.' },
      { image: '/products/astra-container-angora-1.png', headline: 'Мобилност по мярка на бюрото', text: 'На четири колелца, с две отделения — контейнерът ASTRA се придвижва свободно и намира мястото си точно там, където е нужен.' },
      { image: '/products/astra-plant-1.png', headline: 'Зеленото, подредено с мярка', text: 'Компактна конструкция, проектирана да носи растения точно там, където им е мястото — без да пречи на останалото пространство.' },
      { image: '/products/astra-shelf-1.png', headline: 'Вертикално пространство, използвано докрай', text: 'Тясна по форма, но щедра на нива — етажерката ASTRA превръща и най-тесния ъгъл в организирано място за книги и документи.' },
    ],
  },
  terra: {
    tag: 'TERRA СЕРИЯ',
    title: 'TERRA',
    accent: '#7A9E87',
    heroImage: '/images/gallery-hero-terra.webp',
    headline: 'Топлина, която променя начина, по който работиш.',
    intro: [
      'TERRA е отговорът на въпроса какво се случва, когато офисът престане да имитира дом и просто стане такъв. Природни текстури, заоблени форми и мека светлина изграждат пространство, в което работата и почивката не се конкурират.',
      'Дърво в топли тонове, текстил и внимателно заоблени ръбове — всеки детайл в TERRA е избран, за да смекчи усещането за „офис“ и да остави усещане за дом.',
    ],
    features: [
      { image: '/products/terra-desk-eucalypt-1.png', headline: 'Работа, която не крещи, че е работа', text: 'Дървесната текстура и мекият силует превръщат бюрото TERRA в мебел, която би стояла естествено и в дневна.' },
      { image: '/products/terra-coffee-table-eucalypt-1.png', headline: 'Място, където денят забавя ход', text: 'Дървесна текстура и мек силует — кафе масата TERRA кани към пауза, не само към работа.' },
      { image: '/products/terra-low-cab-eucalypt-1.png', headline: 'Ред, поднесен топло', text: 'Отворени рафтове с видима дървесна фактура — съхранение, което не крие материала си, а го показва.' },
      { image: '/products/terra-high-cab-eucalypt-1.png', headline: 'Съхранение с топла височина', text: 'Същата топла текстура, пренесена във височина — високият шкаф TERRA организира, без да губи мекотата на серията.' },
      { image: '/products/terra-container-eucalypt-1.png', headline: 'Малки детайли, голямо значение', text: 'Компактен и подвижен, контейнерът TERRA пази дребните неща подредени, без да заема излишно място.' },
      { image: '/products/terra-plant-eucalypt-1.png', headline: 'Зеленото като част от дизайна', text: 'Проектирана да носи растения не като аксесоар, а като част от самата мебел — TERRA внася природата вътре.' },
      { image: '/products/terra-shelf-eucalypt-1.png', headline: 'Отворени нива, естествена текстура', text: 'Рафтовете на етажерката TERRA излагат дървото на показ — място за книги, предмети и малко зеленина.' },
    ],
  },
  nova: {
    tag: 'NOVA СЕРИЯ',
    title: 'NOVA',
    accent: '#8a6d4f',
    heroImage: '/images/gallery-hero-nova.webp',
    headline: 'Занаят, който устоява на времето.',
    intro: [
      'NOVA е серия за хората, за които историята на един предмет има значение точно толкова, колкото и функцията му. Наситени тонове, автентични текстури и детайли, които издават ръчна изработка в свят на масово производство.',
      'Всяко бюро и всеки шкаф носи характер — леки неравности в текстурата, тежест в материала, усещане за нещо направено с внимание, а не просто сглобено.',
    ],
    features: [
      { image: '/products/nova-desk-diamond-1.png', headline: 'Плот с характер', text: 'Тъмната текстура на бюрото NOVA не крие произхода си — тя го подчертава, с всяка драскотина и жилка на показ.' },
      { image: '/products/nova-coffee-table-diamond-1.png', headline: 'Плот с тежест и история', text: 'Наситеният тон на кафе масата NOVA носи същия занаятчийски характер, пренесен в зоната за почивка.' },
      { image: '/products/nova-low-cab-diamond-1.png', headline: 'Съхранение с тежест и присъствие', text: 'Плътни форми и наситен тон — шкафът NOVA не се опитва да остане незабелязан.' },
      { image: '/products/nova-high-cab-diamond-1.png', headline: 'Присъствие, което не остава незабелязано', text: 'Висок, плътен, категоричен — шкафът NOVA изгражда сериозно вертикално съхранение с характерния тъмен тон на серията.' },
      { image: '/products/nova-container-diamond-1.png', headline: 'Детайл, който издържа', text: 'Мобилен, компактен, изграден да издържи години ежедневна употреба, без да губи характера си.' },
      { image: '/products/nova-plant-diamond-1.png', headline: 'Природа с наситен характер', text: 'Дори зеленината в NOVA стои с тежест — стойката за саксии допълва тъмната палитра на серията.' },
      { image: '/products/nova-shelf-diamond-1.png', headline: 'Витрина за нещата, които имат значение', text: 'Отворените нива на етажерката NOVA са място, което кани — за книги, предмети, история.' },
    ],
  },
  loft: {
    tag: 'LOFT СЕРИЯ',
    title: 'LOFT',
    accent: '#2D5A45',
    heroImage: '/images/gallery-hero-loft.webp',
    headline: 'Автентичност вместо перфекция.',
    intro: [
      'LOFT не крие материалите си — показва ги. Суров метал и масивно дърво се срещат в контраст, който не се извинява за характера си. Това е серия за пространства, в които индустриалният дух е част от идентичността, не компромис.',
      'Открити конструкции, категорични линии и тъмна, наситена палитра — всеки елемент на LOFT заявява присъствие, без да се опитва да се впише незабелязано.',
    ],
    features: [
      { image: '/products/loft-desk-deep-green-1.png', headline: 'Конструкция, изложена на показ', text: 'Металната рамка на бюрото LOFT не е скрита зад фасада — тя е част от визията.' },
      { image: '/products/loft-coffee-table-deep-green-1.png', headline: 'Плот, който не крие конструкцията си', text: 'Металната рамка на кафе масата LOFT остава на показ — практична повърхност с категоричен индустриален характер.' },
      { image: '/products/loft-low-cab-deep-green-1.png', headline: 'Тегло, което внушава стабилност', text: 'Плътен корпус с индустриален финиш — шкафът LOFT изглежда толкова здрав, колкото е в действителност.' },
      { image: '/products/loft-high-cab-deep-green-1.png', headline: 'Височина с индустриален характер', text: 'Плътен корпус и категорична визия — високият шкаф LOFT организира пространството, без да омекотява тона на серията.' },
      { image: '/products/loft-container-deep-green-1.png', headline: 'Практичност без компромис във визията', text: 'Мобилен контейнер, който пази характера на серията дори в най-малката си форма.' },
      { image: '/products/loft-plant-deep-green-1.png', headline: 'Зеленото, поставено в суров контекст', text: 'Дори растенията в LOFT намират място в категорична, индустриална конструкция.' },
      { image: '/products/loft-shelf-deep-green-1.png', headline: 'Отворени нива, категорична визия', text: 'Тръбна конструкция и открити рафтове — етажерката LOFT превръща съхранението в акцент, не в компромис.' },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = series[slug];
  if (!s) return {};
  return { title: `${s.tag} | OfficeLabs Co` };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const s = series[slug];
  if (!s) notFound();

  return (
    <main className="series-page">
      <div className="page-wrap">

        {/* ── Hero: 16:9, real photo to be swapped in later ── */}
        <div className="series-hero">
          {s.heroImage ? (
            <Image src={s.heroImage} alt={s.title} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="series-hero__placeholder" style={{ background: `linear-gradient(135deg, ${s.accent}14, ${s.accent}05)` }}>
              <span className="series-hero__word" style={{ color: s.accent }}>{s.title}</span>
            </div>
          )}
        </div>

        {/* ── Intro ── */}
        <div className="series-intro">
          <p className="section-eyebrow" style={{ color: s.accent }}>{s.tag}</p>
          <h1 className="series-intro__title">{s.headline}</h1>
          {s.intro.map((p, i) => (
            <p key={i} className="series-intro__p">{p}</p>
          ))}
        </div>

        {/* ── Feature accents ── */}
        <div className="series-features">
          {s.features.map((f, i) => (
            <div key={i} className={`series-feature${i % 2 === 1 ? ' series-feature--reverse' : ''}`}>
              <div className="series-feature__media">
                <Image
                  src={f.image}
                  alt={f.headline}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
              <div className="series-feature__text">
                <h2 className="series-feature__headline">{f.headline}</h2>
                <p className="series-feature__body">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

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
