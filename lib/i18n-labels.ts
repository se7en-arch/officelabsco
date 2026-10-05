// English labels for values that are stored in Bulgarian (colour names, materials, weights).
// Used when the product has no English value in the database, and for colour names that
// come from lib/color-variants.ts. Stored values stay Bulgarian — these only change what is shown.

const COLOUR_EN: Record<string, string> = {
  'Графит': 'Graphite',
  'Евкалипт': 'Eucalyptus',
  'Каменно сиво': 'Stone Grey',
  'Корал': 'Coral',
  'Ленен': 'Linen',
  'Пясъчно бежов': 'Sandy Beige',
  'Снежен': 'Snow',
  'Таупе': 'Taupe',
};

const MATERIAL_EN: Record<string, string> = {
  'ПДЧ 18 mm, клас Е1': 'Particleboard 18 mm, E1 class',
};

export function colourLabel(name: string, locale: string): string {
  return locale === 'en' ? (COLOUR_EN[name] ?? name) : name;
}

// "Евкалипт, Корал" → "Eucalyptus, Coral"
export function colourListLabel(list: string | null | undefined, locale: string): string | null {
  if (!list) return null;
  if (locale !== 'en') return list;
  return list.split(',').map((c) => colourLabel(c.trim(), locale)).join(', ');
}

export function materialLabel(material: string | null | undefined, locale: string): string | null {
  if (!material) return null;
  if (locale !== 'en') return material;
  return MATERIAL_EN[material] ?? material;
}

export function weightLabel(weight: string | null | undefined, locale: string): string | null {
  if (!weight) return null;
  if (locale !== 'en') return weight;
  // JS word boundaries ignore Cyrillic letters, so match the unit directly.
  return weight.replace(/кг/g, 'kg');
}

// Category names, for cart lines saved before English names were stored with them.
const CATEGORY_EN: Record<string, string> = {
  'Бюра': 'Desks',
  'Ниски маси': 'Low Tables',
  'Ниски шкафове': 'Low Cabinets',
  'Високи шкафове': 'Tall Cabinets',
  'Контейнери': 'Filing Cabinets',
  'Шкаф за саксии': 'Plant Stands',
  'Етажерки': 'Shelving',
};

export function categoryLabel(name: string, locale: string): string {
  return locale === 'en' ? (CATEGORY_EN[name] ?? name) : name;
}
