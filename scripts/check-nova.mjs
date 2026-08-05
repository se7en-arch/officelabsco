import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

// Check full schema of one Nova product
const r = await db.execute(`SELECT * FROM Product WHERE id = 4`);
console.log('Columns:', Object.keys(r.rows[0]));
console.log('\nAll values:');
for (const [k, v] of Object.entries(r.rows[0])) {
  console.log(`  ${k}: ${v}`);
}

// Also check if there's a ProductVariant or colors table
const tables = await db.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
console.log('\nTables:', tables.rows.map(r => r.name).join(', '));

await db.close();
