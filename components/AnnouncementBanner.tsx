'use client';
import { useState, useEffect } from 'react';

const ITEMS = [
  { icon: '💳', text: 'Плащане с карта (Stripe) — не е имплементирано' },
  { icon: '📲', text: 'Социални мрежи — Facebook, Instagram, LinkedIn линкове не са добавени' },
  { icon: '🚧', text: 'Преди пускане: изтрий Under Construction (PREVIEW_SECRET от Vercel + /app/under-construction + /api/unlock)' },
];

export default function AnnouncementBanner() {
  // Start visible (matches SSR) — hide after hydration if already dismissed.
  // This avoids CLS: banner is in initial HTML, not injected after mount.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('banner_dismissed');
    if (dismissed) setVisible(false);
  }, []);

  function dismiss() {
    sessionStorage.setItem('banner_dismissed', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #7a0000 0%, #a00000 50%, #7a0000 100%)',
      borderBottom: '1px solid rgba(255,100,100,.25)',
      padding: '0',
      position: 'relative',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '10px 52px 10px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,.9)',
          whiteSpace: 'nowrap',
          paddingTop: 1,
          flexShrink: 0,
        }}>
          ⚠ Предстои
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', flex: 1 }}>
          {ITEMS.map((item) => (
            <span key={item.text} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              color: 'rgba(255,255,255,.88)',
              fontWeight: 500,
            }}>
              <span>{item.icon}</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Затвори"
        style={{
          position: 'absolute',
          right: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,.5)',
          padding: '6px',
          lineHeight: 1,
          fontSize: 18,
          transition: 'color .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.9)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
      >
        ×
      </button>
    </div>
  );
}
