import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setDealerCookie } from '@/lib/dealer-auth';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// M-04: 3 registrations per hour per IP
const isRateLimited = createRateLimiter(3, 60 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след един час.' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email, password, companyName, contactName, phone, address, city, eik, vatRegistered, vatNumber } = body;

    if (!email || !password || !companyName || !contactName || !phone || !address || !city || !eik) {
      return NextResponse.json({ error: 'Всички задължителни полета са необходими.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Паролата трябва да е поне 8 символа.' }, { status: 400 });
    }

    const existingEmail = await prisma.dealer.findUnique({ where: { email: email.toLowerCase() } });
    if (existingEmail) {
      return NextResponse.json({ error: 'Имейлът вече е регистриран.' }, { status: 409 });
    }

    // M-03: EIK uniqueness check at API level (DB may have legacy duplicates)
    const existingEik = await prisma.dealer.findFirst({ where: { eik: String(eik).trim() } });
    if (existingEik) {
      return NextResponse.json({ error: 'Фирмата вече е регистрирана с този ЕИК.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const dealer = await prisma.dealer.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        companyName: String(companyName).slice(0, 200),
        contactName: String(contactName).slice(0, 100),
        phone:       String(phone).slice(0, 30),
        address:     String(address).slice(0, 300),
        city:        String(city).slice(0, 100),
        eik:         String(eik).trim().slice(0, 20),
        vatRegistered: !!vatRegistered,
        vatNumber: vatRegistered ? String(vatNumber ?? '').slice(0, 30) : null,
        status: 'PENDING',
      },
    });

    await setDealerCookie(dealer.id, dealer.passwordHash);
    return NextResponse.json({ ok: true, status: 'PENDING' });
  } catch {
    return NextResponse.json({ error: 'Грешка при регистрацията.' }, { status: 500 });
  }
}
