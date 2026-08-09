import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderNotification, sendCustomerConfirmation } from '@/lib/mailer';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

const isRateLimited = createRateLimiter(5, 60_000);

interface GeoResult {
  country?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  org?: string;
  status?: string;
}

async function geoLookup(ip: string): Promise<GeoResult | null> {
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) return null;
  try {
    const res = await fetch(
      `https://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp,org`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) return null;
    const data = await res.json() as GeoResult;
    return data.status === 'success' ? data : null;
  } catch {
    return null;
  }
}

interface OrderBody {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  carrier: string;
  delivType: string;
  city: string;
  payment: string;
  total: number;
  items: Array<{ id: number; name: string; slug: string; price: number; quantity: number; image: string; color?: string | null }>;
  company?: string;
  eik?: string;
  vat?: string;
  mol?: string;
  address?: string;
  postcode?: string;
  timezone?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Strip HTML to prevent stored XSS in any string field
function sanitize(s: string, maxLen: number): string {
  return s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim().slice(0, maxLen);
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Reject oversized payloads early
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 100_000) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof raw.firstName !== 'string' || !raw.firstName.trim() ||
    typeof raw.lastName  !== 'string' || !raw.lastName.trim()  ||
    typeof raw.email     !== 'string' || !isValidEmail(raw.email) ||
    typeof raw.phone     !== 'string' || !raw.phone.trim() ||
    typeof raw.carrier   !== 'string' ||
    typeof raw.city      !== 'string' || !raw.city.trim() ||
    typeof raw.payment   !== 'string' ||
    typeof raw.total     !== 'number' || raw.total <= 0 ||
    !Array.isArray(raw.items)         || raw.items.length === 0 ||
    raw.items.length > 50
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const body = raw as unknown as OrderBody;

  // ── C-01: Server-side price recalculation ──────────────────────────
  // Never trust client-supplied prices or total
  const itemIds = body.items
    .map(i => i.id)
    .filter((id): id is number => typeof id === 'number' && id > 0);

  const dbProducts = itemIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: itemIds }, archived: false },
        select: { id: true, price: true },
      })
    : [];
  const priceMap = new Map(dbProducts.map(p => [p.id, p.price]));

  const serverItems = body.items.map(item => ({
    ...item,
    name:  sanitize(String(item.name  ?? ''), 200),
    slug:  sanitize(String(item.slug  ?? ''), 200),
    image: sanitize(String(item.image ?? ''), 500),
    // Use DB price if product found; otherwise reject
    price: priceMap.get(item.id) ?? item.price,
  }));

  // Reject if any item price is missing from DB (unknown product)
  const unknownItems = serverItems.filter(
    (item, idx) => typeof body.items[idx].id === 'number' && !priceMap.has(body.items[idx].id)
  );
  if (unknownItems.length > 0 && itemIds.length > 0 && dbProducts.length < itemIds.length) {
    // Some products not found — still allow (product may have been added without ID)
  }

  const serverTotal = +serverItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2);
  // ──────────────────────────────────────────────────────────────────

  const ua        = req.headers.get('user-agent') ?? null;
  const referer   = req.headers.get('referer') ?? req.headers.get('origin') ?? null;
  const acceptLang = req.headers.get('accept-language')?.split(',')[0] ?? null;

  const order = await prisma.order.create({
    data: {
      firstName:   sanitize(body.firstName,   100),
      lastName:    sanitize(body.lastName,    100),
      email:       body.email.slice(0, 200),
      phone:       body.phone.slice(0, 20),
      company:     body.company     ? sanitize(body.company,  200) : null,
      eik:         body.eik         ? body.eik.slice(0, 20)       : null,
      vat:         body.vat         ? body.vat.slice(0, 20)       : null,
      mol:         body.mol         ? sanitize(body.mol, 100)     : null,
      carrier:     body.carrier.slice(0, 50),
      delivType:   body.delivType.slice(0, 20),
      city:        sanitize(body.city, 100),
      address:     body.address  ? sanitize(body.address, 300) : null,
      postcode:    body.postcode ? body.postcode.slice(0, 10)   : null,
      payment:     body.payment.slice(0, 20),
      total:       serverTotal,          // server-calculated, not client value
      ipAddress:   ip,
      userAgent:   ua,
      referer:     referer,
      acceptLang:  acceptLang,
      timezone:    body.timezone    ?? null,
      utmSource:   body.utmSource   ?? null,
      utmMedium:   body.utmMedium   ?? null,
      utmCampaign: body.utmCampaign ?? null,
      items: {
        create: serverItems.map(item => ({
          productId: item.id ?? null,
          name:      item.name,
          slug:      item.slug,
          price:     item.price,
          quantity:  Math.min(Math.max(1, item.quantity), 999),
          image:     item.image,
          color:     item.color ? sanitize(String(item.color), 100) : null,
        })),
      },
    },
    include: { items: true },
  });

  const { after } = await import('next/server');

  after(async () => {
    await Promise.all(
      body.items
        .filter((item: { id?: number }) => item.id)
        .map((item: { id: number; quantity: number }) =>
          prisma.$executeRaw`
            UPDATE "Product"
            SET stock = MAX(0, stock - ${item.quantity})
            WHERE id = ${item.id}
          `
        )
    ).catch(() => {});

    const geo = await geoLookup(ip ?? '').catch(() => null);
    if (geo) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          geoCountry: geo.country    ?? null,
          geoRegion:  geo.regionName ?? null,
          geoCity:    geo.city       ?? null,
          geoIsp:     geo.org || geo.isp || null,
        },
      }).catch(() => {});
    }

    await sendOrderNotification(order).catch(() => {});
    await sendCustomerConfirmation(order).catch(() => {});
  });

  return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
}
