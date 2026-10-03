'use client';
import { useState } from 'react';

// Sends the proforma to the customer after a confirmation prompt.
export default function SendProformaButton({ orderId, email }: { orderId: number; email: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send() {
    if (!window.confirm(`Да изпратя проформа фактура на ${email}?`)) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/proforma`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok
        ? { ok: true, text: `Изпратена на ${data.to ?? email}` }
        : { ok: false, text: data.error ?? 'Грешка при изпращане.' });
    } catch {
      setMsg({ ok: false, text: 'Грешка при свързване.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <button
        type="button"
        onClick={send}
        disabled={busy}
        className="admin-action-btn"
        style={{ gap: 8, background: '#16a34a', borderColor: '#16a34a', color: '#fff', opacity: busy ? 0.7 : 1, cursor: busy ? 'wait' : 'pointer' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        {busy ? 'Изпращане…' : 'Изпрати проформа'}
      </button>
      {msg && (
        <span style={{ fontSize: 12, marginTop: 6, color: msg.ok ? '#15803d' : '#b91c1c' }}>{msg.text}</span>
      )}
    </div>
  );
}
