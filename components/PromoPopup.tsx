'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-store';
import { useCountdown, splitCountdown } from '@/lib/popup-client';
import type { PopupPublic } from '@/lib/popup-types';

const pad = (n: number) => String(n).padStart(2, '0');

// Campaign popup (Black Friday, seasonal sales…) configured entirely from
// the admin panel: text, image, accent color, optional countdown and an
// optional promo code that the button applies to the cart for the visitor.
export default function PromoPopup({ popup, onShown, onClose }: {
  popup: PopupPublic;
  onShown: () => void;
  onClose: (engaged: boolean) => void;
}) {
  const t = useTranslations('promoPopup');
  const router = useRouter();
  const setPromo = useCart((s) => s.setPromo);
  const cartPromoCode = useCart((s) => s.promoCode);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const left = useCountdown(popup.showCountdown ? popup.endsAt : null);

  useEffect(() => {
    const id = setTimeout(() => { setOpen(true); onShown(); }, popup.delaySeconds * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup.delaySeconds]);

  if (!open) return null;

  const accent = popup.accent;
  const codeApplied = !!popup.promoCode && cartPromoCode === popup.promoCode;
  const anotherDiscount = !!popup.promoCode && !!cartPromoCode && cartPromoCode !== popup.promoCode;
  const expired = left !== null && left <= 0;

  function dismiss() {
    setOpen(false);
    onClose(false);
  }

  function go() {
    if (busy) return;
    setBusy(true);
    // Never replace a discount the visitor already has in the cart.
    if (popup.promoCode && popup.discountPercent && !cartPromoCode) {
      setPromo(popup.promoCode, popup.discountPercent);
    }
    onClose(true);
    if (popup.ctaLink.startsWith('https://')) window.location.assign(popup.ctaLink);
    else router.push(popup.ctaLink);
  }

  const parts = left !== null && left > 0 ? splitCountdown(left) : null;

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
        className="promo-popup"
        style={{
          position: 'relative', background: 'var(--surface, #fff)', borderRadius: 28, overflow: 'hidden',
          maxWidth: popup.image ? 1000 : 560, width: '100%', maxHeight: '92vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: popup.image ? '1fr 1fr' : '1fr',
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
        }}
      >
        {popup.image && (
          <div className="promo-popup__media" style={{ position: 'relative', minHeight: 440, background: 'var(--line-2, #F2F2F2)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={popup.image} alt={popup.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '48px 44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={dismiss}
            aria-label={t('close')}
            style={{
              position: 'absolute', top: 18, right: 18, width: 38, height: 38, borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,.9)', color: 'var(--text, #1C1C1C)',
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,.15)',
            }}
          >
            ✕
          </button>

          <p style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', color: accent, margin: '0 0 14px', textTransform: 'uppercase' }}>
            {t('eyebrow')}
          </p>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-1.4px', lineHeight: 1.1, margin: '0 0 14px', color: 'var(--text, #1C1C1C)' }}>
            {popup.title}
          </h2>

          {popup.discountPercent ? (
            <div style={{
              alignSelf: 'flex-start', fontSize: 30, fontWeight: 800, color: '#fff', background: accent,
              padding: '6px 18px', borderRadius: 14, margin: '0 0 16px',
            }}>
              −{popup.discountPercent}%
            </div>
          ) : null}

          {popup.text && (
            <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text-2, #555)', margin: '0 0 22px', maxWidth: 420 }}>
              {popup.text}
            </p>
          )}

          {parts && !expired && (
            <div style={{ margin: '0 0 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted, #5f5f5f)', marginBottom: 8 }}>
                {t('endsIn')}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontVariantNumeric: 'tabular-nums' }}>
                {parts.d > 0 && (
                  <span style={{ fontSize: 30, fontWeight: 800, color: accent }}>{parts.d}{t('days')}</span>
                )}
                <span style={{ fontSize: 30, fontWeight: 800, color: accent }}>
                  {pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={go}
            disabled={busy}
            style={{
              width: '100%', maxWidth: 340, padding: '18px', borderRadius: 100, border: 'none', cursor: 'pointer',
              background: accent, color: '#fff', fontSize: 15.5, fontWeight: 700,
              transition: 'opacity .15s', opacity: busy ? 0.7 : 1,
            }}
          >
            {popup.ctaLabel || '→'}
          </button>

          {popup.promoCode && !anotherDiscount && (
            <p style={{ fontSize: 12.5, color: 'var(--muted, #5f5f5f)', margin: '10px 0 0' }}>
              {codeApplied ? t('alreadyApplied') : t('applied')}
            </p>
          )}
          {anotherDiscount && (
            <p style={{ fontSize: 12.5, color: 'var(--muted, #5f5f5f)', margin: '10px 0 0' }}>
              {t('discountTaken')}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes promoPopupIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .promo-popup { animation: promoPopupIn .35s ease; }
        @media (max-width: 800px) {
          .promo-popup { grid-template-columns: 1fr !important; max-width: 480px !important; }
          .promo-popup__media { min-height: 220px !important; }
          .promo-popup h2 { font-size: 30px !important; }
        }
      `}</style>
    </div>
  );
}
