import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Entry { count: number; resetAt: number; }

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

// Rate limits are kept in the shared database (SiteSettings rows "rl:<label>:<ip>"),
// not in process memory. On Vercel every request can land on a different instance,
// so in-memory counters would let an attacker multiply the limit by hitting many
// instances. Each limiter has its own label, so unrelated routes do not share a budget.
export function createRateLimiter(limit: number, windowMs: number, label: string) {
  return async function isLimited(ip: string): Promise<boolean> {
    const key = `rl:${label}:${ip}`;
    const now = Date.now();
    try {
      const row = await prisma.siteSettings.findUnique({ where: { key } });
      let entry: Entry | null = null;
      if (row) {
        try { entry = JSON.parse(row.value) as Entry; } catch { entry = null; }
      }
      if (!entry || now > entry.resetAt) {
        entry = { count: 1, resetAt: now + windowMs };
      } else {
        if (entry.count >= limit) return true;
        entry = { count: entry.count + 1, resetAt: entry.resetAt };
      }
      const value = JSON.stringify(entry);
      await prisma.siteSettings.upsert({ where: { key }, update: { value }, create: { key, value } });
      return false;
    } catch {
      // If the counter store is unavailable, do not block real customers.
      return false;
    }
  };
}
