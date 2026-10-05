import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

const isRateLimited = createRateLimiter(8, 60_000, 'subscribe');
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Email signup — from the email popup (which can hand out a discount code)
// or the shop's newsletter form. Consent is mandatory and recorded.
export async function POST(req: NextRequest) {
  if (await isRateLimited(getIp(req))) return NextResponse.json({ error: 'too_many' }, { status: 429 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'bad_request' }, { status: 400 }); }

  // Honeypot: real users never see or fill this field. Pretend success so
  // bots get no signal.
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RX.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (body.consent !== true) return NextResponse.json({ error: 'consent_required' }, { status: 400 });

  const locale = body.locale === 'en' ? 'en' : 'bg';
  const popupId = typeof body.popupId === 'number' && Number.isInteger(body.popupId) ? body.popupId : null;

  // The reward code comes from the popup's own (server-side) settings —
  // never from anything the client sends.
  let promoCode: string | null = null;
  let discountPercent: number | null = null;
  let source = 'shop-form';
  if (popupId !== null) {
    const now = new Date();
    const popup = await prisma.popup.findFirst({ where: { id: popupId, type: 'email', active: true } });
    if (popup && (!popup.startsAt || popup.startsAt <= now) && (!popup.endsAt || popup.endsAt > now)) {
      source = `popup:${popup.id}`;
      if (popup.promoCode) {
        const promo = await prisma.promoCode.findFirst({
          where: { code: popup.promoCode, active: true }, select: { code: true, discount: true },
        });
        if (promo) { promoCode = promo.code; discountPercent = promo.discount; }
      }
    }
  }

  // Already subscribed is not an error (and doesn't reveal that they were).
  await prisma.subscriber.upsert({
    where: { email },
    create: { email, locale, source, popupId, consent: true },
    update: {},
  });

  return NextResponse.json({ ok: true, promoCode, discountPercent });
}
