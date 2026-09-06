'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { reconcileModules, type ModuleSeed } from '@/lib/calculator-modules';

type Category = 'material' | 'hardware';
type Portion = 'whole' | 'half';
type CostItem = {
  id: string; name: string; unit: string; category: Category;
  price?: number;       // hardware: price per unit
  priceWhole?: number;  // material: price for a whole sheet
  priceHalf?: number;   // material: price for a half sheet
  edgePrice?: number;   // material: price per meter of the matching кант (edge strip)
};
type MaterialPick = { portion: Portion; qty: number; edgeMeters?: number };
type ModuleRow = {
  id: string; name: string;
  qty: Record<string, number>;             // hardware: itemId -> quantity
  materials: Record<string, MaterialPick>;  // materials: itemId -> {portion, qty}
  productId?: number; colorName?: string; seriesName?: string; categoryName?: string;
};
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
type CalcState = { priceList: CostItem[]; modules: ModuleRow[]; markup: number; vat: number };

const uid = () => Math.random().toString(36).slice(2, 10);
const OTHER_GROUP = 'Други';
// Matched by name (not id) against the hardware price list — this is the one
// "Кантиране" labor line whose €/m rate gets combined with each material's own
// кант €/m whenever edge-banding meters are entered on that material.
const KANTIRANE_NAME = 'кантиране';

const HARDWARE_DEFAULTS: [string, string][] = [
  ['Рафтоносачи', 'бр.'],
  ['Кантиране', 'м'],
  ['Рязане на детайл', 'бр.'],
  ['Разпробиване', 'бр.'],
  ['Панти', 'бр.'],
  ['Панта 110°', 'бр.'],
  ['Панта за стъкло', 'бр.'],
  ['Минификс', 'бр.'],
  ['Дибли', 'бр.'],
  ['Мебелни крака', 'бр.'],
  ['Мебелни колела', 'бр.'],
  ['Механизъм чекмедже', 'к-т'],
  ['Стъклени врати', 'бр.'],
  ['Пуш механизъм', 'бр.'],
  ['Дръжки', 'бр.'],
  ['Проект', 'м²'],
  ['Труд / монтаж', 'час'],
  ['Опаковане', 'бр.'],
  ['Гръб (HDF)', 'м²'],
];

function defaultPriceList(seriesMaterials: Record<string, string[]>): CostItem[] {
  const items: CostItem[] = [];
  for (const [series, mats] of Object.entries(seriesMaterials)) {
    for (const m of mats) {
      if (m && m.trim()) items.push({ id: uid(), name: `${series} — ${m.trim()}`, unit: 'плоча', priceWhole: 0, priceHalf: 0, edgePrice: 0, category: 'material' });
    }
  }
  if (items.length === 0) {
    items.push({ id: uid(), name: 'ПДЧ 18 mm, клас Е1', unit: 'плоча', priceWhole: 0, priceHalf: 0, edgePrice: 0, category: 'material' });
  }
  for (const [name, unit] of HARDWARE_DEFAULTS) {
    items.push({ id: uid(), name, unit, price: 0, category: 'hardware' });
  }
  return items;
}

function normalizeModule(m: Partial<ModuleRow> & { id: string; name: string }): ModuleRow {
  return {
    id: m.id, name: m.name, productId: m.productId, colorName: m.colorName, seriesName: m.seriesName, categoryName: m.categoryName,
    qty: m.qty ?? {}, materials: m.materials ?? {},
  };
}

function fmt(n: number): string {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const inputBase: React.CSSProperties = {
  padding: '6px 9px', border: '1px solid #e2e8f0', borderRadius: 6,
  fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fafafa',
  color: '#111827',
};

const addBtnStyle: React.CSSProperties = {
  width: '100%', marginTop: 6, padding: '8px 10px', border: '1px dashed #cbd5e1',
  borderRadius: 8, background: 'transparent', color: '#64748b', fontSize: 12.5,
  fontWeight: 600, cursor: 'pointer',
};

const removeBtnStyle: React.CSSProperties = {
  width: 24, height: 24, flexShrink: 0, border: 'none', background: 'transparent',
  color: '#cbd5e1', cursor: 'pointer', fontSize: 15, lineHeight: 1, borderRadius: 5,
};
function onRemoveBtnEnter(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }
function onRemoveBtnLeave(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#cbd5e1'; }

// ── All the pieces below are declared OUTSIDE CostCalculator on purpose: a
// component defined inside another component's body gets a brand new function
// identity on every parent re-render, so React unmounts+remounts its whole
// subtree (and any input inside loses focus) on every keystroke. Data flows
// in purely through props instead of closures.

// Free-typing numeric input: keeps its own text while focused so a decimal point
// or a trailing "," (bg keyboards) never gets snapped away mid-type by the
// parent re-rendering with the already-parsed number.
function NumberField({
  value, onChange, placeholder = '0', style,
}: { value: number; onChange: (n: number) => void; placeholder?: string; style?: React.CSSProperties }) {
  const [text, setText] = useState(value === 0 ? '' : String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(value === 0 ? '' : String(value));
  }, [value]);

  return (
    <input
      type="text" inputMode="decimal"
      value={text}
      placeholder={placeholder}
      style={style}
      onFocus={() => { focused.current = true; }}
      onBlur={() => { focused.current = false; setText(value === 0 ? '' : String(value)); }}
      onChange={e => {
        const raw = e.target.value;
        if (!/^-?\d*[.,]?\d*$/.test(raw)) return;
        setText(raw);
        const parsed = parseFloat(raw.replace(',', '.'));
        onChange(Number.isFinite(parsed) ? parsed : 0);
      }}
    />
  );
}

function PriceRow({ item, onUpdate, onRemove }: {
  item: CostItem;
  onUpdate: (patch: Partial<CostItem>) => void;
  onRemove: () => void;
}) {
  if (item.category === 'material') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', flexWrap: 'wrap' }}>
        <input
          value={item.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Име"
          style={{ ...inputBase, flex: 1, minWidth: 200 }}
        />
        <input
          value={item.unit}
          onChange={e => onUpdate({ unit: e.target.value })}
          placeholder="ед."
          style={{ ...inputBase, width: 64, textAlign: 'center', flexShrink: 0 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Цяла</span>
          <NumberField
            value={item.priceWhole ?? 0}
            onChange={n => onUpdate({ priceWhole: n })}
            style={{ ...inputBase, width: 68, textAlign: 'right' }}
          />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>€</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Полов.</span>
          <NumberField
            value={item.priceHalf ?? 0}
            onChange={n => onUpdate({ priceHalf: n })}
            style={{ ...inputBase, width: 68, textAlign: 'right' }}
          />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>€</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Кант/м</span>
          <NumberField
            value={item.edgePrice ?? 0}
            onChange={n => onUpdate({ edgePrice: n })}
            style={{ ...inputBase, width: 68, textAlign: 'right' }}
          />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>€</span>
        </div>
        <button onClick={onRemove} title="Изтрий" style={removeBtnStyle} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave}>×</button>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0' }}>
      <input
        value={item.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Име"
        style={{ ...inputBase, flex: 1, minWidth: 0 }}
      />
      <input
        value={item.unit}
        onChange={e => onUpdate({ unit: e.target.value })}
        placeholder="ед."
        style={{ ...inputBase, width: 52, textAlign: 'center', flexShrink: 0 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <NumberField
          value={item.price ?? 0}
          onChange={n => onUpdate({ price: n })}
          style={{ ...inputBase, width: 74, textAlign: 'right' }}
        />
        <span style={{ fontSize: 12, color: '#94a3b8' }}>€</span>
      </div>
      <button onClick={onRemove} title="Изтрий" style={removeBtnStyle} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave}>×</button>
    </div>
  );
}

function QtyRow({ item, qty, onChange, onRemove }: {
  item: CostItem; qty: number; onChange: (n: number) => void; onRemove: () => void;
}) {
  const line = qty * (item.price ?? 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
      <span style={{ flex: 1, fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
        {item.name || <em style={{ color: '#cbd5e1' }}>—</em>}
      </span>
      <span style={{ fontSize: 10, color: '#94a3b8', width: 26, flexShrink: 0 }}>{item.unit}</span>
      <NumberField value={qty} onChange={onChange} style={{ ...inputBase, width: 64, textAlign: 'right', flexShrink: 0 }} />
      <span style={{ fontSize: 11, color: line > 0 ? '#475569' : '#d1d5db', width: 62, textAlign: 'right', flexShrink: 0 }}>
        {line > 0 ? `${fmt(line)} €` : '—'}
      </span>
      <button onClick={onRemove} title="Премахни позицията" style={{ ...removeBtnStyle, width: 20, height: 20, fontSize: 13 }} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave}>×</button>
    </div>
  );
}

function MaterialQtyRow({ item, selection, kantiraneLaborPrice, onChange, onRemove }: {
  item: CostItem; selection: MaterialPick; kantiraneLaborPrice: number;
  onChange: (patch: Partial<MaterialPick>) => void; onRemove: () => void;
}) {
  const sheetPrice = selection.portion === 'half' ? (item.priceHalf ?? 0) : (item.priceWhole ?? 0);
  const edgeMeters = selection.edgeMeters ?? 0;
  const sheetCost = selection.qty * sheetPrice;
  const edgeCost = edgeMeters * ((item.edgePrice ?? 0) + kantiraneLaborPrice);
  const line = sheetCost + edgeCost;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', flexWrap: 'wrap' }}>
      <span style={{ flex: 1, minWidth: 140, fontSize: 12.5, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
        {item.name || <em style={{ color: '#cbd5e1' }}>—</em>}
      </span>
      <select
        value={selection.portion}
        onChange={e => onChange({ portion: e.target.value as Portion })}
        style={{ ...inputBase, width: 88, flexShrink: 0, padding: '5px 4px', fontSize: 11.5 }}
      >
        <option value="whole">Цяла</option>
        <option value="half">Половин</option>
      </select>
      <NumberField value={selection.qty} onChange={n => onChange({ qty: n })} style={{ ...inputBase, width: 56, textAlign: 'right', flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>Кант м</span>
        <NumberField value={edgeMeters} onChange={n => onChange({ edgeMeters: n })} style={{ ...inputBase, width: 52, textAlign: 'right' }} />
      </div>
      <span style={{ fontSize: 11, color: line > 0 ? '#475569' : '#d1d5db', width: 62, textAlign: 'right', flexShrink: 0 }}>
        {line > 0 ? `${fmt(line)} €` : '—'}
      </span>
      <button onClick={onRemove} title="Премахни позицията" style={{ ...removeBtnStyle, width: 20, height: 20, fontSize: 13 }} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave}>×</button>
    </div>
  );
}

function ModuleBody({
  m, materials, hardware, priceById, onAddItem, onQtyChange, onMaterialChange, onRemoveItem,
}: {
  m: ModuleRow; materials: CostItem[]; hardware: CostItem[]; priceById: Record<string, CostItem>;
  onAddItem: (itemId: string) => void;
  onQtyChange: (itemId: string, qty: number) => void;
  onMaterialChange: (itemId: string, patch: Partial<MaterialPick>) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const addedMaterials = Object.keys(m.materials).map(id => priceById[id]).filter((i): i is CostItem => !!i);
  const addedHardware = Object.keys(m.qty).map(id => priceById[id]).filter((i): i is CostItem => !!i);
  const availableMaterials = materials.filter(i => !(i.id in m.materials));
  const availableHardware = hardware.filter(i => !(i.id in m.qty));
  const kantiraneLaborPrice = hardware.find(h => h.name.trim().toLowerCase() === KANTIRANE_NAME)?.price ?? 0;

  return (
    <div className="cc-module-body" style={{ borderTop: '1px solid #f1f5f9', padding: '12px 14px 16px' }}>
      {addedMaterials.length === 0 && addedHardware.length === 0 && (
        <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 10px' }}>Няма добавени позиции — избери отдолу какво влиза в тази мебел.</p>
      )}
      {addedMaterials.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Материали</div>
          {addedMaterials.map(item => (
            <MaterialQtyRow
              key={item.id}
              item={item}
              selection={m.materials[item.id] ?? { portion: 'whole', qty: 0 }}
              kantiraneLaborPrice={kantiraneLaborPrice}
              onChange={patch => onMaterialChange(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
      {addedHardware.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Обков и труд</div>
          {addedHardware.map(item => (
            <QtyRow
              key={item.id}
              item={item}
              qty={m.qty[item.id] || 0}
              onChange={n => onQtyChange(item.id, n)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
      {(availableMaterials.length > 0 || availableHardware.length > 0) && (
        <select
          value=""
          onChange={e => onAddItem(e.target.value)}
          style={{ ...inputBase, width: '100%', marginTop: 4 }}
        >
          <option value="">+ Добави позиция…</option>
          {availableMaterials.length > 0 && (
            <optgroup label="Материали">
              {availableMaterials.map(i => <option key={i.id} value={i.id}>{i.name || '(без име)'}</option>)}
            </optgroup>
          )}
          {availableHardware.length > 0 && (
            <optgroup label="Обков и труд">
              {availableHardware.map(i => <option key={i.id} value={i.id}>{i.name || '(без име)'}</option>)}
            </optgroup>
          )}
        </select>
      )}
    </div>
  );
}

function CollapsibleCard({
  title, sub, accent, open, onToggle, children,
}: { title: string; sub: string; accent: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', borderTop: `3px solid ${accent}`, boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{ padding: '11px 14px 9px', borderBottom: open ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{title}</div>
          <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '.1em', marginTop: 1 }}>{sub}</div>
        </div>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s', color: '#94a3b8', fontSize: 12 }}>▾</span>
      </div>
      {open && <div style={{ padding: '8px 14px 14px' }}>{children}</div>}
    </div>
  );
}

export default function CostCalculator({
  initial,
  seriesMaterials,
  defaultVat,
  moduleSeeds,
}: {
  initial: Partial<CalcState> | null;
  seriesMaterials: Record<string, string[]>;
  defaultVat: number;
  moduleSeeds: ModuleSeed[];
}) {
  const [state, setState] = useState<CalcState>(() => ({
    priceList: initial?.priceList?.length ? initial.priceList : defaultPriceList(seriesMaterials),
    modules: (initial?.modules ?? []).map(normalizeModule),
    markup: typeof initial?.markup === 'number' ? initial.markup : 30,
    vat: typeof initial?.vat === 'number' ? initial.vat : defaultVat,
  }));
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [hardwareOpen, setHardwareOpen] = useState(false);
  const [filterSeries, setFilterSeries] = useState('all');
  const [moduleSearch, setModuleSearch] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const didInit = useRef(false);

  // UI-only collapse preference (not synced to DB — per-device convenience)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('ol_cost_calc_ui');
      if (cached) {
        const p = JSON.parse(cached);
        if (typeof p.materialsOpen === 'boolean') setMaterialsOpen(p.materialsOpen);
        if (typeof p.hardwareOpen === 'boolean') setHardwareOpen(p.hardwareOpen);
      }
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem('ol_cost_calc_ui', JSON.stringify({ materialsOpen, hardwareOpen })); } catch { /* ignore */ }
  }, [materialsOpen, hardwareOpen]);

  // One-time mount fallback: the server already seeds product module cards whenever
  // it has a DB row (see app/calculator/page.tsx). This only covers the rare case
  // where the DB has nothing yet but this browser has a localStorage cache — then we
  // also reconcile products here, since the server couldn't in that case.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (initial) return;

    let base = state;
    try {
      const cached = localStorage.getItem('ol_cost_calculator');
      if (cached) {
        const parsed = JSON.parse(cached) as Partial<CalcState>;
        base = {
          priceList: parsed.priceList ?? base.priceList,
          modules: (parsed.modules ?? base.modules).map(normalizeModule),
          markup: typeof parsed.markup === 'number' ? parsed.markup : base.markup,
          vat: typeof parsed.vat === 'number' ? parsed.vat : base.vat,
        };
      }
    } catch { /* ignore */ }

    if (moduleSeeds.length > 0) {
      const { modules, changed } = reconcileModules(base.modules, moduleSeeds);
      if (changed) base = { ...base, modules: modules.map(normalizeModule) };
    }

    if (base !== state) {
      setState(base);
      try { localStorage.setItem('ol_cost_calculator', JSON.stringify(base)); } catch { /* ignore */ }
      fetch('/api/table/cost-calculator', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(base),
      }).catch(() => {});
    }
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
      priceList: [
        ...prev.priceList,
        category === 'material'
          ? { id: uid(), name: '', unit: 'плоча', priceWhole: 0, priceHalf: 0, edgePrice: 0, category }
          : { id: uid(), name: '', unit: 'бр.', price: 0, category },
      ],
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
        if (!(id in m.qty) && !(id in m.materials)) return m;
        const qty = { ...m.qty }; delete qty[id];
        const materials = { ...m.materials }; delete materials[id];
        return { ...m, qty, materials };
      }),
    }));
  }

  // ── Module mutators ──────────────────────────────────────────────────
  function addModule() {
    const id = uid();
    commit(prev => ({ ...prev, modules: [...prev.modules, normalizeModule({ id, name: `Модул ${prev.modules.length + 1}` })] }));
    setExpanded(e => new Set(e).add(id));
  }
  function duplicateModule(src: ModuleRow) {
    const id = uid();
    commit(prev => ({ ...prev, modules: [...prev.modules, { ...src, id, productId: undefined, name: src.name + ' (копие)' }] }));
    setExpanded(e => new Set(e).add(id));
  }
  function removeModule(id: string) {
    commit(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== id) }));
  }
  function updateModuleName(id: string, name: string) {
    commit(prev => ({ ...prev, modules: prev.modules.map(m => m.id === id ? { ...m, name } : m) }));
  }
  // Hardware/обков (m.qty) is shared across a product's color variants — enter it once,
  // it applies to every color. Materials (m.materials) stay per-color on purpose, since
  // that's exactly the thing that differs between color variants.
  function colorSiblingIds(modules: ModuleRow[], moduleId: string): string[] {
    const target = modules.find(m => m.id === moduleId);
    if (!target || target.productId == null) return [];
    return modules.filter(m => m.id !== moduleId && m.productId === target.productId).map(m => m.id);
  }

  function updateModuleQty(moduleId: string, itemId: string, qty: number) {
    commit(prev => {
      const siblings = new Set(colorSiblingIds(prev.modules, moduleId));
      return {
        ...prev,
        modules: prev.modules.map(m => (m.id === moduleId || siblings.has(m.id))
          ? { ...m, qty: { ...m.qty, [itemId]: qty } }
          : m),
      };
    });
  }
  function updateModuleMaterial(moduleId: string, itemId: string, patch: Partial<MaterialPick>) {
    commit(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId
        ? { ...m, materials: { ...m.materials, [itemId]: { ...(m.materials[itemId] ?? { portion: 'whole', qty: 1 }), ...patch } } }
        : m),
    }));
  }
  function addModuleItem(moduleId: string, itemId: string) {
    if (!itemId) return;
    const item = priceById[itemId];
    if (!item) return;
    if (item.category === 'material') {
      commit(prev => ({ ...prev, modules: prev.modules.map(m => m.id === moduleId ? { ...m, materials: { ...m.materials, [itemId]: { portion: 'whole', qty: 1 } } } : m) }));
    } else {
      commit(prev => {
        const siblings = new Set(colorSiblingIds(prev.modules, moduleId));
        return {
          ...prev,
          modules: prev.modules.map(m => (m.id === moduleId || siblings.has(m.id))
            ? { ...m, qty: { ...m.qty, [itemId]: 1 } }
            : m),
        };
      });
    }
  }
  function removeModuleItem(moduleId: string, itemId: string) {
    const isHardware = priceById[itemId]?.category === 'hardware';
    commit(prev => {
      const siblings = isHardware ? new Set(colorSiblingIds(prev.modules, moduleId)) : new Set<string>();
      return {
        ...prev,
        modules: prev.modules.map(m => {
          if (m.id === moduleId) {
            const qty = { ...m.qty }; delete qty[itemId];
            const materials = { ...m.materials }; delete materials[itemId];
            return { ...m, qty, materials };
          }
          if (siblings.has(m.id)) {
            const qty = { ...m.qty }; delete qty[itemId];
            return { ...m, qty };
          }
          return m;
        }),
      };
    });
  }
  function toggleExpand(id: string) {
    setExpanded(e => { const n = new Set(e); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const priceById = useMemo(() => {
    const map: Record<string, CostItem> = {};
    for (const it of state.priceList) map[it.id] = it;
    return map;
  }, [state.priceList]);

  const materials = state.priceList.filter(i => i.category === 'material');
  const hardware = state.priceList.filter(i => i.category === 'hardware');
  const kantiraneLaborPrice = hardware.find(h => h.name.trim().toLowerCase() === KANTIRANE_NAME)?.price ?? 0;

  function moduleCost(m: ModuleRow): number {
    const hardwareCost = Object.entries(m.qty).reduce((sum, [itemId, q]) => sum + (priceById[itemId]?.price ?? 0) * (q || 0), 0);
    const materialCost = Object.entries(m.materials).reduce((sum, [itemId, sel]) => {
      const item = priceById[itemId];
      if (!item) return sum;
      const sheetPrice = sel.portion === 'half' ? (item.priceHalf ?? 0) : (item.priceWhole ?? 0);
      const sheetCost = sheetPrice * (sel.qty || 0);
      const edgeMeters = sel.edgeMeters || 0;
      const edgeCost = edgeMeters * ((item.edgePrice ?? 0) + kantiraneLaborPrice);
      return sum + sheetCost + edgeCost;
    }, 0);
    return hardwareCost + materialCost;
  }
  function moduleSale(m: ModuleRow): number { return moduleCost(m) * (1 + state.markup / 100); }
  function moduleFinal(m: ModuleRow): number { return moduleSale(m) * (1 + state.vat / 100); }

  const allSeriesNames = useMemo(() => {
    const set = new Set(state.modules.map(m => m.seriesName || OTHER_GROUP));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'bg'));
  }, [state.modules]);

  const filteredModules = useMemo(() => {
    let list = state.modules;
    if (filterSeries !== 'all') list = list.filter(m => (m.seriesName || OTHER_GROUP) === filterSeries);
    if (moduleSearch.trim()) {
      const q = moduleSearch.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || (m.categoryName ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [state.modules, filterSeries, moduleSearch]);

  const SAVE_LABEL: Record<SaveState, string> = {
    idle: '', saving: 'Запазване…', saved: 'Запазено ✓', error: 'Грешка при запис',
  };

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
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-.4px' }}>
          Калкулатор на себестойност
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 20px' }}>
          Задай цени на материали и обков → отвори мебел → избери какво влиза в нея → цената излиза автоматично
        </p>
      </div>

      {/* ── Price list: materials + hardware (collapsible) ── */}
      <div className="cc-section" style={{ padding: '0 32px 24px' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Ценоразпис</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Запазва се автоматично</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>

          <CollapsibleCard
            title="Материали" sub="ПО СЕРИИ / ЦВЯТ · ЦЯЛА / ПОЛОВИН ПЛОЧА + КАНТ НА МЕТЪР" accent="#3b82f6"
            open={materialsOpen} onToggle={() => setMaterialsOpen(o => !o)}
          >
            {materials.map(item => (
              <PriceRow
                key={item.id}
                item={item}
                onUpdate={patch => updatePriceItem(item.id, patch)}
                onRemove={() => removePriceItem(item.id)}
              />
            ))}
            <button onClick={() => addPriceItem('material')} style={addBtnStyle}>+ Добави материал</button>
          </CollapsibleCard>

          <CollapsibleCard
            title="Обков и труд" sub="ЦЕНА ЗА ЕДИНИЦА" accent="#f59e0b"
            open={hardwareOpen} onToggle={() => setHardwareOpen(o => !o)}
          >
            {hardware.map(item => (
              <PriceRow
                key={item.id}
                item={item}
                onUpdate={patch => updatePriceItem(item.id, patch)}
                onRemove={() => removePriceItem(item.id)}
              />
            ))}
            <button onClick={() => addPriceItem('hardware')} style={addBtnStyle}>+ Добави позиция</button>
          </CollapsibleCard>

        </div>

        {/* Markup / VAT */}
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>Надценка</span>
            <NumberField
              value={state.markup}
              onChange={n => commit(prev => ({ ...prev, markup: n }))}
              style={{ ...inputBase, width: 64, textAlign: 'right' }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>%</span>
          </div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>ДДС</span>
            <NumberField
              value={state.vat}
              onChange={n => commit(prev => ({ ...prev, vat: n }))}
              style={{ ...inputBase, width: 64, textAlign: 'right' }}
            />
            <span style={{ fontSize: 12, color: '#94a3b8' }}>%</span>
          </div>
        </div>
      </div>

      {/* ── Modules ── */}
      <div className="cc-section" style={{ padding: '0 32px 60px' }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Модули (мебели)</h2>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>{filteredModules.length} / {state.modules.length}</span>
          <button onClick={() => setExpanded(new Set(filteredModules.map(m => m.id)))} style={{ ...addBtnStyle, width: 'auto', marginTop: 0, padding: '6px 12px' }}>Разгъни всички</button>
          <button onClick={() => setExpanded(new Set())} style={{ ...addBtnStyle, width: 'auto', marginTop: 0, padding: '6px 12px' }}>Свий всички</button>
          <button onClick={addModule} style={{ ...addBtnStyle, marginLeft: 'auto', width: 'auto', marginTop: 0, padding: '7px 16px', background: '#111827', color: '#fff', border: 'none' }}>
            + Нов модул
          </button>
        </div>

        <div className="cc-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: 8, padding: 3, gap: 2, flexWrap: 'wrap' }}>
            {['all', ...allSeriesNames].map(s => {
              const active = filterSeries === s;
              return (
                <button key={s} onClick={() => setFilterSeries(s)} style={{
                  padding: '5px 14px', border: 'none', borderRadius: 6, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', background: active ? '#fff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b', boxShadow: active ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                }}>
                  {s === 'all' ? 'Всички' : s}
                </button>
              );
            })}
          </div>
          <input
            value={moduleSearch}
            onChange={e => setModuleSearch(e.target.value)}
            placeholder="Търси модул…"
            style={{ ...inputBase, minWidth: 200 }}
          />
        </div>

        {filteredModules.length === 0 && (
          <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Няма модули за показване.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredModules.map(m => {
            const isOpen = expanded.has(m.id);
            const cost = moduleCost(m);
            const sale = moduleSale(m);
            const final = moduleFinal(m);
            return (
              <div key={m.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,.06)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }} onClick={() => toggleExpand(m.id)}>
                  <span style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', color: '#94a3b8', fontSize: 12 }}>▶</span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <input
                      value={m.name}
                      onChange={e => updateModuleName(m.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ ...inputBase, width: '100%', fontWeight: 700, fontSize: 14, background: '#fff', border: '1px solid transparent', padding: '4px 6px' }}
                      onFocus={e => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; }}
                    />
                    {(m.seriesName || m.categoryName) && (
                      <div style={{ fontSize: 10.5, color: '#94a3b8', padding: '0 6px', marginTop: 1 }}>
                        {[m.seriesName, m.categoryName].filter(Boolean).join(' · ')}
                      </div>
                    )}
                  </div>
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
                    onMouseEnter={onRemoveBtnEnter}
                    onMouseLeave={onRemoveBtnLeave}
                  >×</button>
                </div>

                {isOpen && (
                  <ModuleBody
                    m={m}
                    materials={materials}
                    hardware={hardware}
                    priceById={priceById}
                    onAddItem={itemId => addModuleItem(m.id, itemId)}
                    onQtyChange={(itemId, qty) => updateModuleQty(m.id, itemId, qty)}
                    onMaterialChange={(itemId, patch) => updateModuleMaterial(m.id, itemId, patch)}
                    onRemoveItem={itemId => removeModuleItem(m.id, itemId)}
                  />
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
          .cc-module-totals { display: none !important; }
        }
      `}</style>
    </div>
  );
}
