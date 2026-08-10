import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const images = JSON.stringify([
  '/products/high-cab-1.png',
  '/products/high-cab-1-latte-2.png',
  '/products/high-cab-1-latte-3.png',
]);

const description = `Вдъхновена от чистотата на геометричните форми, серията Astra съчетава прецизна изработка с функционален минимализъм. Високият шкаф Astra е изработен от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти и безвредни материали, сертифицирани за използване в жилищна и офис среда.

Изборът на мебели с клас Е1 гарантира по-здравословна и устойчива среда, като свежда до минимум съдържанието на формалдехид в материалите.

Шкафът предоставя просторно и организирано съхранение — вертикалната конструкция с височина 200 cm оптимизира използването на пространството и е подходящ за класьори, документи и офис аксесоари.

Дръжките са изработени от матиран метал с кръгла форма — устойчиви на износване и с прецизен захват, в пълно стилово единство с минималистичния характер на серията.

Размери: 2000 × 450 × 450 mm.
Гаранционен срок: 2 години.`;

const descriptionEn = `Inspired by the purity of geometric forms, the Astra series combines precise craftsmanship with functional minimalism. The Astra high cabinet is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

Choosing E1-class furniture ensures a healthier and more sustainable environment by minimising formaldehyde content in the materials.

The cabinet provides spacious and organised storage — its vertical construction at 200 cm height optimises space utilisation and is ideal for binders, documents and office accessories.

The handles are crafted from matte metal with a round shape — wear-resistant with a precise grip, in complete stylistic harmony with the minimalist character of the series.

Dimensions: 2000 × 450 × 450 mm.
Warranty: 2 years.`;

const result = await db.execute({
  sql: `UPDATE Product SET
    image         = '/products/high-cab-1.png',
    images        = ?,
    description   = ?,
    descriptionEn = ?,
    dimensions    = '2000 × 450 × 450 mm',
    material      = 'ПДЧ 18 mm, клас Е1',
    materialEn    = 'Particleboard 18 mm, E1 class'
  WHERE id = 13`,
  args: [images, description, descriptionEn],
});

console.log(`Rows updated: ${result.rowsAffected}`);
const check = await db.execute(`SELECT id, name, image, dimensions FROM Product WHERE id = 13`);
console.log('Product now:', check.rows[0]);
