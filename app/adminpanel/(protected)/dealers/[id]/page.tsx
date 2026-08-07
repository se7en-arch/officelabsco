'use client';
import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DealerOrder { id: string; createdAt: string; status: string; total: number; items: { quantity: number }[]; }
interface DealerDetail {
  id: string; companyName: string; contactName: string; email: string; phone: string;
  address: string; city: string; eik: string; vatRegistered: boolean; vatNumber: string | null;
  discountPercent: number; status: string; notes: string | null; createdAt: string;
  orders: DealerDetail['orders'] extends never ? DealerOrder[] : DealerOrder[];
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Нова', processing: 'В обработка', shipped: 'Изпратена', completed: 'Завършена', cancelled: 'Отменена',
};

function fmt(n: number) { return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function AdminDealerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dealer, setDealer] = useState<DealerDetail & { orders: DealerOrder[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, startSave] = useTransition();
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/dealers/${id}`).then(r => r.json()).then(d => {
      setDealer(d);
      setDiscount(d.discountPercent);
      setNotes(d.notes ?? '');
      setStatus(d.status);
    }).finally(() => setLoading(false));
  }, [id]);

  async function save() {
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
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  if (loading) return <div className="admin-page-header"><h1>Зареждане...</h1></div>;
  if (!dealer) return <div className="admin-page-header"><h1>Не е намерен</h1></div>;

  const STATUS_PILL: Record<string, { bg: string; color: string }> = {
    PENDING:  { bg: '#fef9c3', color: '#854d0e' },
    APPROVED: { bg: '#dcfce7', color: '#166534' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b' },
  };
  const pill = STATUS_PILL[dealer.status] ?? { bg: '#f3f4f6', color: '#374151' };

  return (
    <>
      <div className="admin-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/adminpanel/dealers" className="admin-action-btn admin-action-btn--secondary">← Дилъри</Link>
          <div>
            <h1>{dealer.companyName}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
              {dealer.contactName} · {dealer.email} · Регистриран {new Date(dealer.createdAt).toLocaleDateString('bg-BG')}
            </p>
          </div>
          <span className="admin-order-status-pill" style={{ background: pill.bg, color: pill.color }}>
            {{ PENDING: 'Чака', APPROVED: 'Одобрен', REJECTED: 'Отказан' }[dealer.status] ?? dealer.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: orders */}
        <div className="admin-card">
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
            Поръчки ({dealer.orders.length})
          </h2>
          {dealer.orders.length === 0 ? (
            <div className="admin-empty">Няма поръчки</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Дата</th>
                  <th style={{ textAlign: 'right' }}>Артикули</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {dealer.orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700 }}>{o.id.slice(-8).toUpperCase()}</td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{new Date(o.createdAt).toLocaleDateString('bg-BG')}</td>
                    <td style={{ textAlign: 'right' }}>{o.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)} бр.</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(o.total)} лв.</td>
                    <td style={{ fontSize: 12 }}>{STATUS_LABELS[o.status] ?? o.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right: management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile info */}
          <div className="admin-card">
            <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Данни</h2>
            {[
              ['ЕИК', dealer.eik],
              ['ДДС', dealer.vatRegistered ? (dealer.vatNumber || 'Да') : 'Не'],
              ['Телефон', dealer.phone],
              ['Адрес', `${dealer.address}, ${dealer.city}`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Management */}
          <div className="admin-card">
            <h2 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Управление</h2>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Статус</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, background: 'var(--surface)' }}>
                <option value="PENDING">Чака одобрение</option>
                <option value="APPROVED">Одобрен</option>
                <option value="REJECTED">Отказан</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Отстъпка (%)</label>
              <input
                type="number" min={0} max={100} value={discount}
                onChange={e => setDiscount(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, background: 'var(--surface)' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Бележки</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', background: 'var(--surface)' }} />
            </div>

            <button
              onClick={save} disabled={saving}
              className="admin-action-btn"
              style={{ width: '100%', justifyContent: 'center', background: saved ? '#16a34a' : undefined }}
            >
              {saved ? '✓ Запазено' : saving ? 'Запазване...' : 'Запази промените'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
