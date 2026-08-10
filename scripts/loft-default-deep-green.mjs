import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const updates = [
  { id: 3,  image: '/products/loft-desk-deep-green-1.png',        images: ['/products/loft-desk-deep-green-1.png','/products/loft-desk-deep-green-2.png','/products/loft-desk-deep-green-3.png'] },
  { id: 7,  image: '/products/loft-coffee-table-deep-green-1.png', images: ['/products/loft-coffee-table-deep-green-1.png','/products/loft-coffee-table-deep-green-2.png','/products/loft-coffee-table-deep-green-3.png'] },
  { id: 11, image: '/products/loft-low-cab-deep-green-1.png',      images: ['/products/loft-low-cab-deep-green-1.png','/products/loft-low-cab-deep-green-2.png','/products/loft-low-cab-deep-green-3.png'] },
  { id: 15, image: '/products/loft-high-cab-deep-green-1.png',     images: ['/products/loft-high-cab-deep-green-1.png','/products/loft-high-cab-deep-green-2.png','/products/loft-high-cab-deep-green-3.png'] },
  { id: 23, image: '/products/loft-container-deep-green-1.png',    images: ['/products/loft-container-deep-green-1.png','/products/loft-container-deep-green-2.png','/products/loft-container-deep-green-3.png'] },
  { id: 27, image: '/products/loft-plant-deep-green-1.png',        images: ['/products/loft-plant-deep-green-1.png','/products/loft-plant-deep-green-2.png','/products/loft-plant-deep-green-3.png'] },
  { id: 31, image: '/products/loft-shelf-deep-green-1.png',        images: ['/products/loft-shelf-deep-green-1.png','/products/loft-shelf-deep-green-2.png','/products/loft-shelf-deep-green-3.png'] },
];

for (const u of updates) {
  await db.execute({
    sql: 'UPDATE Product SET image = ?, images = ? WHERE id = ?',
    args: [u.image, JSON.stringify(u.images), u.id],
  });
  console.log(`✓ id=${u.id} → deep green`);
}

db.close();
console.log('\nDone.');
