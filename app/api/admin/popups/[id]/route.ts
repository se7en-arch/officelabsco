import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { parsePopupInput } from '@/lib/popup-validate';
import { toAdminPopup } from '@/lib/popup-serialize';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt((await params).id, 10);
  const existing = await prisma.popup.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Няма такъв попъп' }, { status: 404 });

  const body = (await req.json()) as Record<string, unknown>;
  const parsed = parsePopupInput(body, true);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Anything beyond a plain on/off toggle, or turning it back on (a
  // relaunch), bumps `version` so visitors who dismissed the previous
  // incarnation see it again instead of staying suppressed.
  const keys = Object.keys(parsed.data);
  const onlyToggledOff = keys.length === 1 && keys[0] === 'active' && parsed.data.active === false;
  const relaunch = parsed.data.active === true && !existing.active;
  const data = { ...parsed.data, ...(!onlyToggledOff || relaunch ? { version: { increment: 1 } } : {}) };

  const row = await prisma.popup.update({ where: { id }, data: data as never });
  return NextResponse.json(toAdminPopup(row));
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt((await params).id, 10);
  await prisma.popup.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
