'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-store';

const DISMISS_KEY = 'officelabsco-bundle-popup-dismissed-until';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

// One fixed accent (Astra's blue) for every series in this popup, regardless
// of which series' bundle is shown — kept intentionally different from the
// per-series accents used on the gallery pages / cost calculator.
const ACCENT = '#3b82f6';

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

  const accent = ACCENT;

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
          background: 'var(--surface, #fff)', borderRadius: 28, overflow: 'hidden',
          maxWidth: 1120, width: '100%', maxHeight: '92vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
        }}
      >
        <div className="bundle-popup__media" style={{ position: 'relative', minHeight: 480, background: 'var(--line-2, #F2F2F2)' }}>
          <Image
            src={`/images/bundle-popup-${data.series.slug}.webp`}
            alt={data.series.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 700px) 100vw, 560px"
            quality={95}
            priority
          />
        </div>

        <div style={{ padding: '48px 52px 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={dismiss}
            aria-label={t('close')}
            style={{
              position: 'absolute', top: 20, right: 20, width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,.85)', color: 'var(--text, #1C1C1C)',
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,.15)',
            }}
          >
            ✕
          </button>

          <p style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', color: accent, margin: '0 0 14px', textTransform: 'uppercase' }}>
            {t('eyebrow', { series: data.series.name })}
          </p>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.4px', lineHeight: 1.1, margin: '0 0 18px', color: 'var(--text, #1C1C1C)' }}>
            {t('title', { discount: data.discountPercent })}
          </h2>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: 'var(--text-2, #555)', margin: '0 0 28px', maxWidth: 420 }}>
            {t('sub', { count: data.products.length, series: data.series.name })}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: 16, color: 'var(--muted, #5f5f5f)', textDecoration: 'line-through' }}>
              {data.bundleTotal} €
            </span>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text, #1C1C1C)' }}>
              {data.discountedTotal} €
            </span>
          </div>

          <button
            onClick={addBundle}
            disabled={adding}
            style={{
              width: '100%', maxWidth: 340, padding: '18px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: accent, color: '#fff', fontSize: 15.5, fontWeight: 700,
              transition: 'opacity .15s', opacity: adding ? 0.7 : 1,
            }}
          >
            {t('cta')}
          </button>
        </div>
      </div>

      <style>{`
        .bundle-popup { position: relative; }
        @media (max-width: 800px) {
          .bundle-popup { grid-template-columns: 1fr !important; max-width: 480px !important; }
          .bundle-popup__media { min-height: 260px !important; }
        }
      `}</style>
    </div>
  );
}
