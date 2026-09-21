'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-store';
import { markSubscribed } from '@/lib/popup-client';
import type { PopupPublic } from '@/lib/popup-types';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Reward = { promoCode: string | null; discountPercent: number | null };

// Email-capture popup: collects an address (with explicit consent) and, if
// the admin attached a promo code, hands it out — applying it to the cart
// straight away when the visitor doesn't already have a discount there.
export default function EmailPopup({ popup, onShown, onClose }: {
  popup: PopupPublic;
  onShown: () => void;
  onClose: (engaged: boolean) => void;
}) {
  const t = useTranslations('emailPopup');
  const locale = useLocale();
  const router = useRouter();
  const setPromo = useCart((s) => s.setPromo);
  const cartPromoCode = useCart((s) => s.promoCode);

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<Reward | null>(null);
  const [codeApplied, setCodeApplied] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => { setOpen(true); onShown(); }, popup.delaySeconds * 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popup.delaySeconds]);

  if (!open) return null;

  const accent = popup.accent;

  function dismiss() {
    setOpen(false);
    onClose(!!done);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!EMAIL_RX.test(email.trim())) { setError(t('invalidEmail')); return; }
    if (!consent) { setError(t('consentRequired')); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent: true, locale, popupId: popup.id, website }),
      });
      const data = await res.json();
      if (!res.ok) { setError(res.status === 429 ? t('tooMany') : data.error === 'invalid_email' ? t('invalidEmail') : t('error')); setBusy(false); return; }
      markSubscribed();
      if (data.promoCode && data.discountPercent && !cartPromoCode) {
        setPromo(data.promoCode, data.discountPercent);
        setCodeApplied(true);
      }
      setDone({ promoCode: data.promoCode ?? null, discountPercent: data.discountPercent ?? null });
    } catch {
      setError(t('error'));
    }
    setBusy(false);
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
        className="email-popup"
        style={{
          position: 'relative', background: 'var(--surface, #fff)', borderRadius: 28, overflow: 'hidden',
          maxWidth: popup.image ? 940 : 520, width: '100%', maxHeight: '92vh', overflowY: 'auto',
          display: 'grid', gridTemplateColumns: popup.image ? '1fr 1fr' : '1fr',
          boxShadow: '0 30px 90px rgba(0,0,0,.35)',
        }}
      >
        {popup.image && (
          <div className="email-popup__media" style={{ position: 'relative', minHeight: 420, background: 'var(--line-2, #F2F2F2)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={popup.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ padding: '46px 40px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

          {done ? (
            <>
              <p style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '.1em', color: accent, margin: '0 0 12px', textTransform: 'uppercase' }}>
                ✓ {t('thanksEyebrow')}
              </p>
              <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 14px', color: 'var(--text, #1C1C1C)' }}>
                {t('thanksTitle')}
              </h2>
              {done.promoCode ? (
                <>
                  <p style={{ fontSize: 15, color: 'var(--text-2, #555)', margin: '0 0 12px' }}>{t('yourCode')}</p>
                  <div style={{
                    alignSelf: 'flex-start', fontFamily: 'monospace', fontSize: 26, fontWeight: 800, letterSpacing: '.08em',
                    color: accent, border: `2px dashed ${accent}`, borderRadius: 14, padding: '10px 22px', margin: '0 0 12px',
                  }}>
                    {done.promoCode}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted, #5f5f5f)', margin: '0 0 22px' }}>
                    {codeApplied ? t('codeApplied', { discount: done.discountPercent ?? 0 }) : t('codeNotApplied')}
                  </p>
                </>
              ) : (
                <p style={{ fontSize: 15, color: 'var(--text-2, #555)', margin: '0 0 22px' }}>{t('thanksText')}</p>
              )}
              <button
                onClick={() => { setOpen(false); onClose(true); router.push('/shop'); }}
                style={{ width: '100%', maxWidth: 320, padding: 16, borderRadius: 100, border: 'none', cursor: 'pointer', background: accent, color: '#fff', fontSize: 15, fontWeight: 700 }}
              >
                {t('toShop')}
              </button>
            </>
          ) : (
            <form onSubmit={submit} noValidate>
              <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1.1px', lineHeight: 1.12, margin: '0 0 12px', color: 'var(--text, #1C1C1C)' }}>
                {popup.title}
              </h2>
              {popup.discountPercent ? (
                <div style={{ display: 'inline-block', fontSize: 24, fontWeight: 800, color: '#fff', background: accent, padding: '4px 16px', borderRadius: 12, margin: '0 0 14px' }}>
                  −{popup.discountPercent}%
                </div>
              ) : null}
              {popup.text && (
                <p style={{ fontSize: 15.5, lineHeight: 1.6, color: 'var(--text-2, #555)', margin: '0 0 20px' }}>{popup.text}</p>
              )}

              <input
                type="email" inputMode="email" autoComplete="email" required
                value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder={t('placeholder')}
                style={{
                  width: '100%', padding: '15px 18px', fontSize: 15, borderRadius: 14, outline: 'none',
                  border: `1.5px solid ${error ? '#dc2626' : 'var(--line, #E8E8E8)'}`, fontFamily: 'inherit', marginBottom: 12,
                }}
              />
              {/* Honeypot — invisible to people, tempting to bots. */}
              <input
                type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"
                value={website} onChange={(e) => setWebsite(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
              />

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12.5, color: 'var(--text-2, #555)', lineHeight: 1.5, margin: '0 0 14px', cursor: 'pointer' }}>
                <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(''); }} style={{ marginTop: 3, accentColor: accent }} />
                <span>
                  {t('consent')}{' '}
                  <Link href="/privacy" target="_blank" style={{ color: accent, textDecoration: 'underline' }}>{t('privacy')}</Link>.
                </span>
              </label>

              {error && <p style={{ fontSize: 13, color: '#dc2626', margin: '0 0 12px' }}>{error}</p>}

              <button
                type="submit" disabled={busy}
                style={{
                  width: '100%', padding: 17, borderRadius: 100, border: 'none', cursor: 'pointer',
                  background: accent, color: '#fff', fontSize: 15.5, fontWeight: 700, opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? '…' : (popup.ctaLabel || t('submit'))}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes emailPopupIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .email-popup { animation: emailPopupIn .35s ease; }
        @media (max-width: 800px) {
          .email-popup { grid-template-columns: 1fr !important; max-width: 460px !important; }
          .email-popup__media { min-height: 180px !important; }
        }
      `}</style>
    </div>
  );
}
