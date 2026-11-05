import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { COLOR_VARIANTS } from '@/lib/color-variants';
import { SWATCH_STICKER_TEMPLATE } from '@/lib/sticker-generator/swatch-template';

export const dynamic = 'force-dynamic';

// One product per series whose colour variants are representative for the
// whole series — every product in a series shares the same two colours.
const REP_PRODUCT: Record<string, string> = {
  astra: 'astra-high-cabinet',
  terra: 'terra-dining-table',
  nova: 'nova-farm-table',
  loft: 'loft-steel-desk',
};

// Each series' wood/material finish swatch — a third sticker alongside its
// two fabric colours. Not a real product colour variant (so not in
// lib/color-variants.ts); no entry yet for ASTRA.
const FINISH: Record<string, { name: string; hex: string }> = {
  terra: { name: 'Естествен дъб', hex: '#C9A876' },
  nova: { name: 'Тъмен дъб', hex: '#5C4530' },
  loft: { name: 'Опушен дъб и бетон', hex: '#8D8378' },
};

// Sticker generator for the four series' colour swatches (QR → shop filtered
// to that series). Served as a standalone HTML page so it prints without
// the admin chrome — same pattern as /adminpanel/stickers.
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/adminpanel?next=/adminpanel/swatch-stickers', request.url));
  }

  const seriesRows = await prisma.series.findMany({ orderBy: { id: 'asc' } });
  const series = seriesRows.map((s) => ({
    slug: s.slug,
    name: s.name,
    brand: s.color,
    colors: [
      ...(COLOR_VARIANTS[REP_PRODUCT[s.slug]] ?? []).map((v) => ({ name: v.name, hex: v.color })),
      ...(FINISH[s.slug] ? [FINISH[s.slug]] : []),
    ],
  }));

  // Escape "<" so a colour/series name can never close the inline <script>.
  const json = JSON.stringify(series).replace(/</g, '\\u003c');

  // The site CSP (middleware.ts) only runs inline scripts that carry this request's nonce.
  const nonce = request.headers.get('x-nonce') ?? '';
  const html = SWATCH_STICKER_TEMPLATE.replace('/*SERIES*/', json).replaceAll('__CSP_NONCE__', nonce);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
