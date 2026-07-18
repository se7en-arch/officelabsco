import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const series = await prisma.series.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json(series);
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, any>;
  const series = await prisma.series.create({
    data: {
      name: body.name,
      slug: body.slug,
      tagline: body.tagline ?? '',
      description: body.description ?? '',
      color: body.color ?? '#1C1C1C',
      image: body.image ?? null,
    },
  });

  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/shop');
  revalidatePath('/en/shop');

  return NextResponse.json(series, { status: 201 });
}
