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
};
