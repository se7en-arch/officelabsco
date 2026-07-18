import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await prisma.siteSettings.findMany();
  const settings: Record<string, string> = {};
  for (const r of rows) settings[r.key] = r.value;
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body: Record<string, string> = await req.json();

  const ALLOWED = ['heroTitle', 'heroSubtitle', 'seoTitle', 'seoDescription', 'metaKeywords'];

  for (const [key, value] of Object.entries(body)) {
    if (!ALLOWED.includes(key)) continue;
    await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  if (body.newPassword && body.newPassword.trim()) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body.newPassword));
    const hash = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    await prisma.siteSettings.upsert({
      where: { key: 'adminPasswordHash' },
      update: { value: hash },
      create: { key: 'adminPasswordHash', value: hash },
    });
    if (body.newUsername?.trim()) {
      await prisma.siteSettings.upsert({
        where: { key: 'adminUsername' },
        update: { value: body.newUsername.trim() },
        create: { key: 'adminUsername', value: body.newUsername.trim() },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
