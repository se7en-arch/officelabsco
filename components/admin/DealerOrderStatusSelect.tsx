'use client';
import { useState, useTransition } from 'react';

export default function DealerOrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      await fetch(`/api/admin/dealers/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="admin-table-select"
        style={{ height: 36 }}
      >
        <option value="new">Нова</option>
        <option value="processing">В обработка</option>
        <option value="shipped">Изпратена</option>
        <option value="completed">Завършена</option>
        <option value="cancelled">Отменена</option>
      </select>
      <button
        onClick={save}
        disabled={pending}
        className="admin-action-btn"
        style={{ background: saved ? 'var(--success)' : undefined }}
      >
        {saved ? '✓ Запазено' : pending ? 'Запазване...' : 'Запази статус'}
      </button>
    </div>
  );
}
