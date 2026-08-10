import { createClient } from '@libsql/client';
const c = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r1 = await c.execute({ sql: 'DELETE FROM "OrderItem" WHERE orderId IN (SELECT id FROM "Order" WHERE email = ?)', args: ['qa@officelabsco.com'] });
const r2 = await c.execute({ sql: 'DELETE FROM "Order" WHERE email = ?', args: ['qa@officelabsco.com'] });
console.log(`✓ Изтрити: ${r1.rowsAffected} артикула, ${r2.rowsAffected} поръчки`);
c.close();
