import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return NextResponse.json({ error: 'Няма файл' }, { status: 400 });

  // L-02: Validate MIME type and size
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Позволени формати: JPEG, PNG, WebP' }, { status: 415 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Файлът е твърде голям. Максимум 10 MB.' }, { status: 413 });
  }

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  const ext = extMap[file.type] ?? 'jpg';
  const key = `product-${Date.now()}.${ext}`;

  const blob = await put(key, file, { access: 'public' });
  return NextResponse.json({ path: blob.url });
}
