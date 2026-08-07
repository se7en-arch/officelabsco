import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setDealerCookie } from '@/lib/dealer-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, companyName, contactName, phone, address, city, eik, vatRegistered, vatNumber } = body;

    if (!email || !password || !companyName || !contactName || !phone || !address || !city || !eik) {
      return NextResponse.json({ error: 'Всички задължителни полета са необходими.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Паролата трябва да е поне 8 символа.' }, { status: 400 });
    }

    const existing = await prisma.dealer.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Имейлът вече е регистриран.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const dealer = await prisma.dealer.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        companyName,
        contactName,
        phone,
        address,
        city,
        eik,
        vatRegistered: !!vatRegistered,
        vatNumber: vatRegistered ? vatNumber : null,
        status: 'PENDING',
      },
    });

    await setDealerCookie(dealer.id, dealer.passwordHash);
    return NextResponse.json({ ok: true, status: 'PENDING' });
  } catch {
    return NextResponse.json({ error: 'Грешка при регистрацията.' }, { status: 500 });
  }
}
