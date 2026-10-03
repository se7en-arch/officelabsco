import { Resend } from 'resend';
import { SELLER } from '@/lib/seller';
import { paymentLabel } from '@/lib/order-labels';

type ProformaOrder = {
  id: number;
  orderNumber: number | null;
  orderCode: string | null;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string | null;
  eik: string | null;
  vat: string | null;
  mol: string | null;
  delivType: string;
  address: string | null;
  postcode: string | null;
  city: string;
  carrier: string;
  payment: string;
  total: number;
  items: Array<{ name: string; slug: string; price: number; quantity: number }>;
};

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function proformaNumber(order: Pick<ProformaOrder, 'id' | 'orderNumber' | 'orderCode'>): string {
  return `PRO-${order.orderCode ?? String(order.orderNumber ?? order.id).padStart(5, '0')}`;
}

/** Proforma = payment request before delivery; it is not a tax document. */
export function buildProformaHtml(order: ProformaOrder, vatPct: number): string {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vatAmount = vatPct > 0 ? +((subtotal * vatPct) / (100 + vatPct)).toFixed(2) : 0;
  const net = +(subtotal - vatAmount).toFixed(2);
  const isCompany = !!(order.company || order.eik);
  const date = new Date(order.createdAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
  const due = new Date(Date.now() + SELLER.paymentDays * 86400000).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });

  const rows = order.items.map((item, idx) => `
    <tr style="background:${idx % 2 ? '#f9f9f9' : '#fff'}">
      <td style="padding:9px 8px;font-size:12px;color:#333;border-bottom:1px solid #eee">${esc(item.name)}</td>
      <td style="padding:9px 8px;font-size:12px;color:#333;border-bottom:1px solid #eee;text-align:right">€ ${item.price.toFixed(2)}</td>
      <td style="padding:9px 8px;font-size:12px;color:#333;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:9px 8px;font-size:12px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;text-align:right">€ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const buyer = isCompany
    ? `<strong>${esc(order.company)}</strong><br>${order.eik ? `ЕИК: ${esc(order.eik)}<br>` : ''}${order.vat ? `ДДС №: ${esc(order.vat)}<br>` : ''}${order.mol ? `МОЛ: ${esc(order.mol)}<br>` : ''}${esc(order.firstName)} ${esc(order.lastName)}`
    : `<strong>${esc(order.firstName)} ${esc(order.lastName)}</strong>`;

  const delivery = order.delivType === 'address'
    ? `${esc(order.address)}${order.postcode ? ', ' + esc(order.postcode) : ''} ${esc(order.city)}`
    : `Офис на куриер, ${esc(order.city)} (уговаря се с клиента)`;

  return `<!DOCTYPE html>
<html lang="bg"><head><meta charset="UTF-8"><title>Проформа фактура ${proformaNumber(order)}</title></head>
<body style="margin:0;padding:0;background:#f3f3f3;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<div style="max-width:720px;margin:24px auto;background:#fff;padding:36px 40px">
  <table style="width:100%;border-collapse:collapse"><tr>
    <td style="vertical-align:top">
      <div style="font-size:17px;font-weight:800">${esc(SELLER.name)}</div>
      <div style="font-size:11px;color:#666;line-height:1.6;margin-top:4px">
        ЕИК: ${esc(SELLER.eik)}${SELLER.vatNumber ? `<br>ДДС №: ${esc(SELLER.vatNumber)}` : ''}<br>${esc(SELLER.address)}
      </div>
    </td>
    <td style="vertical-align:top;text-align:right">
      <div style="font-size:26px;font-weight:900;letter-spacing:-1px">ПРОФОРМА ФАКТУРА</div>
      <div style="font-size:12px;color:#444;margin-top:6px">№ ${proformaNumber(order)}</div>
      <div style="font-size:11px;color:#888;margin-top:2px">${date}</div>
    </td>
  </tr></table>

  <table style="width:100%;border-collapse:collapse;margin-top:26px;background:#f5f5f5"><tr>
    <td style="padding:16px 18px;vertical-align:top;width:50%">
      <div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:8px">Получател</div>
      <div style="font-size:12px;line-height:1.6">${buyer}</div>
    </td>
    <td style="padding:16px 18px;vertical-align:top;width:50%">
      <div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:8px">Доставка</div>
      <div style="font-size:12px;line-height:1.6">${esc(order.firstName)} ${esc(order.lastName)}<br>${delivery}<br>${esc(order.phone)}</div>
    </td>
  </tr></table>

  <table style="width:100%;border-collapse:collapse;margin-top:24px">
    <thead><tr style="border-top:2px solid #1a1a1a;border-bottom:1px solid #1a1a1a">
      <th style="padding:9px 8px;font-size:10px;text-align:left;text-transform:uppercase;letter-spacing:.6px">Артикул</th>
      <th style="padding:9px 8px;font-size:10px;text-align:right;text-transform:uppercase;letter-spacing:.6px">Цена</th>
      <th style="padding:9px 8px;font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:.6px">Брой</th>
      <th style="padding:9px 8px;font-size:10px;text-align:right;text-transform:uppercase;letter-spacing:.6px">Сума</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <table style="width:100%;border-collapse:collapse;margin-top:16px"><tr>
    <td></td>
    <td style="width:260px">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <tr><td style="padding:4px 0;color:#555">Данъчна основа</td><td style="text-align:right">€ ${net.toFixed(2)}</td></tr>
        <tr><td style="padding:4px 0;color:#555">ДДС ${vatPct}%</td><td style="text-align:right">€ ${vatAmount.toFixed(2)}</td></tr>
        <tr><td style="padding:10px 0 4px;font-size:14px;font-weight:800;border-top:2px solid #1a1a1a">За плащане</td>
            <td style="padding:10px 0 4px;font-size:18px;font-weight:900;text-align:right;border-top:2px solid #1a1a1a">€ ${order.total.toFixed(2)}</td></tr>
      </table>
    </td>
  </tr></table>

  <div style="margin-top:28px;padding:16px 18px;background:#f5f5f5;font-size:12px;line-height:1.7">
    <div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:6px">Банкови данни за плащане</div>
    Получател: <strong>${esc(SELLER.name)}</strong><br>
    Банка: ${esc(SELLER.bankName)}<br>
    IBAN: <strong>${esc(SELLER.iban)}</strong><br>
    BIC: ${esc(SELLER.bic)}<br>
    Основание: <strong>${proformaNumber(order)}</strong><br>
    Срок за плащане: до ${due}
  </div>

  <div style="margin-top:18px;font-size:11px;color:#777;line-height:1.6">
    Начин на плащане: ${paymentLabel(order.payment)}. Проформата е предварителна сметка и не е данъчен документ.
    След получаване на плащането ще издадем фактура. Доставката се уговаря след плащането.
  </div>
</div>
</body></html>`;
}

export async function sendProforma(order: ProformaOrder, vatPct: number): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'Липсва RESEND_API_KEY.' };
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from:    'OfficeLabs Co <noreply@officelabsco.com>',
    to:      order.email,
    replyTo: 'info@officelabsco.com',
    subject: `Проформа фактура ${proformaNumber(order)} — OfficeLabs Co`,
    html:    buildProformaHtml(order, vatPct),
  });
  if (error) return { ok: false, error: String(error.message ?? error) };
  return { ok: true };
}
