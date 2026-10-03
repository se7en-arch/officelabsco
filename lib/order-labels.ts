// Human-readable labels for stored order values.
// Newer orders use carrier 'none' (courier arranged with the customer) and
// payment 'proforma'; older orders keep their original values and labels.

export function carrierLabel(carrier: string): string {
  if (carrier === 'none') return 'Уговаря се с клиента';
  return carrier;
}

export function paymentLabel(payment: string): string {
  if (payment === 'proforma') return 'Проформа фактура';
  if (payment === 'card') return 'Банкова карта';
  return 'Наложен платеж';
}
