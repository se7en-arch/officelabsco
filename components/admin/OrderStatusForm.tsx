'use client';
import { useState } from 'react';

export default function OrderStatusForm({
  orderId,
  currentStatus,
  statusLabels,
}: {
  orderId: number;
  currentStatus: string;
  statusLabels: Record<string, string>;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
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
        {saving ? 'Запазване...' : 'Запази статус'}
      </button>
      {saved && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )}
    </div>
  );
}
