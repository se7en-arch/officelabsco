import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const result = await db.execute({
  sql: `UPDATE Category SET name = 'Ниски маси', nameEn = 'Low Tables' WHERE name = 'Маси'`,
  args: [],
});

console.log(`Rows updated: ${result.rowsAffected}`);

const check = await db.execute(`SELECT id, name, nameEn, slug FROM Category WHERE slug = 'masi'`);
console.log('Category now:', check.rows[0]);
