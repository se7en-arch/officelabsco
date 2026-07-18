'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';

type SeriesItem = { id: number; name: string };
type CategoryItem = { id: number; name: string };

type Product = {
  id: number;
  name: string;
  slug: string;
  sku: string | null;
  image: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  badge: string | null;
  featured: boolean;
  archived: boolean;
  series: SeriesItem;
  category: CategoryItem;
};

type SortCol = 'name' | 'series' | 'category' | 'price' | 'stock';

const BADGE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'НОВ', label: 'НОВ' },
  { value: 'SALE', label: 'SALE' },
];

function sortProducts(list: Product[], col: SortCol, dir: 'asc' | 'desc') {
  return [...list].sort((a, b) => {
    let cmp = 0;
    switch (col) {
      case 'name':     cmp = a.name.localeCompare(b.name, 'bg'); break;
      case 'series':   cmp = a.series.name.localeCompare(b.series.name, 'bg'); break;
      case 'category': cmp = a.category.name.localeCompare(b.category.name, 'bg'); break;
      case 'price':    cmp = a.price - b.price; break;
      case 'stock':    cmp = a.stock - b.stock; break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return (
    <svg className="admin-sort-icon" width="10" height="10" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 1v12M2 4l3-3 3 3M2 10l3 3 3-3" />
    </svg>
  );
  return (
    <svg className="admin-sort-icon admin-sort-icon--active" width="10" height="10" viewBox="0 0 10 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {dir === 'asc' ? <path d="M5 12V2M2 5l3-3 3 3" /> : <path d="M5 2v10M2 9l3 3 3-3" />}
    </svg>
  );
}

function SortTh({ col, label, sortCol, sortDir, onSort }: {
  col: SortCol; label: string; sortCol: SortCol; sortDir: 'asc' | 'desc'; onSort: (c: SortCol) => void;
}) {
  return (
    <th className={`admin-th-sort${sortCol === col ? ' admin-th-sort--active' : ''}`} onClick={() => onSort(col)}>
      {label}<SortIcon active={sortCol === col} dir={sortDir} />
    </th>
  );
}

export default function ProductsTable({
  products: initial,
  series,
  categories,
}: {
  products: Product[];
  series: SeriesItem[];
  categories: CategoryItem[];
}) {
  const [products, setProducts] = useState(initial);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
  const [sortCol, setSortCol] = useState<SortCol>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBadge, setFilterBadge] = useState('');

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku?.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filterSeries && String(p.series.id) !== filterSeries) return false;
      if (filterCategory && String(p.category.id) !== filterCategory) return false;
      if (filterStatus === 'active' && p.archived) return false;
      if (filterStatus === 'archived' && !p.archived) return false;
      if (filterBadge === 'none' && p.badge) return false;
      if (filterBadge && filterBadge !== 'none' && p.badge !== filterBadge) return false;
      return true;
    });
  }, [products, search, filterSeries, filterCategory, filterStatus, filterBadge]);

  const sorted = useMemo(() => sortProducts(filtered, sortCol, sortDir), [filtered, sortCol, sortDir]);

  function handleSort(col: SortCol) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  }

  function toggleSelect(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(p => p.id)));
  }

  const save = useCallback(async (id: number, patch: Record<string, unknown>) => {
    setSavingId(id);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const updated: Product = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      setSavedId(id);
      setTimeout(() => setSavedId(s => s === id ? null : s), 1500);
    }
    setSavingId(null);
  }, []);

  async function handleDelete(id: number) {
    setSavingId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) setProducts(prev => prev.filter(p => p.id !== id));
    setSavingId(null);
    setConfirmDeleteId(null);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
  }

  async function handleDuplicate(p: Product) {
    setDuplicatingId(p.id);
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${p.name} Копие`,
        slug: `${p.slug}-kopie-${Date.now()}`,
        sku: null,
        description: '',
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        badge: p.badge,
        featured: false,
        archived: false,
        image: p.image,
        images: '[]',
        seriesId: p.series.id,
        categoryId: p.category.id,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setProducts(prev => [...prev, { ...created, series: p.series, category: p.category }]);
    }
    setDuplicatingId(null);
  }

  async function bulkArchive(archived: boolean) {
    setBulkSaving(true);
    await Promise.all([...selected].map(id =>
      fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived }),
      })
    ));
    setProducts(prev => prev.map(p => selected.has(p.id) ? { ...p, archived } : p));
    setSelected(new Set());
    setBulkSaving(false);
  }

  async function bulkDelete() {
    setBulkSaving(true);
    await Promise.all([...selected].map(id =>
      fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    ));
    setProducts(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    setBulkSaving(false);
  }

  const hasFilters = search || filterSeries || filterCategory || filterStatus !== 'all' || filterBadge;

  return (
    <div>
      {/* Filter bar */}
      <div className="admin-filter-bar">
        <input
          className="admin-filter-search"
          placeholder="Търси по наименование или SKU..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-filter-select" value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
          <option value="">Всички серии</option>
          {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="admin-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Всички категории</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="admin-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Всички статуси</option>
          <option value="active">Активни</option>
          <option value="archived">Архивирани</option>
        </select>
        <select className="admin-filter-select" value={filterBadge} onChange={e => setFilterBadge(e.target.value)}>
          <option value="">Всички badges</option>
          <option value="НОВ">НОВ</option>
          <option value="SALE">SALE</option>
          <option value="none">Без badge</option>
        </select>
        {hasFilters && (
          <button className="admin-filter-clear" onClick={() => { setSearch(''); setFilterSeries(''); setFilterCategory(''); setFilterStatus('all'); setFilterBadge(''); }}>
            Изчисти
          </button>
        )}
        <span className="admin-filter-count">{sorted.length} продукта</span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-bar__count">Избрани: {selected.size}</span>
          <button className="admin-bulk-btn" disabled={bulkSaving} onClick={() => bulkArchive(true)}>Архивирай</button>
          <button className="admin-bulk-btn" disabled={bulkSaving} onClick={() => bulkArchive(false)}>Разархивирай</button>
          {confirmBulkDelete ? (
            <>
              <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>Изтрий {selected.size}?</span>
              <button className="admin-bulk-btn admin-bulk-btn--danger" disabled={bulkSaving} onClick={bulkDelete}>Да, изтрий</button>
              <button className="admin-bulk-btn" onClick={() => setConfirmBulkDelete(false)}>Не</button>
            </>
          ) : (
            <button className="admin-bulk-btn admin-bulk-btn--danger" onClick={() => setConfirmBulkDelete(true)}>Изтрий</button>
          )}
          <button className="admin-bulk-btn" onClick={() => setSelected(new Set())}>Откажи</button>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36, padding: '0 8px' }}>
                <input type="checkbox"
                  checked={sorted.length > 0 && selected.size === sorted.length}
                  onChange={toggleSelectAll}
                  style={{ cursor: 'pointer' }} />
              </th>
              <th style={{ width: 52 }}></th>
              <SortTh col="name"     label="Продукт"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="series"   label="Серия"     sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="category" label="Категория" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <SortTh col="price"    label="Цена"      sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <th>Стара цена</th>
              <SortTh col="stock"    label="Наличност" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <th>Статус</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                  Няма продукти по избраните критерии
                </td>
              </tr>
            )}
            {sorted.map((p) => (
              <tr key={p.id} className={p.archived ? 'admin-table__row--archived' : ''}>
                <td style={{ width: 36, padding: '0 8px' }}>
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer' }} />
                </td>
                <td style={{ width: 52 }}>
                  <Image src={p.image} alt={p.name} width={36} height={36} className="admin-table__img" />
                </td>

                <td>
                  <div className="admin-product-name">
                    {p.name}
                    {p.archived && <span className="admin-archived-badge">Архивиран</span>}
                  </div>
                  {p.sku && <div className="admin-product-sku">SKU: {p.sku}</div>}
                </td>

                <td>
                  <select className="admin-table-select" value={p.series.id}
                    disabled={savingId === p.id || p.archived}
                    onChange={e => save(p.id, { seriesId: parseInt(e.target.value) })}>
                    {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </td>

                <td>
                  <select className="admin-table-select" value={p.category.id}
                    disabled={savingId === p.id || p.archived}
                    onChange={e => save(p.id, { categoryId: parseInt(e.target.value) })}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>

                <td>
                  <input type="number" className="admin-table-input admin-table-input--price"
                    defaultValue={p.price} disabled={savingId === p.id || p.archived}
                    onBlur={e => { const val = parseFloat(e.target.value); if (!isNaN(val) && val !== p.price) save(p.id, { price: val }); }}
                    min={0} step={0.01} />
                </td>

                <td>
                  <input type="number" className="admin-table-input admin-table-input--price"
                    defaultValue={p.originalPrice ?? ''} placeholder="—"
                    disabled={savingId === p.id || p.archived}
                    onBlur={e => { const raw = e.target.value.trim(); const val = raw === '' ? null : parseFloat(raw); if (val !== p.originalPrice) save(p.id, { originalPrice: val }); }}
                    min={0} step={0.01} />
                </td>

                <td>
                  <input type="number" className="admin-table-input admin-table-input--stock"
                    defaultValue={p.stock} disabled={savingId === p.id || p.archived}
                    onBlur={e => { const val = parseInt(e.target.value); if (!isNaN(val) && val !== p.stock) save(p.id, { stock: val }); }}
                    min={0} />
                </td>

                <td>
                  <select className="admin-table-select" value={p.badge ?? ''}
                    disabled={savingId === p.id || p.archived}
                    onChange={e => save(p.id, { badge: e.target.value || null })}>
                    {BADGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>

                <td style={{ width: 160, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {savingId === p.id && <span className="admin-saving-spinner" style={{ marginRight: 6 }} />}
                  {savedId === p.id && savingId !== p.id && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{ verticalAlign: 'middle', marginRight: 6 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}

                  {/* Edit */}
                  <Link href={`/adminpanel/products/${p.id}/edit`} className="admin-row-btn admin-row-btn--view" title="Редактирай">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </Link>

                  {/* View in shop */}
                  <a href={`/shop/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="admin-row-btn admin-row-btn--view" title="Виж в магазина">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>

                  {/* Duplicate */}
                  <button type="button" className="admin-row-btn" title="Дублирай"
                    disabled={savingId === p.id || duplicatingId === p.id}
                    onClick={() => handleDuplicate(p)}>
                    {duplicatingId === p.id
                      ? <span className="admin-saving-spinner" />
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    }
                  </button>

                  {/* Archive toggle */}
                  <button type="button"
                    className={`admin-row-btn${p.archived ? ' admin-row-btn--unarchive' : ' admin-row-btn--archive'}`}
                    title={p.archived ? 'Разархивирай' : 'Архивирай'}
                    disabled={savingId === p.id}
                    onClick={() => save(p.id, { archived: !p.archived })}>
                    {p.archived ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    )}
                  </button>

                  {/* Delete */}
                  {confirmDeleteId === p.id ? (
                    <span className="admin-confirm-delete">
                      <span className="admin-confirm-text">Изтрий?</span>
                      <button type="button" className="admin-confirm-yes" disabled={savingId === p.id} onClick={() => handleDelete(p.id)}>Да</button>
                      <button type="button" className="admin-confirm-no" onClick={() => setConfirmDeleteId(null)}>Не</button>
                    </span>
                  ) : (
                    <button type="button" className="admin-row-btn admin-row-btn--delete"
                      title="Изтрий" disabled={savingId === p.id}
                      onClick={() => setConfirmDeleteId(p.id)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
