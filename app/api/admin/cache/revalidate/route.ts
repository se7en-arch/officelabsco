import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { isAdminAuthenticated } from '@/lib/admin-auth';

// Bulk cache-bust for scripted/direct DB edits (e.g. a one-off SQL script
// against Turso) that skip the normal admin API routes and therefore never
// trigger their per-save revalidatePath() calls. Revalidates every public
// page whose content is sourced from the DB, for both locales.
export async function POST() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await prisma.product.findMany({ select: { slug: true } });

  const paths = new Set<string>(['/', '/en', '/shop', '/en/shop']);
  for (const p of products) {
    paths.add(`/shop/${p.slug}`);
    paths.add(`/en/shop/${p.slug}`);
  }

  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ ok: true, revalidated: paths.size });
}
