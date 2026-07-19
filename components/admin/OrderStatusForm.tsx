'use client';
import { useState } from 'react';

export default function OrderStatusForm({
  orderId,
  currentStatus,
  currentTrackingNumber,
  statusLabels,
}: {
  orderId: number;
  currentStatus: string;
  currentTrackingNumber?: string | null;
  statusLabels: Record<string, string>;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setError('');
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, trackingNumber: trackingNumber || null }),
    });
    setSaving(false);
    if (!res.ok) { setError('Грешка при запазване'); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const showTracking = status === 'shipped' || status === 'delivered' || !!trackingNumber;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          className="admin-form-select"
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ minWidth: 180 }}
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button
          type="button"
          className="admin-action-btn"
          onClick={handleSave}
          disabled={saving}
          style={{ padding: '9px 20px' }}
        >
          {saving ? 'Запазване...' : 'Запази'}
        </button>
        {saved && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
        {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
      </div>

      {showTracking && (
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 6 }}>
            Номер за проследяване
          </label>
          <input
            className="admin-form-input"
            type="text"
            placeholder="напр. SP123456789BG"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            style={{ maxWidth: 280 }}
          />
        </div>
      )}
    </div>
  );
}
