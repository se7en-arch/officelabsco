import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const KEY = 'cost_calculator';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const row = await prisma.siteSettings.findUnique({ where: { key: KEY } });
  if (!row) return NextResponse.json(null);

  try {
    return NextResponse.json(JSON.parse(row.value));
  } catch {
    return NextResponse.json(null);
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  await prisma.siteSettings.upsert({
    where: { key: KEY },
    update: { value: JSON.stringify(body) },
    create: { key: KEY, value: JSON.stringify(body) },
  });

  return NextResponse.json({ ok: true });
}
