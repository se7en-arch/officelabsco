import { createClient } from '@libsql/client';

const c = createClient({
  url:       process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const TEST_ORDER_IDS      = [23, 24, 25, 26];
const TEST_REVIEW_IDS     = [38, 39, 40, 41];
const TEST_DEALER_IDS     = [
  'cmslkg2lq000004l2kcu9686l',
  'cmslkh8dm000104l2qde47laz',
  'cmslkh8un000204l2t45w0yse',
  'cmslkh9al000304l2qcac963w',
];

console.log('🗑  Изтриваме тестови данни...\n');

// 1. Order items → Orders
const r1 = await c.execute({
  sql: `DELETE FROM "OrderItem" WHERE "orderId" IN (${TEST_ORDER_IDS.join(',')})`,
  args: [],
});
const r2 = await c.execute({
  sql: `DELETE FROM "Order" WHERE id IN (${TEST_ORDER_IDS.join(',')})`,
  args: [],
});
console.log(`✓ Поръчки: ${r2.rowsAffected} изтрити, ${r1.rowsAffected} артикула`);

// 2. Reviews
const r3 = await c.execute({
  sql: `DELETE FROM "Review" WHERE id IN (${TEST_REVIEW_IDS.join(',')})`,
  args: [],
});
console.log(`✓ Ревюта: ${r3.rowsAffected} изтрити`);

// 3. DealerOrderItems → DealerOrders → Dealers
const ph = TEST_DEALER_IDS.map(() => '?').join(',');
const r4 = await c.execute({
  sql: `DELETE FROM "DealerOrderItem"
        WHERE "orderId" IN (
          SELECT id FROM "DealerOrder" WHERE "dealerId" IN (${ph})
        )`,
  args: TEST_DEALER_IDS,
});
const r5 = await c.execute({
  sql: `DELETE FROM "DealerOrder" WHERE "dealerId" IN (${ph})`,
  args: TEST_DEALER_IDS,
});
const r6 = await c.execute({
  sql: `DELETE FROM "Dealer" WHERE id IN (${ph})`,
  args: TEST_DEALER_IDS,
});
console.log(`✓ Dealers: ${r6.rowsAffected} акаунта изтрити (${r5.rowsAffected} dealer поръчки, ${r4.rowsAffected} артикула)`);

console.log('\n✅ Готово. Базата е чиста.');
c.close();
