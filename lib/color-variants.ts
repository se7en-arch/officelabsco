export type ColorVariant = {
  name: string;
  color: string;
  images: string[];
};

export const COLOR_VARIANTS: Record<string, ColorVariant[]> = {
  'astra-low-cabinet': [
    {
      name: 'Лате',
      color: '#C8A882',
      images: [
        '/products/low-cab-1-latte-1.png',
        '/products/low-cab-1-latte-2.png',
        '/products/low-cab-1-latte-3.png',
        '/products/low-cab-1-latte-4.png',
      ],
    },
    {
      name: 'Капучино',
      color: '#6B4F3A',
      images: [
        '/products/low-cab-1-cappuccino-1.png',
        '/products/low-cab-1-cappuccino-2.png',
        '/products/low-cab-1-cappuccino-3.png',
        '/products/low-cab-1-cappuccino-4.png',
      ],
    },
  ],
  'astra-high-cabinet': [
    {
      name: 'Лате',
      color: '#C8A882',
      images: [
        '/products/high-cab-1-latte-1.png',
        '/products/high-cab-1-latte-2.png',
        '/products/high-cab-1-latte-3.png',
      ],
    },
    {
      name: 'Капучино',
      color: '#6B4F3A',
      images: [
        '/products/high-cab-1-cappuccino-1.png',
        '/products/high-cab-1-cappuccino-2.png',
        '/products/high-cab-1-cappuccino-3.png',
      ],
    },
  ],

  // ── Terra ────────────────────────────────────────────────────────────────
  'terra-desk-oak': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-desk-eucalypt-1.png',
        '/products/terra-desk-eucalypt-2.png',
        '/products/terra-desk-eucalypt-3.png',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-desk-caramel-1.png',
        '/products/terra-desk-caramel-2.png',
        '/products/terra-desk-caramel-3.png',
      ],
    },
  ],
  'terra-low-cabinet': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-low-cab-eucalypt-1.png',
        '/products/terra-low-cab-eucalypt-2.png',
        '/products/terra-low-cab-eucalypt-3.png',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-low-cab-caramel-1.png',
        '/products/terra-low-cab-caramel-2.png',
        '/products/terra-low-cab-caramel-3.png',
      ],
    },
  ],
  'terra-high-cabinet': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-high-cab-eucalypt-1.png',
        '/products/terra-high-cab-eucalypt-2.png',
        '/products/terra-high-cab-eucalypt-3.png',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-high-cab-caramel-1.png',
        '/products/terra-high-cab-caramel-2.png',
        '/products/terra-high-cab-caramel-3.png',
      ],
    },
  ],
  'terra-plant-stand': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-plant-eucalypt-1.png',
        '/products/terra-plant-eucalypt-2.png',
        '/products/terra-plant-eucalypt-3.png',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-plant-caramel-1.png',
        '/products/terra-plant-caramel-2.png',
        '/products/terra-plant-caramel-3.png',
      ],
    },
  ],
  'terra-bookshelf-tall': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-shelf-eucalypt-1.png',
        '/products/terra-shelf-eucalypt-2.png',
        '/products/terra-shelf-eucalypt-3.png',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-shelf-caramel-1.png',
        '/products/terra-shelf-caramel-2.png',
        '/products/terra-shelf-caramel-3.png',
      ],
    },
  ],

  // ── Nova ─────────────────────────────────────────────────────────────────
  'nova-walnut-desk': [
    {
      name: 'Крем',
      color: '#EDE8DF',
      images: [
        '/products/nova-desk-cream-1.png',
        '/products/nova-desk-cream-2.png',
        '/products/nova-desk-cream-3.png',
      ],
    },
    {
      name: 'Диамант',
      color: '#B5C8D4',
      images: [
        '/products/nova-desk-diamond-1.png',
        '/products/nova-desk-diamond-2.png',
        '/products/nova-desk-diamond-3.png',
      ],
    },
  ],
  'nova-low-cabinet': [
    {
      name: 'Крем',
      color: '#EDE8DF',
      images: [
        '/products/nova-low-cab-cream-1.png',
        '/products/nova-low-cab-cream-2.png',
        '/products/nova-low-cab-cream-3.png',
      ],
    },
    {
      name: 'Диамант',
      color: '#B5C8D4',
      images: [
        '/products/nova-low-cab-diamond-1.png',
        '/products/nova-low-cab-diamond-2.png',
        '/products/nova-low-cab-diamond-3.png',
      ],
    },
  ],
  'nova-tall-wardrobe': [
    {
      name: 'Крем',
      color: '#EDE8DF',
      images: [
        '/products/nova-high-cab-cream-1.png',
        '/products/nova-high-cab-cream-2.png',
        '/products/nova-high-cab-cream-3.png',
      ],
    },
    {
      name: 'Диамант',
      color: '#B5C8D4',
      images: [
        '/products/nova-high-cab-diamond-1.png',
        '/products/nova-high-cab-diamond-2.png',
        '/products/nova-high-cab-diamond-3.png',
      ],
    },
  ],
  'nova-plant-stand': [
    {
      name: 'Крем',
      color: '#EDE8DF',
      images: [
        '/products/nova-plant-cream-1.png',
        '/products/nova-plant-cream-2.png',
        '/products/nova-plant-cream-3.png',
      ],
    },
    {
      name: 'Диамант',
      color: '#B5C8D4',
      images: [
        '/products/nova-plant-diamond-1.png',
        '/products/nova-plant-diamond-2.png',
        '/products/nova-plant-diamond-3.png',
      ],
    },
  ],
  'nova-open-shelf': [
    {
      name: 'Крем',
      color: '#EDE8DF',
      images: [
        '/products/nova-shelf-cream-1.png',
        '/products/nova-shelf-cream-2.png',
        '/products/nova-shelf-cream-3.png',
      ],
    },
    {
      name: 'Диамант',
      color: '#B5C8D4',
      images: [
        '/products/nova-shelf-diamond-1.png',
        '/products/nova-shelf-diamond-2.png',
        '/products/nova-shelf-diamond-3.png',
      ],
    },
  ],
};
