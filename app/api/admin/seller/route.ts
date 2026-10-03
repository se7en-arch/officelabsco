import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSeller, saveSeller, type Seller } from '@/lib/seller';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getSeller());
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const days = Math.min(60, Math.max(1, parseInt(String(body.paymentDays), 10) || 3));
  const clean = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max);
  const seller: Seller = {
    name:        clean(body.name, 200),
    eik:         clean(body.eik, 20),
    vatNumber:   clean(body.vatNumber, 30),
    address:     clean(body.address, 300),
    bankName:    clean(body.bankName, 100),
    iban:        clean(body.iban, 34).replace(/\s+/g, '').toUpperCase(),
    bic:         clean(body.bic, 11).toUpperCase(),
    paymentDays: days,
  };
  await saveSeller(seller);
  return NextResponse.json({ ok: true, seller });
}
