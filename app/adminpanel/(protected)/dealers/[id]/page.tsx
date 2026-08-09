'use client';
import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface DealerOrder {
  id: string;
  orderNumber: number | null;
  orderCode: string | null;
  createdAt: string;
  status: string;
  total: number;
  items: { quantity: number }[];
}

interface DealerDetail {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  eik: string;
  vatRegistered: boolean;
  vatNumber: string | null;
  discountPercent: number;
  status: string;
  notes: string | null;
  createdAt: string;
  orders: DealerOrder[];
}

const ORDER_STATUS: Record<string, string> = {
  new: 'Нова', processing: 'В обработка', shipped: 'Изпратена',
  completed: 'Завършена', cancelled: 'Отменена',
};

const ORDER_PILL: Record<string, { bg: string; color: string }> = {
  new:        { bg: '#EFF6FF', color: '#1E40AF' },
  processing: { bg: '#FEF9C3', color: '#854d0e' },
  shipped:    { bg: '#F5F3FF', color: '#5B21B6' },
  completed:  { bg: '#DCFCE7', color: '#166534' },
  cancelled:  { bg: '#F3F4F6', color: '#6B7280' },
};

const DEALER_PILL: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: '#FEF9C3', color: '#854d0e' },
  APPROVED: { bg: '#DCFCE7', color: '#166534' },
  REJECTED: { bg: '#FEE2E2', color: '#991b1b' },
};

const DEALER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Чака одобрение', APPROVED: 'Одобрен', REJECTED: 'Отказан',
};

function fmt(n: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AdminDealerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [dealer, setDealer] = useState<DealerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/dealers/${id}`)
      .then(r => r.json())
      .then(d => {
        setDealer(d);
        setDiscount(d.discountPercent);
        setNotes(d.notes ?? '');
        setStatus(d.status);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function save() {
    startSave(async () => {
      const res = await fetch(`/api/admin/dealers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, discountPercent: discount, notes }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDealer(d => d ? { ...d, ...updated } : d);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  if (loading) {
    return (
      <div className="admin-page-header">
        <h1>Зареждане...</h1>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="admin-page-header">
        <h1>Дилърът не е намерен</h1>
      </div>
    );
  }

  const pill = DEALER_PILL[dealer.status] ?? { bg: '#F3F4F6', color: '#374151' };
  const totalRevenue = dealer.orders.reduce((s, o) => s + o.total, 0);
  const totalItems = dealer.orders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

  return (
    <>
      {/* ── Header ── */}
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Link href="/adminpanel/dealers" className="admin-action-btn admin-action-btn--secondary" style={{ marginTop: 2, flexShrink: 0 }}>
            ← Дилъри
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1>{dealer.companyName}</h1>
              <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
                {DEALER_STATUS_LABEL[dealer.status] ?? dealer.status}
              </span>
            </div>
            <p>
              {dealer.contactName} · {dealer.email} · {dealer.phone} · Регистриран {new Date(dealer.createdAt).toLocaleDateString('bg-BG')}
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--blue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
          </div>
          <div className="admin-stat-card__value">{dealer.orders.length}</div>
          <div className="admin-stat-card__label">Поръчки</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="admin-stat-card__value" style={{ fontSize: 22 }}>{fmt(totalRevenue)}</div>
          <div className="admin-stat-card__label">Общ оборот (€)</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/>
            </svg>
          </div>
          <div className="admin-stat-card__value">{totalItems}</div>
          <div className="admin-stat-card__label">Артикули общо</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div className="admin-stat-card__value" style={{ color: 'var(--accent)' }}>{dealer.discountPercent}%</div>
          <div className="admin-stat-card__label">Текуща отстъпка</div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="admin-order-detail-grid">

        {/* Left — orders */}
        <div>
          <div className="admin-card">
            <div className="admin-card__header">
              <h2>Поръчки</h2>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{dealer.orders.length} общо</span>
            </div>
            {dealer.orders.length === 0 ? (
              <div className="admin-empty">Дилърът все още няма поръчки</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th style={{ textAlign: 'right' }}>Арт.</th>
                    <th style={{ textAlign: 'right' }}>Сума</th>
                    <th>Статус</th>
                    <th style={{ width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {dealer.orders.map(o => {
                    const op = ORDER_PILL[o.status] ?? { bg: '#F3F4F6', color: '#374151' };
                    const qty = o.items.reduce((s, i) => s + i.quantity, 0);
                    return (
                      <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/adminpanel/dealers/orders/${o.id}`}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          #{o.orderCode ?? String(o.orderNumber ?? 0).padStart(5, '0')}
                        </td>
                        <td style={{ color: 'var(--muted)' }}>
                          {new Date(o.createdAt).toLocaleDateString('bg-BG')}
                        </td>
                        <td style={{ textAlign: 'right' }}>{qty} бр.</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(o.total)} €</td>
                        <td>
                          <span className="admin-order-status-pill" style={{ background: op.bg, color: op.color }}>
                            {ORDER_STATUS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td>
                          <span className="admin-row-btn admin-row-btn--view">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Company data */}
          <div className="admin-card">
            <div className="admin-card__header"><h2>Фирмени данни</h2></div>
            <div className="admin-card__body">
              {[
                ['ЕИК', dealer.eik],
                ['ДДС регистрация', dealer.vatRegistered ? (dealer.vatNumber || 'Да, без номер') : 'Не'],
                ['Адрес', dealer.address],
                ['Град', dealer.city],
                ['Имейл', dealer.email],
                ['Телефон', dealer.phone],
              ].map(([label, value]) => (
                <div key={label} className="admin-detail-row">
                  <span className="admin-detail-row__label">{label}</span>
                  <span className="admin-detail-row__value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — management */}
        <div className="admin-order-detail-right">
          <div className="admin-card">
            <div className="admin-card__header"><h2>Управление</h2></div>
            <div className="admin-card__body">

              <div className="admin-form-group">
                <label className="admin-form-label">Статус</label>
                <select
                  className="admin-form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="PENDING">Чака одобрение</option>
                  <option value="APPROVED">Одобрен</option>
                  <option value="REJECTED">Отказан</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Отстъпка (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="admin-form-input"
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Бележки</label>
                <textarea
                  rows={4}
                  className="admin-form-textarea"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Вътрешни бележки за дилъра..."
                />
              </div>

              <button
                className="admin-action-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: 8,
                  background: saved ? 'var(--success)' : undefined,
                  opacity: saving ? 0.7 : 1,
                }}
                onClick={save}
                disabled={saving}
              >
                {saved ? '✓ Запазено' : saving ? 'Запазване...' : 'Запази промените'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
