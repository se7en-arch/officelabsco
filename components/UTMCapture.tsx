'use client';
import { useEffect } from 'react';

export default function UTMCapture() {
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const src      = p.get('utm_source');
    const medium   = p.get('utm_medium');
    const campaign = p.get('utm_campaign');
    if (src)      sessionStorage.setItem('utm_source', src);
    if (medium)   sessionStorage.setItem('utm_medium', medium);
    if (campaign) sessionStorage.setItem('utm_campaign', campaign);
  }, []);
  return null;
}
