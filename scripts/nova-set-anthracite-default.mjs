import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const products = [
  { id: 4,  image: '/products/nova-desk-diamond-1.png',     images: ['/products/nova-desk-diamond-1.png',    '/products/nova-desk-diamond-2.png',    '/products/nova-desk-diamond-3.png']    },
  { id: 12, image: '/products/nova-low-cab-diamond-1.png',  images: ['/products/nova-low-cab-diamond-1.png', '/products/nova-low-cab-diamond-2.png', '/products/nova-low-cab-diamond-3.png'] },
  { id: 16, image: '/products/nova-high-cab-diamond-1.png', images: ['/products/nova-high-cab-diamond-1.png','/products/nova-high-cab-diamond-2.png','/products/nova-high-cab-diamond-3.png'] },
  { id: 28, image: '/products/nova-plant-diamond-1.png',    images: ['/products/nova-plant-diamond-1.png',   '/products/nova-plant-diamond-2.png',   '/products/nova-plant-diamond-3.png']   },
  { id: 32, image: '/products/nova-shelf-diamond-1.png',    images: ['/products/nova-shelf-diamond-1.png',   '/products/nova-shelf-diamond-2.png',   '/products/nova-shelf-diamond-3.png']   },
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
