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

const seriesBg: Record<string, SeriesData> = {
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
      { image: '/products/desk-1.webp', headline: 'Работният плот, около който се изгражда всичко', text: 'Бюрото ASTRA носи характера на цялата серия в компактен формат — стабилна конструкция, матирани метални крака и достатъчно плот за монитор, документи и ежедневието на офиса.' },
      { image: '/products/astra-table-angora-1.webp', headline: 'Плот, който кани за пауза', text: 'Ниска и геометрична, кафе масата ASTRA пренася същия чист език от бюрото в зоната за почивка — с място за книги и декорация в отвореното отделение под плота.' },
      { image: '/products/low-cab-1.webp', headline: 'Съхранение, което не привлича внимание', text: 'Отворени и закрити отделения в едно тяло — за класьори, документи и всичко, което трябва да е под ръка, но не и на показ.' },
      { image: '/products/high-cab-1.webp', headline: 'Вертикално съхранение с дисциплина', text: 'Висок, тесен и организиран — шкафът ASTRA поема документи и класьори, без да заема повече под от необходимото.' },
      { image: '/products/astra-container-angora-1.webp', headline: 'Мобилност по мярка на бюрото', text: 'На четири колелца, с две отделения — контейнерът ASTRA се придвижва свободно и намира мястото си точно там, където е нужен.' },
      { image: '/products/astra-plant-1.webp', headline: 'Зеленото, подредено с мярка', text: 'Компактна конструкция, проектирана да носи растения точно там, където им е мястото — без да пречи на останалото пространство.' },
      { image: '/products/astra-shelf-1.webp', headline: 'Вертикално пространство, използвано докрай', text: 'Тясна по форма, но щедра на нива — етажерката ASTRA превръща и най-тесния ъгъл в организирано място за книги и документи.' },
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
      { image: '/products/terra-desk-eucalypt-1.webp', headline: 'Работа, която не крещи, че е работа', text: 'Дървесната текстура и мекият силует превръщат бюрото TERRA в мебел, която би стояла естествено и в дневна.' },
      { image: '/products/terra-coffee-table-eucalypt-1.webp', headline: 'Място, където денят забавя ход', text: 'Дървесна текстура и мек силует — кафе масата TERRA кани към пауза, не само към работа.' },
      { image: '/products/terra-low-cab-eucalypt-1.webp', headline: 'Ред, поднесен топло', text: 'Отворени рафтове с видима дървесна фактура — съхранение, което не крие материала си, а го показва.' },
      { image: '/products/terra-high-cab-eucalypt-1.webp', headline: 'Съхранение с топла височина', text: 'Същата топла текстура, пренесена във височина — високият шкаф TERRA организира, без да губи мекотата на серията.' },
      { image: '/products/terra-container-eucalypt-1.webp', headline: 'Малки детайли, голямо значение', text: 'Компактен и подвижен, контейнерът TERRA пази дребните неща подредени, без да заема излишно място.' },
      { image: '/products/terra-plant-eucalypt-1.webp', headline: 'Зеленото като част от дизайна', text: 'Проектирана да носи растения не като аксесоар, а като част от самата мебел — TERRA внася природата вътре.' },
      { image: '/products/terra-shelf-eucalypt-1.webp', headline: 'Отворени нива, естествена текстура', text: 'Рафтовете на етажерката TERRA излагат дървото на показ — място за книги, предмети и малко зеленина.' },
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
      { image: '/products/nova-desk-diamond-1.webp', headline: 'Плот с характер', text: 'Тъмната текстура на бюрото NOVA не крие произхода си — тя го подчертава, с всяка драскотина и жилка на показ.' },
      { image: '/products/nova-coffee-table-diamond-1.webp', headline: 'Плот с тежест и история', text: 'Наситеният тон на кафе масата NOVA носи същия занаятчийски характер, пренесен в зоната за почивка.' },
      { image: '/products/nova-low-cab-diamond-1.webp', headline: 'Съхранение с тежест и присъствие', text: 'Плътни форми и наситен тон — шкафът NOVA не се опитва да остане незабелязан.' },
      { image: '/products/nova-high-cab-diamond-1.webp', headline: 'Присъствие, което не остава незабелязано', text: 'Висок, плътен, категоричен — шкафът NOVA изгражда сериозно вертикално съхранение с характерния тъмен тон на серията.' },
      { image: '/products/nova-container-diamond-1.webp', headline: 'Детайл, който издържа', text: 'Мобилен, компактен, изграден да издържи години ежедневна употреба, без да губи характера си.' },
      { image: '/products/nova-plant-diamond-1.webp', headline: 'Природа с наситен характер', text: 'Дори зеленината в NOVA стои с тежест — стойката за саксии допълва тъмната палитра на серията.' },
      { image: '/products/nova-shelf-diamond-1.webp', headline: 'Витрина за нещата, които имат значение', text: 'Отворените нива на етажерката NOVA са място, което кани — за книги, предмети, история.' },
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
      { image: '/products/loft-desk-black-1.webp', headline: 'Конструкция, изложена на показ', text: 'Металната рамка на бюрото LOFT не е скрита зад фасада — тя е част от визията.' },
      { image: '/products/loft-coffee-table-black-1.webp', headline: 'Плот, който не крие конструкцията си', text: 'Металната рамка на кафе масата LOFT остава на показ — практична повърхност с категоричен индустриален характер.' },
      { image: '/products/loft-low-cab-black-1.webp', headline: 'Тегло, което внушава стабилност', text: 'Плътен корпус с индустриален финиш — шкафът LOFT изглежда толкова здрав, колкото е в действителност.' },
      { image: '/products/loft-high-cab-black-1.webp', headline: 'Височина с индустриален характер', text: 'Плътен корпус и категорична визия — високият шкаф LOFT организира пространството, без да омекотява тона на серията.' },
      { image: '/products/loft-container-black-1.webp', headline: 'Практичност без компромис във визията', text: 'Мобилен контейнер, който пази характера на серията дори в най-малката си форма.' },
      { image: '/products/loft-plant-black-1.webp', headline: 'Зеленото, поставено в суров контекст', text: 'Дори растенията в LOFT намират място в категорична, индустриална конструкция.' },
      { image: '/products/loft-shelf-black-1.webp', headline: 'Отворени нива, категорична визия', text: 'Тръбна конструкция и открити рафтове — етажерката LOFT превръща съхранението в акцент, не в компромис.' },
    ],
  },
};

// English copy. Images, order and structure come from the Bulgarian data above.
type SeriesCopy = { tag: string; headline: string; intro: string[]; features: [string, string][] };

const seriesCopyEn: Record<string, SeriesCopy> = {
  astra: {
    tag: 'ASTRA SERIES',
    headline: 'Minimalism with a quiet presence.',
    intro: [
      'ASTRA proves that less can be bolder. Every form in the collection is reduced to what matters — a straight line, a clean corner, a precise proportion — with nothing superfluous to pull attention away from the work.',
      'Matte metal, a neutral palette and round metal handles create one shared language across the desk, the cabinets and the storage systems. The result is a space that feels finished on its own, without any effort.',
    ],
    features: [
      ['The work surface everything is built around', 'The ASTRA desk carries the character of the whole series in a compact format — a stable frame, matte metal legs and enough surface for a monitor, documents and everyday office work.'],
      ['A tabletop that invites a pause', 'Low and geometric, the ASTRA coffee table carries the same clean language from the desk into the break area — with room for books and decoration in the open compartment under the top.'],
      ['Storage that does not draw attention', 'Open and closed compartments in one body — for binders, documents and everything that should be within reach, but not on show.'],
      ['Vertical storage with discipline', 'Tall, slim and organised — the ASTRA cabinet holds documents and binders without taking up more floor space than it needs.'],
      ['Mobility tailored to the desk', 'On four castors with two compartments — the ASTRA container moves freely and sits exactly where it is needed.'],
      ['Greenery, arranged with measure', 'A compact frame designed to hold plants exactly where they belong — without getting in the way of the rest of the space.'],
      ['Vertical space, used to the full', 'Narrow in form but generous in levels — the ASTRA shelf turns even the tightest corner into an organised place for books and documents.'],
    ],
  },
  terra: {
    tag: 'TERRA SERIES',
    headline: 'Warmth that changes the way you work.',
    intro: [
      'TERRA is the answer to what happens when an office stops imitating a home and simply becomes one. Natural textures, rounded forms and soft light create a space where work and rest do not compete.',
      'Warm-toned wood, textiles and carefully rounded edges — every detail in TERRA is chosen to soften the feeling of an "office" and leave a sense of home.',
    ],
    features: [
      ['Work that does not announce itself as work', 'The wood texture and soft silhouette make the TERRA desk a piece of furniture that would feel just as natural in a living room.'],
      ['A place where the day slows down', 'Wood texture and a soft silhouette — the TERRA coffee table invites a pause, not just more work.'],
      ['Order, served warm', 'Open shelves with visible wood grain — storage that does not hide its material but shows it off.'],
      ['Storage with a warm height', 'The same warm texture, carried upwards — the tall TERRA cabinet organises the space without losing the softness of the series.'],
      ['Small details, big impact', 'Compact and mobile, the TERRA container keeps small things tidy without taking up unnecessary space.'],
      ['Greenery as part of the design', 'Designed to hold plants not as an accessory but as part of the furniture itself — TERRA brings nature inside.'],
      ['Open levels, natural texture', 'The TERRA shelf unit puts the wood on display — room for books, objects and a little greenery.'],
    ],
  },
  nova: {
    tag: 'NOVA SERIES',
    headline: 'Craftsmanship that stands the test of time.',
    intro: [
      'NOVA is a series for people for whom the history of an object matters just as much as its function. Deep tones, authentic textures and details that reveal handmade work in a world of mass production.',
      'Every desk and every cabinet carries character — slight irregularities in the texture, weight in the material, a sense of something made with care rather than simply assembled.',
    ],
    features: [
      ['A desk with character', 'The dark texture of the NOVA desk does not hide where it comes from — it highlights it, with every scratch and grain on show.'],
      ['Weight and history in a tabletop', 'The deep tone of the NOVA coffee table carries the same craft character, brought into the break area.'],
      ['Storage with weight and presence', 'Solid forms and a deep tone — the NOVA cabinet does not try to go unnoticed.'],
      ['A presence that does not go unnoticed', "Tall, solid, decisive — the NOVA cabinet builds serious vertical storage with the series' characteristic dark tone."],
      ['A detail that lasts', 'Mobile, compact, built to withstand years of everyday use without losing its character.'],
      ['Nature with a deep character', "Even the greenery in NOVA stands with weight — the plant stand complements the series' dark palette."],
      ['A showcase for what matters', 'The open levels of the NOVA shelf are a place that invites — for books, objects, history.'],
    ],
  },
  loft: {
    tag: 'LOFT SERIES',
    headline: 'Authenticity over perfection.',
    intro: [
      'LOFT does not hide its materials — it shows them. Raw metal and solid wood meet in a contrast that makes no apology for its character. This is a series for spaces where the industrial spirit is part of the identity, not a compromise.',
      'Exposed structures, decisive lines and a dark, deep palette — every element of LOFT declares its presence, without trying to blend in unnoticed.',
    ],
    features: [
      ['Construction on display', 'The metal frame of the LOFT desk is not hidden behind a facade — it is part of the look.'],
      ['A tabletop that does not hide its structure', 'The metal frame of the LOFT coffee table stays on show — a practical surface with a decisive industrial character.'],
      ['Weight that suggests stability', 'A solid body with an industrial finish — the LOFT cabinet looks as sturdy as it really is.'],
      ['Height with industrial character', 'A solid body and a decisive look — the tall LOFT cabinet organises the space without softening the tone of the series.'],
      ['Practicality without compromising the look', 'A mobile container that keeps the character of the series even in its smallest form.'],
      ['Greenery placed in a raw setting', 'Even the plants in LOFT find their place in a decisive, industrial structure.'],
      ['Open levels, a decisive look', 'Tubular construction and open shelves — the LOFT shelf unit turns storage into a highlight rather than a compromise.'],
    ],
  },
};

const seriesEn: Record<string, SeriesData> = Object.fromEntries(
  Object.entries(seriesBg).map(([slug, bg]) => {
    const c = seriesCopyEn[slug];
    return [slug, {
      ...bg,
      tag: c.tag,
      headline: c.headline,
      intro: c.intro,
      features: bg.features.map((f, i) => ({ ...f, headline: c.features[i][0], text: c.features[i][1] })),
    }];
  }),
);

const LABELS = {
  bg: { back: '← Назад към сериите', browse: 'Разгледай продуктите →' },
  en: { back: '← Back to series', browse: 'Browse the products →' },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const s = (locale === 'en' ? seriesEn : seriesBg)[slug];
  if (!s) return {};
  return { title: `${s.tag} | OfficeLabs Co` };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const s = (locale === 'en' ? seriesEn : seriesBg)[slug];
  if (!s) notFound();
  const L = LABELS[locale === 'en' ? 'en' : 'bg'];

  return (
    <main className="series-page">
      {/* ── Hero: 16:9 on desktop, full-bleed full-screen on mobile.
          Lives outside .page-wrap so it can break out to the full
          viewport width/height on phones without fighting the page
          padding — see .series-hero-wrap in globals.css. ── */}
      <div className="series-hero-wrap">
        <div className="series-hero">
          {s.heroImage ? (
            <Image src={s.heroImage} alt={s.title} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="series-hero__placeholder" style={{ background: `linear-gradient(135deg, ${s.accent}14, ${s.accent}05)` }}>
              <span className="series-hero__word" style={{ color: s.accent }}>{s.title}</span>
            </div>
          )}
        </div>
      </div>

      <div className="page-wrap">

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
            {L.back}
          </Link>
          <Link href={`/shop?series=${slug}`} className="gal-shop-btn">
            {L.browse}
          </Link>
        </div>

      </div>
    </main>
  );
}
