/**
 * Visits all pages on the local dev server to trigger on-demand compilation.
 * Run with: npm run warmup
 */

import { networkInterfaces } from 'os';

const PORT = process.env.PORT ?? 3001;
const BASE = `http://localhost:${PORT}`;

async function waitForServer(maxMs = 60_000) {
  const start = Date.now();
  process.stdout.write('⏳ Waiting for server');
  while (Date.now() - start < maxMs) {
    try {
      await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      process.stdout.write(' ✓\n');
      return true;
    } catch {
      process.stdout.write('.');
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  process.stdout.write(' ✗ (timeout)\n');
  return false;
}

async function visit(path) {
  try {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
    console.log(`  ${res.ok ? '✓' : '✗'} ${path}`);
  } catch {
    console.log(`  ✗ ${path} (failed)`);
  }
}

async function getProductSlugs() {
  try {
    const res = await fetch(`${BASE}/shop`, { signal: AbortSignal.timeout(30_000) });
    const html = await res.text();
    const matches = [...html.matchAll(/href="\/shop\/([^"?]+)"/g)];
    return [...new Set(matches.map(m => m[1]))];
  } catch {
    return [];
  }
}

async function main() {
  const ready = await waitForServer();
  if (!ready) process.exit(1);

  console.log('\n🔥 Warming up pages...\n');

  // Static pages
  for (const path of ['/', '/shop', '/about']) {
    await visit(path);
  }

  // English versions
  for (const path of ['/en', '/en/shop', '/en/about']) {
    await visit(path);
  }

  // Product pages
  console.log('\n  Fetching product list...');
  const slugs = await getProductSlugs();
  for (const slug of slugs) {
    await visit(`/shop/${slug}`);
  }

  // Print network access info
  console.log('\n' + '─'.repeat(50));
  console.log('🚀 Ready for multi-device testing!\n');

  const nets = networkInterfaces();
  for (const iface of Object.values(nets).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`  → http://${iface.address}:${PORT}`);
    }
  }
  console.log('─'.repeat(50) + '\n');
}

main();
