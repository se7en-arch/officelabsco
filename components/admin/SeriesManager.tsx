'use client';
import { useState } from 'react';

type SeriesItem = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  color: string;
  image: string | null;
  _count: { products: number };
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-').trim();
}

const COLORS = ['#1C1C1C', '#374151', '#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#db2777'];

export default function SeriesManager({ initialSeries }: { initialSeries: SeriesItem[] }) {
  const [series, setSeries] = useState(initialSeries);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<SeriesItem>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState({ name: '', slug: '', tagline: '', description: '', color: '#1C1C1C' });
  const [creating, setCreating] = useState(false);

  function startEdit(s: SeriesItem) {
    setEditingId(s.id);
    setEditData({ name: s.name, slug: s.slug, tagline: s.tagline, description: s.description, color: s.color });
    setError('');
  }

  async function saveEdit(id: number) {
    setSavingId(id);
    const res = await fetch(`/api/admin/series/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setSeries(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      setEditingId(null);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Грешка');
    }
    setSavingId(null);
  }

  async function handleDelete(id: number) {
    setSavingId(id);
    const res = await fetch(`/api/admin/series/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSeries(prev => prev.filter(s => s.id !== id));
      setDeletingId(null);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Грешка');
    }
    setSavingId(null);
  }

  async function handleCreate() {
    if (!newData.name.trim()) return;
    setCreating(true);
    const res = await fetch('/api/admin/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
    if (res.ok) {
      const created = await res.json();
      setSeries(prev => [...prev, { ...created, _count: { products: 0 } }]);
      setNewData({ name: '', slug: '', tagline: '', description: '', color: '#1C1C1C' });
      setShowNew(false);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Грешка');
    }
    setCreating(false);
  }

  return (
    <div>
      {error && <p className="admin-error" style={{ marginBottom: 16 }}>{error}</p>}

      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header">
          <h2>Серии</h2>
          <button className="admin-action-btn" onClick={() => { setShowNew(!showNew); setError(''); }}>
            {showNew ? 'Отказ' : '+ Нова серия'}
          </button>
        </div>

        {showNew && (
          <div className="admin-card__body" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Наименование *</label>
                <input className="admin-form-input" value={newData.name}
                  onChange={e => setNewData(d => ({ ...d, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="напр. Astra" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Slug *</label>
                <input className="admin-form-input" value={newData.slug}
                  onChange={e => setNewData(d => ({ ...d, slug: e.target.value }))} placeholder="astra" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Цвят</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {COLORS.map(c => (
                    <button key={c} type="button"
                      style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: newData.color === c ? '3px solid var(--brand)' : '2px solid transparent', outline: newData.color === c ? '2px solid white' : 'none', cursor: 'pointer' }}
                      onClick={() => setNewData(d => ({ ...d, color: c }))} />
                  ))}
                </div>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Tagline</label>
                <input className="admin-form-input" value={newData.tagline}
                  onChange={e => setNewData(d => ({ ...d, tagline: e.target.value }))} placeholder="Кратко мото" />
              </div>
              <div className="admin-form-group admin-form-group--full">
                <label className="admin-form-label">Описание</label>
                <input className="admin-form-input" value={newData.description}
                  onChange={e => setNewData(d => ({ ...d, description: e.target.value }))} placeholder="Описание на серията" />
              </div>
            </div>
            <button className="admin-action-btn" onClick={handleCreate} disabled={creating} style={{ marginTop: 8, padding: '9px 20px' }}>
              {creating ? 'Създаване...' : 'Създай серия'}
            </button>
          </div>
        )}

        <div className="admin-card__body" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Наименование</th>
                <th>Slug</th>
                <th>Tagline</th>
                <th>Продукти</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {series.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: editingId === s.id ? (editData.color ?? s.color) : s.color }} />
                  </td>
                  {editingId === s.id ? (
                    <>
                      <td>
                        <input className="admin-table-input" value={editData.name ?? ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ width: '100%' }} />
                      </td>
                      <td>
                        <input className="admin-table-input" value={editData.slug ?? ''} onChange={e => setEditData(d => ({ ...d, slug: e.target.value }))} style={{ width: '100%' }} />
                      </td>
                      <td>
                        <input className="admin-table-input" value={editData.tagline ?? ''} onChange={e => setEditData(d => ({ ...d, tagline: e.target.value }))} style={{ width: '100%' }} />
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{s._count.products}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="admin-row-btn" title="Запази" disabled={savingId === s.id} onClick={() => saveEdit(s.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button className="admin-row-btn" title="Отказ" onClick={() => setEditingId(null)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{s.slug}</td>
                      <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{s.tagline}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{s._count.products}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="admin-row-btn" title="Редактирай" onClick={() => startEdit(s)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {deletingId === s.id ? (
                          <span className="admin-confirm-delete">
                            <span className="admin-confirm-text">Изтрий?</span>
                            <button className="admin-confirm-yes" disabled={savingId === s.id} onClick={() => handleDelete(s.id)}>Да</button>
                            <button className="admin-confirm-no" onClick={() => setDeletingId(null)}>Не</button>
                          </span>
                        ) : (
                          <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" disabled={s._count.products > 0} onClick={() => setDeletingId(s.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
