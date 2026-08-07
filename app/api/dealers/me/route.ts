import { NextResponse } from 'next/server';
import { getDealerSession } from '@/lib/dealer-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getDealerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const dealer = await prisma.dealer.findUnique({
    where: { id: session.id },
    select: {
      companyName: true, contactName: true, email: true, phone: true,
      address: true, city: true, eik: true, vatRegistered: true,
      vatNumber: true, discountPercent: true, status: true, createdAt: true,
    },
  });

  if (!dealer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(dealer);
}
