import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.execute(`ALTER TABLE "OrderItem" ADD COLUMN "color" TEXT`);
console.log('Done: added color column to OrderItem');

const check = await db.execute(`PRAGMA table_info("OrderItem")`);
console.log('OrderItem columns:', check.rows.map(r => r.name).join(', '));
