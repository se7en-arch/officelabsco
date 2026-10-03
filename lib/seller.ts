// Seller (фирмата) details printed on proforma invoices. Fill every field before
// sending a proforma — the send action refuses while any required field is empty.
export const SELLER = {
  name:        '',   // Юридическо име, напр. "OfficeLabs Co ЕООД"
  eik:         '',   // ЕИК
  vatNumber:   '',   // ДДС номер (BG…)
  address:     '',   // Адрес на управление
  bankName:    '',   // Банка
  iban:        '',   // IBAN
  bic:         '',   // BIC / SWIFT
  paymentDays: 3,    // Срок за плащане в дни след изпращане на проформата
};

export function missingSellerFields(): string[] {
  const required: Array<[string, string]> = [
    ['name', SELLER.name], ['eik', SELLER.eik], ['address', SELLER.address],
    ['bankName', SELLER.bankName], ['iban', SELLER.iban], ['bic', SELLER.bic],
  ];
  return required.filter(([, v]) => !v.trim()).map(([k]) => k);
}
