import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const products = [
  {
    id: 15, // loft-high-cabinet
    image: '/products/loft-high-cab-black-1.png',
    images: [
      '/products/loft-high-cab-black-1.png',
      '/products/loft-high-cab-black-2.png',
      '/products/loft-high-cab-black-3.png',
    ],
  },
  {
    id: 19, // loft-wall-shelf
    image: '/products/loft-shelf-black-1.png',
    images: [
      '/products/loft-shelf-black-1.png',
      '/products/loft-shelf-black-2.png',
      '/products/loft-shelf-black-3.png',
    ],
  },
];

for (const p of products) {
  const r = await db.execute({
    sql: `UPDATE Product SET image = ?, images = ? WHERE id = ?`,
    args: [p.image, JSON.stringify(p.images), p.id],
  });
  console.log(`✓ id=${p.id}  ${p.image}  (${r.rowsAffected} row)`);
}

await db.close();
console.log('\nDone!');
