// Migrate to unified order numbering across Order and DealerOrder tables.
// Run once: node scripts/migrate-unified-order-numbers.mjs
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function run() {
  // 1. Add orderNumber column to Order table
  try {
    await client.execute('ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER');
    console.log('✓ Added orderNumber column to Order');
  } catch (e) {
    if (e.message?.includes('duplicate column')) {
      console.log('  orderNumber column already exists in Order, skipping');
    } else throw e;
  }

  // 2. Backfill: set Order.orderNumber = Order.id for all existing rows
  const filled = await client.execute('UPDATE "Order" SET "orderNumber" = "id" WHERE "orderNumber" IS NULL');
  console.log(`✓ Backfilled ${filled.rowsAffected} Order rows with orderNumber = id`);

  // 3. Renumber existing DealerOrders to avoid collision with Order IDs
  //    DealerOrder.orderNumber (1, 2, 3...) becomes (maxOrderId+1, maxOrderId+2, ...)
  const maxRes = await client.execute('SELECT COALESCE(MAX("id"), 0) AS maxId FROM "Order"');
  const maxOrderId = Number(maxRes.rows[0].maxId);
  console.log(`  Max Order.id = ${maxOrderId}`);

  if (maxOrderId > 0) {
    const renumbered = await client.execute({
      sql: 'UPDATE "DealerOrder" SET "orderNumber" = "orderNumber" + ? WHERE "orderNumber" IS NOT NULL',
      args: [maxOrderId],
    });
    console.log(`✓ Renumbered ${renumbered.rowsAffected} DealerOrder rows (+${maxOrderId})`);
  }

  // 4. Show current state
  const orders = await client.execute('SELECT id, orderNumber FROM "Order" ORDER BY id');
  console.log('\nOrder table sample:');
  orders.rows.slice(0, 5).forEach(r => console.log(`  id=${r.id}  orderNumber=${r.orderNumber}`));

  const dealerOrders = await client.execute('SELECT id, orderNumber FROM "DealerOrder" ORDER BY orderNumber');
  console.log('\nDealerOrder table sample:');
  dealerOrders.rows.slice(0, 5).forEach(r => console.log(`  id=${String(r.id).slice(-8)}  orderNumber=${r.orderNumber}`));

  console.log('\nDone. Run `npx prisma generate` locally then deploy.');
  client.close();
}

run().catch(err => { console.error(err); process.exit(1); });
