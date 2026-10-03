import { prisma } from '@/lib/prisma';

// Seller (фирмата) details printed on proforma invoices.
// Stored in SiteSettings ('seller_details') and editable from the admin settings page.
// The values below are TEST DATA — replace them from the admin panel.
export type Seller = {
  name: string;        // Юридическо име
  eik: string;         // ЕИК
  vatNumber: string;   // ДДС номер (BG…)
  address: string;     // Адрес на управление
  bankName: string;    // Банка
  iban: string;        // IBAN
  bic: string;         // BIC / SWIFT
  paymentDays: number; // Срок за плащане в дни
};

export const SELLER_DEFAULTS: Seller = {
  name: 'ТЕСТ Фирма ООД',
  eik: '123456789',
  vatNumber: 'BG123456789',
  address: 'гр. София, ул. Тестова 1',
  bankName: 'Тестова банка',
  iban: 'BG00TEST00001234567890',
  bic: 'TESTBGSF',
  paymentDays: 3,
};

const KEY = 'seller_details';

export async function getSeller(): Promise<Seller> {
  const row = await prisma.siteSettings.findUnique({ where: { key: KEY } });
  if (!row) return SELLER_DEFAULTS;
  try {
    return { ...SELLER_DEFAULTS, ...JSON.parse(row.value) };
  } catch {
    return SELLER_DEFAULTS;
  }
}

export async function saveSeller(seller: Seller): Promise<void> {
  const value = JSON.stringify(seller);
  await prisma.siteSettings.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
}

export function missingSellerFields(seller: Seller): string[] {
  const required: Array<keyof Seller> = ['name', 'eik', 'address', 'bankName', 'iban', 'bic'];
  return required.filter((k) => !String(seller[k] ?? '').trim());
}
