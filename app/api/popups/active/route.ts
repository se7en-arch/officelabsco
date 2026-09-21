import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';
import type { PopupFrequency, PopupType, PopupPublic } from '@/lib/popup-types';

export const dynamic = 'force-dynamic';

const isRateLimited = createRateLimiter(60, 60_000);

// Which single popup (if any) the storefront should show right now on the
// given page. Only the highest-priority eligible one is returned — never
// two at once.
export async function GET(req: NextRequest) {
  if (isRateLimited(getIp(req))) return NextResponse.json({ popup: null }, { status: 429 });

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
  const candidates = live.filter((r) => {
    if (promoRunning && r.type === 'bundle') return false;
    return r.pages === 'all' || r.pages === page;
  });

  const top = candidates[0];
  if (!top) return NextResponse.json({ popup: null });

  // Only advertise/apply the code if it actually exists and is active.
  let promoCode: string | null = null;
  let discountPercent: number | null = null;
  if (top.promoCode) {
    const promo = await prisma.promoCode.findFirst({
      where: { code: top.promoCode, active: true },
      select: { code: true, discount: true },
    });
    if (promo) { promoCode = promo.code; discountPercent = promo.discount; }
  }

  const popup: PopupPublic = {
    id: top.id,
    type: top.type as PopupType,
    version: top.version,
    frequency: top.frequency as PopupFrequency,
    frequencyDays: top.frequencyDays,
    delaySeconds: top.delaySeconds,
    accent: top.accent,
    title: (en ? top.titleEn : null) || top.title || '',
    text: (en ? top.textEn : null) || top.text || '',
    image: top.image,
    ctaLabel: (en ? top.ctaLabelEn : null) || top.ctaLabel || '',
    ctaLink: top.ctaLink || '/shop',
    promoCode,
    discountPercent,
    endsAt: top.endsAt ? top.endsAt.toISOString() : null,
    showCountdown: top.showCountdown,
  };
  return NextResponse.json({ popup });
}
