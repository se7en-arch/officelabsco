'use client';
import { useState } from 'react';

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-').trim();
}

export default function CategoriesManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ name: string; slug: string }>({ name: '', slug: '' });
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newData, setNewData] = useState({ name: '', slug: '' });
  const [creating, setCreating] = useState(false);

  function startEdit(c: CategoryItem) {
    setEditingId(c.id);
    setEditData({ name: c.name, slug: c.slug });
    setError('');
  }

  async function saveEdit(id: number) {
    setSavingId(id);
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const updated = await res.json();
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Грешка');
    }
    setSavingId(null);
  }

  async function handleDelete(id: number) {
    setSavingId(id);
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCategories(prev => prev.filter(c => c.id !== id));
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
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    });
    if (res.ok) {
      const created = await res.json();
      setCategories(prev => [...prev, { ...created, _count: { products: 0 } }]);
      setNewData({ name: '', slug: '' });
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

      <div className="admin-card">
        <div className="admin-card__header">
          <h2>Категории</h2>
          <button className="admin-action-btn" onClick={() => { setShowNew(!showNew); setError(''); }}>
            {showNew ? 'Отказ' : '+ Нова категория'}
          </button>
        </div>

        {showNew && (
          <div className="admin-card__body" style={{ borderBottom: '1px solid var(--line)' }}>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Наименование *</label>
                <input className="admin-form-input" value={newData.name}
                  onChange={e => setNewData(d => ({ ...d, name: e.target.value, slug: slugify(e.target.value) }))} placeholder="напр. Бюра" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Slug *</label>
                <input className="admin-form-input" value={newData.slug}
                  onChange={e => setNewData(d => ({ ...d, slug: e.target.value }))} placeholder="byura" />
              </div>
            </div>
            <button className="admin-action-btn" onClick={handleCreate} disabled={creating} style={{ marginTop: 8, padding: '9px 20px' }}>
              {creating ? 'Създаване...' : 'Създай категория'}
            </button>
          </div>
        )}

        <div className="admin-card__body" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Slug</th>
                <th>Продукти</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  {editingId === c.id ? (
                    <>
                      <td><input className="admin-table-input" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ width: '100%' }} /></td>
                      <td><input className="admin-table-input" value={editData.slug} onChange={e => setEditData(d => ({ ...d, slug: e.target.value }))} style={{ width: '100%' }} /></td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c._count.products}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="admin-row-btn" disabled={savingId === c.id} onClick={() => saveEdit(c.id)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        <button className="admin-row-btn" onClick={() => setEditingId(null)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c.slug}</td>
                      <td style={{ color: 'var(--muted)', fontSize: 13 }}>{c._count.products}</td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button className="admin-row-btn" title="Редактирай" onClick={() => startEdit(c)}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {deletingId === c.id ? (
                          <span className="admin-confirm-delete">
                            <span className="admin-confirm-text">Изтрий?</span>
                            <button className="admin-confirm-yes" disabled={savingId === c.id} onClick={() => handleDelete(c.id)}>Да</button>
                            <button className="admin-confirm-no" onClick={() => setDeletingId(null)}>Не</button>
                          </span>
                        ) : (
                          <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" disabled={c._count.products > 0} onClick={() => setDeletingId(c.id)}>
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
