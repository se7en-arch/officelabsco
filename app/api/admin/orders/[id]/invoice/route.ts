import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { buildInvoiceHtml } from '@/lib/invoice-doc';
import { getSeller } from '@/lib/seller';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/adminpanel', req.url));
  }

  const { id } = await params;
  const [order, vatSetting, seller] = await Promise.all([
    prisma.order.findUnique({ where: { id: parseInt(id) }, include: { items: true } }),
    prisma.siteSettings.findUnique({ where: { key: 'vat_rate' } }),
    getSeller(),
  ]);
  if (!order) return new NextResponse('Not found', { status: 404 });

  const vatPct = parseFloat(vatSetting?.value ?? '0') || 0;
  const html = buildInvoiceHtml(order, vatPct, seller);

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
