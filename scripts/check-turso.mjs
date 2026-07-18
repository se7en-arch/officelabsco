import { createClient } from '@libsql/client';

const client = createClient({
  url:       process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await client.execute('PRAGMA table_info("Order")');
console.log('Order columns:');
result.rows.forEach(r => console.log(' ', r[1]));
