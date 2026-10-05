export type ColorVariant = {
  name: string;
  color: string;
  images: string[];
};

export const COLOR_VARIANTS: Record<string, ColorVariant[]> = {
  'astra-low-cabinet': [
    {
      name: 'Снежен',
      color: '#E8DFD8',
      images: [
        '/products/low-cab-1-latte-1.webp',
        '/products/low-cab-1-latte-2.webp',
        '/products/low-cab-1-latte-3.webp',
        '/products/low-cab-1-latte-4.webp',
      ],
    },
    {
      name: 'Ленен',
      color: '#AE9F8F',
      images: [
        '/products/low-cab-1-cappuccino-1.webp',
        '/products/low-cab-1-cappuccino-2.webp',
        '/products/low-cab-1-cappuccino-3.webp',
        '/products/low-cab-1-cappuccino-4.webp',
      ],
    },
  ],
  'astra-table': [
    {
      name: 'Снежен',
      color: '#E8DFD8',
      images: [
        '/products/astra-table-angora-1.webp',
        '/products/astra-table-angora-2.webp',
        '/products/astra-table-angora-3.webp',
      ],
    },
    {
      name: 'Ленен',
      color: '#AE9F8F',
      images: [
        '/products/astra-table-cubanit-1.webp',
        '/products/astra-table-cubanit-2.webp',
        '/products/astra-table-cubanit-3.webp',
      ],
    },
  ],
  'astra-filing-cabinet': [
    {
      name: 'Снежен',
      color: '#E8DFD8',
      images: [
        '/products/astra-container-angora-1.webp',
        '/products/astra-container-angora-2.webp',
        '/products/astra-container-angora-3.webp',
      ],
    },
    {
      name: 'Ленен',
      color: '#AE9F8F',
      images: [
        '/products/astra-container-cubanit-1.webp',
        '/products/astra-container-cubanit-2.webp',
        '/products/astra-container-cubanit-3.webp',
      ],
    },
  ],
  'astra-high-cabinet': [
    {
      name: 'Снежен',
      color: '#E8DFD8',
      images: [
        '/products/high-cab-1-latte-1.webp',
        '/products/high-cab-1-latte-2.webp',
        '/products/high-cab-1-latte-3.webp',
      ],
    },
    {
      name: 'Ленен',
      color: '#AE9F8F',
      images: [
        '/products/high-cab-1-cappuccino-1.webp',
        '/products/high-cab-1-cappuccino-2.webp',
        '/products/high-cab-1-cappuccino-3.webp',
      ],
    },
  ],

  // ── Terra ────────────────────────────────────────────────────────────────
  'terra-dining-table': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-coffee-table-eucalypt-1.webp',
        '/products/terra-coffee-table-eucalypt-2.webp',
        '/products/terra-coffee-table-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-coffee-table-caramel-1.webp',
        '/products/terra-coffee-table-caramel-2.webp',
        '/products/terra-coffee-table-caramel-3.webp',
      ],
    },
  ],
  'terra-filing-cabinet': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-container-eucalypt-1.webp',
        '/products/terra-container-eucalypt-2.webp',
        '/products/terra-container-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-container-caramel-1.webp',
        '/products/terra-container-caramel-2.webp',
        '/products/terra-container-caramel-3.webp',
      ],
    },
  ],
  'terra-desk-oak': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-desk-eucalypt-1.webp',
        '/products/terra-desk-eucalypt-2.webp',
        '/products/terra-desk-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-desk-caramel-1.webp',
        '/products/terra-desk-caramel-2.webp',
        '/products/terra-desk-caramel-3.webp',
      ],
    },
  ],
  'terra-low-cabinet': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-low-cab-eucalypt-1.webp',
        '/products/terra-low-cab-eucalypt-2.webp',
        '/products/terra-low-cab-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-low-cab-caramel-1.webp',
        '/products/terra-low-cab-caramel-2.webp',
        '/products/terra-low-cab-caramel-3.webp',
      ],
    },
  ],
  'terra-high-cabinet': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-high-cab-eucalypt-1.webp',
        '/products/terra-high-cab-eucalypt-2.webp',
        '/products/terra-high-cab-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-high-cab-caramel-1.webp',
        '/products/terra-high-cab-caramel-2.webp',
        '/products/terra-high-cab-caramel-3.webp',
      ],
    },
  ],
  'terra-plant-stand': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-plant-eucalypt-1.webp',
        '/products/terra-plant-eucalypt-2.webp',
        '/products/terra-plant-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-plant-caramel-1.webp',
        '/products/terra-plant-caramel-2.webp',
        '/products/terra-plant-caramel-3.webp',
      ],
    },
  ],
  'terra-bookshelf-tall': [
    {
      name: 'Евкалипт',
      color: '#7A9E87',
      images: [
        '/products/terra-shelf-eucalypt-1.webp',
        '/products/terra-shelf-eucalypt-2.webp',
        '/products/terra-shelf-eucalypt-3.webp',
      ],
    },
    {
      name: 'Корал',
      color: '#C4956A',
      images: [
        '/products/terra-shelf-caramel-1.webp',
        '/products/terra-shelf-caramel-2.webp',
        '/products/terra-shelf-caramel-3.webp',
      ],
    },
  ],

  // ── Loft ─────────────────────────────────────────────────────────────────
  'loft-steel-desk': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-desk-black-1.webp',
        '/products/loft-desk-black-2.webp',
        '/products/loft-desk-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-desk-deep-green-1.webp',
        '/products/loft-desk-deep-green-2.webp',
        '/products/loft-desk-deep-green-3.webp',
      ],
    },
  ],
  'loft-iron-table': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-coffee-table-black-1.webp',
        '/products/loft-coffee-table-black-2.webp',
        '/products/loft-coffee-table-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-coffee-table-deep-green-1.webp',
        '/products/loft-coffee-table-deep-green-2.webp',
        '/products/loft-coffee-table-deep-green-3.webp',
      ],
    },
  ],
  'loft-low-cabinet': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-low-cab-black-1.webp',
        '/products/loft-low-cab-black-2.webp',
        '/products/loft-low-cab-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-low-cab-deep-green-1.webp',
        '/products/loft-low-cab-deep-green-2.webp',
        '/products/loft-low-cab-deep-green-3.webp',
      ],
    },
  ],
  'loft-filing-cabinet': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-container-black-1.webp',
        '/products/loft-container-black-2.webp',
        '/products/loft-container-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-container-deep-green-1.webp',
        '/products/loft-container-deep-green-2.webp',
        '/products/loft-container-deep-green-3.webp',
      ],
    },
  ],
  'loft-plant-stand': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-plant-black-1.webp',
        '/products/loft-plant-black-2.webp',
        '/products/loft-plant-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-plant-deep-green-1.webp',
        '/products/loft-plant-deep-green-2.webp',
        '/products/loft-plant-deep-green-3.webp',
      ],
    },
  ],
  'loft-high-cabinet': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-high-cab-black-1.webp',
        '/products/loft-high-cab-black-2.webp',
        '/products/loft-high-cab-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-high-cab-deep-green-1.webp',
        '/products/loft-high-cab-deep-green-2.webp',
        '/products/loft-high-cab-deep-green-3.webp',
      ],
    },
  ],
  'loft-pipe-bookshelf': [
    {
      name: 'Графит',
      color: '#5A5654',
      images: [
        '/products/loft-shelf-black-1.webp',
        '/products/loft-shelf-black-2.webp',
        '/products/loft-shelf-black-3.webp',
      ],
    },
    {
      name: 'Таупе',
      color: '#B7A891',
      images: [
        '/products/loft-shelf-deep-green-1.webp',
        '/products/loft-shelf-deep-green-2.webp',
        '/products/loft-shelf-deep-green-3.webp',
      ],
    },
  ],

  // ── Nova ─────────────────────────────────────────────────────────────────
  'nova-farm-table': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-coffee-table-diamond-1.webp',
        '/products/nova-coffee-table-diamond-2.webp',
        '/products/nova-coffee-table-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-coffee-table-cream-1.webp',
        '/products/nova-coffee-table-cream-2.webp',
        '/products/nova-coffee-table-cream-3.webp',
      ],
    },
  ],
  'nova-filing-cabinet': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-container-diamond-1.webp',
        '/products/nova-container-diamond-2.webp',
        '/products/nova-container-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-container-cream-1.webp',
        '/products/nova-container-cream-2.webp',
        '/products/nova-container-cream-3.webp',
      ],
    },
  ],
  'nova-walnut-desk': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-desk-diamond-1.webp',
        '/products/nova-desk-diamond-2.webp',
        '/products/nova-desk-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-desk-cream-1.webp',
        '/products/nova-desk-cream-2.webp',
        '/products/nova-desk-cream-3.webp',
      ],
    },
  ],
  'nova-low-cabinet': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-low-cab-diamond-1.webp',
        '/products/nova-low-cab-diamond-2.webp',
        '/products/nova-low-cab-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-low-cab-cream-1.webp',
        '/products/nova-low-cab-cream-2.webp',
        '/products/nova-low-cab-cream-3.webp',
      ],
    },
  ],
  'nova-tall-wardrobe': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-high-cab-diamond-1.webp',
        '/products/nova-high-cab-diamond-2.webp',
        '/products/nova-high-cab-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-high-cab-cream-1.webp',
        '/products/nova-high-cab-cream-2.webp',
        '/products/nova-high-cab-cream-3.webp',
      ],
    },
  ],
  'nova-plant-stand': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-plant-diamond-1.webp',
        '/products/nova-plant-diamond-2.webp',
        '/products/nova-plant-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-plant-cream-1.webp',
        '/products/nova-plant-cream-2.webp',
        '/products/nova-plant-cream-3.webp',
      ],
    },
  ],
  'nova-open-shelf': [
    {
      name: 'Каменно сиво',
      color: '#B5C8D4',
      images: [
        '/products/nova-shelf-diamond-1.webp',
        '/products/nova-shelf-diamond-2.webp',
        '/products/nova-shelf-diamond-3.webp',
      ],
    },
    {
      name: 'Пясъчно бежов',
      color: '#EDE8DF',
      images: [
        '/products/nova-shelf-cream-1.webp',
        '/products/nova-shelf-cream-2.webp',
        '/products/nova-shelf-cream-3.webp',
      ],
    },
  ],
};
