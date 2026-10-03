import { NextRequest, NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/dealer-auth';
import { sendDealerNewPassword } from '@/lib/mailer';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// 3 requests per hour per IP — stops someone from spamming reset emails.
const isRateLimited = createRateLimiter(3, 60 * 60_000);

// Unambiguous characters only (no 0/O, 1/l/I) so it's easy to type from an email.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
function generatePassword(length = 12): string {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след час.' }, { status: 429 });
  }

  // Same response whether or not the account exists — no account enumeration.
  const genericOk = NextResponse.json({
    ok: true,
    message: 'Ако имейлът е регистриран при нас, ще получите нова парола на него в рамките на няколко минути.',
  });

  try {
    const { email } = await req.json();
    const normalized = String(email ?? '').trim().toLowerCase();
    if (!normalized) return genericOk;

    const dealer = await prisma.dealer.findUnique({ where: { email: normalized } });
    if (!dealer) return genericOk;

    const newPassword = generatePassword();
    // Overwriting the hash also invalidates any existing dealer session cookie,
    // since sessions are bound to the stored passwordHash.
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    await sendDealerNewPassword(dealer.email, dealer.contactName, newPassword);
    return genericOk;
  } catch {
    return genericOk;
  }
}
