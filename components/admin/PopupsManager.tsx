'use client';
import { useState } from 'react';
import type { PopupAdmin, PopupType, PopupPages, PopupFrequency } from '@/lib/popup-types';

type Promo = { code: string; discount: number };

const TYPE_LABEL: Record<PopupType, string> = { bundle: 'Bundle сет (серии)', promo: 'Кампания / промо' };
const PAGES_LABEL: Record<PopupPages, string> = { shop: 'Магазин', home: 'Начална страница', all: 'Всички страници' };
const FREQ_LABEL: Record<PopupFrequency, string> = {
  always: 'При всяко зареждане (тест)',
  days: 'Веднъж на X дни',
  session: 'Веднъж на сесия',
};

const EMPTY: Omit<PopupAdmin, 'id' | 'version'> = {
  name: '', type: 'promo', active: false, priority: 0, startsAt: null, endsAt: null,
  pages: 'shop', frequency: 'days', frequencyDays: 7, delaySeconds: 2,
  title: '', titleEn: '', text: '', textEn: '', image: '', ctaLabel: '', ctaLabelEn: '', ctaLink: '/shop',
  promoCode: '', accent: '#FF5733', showCountdown: false,
};

// ISO (UTC) <-> <input type="datetime-local"> (browser local time)
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function status(p: PopupAdmin): { label: string; bg: string; color: string } {
  const now = Date.now();
  if (!p.active) return { label: 'Изключен', bg: '#f3f4f6', color: '#6b7280' };
  if (p.startsAt && new Date(p.startsAt).getTime() > now) return { label: 'Планиран', bg: '#dbeafe', color: '#1e40af' };
  if (p.endsAt && new Date(p.endsAt).getTime() <= now) return { label: 'Приключил', bg: '#fef9c3', color: '#854d0e' };
  return { label: 'Активен', bg: '#dcfce7', color: '#15803d' };
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

export default function PopupsManager({ initialPopups, promos }: { initialPopups: PopupAdmin[]; promos: Promo[] }) {
  const [popups, setPopups] = useState(initialPopups);
  const [draft, setDraft] = useState<(Omit<PopupAdmin, 'id' | 'version'> & { id?: number }) | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const promoRunning = popups.some((p) => p.type === 'promo' && status(p).label === 'Активен');
  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  async function toggle(p: PopupAdmin) {
    setBusyId(p.id);
    const res = await fetch(`/api/admin/popups/${p.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    if (res.ok) {
      const row: PopupAdmin = await res.json();
      setPopups((prev) => prev.map((x) => (x.id === p.id ? row : x)));
    }
    setBusyId(null);
  }

  async function save() {
    if (!draft) return;
    setSaving(true); setError('');
    const { id, ...body } = draft;
    const res = await fetch(id ? `/api/admin/popups/${id}` : '/api/admin/popups', {
      method: id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? 'Грешка при запис'); return; }
    setPopups((prev) => (id ? prev.map((x) => (x.id === id ? data : x)) : [...prev, data]));
    setDraft(null);
  }

  async function remove(id: number) {
    setBusyId(id);
    const res = await fetch(`/api/admin/popups/${id}`, { method: 'DELETE' });
    if (res.ok) setPopups((prev) => prev.filter((p) => p.id !== id));
    setBusyId(null); setConfirmDelete(null);
  }

  async function upload(file: File) {
    setUploading(true); setError('');
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error ?? 'Качването не успя'); return; }
    set('image', data.path);
  }

  const isPromo = draft?.type === 'promo';
  const chosenPromo = promos.find((p) => p.code === draft?.promoCode);

  return (
    <div>
      {promoRunning && (
        <div className="admin-card" style={{ marginBottom: 16, borderLeft: '4px solid #f59e0b' }}>
          <div className="admin-card__body" style={{ fontSize: 13 }}>
            ⏸ Активна е кампания — Bundle попъпът е автоматично на пауза, докато тя тече.
          </div>
        </div>
      )}

      {!draft && (
        <div style={{ marginBottom: 16 }}>
          <button className="admin-action-btn" style={{ padding: '9px 20px' }} onClick={() => { setError(''); setDraft({ ...EMPTY }); }}>
            + Нов попъп
          </button>
        </div>
      )}

      {draft && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <div className="admin-card__header"><h2>{draft.id ? 'Редакция на попъп' : 'Нов попъп'}</h2></div>
          <div className="admin-card__body">
            {error && <p className="admin-error" style={{ marginBottom: 12 }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Име (само за теб)</label>
                <input className="admin-form-input" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="напр. Black Friday 2026" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Тип</label>
                <select className="admin-form-input" value={draft.type} onChange={(e) => set('type', e.target.value as PopupType)} disabled={!!draft.id}>
                  {(Object.keys(TYPE_LABEL) as PopupType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Къде се показва</label>
                <select className="admin-form-input" value={draft.pages} onChange={(e) => set('pages', e.target.value as PopupPages)}>
                  {(Object.keys(PAGES_LABEL) as PopupPages[]).map((k) => <option key={k} value={k}>{PAGES_LABEL[k]}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Честота</label>
                <select className="admin-form-input" value={draft.frequency} onChange={(e) => set('frequency', e.target.value as PopupFrequency)}>
                  {(Object.keys(FREQ_LABEL) as PopupFrequency[]).map((k) => <option key={k} value={k}>{FREQ_LABEL[k]}</option>)}
                </select>
              </div>
              {draft.frequency === 'days' && (
                <div className="admin-form-group">
                  <label className="admin-form-label">Не показвай пак (дни)</label>
                  <input className="admin-form-input" type="number" min={1} max={365} value={draft.frequencyDays} onChange={(e) => set('frequencyDays', parseInt(e.target.value) || 1)} />
                </div>
              )}
              <div className="admin-form-group">
                <label className="admin-form-label">Забавяне (секунди)</label>
                <input className="admin-form-input" type="number" min={0} max={60} value={draft.delaySeconds} onChange={(e) => set('delaySeconds', parseInt(e.target.value) || 0)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Приоритет (по-голям печели)</label>
                <input className="admin-form-input" type="number" min={-100} max={100} value={draft.priority} onChange={(e) => set('priority', parseInt(e.target.value) || 0)} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Започва (по избор)</label>
                <input className="admin-form-input" type="datetime-local" value={toLocalInput(draft.startsAt)} onChange={(e) => set('startsAt', fromLocalInput(e.target.value))} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Свършва (по избор)</label>
                <input className="admin-form-input" type="datetime-local" value={toLocalInput(draft.endsAt)} onChange={(e) => set('endsAt', fromLocalInput(e.target.value))} />
              </div>
            </div>

            {!isPromo && (
              <p style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 0' }}>
                Bundle попъпът показва комплектите на 4-те серии със -10% — съдържанието му е фиксирано, тук управляваш само кога и къде се показва.
              </p>
            )}

            {isPromo && (
              <>
                <hr style={{ border: 0, borderTop: '1px solid var(--admin-border, #e5e7eb)', margin: '18px 0' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Заглавие (БГ)</label>
                    <input className="admin-form-input" value={draft.title ?? ''} onChange={(e) => set('title', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Заглавие (EN)</label>
                    <input className="admin-form-input" value={draft.titleEn ?? ''} onChange={(e) => set('titleEn', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Текст (БГ)</label>
                    <textarea className="admin-form-input" rows={3} value={draft.text ?? ''} onChange={(e) => set('text', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Текст (EN)</label>
                    <textarea className="admin-form-input" rows={3} value={draft.textEn ?? ''} onChange={(e) => set('textEn', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Бутон (БГ)</label>
                    <input className="admin-form-input" value={draft.ctaLabel ?? ''} onChange={(e) => set('ctaLabel', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Бутон (EN)</label>
                    <input className="admin-form-input" value={draft.ctaLabelEn ?? ''} onChange={(e) => set('ctaLabelEn', e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Къде води бутонът</label>
                    <input className="admin-form-input" value={draft.ctaLink ?? ''} onChange={(e) => set('ctaLink', e.target.value)} placeholder="/shop" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Промо код (прилага се сам при клик)</label>
                    <select className="admin-form-input" value={draft.promoCode ?? ''} onChange={(e) => set('promoCode', e.target.value)}>
                      <option value="">— без код —</option>
                      {promos.map((p) => <option key={p.code} value={p.code}>{p.code} (−{p.discount}%)</option>)}
                    </select>
                    <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Кодовете се създават в Промо кодове.</span>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Цвят</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input type="color" value={draft.accent} onChange={(e) => set('accent', e.target.value)} style={{ width: 44, height: 38, border: 'none', background: 'none', cursor: 'pointer' }} />
                      <input className="admin-form-input" value={draft.accent} onChange={(e) => set('accent', e.target.value)} style={{ width: 110 }} />
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Снимка</label>
                    <input className="admin-form-input" value={draft.image ?? ''} onChange={(e) => set('image', e.target.value)} placeholder="https://… или /images/…" />
                    <label className="admin-row-btn" style={{ display: 'inline-block', marginTop: 6, cursor: 'pointer', padding: '5px 10px', width: 'auto' }}>
                      {uploading ? 'Качване…' : '⬆ Качи снимка'}
                      <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, margin: '4px 0 16px' }}>
                  <input type="checkbox" checked={draft.showCountdown} onChange={(e) => set('showCountdown', e.target.checked)} />
                  Покажи обратно броене до крайната дата {!draft.endsAt && <em style={{ color: '#b45309' }}>(задай „Свършва“, за да работи)</em>}
                </label>

                {/* Mini preview */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14, background: 'var(--admin-bg, #f9fafb)', borderRadius: 12 }}>
                  {draft.image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={draft.image} alt="" style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8 }} />}
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.1em', color: draft.accent }}>ОГРАНИЧЕНА ОФЕРТА</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{draft.title || 'Заглавие'}</div>
                    {chosenPromo && <span style={{ background: draft.accent, color: '#fff', fontWeight: 800, fontSize: 13, padding: '2px 10px', borderRadius: 8 }}>−{chosenPromo.discount}%</span>}
                  </div>
                  <span style={{ marginLeft: 'auto', background: draft.accent, color: '#fff', fontWeight: 700, fontSize: 13, padding: '9px 18px', borderRadius: 100 }}>
                    {draft.ctaLabel || 'Бутон'}
                  </span>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="admin-action-btn" onClick={save} disabled={saving} style={{ padding: '9px 22px' }}>{saving ? 'Запазване…' : 'Запази'}</button>
              <button className="admin-row-btn" onClick={() => { setDraft(null); setError(''); }} style={{ padding: '9px 18px', width: 'auto' }}>Отказ</button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
              Запазването на промени показва попъпа наново и на хората, които вече са го затворили.
            </p>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card__body" style={{ padding: 0 }}>
          {popups.length === 0 ? (
            <div className="admin-empty">Няма попъпи</div>
          ) : popups.map((p) => {
            const st = status(p);
            const when = [p.startsAt && `от ${fmtDate(p.startsAt)}`, p.endsAt && `до ${fmtDate(p.endsAt)}`].filter(Boolean).join(' ');
            return (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', flexWrap: 'wrap',
                borderBottom: '1px solid var(--admin-border, #eee)', opacity: busyId === p.id ? 0.5 : 1,
              }}>
                <button
                  onClick={() => toggle(p)} disabled={busyId === p.id} aria-label={p.active ? 'Изключи' : 'Включи'}
                  style={{ width: 46, height: 26, borderRadius: 100, border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, background: p.active ? '#16a34a' : '#d1d5db', transition: 'background .15s' }}
                >
                  <span style={{ position: 'absolute', top: 3, left: p.active ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
                </button>

                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 15 }}>{p.name}</strong>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: st.bg, color: st.color }}>{st.label}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{TYPE_LABEL[p.type]}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
                    {PAGES_LABEL[p.pages]} · {p.frequency === 'days' ? `веднъж на ${p.frequencyDays} дни` : FREQ_LABEL[p.frequency]}
                    {when && ` · ${when}`}
                    {p.promoCode && ` · код ${p.promoCode}`}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-row-btn" style={{ width: 'auto', padding: '6px 14px' }}
                    onClick={() => { setError(''); setDraft({ ...p, title: p.title ?? '', titleEn: p.titleEn ?? '', text: p.text ?? '', textEn: p.textEn ?? '', image: p.image ?? '', ctaLabel: p.ctaLabel ?? '', ctaLabelEn: p.ctaLabelEn ?? '', ctaLink: p.ctaLink ?? '', promoCode: p.promoCode ?? '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    Редактирай
                  </button>
                  {confirmDelete === p.id ? (
                    <span className="admin-confirm-delete">
                      <button className="admin-confirm-yes" onClick={() => remove(p.id)}>Да</button>
                      <button className="admin-confirm-no" onClick={() => setConfirmDelete(null)}>Не</button>
                    </span>
                  ) : (
                    <button className="admin-row-btn admin-row-btn--delete" title="Изтрий" onClick={() => setConfirmDelete(p.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
