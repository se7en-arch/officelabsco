import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken });

try {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "PromoCode" (
      "id"        INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
      "code"      TEXT     NOT NULL,
      "discount"  INTEGER  NOT NULL,
      "active"    INTEGER  NOT NULL DEFAULT 1,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ PromoCode table created');

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS "PromoCode_code_key" ON "PromoCode"("code")
  `);
  console.log('✓ Unique index on code created');

  // Migrate existing hardcoded codes
  for (const [code, discount] of [['PROMO5', 5], ['PROMO10', 10]]) {
    try {
      await client.execute({
        sql: `INSERT INTO "PromoCode" ("code", "discount") VALUES (?, ?)`,
        args: [code, discount],
      });
      console.log(`✓ Inserted ${code} (${discount}%)`);
    } catch (e) {
      if (e.message?.includes('UNIQUE constraint')) {
        console.log(`ℹ ${code} already exists, skipping`);
      } else throw e;
    }
  }

  console.log('\nДона! Отиди на /adminpanel/promos за да управляваш кодовете.');
} catch (e) {
  console.error('Error:', e.message);
  process.exit(1);
}

client.close();
