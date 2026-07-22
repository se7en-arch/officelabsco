'use client';
import { useState, useRef, useMemo } from 'react';

type Product = {
  id: number;
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

const SERIES_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  ASTRA: { bg: '#eff6ff', dot: '#3b82f6', text: '#1d4ed8' },
  TERRA: { bg: '#f0fdf4', dot: '#22c55e', text: '#15803d' },
  NOVA:  { bg: '#fffbeb', dot: '#f59e0b', text: '#b45309' },
  LOFT:  { bg: '#f8fafc', dot: '#64748b', text: '#334155' },
};

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  'Бюра':        { bg: '#dbeafe', text: '#1e40af' },
  'Маси':        { bg: '#dcfce7', text: '#166534' },
  'Столове':     { bg: '#fef3c7', text: '#92400e' },
  'Шкафове':     { bg: '#f3e8ff', text: '#6b21a8' },
  'Контейнери':  { bg: '#fce7f3', text: '#9d174d' },
  'Разделители': { bg: '#ecfdf5', text: '#065f46' },
  'Библиотеки':  { bg: '#fff7ed', text: '#9a3412' },
  'Тапицерия':   { bg: '#fef2f2', text: '#991b1b' },
};

function getSeriesStyle(series: string) {
  return SERIES_COLORS[series] ?? { bg: '#f8fafc', dot: '#6b7280', text: '#334155' };
}

function getCatStyle(cat: string) {
  return CAT_COLORS[cat] ?? { bg: '#f3f4f6', text: '#374151' };
}

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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const allSeries = useMemo(() => Array.from(new Set(initial.map(p => p.series))), [initial]);

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
    return list;
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

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Breadcrumb bar */}
      <div style={{
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

      <div style={{ padding: '28px 32px 0' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {/* Series filter tabs */}
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 8, padding: 3, gap: 2 }}>
            {['all', ...allSeries].map(s => {
              const active = filterSeries === s;
              const sc = s !== 'all' ? getSeriesStyle(s) : null;
              return (
                <button key={s} onClick={() => setFilterSeries(s)} style={{
                  padding: '5px 14px', border: 'none', borderRadius: 6, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer',
                  background: active ? '#fff' : 'transparent',
                  color: active ? (sc?.text ?? '#0f172a') : '#64748b',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                  transition: 'all .12s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {sc && <span style={{ width: 7, height: 7, borderRadius: '50%', background: sc.dot }} />}
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
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 11, color: '#94a3b8', alignItems: 'center' }}>
            {([['#dcfce7', '#86efac', '> 5 бр.'], ['#fef3c7', '#fcd34d', '1-5 бр.'], ['#fee2e2', '#fca5a5', '0 бр.']] as const).map(([bg, b, lbl]) => (
              <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: 3, background: bg, border: `1px solid ${b}` }} />
                {lbl}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px 48px', overflowX: 'auto' }}>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1150 }}>
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
                <th style={{ ...TH, width: 115 }}>Цена към мен</th>
                <th style={{ ...TH, width: 115 }}>Клиент цена</th>
                <th style={{ ...TH, width: 95 }}>Наличност</th>
                <th style={{ ...TH, width: 52, textAlign: 'center' }}>3Д</th>
                <th style={{ ...TH, width: 68, textAlign: 'center' }}>Чертеж</th>
                <th style={{ ...TH, width: 76, textAlign: 'center' }}>Визуал.</th>
                <th style={{ ...TH, width: 44 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => {
                const ss = getSeriesStyle(p.series);
                const cs = getCatStyle(p.category);
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

                    {/* Series badge */}
                    <td style={{ ...TD }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: ss.bg, padding: '3px 10px', borderRadius: 20,
                        fontSize: 12, fontWeight: 600, color: ss.text, whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: ss.dot }} />
                        {p.series}
                      </span>
                    </td>

                    {/* Category badge */}
                    <td style={{ ...TD }}>
                      <span style={{
                        display: 'inline-block', background: cs.bg, color: cs.text,
                        padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {p.category}
                      </span>
                    </td>

                    {/* Description */}
                    <td style={{ ...TD }}>{renderCell(p, 'description', 'text', 210)}</td>

                    {/* Cost price */}
                    <td style={{ ...TD }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>лв.</span>
                        {renderCell(p, 'costPrice', 'number', 75)}
                      </div>
                    </td>

                    {/* Customer price */}
                    <td style={{ ...TD }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>лв.</span>
                        {renderCell(p, 'price', 'number', 75)}
                      </div>
                    </td>

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

                    {/* 3D Model */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <button onClick={() => toggleCheck(p.id, 'has3dModel')}
                        title={p.has3dModel ? 'Има 3Д модел — кликни за премахване' : 'Няма — кликни за добавяне'}
                        style={{
                          width: 28, height: 28, border: 'none', borderRadius: 6,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: p.has3dModel ? '#dbeafe' : '#f1f5f9',
                          color: p.has3dModel ? '#1d4ed8' : '#94a3b8',
                          fontSize: 14, fontWeight: 800, transition: 'all .12s',
                        }}>
                        {p.has3dModel ? '✓' : '–'}
                      </button>
                    </td>

                    {/* Drawing */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <button onClick={() => toggleCheck(p.id, 'hasDrawing')}
                        title={p.hasDrawing ? 'Има чертеж' : 'Няма чертеж'}
                        style={{
                          width: 28, height: 28, border: 'none', borderRadius: 6,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: p.hasDrawing ? '#dcfce7' : '#f1f5f9',
                          color: p.hasDrawing ? '#15803d' : '#94a3b8',
                          fontSize: 14, fontWeight: 800, transition: 'all .12s',
                        }}>
                        {p.hasDrawing ? '✓' : '–'}
                      </button>
                    </td>

                    {/* Visualization */}
                    <td style={{ ...TD, textAlign: 'center' }}>
                      <button onClick={() => toggleCheck(p.id, 'hasVisualization')}
                        title={p.hasVisualization ? 'Има визуализация' : 'Няма визуализация'}
                        style={{
                          width: 28, height: 28, border: 'none', borderRadius: 6,
                          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          background: p.hasVisualization ? '#f3e8ff' : '#f1f5f9',
                          color: p.hasVisualization ? '#7c3aed' : '#94a3b8',
                          fontSize: 14, fontWeight: 800, transition: 'all .12s',
                        }}>
                        {p.hasVisualization ? '✓' : '–'}
                      </button>
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
                  <td colSpan={13} style={{ padding: 56, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        *, *::before, *::after { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: .6; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}
