import { createClient } from '@libsql/client';

const c = createClient({
  url:       process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log('Running dealer address migration...\n');

const steps = [
  // Dealer: add company postcode
  `ALTER TABLE "Dealer" ADD COLUMN "companyPostcode" TEXT`,

  // DealerOrder: readable sequential number + delivery address snapshot
  `ALTER TABLE "DealerOrder" ADD COLUMN "orderNumber" INTEGER`,
  `ALTER TABLE "DealerOrder" ADD COLUMN "deliveryAddressId" TEXT`,
  `ALTER TABLE "DealerOrder" ADD COLUMN "deliveryLabel" TEXT`,
  `ALTER TABLE "DealerOrder" ADD COLUMN "deliveryAddress" TEXT`,
  `ALTER TABLE "DealerOrder" ADD COLUMN "deliveryCity" TEXT`,
  `ALTER TABLE "DealerOrder" ADD COLUMN "deliveryPostcode" TEXT`,

  // New table: multiple delivery addresses per dealer
  `CREATE TABLE IF NOT EXISTS "DealerAddress" (
    "id"        TEXT    NOT NULL PRIMARY KEY,
    "dealerId"  TEXT    NOT NULL REFERENCES "Dealer"("id") ON DELETE CASCADE,
    "label"     TEXT    NOT NULL DEFAULT 'Основен адрес',
    "address"   TEXT    NOT NULL,
    "city"      TEXT    NOT NULL,
    "postcode"  TEXT,
    "isDefault" INTEGER NOT NULL DEFAULT 0
  )`,

  `CREATE INDEX IF NOT EXISTS "DealerAddress_dealerId_idx" ON "DealerAddress"("dealerId")`,
];

for (const sql of steps) {
  try {
    await c.execute(sql);
    const name = sql.trim().split('\n')[0].slice(0, 70);
    console.log(`  ✓ ${name}`);
  } catch (e) {
    if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
      console.log(`  ↩ skip (already exists)`);
    } else {
      console.error(`  ✗ ${e.message}`);
    }
  }
}

console.log('\n✅ Migration complete.');
c.close();
