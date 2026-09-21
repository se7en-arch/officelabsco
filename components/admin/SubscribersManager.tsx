'use client';
import { useState } from 'react';

type Sub = { id: number; email: string; locale: string; source: string | null; createdAt: string };

const sourceLabel = (s: string | null) =>
  !s ? '—' : s === 'shop-form' ? 'Форма в магазина' : s.startsWith('popup:') ? `Попъп #${s.slice(6)}` : s;

export default function SubscribersManager({ initial, total }: { initial: Sub[]; total: number }) {
  const [subs, setSubs] = useState(initial);
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<number | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  async function remove(id: number) {
    setBusy(id);
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' });
    if (res.ok) setSubs((prev) => prev.filter((s) => s.id !== id));
    setBusy(null); setConfirm(null);
  }

  const shown = q.trim() ? subs.filter((s) => s.email.includes(q.trim().toLowerCase())) : subs;

  return (
    <div className="admin-card">
      <div className="admin-card__header" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="admin-form-input" placeholder="Търси имейл…" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }}
        />
        {total > initial.length && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Показани са последните {initial.length} — CSV експортът съдържа всички.</span>
        )}
      </div>
      <div className="admin-card__body" style={{ padding: 0 }}>
        {shown.length === 0 ? (
          <div className="admin-empty">{subs.length === 0 ? 'Още няма абонати' : 'Няма резултати'}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Имейл</th>
                <th style={{ width: 70 }}>Език</th>
                <th style={{ width: 170 }}>Източник</th>
                <th style={{ width: 150 }}>Дата</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((s) => (
                <tr key={s.id} style={{ opacity: busy === s.id ? 0.5 : 1 }}>
                  <td style={{ fontWeight: 600 }}>{s.email}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{s.locale}</td>
                  <td style={{ fontSize: 12.5 }}>{sourceLabel(s.source)}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                    {new Date(s.createdAt).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {confirm === s.id ? (
                      <span className="admin-confirm-delete">
                        <button className="admin-confirm-yes" onClick={() => remove(s.id)}>Да</button>
                        <button className="admin-confirm-no" onClick={() => setConfirm(null)}>Не</button>
                      </span>
                    ) : (
                      <button className="admin-row-btn admin-row-btn--delete" title="Изтрий (заявка за премахване на данни)" onClick={() => setConfirm(s.id)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
