'use client';

import { useState, useMemo } from 'react';

export interface CatalogProduct {
  id: number;
  slug: string;
  name: string;
  nameEn: string | null;
  sku: string | null;
  price: number;
  description: string;
  descriptionEn: string | null;
  dimensions: string | null;
  weight: string | null;
  colors: string | null;
  colorsEn: string | null;
  material: string | null;
  materialEn: string | null;
  image: string;
  images: string[];
  series: string;
  seriesSlug: string;
  seriesColor: string;
  category: string;
  categoryEn: string | null;
}

export interface SeriesInfo {
  name: string;
  slug: string;
  tagline: string;
  taglineEn: string;
  color: string;
}

/* ─── Series hero image URL ─── */
function seriesHeroImage(slug: string): string {
  const nameMap: Record<string, string> = {
    astra: '/images/moodboard-astra.jpeg',
    terra: '/images/moodboard-terra.jpeg',
    nova:  '/images/moodboard-nova.jpeg',
    loft:  '/images/moodboard-loft.jpeg',
  };
  return nameMap[slug] ?? '/images/moodboard-astra.jpeg';
}

/* ─── Series Divider Page ───────────────────────────── */
function SeriesDividerPage({
  series,
  productCount,
  lang,
}: {
  series: SeriesInfo;
  productCount: number;
  lang: 'bg' | 'en';
}) {
  const tagline = lang === 'bg' ? series.tagline : series.taglineEn;
  const heroImg = seriesHeroImage(series.slug);
  const countLabel = lang === 'bg'
    ? `${productCount} ${productCount === 1 ? 'продукт' : 'продукта'}`
    : `${productCount} ${productCount === 1 ? 'product' : 'products'}`;
  const seriesLabel = lang === 'bg' ? 'СЕРИЯ' : 'SERIES';

  return (
    <div className="cl-page cl-div-page">
      {/* Left — full-bleed hero photo */}
      <div className="cl-div-img">
        <img src={heroImg} alt={series.name} className="cl-div-hero" />
      </div>

      {/* Right — white panel */}
      <div className="cl-div-panel">
        {/* Logo */}
        <div className="cl-div-logo">
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.45, fontSize: '0.86em', marginLeft: 1 }}>co.</span>
        </div>

        {/* Center content */}
        <div className="cl-div-content">
          <div className="cl-div-eyebrow">{seriesLabel}</div>
          <div className="cl-div-name">{series.name}</div>
          <div className="cl-div-accent" style={{ background: series.color !== '#F5F0EB' && series.color !== '#E8EDE8' ? series.color : '#111' }} />
          <div className="cl-div-tagline">{tagline}</div>
          <div className="cl-div-count">{countLabel}</div>
        </div>

        {/* Footer */}
        <div className="cl-div-foot">officelabsco.com</div>
      </div>
    </div>
  );
}

/* ─── Parse description into paragraphs of sentences ── */
function parseDescription(text: string): string[][] {
  return text.split('\n\n').filter(Boolean).map(para => {
    const lines = para.split('\n').filter(Boolean);
    const sentences: string[] = [];
    for (const line of lines) {
      // Split on ". " only when followed by an uppercase Bulgarian or Latin letter
      const regex = /\.\s+(?=[А-ЯA-Z])/g;
      let lastIdx = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(line)) !== null) {
        sentences.push(line.slice(lastIdx, match.index + 1));
        lastIdx = match.index + match[0].length;
      }
      sentences.push(line.slice(lastIdx));
    }
    return sentences.filter(s => s.trim());
  });
}

/* ─── First sentence only, for a short row blurb ────── */
function firstSentence(text: string): string {
  return parseDescription(text)[0]?.[0] ?? text;
}

/* ─── One A4 page holding 3 products in alternating
       image-left/image-right rows, like /gallery/[series] ── */
function CatalogPageGroup({
  products,
  pageNum,
  totalPages,
  startIdx,
  lang,
}: {
  products: CatalogProduct[];
  pageNum: number;
  totalPages: number;
  startIdx: number;
  lang: 'bg' | 'en';
}) {
  const isBg = lang === 'bg';
  const series = products[0]?.series ?? '';
  const seriesColor = products[0]?.seriesColor ?? '#111';
  const accent = seriesColor !== '#F5F0EB' && seriesColor !== '#E8EDE8' ? seriesColor : '#111';

  const L = isBg
    ? { material: 'Материал', dims: 'Размери', colors: 'Цветове', ref: 'Арт.' }
    : { material: 'Material',  dims: 'Dimensions', colors: 'Colours', ref: 'Ref.' };

  return (
    <div className="cl-page cl-group-page">
      {/* ── HEADER ── */}
      <div className="cl-header">
        <div className="cl-logo">
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.5, fontSize: '0.86em', marginLeft: 1 }}>co.</span>
        </div>
        <div className="cl-header-mid">
          <span className="cl-series-tag" style={{ color: seriesColor, borderColor: seriesColor }}>
            {series}
          </span>
        </div>
        <div className="cl-pageno">
          {String(pageNum).padStart(2, '0')}
          <span style={{ opacity: 0.35 }}> / </span>
          {String(totalPages).padStart(2, '0')}
        </div>
      </div>
      <div className="cl-hr" style={{ background: accent }} />

      {/* ── ROWS: image left/right, text beside it, alternating ── */}
      <div className="cl-rows">
        {products.map((product, i) => {
          const reverse     = (startIdx + i) % 2 === 1;
          const name        = isBg ? product.name        : (product.nameEn        ?? product.name);
          const description = isBg ? product.description : (product.descriptionEn ?? product.description);
          const material    = isBg ? product.material    : (product.materialEn    ?? product.material);
          const colors      = isBg ? product.colors      : (product.colorsEn      ?? product.colors);
          const category    = isBg ? product.category    : (product.categoryEn    ?? product.category);
          const blurb = firstSentence(description);
          const specParts = [
            material && `${L.material}: ${material}`,
            product.dimensions && `${L.dims}: ${product.dimensions}`,
            colors && `${L.colors}: ${colors}`,
          ].filter(Boolean) as string[];

          return (
            <div key={product.id} className={`cl-row${reverse ? ' cl-row--reverse' : ''}`}>
              <div className="cl-row-media">
                <img src={product.image} alt={name} />
              </div>
              <div className="cl-row-text">
                <div className="cl-row-eyebrow">{category}</div>
                <div className="cl-row-name">{name}</div>
                {blurb && <div className="cl-row-blurb">{blurb}</div>}
                {specParts.length > 0 && <div className="cl-row-specs">{specParts.join('   ·   ')}</div>}
                <div className="cl-row-foot">
                  <div className="cl-row-price">
                    {product.price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    <span className="cl-eur"> €</span>
                  </div>
                  {product.sku && <div className="cl-row-sku">{L.ref} {product.sku}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ flex: 1 }} />
      <div className="cl-foot-rule" />
      <div className="cl-foot">
        <span>officelabsco.com</span>
        <span>office@officelabsco.com</span>
      </div>
    </div>
  );
}

/* ─── Cover page ────────────────────────────────────── */
function CoverPage({ products, seriesList, lang }: { products: CatalogProduct[]; seriesList: SeriesInfo[]; lang: 'bg' | 'en' }) {
  const isBg = lang === 'bg';
  const seriesGroups = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => map.set(p.series, (map.get(p.series) ?? 0) + 1));
    return [...map.entries()];
  }, [products]);

  return (
    <div className="cl-page cl-cover">
      <div className="cl-cover-top">
        <div style={{ fontSize: '14pt', letterSpacing: '-.03em' }}>
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.5, fontSize: '0.86em', marginLeft: 1 }}>co.</span>
        </div>
        <div className="cl-cover-subtitle">{isBg ? 'Продуктов каталог' : 'Product Catalogue'}</div>
      </div>

      <div className="cl-cover-main">
        <div className="cl-cover-title">{isBg ? 'Колекция\nмебели' : 'Furniture\nCollection'}</div>
        <div className="cl-cover-rule" />
        <div className="cl-cover-stats">
          <div className="cl-cover-stat">
            <span className="cl-cover-stat-val">{products.length}</span>
            <span className="cl-cover-stat-lbl">{isBg ? 'продукта' : 'products'}</span>
          </div>
          <div className="cl-cover-stat">
            <span className="cl-cover-stat-val">{seriesGroups.length}</span>
            <span className="cl-cover-stat-lbl">{isBg ? 'серии' : 'series'}</span>
          </div>
        </div>
      </div>

      <div className="cl-cover-series">
        {seriesGroups.map(([name, count]) => {
          const s = seriesList.find(x => x.name === name);
          const accentColor = s?.color && s.color !== '#F5F0EB' && s.color !== '#E8EDE8' ? s.color : '#111';
          return (
            <div key={name} className="cl-cover-row">
              <div className="cl-cover-bar" style={{ background: accentColor }} />
              <span className="cl-cover-sname">{name}</span>
              <span className="cl-cover-scount">{count} {isBg ? 'модела' : 'models'}</span>
            </div>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />
      <div className="cl-foot-rule" />
      <div className="cl-foot">
        <span>officelabsco.com</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </div>
  );
}

/* ─── Main Generator ────────────────────────────────── */
export default function CatalogGenerator3({
  products,
  seriesList,
}: {
  products: CatalogProduct[];
  seriesList: SeriesInfo[];
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(products.map(p => p.id)));
  const [search, setSearch] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [lang, setLang] = useState<'bg' | 'en'>('bg');
  const [showCover, setShowCover] = useState(true);
  const [showDividers, setShowDividers] = useState(true);

  const categoryList = useMemo(
    () => [...new Set(products.map(p => p.category))].sort((a, b) => a.localeCompare(b, 'bg')),
    [products],
  );

  const filtered = useMemo(
    () => products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !(p.sku ?? '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterSeries && p.series !== filterSeries) return false;
      if (filterCategory && p.category !== filterCategory) return false;
      return true;
    }),
    [products, search, filterSeries, filterCategory],
  );

  const selectedProducts = products.filter(p => selected.has(p.id));

  function toggle(id: number) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function selectFiltered() {
    setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.add(p.id)); return n; });
  }
  function clearFiltered() {
    setSelected(prev => { const n = new Set(prev); filtered.forEach(p => n.delete(p.id)); return n; });
  }

  /* Build page sequence with series dividers — products are grouped into
     pages of up to 3, never mixing two series on the same page. The image
     side alternates by the product's position in the whole selection
     (startIdx + row index), the same way /gallery/[series] alternates its
     feature rows, so the pattern keeps running across page breaks. */
  type PageItem =
    | { type: 'group'; products: CatalogProduct[]; startIdx: number }
    | { type: 'divider'; series: SeriesInfo; count: number };

  const pageItems = useMemo<PageItem[]>(() => {
    const items: PageItem[] = [];
    let lastSeries = '';
    let buffer: CatalogProduct[] = [];
    let globalIdx = 0;

    function flush() {
      if (buffer.length > 0) {
        items.push({ type: 'group', products: buffer, startIdx: globalIdx - buffer.length });
        buffer = [];
      }
    }

    selectedProducts.forEach(p => {
      if (p.series !== lastSeries) {
        flush();
        lastSeries = p.series;
        if (showDividers) {
          const sInfo = seriesList.find(s => s.name === p.series) ?? { name: p.series, slug: p.seriesSlug, tagline: p.series, taglineEn: p.series, color: p.seriesColor };
          const count = selectedProducts.filter(sp => sp.series === p.series).length;
          items.push({ type: 'divider', series: sInfo, count });
        }
      }
      buffer.push(p);
      globalIdx++;
      if (buffer.length === 3) flush();
    });
    flush();

    return items;
  }, [selectedProducts, showDividers, seriesList]);

  /* Attach a running page number to each group, ignoring cover/divider pages */
  const numberedPageItems = useMemo(() => {
    let n = 0;
    return pageItems.map(item => item.type === 'group' ? { ...item, pageNum: ++n } : item);
  }, [pageItems]);

  const groupPageCount = pageItems.filter(i => i.type === 'group').length;
  const dividerCount = pageItems.filter(i => i.type === 'divider').length;
  const totalPages = (showCover ? 1 : 0) + dividerCount + groupPageCount;

  return (
    <>
      <style>{CSS}</style>

      {/* ── TOP BAR ── */}
      <div className="no-print cl-topbar">
        <div className="cl-tb-brand">
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.55, fontSize: '0.86em' }}>co.</span>
          <span className="cl-tb-sep" />
          <span className="cl-tb-title">Каталог Генератор · 3 на страница</span>
        </div>
        <div style={{ flex: 1 }} />
        <div className="cl-tb-controls">
          <label className="cl-toggle-label">
            <input type="checkbox" checked={showCover} onChange={e => setShowCover(e.target.checked)} className="cl-toggle-check" />
            Корица
          </label>
          <label className="cl-toggle-label">
            <input type="checkbox" checked={showDividers} onChange={e => setShowDividers(e.target.checked)} className="cl-toggle-check" />
            Серийни страници
          </label>
          <div className="cl-lang-switcher">
            <button className={`cl-lang-btn${lang === 'bg' ? ' cl-lang-btn--on' : ''}`} onClick={() => setLang('bg')}>BG</button>
            <button className={`cl-lang-btn${lang === 'en' ? ' cl-lang-btn--on' : ''}`} onClick={() => setLang('en')}>EN</button>
          </div>
          <span className="cl-tb-count">{totalPages === 0 ? '—' : `${totalPages} стр.`}</span>
          <button className="cl-print-btn" onClick={() => window.print()} disabled={selectedProducts.length === 0}>
            ↓ Принтирай PDF
          </button>
        </div>
      </div>

      {/* ── LAYOUT ── */}
      <div className="cl-layout">
        {/* SIDEBAR */}
        <aside className="no-print cl-sidebar">
          <div className="cl-sb-head">
            <span className="cl-sb-title">Продукти</span>
            <span className="cl-sb-count">{products.length}</span>
          </div>
          <div className="cl-sb-filters">
            <input className="cl-search" placeholder="Търси продукт..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="cl-select" value={filterSeries} onChange={e => setFilterSeries(e.target.value)}>
              <option value="">Всички серии</option>
              {seriesList.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
            <select className="cl-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">Всички категории</option>
              {categoryList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="cl-sb-actions">
              <button className="cl-sb-btn" onClick={selectFiltered}>Избери всички</button>
              <button className="cl-sb-btn cl-sb-btn--ghost" onClick={clearFiltered}>Изчисти</button>
            </div>
          </div>
          <div className="cl-product-list">
            {filtered.map(p => (
              <label key={p.id} className={`cl-pitem${selected.has(p.id) ? ' cl-pitem--on' : ''}`}>
                <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} className="cl-pcheck" />
                <div className="cl-pthumb"><img src={p.image} alt="" /></div>
                <div className="cl-pinfo">
                  <div className="cl-pname-sb">{p.name}</div>
                  <div className="cl-pmeta">
                    <span className="cl-pseries" style={{ color: p.seriesColor !== '#F5F0EB' && p.seriesColor !== '#E8EDE8' ? p.seriesColor : '#888' }}>{p.series}</span>
                    <span className="cl-pprice">{p.price.toLocaleString('de-DE', { minimumFractionDigits: 0 })} €</span>
                  </div>
                </div>
              </label>
            ))}
            {filtered.length === 0 && <div className="cl-no-results">Няма резултати</div>}
          </div>
        </aside>

        {/* PAGES */}
        <main className="cl-pages">
          {selectedProducts.length === 0 ? (
            <div className="cl-empty-state">
              <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
              <div style={{ fontSize: 14, color: '#999', maxWidth: 260, textAlign: 'center', lineHeight: 1.6 }}>
                Избери продукти от списъка вляво за да генерираш страниците на каталога
              </div>
            </div>
          ) : (
            <>
              {showCover && <CoverPage products={selectedProducts} seriesList={seriesList} lang={lang} />}
              {numberedPageItems.map((item) =>
                item.type === 'divider' ? (
                  <SeriesDividerPage key={`div-${item.series.name}`} series={item.series} productCount={item.count} lang={lang} />
                ) : (
                  <CatalogPageGroup
                    key={`grp-${item.startIdx}`}
                    products={item.products}
                    pageNum={item.pageNum}
                    totalPages={groupPageCount}
                    startIdx={item.startIdx}
                    lang={lang}
                  />
                )
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const CSS = `
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #D8D8D4; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

/* TOP BAR */
.cl-topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 50px; background: #111; color: #fff;
  display: flex; align-items: center; padding: 0 20px; gap: 10px;
}
.cl-tb-brand { display: flex; align-items: center; gap: 3px; font-size: 15px; letter-spacing: -.02em; flex-shrink: 0; }
.cl-tb-sep { width: 1px; height: 16px; background: rgba(255,255,255,.2); margin: 0 10px; }
.cl-tb-title { font-size: 10.5px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,255,255,.45); }
.cl-tb-controls { display: flex; align-items: center; gap: 14px; }
.cl-toggle-label { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,.65); cursor: pointer; user-select: none; }
.cl-toggle-check { accent-color: #fff; cursor: pointer; }
.cl-lang-switcher { display: flex; border: 1px solid rgba(255,255,255,.25); border-radius: 5px; overflow: hidden; }
.cl-lang-btn { padding: 4px 10px; background: transparent; color: rgba(255,255,255,.5); border: none; cursor: pointer; font-size: 11px; font-weight: 600; letter-spacing: .06em; transition: all .15s; font-family: inherit; }
.cl-lang-btn--on { background: rgba(255,255,255,.18); color: #fff; }
.cl-tb-count { font-size: 12px; color: rgba(255,255,255,.5); white-space: nowrap; }
.cl-print-btn { padding: 8px 18px; background: #fff; color: #111; border: none; border-radius: 6px; font-size: 12.5px; font-weight: 700; cursor: pointer; letter-spacing: -.01em; white-space: nowrap; transition: opacity .15s; font-family: inherit; }
.cl-print-btn:disabled { opacity: .35; cursor: not-allowed; }
.cl-print-btn:not(:disabled):hover { opacity: .88; }

/* LAYOUT */
.cl-layout { display: flex; min-height: 100vh; padding-top: 50px; }

/* SIDEBAR */
.cl-sidebar { width: 268px; flex-shrink: 0; background: #fff; border-right: 1px solid #E4E4E0; position: fixed; top: 50px; bottom: 0; left: 0; display: flex; flex-direction: column; overflow: hidden; }
.cl-sb-head { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px 10px; border-bottom: 1px solid #EFEFED; }
.cl-sb-title { font-size: 12.5px; font-weight: 700; color: #111; }
.cl-sb-count { font-size: 11px; background: #F0F0EE; color: #666; padding: 1px 7px; border-radius: 10px; font-weight: 600; }
.cl-sb-filters { padding: 10px 14px; border-bottom: 1px solid #EFEFED; display: flex; flex-direction: column; gap: 7px; }
.cl-search { width: 100%; padding: 7px 10px; border: 1px solid #E4E4E0; border-radius: 6px; font-size: 12.5px; outline: none; font-family: inherit; color: #111; background: #FAFAFA; }
.cl-search:focus { border-color: #aaa; background: #fff; }
.cl-select { width: 100%; padding: 6px 28px 6px 10px; border: 1px solid #E4E4E0; border-radius: 6px; font-size: 12px; outline: none; font-family: inherit; appearance: none; background: #FAFAFA url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 9px center; color: #333; cursor: pointer; }
.cl-sb-actions { display: flex; gap: 6px; }
.cl-sb-btn { flex: 1; padding: 6px 0; background: #111; color: #fff; border: none; border-radius: 5px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; }
.cl-sb-btn--ghost { background: transparent; color: #666; border: 1px solid #ddd; }
.cl-product-list { flex: 1; overflow-y: auto; }
.cl-pitem { display: flex; align-items: center; gap: 9px; padding: 8px 14px; cursor: pointer; border-bottom: 1px solid #F5F5F3; transition: background .1s; }
.cl-pitem:hover { background: #F8F8F6; }
.cl-pitem--on { background: #F0F6FF; }
.cl-pcheck { width: 14px; height: 14px; flex-shrink: 0; cursor: pointer; accent-color: #111; }
.cl-pthumb { width: 38px; height: 38px; flex-shrink: 0; border-radius: 4px; background: #F5F5F3; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cl-pthumb img { width: 100%; height: 100%; object-fit: contain; }
.cl-pinfo { flex: 1; min-width: 0; }
.cl-pname-sb { font-size: 12px; font-weight: 600; color: #111; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cl-pmeta { display: flex; justify-content: space-between; margin-top: 2px; }
.cl-pseries { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }
.cl-pprice { font-size: 11px; color: #555; font-variant-numeric: tabular-nums; }
.cl-no-results { padding: 20px 16px; text-align: center; font-size: 12px; color: #bbb; }

/* PAGES AREA */
.cl-pages { flex: 1; margin-left: 268px; padding: 44px 32px 60px; }
.cl-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 500px; }

/* ══════════════════════════════════════
   BASE A4 PAGE
══════════════════════════════════════ */
.cl-page {
  width: 210mm;
  background: #fff; color: #111;
  margin: 0 auto 52px;
  box-shadow: 0 2px 32px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.06);
  font-size: 10pt;
}

/* ══════════════════════════════════════
   SERIES DIVIDER PAGE
══════════════════════════════════════ */
.cl-div-page {
  display: flex !important;
  flex-direction: row !important;
  min-height: 297mm;
  padding: 0 !important;
}
.cl-div-img { flex: 0 0 60%; overflow: hidden; }
.cl-div-hero { width: 100%; height: 100%; object-fit: cover; display: block; }
.cl-div-panel {
  flex: 1;
  display: flex; flex-direction: column;
  padding: 13mm 11mm 9mm;
  background: #fff;
}
.cl-div-logo { font-size: 11.5pt; letter-spacing: -.03em; flex-shrink: 0; margin-bottom: 1mm; }
.cl-div-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 6mm 0; }
.cl-div-eyebrow { font-size: 7pt; text-transform: uppercase; letter-spacing: .18em; color: #bbb; margin-bottom: 4mm; }
.cl-div-name { font-size: 28pt; font-weight: 900; letter-spacing: -.03em; line-height: 1; color: #111; margin-bottom: 5mm; }
.cl-div-accent { width: 10mm; height: .9mm; margin-bottom: 5mm; background: #111; }
.cl-div-tagline { font-size: 10pt; color: #555; line-height: 1.55; margin-bottom: 6mm; }
.cl-div-count { font-size: 7.5pt; color: #bbb; text-transform: uppercase; letter-spacing: .12em; }
.cl-div-foot { flex-shrink: 0; font-size: 7pt; color: #ccc; letter-spacing: .04em; }

/* ══════════════════════════════════════
   GROUP PAGE — 3 products per page, rows
   alternating image-left / image-right
   like /gallery/[series]
══════════════════════════════════════ */
.cl-group-page {
  min-height: 297mm;
  padding: 11mm 13mm 9mm;
  display: flex; flex-direction: column;
}

/* Header (shared with the old single-product page) */
.cl-header { display: flex; align-items: center; gap: 6mm; margin-bottom: 2.5mm; }
.cl-logo { font-size: 12.5pt; letter-spacing: -.03em; flex-shrink: 0; }
.cl-header-mid { display: flex; align-items: center; gap: 3mm; flex: 1; }
.cl-series-tag { font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; border: 1px solid; padding: .8mm 2.5mm; border-radius: 1.5mm; flex-shrink: 0; }
.cl-cat-label { font-size: 7.5pt; color: #888; }
.cl-pageno { font-size: 7.5pt; color: #ccc; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.cl-hr { height: .7mm; margin-bottom: 4.5mm; flex-shrink: 0; }

/* Rows: 3 per page, each a fixed-height image/text pair */
.cl-rows { display: flex; flex-direction: column; gap: 8mm; flex: 1; min-height: 0; }
.cl-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; height: 78mm; flex-shrink: 0; }
.cl-row--reverse .cl-row-media { order: 2; }
.cl-row--reverse .cl-row-text { order: 1; }

.cl-row-media {
  height: 100%;
  background: #fafafa;
  border-radius: 4mm;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.cl-row-media img { width: 100%; height: 100%; object-fit: contain; padding: 4mm; display: block; }

.cl-row-text { height: 100%; display: flex; flex-direction: column; min-width: 0; padding: 1mm 0; }
.cl-row-eyebrow { font-size: 6.5pt; text-transform: uppercase; letter-spacing: .12em; color: #aaa; margin-bottom: 2mm; }
.cl-row-name { font-size: 13pt; font-weight: 800; line-height: 1.18; letter-spacing: -.02em; color: #111; margin-bottom: 2.5mm; }
.cl-row-blurb {
  font-size: 8pt; line-height: 1.6; color: #666; margin-bottom: 3.5mm;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cl-row-specs { font-size: 7.5pt; color: #777; line-height: 1.6; margin-bottom: auto; }
.cl-row-foot { display: flex; align-items: baseline; gap: 4mm; margin-top: 3.5mm; }
.cl-row-price { font-size: 15pt; font-weight: 900; letter-spacing: -.03em; color: #111; }
.cl-eur { font-size: 10pt; font-weight: 500; opacity: .5; }
.cl-row-sku { font-size: 6.5pt; color: #ccc; letter-spacing: .08em; text-transform: uppercase; }

/* Footer */
.cl-foot-rule { height: .3mm; background: #E6E6E2; margin-top: auto; flex-shrink: 0; margin-bottom: 3mm; }
.cl-foot { display: flex; justify-content: space-between; font-size: 7pt; color: #bbb; letter-spacing: .04em; flex-shrink: 0; }

/* ══════════════════════════════════════
   COVER PAGE
══════════════════════════════════════ */
.cl-cover { min-height: 297mm; padding: 11mm 13mm 9mm; display: flex; flex-direction: column; }
.cl-cover-top { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 24mm; flex-shrink: 0; }
.cl-cover-subtitle { font-size: 8pt; text-transform: uppercase; letter-spacing: .14em; color: #999; }
.cl-cover-main { flex-shrink: 0; }
.cl-cover-title { font-size: 50pt; font-weight: 900; line-height: 1.0; letter-spacing: -.04em; color: #111; white-space: pre-line; margin-bottom: 10mm; }
.cl-cover-rule { height: 1mm; background: #111; width: 18mm; margin-bottom: 8mm; }
.cl-cover-stats { display: flex; gap: 12mm; margin-bottom: 18mm; }
.cl-cover-stat { display: flex; flex-direction: column; gap: 1mm; }
.cl-cover-stat-val { font-size: 22pt; font-weight: 800; letter-spacing: -.03em; color: #111; }
.cl-cover-stat-lbl { font-size: 8pt; text-transform: uppercase; letter-spacing: .1em; color: #aaa; }
.cl-cover-series { display: flex; flex-direction: column; gap: 4mm; flex-shrink: 0; }
.cl-cover-row { display: flex; align-items: center; gap: 4mm; }
.cl-cover-bar { width: 3mm; height: 8mm; border-radius: .5mm; flex-shrink: 0; }
.cl-cover-sname { font-size: 12pt; font-weight: 700; letter-spacing: -.01em; color: #111; flex: 1; }
.cl-cover-scount { font-size: 8pt; color: #bbb; letter-spacing: .04em; }

/* ══════════════════════════════════════
   PRINT
══════════════════════════════════════ */
@media print {
  .no-print { display: none !important; }
  body { background: #fff; }
  @page { size: A4 portrait; margin: 0; }
  .cl-layout { padding-top: 0; display: block; }
  .cl-pages { margin-left: 0; padding: 0; }

  .cl-page {
    width: 210mm; height: 297mm;
    min-height: 0 !important;
    margin: 0; box-shadow: none;
    page-break-after: always; break-after: page;
    overflow: hidden;
  }
  .cl-page:last-child { page-break-after: avoid; break-after: avoid; }
  .cl-empty-state { display: none !important; }
}
`;
