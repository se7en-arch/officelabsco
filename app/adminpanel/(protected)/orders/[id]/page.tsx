import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import OrderStatusForm from '@/components/admin/OrderStatusForm';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Нова',
  processing: 'В обработка',
  shipped: 'Изпратена',
  delivered: 'Доставена',
  cancelled: 'Отказана',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped:    { bg: '#ede9fe', color: '#5b21b6' },
  delivered:  { bg: '#dcfce7', color: '#166534' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

function parseUA(ua: string) {
  const mobile  = /mobile|android(?!.*tablet)|iphone|ipod/i.test(ua);
  const tablet  = /tablet|ipad/i.test(ua);
  const device  = tablet ? 'Таблет' : mobile ? 'Мобилен' : 'Десктоп';

  let browser = 'Неизвестен';
  if (/edg\//i.test(ua))                        browser = 'Microsoft Edge';
  else if (/opr\/|opera/i.test(ua))             browser = 'Opera';
  else if (/chrome\/|crios\//i.test(ua))        browser = 'Chrome';
  else if (/firefox\/|fxios\//i.test(ua))       browser = 'Firefox';
  else if (/safari\//i.test(ua))                browser = 'Safari';

  const bVer = ua.match(/(?:Chrome|CriOS|Firefox|FxiOS|Edg|OPR|Version)\/(\d+)/i)?.[1];
  if (bVer) browser += ` ${bVer}`;

  let os = 'Неизвестна';
  if (/windows nt 10|windows nt 11/i.test(ua))  os = 'Windows 10/11';
  else if (/windows/i.test(ua))                  os = 'Windows';
  else if (/iphone|ipad/i.test(ua)) {
    const v = ua.match(/OS (\d+[_\d]*)/i)?.[1]?.replace(/_/g, '.');
    os = v ? `iOS ${v}` : 'iOS';
  }
  else if (/android/i.test(ua)) {
    const v = ua.match(/Android ([\d.]+)/i)?.[1];
    os = v ? `Android ${v}` : 'Android';
  }
  else if (/mac os x/i.test(ua)) {
    const v = ua.match(/Mac OS X ([\d_]+)/i)?.[1]?.replace(/_/g, '.');
    os = v ? `macOS ${v}` : 'macOS';
  }
  else if (/linux/i.test(ua))                    os = 'Linux';

  return { device, browser, os };
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="admin-detail-row">
      <span className="admin-detail-row__label">{label}</span>
      <span className="admin-detail-row__value">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: parseInt(id) },
    include: { items: true },
  });

  if (!order) notFound();

  const statusStyle = STATUS_COLORS[order.status] ?? { bg: '#f3f4f6', color: '#374151' };

  return (
    <>
      {/* Header */}
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1>Поръчка #{String(order.id).padStart(4, '0')}</h1>
            <p>{new Date(order.createdAt).toLocaleString('bg-BG')}</p>
          </div>
          <span className="admin-order-status-pill" style={{ background: statusStyle.bg, color: statusStyle.color }}>
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href={`/api/admin/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener"
            className="admin-action-btn"
            style={{ gap: 8 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Изтегли фактура
          </a>
          <Link href="/adminpanel/orders" className="admin-cancel-btn">← Назад</Link>
        </div>
      </div>

      <div className="admin-order-detail-grid">

        {/* ── Left: Products + Status ── */}
        <div className="admin-order-detail-left">

          {/* Products */}
          <div className="admin-card" style={{ marginBottom: 16 }}>
            <div className="admin-card__header">
              <h2>Продукти</h2>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{order.items.length} бр.</span>
            </div>
            <div style={{ padding: '4px 0' }}>
              {order.items.map((item) => (
                <div key={item.id} className="admin-order-item">
                  <div className="admin-order-item__img">
                    <Image src={item.image} alt={item.name} width={44} height={44} style={{ objectFit: 'contain', padding: 4 }} />
                  </div>
                  <div className="admin-order-item__info">
                    <div className="admin-order-item__name">{item.name}</div>
                    <div className="admin-order-item__meta">{item.price.toFixed(2)} € × {item.quantity}</div>
                  </div>
                  <div className="admin-order-item__total">{(item.price * item.quantity).toFixed(2)} €</div>
                </div>
              ))}
              <div className="admin-order-total">
                <span>Общо</span>
                <strong>{order.total.toFixed(2)} €</strong>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="admin-card" style={{ marginBottom: 16 }}>
            <div className="admin-card__header"><h2>Смени статус</h2></div>
            <div className="admin-card__body">
              <OrderStatusForm orderId={order.id} currentStatus={order.status} statusLabels={STATUS_LABELS} />
            </div>
          </div>

          {/* Tech info */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div className="admin-card__header">
              <h2>Технически данни</h2>
            </div>
            <div className="admin-card__body" style={{ padding: '12px 20px' }}>

              {!order.ipAddress && !order.userAgent ? (
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                  Данните се записват само за нови поръчки.
                </p>
              ) : (
                <>
                  {/* Device */}
                  {order.userAgent && (() => {
                    const { device, browser, os } = parseUA(order.userAgent);
                    return (
                      <>
                        <DetailRow label="Устройство" value={device} />
                        <DetailRow label="Браузър"    value={browser} />
                        <DetailRow label="ОС"         value={os} />
                      </>
                    );
                  })()}
                  <DetailRow label="Език"      value={order.acceptLang} />
                  <DetailRow label="Timezone"  value={order.timezone} />

                  {/* Divider */}
                  {order.ipAddress && <div style={{ borderTop: '1px solid var(--line)', margin: '10px 0' }} />}

                  {/* Network */}
                  <DetailRow label="IP адрес"  value={order.ipAddress} />
                  <DetailRow label="Държава"   value={order.geoCountry} />
                  <DetailRow label="Регион"    value={order.geoRegion} />
                  <DetailRow label="Град (IP)" value={order.geoCity} />
                  <DetailRow label="ISP / Орг" value={order.geoIsp} />

                  {/* UTM */}
                  {(order.utmSource || order.utmMedium || order.utmCampaign) && (
                    <>
                      <div style={{ borderTop: '1px solid var(--line)', margin: '10px 0' }} />
                      <DetailRow label="UTM Source"   value={order.utmSource} />
                      <DetailRow label="UTM Medium"   value={order.utmMedium} />
                      <DetailRow label="UTM Campaign" value={order.utmCampaign} />
                    </>
                  )}

                  {/* Referer */}
                  {order.referer && (
                    <>
                      <div style={{ borderTop: '1px solid var(--line)', margin: '10px 0' }} />
                      <div className="admin-detail-row" style={{ alignItems: 'flex-start' }}>
                        <span className="admin-detail-row__label">Referer</span>
                        <span className="admin-detail-row__value" style={{ wordBreak: 'break-all', fontSize: 12 }}>
                          {order.referer}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Customer + Delivery ── */}
        <div className="admin-order-detail-right">

          {/* Customer */}
          <div className="admin-card" style={{ marginBottom: 16 }}>
            <div className="admin-card__header">
              <h2>Клиент</h2>
            </div>
            <div className="admin-card__body" style={{ padding: '12px 20px' }}>
              <DetailRow label="Имена" value={`${order.firstName} ${order.lastName}`} />
              <DetailRow label="Email" value={order.email} />
              <DetailRow label="Телефон" value={order.phone} />
              <DetailRow label="Фирма" value={order.company} />
              <DetailRow label="ЕИК" value={order.eik} />
              <DetailRow label="ДДС №" value={order.vat} />
              <DetailRow label="МОЛ" value={order.mol} />
            </div>
          </div>

          {/* Delivery */}
          <div className="admin-card" style={{ marginBottom: 0 }}>
            <div className="admin-card__header">
              <h2>Доставка</h2>
            </div>
            <div className="admin-card__body" style={{ padding: '12px 20px' }}>
              <DetailRow label="Куриер" value={order.carrier} />
              <DetailRow label="Тип" value={order.delivType === 'address' ? 'До адрес' : 'До офис'} />
              <DetailRow label="Град" value={order.city} />
              <DetailRow label="Адрес" value={order.address} />
              <DetailRow label="Пощ. код" value={order.postcode} />
              <DetailRow label="Плащане" value={order.payment === 'card' ? 'Карта' : 'Наложен платеж'} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
