import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const updates = [
  {
    id: 3,
    name: 'Loft Бюро',
    image: '/products/loft-desk-black-1.png',
    images: JSON.stringify([
      '/products/loft-desk-black-1.png',
      '/products/loft-desk-black-2.png',
      '/products/loft-desk-black-3.png',
    ]),
  },
  {
    id: 7,
    name: 'Loft кафе маса',
    image: '/products/loft-coffee-table-black-1.png',
    images: JSON.stringify([
      '/products/loft-coffee-table-black-1.png',
      '/products/loft-coffee-table-black-2.png',
      '/products/loft-coffee-table-black-3.png',
    ]),
  },
  {
    id: 11,
    name: 'Loft Нисък шкаф',
    image: '/products/loft-low-cab-black-1.png',
    images: JSON.stringify([
      '/products/loft-low-cab-black-1.png',
      '/products/loft-low-cab-black-2.png',
      '/products/loft-low-cab-black-3.png',
    ]),
  },
  {
    id: 23,
    name: 'Loft Контейнер',
    image: '/products/loft-container-black-1.png',
    images: JSON.stringify([
      '/products/loft-container-black-1.png',
      '/products/loft-container-black-2.png',
      '/products/loft-container-black-3.png',
    ]),
  },
  {
    id: 27,
    name: 'Loft Стойка за саксии',
    image: '/products/loft-plant-black-1.png',
    images: JSON.stringify([
      '/products/loft-plant-black-1.png',
      '/products/loft-plant-black-2.png',
      '/products/loft-plant-black-3.png',
    ]),
  },
];

for (const u of updates) {
  await db.execute({
    sql: 'UPDATE Product SET image = ?, images = ? WHERE id = ?',
    args: [u.image, u.images, u.id],
  });
  console.log(`✓ Updated id=${u.id} ${u.name}`);
}

db.close();
console.log('\nDone.');
