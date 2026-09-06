'use client';

import { useEffect, useRef, useState } from 'react';

type Category = 'material' | 'hardware';
type CostItem = { id: string; name: string; unit: string; price: number; category: Category };
type ModuleRow = { id: string; name: string; qty: Record<string, number> };
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type CalcState = { priceList: CostItem[]; modules: ModuleRow[]; markup: number; vat: number };

const uid = () => Math.random().toString(36).slice(2, 10);

const HARDWARE_DEFAULTS: [string, string][] = [
  ['Рафтоносачи', 'бр.'],
  ['Кант', 'м'],
  ['Рязане на детайл', 'бр.'],
  ['Разпробиване', 'бр.'],
  ['Панти', 'бр.'],
  ['Минификс', 'бр.'],
  ['Дибли', 'бр.'],
  ['Мебелни крака', 'бр.'],
  ['Мебелни колела', 'бр.'],
  ['Механизъм чекмедже', 'к-т'],
  ['Стъклени врати', 'бр.'],
  ['Пуш механизъм', 'бр.'],
  ['Дръжки', 'бр.'],
  ['Труд / монтаж', 'час'],
  ['Опаковане', 'бр.'],
  ['Гръб (HDF)', 'м²'],
];

function defaultPriceList(seriesMaterials: Record<string, string[]>): CostItem[] {
  const items: CostItem[] = [];
  for (const [series, mats] of Object.entries(seriesMaterials)) {
    for (const m of mats) {
      if (m && m.trim()) items.push({ id: uid(), name: `${series} — ${m.trim()}`, unit: 'м²', price: 0, category: 'material' });
    }
  }
  if (items.length === 0) {
    items.push({ id: uid(), name: 'ПДЧ 18 mm, клас Е1', unit: 'м²', price: 0, category: 'material' });
  }
  for (const [name, unit] of HARDWARE_DEFAULTS) {
    items.push({ id: uid(), name, unit, price: 0, category: 'hardware' });
  }
  return items;
}

function fmt(n: number): string {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CostCalculator({
  initial,
  seriesMaterials,
  defaultVat,
}: {
  initial: Partial<CalcState> | null;
  seriesMaterials: Record<string, string[]>;
  defaultVat: number;
}) {
  const [state, setState] = useState<CalcState>(() => ({
    priceList: initial?.priceList?.length ? initial.priceList : defaultPriceList(seriesMaterials),
    modules: initial?.modules ?? [],
    markup: typeof initial?.markup === 'number' ? initial.markup : 30,
    vat: typeof initial?.vat === 'number' ? initial.vat : defaultVat,
  }));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Fallback: if the DB had nothing, try localStorage cache and push it up.
  useEffect(() => {
    if (initial) return;
    try {
      const cached = localStorage.getItem('ol_cost_calculator');
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<CalcState>;
        setState(prev => ({
          priceList: parsed.priceList ?? prev.priceList,
          modules: parsed.modules ?? prev.modules,
          markup: typeof parsed.markup === 'number' ? parsed.markup : prev.markup,
          vat: typeof parsed.vat === 'number' ? parsed.vat : prev.vat,
        }));
        fetch('/api/table/cost-calculator', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: cached,
        }).catch(() => {});
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(updater: (prev: CalcState) => CalcState) {
    setState(prev => {
      const next = updater(prev);
      try { localStorage.setItem('ol_cost_calculator', JSON.stringify(next)); } catch { /* ignore */ }
      setSaveState('saving');
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch('/api/table/cost-calculator', {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next),
        }).then(r => {
          if (!r.ok) throw new Error();
          setSaveState('saved');
          setTimeout(() => setSaveState('idle'), 1500);
        }).catch(() => {
          setSaveState('error');
          setTimeout(() => setSaveState('idle'), 2000);
        });
      }, 700);
      return next;
    });
  }

  // ── Price list mutators ──────────────────────────────────────────────
  function addPriceItem(category: Category) {
    commit(prev => ({
      ...prev,
      priceList: [...prev.priceList, { id: uid(), name: '', unit: category === 'material' ? 'м²' : 'бр.', price: 0, category }],
    }));
  }
  function updatePriceItem(id: string, patch: Partial<CostItem>) {
    commit(prev => ({ ...prev, priceList: prev.priceList.map(it => it.id === id ? { ...it, ...patch } : it) }));
  }
  function removePriceItem(id: string) {
    commit(prev => ({
      ...prev,
      priceList: prev.priceList.filter(it => it.id !== id),
      modules: prev.modules.map(m => {
        if (!(id in m.qty)) return m;
        const qty = { ...m.qty };
        delete qty[id];
        return { ...m, qty };
      }),
    }));
  }

  // ── Module mutators ──────────────────────────────────────────────────
  function addModule() {
    const id = uid();
    commit(prev => ({ ...prev, modules: [...prev.modules, { id, name: `Модул ${prev.modules.length + 1}`, qty: {} }] }));
    setExpanded(e => new Set(e).add(id));
  }
  function duplicateModule(src: ModuleRow) {
    const id = uid();
    commit(prev => ({ ...prev, modules: [...prev.modules, { ...src, id, name: src.name + ' (копие)' }] }));
    setExpanded(e => new Set(e).add(id));
  }
  function removeModule(id: string) {
    commit(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
  }
  function updateModuleName(id: string, name: string) {
    commit(prev => ({ ...prev, modules: prev.modules.map(m => m.id === id ? { ...m, name } : m) }));
  }
  function updateModuleQty(moduleId: string, itemId: string, qty: number) {
    commit(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, qty: { ...m.qty, [itemId]: qty } } : m) }));
  }
  function toggleExpand(id: string) {
    setExpanded(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function moduleCost(m: ModuleRow): number {
    return state.priceList.reduce((sum, item) => sum + (m.qty[item.id] || 0) * item.price, 0);
  }
  function moduleSale(m: ModuleRow): number {
    return moduleCost(m) * (1 + state.markup / 100);
  }
  function moduleFinal(m: ModuleRow): number {
    return moduleSale(m) * (1 + state.vat / 100);
  }

  const materials = state.priceList.filter(i => i.category === 'material');
  const hardware = state.priceList.filter(i => i.category === 'hardware');

  const grandCost = state.modules.reduce((s, m) => s + moduleCost(m), 0);
  const grandSale = state.modules.reduce((s, m) => s + moduleSale(m), 0);

  const SAVE_LABEL: Record<SaveState, string> = {
    idle: '', saving: 'Запазване…', saved: 'Запазено ✓', error: 'Грешка при запис',
  };

  const inputBase: React.CSSProperties = {
    padding: '6px 9px', border: '1px solid #e2e8f0', borderRadius: 6,
    fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fafafa',
    color: '#111827',
  };

  function PriceRow({ item }: { item: CostItem }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0' }}>
        <input
          value={item.name}
          onChange={e => updatePriceItem(item.id, { name: e.target.value })}
          placeholder="Име"
          style={{ ...inputBase, flex: 1, minWidth: 0 }}
        />
        <input
          value={item.unit}
          onChange={e => updatePriceItem(item.id, { unit: e.target.value })}
          placeholder="ед."
          style={{ ...inputBase, width: 52, textAlign: 'center', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <input
            type="number" step="any"
            value={item.price === 0 ? '' : item.price}
            onChange={e => updatePriceItem(item.id, { price: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
            placeholder="0"
            style={{ ...inputBase, width: 74, textAlign: 'right' }}
          />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>€</span>
        </div>
        <button
          onClick={() => removePriceItem(item.id)}
          title="Изтрий"
          style={{
            width: 24, height: 24, flexShrink: 0, border: 'none', background: 'transparent',
            color: '#cbd5e1', cursor: 'pointer', fontSize: 15, lineHeight: 1, borderRadius: 5,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
        >×</button>
      </div>
    );
  }

  function QtyRow({ m, item }: { m: ModuleRow; item: CostItem }) {
    const q = m.qty[item.id] || 0;
    const line = q * item.price;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
        <span style={{ flex: 1, fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
          {item.name || <em style={{ color: '#cbd5e1' }}>—</em>}
        </span>
        <span style={{ fontSize: 10, color: '#94a3b8', width: 26, flexShrink: 0 }}>{item.unit}</span>
        <input
          type="number" step="any" min={0}
          value={q === 0 ? '' : q}
          onChange={e => updateModuleQty(m.id, item.id, e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
          placeholder="0"
          style={{ ...inputBase, width: 64, textAlign: 'right', flexShrink: 0 }}
        />
        <span style={{ fontSize: 11, color: line > 0 ? '#475569' : '#d1d5db', width: 70, textAlign: 'right', flexShrink: 0 }}>
          {line > 0 ? `${fmt(line)} €` : '—'}
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Breadcrumb bar */}
      <div className="cc-breadcrumb" style={{
        background: '#fff', borderBottom: '1px solid #e5e7eb',
        padding: '0 32px', display: 'flex', alignItems: 'center', gap: 8, height: 44,
      }}>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>OfficeLabs Co</span>
        <span style={{ color: '#d1d5db', fontSize: 14 }}>›</span>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>Калкулатор на себестойност</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: saveState === 'error' ? '#dc2626' : '#9ca3af' }}>
          {saveState !== 'idle' && SAVE_LABEL[saveState]}
        </div>
      </div>

      <div className="cc-section" style={{ padding: '28px 32px 0' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-.4px' }}>
            Калкулатор на себестойност
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Задай цени на материали и обков → добави модул → въведи количества → цената излиза автоматично
          </p>
        </div>

        {/* Summary stats */}
        <div className="cc-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Модули', value: String(state.modules.length) },
            { label: 'Обща себестойност', value: `${fmt(grandCost)} €` },
            { label: 'Обща продажна цена', value: `${fmt(grandSale)} €` },
            { label: 'Надценка / ДДС', value: `${state.markup}% / ${state.vat}%` },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>{s.label}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#0f172a', marginTop: 3 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Price list: materials + hardware ── */}
      <div className="cc-section" style={{ padding: '0 32px 24px' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Ценоразпис</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Запазва се автоматично</span>
        </div>
        <div className="cc-pricelist-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderTop: '3px solid #3b82f6', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Материали</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '.1em', marginTop: 1 }}>ПО СЕРИИ / ЦВЯТ · ЦЕНА НА М²</div>
            </div>
            <div style={{ padding: '8px 14px 14px' }}>
              {materials.map(item => <PriceRow key={item.id} item={item} />)}
              <button onClick={() => addPriceItem('material')} style={addBtnStyle}>+ Добави материал</button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderTop: '3px solid #f59e0b', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div style={{ padding: '11px 14px 9px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>Обков и труд</div>
              <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '.1em', marginTop: 1 }}>ЦЕНА ЗА ЕДИНИЦА</div>
            </div>
            <div style={{ padding: '8px 14px 14px' }}>
              {hardware.map(item => <PriceRow key={item.id} item={item} />)}
              <button onClick={() => addPriceItem('hardware')} style={addBtnStyle}>+ Добави позиция</button>
            </div>
          </div>

        </div>

        {/* Markup / VAT */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Надценка</span>
            <input
              type="number" step="any"
              value={state.markup}
              onChange={e => commit(prev => ({ ...prev, markup: parseFloat(e.target.value) || 0 }))}
              style={{ ...inputBase, width: 64, textAlign: 'right' }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>%</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>ДДС</span>
            <input
              type="number" step="any"
              value={state.vat}
              onChange={e => commit(prev => ({ ...prev, vat: parseFloat(e.target.value) || 0 }))}
              style={{ ...inputBase, width: 64, textAlign: 'right' }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>%</span>
          </div>
        </div>
      </div>

      {/* ── Modules ── */}
      <div className="cc-section" style={{ padding: '0 32px 60px' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Модули (мебели)</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{state.modules.length} бр.</span>
          <button onClick={addModule} style={{ ...addBtnStyle, marginLeft: 'auto', width: 'auto', padding: '7px 16px', background: '#111827', color: '#fff', border: 'none' }}>
            + Нов модул
          </button>
        </div>

        {state.modules.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Няма добавени модули. Натисни &quot;+ Нов модул&quot;, за да добавиш първата мебел за сметка.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {state.modules.map(m => {
            const isOpen = expanded.has(m.id);
            const cost = moduleCost(m);
            const sale = moduleSale(m);
            const final = moduleFinal(m);
            return (
              <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }} onClick={() => toggleExpand(m.id)}>
                  <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: '#94a3b8', fontSize: 12 }}>▶</span>
                  <input
                    value={m.name}
                    onChange={e => updateModuleName(m.id, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    style={{ ...inputBase, flex: 1, minWidth: 120, fontWeight: 700, fontSize: 14, background: '#fff', border: '1px solid transparent' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; }}
                  />
                  <div className="cc-module-totals" style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <span style={{ color: '#94a3b8' }}>Себестойност <b style={{ color: '#0f172a' }}>{fmt(cost)} €</b></span>
                    <span style={{ color: '#94a3b8' }}>Продажна <b style={{ color: '#0f172a' }}>{fmt(sale)} €</b></span>
                    <span style={{ color: '#94a3b8' }}>С ДДС <b style={{ color: '#16a34a' }}>{fmt(final)} €</b></span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); duplicateModule(m); }}
                    title="Дублирай"
                    style={{ width: 26, height: 26, border: '1px solid #e2e8f0', background: '#fff', borderRadius: 6, cursor: 'pointer', color: '#64748b', fontSize: 12, flexShrink: 0 }}
                  >⧉</button>
                  <button
                    onClick={e => { e.stopPropagation(); removeModule(m.id); }}
                    title="Изтрий модул"
                    style={{ width: 26, height: 26, border: 'none', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#cbd5e1', fontSize: 15, flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }}
                  >×</button>
                </div>

                {isOpen && (
                  <div className="cc-module-body" style={{ borderTop: '1px solid #f1f5f9', padding: '12px 14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Материали</div>
                      {materials.map(item => <QtyRow key={item.id} m={m} item={item} />)}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Обков и труд</div>
                      {hardware.map(item => <QtyRow key={item.id} m={m} item={item} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        input[type=number]::-webkit-inner-spin-button { opacity: .5; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        @media (max-width: 900px) {
          .cc-breadcrumb { padding: 0 16px !important; }
          .cc-section { padding-left: 16px !important; padding-right: 16px !important; }
          .cc-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cc-pricelist-grid { grid-template-columns: 1fr !important; }
          .cc-module-body { grid-template-columns: 1fr !important; }
          .cc-module-totals { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const addBtnStyle: React.CSSProperties = {
  width: '100%', marginTop: 6, padding: '8px 10px', border: '1px dashed #cbd5e1',
  borderRadius: 8, background: 'transparent', color: '#64748b', fontSize: 12.5,
  fontWeight: 600, cursor: 'pointer',
};
