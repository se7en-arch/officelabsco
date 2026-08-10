import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const images = JSON.stringify([
  '/products/desk-1.png',
  '/products/desk-1-2.jpg',
  '/products/desk-1-3.png',
  '/products/desk-1-4.png',
  '/products/desk-1-5.png',
]);

const description = `Вдъхновена от чистотата на геометричните форми, серията Astra съчетава прецизна изработка с функционален минимализъм. Бюрото Astra е изработено от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти и безвредни материали, сертифицирани за използване в жилищна и офис среда.

Изборът на мебели с клас Е1 гарантира по-здравословна и устойчива среда, като свежда до минимум съдържанието на формалдехид в материалите.

Работният плот с размери 1200 × 600 mm предоставя достатъчно пространство за монитор, документи и работни принадлежности, а конструкцията осигурява стабилност и дълготрайност при ежедневна употреба.

Краката са изработени от матиран метал — устойчиви на износване и с прецизна геометрия, в пълно стилово единство с минималистичния характер на серията.

Размери: 1200 × 600 × 750 mm.
Гаранционен срок: 2 години.`;

const descriptionEn = `Inspired by the purity of geometric forms, the Astra series combines precise craftsmanship with functional minimalism. The Astra desk is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

Choosing E1-class furniture ensures a healthier and more sustainable environment by minimising formaldehyde content in the materials.

The worktop measuring 1200 × 600 mm provides ample space for a monitor, documents and work accessories, while the construction ensures stability and durability under daily use.

The legs are crafted from matte metal — wear-resistant with precise geometry, in complete stylistic harmony with the minimalist character of the series.

Dimensions: 1200 × 600 × 750 mm.
Warranty: 2 years.`;

const result = await db.execute({
  sql: `UPDATE Product SET
    image        = '/products/desk-1.png',
    images       = ?,
    description  = ?,
    descriptionEn = ?,
    dimensions   = '1200 × 600 × 750 mm',
    material     = 'ПДЧ 18 mm, клас Е1',
    materialEn   = 'Particleboard 18 mm, E1 class'
  WHERE id = 1`,
  args: [images, description, descriptionEn],
});

console.log(`Rows updated: ${result.rowsAffected}`);

const check = await db.execute(`SELECT id, name, image, dimensions, material FROM Product WHERE id = 1`);
console.log('Product now:', check.rows[0]);
