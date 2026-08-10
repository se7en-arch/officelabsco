import { createClient } from '@libsql/client';
const c = createClient({ url: process.env.DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });

const dealers = await c.execute('SELECT id, email, "companyName", status, "createdAt" FROM "Dealer" ORDER BY "createdAt" DESC');
console.log('All dealers:');
dealers.rows.forEach(d => console.log(` ${d.email} | ${d.companyName} | ${d.status} | ${d.createdAt}`));

const orders = await c.execute('SELECT id, email, total, "createdAt" FROM "Order" ORDER BY id DESC LIMIT 5');
console.log('\nLast 5 orders:', orders.rows);

c.close();
