import { createClient } from '@libsql/client';
const c = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const r1 = await c.execute({ sql: 'DELETE FROM "OrderItem" WHERE "orderId" = 20', args: [] });
const r2 = await c.execute({ sql: 'DELETE FROM "Order" WHERE id = 20', args: [] });
console.log(`✓ Изтрити: ${r2.rowsAffected} поръчки, ${r1.rowsAffected} артикула`);
c.close();
