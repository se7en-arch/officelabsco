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
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-desk-caramel-1.png',
        '/products/terra-desk-caramel-2.png',
        '/products/terra-desk-caramel-3.png',
      ],
    },
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-desk-eucalypt-1.png',
        '/products/terra-desk-eucalypt-2.png',
        '/products/terra-desk-eucalypt-3.png',
      ],
    },
  ],
  'terra-low-cabinet': [
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-low-cab-caramel-1.png',
        '/products/terra-low-cab-caramel-2.png',
        '/products/terra-low-cab-caramel-3.png',
      ],
    },
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-low-cab-eucalypt-1.png',
        '/products/terra-low-cab-eucalypt-2.png',
        '/products/terra-low-cab-eucalypt-3.png',
      ],
    },
  ],
  'terra-high-cabinet': [
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-high-cab-caramel-1.png',
        '/products/terra-high-cab-caramel-2.png',
        '/products/terra-high-cab-caramel-3.png',
      ],
    },
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-high-cab-eucalypt-1.png',
        '/products/terra-high-cab-eucalypt-2.png',
        '/products/terra-high-cab-eucalypt-3.png',
      ],
    },
  ],
  'terra-plant-stand': [
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-plant-caramel-1.png',
        '/products/terra-plant-caramel-2.png',
        '/products/terra-plant-caramel-3.png',
      ],
    },
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-plant-eucalypt-1.png',
        '/products/terra-plant-eucalypt-2.png',
        '/products/terra-plant-eucalypt-3.png',
      ],
    },
  ],
  'terra-bookshelf-tall': [
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-shelf-caramel-1.png',
        '/products/terra-shelf-caramel-2.png',
        '/products/terra-shelf-caramel-3.png',
      ],
    },
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-shelf-eucalypt-1.png',
        '/products/terra-shelf-eucalypt-2.png',
        '/products/terra-shelf-eucalypt-3.png',
      ],
    },
  ],
};
