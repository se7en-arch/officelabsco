'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CITIES, PROP_TYPES, BG_CITIES } from '@/lib/data';
import { getListings, type PublishedListing } from '@/lib/listings';
import BookmarkButton from '@/components/BookmarkButton';
import s from './SearchPage.module.css';

/* ── Flat property list with city attached ── */
const STATIC_PROPERTIES = CITIES.flatMap(city =>
  city.props.map(p => ({ ...p, city: city.name, isPublished: false, img: p.img })),
);

const PARKING_OPTIONS = [
  { value: 'none',     label: 'Без' },
  { value: 'one',      label: '1 бр.' },
  { value: 'two_plus', label: '2+' },
];

const FURNISHING_OPTIONS = [
  { value: 'unfurnished', label: 'Без' },
  { value: 'partial',     label: 'Частично' },
  { value: 'full',        label: 'Напълно' },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'По подразбиране' },
  { value: 'price_asc',  label: 'Цена: ниска → висока' },
  { value: 'price_desc', label: 'Цена: висока → ниска' },
];

const PER_PAGE = 9;

interface Filters {
  location: string;
  priceMin: string;
  priceMax: string;
  propertyTypes: string[];
  areaMin: string;
  areaMax: string;
  floor: string;
  parking: string;
  furnishing: string;
}

const EMPTY_FILTERS: Filters = {
  location: '', priceMin: '', priceMax: '',
  propertyTypes: [], areaMin: '', areaMax: '',
  floor: '', parking: '', furnishing: '',
};

export default function SearchPage() {
  const searchParams = useSearchParams();

  const initialFilters = useMemo<Filters>(() => ({
    ...EMPTY_FILTERS,
    location:      searchParams.get('location') || '',
    propertyTypes: searchParams.get('type') ? [searchParams.get('type')!] : [],
    priceMin:      searchParams.get('priceMin') || '',
    priceMax:      searchParams.get('priceMax') || '',
  }), []);

  const [draft, setDraft]         = useState<Filters>(initialFilters);
  const [active, setActive]       = useState<Filters>(initialFilters);
  const [sort, setSort]           = useState('default');
  const [page, setPage]           = useState(1);
  const [mobileOpen, setMobile]   = useState(false);
  const [published, setPublished] = useState<PublishedListing[]>([]);

  useEffect(() => { setPublished(getListings()); }, []);

  const ALL_PROPERTIES = useMemo(() => [
    ...published.map(l => ({ type: l.type, desc: l.desc, price: l.price, img: l.img, city: l.city, isPublished: true })),
    ...STATIC_PROPERTIES,
  ], [published]);

  function set(field: keyof Omit<Filters, 'propertyTypes'>, value: string) {
    setDraft(prev => ({ ...prev, [field]: value }));
  }

  function toggleType(type: string) {
    setDraft(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter(t => t !== type)
        : [...prev.propertyTypes, type],
    }));
  }

  function apply() {
    setActive(draft);
    setPage(1);
    setMobile(false);
  }

  function clear() {
    setDraft(EMPTY_FILTERS);
    setActive(EMPTY_FILTERS);
    setPage(1);
  }

  const activeCount = Object.entries(active).filter(([k, v]) =>
    Array.isArray(v) ? v.length > 0 : Boolean(v)
  ).length;

  const filtered = useMemo(() => {
    let res = [...ALL_PROPERTIES];
    if (active.location)
      res = res.filter(p => p.city.toLowerCase().includes(active.location.toLowerCase()));
    if (active.priceMin)
      res = res.filter(p => p.price >= Number(active.priceMin));
    if (active.priceMax)
      res = res.filter(p => p.price <= Number(active.priceMax));
    if (active.propertyTypes.length > 0)
      res = res.filter(p => active.propertyTypes.includes(p.type));
    return res;
  }, [active]);

  const sorted = useMemo(() => {
    if (sort === 'price_asc')  return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const pageItems  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function goPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* ══════════════ MOBILE FILTER BAR ══════════════ */}
      <button type="button" className={s.mobileBar} onClick={() => setMobile(o => !o)}>
        <div className={s.mobileBarLeft}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="20" y2="12" /><line x1="12" y1="18" x2="20" y2="18" />
          </svg>
          Филтри
          {activeCount > 0 && <span className={s.mobileBarBadge}>{activeCount}</span>}
        </div>
        <span className={`${s.mobileBarArrow}${mobileOpen ? ` ${s.mobileBarArrowOpen}` : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

    <div className={s.page}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className={`${s.sidebar}${mobileOpen ? ` ${s.sidebarOpen}` : ''}`}>
        <div className={s.sidebarHead}>
          <span className={s.sidebarTitle}>Филтри</span>
        </div>

        {/* Location */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Местоположение</div>
          <div className={s.inputIcon}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className={s.textInput}
              type="text"
              placeholder="Търси град..."
              value={draft.location}
              onChange={e => set('location', e.target.value)}
              list="city-list"
            />
          </div>
          <datalist id="city-list">
            {BG_CITIES.map(c => <option key={c} value={c} />)}
          </datalist>
        </div>

        {/* Price */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Цена (€)</div>
          <div className={s.rangeRow}>
            <input className={s.rangeInput} type="number" placeholder="Мин." value={draft.priceMin} onChange={e => set('priceMin', e.target.value)} />
            <input className={s.rangeInput} type="number" placeholder="Макс." value={draft.priceMax} onChange={e => set('priceMax', e.target.value)} />
          </div>
        </div>

        {/* Property type */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Вид имот</div>
          <div className={s.chipGroup}>
            {PROP_TYPES.map(type => (
              <button
                key={type}
                type="button"
                className={`${s.chip}${draft.propertyTypes.includes(type) ? ` ${s.chipActive}` : ''}`}
                onClick={() => toggleType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Area */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Квадратура (м²)</div>
          <div className={s.rangeRow}>
            <input className={s.rangeInput} type="number" placeholder="Мин." value={draft.areaMin} onChange={e => set('areaMin', e.target.value)} />
            <input className={s.rangeInput} type="number" placeholder="Макс." value={draft.areaMax} onChange={e => set('areaMax', e.target.value)} />
          </div>
        </div>

        {/* Floor */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Етаж</div>
          <input
            className={s.textInput}
            type="number"
            placeholder="напр. 3"
            value={draft.floor}
            onChange={e => set('floor', e.target.value)}
          />
        </div>

        {/* Parking */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Паркомясто</div>
          <div className={s.segmentedGroup}>
            {PARKING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${s.segmentedBtn}${draft.parking === opt.value ? ` ${s.segmentedActive}` : ''}`}
                onClick={() => set('parking', draft.parking === opt.value ? '' : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Furnishing */}
        <div className={s.section}>
          <div className={s.sectionLabel}>Обзавеждане</div>
          <div className={s.segmentedGroup}>
            {FURNISHING_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                className={`${s.segmentedBtn}${draft.furnishing === opt.value ? ` ${s.segmentedActive}` : ''}`}
                onClick={() => set('furnishing', draft.furnishing === opt.value ? '' : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={s.applyRow}>
          <button className={s.clearBtnRow} onClick={clear}>Изчисти</button>
          <button className={s.applyBtn} onClick={apply}>Приложи</button>
        </div>
      </aside>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className={s.content}>
        <div className={s.contentHead}>
          <span className={s.resultCount}>
            {sorted.length} намерени обяви
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
          <div className={s.sortWrap}>
            <span>Сортирай по:</span>
            <select
              className={s.sortSelect}
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={s.grid}>
          {pageItems.length === 0 && (
            <div className={s.empty}>Няма намерени обяви по зададените критерии.</div>
          )}
          {pageItems.map((prop, i) => (
            <div key={`${prop.city}-${i}`} className={s.card}>
              <Link href="/property/1" style={{ display: 'contents' }}>
                <div className={s.cardImg}>
                  {prop.img && prop.img.startsWith('data:') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={prop.img} alt={prop.type} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : prop.img ? (
                    <Image
                      src={`/images/${prop.img}`}
                      alt={prop.type}
                      fill
                      sizes="(max-width: 860px) 50vw, 25vw"
                      style={{ objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#dde3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
                      Без снимка
                    </div>
                  )}
                </div>
                <div className={s.cardBody}>
                  <div className={s.cardType}>{prop.type}</div>
                  <div className={s.cardDesc}>{prop.desc}</div>
                  <div className={s.cardFoot}>
                    <span className={s.cardPrice}>{prop.price} €</span>
                  </div>
                </div>
              </Link>
              <div style={{ position: 'absolute', bottom: 14, right: 14, zIndex: 2 }}>
                <BookmarkButton />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={s.pagination}>
            <button className={s.pageBtn} onClick={() => goPage(page - 1)} disabled={page === 1}>
              Назад
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${s.pageBtn}${p === page ? ` ${s.pageBtnActive}` : ''}`}
                onClick={() => goPage(p)}
              >
                {p}
              </button>
            ))}
            <button className={s.pageBtn} onClick={() => goPage(page + 1)} disabled={page === totalPages}>
              Напред
            </button>
          </div>
        )}
      </div>

    </div>
    </>
  );
}
