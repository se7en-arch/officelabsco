import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
const r = await db.execute("SELECT p.id, p.name, p.slug FROM Product p JOIN Series s ON s.id=p.seriesId WHERE s.slug='terra' ORDER BY p.id");
r.rows.forEach(row => console.log(`id=${row[0]}  ${row[1]}  slug=${row[2]}`));
db.close();
