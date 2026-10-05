import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// The browser-supplied MIME type can be faked, so the file's first bytes must match too.
function matchesImageSignature(bytes: Uint8Array, type: string): boolean {
  const startsWith = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);
  if (type === 'image/jpeg') return startsWith([0xff, 0xd8, 0xff]);
  if (type === 'image/png')  return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === 'image/webp') return startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8);
  return false;
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Няма файл' }, { status: 400 });

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Позволени формати: JPEG, PNG, WebP' }, { status: 415 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Файлът е твърде голям. Максимум 10 MB.' }, { status: 413 });
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (!matchesImageSignature(head, file.type)) {
    return NextResponse.json({ error: 'Файлът не е валидна снимка.' }, { status: 415 });
  }

  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  const ext = extMap[file.type];
  const key = `product-${Date.now()}.${ext}`;

  const blob = await put(key, file, { access: 'public' });
  return NextResponse.json({ path: blob.url });
}
