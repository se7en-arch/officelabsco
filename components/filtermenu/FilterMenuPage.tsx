'use client';

import { useState } from 'react';
import s from './FilterMenuPage.module.css';

// ── Static data ──
const NEIGHBORHOODS = [
  'Лозенец', 'Витоша', 'Младост', 'Студентски', 'Борово',
  'Дружба', 'Люлин', 'Надежда', 'Овча купел', 'Красно село',
  'Изгрев', 'Яворов', 'Иван Вазов', 'Гео Милев', 'Слатина',
];
const AGENCIES = [
  'Адрес', 'Явлена', 'Ера', 'Форос', 'Луксор',
  'Домът', 'Стар Имот', 'Имотека', 'Бул Инс', 'РосИнмот',
];
const FURNISHING_OPTS = ['Без обзавеждане', 'Частично', 'Напълно обзаведен'];
const CONSTRUCTION_OPTS = ['Тухла', 'Панел', 'ЕПК', 'Гредоред', 'Монолит'];
const AMENITIES_OPTS = [
  'Балкон', 'Тераса', 'Гараж', 'Паркинг', 'Асансьор',
  'Климатик', 'Мазе', 'Двор', 'Интернет', 'Кабелна ТВ', 'Охрана', 'Видеонаблюдение',
];
const ROOMS_OPTS = ['Студио', '1', '2', '3', '4', '5+'];
const FLOOR_OPTS = ['Партер', '1', '2', '3', '4', '5', '6', '7', '8+', 'Последен'];
const DEAL_OPTS = ['Продажба', 'Под наем'];
const PROP_OPTS = ['Апартамент', 'Къща', 'Студио', 'Офис', 'Магазин', 'Гараж', 'Парцел', 'Склад'];

const MOCK_PROPS = [
  { id: 1,  type: 'Апартамент', rooms: 2, area: 75,  floor: 4, price: 180000, district: 'Лозенец' },
  { id: 2,  type: 'Апартамент', rooms: 3, area: 95,  floor: 7, price: 210000, district: 'Младост' },
  { id: 3,  type: 'Студио',     rooms: 1, area: 42,  floor: 2, price: 95000,  district: 'Студентски' },
  { id: 4,  type: 'Апартамент', rooms: 1, area: 55,  floor: 3, price: 130000, district: 'Борово' },
  { id: 5,  type: 'Апартамент', rooms: 4, area: 130, floor: 9, price: 320000, district: 'Витоша' },
  { id: 6,  type: 'Апартамент', rooms: 2, area: 68,  floor: 5, price: 145000, district: 'Дружба' },
  { id: 7,  type: 'Апартамент', rooms: 3, area: 88,  floor: 6, price: 245000, district: 'Изгрев' },
  { id: 8,  type: 'Апартамент', rooms: 2, area: 72,  floor: 1, price: 165000, district: 'Яворов' },
  { id: 9,  type: 'Апартамент', rooms: 1, area: 48,  floor: 8, price: 115000, district: 'Иван Вазов' },
  { id: 10, type: 'Къща',       rooms: 5, area: 220, floor: 2, price: 480000, district: 'Витоша' },
  { id: 11, type: 'Офис',       rooms: 3, area: 110, floor: 6, price: 195000, district: 'Красно село' },
  { id: 12, type: 'Апартамент', rooms: 2, area: 78,  floor: 3, price: 170000, district: 'Гео Милев' },
];

const PRICE_MIN = 50000;
const PRICE_MAX = 600000;

const DEFAULT: Filters = {
  priceMin: PRICE_MIN, priceMax: PRICE_MAX,
  dealTypes: [], propTypes: [], neighborhoods: [],
  rooms: [], areaMin: '', areaMax: '',
  floors: [], furnishing: [], construction: [],
  amenities: [], agencies: [],
};

interface Filters {
  priceMin: number; priceMax: number;
  dealTypes: string[]; propTypes: string[]; neighborhoods: string[];
  rooms: string[]; areaMin: string; areaMax: string;
  floors: string[]; furnishing: string[]; construction: string[];
  amenities: string[]; agencies: string[];
}

function tog(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function Section({
  title, children, defaultOpen = true,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={s.section}>
      <button className={s.sectionHead} onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className={`${s.chevron} ${open ? s.chevronOpen : ''}`}><ChevronIcon /></span>
      </button>
      {open && <div className={s.sectionBody}>{children}</div>}
    </div>
  );
}

export default function FilterMenuPage() {
  const [f, setF] = useState<Filters>(DEFAULT);
  const [sort, setSort] = useState('newest');
  const [perPage, setPerPage] = useState('20');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [moreN, setMoreN] = useState(false);
  const [moreA, setMoreA] = useState(false);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setF(prev => ({ ...prev, [k]: v }));

  const toggleArr = (k: keyof Filters, v: string) =>
    setF(prev => ({ ...prev, [k]: tog(prev[k] as string[], v) }));

  const activeCount = (
    (f.priceMin !== PRICE_MIN ? 1 : 0) +
    (f.priceMax !== PRICE_MAX ? 1 : 0) +
    [f.dealTypes, f.propTypes, f.neighborhoods, f.rooms,
     f.floors, f.furnishing, f.construction, f.amenities, f.agencies]
      .filter(a => a.length > 0).length +
    (f.areaMin || f.areaMax ? 1 : 0)
  );

  const pLeft = ((f.priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const pWidth = ((f.priceMax - f.priceMin) / (PRICE_MAX - PRICE_MIN)) * 100;
  const fmt = (p: number) => p.toLocaleString('bg-BG') + ' лв.';

  const visN = moreN ? NEIGHBORHOODS : NEIGHBORHOODS.slice(0, 7);
  const visA = moreA ? AGENCIES : AGENCIES.slice(0, 5);

  return (
    <div className={s.page}>

      {/* ── Top sticky bar ── */}
      <div className={s.topBar}>
        <div className={s.topInner}>
          <span className={s.count}>{MOCK_PROPS.length} имота</span>

          <div className={s.topControls}>
            <span className={s.topLbl}>Сортирай:</span>
            <select className={s.topSel} value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Първо най-новите</option>
              <option value="price_asc">Цена: Ниска → Висока</option>
              <option value="price_desc">Цена: Висока → Ниска</option>
              <option value="area_asc">Площ: Малка → Голяма</option>
            </select>

            <span className={s.topLbl}>На стр.:</span>
            <select className={s.topSel} value={perPage} onChange={e => setPerPage(e.target.value)}>
              {['12', '20', '32', '48'].map(v => <option key={v}>{v}</option>)}
            </select>

            <div className={s.viewToggle}>
              <button
                className={`${s.viewBtn}${view === 'grid' ? ` ${s.viewBtnOn}` : ''}`}
                onClick={() => setView('grid')} title="Мрежа"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1"/>
                  <rect x="8.5" y="1" width="5.5" height="5.5" rx="1"/>
                  <rect x="1" y="8.5" width="5.5" height="5.5" rx="1"/>
                  <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1"/>
                </svg>
              </button>
              <button
                className={`${s.viewBtn}${view === 'list' ? ` ${s.viewBtnOn}` : ''}`}
                onClick={() => setView('list')} title="Списък"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
                  <rect x="1" y="2"  width="13" height="2.5" rx="1"/>
                  <rect x="1" y="6.5" width="13" height="2.5" rx="1"/>
                  <rect x="1" y="11" width="13" height="2" rx="1"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className={s.layout}>

        {/* ──────────── SIDEBAR ──────────── */}
        <aside className={s.sidebar}>

          {/* Reset header */}
          <div className={s.resetRow}>
            <span className={s.filterHeading}>
              Филтри
              {activeCount > 0 && <span className={s.badge}>{activeCount}</span>}
            </span>
            {activeCount > 0 && (
              <button className={s.resetBtn} onClick={() => setF(DEFAULT)}>
                Нулирай
              </button>
            )}
          </div>

          {/* ── Цена ── */}
          <Section title="Цена">
            <div className={s.priceVals}>
              <span>{fmt(f.priceMin)}</span>
              <span className={s.priceDash}>–</span>
              <span>{fmt(f.priceMax)}</span>
            </div>
            <div className={s.sliderWrap}>
              <div className={s.sliderTrack}>
                <div className={s.sliderFill} style={{ left: `${pLeft}%`, width: `${pWidth}%` }}/>
              </div>
              <input
                type="range" className={s.sliderInput}
                min={PRICE_MIN} max={PRICE_MAX} step={5000}
                value={f.priceMin}
                onChange={e => { const v = +e.target.value; if (v < f.priceMax - 10000) set('priceMin', v); }}
              />
              <input
                type="range" className={s.sliderInput}
                min={PRICE_MIN} max={PRICE_MAX} step={5000}
                value={f.priceMax}
                onChange={e => { const v = +e.target.value; if (v > f.priceMin + 10000) set('priceMax', v); }}
              />
            </div>
          </Section>

          {/* ── Тип сделка ── */}
          <Section title="Тип сделка">
            {DEAL_OPTS.map(o => (
              <label key={o} className={s.checkRow}>
                <input type="checkbox" className={s.checkHidden}
                  checked={f.dealTypes.includes(o)}
                  onChange={() => toggleArr('dealTypes', o)} />
                <span className={s.checkBox}/>
                <span className={s.checkLbl}>{o}</span>
              </label>
            ))}
          </Section>

          {/* ── Тип имот ── */}
          <Section title="Тип имот">
            {PROP_OPTS.map(o => (
              <label key={o} className={s.checkRow}>
                <input type="checkbox" className={s.checkHidden}
                  checked={f.propTypes.includes(o)}
                  onChange={() => toggleArr('propTypes', o)} />
                <span className={s.checkBox}/>
                <span className={s.checkLbl}>{o}</span>
              </label>
            ))}
          </Section>

          {/* ── Квартал ── */}
          <Section title="Квартал">
            {visN.map(n => (
              <a key={n} href="#"
                className={`${s.linkRow}${f.neighborhoods.includes(n) ? ` ${s.linkOn}` : ''}`}
                onClick={e => { e.preventDefault(); toggleArr('neighborhoods', n); }}
              >
                {n}
              </a>
            ))}
            <button className={s.showAll} onClick={() => setMoreN(x => !x)}>
              {moreN ? 'Затвори ▲' : `Виж всички (${NEIGHBORHOODS.length}) ▼`}
            </button>
          </Section>

          {/* ── Брой стаи ── */}
          <Section title="Брой стаи">
            <div className={s.chips}>
              {ROOMS_OPTS.map(r => (
                <button key={r}
                  className={`${s.chip}${f.rooms.includes(r) ? ` ${s.chipOn}` : ''}`}
                  onClick={() => toggleArr('rooms', r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Площ ── */}
          <Section title="Площ (кв.м.)">
            <div className={s.dualInputs}>
              <input className={s.numInput} type="number" placeholder="Мин."
                value={f.areaMin} onChange={e => set('areaMin', e.target.value)} />
              <span className={s.priceDash}>–</span>
              <input className={s.numInput} type="number" placeholder="Макс."
                value={f.areaMax} onChange={e => set('areaMax', e.target.value)} />
            </div>
          </Section>

          {/* ── Етаж ── */}
          <Section title="Етаж" defaultOpen={false}>
            <div className={s.chips}>
              {FLOOR_OPTS.map(fl => (
                <button key={fl}
                  className={`${s.chip}${f.floors.includes(fl) ? ` ${s.chipOn}` : ''}`}
                  onClick={() => toggleArr('floors', fl)}
                >
                  {fl}
                </button>
              ))}
            </div>
          </Section>

          {/* ── Обзавеждане ── */}
          <Section title="Обзавеждане" defaultOpen={false}>
            {FURNISHING_OPTS.map(o => (
              <label key={o} className={s.checkRow}>
                <input type="checkbox" className={s.checkHidden}
                  checked={f.furnishing.includes(o)}
                  onChange={() => toggleArr('furnishing', o)} />
                <span className={s.checkBox}/>
                <span className={s.checkLbl}>{o}</span>
              </label>
            ))}
          </Section>

          {/* ── Строителство ── */}
          <Section title="Строителство" defaultOpen={false}>
            {CONSTRUCTION_OPTS.map(o => (
              <label key={o} className={s.checkRow}>
                <input type="checkbox" className={s.checkHidden}
                  checked={f.construction.includes(o)}
                  onChange={() => toggleArr('construction', o)} />
                <span className={s.checkBox}/>
                <span className={s.checkLbl}>{o}</span>
              </label>
            ))}
          </Section>

          {/* ── Удобства ── */}
          <Section title="Удобства" defaultOpen={false}>
            {AMENITIES_OPTS.map(o => (
              <label key={o} className={s.checkRow}>
                <input type="checkbox" className={s.checkHidden}
                  checked={f.amenities.includes(o)}
                  onChange={() => toggleArr('amenities', o)} />
                <span className={s.checkBox}/>
                <span className={s.checkLbl}>{o}</span>
              </label>
            ))}
          </Section>

          {/* ── Агенции ── */}
          <Section title="Агенции" defaultOpen={false}>
            {visA.map(a => (
              <a key={a} href="#"
                className={`${s.linkRow}${f.agencies.includes(a) ? ` ${s.linkOn}` : ''}`}
                onClick={e => { e.preventDefault(); toggleArr('agencies', a); }}
              >
                {a}
              </a>
            ))}
            {AGENCIES.length > 5 && (
              <button className={s.showAll} onClick={() => setMoreA(x => !x)}>
                {moreA ? 'Затвори ▲' : `Виж всички (${AGENCIES.length}) ▼`}
              </button>
            )}
          </Section>

        </aside>

        {/* ──────────── CARDS ──────────── */}
        <main className={view === 'grid' ? s.cardsGrid : s.cardsList}>
          {MOCK_PROPS.map(p => (
            view === 'grid' ? (
              <div key={p.id} className={s.card}>
                <div className={s.cardImg}>
                  <span className={s.cardBadge}>{p.type}</span>
                  <button className={s.cardBookmark} aria-label="Запази">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
                <div className={s.cardBody}>
                  <div className={s.cardDistrict}>{p.district}, София</div>
                  <div className={s.cardTitle}>
                    {p.rooms === 1 && p.type === 'Студио' ? 'Студио' : `${p.rooms}-стаен`}, {p.area} кв.м.
                  </div>
                  <div className={s.cardMeta}>
                    <span>{p.area} кв.м.</span>
                    <span className={s.dot}>·</span>
                    <span>Ет. {p.floor}</span>
                    <span className={s.dot}>·</span>
                    <span>Тухла</span>
                  </div>
                  <div className={s.cardFoot}>
                    <span className={s.cardPrice}>{p.price.toLocaleString('bg-BG')} лв.</span>
                    <span className={s.cardPriceM}>{Math.round(p.price / p.area).toLocaleString('bg-BG')} лв/кв.м.</span>
                  </div>
                </div>
              </div>
            ) : (
              <div key={p.id} className={s.cardH}>
                <div className={s.cardHImg}>
                  <span className={s.cardBadge}>{p.type}</span>
                </div>
                <div className={s.cardHBody}>
                  <div className={s.cardDistrict}>{p.district}, София</div>
                  <div className={s.cardTitle}>
                    {p.rooms === 1 && p.type === 'Студио' ? 'Студио' : `${p.rooms}-стаен`}, {p.area} кв.м., ет.{p.floor}
                  </div>
                  <div className={s.cardMeta}>
                    <span>{p.area} кв.м.</span>
                    <span className={s.dot}>·</span>
                    <span>Ет. {p.floor}</span>
                    <span className={s.dot}>·</span>
                    <span>Тухла</span>
                    <span className={s.dot}>·</span>
                    <span>Напълно обзаведен</span>
                  </div>
                </div>
                <div className={s.cardHPrice}>
                  <div className={s.cardPrice}>{p.price.toLocaleString('bg-BG')} лв.</div>
                  <div className={s.cardPriceM}>{Math.round(p.price / p.area).toLocaleString('bg-BG')} лв/кв.м.</div>
                </div>
              </div>
            )
          ))}
        </main>
      </div>
    </div>
  );
}
