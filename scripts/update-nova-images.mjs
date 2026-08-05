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
    id: 4, // nova-walnut-desk
    image: '/products/nova-desk-cream-1.png',
    images: [
      '/products/nova-desk-cream-1.png',
      '/products/nova-desk-cream-2.png',
      '/products/nova-desk-cream-3.png',
    ],
  },
  {
    id: 12, // nova-low-cabinet
    image: '/products/nova-low-cab-cream-1.png',
    images: [
      '/products/nova-low-cab-cream-1.png',
      '/products/nova-low-cab-cream-2.png',
      '/products/nova-low-cab-cream-3.png',
    ],
  },
  {
    id: 16, // nova-tall-wardrobe
    image: '/products/nova-high-cab-cream-1.png',
    images: [
      '/products/nova-high-cab-cream-1.png',
      '/products/nova-high-cab-cream-2.png',
      '/products/nova-high-cab-cream-3.png',
    ],
  },
  {
    id: 28, // nova-plant-stand
    image: '/products/nova-plant-cream-1.png',
    images: [
      '/products/nova-plant-cream-1.png',
      '/products/nova-plant-cream-2.png',
      '/products/nova-plant-cream-3.png',
    ],
  },
  {
    id: 32, // nova-open-shelf
    image: '/products/nova-shelf-cream-1.png',
    images: [
      '/products/nova-shelf-cream-1.png',
      '/products/nova-shelf-cream-2.png',
      '/products/nova-shelf-cream-3.png',
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
