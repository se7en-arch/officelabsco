// Цена за монтаж на място (по желание, доплаща се при поръчка) — оценена
// спрямо размера и сложността на всеки модул (брой елементи, врати,
// чекмеджета, височина) от снимките му, не е обвързана с продажната цена.
// Диапазон 25–90 €, по product slug.
export const ASSEMBLY_PRICES: Record<string, number> = {
  // ── Astra (минималистична, по-лека конструкция) ──
  'astra-desk-120':      35,
  'astra-table':         25,
  'astra-low-cabinet':   45,
  'astra-high-cabinet':  75,
  'astra-filing-cabinet':28,
  'astra-plant-stand':   25,
  'astra-bookshelf':     55,

  // ── Terra (масивни ъглови крака, повече детайли) ──
  'terra-desk-oak':        38,
  'terra-dining-table':    28,
  'terra-low-cabinet':     48,
  'terra-high-cabinet':    78,
  'terra-filing-cabinet':  28,
  'terra-plant-stand':     30,
  'terra-bookshelf-tall':  58,

  // ── Nova (стъклени врати, педестали — по-сложен монтаж) ──
  'nova-walnut-desk':     48,
  'nova-farm-table':      30,
  'nova-low-cabinet':     52,
  'nova-tall-wardrobe':   85,
  'nova-filing-cabinet':  28,
  'nova-plant-stand':     30,
  'nova-open-shelf':      65,

  // ── Loft (метални крака, най-мащабната конструкция в каталога) ──
  'loft-steel-desk':      40,
  'loft-iron-table':      30,
  'loft-low-cabinet':     48,
  'loft-high-cabinet':    90,
  'loft-filing-cabinet':  26,
  'loft-plant-stand':     32,
  'loft-pipe-bookshelf':  50,
};
