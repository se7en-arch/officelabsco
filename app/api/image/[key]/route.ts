import { NextResponse } from 'next/server';

// Снимките се сервират директно от Vercel Blob URL.
export async function GET() {
  return new NextResponse(null, { status: 404 });
}
