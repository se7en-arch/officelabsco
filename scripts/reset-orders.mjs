import { createClient } from '@libsql/client';

const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken });

try {
  const items = await client.execute('DELETE FROM "OrderItem"');
  console.log(`✓ Изтрити OrderItem редове: ${items.rowsAffected}`);

  const orders = await client.execute('DELETE FROM "Order"');
  console.log(`✓ Изтрити поръчки: ${orders.rowsAffected}`);

  const stock = await client.execute('UPDATE "Product" SET stock = 10');
  console.log(`✓ Наличност върната на 10 за ${stock.rowsAffected} продукта`);

  console.log('\nГотово! Базата е изчистена.');
} catch (e) {
  console.error('Грешка:', e.message);
  process.exit(1);
}

client.close();
