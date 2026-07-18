import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as Record<string, any>;

  const allowed = ['name', 'nameEn', 'slug', 'sku', 'description', 'descriptionEn', 'price', 'originalPrice', 'stock', 'badge', 'seriesId', 'categoryId', 'featured', 'archived', 'image', 'images', 'dimensions', 'weight', 'colors', 'colorsEn', 'material', 'materialEn'];
  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const product = await prisma.product.update({
    where: { id: parseInt(id) },
    data,
    include: { series: true, category: true },
  });

  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/shop');
  revalidatePath('/en/shop');
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath(`/en/shop/${product.slug}`);

  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const product = await prisma.product.delete({ where: { id: parseInt(id) } });

  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/shop');
  revalidatePath('/en/shop');
  revalidatePath(`/shop/${product.slug}`);
  revalidatePath(`/en/shop/${product.slug}`);

  return NextResponse.json({ ok: true });
}
