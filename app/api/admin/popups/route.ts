import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { parsePopupInput } from '@/lib/popup-validate';
import { toAdminPopup } from '@/lib/popup-serialize';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.popup.findMany({ orderBy: [{ priority: 'desc' }, { id: 'asc' }] });
  return NextResponse.json(rows.map(toAdminPopup));
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json()) as Record<string, unknown>;
  const parsed = parsePopupInput(body, false);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const row = await prisma.popup.create({ data: parsed.data as never });
  return NextResponse.json(toAdminPopup(row), { status: 201 });
}
