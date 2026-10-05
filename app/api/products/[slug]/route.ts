import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: { slug, archived: false },
    include: {
      series: true,
      category: true,
    },
  });

  if (!product) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(product);
}
