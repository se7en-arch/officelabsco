import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as Record<string, any>;

  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      sku: body.sku || null,
      price: parseFloat(body.price),
      originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
      description: body.description,
      image: body.image,
      images: body.images ?? '[]',
      badge: body.badge || null,
      featured: body.featured ?? false,
      stock: parseInt(body.stock),
      seriesId: parseInt(body.seriesId),
      categoryId: parseInt(body.categoryId),
    },
  });

  revalidatePath('/');
  revalidatePath('/en');
  revalidatePath('/shop');
  revalidatePath('/en/shop');

  return NextResponse.json(product, { status: 201 });
}
