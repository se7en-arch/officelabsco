import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

// One-time reset tokens live in SiteSettings (key/value), so no schema change
// is needed. Only a SHA-256 of the token is stored — the raw token only exists
// in the emailed link.
const TTL_MS = 60 * 60 * 1000; // 1 hour

const keyFor = (dealerId: string) => `dealer_reset:${dealerId}`;

function sha256(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}

export async function createResetToken(dealerId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const value = JSON.stringify({ hash: sha256(token), expiresAt: Date.now() + TTL_MS });
  await prisma.siteSettings.upsert({
    where: { key: keyFor(dealerId) },
    update: { value },
    create: { key: keyFor(dealerId), value },
  });
  return token;
}

export async function consumeResetToken(dealerId: string, token: string): Promise<boolean> {
  const row = await prisma.siteSettings.findUnique({ where: { key: keyFor(dealerId) } });
  if (!row) return false;

  let stored: { hash: string; expiresAt: number };
  try { stored = JSON.parse(row.value); } catch { return false; }
  if (Date.now() > stored.expiresAt) {
    await prisma.siteSettings.delete({ where: { key: keyFor(dealerId) } }).catch(() => {});
    return false;
  }

  const a = Buffer.from(sha256(token));
  const b = Buffer.from(stored.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false; // wrong guess leaves the real link intact

  // Single use: burn the link only after it has actually been used successfully.
  await prisma.siteSettings.delete({ where: { key: keyFor(dealerId) } }).catch(() => {});
  return true;
}
