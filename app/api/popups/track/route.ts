import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

const isRateLimited = createRateLimiter(120, 60_000);

const FIELD = { view: 'views', click: 'clicks', close: 'closes' } as const;

// Daily aggregate counters (not one row per event) so the table stays tiny
// no matter how much traffic a popup gets.
export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) return NextResponse.json({ ok: false }, { status: 429 });

  let body: { id?: unknown; event?: unknown };
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const id = typeof body.id === 'number' ? body.id : NaN;
  const event = typeof body.event === 'string' ? body.event : '';
  if (!Number.isInteger(id) || !(event in FIELD)) return NextResponse.json({ ok: false }, { status: 400 });

  // Ignore ids that aren't real popups so junk can't accumulate.
  const exists = await prisma.popup.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ ok: false }, { status: 404 });

  const day = new Date().toISOString().slice(0, 10);
  const field = FIELD[event as keyof typeof FIELD];
  await prisma.popupStat.upsert({
    where: { popupId_day: { popupId: id, day } },
    create: { popupId: id, day, [field]: 1 },
    update: { [field]: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
