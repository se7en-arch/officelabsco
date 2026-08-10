import { createClient } from '@libsql/client';
const c = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const r = await c.execute(`
  SELECT p.id, p.name, p.sku, p.price, p.stock, p.description,
         s.name as series, cat.name as category
  FROM Product p
  JOIN Series s ON p.seriesId=s.id
  JOIN Category cat ON p.categoryId=cat.id
  LIMIT 5
`);
console.log(JSON.stringify(r.rows, null, 2));
c.close();
