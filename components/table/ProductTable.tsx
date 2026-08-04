'use client';
import { useState, useRef, useMemo, useEffect } from 'react';
import { COLOR_VARIANTS } from '@/lib/color-variants';

type Product = {
  id: number;
  slug: string;
  name: string;
  sku: string;
  price: number;
  costPrice: number | null;
  description: string;
  stock: number;
  has3dModel: boolean;
  hasDrawing: boolean;
  hasVisualization: boolean;
  series: string;
  seriesColor: string;
  category: string;
};


function getStockBadge(stock: number) {
  if (stock > 5) return { bg: '#dcfce7', color: '#15803d', label: `${stock} бр.` };
  if (stock > 0) return { bg: '#fef3c7', color: '#b45309', label: `${stock} бр.` };
  return { bg: '#fee2e2', color: '#991b1b', label: '0 бр.' };
}

type EditingCell = { id: number; field: string } | null;
type RowState = 'idle' | 'saving' | 'saved' | 'error';

export default function ProductTable({ products: initial }: { products: Product[] }) {
  const [products, setProducts]   = useState<Product[]>(initial);
  const [editing, setEditing]     = useState<EditingCell>(null);
  const [editValue, setEditValue] = useState('');
  const [rowState, setRowState]   = useState<Record<number, RowState>>({});
  const [search, setSearch]       = useState('');
  const [filterSeries, setFilterSeries] = useState('all');
  const [selected, setSelected]   = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const allSeries = useMemo(() => Array.from(new Set(initial.map(p => p.series))), [initial]);

  // Series data (name + color) for material blocks
  const seriesData = useMemo(() => {
    const map = new Map<string, string>();
    initial.forEach(p => map.set(p.series, p.seriesColor));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, color]) => ({ name, color }));
  }, [initial]);

  // Materials per series — persisted in DB, localStorage as instant cache
  const [materials, setMaterials] = useState<Record<string, string[]>>({});
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let localData: Record<string, string[]> = {};
    try {
      const cached = localStorage.getItem('ol_series_materials');
      if (cached) {
        localData = JSON.parse(cached);
        setMaterials(localData);
      }
    } catch {}

    fetch('/api/table/series-materials')
      .then(r => r.ok ? r.json() : null)
      .then((dbData: Record<string, string[]> | null) => {
        if (dbData && Object.keys(dbData).length > 0) {
          // DB has data — it's the source of truth
          setMaterials(dbData);
          try { localStorage.setItem('ol_series_materials', JSON.stringify(dbData)); } catch {}
        } else if (Object.keys(localData).length > 0) {
          // DB is empty but localStorage has data → push everything to DB
          for (const [series, mats] of Object.entries(localData)) {
            fetch('/api/table/series-materials', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ series, materials: mats }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  function updateMaterial(series: string, idx: number, value: string) {
    setMaterials(prev => {
      const rows = [...(prev[series] ?? ['', '', '', '', ''])];
      rows[idx] = value;
      const next = { ...prev, [series]: rows };
      // Update localStorage immediately
      try { localStorage.setItem('ol_series_materials', JSON.stringify(next)); } catch {}
      // Debounce save to DB — 800ms after last keystroke
      clearTimeout(saveTimers.current[series]);
      saveTimers.current[series] = setTimeout(() => {
        fetch('/api/table/series-materials', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ series, materials: next[series] }),
        }).catch(() => {});
      }, 800);
      return next;
    });
  }

  function accentColor(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#374151' : hex;
  }

  const filtered = useMemo(() => {
    let list = products;
    if (filterSeries !== 'all') list = list.filter(p => p.series === filterSeries);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => a.category.localeCompare(b.category, 'bg'));
  }, [products, search, filterSeries]);

  async function patchProduct(id: number, field: string, value: unknown) {
    setRowState(s => ({ ...s, [id]: 'saving' }));
    try {
      const res = await fetch('/api/table/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, [field]: value }),
      });
      if (!res.ok) throw new Error();
      setProducts(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p));
      setRowState(s => ({ ...s, [id]: 'saved' }));
      setTimeout(() => setRowState(s => ({ ...s, [id]: 'idle' })), 1500);
    } catch {
      setRowState(s => ({ ...s, [id]: 'error' }));
      setTimeout(() => setRowState(s => ({ ...s, [id]: 'idle' })), 2000);
    }
  }

  function startEdit(id: number, field: string, value: unknown) {
    setEditing({ id, field });
    setEditValue(String(value ?? ''));
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitEdit(id: number, field: string, product: Product) {
    let parsed: unknown = editValue;
    if (field === 'price' || field === 'costPrice') {
      parsed = editValue.trim() === '' ? null : parseFloat(editValue) || 0;
    }
    if (field === 'stock') parsed = parseInt(editValue) || 0;
    const current = product[field as keyof Product];
    if (String(parsed) !== String(current ?? '')) patchProduct(id, field, parsed);
    setEditing(null);
  }

  function cancelEdit() { setEditing(null); }

  function toggleCheck(id: number, field: 'has3dModel' | 'hasDrawing' | 'hasVisualization') {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const next = !p[field];
    setProducts(ps => ps.map(x => x.id === id ? { ...x, [field]: next } : x));
    patchProduct(id, field, next);
  }

  function toggleSelect(id: number) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    setSelected(selected.size === filtered.length && filtered.length > 0
      ? new Set()
      : new Set(filtered.map(p => p.id))
    );
  }

  function toggleExpand(id: number) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Called as a regular function (not JSX component) to avoid remount on state change
  function renderCell(
    p: Product,
    field: keyof Product,
    type: 'text' | 'number' = 'text',
    maxW = 180,
  ) {
    const isEditing = editing?.id === p.id && editing?.field === field;
    const raw = p[field];
    const display = raw === null || raw === undefined || raw === '' ? '—' : String(raw);

    if (isEditing) {
      const style: React.CSSProperties = {
        padding: '4px 8px', border: '2px solid #3b82f6', borderRadius: 6,
        fontSize: 13, outline: 'none', fontFamily: 'inherit',
        background: '#fff', width: maxW - 20, boxSizing: 'border-box',
      };
      if (field === 'description') {
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={() => commitEdit(p.id, field, p)}
            onKeyDown={e => {
              if (e.key === 'Escape') cancelEdit();
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(p.id, field, p); }
            }}
            rows={3}
            style={{ ...style, resize: 'none', width: 210 }}
          />
        );
      }
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onBlur={() => commitEdit(p.id, field, p)}
          onKeyDown={e => {
            if (e.key === 'Escape') cancelEdit();
            if (e.key === 'Enter') commitEdit(p.id, field, p);
          }}
          style={style}
        />
      );
    }

    return (
      <span
        onClick={() => startEdit(p.id, field, raw)}
        title={display !== '—' ? display : undefined}
        style={{
          cursor: 'text', display: 'block', minHeight: 22, lineHeight: '1.4',
          color: display === '—' ? '#9ca3af' : '#111827', fontSize: 13,
          maxWidth: maxW, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
      >
        {display}
      </span>
    );
  }

  const TH: React.CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: 11,
    fontWeight: 700, color: '#6b7280', textTransform: 'uppercase',
    letterSpacing: '.6px', background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap',
    position: 'sticky', top: 0, zIndex: 10,
  };
  const TD: React.CSSProperties = {
    padding: '0 14px', height: 50, fontSize: 13,
    color: '#111827', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle',
  };

  const DETAIL_LABEL: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#64748b',
    minWidth: 120, flexShrink: 0, paddingTop: 3,
    letterSpacing: '.3px', textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Breadcrumb bar */}
      <div className="pt-breadcrumb" style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', display: 'flex', alignItems: 'center', gap: 8, height: 44,
      }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>OfficeLabs Co</span>
        <span style={{ color: '#d1d5db', fontSize: 14 }}>›</span>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Продуктова Таблица</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Private Database
        </div>
      </div>

      <div className="pt-header-section" style={{ padding: '28px 32px 0' }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-.4px' }}>
            Продуктова Таблица
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            {initial.length} продукта · Кликни клетка за редакция
          </p>
        </div>

        {/* Toolbar */}
        <div className="pt-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {/* Series filter tabs */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 8, padding: 3, gap: 2 }}>
            {['all', ...allSeries].map(s => {
              const active = filterSeries === s;
              return (
                <button key={s} onClick={() => setFilterSeries(s)} style={{
                  padding: '5px 14px', border: 'none', borderRadius: 6, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                  transition: 'all .12s',
                }}>
                  {s === 'all' ? 'Всички' : s}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Търси продукт или SKU..."
              style={{
                padding: '7px 12px 7px 30px', border: '1px solid #e2e8f0',
                borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff',
                width: 240, boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Count */}
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {filtered.length !== initial.length ? `${filtered.length} от ${initial.length}` : `${initial.length} продукта`}
          </span>

          {selected.size > 0 && (
            <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>
              {selected.size} избрани
            </span>
          )}

          {/* Legend */}
          <div className="pt-legend" style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8', alignItems: 'center' }}>
            {([['#dcfce7', '#86efac', '> 5 бр.'], ['#fef3c7', '#fcd34d', '1-5 бр.'], ['#fee2e2', '#fca5a5', '0 бр.']] as const).map(([bg, b, lbl]) => (
              <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: bg, border: `1px solid ${b}` }} />
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats bars ── */}
      {(() => {
        const total = products.length;
        const statsData = [
          { label: 'Цена към мен',  count: products.filter(p => p.costPrice !== null && (p.costPrice as number) > 0).length },
          { label: 'Клиент цена',   count: products.filter(p => p.price > 0).length },
          { label: 'Наличност',     count: products.filter(p => p.stock > 0).length },
          { label: '3Д модел',      count: products.filter(p => p.has3dModel).length },
          { label: 'Чертеж',        count: products.filter(p => p.hasDrawing).length },
          { label: 'Визуализация',  count: products.filter(p => p.hasVisualization).length },
        ];

        function accentFromPct(pct: number) {
          const hue = Math.round(pct * 120);
          return {
            solid: `hsl(${hue}, 88%, 42%)`,
            light:  `hsl(${hue}, 88%, 65%)`,
          };
        }

        return (
          <div className="pt-stats-grid" style={{ padding: '0 32px 20px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {statsData.map(({ label, count }) => {
              const pct = total > 0 ? count / total : 0;
              const { solid, light } = accentFromPct(pct);
              const pctStr = `${Math.round(pct * 100)}%`;

              return (
                <div key={label} style={{
                  background: '#fff', borderRadius: 16, padding: '16px 18px 14px',
                  boxShadow: '0 2px 12px rgba(0,0,0,.07)', border: '1px solid rgba(0,0,0,.05)',
                }}>
                  {/* Label */}
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', letterSpacing: '.3px', marginBottom: 8 }}>
                    {label}
                  </div>

                  {/* Number */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 30, fontWeight: 700, color: '#1C1C1E', lineHeight: 1, letterSpacing: '-.5px' }}>
                      {count}
                    </span>
                    <span style={{ fontSize: 13, color: '#8E8E93', fontWeight: 500 }}>/ {total}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: solid }}>
                      {pctStr}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 6, borderRadius: 999, background: '#F2F2F7', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 999,
                      width: pctStr,
                      background: `linear-gradient(90deg, ${light}, ${solid})`,
                      transition: 'width .4s cubic-bezier(.4,0,.2,1)',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── Materials per series ── */}
      <div className="pt-materials-section" style={{ padding: '0 32px 24px' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Материали по серии</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Запазва се автоматично</span>
        </div>
        <div className="pt-materials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {seriesData.map(({ name, color }) => {
            const accent = accentColor(color);
            const rows = materials[name] ?? ['', '', '', '', ''];
            return (
              <div key={name} style={{
                background: '#fff', borderRadius: 12, overflow: 'hidden',
                border: '1px solid #e2e8f0', borderTop: `3px solid ${accent}`,
                boxShadow: '0 1px 4px rgba(0,0,0,.06)',
              }}>
                <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', letterSpacing: '.05em' }}>{name}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '.1em', marginTop: 1 }}>МАТЕРИАЛИ</div>
                </div>
                <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {rows.map((val, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                        background: accent + '18', color: accent,
                        fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {i + 1}
                      </span>
                      <input
                        value={val}
                        onChange={e => updateMaterial(name, i, e.target.value)}
                        placeholder="—"
                        style={{
                          flex: 1, minWidth: '30ch', padding: '5px 9px',
                          border: '1px solid #e2e8f0', borderRadius: 6,
                          fontSize: 13, outline: 'none', fontFamily: 'inherit',
                          background: '#fafafa', color: '#111827',
                          transition: 'border-color .15s, background .15s',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.background = '#fff'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fafafa'; }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Desktop Table (hidden on mobile) ── */}
      <div className="pt-desktop-table" style={{ padding: '0 32px 48px', overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1150, tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: 44, padding: '10px 0 10px 16px' }}>
                  <input type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                  />
                </th>
                <th style={{ ...TH, width: 90 }}>SKU</th>
                <th style={{ ...TH, width: 200 }}>Продукт</th>
                <th style={{ ...TH, width: 105 }}>Серия</th>
                <th style={{ ...TH, width: 115 }}>Категория</th>
                <th style={{ ...TH, width: 220 }}>Описание</th>
                <th style={{ ...TH, width: 80 }}>Мен (€)</th>
                <th style={{ ...TH, width: 80 }}>Клиент (€)</th>
                <th style={{ ...TH, width: 95 }}>Наличност</th>
                <th style={{ ...TH, width: 110 }}>Варианти</th>
                <th style={{ ...TH, width: 48, textAlign: 'center' }}>3Д</th>
                <th style={{ ...TH, width: 64, textAlign: 'center' }}>Чертеж</th>
                <th style={{ ...TH, width: 68, textAlign: 'center' }}>Визуал.</th>
                <th style={{ ...TH, width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const sb = getStockBadge(p.stock);
                const rs = rowState[p.id] ?? 'idle';
                const isSel = selected.has(p.id);

                return (
                  <tr key={p.id}
                    style={{ background: isSel ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafafa' }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = '#f8faff'; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.background = idx % 2 === 0 ? '#fff' : '#fafafa'; }}
                  >
                    {/* Checkbox + status */}
                    <td style={{ ...TD, padding: '0 0 0 16px', width: 44 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="checkbox" checked={isSel} onChange={() => toggleSelect(p.id)}
                          style={{ cursor: 'pointer', accentColor: '#3b82f6' }}
                        />
                        {rs === 'saving' && (
                          <svg style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
                            width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                          </svg>
                        )}
                        {rs === 'saved'  && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        {rs === 'error'  && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
                      </div>
                    </td>

                    {/* SKU */}
                    <td style={{ ...TD }}>{renderCell(p, 'sku', 'text', 80)}</td>

                    {/* Name */}
                    <td style={{ ...TD }}>{renderCell(p, 'name', 'text', 190)}</td>

                    {/* Series */}
                    <td style={{ ...TD }}>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{p.series}</span>
                    </td>

                    {/* Category */}
                    <td style={{ ...TD }}>
                      <span style={{ fontSize: 13, color: '#374151' }}>{p.category}</span>
                    </td>

                    {/* Description */}
                    <td style={{ ...TD }}>{renderCell(p, 'description', 'text', 210)}</td>

                    {/* Cost price */}
                    <td style={{ ...TD }}>{renderCell(p, 'costPrice', 'number', 68)}</td>

                    {/* Customer price */}
                    <td style={{ ...TD }}>{renderCell(p, 'price', 'number', 68)}</td>

                    {/* Stock */}
                    <td style={{ ...TD }}>
                      <span
                        onClick={() => startEdit(p.id, 'stock', p.stock)}
                        title="Кликни за редакция"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: sb.bg, color: sb.color,
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700, cursor: 'text', whiteSpace: 'nowrap',
                        }}
                      >
                        {editing?.id === p.id && editing?.field === 'stock' ? (
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(p.id, 'stock', p)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit(p.id, 'stock', p);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            style={{
                              width: 52, padding: '1px 4px', border: '2px solid #3b82f6',
                              borderRadius: 4, fontSize: 12, outline: 'none',
                              fontWeight: 700, color: sb.color, background: '#fff',
                            }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : sb.label}
                      </span>
                    </td>

                    {/* Color variants */}
                    <td style={{ ...TD }}>
                      {COLOR_VARIANTS[p.slug] ? (
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
                          {COLOR_VARIANTS[p.slug].map(v => (
                            <span key={v.name} title={v.name} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 600, color: '#374151',
                              padding: '2px 7px 2px 4px',
                              borderRadius: 999,
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb',
                            }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, border: '1px solid rgba(0,0,0,.12)', flexShrink: 0 }} />
                              {v.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>
                      )}
                    </td>

                    {/* 3D Model */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <input type="checkbox" checked={p.has3dModel}
                        onChange={() => toggleCheck(p.id, 'has3dModel')}
                        title={p.has3dModel ? 'Има 3Д модел' : 'Няма 3Д модел'}
                        className="table-check"
                      />
                    </td>

                    {/* Drawing */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <input type="checkbox" checked={p.hasDrawing}
                        onChange={() => toggleCheck(p.id, 'hasDrawing')}
                        title={p.hasDrawing ? 'Има чертеж' : 'Няма чертеж'}
                        className="table-check"
                      />
                    </td>

                    {/* Visualization */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <input type="checkbox" checked={p.hasVisualization}
                        onChange={() => toggleCheck(p.id, 'hasVisualization')}
                        title={p.hasVisualization ? 'Има визуализация' : 'Няма визуализация'}
                        className="table-check"
                      />
                    </td>

                    {/* ID */}
                    <td style={{ ...TD, padding: '0 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, color: '#cbd5e1', fontVariantNumeric: 'tabular-nums' }}>
                        #{p.id}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={14} style={{ padding: 56, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    Няма намерени продукти
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
          <span>Enter — запазване · Esc — отказ · Shift+Enter — нов ред (в описание)</span>
          <a href="/adminpanel/dashboard"
            style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Admin Panel
          </a>
        </div>
      </div>

      {/* ── Mobile Accordion (hidden on desktop) ── */}
      <div className="pt-mobile-accordion" style={{ padding: '0 16px 48px' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          {filtered.map((p, idx) => {
            const sb = getStockBadge(p.stock);
            const rs = rowState[p.id] ?? 'idle';
            const isExpanded = expandedRows.has(p.id);
            const isSel = selected.has(p.id);
            const variants = COLOR_VARIANTS[p.slug];

            return (
              <div key={p.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>

                {/* Accordion header row */}
                <div
                  onClick={() => toggleExpand(p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '13px 14px',
                    background: isSel ? '#eff6ff' : '#fff',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={isSel}
                    onChange={e => { e.stopPropagation(); toggleSelect(p.id); }}
                    onClick={e => e.stopPropagation()}
                    style={{ cursor: 'pointer', accentColor: '#3b82f6', flexShrink: 0, width: 16, height: 16 }}
                  />

                  {/* Save state indicator */}
                  {rs === 'saving' && (
                    <svg style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
                      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="3">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  )}
                  {rs === 'saved' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>}
                  {rs === 'error' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" style={{ flexShrink: 0 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}

                  {/* Name + SKU */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{p.sku}</div>
                  </div>

                  {/* Stock badge */}
                  <span style={{
                    background: sb.bg, color: sb.color,
                    padding: '2px 8px', borderRadius: 20,
                    fontSize: 11, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {sb.label}
                  </span>

                  {/* Chevron */}
                  <svg
                    width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="#94a3b8" strokeWidth="2.5"
                    style={{
                      flexShrink: 0,
                      transition: 'transform .2s',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div style={{ background: '#f8faff', borderTop: '1px solid #e2e8f0', padding: '4px 14px 16px' }}>

                    {/* Series + Category tags */}
                    <div style={{ display: 'flex', gap: 6, paddingTop: 12, paddingBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#334155', padding: '2px 9px', borderRadius: 999 }}>
                        {p.series}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#475569', background: '#e2e8f0', padding: '2px 9px', borderRadius: 999 }}>
                        {p.category}
                      </span>
                    </div>

                    {/* Detail rows */}
                    {[
                      { label: 'SKU', content: renderCell(p, 'sku') },
                      { label: 'Описание', content: renderCell(p, 'description', 'text', 320) },
                      { label: 'Цена към мен (€)', content: renderCell(p, 'costPrice', 'number') },
                      { label: 'Цена клиент (€)', content: renderCell(p, 'price', 'number') },
                    ].map(({ label, content }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #eaeff5' }}>
                        <span style={{ ...DETAIL_LABEL }}>{label}</span>
                        <div style={{ flex: 1 }}>{content}</div>
                      </div>
                    ))}

                    {/* Stock editable */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #eaeff5' }}>
                      <span style={{ ...DETAIL_LABEL }}>Наличност</span>
                      <span
                        onClick={e => { e.stopPropagation(); startEdit(p.id, 'stock', p.stock); }}
                        style={{
                          display: 'inline-flex', alignItems: 'center',
                          background: sb.bg, color: sb.color,
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 700, cursor: 'text',
                        }}
                      >
                        {editing?.id === p.id && editing?.field === 'stock' ? (
                          <input
                            ref={inputRef as React.RefObject<HTMLInputElement>}
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => commitEdit(p.id, 'stock', p)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit(p.id, 'stock', p);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            onClick={e => e.stopPropagation()}
                            style={{ width: 52, padding: '1px 4px', border: '2px solid #3b82f6', borderRadius: 4, fontSize: 12, outline: 'none', fontWeight: 700, color: sb.color, background: '#fff' }}
                          />
                        ) : sb.label}
                      </span>
                    </div>

                    {/* Color variants */}
                    {variants && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #eaeff5' }}>
                        <span style={{ ...DETAIL_LABEL }}>Варианти</span>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {variants.map(v => (
                            <span key={v.name} style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              fontSize: 11, fontWeight: 600, color: '#374151',
                              padding: '2px 7px 2px 4px',
                              borderRadius: 999, border: '1px solid #e5e7eb', background: '#f9fafb',
                            }}>
                              <span style={{ width: 10, height: 10, borderRadius: '50%', background: v.color, border: '1px solid rgba(0,0,0,.12)', flexShrink: 0 }} />
                              {v.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checkboxes */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, paddingTop: 12 }}>
                      {([
                        { field: 'has3dModel' as const, label: '3Д модел' },
                        { field: 'hasDrawing' as const, label: 'Чертеж' },
                        { field: 'hasVisualization' as const, label: 'Визуализация' },
                      ] as const).map(({ field, label }) => (
                        <label key={field} onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#374151', fontWeight: 500 }}>
                          <input
                            type="checkbox"
                            checked={p[field]}
                            onChange={() => toggleCheck(p.id, field)}
                            className="table-check"
                          />
                          {label}
                        </label>
                      ))}
                    </div>

                    <div style={{ marginTop: 10, fontSize: 10, color: '#cbd5e1' }}>#{p.id}</div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
              Няма намерени продукти
            </div>
          )}
        </div>

        {/* Mobile footer */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', fontSize: 12, color: '#94a3b8' }}>
          <a href="/adminpanel/dashboard"
            style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Admin Panel
          </a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; }
        html { scrollbar-gutter: stable; }
        input[type=number]::-webkit-inner-spin-button { opacity: .6; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .table-check {
          width: 16px; height: 16px; cursor: pointer;
          accent-color: #3b82f6; border-radius: 4px;
        }

        /* ── Mobile / Tablet responsive ── */
        .pt-mobile-accordion { display: none; }

        @media (max-width: 900px) {
          .pt-breadcrumb { padding: 0 16px !important; }
          .pt-header-section { padding: 16px 16px 0 !important; }
          .pt-stats-grid { padding: 0 16px 16px !important; grid-template-columns: repeat(3, 1fr) !important; }
          .pt-materials-section { padding: 0 16px 20px !important; }
          .pt-materials-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pt-legend { display: none !important; }
        }

        @media (max-width: 600px) {
          .pt-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pt-materials-grid { grid-template-columns: repeat(1, 1fr) !important; }
          .pt-toolbar { gap: 8px !important; }
          .pt-desktop-table { display: none !important; }
          .pt-mobile-accordion { display: block !important; }
        }
      `}</style>
    </div>
  );
}
