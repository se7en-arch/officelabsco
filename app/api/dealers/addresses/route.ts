import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDealerSession } from '@/lib/dealer-auth';

export async function GET() {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const addresses = await prisma.dealerAddress.findMany({
    where: { dealerId: session.id },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.status !== 'APPROVED') return NextResponse.json({ error: 'Not approved' }, { status: 403 });

  const { label, address, city, postcode, isDefault } = await req.json();

  if (!address?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Адресът и градът са задължителни.' }, { status: 400 });
  }

  // Check max 10 addresses per dealer
  const count = await prisma.dealerAddress.count({ where: { dealerId: session.id } });
  if (count >= 10) {
    return NextResponse.json({ error: 'Максимум 10 адреса.' }, { status: 400 });
  }

  // If new address is default, unset all others
  if (isDefault) {
    await prisma.dealerAddress.updateMany({
      where: { dealerId: session.id },
      data:  { isDefault: false },
    });
  }

  const created = await prisma.dealerAddress.create({
    data: {
      dealerId: session.id,
      label:    String(label || 'Нов адрес').slice(0, 100),
      address:  String(address).slice(0, 300),
      city:     String(city).slice(0, 100),
      postcode: postcode ? String(postcode).slice(0, 10) : null,
      isDefault: !!isDefault,
    },
  });

  return NextResponse.json(created);
}

export async function DELETE(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.status !== 'APPROVED') return NextResponse.json({ error: 'Not approved' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const addr = await prisma.dealerAddress.findUnique({ where: { id } });
  if (!addr || addr.dealerId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.dealerAddress.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.status !== 'APPROVED') return NextResponse.json({ error: 'Not approved' }, { status: 403 });

  const { id, label, address, city, postcode, isDefault } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const addr = await prisma.dealerAddress.findUnique({ where: { id } });
  if (!addr || addr.dealerId !== session.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (isDefault) {
    await prisma.dealerAddress.updateMany({
      where: { dealerId: session.id },
      data:  { isDefault: false },
    });
  }

  const updated = await prisma.dealerAddress.update({
    where: { id },
    data: {
      label:     label   ? String(label).slice(0, 100)   : undefined,
      address:   address ? String(address).slice(0, 300) : undefined,
      city:      city    ? String(city).slice(0, 100)    : undefined,
      postcode:  postcode !== undefined ? (postcode ? String(postcode).slice(0, 10) : null) : undefined,
      isDefault: isDefault !== undefined ? !!isDefault : undefined,
    },
  });

  return NextResponse.json(updated);
}
