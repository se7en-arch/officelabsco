import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL('/adminpanel', req.url));
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: true },
  });
  if (!order) return new NextResponse('Not found', { status: 404 });

  const isCompany = !!(order.company || order.eik);
  const year = new Date(order.createdAt).getFullYear();
  const invoiceNo = `INV-${year}-${String(order.id).padStart(4, '0')}`;
  const dateFormatted = new Date(order.createdAt)
    .toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });

  const subtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const rows = order.items.map((item, idx) => `
    <tr class="${idx % 2 !== 0 ? 'alt' : ''}">
      <td class="td td-no">${idx + 1}.</td>
      <td class="td td-desc">${esc(item.name)}<br><span class="sku">${esc(item.slug)}</span></td>
      <td class="td td-r">€ ${item.price.toFixed(2)}</td>
      <td class="td td-c">${item.quantity}</td>
      <td class="td td-r td-bold">€ ${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const billingAddr = isCompany ? `
    <div class="addr-name">${esc(order.company)}</div>
    ${order.eik  ? `<div class="addr-line">ЕИК: ${esc(order.eik)}</div>` : ''}
    ${order.vat  ? `<div class="addr-line">ДДС №: ${esc(order.vat)}</div>` : ''}
    ${order.mol  ? `<div class="addr-line">МОЛ: ${esc(order.mol)}</div>` : ''}
    <div class="addr-line">${esc(order.firstName)} ${esc(order.lastName)}</div>
  ` : `<div class="addr-name">${esc(order.firstName)} ${esc(order.lastName)}</div>`;

  const shippingAddr = order.delivType === 'address' ? `
    <div class="addr-name">${esc(order.firstName)} ${esc(order.lastName)}</div>
    ${order.address ? `<div class="addr-line">${esc(order.address)}</div>` : ''}
    ${order.city ? `<div class="addr-line">${order.postcode ? esc(order.postcode) + ' ' : ''}${esc(order.city)}</div>` : ''}
    <div class="addr-line">${esc(order.phone)}</div>
  ` : `
    <div class="addr-name">${esc(order.firstName)} ${esc(order.lastName)}</div>
    <div class="addr-line">Офис на ${esc(order.carrier)}</div>
    <div class="addr-line">${esc(order.phone)}</div>
  `;

  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Фактура ${invoiceNo}</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#1a1a1a;background:#e8e8e8;-webkit-font-smoothing:antialiased}

/* ── Print toolbar ── */
.toolbar{background:#1c1c1c;color:#fff;padding:12px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:sticky;top:0;z-index:99}
.toolbar-left{display:flex;align-items:center;gap:16px}
.back{color:rgba(255,255,255,.55);text-decoration:none;font-size:13px;font-weight:500;display:inline-flex;align-items:center;gap:6px}
.back:hover{color:#fff}
.toolbar-title{font-size:14px;font-weight:700}
.toolbar-sub{font-size:11px;color:rgba(255,255,255,.45);margin-top:1px}
.print-btn{background:#fff;color:#1c1c1c;border:none;padding:9px 22px;border-radius:6px;font-size:13px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:8px;letter-spacing:.2px}
.print-btn:hover{background:#f0f0f0}
.badge-company{display:inline-block;margin-left:10px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:#dbeafe;color:#1e40af;vertical-align:middle;letter-spacing:.3px}
.badge-person{display:inline-block;margin-left:10px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534;vertical-align:middle;letter-spacing:.3px}

/* ── Page wrapper ── */
.wrapper{display:flex;justify-content:center;padding:32px 24px 60px}

/* ── Invoice document ── */
.doc{background:#fff;width:794px;min-height:1123px;padding:52px 56px 44px;box-shadow:0 8px 40px rgba(0,0,0,.18)}

/* ── Header ── */
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:44px}
.brand{display:flex;align-items:center;gap:13px}
.brand-sq{width:42px;height:42px;background:#1c1c1c;flex-shrink:0}
.brand-name{font-size:17px;font-weight:800;letter-spacing:-.3px}
.brand-tag{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.8px;margin-top:3px}
.inv-title{font-size:42px;font-weight:900;letter-spacing:-2px;line-height:1;text-align:right}
.inv-date-hdr{font-size:11px;color:#666;text-align:right;margin-top:5px;text-transform:uppercase;letter-spacing:.5px}

/* ── Addresses gray box ── */
.addresses{display:grid;grid-template-columns:1fr 1fr;gap:32px;background:#f5f5f5;padding:24px 28px;margin-bottom:28px}
.addr-label{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#888;margin-bottom:10px}
.addr-name{font-size:14px;font-weight:700;margin-bottom:6px}
.addr-line{font-size:11.5px;color:#555;line-height:1.75}

/* ── Meta row ── */
.meta{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:2px}
.meta-date{font-size:10.5px;color:#888;text-transform:uppercase;letter-spacing:.4px}
.meta-no{font-size:13px;font-weight:800;letter-spacing:-.2px}

/* ── Table ── */
table{width:100%;border-collapse:collapse;margin-bottom:20px}
thead tr{border-top:2px solid #1c1c1c;border-bottom:1px solid #1c1c1c}
th{padding:9px 8px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.9px;text-align:left}
.th-no{width:32px}
.th-r{text-align:right}
.th-c{text-align:center}
tbody tr:last-child{border-bottom:2px solid #1c1c1c}
.td{padding:11px 8px;font-size:12px;color:#333;vertical-align:top;line-height:1.4}
.td-no{color:#888;font-size:11px}
.sku{font-size:10px;color:#aaa;margin-top:1px}
.td-r{text-align:right}
.td-c{text-align:center}
.td-bold{font-weight:700}
.alt{background:#f9f9f9}

/* ── Totals ── */
.totals{display:flex;justify-content:space-between;align-items:flex-start;padding:16px 0 28px}
.total-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#888;margin-bottom:8px}
.total-big{font-size:36px;font-weight:900;letter-spacing:-2px;position:relative;display:inline-block}
.total-big::after{content:'';position:absolute;bottom:2px;left:0;right:0;height:11px;background:repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(0,0,0,.07) 4px,rgba(0,0,0,.07) 6px);pointer-events:none}
.total-rows{min-width:220px}
.total-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;color:#444;border-bottom:1px solid #ebebeb}
.total-row:last-child{border-bottom:none}
.total-row-grand{font-weight:800;font-size:13px;color:#1c1c1c}
.total-row span:first-child{color:#666;font-size:10px;text-transform:uppercase;letter-spacing:.4px}
.total-row-grand span:first-child{color:#1c1c1c;font-size:11px}

/* ── Footer 3-col ── */
.footer{display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;padding:20px 0;border-top:1px solid #ddd;border-bottom:1px solid #ddd;margin-bottom:24px}
.footer-label{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:#1c1c1c;margin-bottom:8px}
.footer-text{font-size:11px;color:#555;line-height:1.7}
.footer-sig{font-family:Georgia,serif;font-style:italic;font-size:20px;color:#1c1c1c;margin:10px 0 4px}

/* ── Bottom bar ── */
.bottom{display:flex;justify-content:space-between;font-size:9.5px;color:#aaa;padding-top:12px}

/* ── Print ── */
@media print{
  body{background:#fff}
  .toolbar{display:none}
  .wrapper{padding:0}
  .doc{box-shadow:none;width:100%;padding:15mm 18mm 12mm}
  @page{size:A4;margin:0}
}
</style>
</head>
<body>

<div class="toolbar">
  <div class="toolbar-left">
    <a class="back" href="/adminpanel/orders/${order.id}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Назад
    </a>
    <div>
      <div class="toolbar-title">
        Фактура ${invoiceNo}
        <span class="${isCompany ? 'badge-company' : 'badge-person'}">${isCompany ? 'ФИРМА' : 'ФИЗИЧЕСКО ЛИЦЕ'}</span>
      </div>
      <div class="toolbar-sub">${esc(order.firstName)} ${esc(order.lastName)}${isCompany ? ' · ' + esc(order.company) : ''} · €${order.total.toFixed(2)}</div>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Изтегли PDF
  </button>
</div>

<div class="wrapper">
<div class="doc">

  <!-- Header -->
  <div class="hdr">
    <div class="brand">
      <div class="brand-sq"></div>
      <div>
        <div class="brand-name">OFFICELABS CO</div>
        <div class="brand-tag">Офис мебели и обзавеждане</div>
      </div>
    </div>
    <div>
      <div class="inv-title">ФАКТУРА</div>
      <div class="inv-date-hdr">ДАТА: ${dateFormatted.toUpperCase()}</div>
    </div>
  </div>

  <!-- Addresses -->
  <div class="addresses">
    <div>
      <div class="addr-label">Фактура към</div>
      ${billingAddr}
      ${order.address ? `<div class="addr-line">${esc(order.address)}</div>` : ''}
      ${order.city ? `<div class="addr-line">${order.postcode ? esc(order.postcode) + ' ' : ''}${esc(order.city)}</div>` : ''}
      <div class="addr-line">${esc(order.phone)}</div>
      <div class="addr-line">${esc(order.email)}</div>
    </div>
    <div>
      <div class="addr-label">Доставка към</div>
      ${shippingAddr}
    </div>
  </div>

  <!-- Meta -->
  <div class="meta">
    <div class="meta-date">ДАТА: ${dateFormatted.toUpperCase()}</div>
    <div class="meta-no">ФАКТУРА №: ${invoiceNo}</div>
  </div>

  <!-- Items table -->
  <table>
    <thead>
      <tr>
        <th class="th-no">№</th>
        <th>ОПИСАНИЕ НА АРТИКУЛА</th>
        <th class="th-r">ЦЕНА</th>
        <th class="th-c">КОЛ.</th>
        <th class="th-r">ОБЩО</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div>
      <div class="total-label">Дължимо общо</div>
      <div class="total-big">€ ${order.total.toFixed(2)}</div>
    </div>
    <div class="total-rows">
      <div class="total-row">
        <span>Подтотал</span>
        <span>€ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>ДДС</span>
        <span>0</span>
      </div>
      <div class="total-row total-row-grand">
        <span>Крайна сума</span>
        <span>€ ${order.total.toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div class="footer-label">Начин на плащане</div>
      <div class="footer-text">
        ${esc(order.payment === 'card' ? 'Банкова карта' : 'Наложен платеж')}<br>
        Куриер: ${esc(order.carrier)}<br>
        ${esc(order.delivType === 'address' ? 'Доставка до адрес' : 'Доставка до офис')}
      </div>
    </div>
    <div>
      <div class="footer-label">Условия</div>
      <div class="footer-text">
        Плащането се извършва при доставка или онлайн.<br>
        Рекламации в срок от 14 дни от получаването.<br>
        При връщане — 30 дни от дата на покупка.
      </div>
    </div>
    <div>
      <div class="footer-label">Изготвил</div>
      <div class="footer-sig">OfficeLabs Co</div>
      <div class="footer-text">OFFICELABS CO<br>Административен отдел</div>
    </div>
  </div>

  <!-- Bottom -->
  <div class="bottom">
    <div>Въпроси? Пишете ни на <strong>info@officelabsco.com</strong></div>
    <div>officelabs.bg &nbsp;·&nbsp; facebook &nbsp;·&nbsp; instagram</div>
  </div>

</div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
