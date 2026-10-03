import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { missingSellerFields } from '@/lib/seller';
import { sendProforma } from '@/lib/proforma';

// Sends the proforma invoice to the customer's email.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const missing = missingSellerFields();
  if (missing.length) {
    return NextResponse.json({ error: `Попълни данните на фирмата в lib/seller.ts: ${missing.join(', ')}` }, { status: 400 });
  }

  const { id } = await params;
  const [order, vatSetting] = await Promise.all([
    prisma.order.findUnique({ where: { id: parseInt(id) }, include: { items: true } }),
    prisma.siteSettings.findUnique({ where: { key: 'vat_rate' } }),
  ]);
  if (!order) return NextResponse.json({ error: 'Поръчката не е намерена.' }, { status: 404 });

  const vatPct = parseFloat(vatSetting?.value ?? '0') || 0;
  const result = await sendProforma(order, vatPct);
  if (!result.ok) return NextResponse.json({ error: result.error ?? 'Грешка при изпращане.' }, { status: 502 });

  return NextResponse.json({ ok: true, to: order.email });
}
