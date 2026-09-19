'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-store';

const DISMISS_KEY = 'officelabsco-bundle-popup-dismissed-until';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 1200;

// TEMP (testing only): ignore the 7-day dismiss suppression so the popup
// shows on every /shop load. Set back to false to restore normal behavior.
const TEMP_ALWAYS_SHOW = true;

// One fixed accent for every series in this popup, regardless of which
// series' bundle is shown — kept intentionally different from the
// per-series accents used on the gallery pages / cost calculator.
const ACCENT = '#FF5733';

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

const ArrowIcon = ({ flip }: { flip?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function BundlePopup() {
  const t = useTranslations('bundlePopup');
  const locale = useLocale();
  const en = locale === 'en';
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const setPromo = useCart((s) => s.setPromo);
  const cartPromoCode = useCart((s) => s.promoCode);
  const cartItems = useCart((s) => s.items);

  const [bundles, setBundles] = useState<BundleData[] | null>(null);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!TEMP_ALWAYS_SHOW) {
      try {
        const until = localStorage.getItem(DISMISS_KEY);
        if (until && Date.now() < parseInt(until, 10)) return;
      } catch { /* ignore */ }
    }

    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout>;

    fetch('/api/bundle-deal')
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { bundles: BundleData[] } | null) => {
        if (cancelled || !json || json.bundles.length === 0) return;
        setBundles(json.bundles);
        showTimer = setTimeout(() => { if (!cancelled) setOpen(true); }, SHOW_DELAY_MS);
      })
      .catch(() => {});

    return () => { cancelled = true; clearTimeout(showTimer); };
  }, []);

  if (!open || !bundles) return null;

  const data = bundles[index];
  // The popup's discount is meant for exactly one series' bundle per cart.
  // Once BUNDLE10 is already applied for ANY series, adding a different
  // series' bundle on top is blocked too — not just re-adding the same one
  // — otherwise browsing to another series with the arrows and clicking
  // "Add whole set" there would stack a second full bundle under the same
  // flat discount. Checking the promo code alone isn't enough either: it
  // stays set on the cart store even after someone manually removes the
  // bundle's items, so we also require the cart to still actually contain a
  // complete bundle of at least one series before calling it "applied".
  const cartIds = new Set(cartItems.map((i) => i.id));
  const bundleAlreadyApplied =
    cartPromoCode === data.promoCode &&
    bundles.some((b) => b.products.every((p) => cartIds.has(p.id)));
  const accent = ACCENT;

  function dismiss() {
    setOpen(false);
    try { localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS)); } catch { /* ignore */ }
  }

  function prev() {
    setIndex((i) => (i - 1 + bundles!.length) % bundles!.length);
  }
  function next() {
    setIndex((i) => (i + 1) % bundles!.length);
  }

  function addBundle() {
    if (adding || bundleAlreadyApplied) return;
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
            key={data.series.slug}
            src={`/images/bundle-popup-${data.series.slug}.webp`}
            alt={data.series.name}
            fill
            className="bundle-fade"
            style={{ objectFit: 'cover' }}
            unoptimized
            priority
          />

          {bundles.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label={t('prevSeries')}
                className="bundle-popup__arrow"
                style={{ left: 16 }}
              >
                <ArrowIcon flip />
              </button>
              <button
                onClick={next}
                aria-label={t('nextSeries')}
                className="bundle-popup__arrow"
                style={{ right: 16 }}
              >
                <ArrowIcon />
              </button>

              <div style={{
                position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', gap: 6,
              }}>
                {bundles.map((b, i) => (
                  <span
                    key={b.series.slug}
                    style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: i === index ? '#fff' : 'rgba(255,255,255,.45)',
                      transition: 'background .15s',
                    }}
                  />
                ))}
              </div>
            </>
          )}
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

          <div key={data.series.slug} className="bundle-fade">
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
              <span style={{ fontSize: 28, fontWeight: 800, color: accent, textDecoration: 'line-through' }}>
                {data.bundleTotal} €
              </span>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text, #1C1C1C)' }}>
                {data.discountedTotal} €
              </span>
            </div>

            <button
              onClick={addBundle}
              disabled={adding || bundleAlreadyApplied}
              style={{
                width: '100%', maxWidth: 340, padding: '18px', borderRadius: 100, border: 'none',
                cursor: bundleAlreadyApplied ? 'not-allowed' : 'pointer',
                background: accent, color: '#fff',
                fontSize: 15.5, fontWeight: 700,
                transition: 'opacity .15s', opacity: bundleAlreadyApplied ? 0.4 : (adding ? 0.7 : 1),
              }}
            >
              {t('cta')}
            </button>
            {bundleAlreadyApplied && (
              <p style={{ fontSize: 12.5, color: 'var(--muted, #5f5f5f)', margin: '10px 0 0' }}>
                {t('alreadyApplied')}
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .bundle-popup { position: relative; }
        .bundle-popup__arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 40px; height: 40px; border-radius: 50%; border: none;
          background: rgba(255,255,255,.85); color: #1C1C1C; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,.18);
          transition: background .15s;
        }
        .bundle-popup__arrow:hover { background: #fff; }
        @keyframes bundleFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .bundle-fade { animation: bundleFadeIn .35s ease; }
        @media (max-width: 800px) {
          .bundle-popup { grid-template-columns: 1fr !important; max-width: 480px !important; }
          .bundle-popup__media { min-height: 260px !important; }
        }
      `}</style>
    </div>
  );
}
