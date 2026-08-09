/**
 * Migration: add orderCode column to Order and DealerOrder, backfill existing rows.
 * Run: node scripts/migrate-order-code.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@libsql/client';

// Load .env.local
try {
  const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  for (const line of env.split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {}

const url       = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) { console.error('DATABASE_URL not set'); process.exit(1); }

const client = createClient({ url, ...(authToken ? { authToken } : {}) });

function reverseStr(s) { return s.split('').reverse().join(''); }

function buildOrderCode(dateMs, dailySeq) {
  const d   = new Date(dateMs);
  const y   = reverseStr(String(d.getUTCFullYear()));
  const m   = reverseStr(String(d.getUTCMonth() + 1).padStart(2, '0'));
  const day = reverseStr(String(d.getUTCDate()).padStart(2, '0'));
  const seq = String(dailySeq).padStart(2, '0');
  return y + m + day + seq;
}

// 1. Add columns (idempotent)
for (const table of ['Order', 'DealerOrder']) {
  try {
    await client.execute(`ALTER TABLE "${table}" ADD COLUMN "orderCode" TEXT`);
    console.log(`✓ Added orderCode to ${table}`);
  } catch (e) {
    if (String(e).includes('duplicate column') || String(e).includes('already exists')) {
      console.log(`  orderCode already exists on ${table}, skipping`);
    } else throw e;
  }
}

// 2. Fetch all rows from both tables
const [cRows, dRows] = await Promise.all([
  client.execute('SELECT id, createdAt FROM "Order" ORDER BY createdAt ASC'),
  client.execute('SELECT id, createdAt FROM "DealerOrder" ORDER BY createdAt ASC'),
]);

// 3. Merge and sort by createdAt
const all = [
  ...cRows.rows.map(r => ({ table: 'Order',       id: r[0], ts: Number(new Date(r[1])) })),
  ...dRows.rows.map(r => ({ table: 'DealerOrder', id: r[0], ts: Number(new Date(r[1])) })),
].sort((a, b) => a.ts - b.ts);

// 4. Assign daily sequences and build codes
const dayCounters = {};
const updates = all.map(row => {
  const dateKey = new Date(row.ts).toISOString().slice(0, 10);
  dayCounters[dateKey] = (dayCounters[dateKey] || 0) + 1;
  const code = buildOrderCode(row.ts, dayCounters[dateKey]);
  return { ...row, code };
});

// 5. Apply updates
let count = 0;
for (const u of updates) {
  const idParam = u.table === 'Order' ? u.id : u.id;
  await client.execute({
    sql: `UPDATE "${u.table}" SET "orderCode" = ? WHERE id = ?`,
    args: [u.code, idParam],
  });
  count++;
}

console.log(`✓ Backfilled orderCode on ${count} order(s)`);
client.close();
