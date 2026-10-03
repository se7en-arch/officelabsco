import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendDealerResetLink } from '@/lib/mailer';
import { createResetToken } from '@/lib/dealer-reset';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// 3 requests per hour per IP — stops someone from spamming reset emails.
const isRateLimited = createRateLimiter(3, 60 * 60_000);

// Dealer-facing site (middleware rewrites dealers.* → /dealers/*).
const DEALERS_BASE = process.env.NEXT_PUBLIC_DEALERS_URL ?? 'https://dealers.officelabsco.com';

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Твърде много опити. Опитайте след час.' }, { status: 429 });
  }

  // Same response whether or not the account exists — no account enumeration.
  const genericOk = NextResponse.json({
    ok: true,
    message: 'Ако имейлът е регистриран при нас, ще получите линк за смяна на паролата в рамките на няколко минути.',
  });

  try {
    const { email } = await req.json();
    const normalized = String(email ?? '').trim().toLowerCase();
    if (!normalized) return genericOk;

    const dealer = await prisma.dealer.findUnique({ where: { email: normalized } });
    if (!dealer) return genericOk;

    const token = await createResetToken(dealer.id);
    const link = `${DEALERS_BASE}/reset?id=${encodeURIComponent(dealer.id)}&token=${token}`;
    await sendDealerResetLink(dealer.email, dealer.contactName, link);
    return genericOk;
  } catch {
    return genericOk;
  }
}
