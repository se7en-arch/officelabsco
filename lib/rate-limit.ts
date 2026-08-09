import { NextRequest } from 'next/server';

interface Entry { count: number; resetAt: number; }

// Per-instance in-memory store.
// For distributed rate limiting across Vercel instances, set:
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// and replace this with @upstash/ratelimit.
const store = new Map<string, Entry>();

export function getIp(req: NextRequest): string {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

export function createRateLimiter(limit: number, windowMs: number) {
  return function isLimited(key: string): boolean {
    const now = Date.now();
    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    if (entry.count >= limit) return true;
    entry.count++;
    return false;
  };
}
