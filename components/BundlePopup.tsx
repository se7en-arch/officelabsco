'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-store';

const DISMISS_KEY = 'officelabsco-bundle-popup-dismissed-until';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

// Same accent palette used on the public series (gallery) pages and in the
// cost calculator — kept in sync there since none of it lives in the DB
// (Series.color holds unrelated material-swatch colors, not brand accents).
const SERIES_ACCENTS: Record<string, string> = {
  astra: '#3b82f6', terra: '#7A9E87', nova: '#8a6d4f', loft: '#2D5A45',
};

type BundleProduct = {
  id: number; name: string; nameEn: string | null; slug: string; price: number; image: string;
  categoryName: string; categoryNameEn: string | null;
};
type BundleData = {
  series: { name: string; slug: string };
  products: BundleProduct[];
  promoCode: string;
  discountPercent: number;
  bundleTotal: number;
  discountedTotal: number;
};

export default function BundlePopup() {
  const t = useTranslations('bundlePopup');
  const locale = useLocale();
  const en = locale === 'en';
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const setPromo = useCart((s) => s.setPromo);

  const [data, setData] = useState<BundleData | null>(null);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    try {
      const until = localStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < parseInt(until, 10)) return;
    } catch { /* ignore */ }

    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout>;

    fetch('/api/bundle-deal')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: BundleData | null) => {
        if (cancelled || !json) return;
        setData(json);
        showTimer = setTimeout(() => { if (!cancelled) setOpen(true); }, SHOW_DELAY_MS);
      })
      .catch(() => {});

    return () => { cancelled = true; clearTimeout(showTimer); };
  }, []);

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS)); } catch { /* ignore */ }
  }

  function addBundle() {
    if (!data || adding) return;
    setAdding(true);
    for (const p of data.products) {
      addItem({
        id: p.id,
        name: en ? (p.nameEn || p.name) : p.name,
        price: p.price,
        image: p.image,
        seriesName: data.series.name,
        categoryName: en ? (p.categoryNameEn || p.categoryName) : p.categoryName,
        slug: p.slug,
      });
    }
    setPromo(data.promoCode, data.discountPercent);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS)); } catch { /* ignore */ }
    router.push('/cart');
  }

  if (!open || !data) return null;

  const accent = SERIES_ACCENTS[data.series.slug] ?? '#1C1C1C';

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(20,20,20,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bundle-popup"
        style={{
          background: 'var(--surface, #fff)', borderRadius: 24, overflow: 'hidden',
          maxWidth: 860, width: '100%', maxHeight: '92vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
        }}
      >
        <div className="bundle-popup__media" style={{ position: 'relative', minHeight: 260, background: 'var(--line-2, #F2F2F2)' }}>
          <Image
            src={`/images/gallery-hero-${data.series.slug}.webp`}
            alt={data.series.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 700px) 100vw, 430px"
          />
        </div>

        <div style={{ padding: '36px 36px 32px', display: 'flex', flexDirection: 'column' }}>
          <button
            onClick={dismiss}
            aria-label={t('close')}
            style={{
              alignSelf: 'flex-end', width: 32, height: 32, borderRadius: '50%',
              border: 'none', background: 'var(--line-2, #F2F2F2)', color: 'var(--text, #1C1C1C)',
              fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 6, flexShrink: 0,
            }}
          >
            ✕
          </button>

          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.1em', color: accent, margin: '0 0 10px', textTransform: 'uppercase' }}>
            {t('eyebrow', { series: data.series.name })}
          </p>
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.14, margin: '0 0 14px', color: 'var(--text, #1C1C1C)' }}>
            {t('title', { discount: data.discountPercent })}
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-2, #555)', margin: '0 0 22px' }}>
            {t('sub', { count: data.products.length, series: data.series.name, discount: data.discountPercent })}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 22 }}>
            <span style={{ fontSize: 14, color: 'var(--muted, #5f5f5f)', textDecoration: 'line-through' }}>
              {data.bundleTotal} €
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text, #1C1C1C)' }}>
              {data.discountedTotal} €
            </span>
          </div>

          <button
            onClick={addBundle}
            disabled={adding}
            style={{
              width: '100%', padding: '15px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: accent, color: '#fff', fontSize: 14.5, fontWeight: 700,
              transition: 'opacity .15s', opacity: adding ? 0.7 : 1,
            }}
          >
            {t('cta', { discount: data.discountPercent })}
          </button>

          <button
            onClick={dismiss}
            style={{
              marginTop: 12, background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12.5, color: 'var(--muted, #5f5f5f)', textAlign: 'center',
            }}
          >
            {t('later')}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .bundle-popup { grid-template-columns: 1fr !important; max-width: 420px !important; }
          .bundle-popup__media { min-height: 180px !important; }
        }
      `}</style>
    </div>
  );
}
