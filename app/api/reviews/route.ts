import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimiter, getIp } from '@/lib/rate-limit';

// M-01: 5 reviews per 10 minutes per IP
const isRateLimited = createRateLimiter(5, 10 * 60_000);

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();
}

export async function POST(req: NextRequest) {
  if (isRateLimited(getIp(req))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await req.json() as Record<string, unknown>;
  const { productId, name, rating, text } = body;

  if (!productId || !name || !rating || !text) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const r = parseInt(String(rating));
  if (r < 1 || r > 5) {
    return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
  }

  // C-02: Strip HTML tags before storing
  const cleanName = stripHtml(String(name)).slice(0, 60);
  const cleanText = stripHtml(String(text)).slice(0, 600);

  if (cleanName.length < 2 || cleanText.length < 10) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      productId: parseInt(String(productId)),
      name:     cleanName,
      rating:   r,
      text:     cleanText,
      verified: false,
    },
  });

  return NextResponse.json({
    id:        review.id,
    name:      review.name,
    rating:    review.rating,
    text:      review.text,
    verified:  review.verified,
    createdAt: review.createdAt.toISOString(),
  }, { status: 201 });
}
