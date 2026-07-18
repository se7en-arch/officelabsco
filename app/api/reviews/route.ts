import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, any>;
  const { productId, name, rating, text } = body;

  if (!productId || !name || !rating || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const r = parseInt(rating);
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }
  if (String(name).trim().length < 2 || String(text).trim().length < 10) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      productId: parseInt(productId),
      name: String(name).trim().slice(0, 60),
      rating: r,
      text: String(text).trim().slice(0, 600),
      verified: false,
    },
  });

  return NextResponse.json({
    id: review.id,
    name: review.name,
    rating: review.rating,
    text: review.text,
    verified: review.verified,
    createdAt: review.createdAt.toISOString(),
  }, { status: 201 });
}
