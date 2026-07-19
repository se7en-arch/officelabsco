import { Resend } from 'resend';

export interface OrderEmailData {
  id:        number;
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  company?:  string | null;
  eik?:      string | null;
  vat?:      string | null;
  mol?:      string | null;
  carrier:   string;
  delivType: string;
  city:      string;
  address?:  string | null;
  postcode?: string | null;
  payment:   string;
  total:     number;
  createdAt: Date;
  items: Array<{
    name:     string;
    slug:     string;
    price:    number;
    quantity: number;
  }>;
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return '';
  return `
    <tr>
      <td style="padding:5px 0;font-size:12px;color:#888;width:130px;vertical-align:top">${label}</td>
      <td style="padding:5px 0;font-size:13px;color:#1a1a1a;font-weight:500">${value}</td>
    </tr>`;
}

// ─── Admin notification email ───────────────────────────────────────────────

function buildAdminHtml(order: OrderEmailData): string {
  const isCompany = !!(order.company || order.eik);
  const invoiceNo = `INV-${new Date(order.createdAt).getFullYear()}-${String(order.id).padStart(4, '0')}`;
  const date = new Date(order.createdAt).toLocaleDateString('bg-BG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://officelabsco.com'}/adminpanel/orders/${order.id}`;

  const itemRows = order.items.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fff' : '#f9f9f9'}">
      <td style="padding:11px 14px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:11px 14px;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:right">€ ${item.price.toFixed(2)}</td>
      <td style="padding:11px 14px;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:11px 14px;font-size:13px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;text-align:right">€ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr>
    <td style="background:#1c1c1c;padding:24px 32px;border-radius:10px 10px 0 0">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <div style="font-size:16px;font-weight:800;color:#fff;letter-spacing:-0.3px">OFFICELABS CO</div>
            <div style="font-size:10px;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:0.8px;margin-top:2px">Офис мебели и обзавеждане</div>
          </td>
          <td align="right">
            <div style="font-size:11px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:0.8px">Нова поръчка</div>
            <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-top:2px">#${String(order.id).padStart(4, '0')}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Alert bar -->
  <tr>
    <td style="background:#F59E0B;padding:10px 32px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:12px;font-weight:700;color:#1a1a1a">${invoiceNo} &nbsp;·&nbsp; ${date}</td>
          <td align="right" style="font-size:12px;font-weight:700;color:#1a1a1a">${isCompany ? 'Фирма' : 'Физическо лице'}</td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="background:#fff;padding:28px 32px">

      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:12px">Данни на клиента</div>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${row('Имена', `${order.firstName} ${order.lastName}`)}
        ${row('Email', order.email)}
        ${row('Телефон', order.phone)}
        ${isCompany ? row('Фирма', order.company) : ''}
        ${isCompany ? row('ЕИК', order.eik) : ''}
        ${isCompany && order.vat ? row('ДДС №', order.vat) : ''}
        ${isCompany ? row('МОЛ', order.mol) : ''}
      </table>

      <div style="border-top:1px solid #eee;margin:20px 0"></div>

      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:12px">Поръчани артикули</div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;border-collapse:collapse">
        <tr style="background:#f5f5f5">
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:left;border-bottom:1px solid #eee">Артикул</th>
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:right;border-bottom:1px solid #eee">Цена</th>
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:center;border-bottom:1px solid #eee">Кол.</th>
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:right;border-bottom:1px solid #eee">Общо</th>
        </tr>
        ${itemRows}
        <tr style="background:#f9f9f9">
          <td colspan="3" style="padding:9px 14px;font-size:11px;color:#888;text-align:right;border-top:1px solid #eee">Подтотал</td>
          <td style="padding:9px 14px;font-size:13px;color:#1a1a1a;text-align:right;border-top:1px solid #eee">€ ${subtotal.toFixed(2)}</td>
        </tr>
        <tr style="background:#1c1c1c">
          <td colspan="3" style="padding:12px 14px;font-size:12px;font-weight:700;color:rgba(255,255,255,.7);text-align:right">КРАЙНА СУМА</td>
          <td style="padding:12px 14px;font-size:16px;font-weight:800;color:#fff;text-align:right">€ ${order.total.toFixed(2)}</td>
        </tr>
      </table>

      <div style="border-top:1px solid #eee;margin:20px 0"></div>

      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:12px">Доставка и плащане</div>
      <table cellpadding="0" cellspacing="0" width="100%">
        ${row('Куриер', order.carrier.charAt(0).toUpperCase() + order.carrier.slice(1))}
        ${row('Тип доставка', order.delivType === 'address' ? 'До адрес' : 'До офис')}
        ${row('Град', order.city)}
        ${order.delivType === 'address' ? row('Адрес', order.address) : ''}
        ${order.delivType === 'address' && order.postcode ? row('Пощ. код', order.postcode) : ''}
        ${row('Плащане', order.payment === 'card' ? 'Банкова карта' : 'Наложен платеж')}
      </table>

      <div style="border-top:1px solid #eee;margin:20px 0"></div>

      <div align="center" style="margin-top:8px">
        <a href="${adminUrl}" style="display:inline-block;background:#1c1c1c;color:#fff;text-decoration:none;padding:12px 28px;border-radius:7px;font-size:13px;font-weight:700;letter-spacing:0.2px">
          Виж поръчката в админ панела &rarr;
        </a>
      </div>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f5f5f5;padding:18px 32px;border-radius:0 0 10px 10px;border-top:1px solid #eee">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#aaa">OfficeLabs Co &nbsp;·&nbsp; Офис мебели и обзавеждане</td>
          <td align="right" style="font-size:11px;color:#aaa">${invoiceNo}</td>
        </tr>
      </table>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

// ─── Customer confirmation email ────────────────────────────────────────────

function buildCustomerHtml(order: OrderEmailData): string {
  const orderNo = `#${String(order.id).padStart(4, '0')}`;
  const date = new Date(order.createdAt).toLocaleDateString('bg-BG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const itemRows = order.items.map((item, idx) => `
    <tr style="background:${idx % 2 === 0 ? '#fff' : '#f9f9f9'}">
      <td style="padding:11px 14px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #eee">${item.name}</td>
      <td style="padding:11px 14px;font-size:13px;color:#555;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
      <td style="padding:11px 14px;font-size:13px;font-weight:700;color:#1a1a1a;border-bottom:1px solid #eee;text-align:right">€ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="bg">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:32px 16px">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr>
    <td style="background:#1c1c1c;padding:28px 32px;border-radius:10px 10px 0 0;text-align:center">
      <div style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px">OFFICELABS CO</div>
      <div style="font-size:10px;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:1px;margin-top:4px">Офис мебели и обзавеждане</div>
    </td>
  </tr>

  <!-- Thank you block -->
  <tr>
    <td style="background:#fff;padding:36px 32px 24px;text-align:center;border-bottom:1px solid #f0f0f0">
      <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:56px">✓</div>
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#1a1a1a;letter-spacing:-0.5px">Благодарим за поръчката!</h1>
      <p style="margin:0;font-size:14px;color:#666;line-height:1.6">
        Здравейте, <strong>${order.firstName}</strong>! Получихме вашата поръчка <strong>${orderNo}</strong> от ${date}.<br>
        Ще се свържем с вас при изпращане на пратката.
      </p>
    </td>
  </tr>

  <!-- Order summary -->
  <tr>
    <td style="background:#fff;padding:24px 32px">

      <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:14px">Вашата поръчка</div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;border-collapse:collapse">
        <tr style="background:#f5f5f5">
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:left;border-bottom:1px solid #eee">Артикул</th>
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:center;border-bottom:1px solid #eee">Кол.</th>
          <th style="padding:9px 14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:#888;text-align:right;border-bottom:1px solid #eee">Сума</th>
        </tr>
        ${itemRows}
        <tr style="background:#1c1c1c">
          <td colspan="2" style="padding:12px 14px;font-size:12px;font-weight:700;color:rgba(255,255,255,.7)">КРАЙНА СУМА</td>
          <td style="padding:12px 14px;font-size:16px;font-weight:800;color:#fff;text-align:right">€ ${order.total.toFixed(2)}</td>
        </tr>
      </table>

      <!-- Delivery details -->
      <div style="margin-top:24px;background:#f9f9f9;border-radius:8px;padding:18px 20px">
        <div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#aaa;margin-bottom:10px">Доставка</div>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${row('Куриер', order.carrier.charAt(0).toUpperCase() + order.carrier.slice(1))}
          ${row('Тип', order.delivType === 'address' ? 'До адрес' : 'До офис на куриера')}
          ${row('Град', order.city)}
          ${order.delivType === 'address' ? row('Адрес', order.address) : ''}
          ${row('Плащане', order.payment === 'card' ? 'Банкова карта' : 'Наложен платеж')}
        </table>
      </div>

      <!-- What's next -->
      <div style="margin-top:24px;border-left:3px solid #F59E0B;padding-left:16px">
        <div style="font-size:12px;font-weight:700;color:#1a1a1a;margin-bottom:6px">Какво следва?</div>
        <div style="font-size:13px;color:#555;line-height:1.7">
          1. Ще прегледаме поръчката ви и ще я потвърдим.<br>
          2. При изпращане ще получите имейл с номер за проследяване.<br>
          3. При въпроси — пишете ни на <a href="mailto:info@officelabsco.com" style="color:#1a1a1a;font-weight:600">info@officelabsco.com</a>
        </div>
      </div>

    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#f5f5f5;padding:20px 32px;border-radius:0 0 10px 10px;border-top:1px solid #eee;text-align:center">
      <div style="font-size:11px;color:#aaa">OfficeLabs Co &nbsp;·&nbsp; <a href="https://officelabsco.com" style="color:#aaa;text-decoration:none">officelabsco.com</a> &nbsp;·&nbsp; info@officelabsco.com</div>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

// ─── Send functions ──────────────────────────────────────────────────────────

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('[Mailer] RESEND_API_KEY не е зададен — пропускам admin нотификация.');
    return;
  }

  const to      = process.env.NOTIFY_EMAIL ?? 'info@officelabsco.com';
  const subject = `Нова поръчка #${String(order.id).padStart(4, '0')} — €${order.total.toFixed(2)} | OfficeLabs Co`;

  const { error } = await resend.emails.send({
    from:    'OfficeLabs Co <noreply@officelabsco.com>',
    to,
    replyTo: order.email,
    subject,
    html:    buildAdminHtml(order),
  });

  if (error) console.error('[Mailer] Admin имейл грешка:', error);
  else console.log(`[Mailer] Admin нотификация → ${to}`);
}

export async function sendCustomerConfirmation(order: OrderEmailData): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('[Mailer] RESEND_API_KEY не е зададен — пропускам потвърждение към клиент.');
    return;
  }

  const subject = `Потвърждение на поръчка #${String(order.id).padStart(4, '0')} — OfficeLabs Co`;

  const { error } = await resend.emails.send({
    from:    'OfficeLabs Co <noreply@officelabsco.com>',
    to:      order.email,
    replyTo: 'info@officelabsco.com',
    subject,
    html:    buildCustomerHtml(order),
  });

  if (error) console.error('[Mailer] Клиентски имейл грешка:', error);
  else console.log(`[Mailer] Потвърждение → ${order.email}`);
}
