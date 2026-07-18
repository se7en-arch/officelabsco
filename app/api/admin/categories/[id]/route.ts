import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, any>;
  const allowed = ['name', 'slug'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const category = await prisma.category.update({ where: { id: parseInt(id) }, data });
  revalidatePath('/');
  revalidatePath('/en');
  return NextResponse.json(category);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const count = await prisma.product.count({ where: { categoryId: parseInt(id) } });
  if (count > 0) {
    return NextResponse.json({ error: 'Категорията има продукти и не може да бъде изтрита' }, { status: 400 });
  }

  await prisma.category.delete({ where: { id: parseInt(id) } });
  revalidatePath('/');
  revalidatePath('/en');
  return NextResponse.json({ ok: true });
}
