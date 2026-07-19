'use client';
import { useState } from 'react';

type ReviewItem = {
  id: number;
  name: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: Date | string;
  product: { id: number; name: string; slug: string };
};

const STARS = [1, 2, 3, 4, 5];

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {STARS.map(s => (s <= rating ? '★' : '☆')).join('')}
    </span>
  );
}

export default function ReviewsManager({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');

  const filtered = reviews.filter(r => {
    if (filterVerified === 'verified') return r.verified;
    if (filterVerified === 'unverified') return !r.verified;
    return true;
  });

  async function toggleVerified(r: ReviewItem) {
    setTogglingId(r.id);
    const res = await fetch(`/api/admin/reviews/${r.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: !r.verified }),
    });
    if (res.ok) {
      setReviews(prev => prev.map(x => x.id === r.id ? { ...x, verified: !r.verified } : x));
    }
    setTogglingId(null);
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingId(null);
    setConfirmDelete(null);
  }

  const verifiedCount = reviews.filter(r => r.verified).length;
  const unverifiedCount = reviews.filter(r => !r.verified).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'unverified', 'verified'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilterVerified(f)}
            className={`admin-filter-btn${filterVerified === f ? ' active' : ''}`}
          >
            {f === 'all' && `Всички (${reviews.length})`}
            {f === 'verified' && `Одобрени (${verifiedCount})`}
            {f === 'unverified' && `Чакащи (${unverifiedCount})`}
          </button>
        ))}
      </div>

      {unverifiedCount > 0 && filterVerified !== 'verified' && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#713f12' }}>
          <strong>{unverifiedCount}</strong> рецензии чакат одобрение
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div className="admin-empty">Няма рецензии</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Продукт</th>
                  <th>Автор</th>
                  <th style={{ width: 90 }}>Оценка</th>
                  <th>Текст</th>
                  <th style={{ width: 80 }}>Дата</th>
                  <th style={{ width: 90 }}>Статус</th>
                  <th style={{ width: 70 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} style={{ opacity: togglingId === r.id || deletingId === r.id ? 0.5 : 1 }}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{r.product.name}</span>
                    </td>
                    <td style={{ fontSize: 13 }}>{r.name}</td>
                    <td><StarRating rating={r.rating} /></td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 300 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {r.text}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      {new Date(r.createdAt).toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleVerified(r)}
                        disabled={togglingId === r.id}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                          background: r.verified ? '#dcfce7' : '#fef9c3',
                          color: r.verified ? '#15803d' : '#713f12',
                        }}
                      >
                        {r.verified ? '✓ Одобрена' : '⏳ Чакаща'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {confirmDelete === r.id ? (
                        <span className="admin-confirm-delete">
                          <button className="admin-confirm-yes" disabled={deletingId === r.id} onClick={() => handleDelete(r.id)}>Да</button>
                          <button className="admin-confirm-no" onClick={() => setConfirmDelete(null)}>Не</button>
                        </span>
                      ) : (
                        <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" onClick={() => setConfirmDelete(r.id)}>
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
