import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

// Remove images from loft-wall-shelf (id=19) — wrong product
await db.execute({
  sql: `UPDATE Product SET image = ?, images = ? WHERE id = 19`,
  args: ['/images/no-image.svg', JSON.stringify(['/images/no-image.svg'])],
});
console.log('✓ id=19 (loft-wall-shelf) → reset to no-image');

// Set images on loft-pipe-bookshelf (id=31) — correct product
await db.execute({
  sql: `UPDATE Product SET image = ?, images = ? WHERE id = 31`,
  args: [
    '/products/loft-shelf-black-1.png',
    JSON.stringify([
      '/products/loft-shelf-black-1.png',
      '/products/loft-shelf-black-2.png',
      '/products/loft-shelf-black-3.png',
    ]),
  ],
});
console.log('✓ id=31 (loft-pipe-bookshelf) → loft-shelf-black images');

await db.close();
console.log('\nDone!');
