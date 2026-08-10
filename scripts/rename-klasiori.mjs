import { createClient } from '@libsql/client';

const c = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 1. Rename the category
await c.execute({
  sql: `UPDATE "Category" SET name = 'Контейнери', slug = 'konteineri' WHERE name = 'Шкаф за класьори'`,
  args: [],
});

// 2. Rename product names
await c.execute({
  sql: `UPDATE "Product" SET name = replace(name, 'Шкаф за класьори', 'Контейнери') WHERE name LIKE '%Шкаф за класьори%'`,
  args: [],
});

// 3. Update descriptions that mention "Шкаф за класьори"
await c.execute({
  sql: `UPDATE "Product" SET description = replace(description, 'Шкаф за класьори', 'Контейнер') WHERE description LIKE '%Шкаф за класьори%'`,
  args: [],
});
await c.execute({
  sql: `UPDATE "Product" SET description = replace(description, 'Метален шкаф за класьори', 'Метален контейнер') WHERE description LIKE '%Метален шкаф за класьори%'`,
  args: [],
});

// Verify
const cats = await c.execute(`SELECT name, slug FROM "Category" WHERE slug = 'konteineri'`);
console.log('Category:', cats.rows);

const prods = await c.execute(`SELECT name FROM "Product" WHERE name LIKE '%Контейнери%'`);
console.log('Products:', prods.rows);
