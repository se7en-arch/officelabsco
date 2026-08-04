import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { copyFileSync } from 'fs';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SRC  = `C:\\Users\\Jimmy\\Desktop\\Office Labs\\.office labs models\\Models to upload`;
const DEST = `C:\\Users\\Jimmy\\Desktop\\OfficeLabsCo\\public\\products`;

// src subfolder, dest prefix
const products = [
  { src: 'Terra Desk (caramel)',        dest: 'terra-desk-caramel'    },
  { src: 'Terra Desk (euqalypt)',        dest: 'terra-desk-eucalypt'   },
  { src: 'Terra High Cab (caramel)',     dest: 'terra-high-cab-caramel'},
  { src: 'Terra High Cab (euqalypt)',    dest: 'terra-high-cab-eucalypt'},
  { src: 'Terra Low Cabinet (caramel)', dest: 'terra-low-cab-caramel' },
  { src: 'Terra Low Cabinet (euqalypt)',dest: 'terra-low-cab-eucalypt' },
  { src: 'Terra Plant (caramel)',       dest: 'terra-plant-caramel'   },
  { src: 'Terra Plant (euqalypt)',      dest: 'terra-plant-eucalypt'  },
  { src: 'Terra shelf (caramel)',       dest: 'terra-shelf-caramel'   },
  { src: 'Terra shelf (euqalypt)',      dest: 'terra-shelf-eucalypt'  },
];

// front=1, ortho=2, side=3
const files = [
  ['front.png', '1'],
  ['ortho.png', '2'],
  ['side.png',  '3'],
];

for (const p of products) {
  for (const [srcFile, n] of files) {
    const from = `${SRC}\\${p.src}\\PNG\\${srcFile}`;
    const to   = `${DEST}\\${p.dest}-${n}.png`;
    copyFileSync(from, to);
    console.log(`✓ ${p.dest}-${n}.png`);
  }
}

// Update DB — images arrays now have 3 entries (no more -4 for desk)
const dbProducts = [
  {
    id: 2,
    prefix: 'terra-desk',
    mainImage: '/products/terra-desk-caramel-1.png',
    images: [
      '/products/terra-desk-caramel-1.png',
      '/products/terra-desk-caramel-2.png',
      '/products/terra-desk-caramel-3.png',
    ],
  },
  {
    id: 10,
    prefix: 'terra-low-cab',
    mainImage: '/products/terra-low-cab-caramel-1.png',
    images: [
      '/products/terra-low-cab-caramel-1.png',
      '/products/terra-low-cab-caramel-2.png',
      '/products/terra-low-cab-caramel-3.png',
    ],
  },
  {
    id: 14,
    prefix: 'terra-high-cab',
    mainImage: '/products/terra-high-cab-caramel-1.png',
    images: [
      '/products/terra-high-cab-caramel-1.png',
      '/products/terra-high-cab-caramel-2.png',
      '/products/terra-high-cab-caramel-3.png',
    ],
  },
  {
    id: 26,
    prefix: 'terra-plant',
    mainImage: '/products/terra-plant-caramel-1.png',
    images: [
      '/products/terra-plant-caramel-1.png',
      '/products/terra-plant-caramel-2.png',
      '/products/terra-plant-caramel-3.png',
    ],
  },
  {
    id: 30,
    prefix: 'terra-shelf',
    mainImage: '/products/terra-shelf-caramel-1.png',
    images: [
      '/products/terra-shelf-caramel-1.png',
      '/products/terra-shelf-caramel-2.png',
      '/products/terra-shelf-caramel-3.png',
    ],
  },
];

for (const p of dbProducts) {
  const r = await db.execute({
    sql: `UPDATE Product SET image = ?, images = ? WHERE id = ?`,
    args: [p.mainImage, JSON.stringify(p.images), p.id],
  });
  console.log(`✓ DB id=${p.id} (${r.rowsAffected} row)`);
}

console.log('\nDone!');
