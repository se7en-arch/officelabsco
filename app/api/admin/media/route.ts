import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { list, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Статични снимки от public/products/
  const productsDir = path.join(process.cwd(), 'public', 'products');
  const staticImages: { name: string; path: string; url: string }[] = [];
  try {
    const files = fs.readdirSync(productsDir);
    for (const f of files) {
      if (/\.(jpe?g|png|webp|gif|svg)$/i.test(f)) {
        const url = `/products/${f}`;
        staticImages.push({ name: f, path: url, url });
      }
    }
  } catch { /* папката не съществува */ }

  // Снимки качени в Vercel Blob
  const { blobs } = await list();
  const blobImages = blobs
    .filter(b => /\.(jpe?g|png|webp|gif|svg)$/i.test(b.pathname))
    .map(b => ({ name: b.pathname, path: b.url, url: b.url, deleteUrl: b.url }));

  const staticWithDelete = staticImages.map(f => ({ ...f, deleteUrl: null }));

  return NextResponse.json([...blobImages, ...staticWithDelete]);
}

export async function DELETE(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deleteUrl } = await req.json() as { deleteUrl: string };
  if (!deleteUrl) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  await del(deleteUrl);
  return NextResponse.json({ ok: true });
}
