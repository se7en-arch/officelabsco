'use client';
import { useState } from 'react';

type Promo = { id: number; code: string; discount: number; active: boolean; createdAt: string | Date };

export default function PromoManager({ initialPromos }: { initialPromos: Promo[] }) {
  const [promos, setPromos] = useState(initialPromos);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function handleCreate() {
    const disc = parseInt(newDiscount);
    if (!newCode.trim() || !disc || disc < 1 || disc > 100) {
      setError('Въведи код и отстъпка (1-100%)');
      return;
    }
    setCreating(true);
    setError('');
    const res = await fetch('/api/admin/promos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newCode.trim().toUpperCase(), discount: disc }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Грешка'); setCreating(false); return; }
    setPromos(prev => [data, ...prev]);
    setNewCode('');
    setNewDiscount('');
    setCreating(false);
  }

  async function toggleActive(p: Promo) {
    setTogglingId(p.id);
    const res = await fetch(`/api/admin/promos/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) setPromos(prev => prev.map(x => x.id === p.id ? { ...x, active: !p.active } : x));
    setTogglingId(null);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/promos/${id}`, { method: 'DELETE' });
    if (res.ok) setPromos(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  }

  return (
    <div>
      {/* Add new */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Нов промо код</h2></div>
        <div className="admin-card__body">
          {error && <p className="admin-error" style={{ marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Код</label>
              <input
                className="admin-form-input"
                placeholder="напр. SUMMER20"
                value={newCode}
                onChange={e => { setNewCode(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{ textTransform: 'uppercase', width: 180 }}
              />
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Отстъпка %</label>
              <input
                className="admin-form-input"
                type="number"
                min={1}
                max={100}
                placeholder="10"
                value={newDiscount}
                onChange={e => { setNewDiscount(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                style={{ width: 100 }}
              />
            </div>
            <button
              className="admin-action-btn"
              onClick={handleCreate}
              disabled={creating}
              style={{ padding: '9px 20px' }}
            >
              {creating ? 'Създаване...' : '+ Добави'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          {promos.length === 0 ? (
            <div className="admin-empty">Няма промо кодове</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Код</th>
                  <th style={{ width: 100 }}>Отстъпка</th>
                  <th style={{ width: 100 }}>Статус</th>
                  <th style={{ width: 100 }}>Добавен</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {promos.map(p => (
                  <tr key={p.id} style={{ opacity: togglingId === p.id || deletingId === p.id ? 0.5 : 1 }}>
                    <td>
                      <code style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, background: 'var(--admin-bg)', padding: '2px 8px', borderRadius: 4 }}>
                        {p.code}
                      </code>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 15, color: '#16a34a' }}>−{p.discount}%</td>
                    <td>
                      <button
                        onClick={() => toggleActive(p)}
                        disabled={togglingId === p.id}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                          background: p.active ? '#dcfce7' : '#f3f4f6',
                          color: p.active ? '#15803d' : '#6b7280',
                        }}
                      >
                        {p.active ? '✓ Активен' : '✗ Неактивен'}
                      </button>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString('bg-BG')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {confirmDelete === p.id ? (
                        <span className="admin-confirm-delete">
                          <button className="admin-confirm-yes" disabled={deletingId === p.id} onClick={() => handleDelete(p.id)}>Да</button>
                          <button className="admin-confirm-no" onClick={() => setConfirmDelete(null)}>Не</button>
                        </span>
                      ) : (
                        <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" onClick={() => setConfirmDelete(p.id)}>
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
    </div>
  );
}
