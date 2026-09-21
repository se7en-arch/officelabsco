'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import BundlePopup from './BundlePopup';
import PromoPopup from './PromoPopup';
import type { PopupPublic } from '@/lib/popup-types';

const DAY_MS = 24 * 60 * 60 * 1000;
const keyOf = (p: PopupPublic) => `officelabsco-popup-${p.id}-v${p.version}`;

// "Already seen" for this popup at this version. Bumping the version in the
// admin panel (any edit, or turning it back on) resets it for everyone.
function isSuppressed(p: PopupPublic): boolean {
  try {
    if (p.frequency === 'session') return sessionStorage.getItem(keyOf(p)) === '1';
    if (p.frequency === 'days') {
      const until = localStorage.getItem(keyOf(p));
      return !!until && Date.now() < parseInt(until, 10);
    }
  } catch { /* storage blocked — just show it */ }
  return false;
}

function markSeen(p: PopupPublic) {
  try {
    if (p.frequency === 'session') sessionStorage.setItem(keyOf(p), '1');
    else if (p.frequency === 'days') localStorage.setItem(keyOf(p), String(Date.now() + p.frequencyDays * DAY_MS));
  } catch { /* ignore */ }
}

// Mounted once in the public layout: asks the server which single popup (if
// any) is live for this page right now — on/off, schedule, page and
// priority are all managed from /adminpanel/popups — and renders it.
export default function PopupHost() {
  const pathname = usePathname();
  const locale = useLocale();
  const [popup, setPopup] = useState<PopupPublic | null>(null);

  useEffect(() => {
    setPopup(null);
    // Never interrupt the purchase flow.
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) return;
    const page = pathname === '/' ? 'home' : pathname === '/shop' ? 'shop' : 'other';

    let cancelled = false;
    fetch(`/api/popups/active?page=${page}&locale=${locale}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: { popup: PopupPublic | null } | null) => {
        if (cancelled || !json?.popup) return;
        if (!isSuppressed(json.popup)) setPopup(json.popup);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pathname, locale]);

  if (!popup) return null;

  const close = () => {
    markSeen(popup);
    setPopup(null);
  };

  return popup.type === 'bundle'
    ? <BundlePopup key={`${popup.id}-${popup.version}`} delaySeconds={popup.delaySeconds} onClose={close} />
    : <PromoPopup key={`${popup.id}-${popup.version}`} popup={popup} onClose={close} />;
}
