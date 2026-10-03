import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/dealer-auth';
import { consumeResetToken } from '@/lib/dealer-reset';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// 10 attempts per 15 minutes per IP — tokens are 256-bit, this only slows brute-force of the id.
const isRateLimited = createRateLimiter(10, 15 * 60_000);

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след 15 минути.' }, { status: 429 });
  }

  try {
    const { id, token, password } = await req.json();
    if (!id || !token || !password) {
      return NextResponse.json({ error: 'Липсват данни.' }, { status: 400 });
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Паролата трябва да е поне 8 символа.' }, { status: 400 });
    }

    const dealerId = String(id);
    const ok = await consumeResetToken(dealerId, String(token));
    if (!ok) {
      return NextResponse.json({ error: 'Линкът е невалиден или е изтекъл. Поискайте нов.' }, { status: 400 });
    }

    const dealer = await prisma.dealer.findUnique({ where: { id: dealerId }, select: { id: true } });
    if (!dealer) {
      return NextResponse.json({ error: 'Линкът е невалиден или е изтекъл. Поискайте нов.' }, { status: 400 });
    }

    // Changing the hash also signs out any existing session (sessions are bound to it).
    await prisma.dealer.update({
      where: { id: dealerId },
      data: { passwordHash: await hashPassword(String(password)) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Грешка. Опитайте отново.' }, { status: 500 });
  }
}
