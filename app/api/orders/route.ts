import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderNotification } from '@/lib/mailer';

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
  items: Array<{ id: number; name: string; slug: string; price: number; quantity: number; image: string }>;
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

export async function POST(req: NextRequest) {
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
    !Array.isArray(raw.items)         || raw.items.length === 0
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
  }

  const body = raw as unknown as OrderBody;

  const ip        = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
                 ?? req.headers.get('x-real-ip')
                 ?? req.headers.get('cf-connecting-ip')
                 ?? null;
  const ua        = req.headers.get('user-agent') ?? null;
  const referer   = req.headers.get('referer') ?? req.headers.get('origin') ?? null;
  const acceptLang = req.headers.get('accept-language')?.split(',')[0] ?? null;

  const order = await prisma.order.create({
    data: {
      firstName:   body.firstName,
      lastName:    body.lastName,
      email:       body.email,
      phone:       body.phone,
      company:     body.company     ?? null,
      eik:         body.eik         ?? null,
      vat:         body.vat         ?? null,
      mol:         body.mol         ?? null,
      carrier:     body.carrier,
      delivType:   body.delivType,
      city:        body.city,
      address:     body.address     ?? null,
      postcode:    body.postcode    ?? null,
      payment:     body.payment,
      total:       body.total,
      ipAddress:   ip,
      userAgent:   ua,
      referer:     referer,
      acceptLang:  acceptLang,
      timezone:    body.timezone    ?? null,
      utmSource:   body.utmSource   ?? null,
      utmMedium:   body.utmMedium   ?? null,
      utmCampaign: body.utmCampaign ?? null,
      items: {
        create: body.items.map((item: {
          id: number; name: string; slug: string;
          price: number; quantity: number; image: string;
        }) => ({
          productId: item.id   ?? null,
          name:      item.name,
          slug:      item.slug,
          price:     item.price,
          quantity:  item.quantity,
          image:     item.image,
        })),
      },
    },
    include: { items: true },
  });

  // Decrement stock, geo lookup, and email — run after response via after()
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
  });

  return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
}
