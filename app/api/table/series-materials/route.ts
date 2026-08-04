import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const series = await prisma.series.findMany({ select: { name: true, materials: true } });

  const result: Record<string, string[]> = {};
  for (const s of series) {
    if (s.materials) {
      try { result[s.name] = JSON.parse(s.materials); } catch { /* ignore */ }
    }
  }
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { series: string; materials: string[] };
  if (!body.series || !Array.isArray(body.materials)) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  await prisma.series.update({
    where: { name: body.series },
    data: { materials: JSON.stringify(body.materials) },
  });

  return NextResponse.json({ ok: true });
}
