import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const DEALER_SECRET = process.env.DEALER_SECRET ?? 'officelabs-dealer-secret-2024';
const TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const COOKIE = 'dealer_session';
const BCRYPT_ROUNDS = 10;

async function sha256(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// L-01: Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Run a dummy comparison to avoid short-circuit timing leak
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ 0;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// H-04: bcrypt for new passwords; legacy SHA-256 accepted with auto-upgrade on next login
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function legacyHash(password: string): Promise<string> {
  return sha256(password + DEALER_SECRET);
}

// Returns true if password matches, and whether the hash needs upgrading
async function checkPassword(
  password: string,
  storedHash: string
): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  // bcrypt hashes start with $2b$ or $2a$
  if (storedHash.startsWith('$2')) {
    const ok = await bcrypt.compare(password, storedHash);
    return { ok, needsUpgrade: false };
  }
  // Legacy SHA-256 path — auto-upgrade to bcrypt on successful login
  const legacy = await legacyHash(password);
  return { ok: timingSafeEqual(legacy, storedHash), needsUpgrade: true };
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const { ok } = await checkPassword(password, storedHash);
  return ok;
}

// Verify password, upgrade hash if legacy, return dealer ID or null
export async function verifyAndUpgrade(
  password: string,
  dealer: { id: string; passwordHash: string }
): Promise<boolean> {
  const { ok, needsUpgrade } = await checkPassword(password, dealer.passwordHash);
  if (!ok) return false;
  if (needsUpgrade) {
    const newHash = await hashPassword(password);
    await prisma.dealer.update({
      where: { id: dealer.id },
      data: { passwordHash: newHash },
    }).catch(() => {});
  }
  return true;
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
    if (!timingSafeEqual(sig, expected)) return null;

    return { id: dealer.id, status: dealer.status, discountPercent: dealer.discountPercent };
  } catch {
    return null;
  }
}

export async function requireDealerSession() {
  return getDealerSession();
}
