'use client';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import BundlePopup from './BundlePopup';
import PromoPopup from './PromoPopup';
import EmailPopup from './EmailPopup';
import { fetchActivePopups, pageOf, pickFirst, markSeen, trackPopup } from '@/lib/popup-client';
import type { PopupPublic } from '@/lib/popup-types';

// Mounted once in the public layout: asks the server which popups are live
// for this page right now — on/off, schedule, page and priority are all
// managed from /adminpanel/popups — and shows the first one this visitor
// hasn't already seen. One modal at a time.
export default function PopupHost() {
  const pathname = usePathname();
  const locale = useLocale();
  const [popup, setPopup] = useState<PopupPublic | null>(null);

  useEffect(() => {
    setPopup(null);
    // Never interrupt the purchase flow.
    if (pathname.startsWith('/cart') || pathname.startsWith('/checkout')) return;

    let cancelled = false;
    fetchActivePopups(pageOf(pathname), locale).then(({ popups }) => {
      if (cancelled) return;
      setPopup(pickFirst(popups));
    });
    return () => { cancelled = true; };
  }, [pathname, locale]);

  if (!popup) return null;

  const shown = () => trackPopup(popup.id, 'view');
  const close = (engaged: boolean) => {
    trackPopup(popup.id, engaged ? 'click' : 'close');
    markSeen(popup);
    setPopup(null);
  };
  const key = `${popup.id}-${popup.version}`;

  if (popup.type === 'bundle') return <BundlePopup key={key} delaySeconds={popup.delaySeconds} onShown={shown} onClose={close} />;
  if (popup.type === 'email') return <EmailPopup key={key} popup={popup} onShown={shown} onClose={close} />;
  return <PromoPopup key={key} popup={popup} onShown={shown} onClose={close} />;
}
