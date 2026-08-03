import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { copyFileSync } from 'fs';
dotenv.config({ path: '.env.local' });

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const SRC = `C:\\Users\\Jimmy\\Desktop\\Office Labs\\.office labs models\\Models to upload`;
const DEST = `C:\\Users\\Jimmy\\Desktop\\OfficeLabsCo\\public\\products`;

// ── Copy images ──────────────────────────────────────────────────────────────

const copies = [
  // DESK
  [`Terra Desk (caramel)\\photoroom\\front view-Photoroom (1).png`,  `terra-desk-caramel-1.png`],
  [`Terra Desk (caramel)\\photoroom\\side view-Photoroom.png`,       `terra-desk-caramel-2.png`],
  [`Terra Desk (caramel)\\photoroom\\top ortho-Photoroom.png`,       `terra-desk-caramel-3.png`],
  [`Terra Desk (caramel)\\photoroom\\top view-Photoroom.png`,        `terra-desk-caramel-4.png`],
  [`Terra Desk (euqalypt)\\photoroom\\front view-Photoroom (1).png`, `terra-desk-eucalypt-1.png`],
  [`Terra Desk (euqalypt)\\photoroom\\side view-Photoroom.png`,      `terra-desk-eucalypt-2.png`],
  [`Terra Desk (euqalypt)\\photoroom\\top ortho-Photoroom.png`,      `terra-desk-eucalypt-3.png`],
  [`Terra Desk (euqalypt)\\photoroom\\top view-Photoroom.png`,       `terra-desk-eucalypt-4.png`],

  // LOW CABINET
  [`Terra Low Cabinet (caramel)\\photoroom\\ortho-Photoroom.png`,    `terra-low-cab-caramel-1.png`],
  [`Terra Low Cabinet (caramel)\\photoroom\\side-Photoroom.png`,     `terra-low-cab-caramel-2.png`],
  [`Terra Low Cabinet (caramel)\\photoroom\\top view-Photoroom.png`, `terra-low-cab-caramel-3.png`],
  [`Terra Low Cabinet (euqalypt)\\photoroom\\ortho-Photoroom.png`,   `terra-low-cab-eucalypt-1.png`],
  [`Terra Low Cabinet (euqalypt)\\photoroom\\side-Photoroom.png`,    `terra-low-cab-eucalypt-2.png`],
  [`Terra Low Cabinet (euqalypt)\\photoroom\\top view-Photoroom.png`,`terra-low-cab-eucalypt-3.png`],

  // HIGH CABINET
  [`Terra High Cab (caramel)\\photoroom\\ortho-Photoroom.png`,       `terra-high-cab-caramel-1.png`],
  [`Terra High Cab (caramel)\\photoroom\\side-Photoroom.png`,        `terra-high-cab-caramel-2.png`],
  [`Terra High Cab (caramel)\\photoroom\\top view-Photoroom.png`,    `terra-high-cab-caramel-3.png`],
  [`Terra High Cab (euqalypt)\\photoroom\\ortho-Photoroom.png`,      `terra-high-cab-eucalypt-1.png`],
  [`Terra High Cab (euqalypt)\\photoroom\\side-Photoroom.png`,       `terra-high-cab-eucalypt-2.png`],
  [`Terra High Cab (euqalypt)\\photoroom\\top view-Photoroom.png`,   `terra-high-cab-eucalypt-3.png`],

  // PLANT STAND
  [`Terra Plant (caramel)\\photoroom\\ortho-Photoroom.png`,          `terra-plant-caramel-1.png`],
  [`Terra Plant (caramel)\\photoroom\\side-Photoroom.png`,           `terra-plant-caramel-2.png`],
  [`Terra Plant (caramel)\\photoroom\\top view-Photoroom.png`,       `terra-plant-caramel-3.png`],
  [`Terra Plant (euqalypt)\\photoroom\\ortho-Photoroom.png`,         `terra-plant-eucalypt-1.png`],
  [`Terra Plant (euqalypt)\\photoroom\\side-Photoroom.png`,          `terra-plant-eucalypt-2.png`],
  [`Terra Plant (euqalypt)\\photoroom\\top view-Photoroom.png`,      `terra-plant-eucalypt-3.png`],

  // SHELF
  [`Terra shelf (caramel)\\photoroom\\ortho-Photoroom.png`,          `terra-shelf-caramel-1.png`],
  [`Terra shelf (caramel)\\photoroom\\side-Photoroom.png`,           `terra-shelf-caramel-2.png`],
  [`Terra shelf (caramel)\\photoroom\\top view-Photoroom.png`,       `terra-shelf-caramel-3.png`],
  [`Terra shelf (euqalypt)\\photoroom\\ortho-Photoroom.png`,         `terra-shelf-eucalypt-1.png`],
  [`Terra shelf (euqalypt)\\photoroom\\side-Photoroom.png`,          `terra-shelf-eucalypt-2.png`],
  [`Terra shelf (euqalypt)\\photoroom\\top view-Photoroom.png`,      `terra-shelf-eucalypt-3.png`],
];

for (const [src, dest] of copies) {
  copyFileSync(`${SRC}\\${src}`, `${DEST}\\${dest}`);
  console.log(`✓ ${dest}`);
}

// ── DB updates ───────────────────────────────────────────────────────────────

const products = [
  {
    id: 2,
    mainImage: '/products/terra-desk-caramel-1.png',
    images: [
      '/products/terra-desk-caramel-1.png',
      '/products/terra-desk-caramel-2.png',
      '/products/terra-desk-caramel-3.png',
      '/products/terra-desk-caramel-4.png',
    ],
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Бюрото Terra е изработено от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Повърхностното покритие имитира фината текстура на природни материали, придавайки на работното пространство усещане за топлина и автентичност.

Просторната работна плоскост осигурява комфорт при ежедневна работа, а изчистените линии на серията правят бюрото подходящо за всяко модерно офис обзавеждане.

Дръжките са изработени от матиран метал с кръгла форма — устойчиви на износване, с прецизен захват и деликатен контраст спрямо топлите нюанси на корпуса.

Гаранционен срок: 2 години.`,

    descriptionEn: `The Terra series blends the warmth of natural materials with the precision of contemporary design. The Terra desk is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

The surface finish mimics the subtle texture of natural materials, giving the workspace a feeling of warmth and authenticity.

The spacious work surface ensures everyday comfort, while the clean lines of the series make the desk suitable for any modern office setting.

The handles are crafted from matte metal with a round shape — wear-resistant with a precise grip and a delicate contrast against the warm tones of the body.

Warranty: 2 years.`,
  },
  {
    id: 10,
    mainImage: '/products/terra-low-cab-caramel-1.png',
    images: [
      '/products/terra-low-cab-caramel-1.png',
      '/products/terra-low-cab-caramel-2.png',
      '/products/terra-low-cab-caramel-3.png',
    ],
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Ниският шкаф Terra е изработен от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Повърхностното покритие имитира фината текстура на природни материали, придавайки на работното пространство усещане за топлина и автентичност.

Шкафът предоставя практично съхранение за документи и аксесоари, като хоризонталният му формат го прави подходящ за поставяне под работната маса или като самостоятелен елемент.

Дръжките са изработени от матиран метал с кръгла форма — устойчиви на износване, с прецизен захват и деликатен контраст спрямо топлите нюанси на корпуса.

Гаранционен срок: 2 години.`,

    descriptionEn: `The Terra series blends the warmth of natural materials with the precision of contemporary design. The Terra low cabinet is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

The surface finish mimics the subtle texture of natural materials, giving the workspace a feeling of warmth and authenticity.

The cabinet offers practical storage for documents and accessories, and its horizontal format makes it suitable for placement under a desk or as a standalone piece.

The handles are crafted from matte metal with a round shape — wear-resistant with a precise grip and a delicate contrast against the warm tones of the body.

Warranty: 2 years.`,
  },
  {
    id: 14,
    mainImage: '/products/terra-high-cab-caramel-1.png',
    images: [
      '/products/terra-high-cab-caramel-1.png',
      '/products/terra-high-cab-caramel-2.png',
      '/products/terra-high-cab-caramel-3.png',
    ],
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Високият шкаф Terra е изработен от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Повърхностното покритие имитира фината текстура на природни материали, придавайки на работното пространство усещане за топлина и автентичност.

Вертикалната конструкция оптимизира използването на пространството и е подходяща за класьори, документи и офис аксесоари — практично решение за организиран и естетичен работен кабинет.

Дръжките са изработени от матиран метал с кръгла форма — устойчиви на износване, с прецизен захват и деликатен контраст спрямо топлите нюанси на корпуса.

Гаранционен срок: 2 години.`,

    descriptionEn: `The Terra series blends the warmth of natural materials with the precision of contemporary design. The Terra high cabinet is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

The surface finish mimics the subtle texture of natural materials, giving the workspace a feeling of warmth and authenticity.

The vertical construction optimises space utilisation and is suitable for binders, documents and office accessories — a practical solution for an organised and aesthetically pleasing office.

The handles are crafted from matte metal with a round shape — wear-resistant with a precise grip and a delicate contrast against the warm tones of the body.

Warranty: 2 years.`,
  },
  {
    id: 26,
    mainImage: '/products/terra-plant-caramel-1.png',
    images: [
      '/products/terra-plant-caramel-1.png',
      '/products/terra-plant-caramel-2.png',
      '/products/terra-plant-caramel-3.png',
    ],
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Стойката за саксии Terra е изработена от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Повърхностното покритие имитира фината текстура на природни материали, правейки стойката естествено допълнение към зелените растения в интериора.

Елегантният дизайн вдига растенията на оптимална височина, внасяйки живост и свежест в работното или жилищното пространство.

Гаранционен срок: 2 години.`,

    descriptionEn: `The Terra series blends the warmth of natural materials with the precision of contemporary design. The Terra plant stand is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

The surface finish mimics the subtle texture of natural materials, making the stand a natural complement to the greenery in any interior.

The elegant design elevates plants to an optimal height, bringing life and freshness to any workspace or living area.

Warranty: 2 years.`,
  },
  {
    id: 30,
    mainImage: '/products/terra-shelf-caramel-1.png',
    images: [
      '/products/terra-shelf-caramel-1.png',
      '/products/terra-shelf-caramel-2.png',
      '/products/terra-shelf-caramel-3.png',
    ],
    description: `Серията Terra съчетава топлотата на естествените материали с прецизността на съвременния дизайн. Етажерката Terra е изработена от ПДЧ с 18 mm дебелина с емисионен клас Е1 — екологично чисти материали, сертифицирани за използване в жилищна и офис среда.

Повърхностното покритие имитира фината текстура на природни материали, придавайки на пространството усещане за топлина и автентичност.

Многоетажната конструкция осигурява организирано показване на книги, папки и декоративни елементи — функционално и естетично решение за всяко офис или домашно пространство.

Гаранционен срок: 2 години.`,

    descriptionEn: `The Terra series blends the warmth of natural materials with the precision of contemporary design. The Terra bookshelf is crafted from 18 mm particleboard with E1 emission class — clean and safe materials certified for use in residential and office environments.

The surface finish mimics the subtle texture of natural materials, giving the space a feeling of warmth and authenticity.

The multi-level construction provides organised display for books, folders and decorative items — a functional and aesthetic solution for any office or home setting.

Warranty: 2 years.`,
  },
];

for (const p of products) {
  const result = await db.execute({
    sql: `UPDATE Product SET
      image         = ?,
      images        = ?,
      description   = ?,
      descriptionEn = ?,
      material      = 'ПДЧ 18 mm, клас Е1',
      materialEn    = 'Particleboard 18 mm, E1 class'
    WHERE id = ?`,
    args: [p.mainImage, JSON.stringify(p.images), p.description, p.descriptionEn, p.id],
  });
  console.log(`✓ Updated product id=${p.id} (${result.rowsAffected} row)`);
}

console.log('\nDone!');
