import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Deleting a subscriber is how a "please remove my data" request is honored.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt((await params).id, 10);
  await prisma.subscriber.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
