import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';
import type { PopupFrequency, PopupType, PopupPublic } from '@/lib/popup-types';

export const dynamic = 'force-dynamic';

const isRateLimited = createRateLimiter(60, 60_000);

// The popups (modal) and top bars that are live for a page right now, in
// priority order. The client shows the first one the visitor hasn't already
// seen/dismissed (that memory lives in their browser), one modal and one
// bar at a time.
export async function GET(req: NextRequest) {
  if (isRateLimited(getIp(req))) return NextResponse.json({ popups: [], bars: [] }, { status: 429 });

  const sp = req.nextUrl.searchParams;
  const page = ['shop', 'home'].includes(sp.get('page') ?? '') ? sp.get('page')! : 'other';
  const en = sp.get('locale') === 'en';

  const now = new Date();
  const rows = await prisma.popup.findMany({
    where: { active: true },
    orderBy: [{ priority: 'desc' }, { id: 'asc' }],
  });

  // Inside its schedule window (or no window set).
  const live = rows.filter((r) => (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt > now));

  // A running promo/campaign popup (e.g. Black Friday) pauses the bundle
  // popup everywhere — only one discount offer at a time.
  const promoRunning = live.some((r) => r.type === 'promo');
  const onPage = live.filter((r) => {
    if (promoRunning && r.type === 'bundle') return false;
    return r.pages === 'all' || r.pages === page;
  });

  // Only advertise/apply a code if it actually exists and is active.
  const codes = [...new Set(onPage.map((r) => r.promoCode).filter((c): c is string => !!c))];
  const promos = codes.length
    ? await prisma.promoCode.findMany({ where: { code: { in: codes }, active: true }, select: { code: true, discount: true } })
    : [];
  const discountOf = new Map(promos.map((p) => [p.code, p.discount]));

  const toPublic = (r: (typeof rows)[number]): PopupPublic => {
    const discount = r.promoCode ? discountOf.get(r.promoCode) ?? null : null;
    return {
      id: r.id,
      type: r.type as PopupType,
      version: r.version,
      frequency: r.frequency as PopupFrequency,
      frequencyDays: r.frequencyDays,
      delaySeconds: r.delaySeconds,
      accent: r.accent,
      title: (en ? r.titleEn : null) || r.title || '',
      text: (en ? r.textEn : null) || r.text || '',
      image: r.image,
      ctaLabel: (en ? r.ctaLabelEn : null) || r.ctaLabel || '',
      ctaLink: r.ctaLink || '/shop',
      promoCode: discount !== null ? r.promoCode : null,
      discountPercent: discount,
      endsAt: r.endsAt ? r.endsAt.toISOString() : null,
      showCountdown: r.showCountdown,
    };
  };

  return NextResponse.json({
    popups: onPage.filter((r) => r.type !== 'bar').slice(0, 5).map(toPublic),
    bars: onPage.filter((r) => r.type === 'bar').slice(0, 5).map(toPublic),
  });
}
