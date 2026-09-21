'use client';
import { useEffect, useState } from 'react';
import type { PopupPublic } from './popup-types';

export type ActivePopups = { popups: PopupPublic[]; bars: PopupPublic[] };

const DAY_MS = 24 * 60 * 60 * 1000;

// PopupHost (modals) and TopBar both need the same response — share one
// request per page/locale instead of firing two.
const inflight = new Map<string, { at: number; p: Promise<ActivePopups> }>();

export function fetchActivePopups(page: string, locale: string): Promise<ActivePopups> {
  const key = `${page}:${locale}`;
  const hit = inflight.get(key);
  if (hit && Date.now() - hit.at < 3000) return hit.p;
  const p = fetch(`/api/popups/active?page=${page}&locale=${locale}`)
    .then((r) => (r.ok ? (r.json() as Promise<ActivePopups>) : { popups: [], bars: [] }))
    .catch(() => ({ popups: [], bars: [] }));
  inflight.set(key, { at: Date.now(), p });
  return p;
}

export function pageOf(pathname: string): 'home' | 'shop' | 'other' {
  return pathname === '/' ? 'home' : pathname === '/shop' ? 'shop' : 'other';
}

// ── "Already seen" memory (per browser) ─────────────────────────────────
// Keyed by popup id + version: any admin edit (or re-enabling) bumps the
// version, which resets it for everyone who dismissed the old one.
const keyOf = (p: PopupPublic) => `officelabsco-popup-${p.id}-v${p.version}`;

export function isSuppressed(p: PopupPublic): boolean {
  try {
    if (p.frequency === 'session') return sessionStorage.getItem(keyOf(p)) === '1';
    if (p.frequency === 'days') {
      const until = localStorage.getItem(keyOf(p));
      return !!until && Date.now() < parseInt(until, 10);
    }
  } catch { /* storage blocked — just show it */ }
  return false;
}

export function markSeen(p: PopupPublic) {
  try {
    if (p.frequency === 'session') sessionStorage.setItem(keyOf(p), '1');
    else if (p.frequency === 'days') localStorage.setItem(keyOf(p), String(Date.now() + p.frequencyDays * DAY_MS));
  } catch { /* ignore */ }
}

// Once someone has subscribed, the email popup never shows again.
const SUBSCRIBED_KEY = 'officelabsco-subscribed';
export const isSubscribed = () => { try { return localStorage.getItem(SUBSCRIBED_KEY) === '1'; } catch { return false; } };
export const markSubscribed = () => { try { localStorage.setItem(SUBSCRIBED_KEY, '1'); } catch { /* ignore */ } };

// ── Stats ───────────────────────────────────────────────────────────────
export function trackPopup(id: number, event: 'view' | 'click' | 'close') {
  try {
    fetch('/api/popups/track', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, event }), keepalive: true,
    }).catch(() => {});
  } catch { /* stats must never break the page */ }
}

/** First candidate the visitor hasn't already seen (and that is still relevant to them). */
export function pickFirst(list: PopupPublic[]): PopupPublic | null {
  const subscribed = isSubscribed();
  return list.find((p) => !(p.type === 'email' && subscribed) && !isSuppressed(p)) ?? null;
}

// ── Countdown ───────────────────────────────────────────────────────────
/** Milliseconds left until endsAt (null when there is no countdown). */
export function useCountdown(endsAt: string | null): number | null {
  const [left, setLeft] = useState<number | null>(() => (endsAt ? new Date(endsAt).getTime() - Date.now() : null));
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(new Date(endsAt).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return left;
}

export function splitCountdown(left: number) {
  return {
    d: Math.floor(left / 86_400_000),
    h: Math.floor(left / 3_600_000) % 24,
    m: Math.floor(left / 60_000) % 60,
    s: Math.floor(left / 1000) % 60,
  };
}
