import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const DEALER_SECRET = process.env.DEALER_SECRET ?? 'officelabs-dealer-secret-2024';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE = 'dealer_session';

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password: string): Promise<string> {
  return sha256(password + DEALER_SECRET);
}

function makeToken(dealerId: string, passwordHash: string, issuedAt: number): Promise<string> {
  return sha256(`${dealerId}:${passwordHash}:${DEALER_SECRET}:${issuedAt}`)
    .then(sig => `${dealerId}.${issuedAt.toString(36)}.${sig}`);
}

export async function setDealerCookie(dealerId: string, passwordHash: string): Promise<void> {
  const issuedAt = Date.now();
  const token = await makeToken(dealerId, passwordHash, issuedAt);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE_MS / 1000,
    path: '/',
  });
}

export async function clearDealerCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getDealerSession(): Promise<{ id: string; status: string; discountPercent: number } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length < 3) return null;
  const [dealerId, issuedAtHex, sig] = parts;
  const issuedAt = parseInt(issuedAtHex, 36);
  if (isNaN(issuedAt) || Date.now() - issuedAt > TOKEN_MAX_AGE_MS) return null;

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { id: true, passwordHash: true, status: true, discountPercent: true },
    });
    if (!dealer) return null;

    const expected = await sha256(`${dealerId}:${dealer.passwordHash}:${DEALER_SECRET}:${issuedAt}`);
    if (sig !== expected) return null;

    return { id: dealer.id, status: dealer.status, discountPercent: dealer.discountPercent };
  } catch {
    return null;
  }
}

export async function requireDealerSession() {
  const session = await getDealerSession();
  return session;
}
