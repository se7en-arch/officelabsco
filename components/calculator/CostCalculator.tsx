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

// ── Shared visual tokens ────────────────────────────────────────────────────
const COLORS = {
  bg: '#f1f5f9', card: '#fff', border: '#e2e8f0', borderSoft: '#f1f5f9',
  text: '#0f172a', text2: '#374151', muted: '#64748b', faint: '#94a3b8', ghost: '#cbd5e1',
  blue: '#3b82f6', amber: '#f59e0b', green: '#16a34a', red: '#dc2626', redBg: '#fee2e2',
};

// Same per-series accent palette used on the public series (gallery) pages —
// reused here so a module card visually ties back to its series at a glance.
const SERIES_ACCENTS: Record<string, string> = {
  astra: '#3b82f6', terra: '#7A9E87', nova: '#8a6d4f', loft: '#2D5A45',
};
function seriesAccent(name?: string): string {
  if (!name) return COLORS.ghost;
  return SERIES_ACCENTS[name.trim().toLowerCase()] ?? COLORS.blue;
}

const inputBase: React.CSSProperties = {
  padding: '7px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 7,
  fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fafbfc',
  color: COLORS.text, transition: 'border-color .15s, background .15s',
};

const cardStyle: React.CSSProperties = {
  background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`,
  boxShadow: '0 1px 3px rgba(15,23,42,.05)',
};

const addBtnStyle: React.CSSProperties = {
  width: '100%', marginTop: 8, padding: '9px 10px', border: `1.5px dashed ${COLORS.ghost}`,
  borderRadius: 9, background: 'transparent', color: COLORS.muted, fontSize: 12.5,
  fontWeight: 700, cursor: 'pointer', transition: 'border-color .15s, color .15s, background .15s',
};
function onAddBtnEnter(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.color = COLORS.blue; e.currentTarget.style.background = '#eff6ff'; }
function onAddBtnLeave(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.borderColor = COLORS.ghost; e.currentTarget.style.color = COLORS.muted; e.currentTarget.style.background = 'transparent'; }

const pillBtnStyle: React.CSSProperties = {
  padding: '7px 13px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
  border: `1px solid ${COLORS.border}`, background: COLORS.card, color: COLORS.muted,
};

const removeBtnStyle: React.CSSProperties = {
  width: 26, height: 26, flexShrink: 0, border: 'none', background: 'transparent',
  color: COLORS.ghost, cursor: 'pointer', fontSize: 16, lineHeight: 1, borderRadius: 7,
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .12s, color .12s',
};
function onRemoveBtnEnter(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = COLORS.redBg; e.currentTarget.style.color = COLORS.red; }
function onRemoveBtnLeave(e: React.MouseEvent<HTMLButtonElement>) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.ghost; }

function priceFieldFocus(e: React.FocusEvent<HTMLInputElement>) { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.background = '#fff'; }
function priceFieldBlur(e: React.FocusEvent<HTMLInputElement>) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = '#fafbfc'; }

// ── All the pieces below are declared OUTSIDE CostCalculator on purpose: a
// component defined inside another component's body gets a brand new function
// identity on every parent re-render, so React unmounts+remounts its whole
// subtree (and any input inside loses focus) on every keystroke. Data flows
// in purely through props instead of closures.

// Free-typing numeric input: keeps its own text while focused so a decimal point
// or a trailing "," (bg keyboards) never gets snapped away mid-type by the
// parent re-rendering with the already-parsed number.
function NumberField({
  value, onChange, placeholder = '0', style, className,
}: { value: number; onChange: (n: number) => void; placeholder?: string; style?: React.CSSProperties; className?: string }) {
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
      className={className}
      onFocus={e => { focused.current = true; priceFieldFocus(e); }}
      onBlur={e => { focused.current = false; setText(value === 0 ? '' : String(value)); priceFieldBlur(e); }}
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
      <div className="cc-price-row cc-price-row--material">
        <input
          value={item.name}
          onChange={e => onUpdate({ name: e.target.value })}
          placeholder="Име на материала"
          style={{ ...inputBase }}
          className="cc-price-row__name"
          onFocus={priceFieldFocus} onBlur={priceFieldBlur}
        />
        <input
          value={item.unit}
          onChange={e => onUpdate({ unit: e.target.value })}
          placeholder="ед."
          style={{ ...inputBase, textAlign: 'center' }}
          className="cc-price-row__unit"
          onFocus={priceFieldFocus} onBlur={priceFieldBlur}
        />
        <div className="cc-price-group">
          <span className="cc-price-group__label">Цяла</span>
          <NumberField value={item.priceWhole ?? 0} onChange={n => onUpdate({ priceWhole: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} />
          <span className="cc-price-group__unit">€</span>
        </div>
        <div className="cc-price-group">
          <span className="cc-price-group__label">Полов.</span>
          <NumberField value={item.priceHalf ?? 0} onChange={n => onUpdate({ priceHalf: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} />
          <span className="cc-price-group__unit">€</span>
        </div>
        <div className="cc-price-group">
          <span className="cc-price-group__label">Кант/м</span>
          <NumberField value={item.edgePrice ?? 0} onChange={n => onUpdate({ edgePrice: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} />
          <span className="cc-price-group__unit">€</span>
        </div>
        <button onClick={onRemove} title="Изтрий" style={removeBtnStyle} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave} className="cc-price-row__remove">×</button>
      </div>
    );
  }
  return (
    <div className="cc-price-row cc-price-row--hardware">
      <input
        value={item.name}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Име"
        style={{ ...inputBase }}
        className="cc-price-row__name"
        onFocus={priceFieldFocus} onBlur={priceFieldBlur}
      />
      <input
        value={item.unit}
        onChange={e => onUpdate({ unit: e.target.value })}
        placeholder="ед."
        style={{ ...inputBase, textAlign: 'center' }}
        className="cc-price-row__unit"
        onFocus={priceFieldFocus} onBlur={priceFieldBlur}
      />
      <div className="cc-price-group">
        <NumberField value={item.price ?? 0} onChange={n => onUpdate({ price: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} />
        <span className="cc-price-group__unit">€</span>
      </div>
      <button onClick={onRemove} title="Изтрий" style={removeBtnStyle} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave} className="cc-price-row__remove">×</button>
    </div>
  );
}

function QtyRow({ item, qty, onChange, onRemove }: {
  item: CostItem; qty: number; onChange: (n: number) => void; onRemove: () => void;
}) {
  const line = qty * (item.price ?? 0);
  return (
    <div className="cc-qty-row">
      <span className="cc-qty-row__name" title={item.name}>
        {item.name || <em style={{ color: COLORS.ghost, fontStyle: 'normal' }}>—</em>}
      </span>
      <span className="cc-qty-row__unit">{item.unit}</span>
      <NumberField value={qty} onChange={onChange} style={{ ...inputBase, width: '100%', textAlign: 'right' }} className="cc-qty-row__input" />
      <span className="cc-qty-row__total" style={{ color: line > 0 ? COLORS.text2 : COLORS.ghost }}>
        {line > 0 ? `${fmt(line)} €` : '—'}
      </span>
      <button onClick={onRemove} title="Премахни позицията" style={{ ...removeBtnStyle, width: 22, height: 22, fontSize: 14 }} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave} className="cc-qty-row__remove">×</button>
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
    <div className="cc-mat-row">
      <span className="cc-mat-row__name" title={item.name}>
        {item.name || <em style={{ color: COLORS.ghost, fontStyle: 'normal' }}>—</em>}
      </span>
      <select
        value={selection.portion}
        onChange={e => onChange({ portion: e.target.value as Portion })}
        style={{ ...inputBase, padding: '6px 6px', fontSize: 11.5 }}
        className="cc-mat-row__portion"
      >
        <option value="whole">Цяла</option>
        <option value="half">Половин</option>
      </select>
      <NumberField value={selection.qty} onChange={n => onChange({ qty: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} className="cc-mat-row__qty" />
      <div className="cc-price-group cc-mat-row__edge">
        <span className="cc-price-group__label">Кант м</span>
        <NumberField value={edgeMeters} onChange={n => onChange({ edgeMeters: n })} style={{ ...inputBase, width: '100%', textAlign: 'right' }} />
      </div>
      <span className="cc-mat-row__total" style={{ color: line > 0 ? COLORS.text2 : COLORS.ghost }}>
        {line > 0 ? `${fmt(line)} €` : '—'}
      </span>
      <button onClick={onRemove} title="Премахни позицията" style={{ ...removeBtnStyle, width: 22, height: 22, fontSize: 14 }} onMouseEnter={onRemoveBtnEnter} onMouseLeave={onRemoveBtnLeave} className="cc-mat-row__remove">×</button>
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
    <div className="cc-module-body">
      {addedMaterials.length === 0 && addedHardware.length === 0 && (
        <div className="cc-module-body__empty">Няма добавени позиции — избери отдолу какво влиза в тази мебел.</div>
      )}
      {addedMaterials.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="cc-module-body__label" style={{ color: COLORS.blue, background: `${COLORS.blue}12` }}>Материали</div>
          <div className="cc-module-body__rows">
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
        </div>
      )}
      {addedHardware.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="cc-module-body__label" style={{ color: COLORS.amber, background: `${COLORS.amber}14` }}>Обков и труд</div>
          <div className="cc-module-body__rows">
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
        </div>
      )}
      {(availableMaterials.length > 0 || availableHardware.length > 0) && (
        <select
          value=""
          onChange={e => onAddItem(e.target.value)}
          className="cc-module-add-select"
          style={{ ...inputBase, width: '100%', marginTop: 2 }}
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
    <div style={{ ...cardStyle, borderTop: `3px solid ${accent}`, overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        className="cc-collapsible__head"
        style={{ borderBottom: open ? `1px solid ${COLORS.borderSoft}` : 'none' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: COLORS.text }}>{title}</div>
          <div style={{ fontSize: 10, color: COLORS.faint, fontWeight: 600, letterSpacing: '.08em', marginTop: 2 }}>{sub}</div>
        </div>
        <span style={{
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s', color: COLORS.faint, fontSize: 12,
          width: 22, height: 22, borderRadius: 6, background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>▾</span>
      </div>
      {open && <div style={{ padding: '10px 16px 16px' }}>{children}</div>}
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
  const SAVE_DOT: Record<SaveState, string> = {
    idle: 'transparent', saving: COLORS.amber, saved: COLORS.green, error: COLORS.red,
  };

  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg, fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* Breadcrumb bar */}
      <div className="cc-breadcrumb">
        <span style={{ fontSize: 12, color: COLORS.faint }}>OfficeLabs Co</span>
        <span style={{ color: COLORS.ghost, fontSize: 14 }}>›</span>
        <span style={{ fontSize: 12, color: COLORS.text2, fontWeight: 600 }}>Калкулатор на себестойност</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: saveState === 'error' ? COLORS.red : COLORS.faint }}>
          {saveState !== 'idle' && (
            <>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: SAVE_DOT[saveState] }} />
              {SAVE_LABEL[saveState]}
            </>
          )}
        </div>
      </div>

      <div className="cc-section cc-header">
        <h1 style={{ fontSize: 25, fontWeight: 800, color: COLORS.text, margin: 0, letterSpacing: '-.4px' }}>
          Калкулатор на себестойност
        </h1>
        <p style={{ fontSize: 13, color: COLORS.muted, margin: '5px 0 0', lineHeight: 1.5 }}>
          Задай цени на материали и обков → отвори мебел → избери какво влиза в нея → цената излиза автоматично
        </p>
      </div>

      {/* ── Price list: materials + hardware (collapsible) ── */}
      <div className="cc-section" style={{ paddingBottom: 24 }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h2 className="cc-h2">Ценоразпис</h2>
          <span style={{ fontSize: 11.5, color: COLORS.faint }}>Запазва се автоматично</span>
        </div>
        <div className="cc-pricelist-col">

          <CollapsibleCard
            title="Материали" sub="ПО СЕРИИ / ЦВЯТ · ЦЯЛА / ПОЛОВИН ПЛОЧА + КАНТ НА МЕТЪР" accent={COLORS.blue}
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
            <button onClick={() => addPriceItem('material')} style={addBtnStyle} onMouseEnter={onAddBtnEnter} onMouseLeave={onAddBtnLeave}>+ Добави материал</button>
          </CollapsibleCard>

          <CollapsibleCard
            title="Обков и труд" sub="ЦЕНА ЗА ЕДИНИЦА" accent={COLORS.amber}
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
            <button onClick={() => addPriceItem('hardware')} style={addBtnStyle} onMouseEnter={onAddBtnEnter} onMouseLeave={onAddBtnLeave}>+ Добави позиция</button>
          </CollapsibleCard>

        </div>

        {/* Markup / VAT */}
        <div className="cc-rate-row">
          <div className="cc-rate-card">
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text2 }}>Надценка</span>
            <NumberField value={state.markup} onChange={n => commit(prev => ({ ...prev, markup: n }))} style={{ ...inputBase, width: 68, textAlign: 'right' }} />
            <span style={{ fontSize: 12, color: COLORS.faint }}>%</span>
          </div>
          <div className="cc-rate-card">
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text2 }}>ДДС</span>
            <NumberField value={state.vat} onChange={n => commit(prev => ({ ...prev, vat: n }))} style={{ ...inputBase, width: 68, textAlign: 'right' }} />
            <span style={{ fontSize: 12, color: COLORS.faint }}>%</span>
          </div>
        </div>
      </div>

      {/* ── Modules ── */}
      <div className="cc-section" style={{ paddingBottom: 60 }}>
        <div className="cc-modules-head">
          <h2 className="cc-h2">Модули (мебели)</h2>
          <span style={{ fontSize: 12, color: COLORS.faint }}>{filteredModules.length} / {state.modules.length}</span>
          <div className="cc-modules-head__actions">
            <button onClick={() => setExpanded(new Set(filteredModules.map(m => m.id)))} style={pillBtnStyle}>Разгъни всички</button>
            <button onClick={() => setExpanded(new Set())} style={pillBtnStyle}>Свий всички</button>
            <button onClick={addModule} style={{ ...pillBtnStyle, background: COLORS.text, color: '#fff', border: 'none', marginLeft: 'auto' }}>
              + Нов модул
            </button>
          </div>
        </div>

        <div className="cc-toolbar">
          <div className="cc-series-tabs">
            {['all', ...allSeriesNames].map(s => {
              const active = filterSeries === s;
              return (
                <button key={s} onClick={() => setFilterSeries(s)} style={{
                  padding: '6px 14px', border: 'none', borderRadius: 7, fontSize: 12,
                  fontWeight: 600, cursor: 'pointer', background: active ? '#fff' : 'transparent',
                  color: active ? COLORS.text : COLORS.muted, boxShadow: active ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
                  whiteSpace: 'nowrap', transition: 'background .15s, color .15s',
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
            style={{ ...inputBase, flex: 1, minWidth: 160 }}
            onFocus={priceFieldFocus} onBlur={priceFieldBlur}
          />
        </div>

        {filteredModules.length === 0 && (
          <div style={{ ...cardStyle, border: `1px dashed ${COLORS.ghost}`, boxShadow: 'none', padding: '40px 20px', textAlign: 'center', color: COLORS.faint, fontSize: 13 }}>
            Няма модули за показване.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredModules.map(m => {
            const isOpen = expanded.has(m.id);
            const cost = moduleCost(m);
            const sale = moduleSale(m);
            const final = moduleFinal(m);
            const accent = seriesAccent(m.seriesName);
            return (
              <div key={m.id} className={`cc-module-card${isOpen ? ' cc-module-card--open' : ''}`} style={{ borderTopColor: accent }}>
                <div className="cc-module-head" onClick={() => toggleExpand(m.id)}>
                  <span className="cc-module-head__chevron-wrap">
                    <span className="cc-module-head__chevron" style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}>▶</span>
                  </span>
                  <div className="cc-module-head__name">
                    <input
                      value={m.name}
                      onChange={e => updateModuleName(m.id, e.target.value)}
                      onClick={e => e.stopPropagation()}
                      style={{ ...inputBase, width: '100%', fontWeight: 700, fontSize: 14.5, background: 'transparent', border: '1px solid transparent', padding: '4px 6px', letterSpacing: '-.1px' }}
                      onFocus={e => { e.currentTarget.style.borderColor = COLORS.blue; e.currentTarget.style.background = '#fff'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                    />
                    {(m.seriesName || m.categoryName) && (
                      <div className="cc-module-head__meta">
                        {m.seriesName && (
                          <span className="cc-module-tag" style={{ color: accent, background: `${accent}14` }}>{m.seriesName}</span>
                        )}
                        {m.categoryName && <span className="cc-module-head__cat">{m.categoryName}</span>}
                      </div>
                    )}
                  </div>

                  <div className="cc-module-totals">
                    <div className="cc-stat">
                      <span className="cc-stat__label">Себестойност</span>
                      <span className="cc-stat__value">{fmt(cost)} €</span>
                    </div>
                    <div className="cc-stat">
                      <span className="cc-stat__label">Продажна</span>
                      <span className="cc-stat__value">{fmt(sale)} €</span>
                    </div>
                    <div className="cc-stat cc-stat--accent">
                      <span className="cc-stat__label">С ДДС</span>
                      <span className="cc-stat__value">{fmt(final)} €</span>
                    </div>
                  </div>

                  <div className="cc-module-head__actions">
                    <button
                      onClick={e => { e.stopPropagation(); duplicateModule(m); }}
                      title="Дублирай"
                      className="cc-icon-btn"
                    >⧉</button>
                    <button
                      onClick={e => { e.stopPropagation(); removeModule(m.id); }}
                      title="Изтрий модул"
                      className="cc-icon-btn cc-icon-btn--danger"
                    >×</button>
                  </div>
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
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.ghost}; border-radius: 3px; }
        select { cursor: pointer; }

        .cc-breadcrumb {
          background: #fff; border-bottom: 1px solid #e5e7eb;
          padding: 0 32px; display: flex; align-items: center; gap: 8px; height: 46px;
        }
        .cc-section { padding-left: 32px; padding-right: 32px; }
        .cc-header { padding-top: 28px; padding-bottom: 22px; }
        .cc-h2 { font-size: 15px; font-weight: 700; color: ${COLORS.text}; margin: 0; }

        .cc-pricelist-col { display: flex; flex-direction: column; gap: 14px; }

        .cc-collapsible__head {
          padding: 13px 16px; cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: background .12s;
        }
        .cc-collapsible__head:hover { background: #fafbfc; }

        /* ── price rows ── */
        .cc-price-row {
          display: grid; align-items: center; gap: 10px; padding: 8px 0;
          border-bottom: 1px solid #f8fafc;
        }
        .cc-price-row:last-of-type { border-bottom: none; }
        .cc-price-row--hardware { grid-template-columns: 1fr 64px 130px 30px; }
        .cc-price-row--material { grid-template-columns: minmax(220px,2fr) 68px 116px 116px 116px 30px; }
        .cc-price-row__name { width: 100%; }
        .cc-price-row__unit { width: 100%; }
        .cc-price-row__remove { justify-self: end; }

        /* ── markup / vat ── */
        .cc-rate-row { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
        .cc-rate-card {
          background: #fff; border: 1px solid ${COLORS.border}; border-radius: 12px;
          padding: 12px 16px; display: flex; align-items: center; gap: 10px;
        }

        .cc-price-group {
          display: flex; align-items: center; gap: 5px; background: #f8fafc;
          border-radius: 7px; padding: 3px 6px 3px 8px; min-width: 0;
        }
        .cc-price-group__label { font-size: 9.5px; color: ${COLORS.faint}; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; flex-shrink: 0; }
        .cc-price-group__unit { font-size: 11px; color: ${COLORS.faint}; flex-shrink: 0; }

        /* ── module body rows ── */
        .cc-module-body { border-top: 1px solid ${COLORS.borderSoft}; padding: 16px 18px 20px; background: #fbfcfd; }
        .cc-module-body__label {
          display: inline-block; font-size: 9.5px; font-weight: 800; text-transform: uppercase;
          letter-spacing: .07em; margin-bottom: 8px; padding: 3px 9px; border-radius: 999px;
        }
        .cc-module-body__rows { display: flex; flex-direction: column; gap: 2px; }
        .cc-module-body__empty {
          font-size: 12.5px; color: ${COLORS.faint}; text-align: center; padding: 18px 12px;
          border: 1.5px dashed ${COLORS.border}; border-radius: 12px; margin-bottom: 12px;
        }
        .cc-module-add-select { cursor: pointer; }

        .cc-qty-row {
          display: grid; grid-template-columns: 1fr 30px 72px 76px 26px; align-items: center; gap: 8px; padding: 5px 0;
        }
        .cc-qty-row__name { font-size: 12.5px; color: ${COLORS.text2}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cc-qty-row__unit { font-size: 10px; color: ${COLORS.faint}; }
        .cc-qty-row__total { font-size: 11px; text-align: right; }

        .cc-mat-row {
          display: grid; grid-template-columns: minmax(120px,1.4fr) 84px 64px 108px 76px 26px;
          align-items: center; gap: 8px; padding: 5px 0;
        }
        .cc-mat-row__name { font-size: 12.5px; color: ${COLORS.text2}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cc-mat-row__total { font-size: 11px; text-align: right; }

        /* ── modules toolbar / list ── */
        .cc-modules-head { margin-bottom: 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .cc-modules-head__actions { display: flex; align-items: center; gap: 8px; flex: 1; }
        .cc-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .cc-series-tabs { display: flex; background: #e2e8f0; border-radius: 9px; padding: 3px; gap: 2px; flex-wrap: wrap; }

        /* ── module card (Apple-style: soft elevation, colored series accent, grouped stats) ── */
        .cc-module-card {
          background: ${COLORS.card}; border-radius: 18px; border: 1px solid ${COLORS.border};
          border-top: 3px solid ${COLORS.ghost}; overflow: hidden;
          box-shadow: 0 1px 2px rgba(15,23,42,.04);
          transition: box-shadow .18s ease, border-color .18s ease, transform .18s ease;
        }
        .cc-module-card:hover { box-shadow: 0 6px 20px rgba(15,23,42,.08); }
        .cc-module-card--open { box-shadow: 0 6px 24px rgba(15,23,42,.09); }

        .cc-module-head {
          display: flex; align-items: center; gap: 14px; padding: 14px 18px; cursor: pointer;
          transition: background .12s;
        }
        .cc-module-head:hover { background: #fafbfc; }
        .cc-module-head__chevron-wrap {
          width: 26px; height: 26px; border-radius: 999px; background: ${COLORS.bg};
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: background .15s;
        }
        .cc-module-head:hover .cc-module-head__chevron-wrap { background: #e8edf3; }
        .cc-module-head__chevron { color: ${COLORS.muted}; font-size: 10px; transition: transform .18s; flex-shrink: 0; }
        .cc-module-head__name { flex: 1; min-width: 100px; }
        .cc-module-head__meta { display: flex; align-items: center; gap: 7px; padding: 0 6px; margin-top: 3px; flex-wrap: wrap; }
        .cc-module-tag {
          font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;
          padding: 2.5px 8px; border-radius: 999px; line-height: 1.5;
        }
        .cc-module-head__cat { font-size: 10.5px; color: ${COLORS.faint}; }

        .cc-module-totals { display: flex; gap: 18px; flex-shrink: 0; }
        .cc-stat { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        .cc-stat__label { font-size: 9px; font-weight: 700; color: ${COLORS.faint}; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; }
        .cc-stat__value { font-size: 13.5px; font-weight: 700; color: ${COLORS.text}; white-space: nowrap; }
        .cc-stat--accent { padding: 3px 10px 4px; border-radius: 10px; background: #f0fdf4; }
        .cc-stat--accent .cc-stat__label { color: #4c9a6a; }
        .cc-stat--accent .cc-stat__value { color: ${COLORS.green}; }
        .cc-module-totals-compact { display: none; }

        .cc-module-head__actions { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
        .cc-icon-btn {
          width: 30px; height: 30px; flex-shrink: 0; border-radius: 999px; border: 1px solid ${COLORS.border};
          background: #fff; color: ${COLORS.muted}; font-size: 12.5px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s, color .15s, border-color .15s;
        }
        .cc-icon-btn:hover { background: ${COLORS.bg}; border-color: ${COLORS.ghost}; }
        .cc-icon-btn--danger { border-color: transparent; background: transparent; font-size: 16px; }
        .cc-icon-btn--danger:hover { background: ${COLORS.redBg}; color: ${COLORS.red}; }

        /* ── Mobile / Tablet responsive ── */
        html, body { max-width: 100%; overflow-x: hidden; }

        @media (max-width: 900px) {
          .cc-breadcrumb { padding: 0 16px; height: 42px; }
          .cc-breadcrumb > span:first-child, .cc-breadcrumb > span:nth-child(2) { display: none; }
          .cc-section { padding-left: 16px; padding-right: 16px; }
          .cc-header { padding-top: 20px; padding-bottom: 16px; }

          /* Module header wraps onto two lines on mobile: chevron/name/actions
             stay on line 1, and the full cost/sale/VAT breakdown (all three
             prices, not just a single compact figure) drops to its own
             full-width line 2 underneath. */
          .cc-module-head { padding: 12px 14px; gap: 6px 8px; flex-wrap: wrap; }
          .cc-module-head__chevron-wrap { order: 1; }
          .cc-module-head__name { order: 2; min-width: 60px; }
          .cc-module-head__actions { order: 3; }
          .cc-module-totals {
            order: 4; flex: 1 1 100%; display: flex; flex-wrap: wrap;
            gap: 6px 10px; padding-left: 34px;
          }
          .cc-stat { flex-direction: row; align-items: baseline; gap: 5px; }
          .cc-stat__value { font-size: 12.5px; }
        }

        /* Below 640px the dense multi-column price/qty/material rows become
           unreliable as CSS grids (fixed narrow tracks force their content to
           overflow, which drags the whole page into horizontal scroll — that
           was the root cause of "everything looks broken" on phones). Switch
           them to a wrapping flex column instead: nothing has a fixed minimum
           track width, so nothing can force an overflow. */
        @media (max-width: 640px) {
          /* Dense, compact rows: the item name gets its own full line (it can
             run long), everything else — unit, price chip(s), qty, total,
             remove — packs onto a tight second line instead of each control
             claiming a full-width row of its own. Nothing here is forced to
             100% width, so short controls stay short. */
          .cc-price-row--hardware,
          .cc-price-row--material {
            display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; padding: 9px 0;
          }
          .cc-price-row--hardware .cc-price-row__name,
          .cc-price-row--material .cc-price-row__name { flex: 1 1 100%; order: 1; width: auto; font-weight: 600; }
          .cc-price-row--hardware .cc-price-row__unit,
          .cc-price-row--material .cc-price-row__unit { flex: 0 0 54px; min-width: 0; order: 2; width: auto; }
          .cc-price-row--hardware .cc-price-group,
          .cc-price-row--material .cc-price-group { order: 3; flex: 0 1 auto; min-width: 0; padding: 3px 6px 3px 8px; gap: 4px; }
          .cc-price-row--hardware .cc-price-group input,
          .cc-price-row--material .cc-price-group input { width: 46px !important; }
          .cc-price-row--hardware .cc-price-row__remove,
          .cc-price-row--material .cc-price-row__remove { order: 9; flex-shrink: 0; justify-self: auto; margin-left: auto; }

          .cc-qty-row {
            display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; padding: 6px 0;
          }
          .cc-qty-row__name {
            flex: 1 1 100%; order: 1; white-space: normal; overflow: visible; text-overflow: clip; font-weight: 500;
          }
          .cc-qty-row__unit { order: 2; }
          .cc-qty-row__input { order: 3; width: 54px; flex-shrink: 0; }
          .cc-qty-row__total { order: 4; margin-left: auto; text-align: right; }
          .cc-qty-row__remove { order: 5; flex-shrink: 0; }

          .cc-mat-row {
            display: flex; flex-wrap: wrap; align-items: center; gap: 5px 8px; padding: 6px 0;
          }
          .cc-mat-row__name {
            flex: 1 1 100%; order: 1; white-space: normal; overflow: visible; text-overflow: clip; font-weight: 500;
          }
          .cc-mat-row__portion { order: 2; flex: 0 1 76px; min-width: 0; }
          .cc-mat-row__qty { order: 3; width: 48px; flex-shrink: 0; }
          .cc-mat-row__edge { order: 4; flex: 0 1 auto; min-width: 0; padding: 3px 6px 3px 8px; gap: 4px; }
          .cc-mat-row__edge input { width: 40px !important; }
          .cc-mat-row__total { order: 5; margin-left: auto; text-align: right; }
          .cc-mat-row__remove { order: 6; flex-shrink: 0; }

          .cc-modules-head__actions { width: 100%; }
          .cc-modules-head__actions button { flex: 1; }
          .cc-modules-head__actions button:last-child { flex: 1 1 100%; order: -1; margin-bottom: 6px; }

          .cc-series-tabs { width: 100%; }
        }
      `}</style>
    </div>
  );
}
