import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { STICKER_TEMPLATE } from '@/lib/sticker-generator/template';

export const dynamic = 'force-dynamic';

// Sticker generator for flat-pack parts (A4 sheets of 21 labels, QR to the product page).
// Served as a standalone HTML page so it prints without the admin chrome.
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/adminpanel?next=/adminpanel/stickers', request.url));
  }

  const products = await prisma.product.findMany({
    where: { archived: false },
    select: { slug: true, name: true, colors: true },
    orderBy: { slug: 'asc' },
  });

  // Escape "<" so a product name can never close the inline <script>.
  const json = JSON.stringify(products.map(p => ({ slug: p.slug, name: p.name.trim(), colors: p.colors })))
    .replace(/</g, '\\u003c');

  return new NextResponse(STICKER_TEMPLATE.replace('/*PRODUCTS*/', json), {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
