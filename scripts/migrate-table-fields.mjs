import { createClient } from '@libsql/client';

const c = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

try {
  await c.execute(`ALTER TABLE "Product" ADD COLUMN "costPrice" REAL`);
  console.log('✓ costPrice added');
} catch (e) { if (e.message?.includes('duplicate')) console.log('ℹ costPrice already exists'); else throw e; }

try {
  await c.execute(`ALTER TABLE "Product" ADD COLUMN "has3dModel" INTEGER NOT NULL DEFAULT 0`);
  console.log('✓ has3dModel added');
} catch (e) { if (e.message?.includes('duplicate')) console.log('ℹ has3dModel already exists'); else throw e; }

try {
  await c.execute(`ALTER TABLE "Product" ADD COLUMN "hasDrawing" INTEGER NOT NULL DEFAULT 0`);
  console.log('✓ hasDrawing added');
} catch (e) { if (e.message?.includes('duplicate')) console.log('ℹ hasDrawing already exists'); else throw e; }

try {
  await c.execute(`ALTER TABLE "Product" ADD COLUMN "hasVisualization" INTEGER NOT NULL DEFAULT 0`);
  console.log('✓ hasVisualization added');
} catch (e) { if (e.message?.includes('duplicate')) console.log('ℹ hasVisualization already exists'); else throw e; }

console.log('\n✅ Миграцията е завършена!');
c.close();
