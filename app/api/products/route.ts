import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const seriesSlug = searchParams.get('series');
  const categorySlug = searchParams.get('category');
  const minPrice = searchParams.get('min') ? parseFloat(searchParams.get('min')!) : undefined;
  const maxPrice = searchParams.get('max') ? parseFloat(searchParams.get('max')!) : undefined;
  const featured = searchParams.get('featured') === 'true';
  const sort = searchParams.get('sort') ?? 'newest';

  const where: Record<string, unknown> = {};

  if (seriesSlug) where.series = { slug: seriesSlug };
  if (categorySlug) where.category = { slug: categorySlug };
  if (featured) where.featured = true;
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
  }

  const orderBy =
    sort === 'price-asc' ? { price: 'asc' as const } :
    sort === 'price-desc' ? { price: 'desc' as const } :
    { createdAt: 'desc' as const };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      series: { select: { name: true, slug: true, color: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  return Response.json(products);
}
