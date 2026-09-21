'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import {
  fetchActivePopups, pageOf, pickFirst, markSeen, trackPopup, useCountdown, splitCountdown,
} from '@/lib/popup-client';
import type { PopupPublic } from '@/lib/popup-types';

const pad = (n: number) => String(n).padStart(2, '0');

// Thin announcement strip above the header (sale / free delivery / …),
// managed as a "bar" popup from /adminpanel/popups. Unlike the modals it
// stays visible while browsing — including the cart — until dismissed.
export default function TopBar() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('topBar');
  const [bar, setBar] = useState<PopupPublic | null>(null);
  const [visible, setVisible] = useState(false);
  const left = useCountdown(bar?.showCountdown ? bar.endsAt : null);

  useEffect(() => {
    let cancelled = false;
    fetchActivePopups(pageOf(pathname), locale).then(({ bars }) => {
      if (cancelled) return;
      const next = pickFirst(bars);
      setBar((prev) => {
        // Same bar across page changes: keep it (no re-animation / re-count).
        if (prev && next && prev.id === next.id && prev.version === next.version) return prev;
        return next;
      });
    });
    return () => { cancelled = true; };
  }, [pathname, locale]);

  // Slide down once it exists, and count the view once per bar.
  useEffect(() => {
    if (!bar) { setVisible(false); return; }
    const id = requestAnimationFrame(() => setVisible(true));
    trackPopup(bar.id, 'view');
    return () => cancelAnimationFrame(id);
  }, [bar?.id, bar?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!bar) return null;

  const expired = left !== null && left <= 0;
  if (expired) return null;
  const parts = left !== null ? splitCountdown(left) : null;

  function dismiss() {
    if (!bar) return;
    trackPopup(bar.id, 'close');
    markSeen(bar);
    setVisible(false);
    setTimeout(() => setBar(null), 250);
  }

  const external = bar.ctaLink.startsWith('https://');

  return (
    <div
      role="region"
      aria-label={bar.title}
      style={{
        background: bar.accent, color: '#fff', overflow: 'hidden',
        maxHeight: visible ? 120 : 0, transition: 'max-height .25s ease',
      }}
    >
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '9px 44px 9px 16px', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 14px',
        fontSize: 13.5, fontWeight: 600, lineHeight: 1.4, textAlign: 'center',
      }}>
        <span>{bar.title}</span>

        {parts && (
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, background: 'rgba(0,0,0,.18)', padding: '2px 10px', borderRadius: 100 }}>
            {parts.d > 0 && `${parts.d}${t('days')} `}{pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
          </span>
        )}

        {bar.ctaLabel && (
          external ? (
            <a href={bar.ctaLink} onClick={() => trackPopup(bar.id, 'click')} style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 800 }}>
              {bar.ctaLabel} →
            </a>
          ) : (
            <Link href={bar.ctaLink} onClick={() => trackPopup(bar.id, 'click')} style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 800 }}>
              {bar.ctaLabel} →
            </Link>
          )
        )}

        <button
          onClick={dismiss}
          aria-label={t('close')}
          style={{
            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
            width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'transparent',
            color: '#fff', fontSize: 15, cursor: 'pointer', opacity: 0.85,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
