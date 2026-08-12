import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const db = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });

const updates = [
  {
    id: 6,
    image: '/products/terra-coffee-table-eucalypt-1.png',
    images: JSON.stringify([
      '/products/terra-coffee-table-eucalypt-1.png',
      '/products/terra-coffee-table-eucalypt-2.png',
      '/products/terra-coffee-table-eucalypt-3.png',
    ]),
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Кафе масата Terra е изработена от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Плотът е с топла дъбова текстура, а тялото е изпълнено в матово покритие — евкалипт (мъхово-сиво зелено) или корал (топло терракотово). Ниският профил и изчистените линии я правят подходяща за зони за отдих, лобита и представителни пространства.

Функционалният дизайн включва открити рафтове в долната секция — удобни за списания, книги или декоративни аксесоари.

Гаранционен срок: 2 години.`,
    colors: 'Евкалипт, Корал',
    material: 'ПДЧ 18 mm, клас Е1',
  },
  {
    id: 22,
    image: '/products/terra-container-eucalypt-1.png',
    images: JSON.stringify([
      '/products/terra-container-eucalypt-1.png',
      '/products/terra-container-eucalypt-2.png',
      '/products/terra-container-eucalypt-3.png',
    ]),
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Контейнерът Terra е изработен от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Компактното тяло е изпълнено в матово евкалипт (мъхово-сиво зелено) или корал (топло терракотово). Монтиран на въртящи се колелца, контейнерът се придвижва лесно и се позиционира удобно до работното бюро или в рамките на пространството.

Разполага с чекмеджета и отворени отдели за дребни предмети, документи и папки — практичен и ненатрапчив помощник с характерния топъл облик на серията Terra.

Гаранционен срок: 2 години.`,
    colors: 'Евкалипт, Корал',
    material: 'ПДЧ 18 mm, клас Е1',
  },
];

for (const u of updates) {
  await db.execute({
    sql: 'UPDATE Product SET image=?, images=?, description=?, colors=?, material=? WHERE id=?',
    args: [u.image, u.images, u.description, u.colors, u.material, u.id],
  });
  console.log(`✓ id=${u.id}`);
}
db.close();
console.log('Done.');
