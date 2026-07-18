'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

type MediaFile = { name: string; path: string; url: string };

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadFiles() {
    setLoading(true);
    const res = await fetch('/api/admin/media');
    if (res.ok) setFiles(await res.json());
    setLoading(false);
  }

  useEffect(() => { loadFiles(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) await loadFiles();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleDelete(name: string) {
    setDeletingName(name);
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setFiles(prev => prev.filter(f => f.name !== name));
    setDeletingName(null);
    setConfirmDelete(null);
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
    setCopied(path);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2>Снимки ({files.length})</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-action-btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? 'Качване...' : '+ Качи снимка'}
          </button>
          <button className="admin-action-btn admin-action-btn--secondary" onClick={loadFiles}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
      </div>
      <div className="admin-card__body">
        {loading ? (
          <div className="admin-empty">Зареждане...</div>
        ) : files.length === 0 ? (
          <div className="admin-empty">Няма качени снимки</div>
        ) : (
          <div className="admin-media-grid">
            {files.map(f => (
              <div key={f.name} className="admin-media-item">
                <div className="admin-media-item__img">
                  <Image src={f.url} alt={f.name} fill style={{ objectFit: 'contain', padding: 6 }} sizes="150px" />
                </div>
                <div className="admin-media-item__name">{f.name}</div>
                <div className="admin-media-item__actions">
                  <button
                    className="admin-row-btn"
                    title={copied === f.path ? 'Копирано!' : 'Копирай пътя'}
                    onClick={() => copyPath(f.path)}
                  >
                    {copied === f.path ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    )}
                  </button>
                  {confirmDelete === f.name ? (
                    <span className="admin-confirm-delete">
                      <button className="admin-confirm-yes" disabled={deletingName === f.name} onClick={() => handleDelete(f.name)}>Да</button>
                      <button className="admin-confirm-no" onClick={() => setConfirmDelete(null)}>Не</button>
                    </span>
                  ) : (
                    <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" onClick={() => setConfirmDelete(f.name)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
