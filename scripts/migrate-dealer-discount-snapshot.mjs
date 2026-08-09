/**
 * Migration: add discountPercent snapshot to DealerOrder
 * Run: node scripts/migrate-dealer-discount-snapshot.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@libsql/client';

// Load .env
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {}

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const client = createClient({ url, ...(authToken ? { authToken } : {}) });

try {
  await client.execute(
    `ALTER TABLE "DealerOrder" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0`
  );
  console.log('✓ Column "discountPercent" added to DealerOrder');
} catch (err) {
  if (String(err).includes('duplicate column') || String(err).includes('already exists')) {
    console.log('Column already exists, skipping ALTER TABLE');
  } else {
    throw err;
  }
}

const result = await client.execute(`
  UPDATE "DealerOrder"
  SET "discountPercent" = (
    SELECT "discountPercent" FROM "Dealer" WHERE "Dealer"."id" = "DealerOrder"."dealerId"
  )
`);
console.log(`✓ Backfilled ${result.rowsAffected} existing order(s) with dealer discount snapshot`);

client.close();
