import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Cells starting with = + - @ are interpreted as formulas by Excel/Sheets
// (CSV injection) — prefix them so an address like "+x@y.com" stays text.
const cell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } });
  const lines = [
    'email,language,source,subscribed_at',
    ...rows.map((r) => [r.email, r.locale, r.source ?? '', r.createdAt.toISOString()].map(cell).join(',')),
  ];
  // BOM so Excel opens it as UTF-8.
  return new NextResponse('﻿' + lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
