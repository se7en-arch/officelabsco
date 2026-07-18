import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, any>;
  const category = await prisma.category.create({
    data: { name: body.name, slug: body.slug },
  });

  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/shop');
  revalidatePath('/en/shop');

  return NextResponse.json(category, { status: 201 });
}
