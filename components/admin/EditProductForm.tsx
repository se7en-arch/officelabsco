'use client';
import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Series = { id: number; name: string };
type Category = { id: number; name: string };

type ProductData = {
  id: number;
  name: string;
  nameEn: string | null;
  slug: string;
  sku: string;
  description: string;
  descriptionEn: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  badge: string;
  featured: boolean;
  archived: boolean;
  image: string;
  images: string;
  seriesId: number;
  categoryId: number;
  dimensions: string | null;
  weight: string | null;
  colors: string | null;
  colorsEn: string | null;
  material: string | null;
  materialEn: string | null;
};

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-').trim();
}

export default function EditProductForm({
  product,
  series,
  categories,
}: {
  product: ProductData;
  series: Series[];
  categories: Category[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef(0);

  const parsedImages: string[] = (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })();
  const initSlots: (string | null)[] = [null, null, null, null, null];
  parsedImages.forEach((img, i) => { if (i < 5) initSlots[i] = img; });
  const initPrimary = Math.max(0, initSlots.indexOf(product.image));

  const [form, setForm] = useState({
    name: product.name,
    nameEn: product.nameEn ?? '',
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    descriptionEn: product.descriptionEn ?? '',
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    stock: String(product.stock),
    seriesId: String(product.seriesId),
    categoryId: String(product.categoryId),
    badge: product.badge,
    featured: product.featured,
    archived: product.archived,
    dimensions: product.dimensions ?? '',
    weight: product.weight ?? '',
    colors: product.colors ?? '',
    colorsEn: product.colorsEn ?? '',
    material: product.material ?? '',
    materialEn: product.materialEn ?? '',
  });

  const [slugLocked, setSlugLocked] = useState(true);
  const [slots, setSlots] = useState<(string | null)[]>(initSlots);
  const [previews, setPreviews] = useState<(string | null)[]>(initSlots);
  const [primaryIdx, setPrimaryIdx] = useState(initPrimary);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }));

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
        const c = [...s];
        c[slotIdx] = path;
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validImages = slots.filter(Boolean) as string[];
    if (validImages.length === 0) { setError('Добави поне една снимка'); return; }
    const primaryImage = slots[primaryIdx] ?? validImages[0];

    setSaving(true);
    setError('');

    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        nameEn: form.nameEn || null,
        descriptionEn: form.descriptionEn || null,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        stock: parseInt(form.stock),
        seriesId: parseInt(form.seriesId),
        categoryId: parseInt(form.categoryId),
        badge: form.badge || null,
        image: primaryImage,
        images: JSON.stringify(validImages),
        dimensions: form.dimensions || null,
        weight: form.weight || null,
        colors: form.colors || null,
        colorsEn: form.colorsEn || null,
        material: form.material || null,
        materialEn: form.materialEn || null,
      }),
    });

    if (res.ok) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2500);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Грешка при запазване');
    }
    setSaving(false);
  }

  return (
    <form className="admin-new-form" onSubmit={handleSubmit}>

      {/* Снимки */}
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
                >
                  {isPrimary && <div className="admin-img-slot__badge">Главна</div>}
                  {preview ? (
                    <Image src={preview} alt="" fill style={{ objectFit: 'contain', padding: 8 }} sizes="200px" />
                  ) : (
                    <div className="admin-img-slot__placeholder">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span>Снимка {idx + 1}</span>
                    </div>
                  )}
                  {isUploading && <div className="admin-img-slot__overlay"><span className="admin-saving-spinner" /></div>}
                  {path && !isUploading && (
                    <div className="admin-img-slot__actions">
                      {!isPrimary && (
                        <button type="button" className="admin-img-action-btn" onClick={e => { e.stopPropagation(); setPrimaryIdx(idx); }}>Главна</button>
                      )}
                      <button type="button" className="admin-img-action-btn" onClick={e => { e.stopPropagation(); openSlot(idx); }}>Смени</button>
                      <button type="button" className="admin-img-action-btn admin-img-action-btn--delete" onClick={e => { e.stopPropagation(); deleteSlot(idx); }}>✕</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      {/* Основна информация */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Основна информация</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Наименование *</label>
              <input className="admin-form-input" value={form.name} onChange={e => handleNameChange(e.target.value)} required />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group" style={{ flex: 2 }}>
              <label className="admin-form-label">
                Slug *{!slugLocked && <span className="admin-form-hint"> — генерира се автоматично</span>}
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="admin-form-input" value={form.slug}
                  onChange={e => { setSlugLocked(true); set('slug', e.target.value); }} required />
                <button type="button" className="admin-form-icon-btn" title="Генерирай"
                  onClick={() => { set('slug', slugify(form.name)); setSlugLocked(false); }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                </button>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">SKU</label>
              <input className="admin-form-input" value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Описание * (БГ)</label>
              <textarea className="admin-form-textarea" value={form.description} onChange={e => set('description', e.target.value)} required rows={3} />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Наименование (EN)</label>
              <input className="admin-form-input" value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="Product name in English" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Описание (EN)</label>
              <textarea className="admin-form-textarea" value={form.descriptionEn} onChange={e => set('descriptionEn', e.target.value)} rows={3} placeholder="Product description in English" />
            </div>
          </div>
        </div>
      </div>

      {/* Цена и наличност */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Цена и наличност</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Цена (€) *</label>
              <input className="admin-form-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required min={0} step={0.01} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Стара цена (€)</label>
              <input className="admin-form-input" type="number" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} min={0} step={0.01} placeholder="—" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Наличност *</label>
              <input className="admin-form-input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} required min={0} />
            </div>
          </div>
        </div>
      </div>

      {/* Категоризация */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Категоризация</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Серия *</label>
              <select className="admin-form-select" value={form.seriesId} onChange={e => set('seriesId', e.target.value)} required>
                {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Категория *</label>
              <select className="admin-form-select" value={form.categoryId} onChange={e => set('categoryId', e.target.value)} required>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Badge</label>
              <select className="admin-form-select" value={form.badge} onChange={e => set('badge', e.target.value)}>
                <option value="">— Без</option>
                <option value="НОВ">НОВ</option>
                <option value="SALE">SALE</option>
              </select>
            </div>
          </div>
          <div className="admin-form-row" style={{ marginTop: 4, gap: 24 }}>
            <label className="admin-form-checkbox">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
              <span>Препоръчан продукт</span>
            </label>
            <label className="admin-form-checkbox">
              <input type="checkbox" checked={form.archived} onChange={e => set('archived', e.target.checked)} />
              <span>Архивиран (скрит от магазина)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Характеристики (таб Описание) */}
      <div className="admin-card" style={{ marginBottom: 20 }}>
        <div className="admin-card__header"><h2>Характеристики <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-muted)' }}>(таб Описание)</span></h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Размери</label>
              <input className="admin-form-input" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="напр. 120 × 60 × 75 cm" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Тегло</label>
              <input className="admin-form-input" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="напр. 18 kg" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Цветове (БГ)</label>
              <input className="admin-form-input" value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="напр. Бяло, Черно, Орех" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Цветове (EN)</label>
              <input className="admin-form-input" value={form.colorsEn} onChange={e => set('colorsEn', e.target.value)} placeholder="e.g. White, Black, Walnut" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Материал (БГ)</label>
              <input className="admin-form-input" value={form.material} onChange={e => set('material', e.target.value)} placeholder="напр. МДФ, Стомана" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Материал (EN)</label>
              <input className="admin-form-input" value={form.materialEn} onChange={e => set('materialEn', e.target.value)} placeholder="e.g. MDF, Steel" />
            </div>
          </div>
        </div>
      </div>

      {error && <p className="admin-error" style={{ marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button type="submit" className="admin-action-btn" disabled={saving || uploadingSlot !== null} style={{ padding: '11px 28px', fontSize: 14 }}>
          {saving ? 'Запазване...' : 'Запази промените'}
        </button>
        <button type="button" className="admin-cancel-btn" onClick={() => router.push('/adminpanel/products')}>
          Откажи
        </button>
        {saved && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontSize: 14, fontWeight: 600 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Запазено
          </span>
        )}
      </div>
    </form>
  );
}
