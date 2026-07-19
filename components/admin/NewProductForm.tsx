'use client';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Series = { id: number; name: string };
type Category = { id: number; name: string };

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export default function NewProductForm({ series, categories }: { series: Series[]; categories: Category[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef(0);

  const [form, setForm] = useState({
    name: '', slug: '', sku: '', description: '',
    price: '', originalPrice: '', stock: '10',
    seriesId: String(series[0]?.id ?? ''),
    categoryId: String(categories[0]?.id ?? ''),
    badge: '', featured: false,
  });

  const [slugLocked, setSlugLocked] = useState(false);
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null, null, null]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  function handleNameChange(val: string) {
    set('name', val);
    if (!slugLocked) set('slug', slugify(val));
  }

  function openSlot(idx: number) {
    targetSlotRef.current = idx;
    if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click(); }
  }

  const handleImageSelect = useCallback(async (file: File, slotIdx: number) => {
    const preview = URL.createObjectURL(file);
    setPreviews(p => { const c = [...p]; c[slotIdx] = preview; return c; });
    setUploadingSlot(slotIdx);

    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    if (res.ok) {
      const { path } = await res.json();
      setSlots(s => {
        const isFirst = s.every(v => v === null);
        const c = [...s];
        c[slotIdx] = path;
        if (isFirst) setPrimaryIdx(slotIdx);
        return c;
      });
    } else {
      setPreviews(p => { const c = [...p]; c[slotIdx] = null; return c; });
    }
    setUploadingSlot(null);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleImageSelect(f, targetSlotRef.current);
  }

  function deleteSlot(idx: number) {
    setSlots(s => { const c = [...s]; c[idx] = null; return c; });
    setPreviews(p => { const c = [...p]; c[idx] = null; return c; });
    if (primaryIdx === idx) {
      const next = slots.findIndex((s, i) => i !== idx && s !== null);
      setPrimaryIdx(next >= 0 ? next : 0);
    }
  }

  function setPrimary(idx: number) {
    if (slots[idx]) setPrimaryIdx(idx);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validImages = slots.filter(Boolean) as string[];
    if (validImages.length === 0) { setError('Добави поне една снимка'); return; }

    const primaryImage = slots[primaryIdx] ?? validImages[0];

    setSaving(true);
    setError('');

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        image: primaryImage,
        images: JSON.stringify(validImages),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/adminpanel/products/${data.id}/edit`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Грешка при запазване');
      setSaving(false);
    }
  }

  const anyUploading = uploadingSlot !== null;

  return (
    <form className="admin-new-form" onSubmit={handleSubmit}>

      {/* ── Снимки ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Снимки</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-img-grid">
            {slots.map((path, idx) => {
              const preview = previews[idx];
              const isPrimary = primaryIdx === idx && path !== null;
              const isUploading = uploadingSlot === idx;

              return (
                <div
                  key={idx}
                  className={`admin-img-slot${path ? ' admin-img-slot--filled' : ''}${isPrimary ? ' admin-img-slot--primary' : ''}`}
                  onClick={() => !path && openSlot(idx)}
                  title={path ? (isPrimary ? 'Главна снимка' : 'Кликни за да направиш главна') : 'Добави снимка'}
                >
                  {isPrimary && (
                    <div className="admin-img-slot__badge">Главна</div>
                  )}

                  {preview ? (
                    <Image
                      src={preview}
                      alt={`Снимка ${idx + 1}`}
                      fill
                      style={{ objectFit: 'contain', padding: 8 }}
                      sizes="200px"
                    />
                  ) : (
                    <div className="admin-img-slot__placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Снимка {idx + 1}</span>
                    </div>
                  )}

                  {isUploading && (
                    <div className="admin-img-slot__overlay">
                      <span className="admin-saving-spinner" />
                    </div>
                  )}

                  {path && !isUploading && (
                    <div className="admin-img-slot__actions">
                      {!isPrimary && (
                        <button
                          type="button"
                          className="admin-img-action-btn"
                          onClick={e => { e.stopPropagation(); setPrimary(idx); }}
                        >
                          Главна
                        </button>
                      )}
                      <button
                        type="button"
                        className="admin-img-action-btn"
                        onClick={e => { e.stopPropagation(); openSlot(idx); }}
                      >
                        Смени
                      </button>
                      <button
                        type="button"
                        className="admin-img-action-btn admin-img-action-btn--delete"
                        onClick={e => { e.stopPropagation(); deleteSlot(idx); }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="admin-img-hint">Кликни върху снимка за да я направиш главна. Главната снимка се показва в магазина.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* ── Основна информация ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Основна информация</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Наименование *</label>
              <input className="admin-form-input" value={form.name}
                onChange={e => handleNameChange(e.target.value)} required placeholder="напр. Astra Бюро 120" />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label className="admin-form-label">
                Slug *
                {!slugLocked && <span className="admin-form-hint">— генерира се автоматично</span>}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="admin-form-input" value={form.slug}
                  onChange={e => { setSlugLocked(true); set('slug', e.target.value); }}
                  required placeholder="astra-byuro-120" />
                {slugLocked && (
                  <button type="button" className="admin-form-icon-btn" title="Генерирай от наименованието"
                    onClick={() => { set('slug', slugify(form.name)); setSlugLocked(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                  </button>
                )}
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">SKU</label>
              <input className="admin-form-input" value={form.sku}
                onChange={e => set('sku', e.target.value)} placeholder="101001" />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Описание *</label>
              <textarea className="admin-form-textarea" value={form.description}
                onChange={e => set('description', e.target.value)}
                required rows={3} placeholder="Кратко описание на продукта..." />
            </div>
          </div>
        </div>
      </div>

      {/* ── Цена и наличност ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Цена и наличност</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Цена (€) *</label>
              <input className="admin-form-input" type="number" value={form.price}
                onChange={e => set('price', e.target.value)} required min={0} step={0.01} placeholder="1290" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Стара цена (€)</label>
              <input className="admin-form-input" type="number" value={form.originalPrice}
                onChange={e => set('originalPrice', e.target.value)} min={0} step={0.01} placeholder="—" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Наличност *</label>
              <input className="admin-form-input" type="number" value={form.stock}
                onChange={e => set('stock', e.target.value)} required min={0} placeholder="10" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Категоризация ── */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Категоризация</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Серия *</label>
              <select className="admin-form-select" value={form.seriesId}
                onChange={e => set('seriesId', e.target.value)} required>
                {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Категория *</label>
              <select className="admin-form-select" value={form.categoryId}
                onChange={e => set('categoryId', e.target.value)} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Статус / Badge</label>
              <select className="admin-form-select" value={form.badge}
                onChange={e => set('badge', e.target.value)}>
                <option value="">— Без статус</option>
                <option value="НОВ">НОВ</option>
                <option value="SALE">SALE</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row" style={{ marginTop: 4 }}>
            <label className="admin-form-checkbox">
              <input type="checkbox" checked={form.featured}
                onChange={e => set('featured', e.target.checked)} />
              <span>Препоръчан продукт</span>
            </label>
          </div>
        </div>
      </div>

      {error && <p className="admin-error" style={{ marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="admin-action-btn" disabled={saving || anyUploading}
          style={{ padding: '11px 28px', fontSize: 14 }}>
          {saving ? 'Запазване...' : 'Запази продукта'}
        </button>
        <button type="button" className="admin-cancel-btn"
          onClick={() => router.push('/adminpanel/products')}>
          Откажи
        </button>
      </div>
    </form>
  );
}
