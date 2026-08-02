'use client';

import { useState, useMemo } from 'react';

export interface CatalogProduct {
  id: number;
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
    astra: '/images/hero%20ASTRA.webp',
    terra: '/images/hero%20TERRA.webp',
    nova: '/images/hero%20NOVA.webp',
    loft: '/images/hero%20LOFT.webp',
  };
  return nameMap[slug] ?? '/images/hero%20ASTRA.webp';
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

/* ─── Single A4 product page ────────────────────────── */
function CatalogPage({
  product,
  pageNum,
  total,
  lang,
}: {
  product: CatalogProduct;
  pageNum: number;
  total: number;
  lang: 'bg' | 'en';
}) {
  const isBg = lang === 'bg';
  const name        = isBg ? product.name        : (product.nameEn        ?? product.name);
  const description = isBg ? product.description : (product.descriptionEn ?? product.description);
  const material    = isBg ? product.material    : (product.materialEn    ?? product.material);
  const colors      = isBg ? product.colors      : (product.colorsEn      ?? product.colors);
  const category    = isBg ? product.category    : (product.categoryEn    ?? product.category);

  const extraImages = product.images.filter(img => img !== product.image).slice(0, 4);
  const descParagraphs = parseDescription(description);

  const L = isBg
    ? { material: 'Материал', dims: 'Размери', weight: 'Тегло', colors: 'Цветове', price: 'Цена', series: 'Серия', ref: 'Арт.' }
    : { material: 'Material',  dims: 'Dimensions', weight: 'Weight', colors: 'Colours', price: 'Price', series: 'Series', ref: 'Ref.' };

  return (
    <div className="cl-page cl-product-page">
      {/* ── HEADER ── */}
      <div className="cl-header">
        <div className="cl-logo">
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.5, fontSize: '0.86em', marginLeft: 1 }}>co.</span>
        </div>
        <div className="cl-header-mid">
          <span className="cl-series-tag" style={{ color: product.seriesColor, borderColor: product.seriesColor }}>
            {product.series}
          </span>
          <span className="cl-cat-label">/ {category}</span>
        </div>
        <div className="cl-pageno">
          {String(pageNum).padStart(2, '0')}
          <span style={{ opacity: 0.35 }}> / </span>
          {String(total).padStart(2, '0')}
        </div>
      </div>
      <div className="cl-hr" style={{ background: product.seriesColor !== '#F5F0EB' && product.seriesColor !== '#E8EDE8' ? product.seriesColor : '#111' }} />

      {/* ── BODY: image + specs ── */}
      <div className="cl-body">
        {/* Image column */}
        <div className="cl-img-col">
          <div className="cl-img-main">
            <img src={product.image} alt={name} />
          </div>
          {extraImages.length > 0 && (
            <div
              className="cl-img-grid"
              style={{ gridTemplateColumns: `repeat(${Math.min(extraImages.length, 2)}, 1fr)` }}
            >
              {extraImages.map((src, i) => (
                <div key={i} className="cl-img-cell"><img src={src} alt="" /></div>
              ))}
            </div>
          )}
        </div>

        {/* Specs column */}
        <div className="cl-specs-col">
          <div className="cl-pname">{name}</div>
          {product.sku && <div className="cl-sku">{L.ref} {product.sku}</div>}

          <div className="cl-divider" />

          <div className="cl-specs">
            {material && (
              <div className="cl-spec">
                <span className="cl-sk">{L.material}</span>
                <span className="cl-sv">{material}</span>
              </div>
            )}
            {product.dimensions && (
              <div className="cl-spec">
                <span className="cl-sk">{L.dims}</span>
                <span className="cl-sv">{product.dimensions}</span>
              </div>
            )}
            {product.weight && (
              <div className="cl-spec">
                <span className="cl-sk">{L.weight}</span>
                <span className="cl-sv">{product.weight}</span>
              </div>
            )}
            {colors && (
              <div className="cl-spec">
                <span className="cl-sk">{L.colors}</span>
                <span className="cl-sv">{colors}</span>
              </div>
            )}
          </div>

          <div className="cl-divider" />

          <div className="cl-price-block">
            <div className="cl-price-lbl">{L.price}</div>
            <div className="cl-price">
              {product.price.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="cl-eur"> €</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          <div className="cl-series-mark">
            <div className="cl-sm-line" style={{ background: product.seriesColor !== '#F5F0EB' && product.seriesColor !== '#E8EDE8' ? product.seriesColor : '#888' }} />
            <span className="cl-sm-text">{L.series} {product.series}</span>
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION ── */}
      {descParagraphs.length > 0 && (
        <div className="cl-desc-section">
          <div className="cl-desc-rule" />
          <div className="cl-desc-text">
            {descParagraphs.map((para, pi) => (
              <div key={pi} className="cl-desc-para">
                {para.map((sentence, si) => {
                  const isMeta = /^(Размери|Гаранц|Warranty|Dimensions|Weight)/.test(sentence);
                  return (
                    <span key={si} className={`cl-desc-line${isMeta ? ' cl-desc-line--meta' : ''}`}>
                      {sentence}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

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
export default function CatalogGenerator({
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

  /* Build page sequence with series dividers */
  type PageItem =
    | { type: 'product'; product: CatalogProduct; productIdx: number }
    | { type: 'divider'; series: SeriesInfo; count: number };

  const pageItems = useMemo<PageItem[]>(() => {
    const items: PageItem[] = [];
    let lastSeries = '';
    let productIdx = 0;

    selectedProducts.forEach(p => {
      if (p.series !== lastSeries) {
        lastSeries = p.series;
        if (showDividers) {
          const sInfo = seriesList.find(s => s.name === p.series) ?? { name: p.series, slug: p.seriesSlug, tagline: p.series, taglineEn: p.series, color: p.seriesColor };
          const count = selectedProducts.filter(sp => sp.series === p.series).length;
          items.push({ type: 'divider', series: sInfo, count });
        }
      }
      productIdx++;
      items.push({ type: 'product', product: p, productIdx });
    });

    return items;
  }, [selectedProducts, showDividers, seriesList]);

  const dividerCount = showDividers ? new Set(selectedProducts.map(p => p.series)).size : 0;
  const totalPages = (showCover ? 1 : 0) + dividerCount + selectedProducts.length;

  return (
    <>
      <style>{CSS}</style>

      {/* ── TOP BAR ── */}
      <div className="no-print cl-topbar">
        <div className="cl-tb-brand">
          <span style={{ fontWeight: 800 }}>OfficeLabs</span>
          <span style={{ fontWeight: 300, opacity: 0.55, fontSize: '0.86em' }}>co.</span>
          <span className="cl-tb-sep" />
          <span className="cl-tb-title">Каталог Генератор</span>
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
              {pageItems.map((item, idx) =>
                item.type === 'divider' ? (
                  <SeriesDividerPage key={`div-${item.series.name}`} series={item.series} productCount={item.count} lang={lang} />
                ) : (
                  <CatalogPage key={item.product.id} product={item.product} pageNum={item.productIdx} total={selectedProducts.length} lang={lang} />
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
   PRODUCT PAGE
══════════════════════════════════════ */
.cl-product-page {
  min-height: 297mm;
  padding: 11mm 13mm 9mm;
  display: flex; flex-direction: column;
}

/* Header */
.cl-header { display: flex; align-items: center; gap: 6mm; margin-bottom: 2.5mm; }
.cl-logo { font-size: 12.5pt; letter-spacing: -.03em; flex-shrink: 0; }
.cl-header-mid { display: flex; align-items: center; gap: 3mm; flex: 1; }
.cl-series-tag { font-size: 6.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; border: 1px solid; padding: .8mm 2.5mm; border-radius: 1.5mm; flex-shrink: 0; }
.cl-cat-label { font-size: 7.5pt; color: #888; }
.cl-pageno { font-size: 7.5pt; color: #ccc; flex-shrink: 0; font-variant-numeric: tabular-nums; }
.cl-hr { height: .7mm; margin-bottom: 4.5mm; flex-shrink: 0; }

/* Body: image + specs */
.cl-body { display: flex; gap: 7mm; flex-shrink: 0; height: 152mm; }

/* Image column — wider, with 2×2 thumbnail grid */
.cl-img-col { flex: 0 0 58%; display: flex; flex-direction: column; gap: 3mm; }
.cl-img-main { flex: 1; background: #F6F6F4; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cl-img-main img { width: 100%; height: 100%; object-fit: contain; display: block; }
.cl-img-grid { display: grid; gap: 2.5mm; flex-shrink: 0; height: 48mm; }
.cl-img-cell { background: #F6F6F4; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.cl-img-cell img { width: 100%; height: 100%; object-fit: contain; }

.cl-specs-col { flex: 1; display: flex; flex-direction: column; min-width: 0; padding-top: 1mm; }
.cl-pname { font-size: 15pt; font-weight: 800; line-height: 1.15; letter-spacing: -.025em; color: #111; }
.cl-sku { font-size: 7pt; color: #bbb; margin-top: 2mm; letter-spacing: .1em; text-transform: uppercase; }
.cl-divider { height: .3mm; background: #E6E6E2; margin: 3.5mm 0; flex-shrink: 0; }
.cl-specs { display: flex; flex-direction: column; gap: 2.5mm; }
.cl-spec { display: flex; gap: 2mm; align-items: flex-start; }
.cl-sk { font-size: 6.5pt; text-transform: uppercase; letter-spacing: .1em; color: #aaa; width: 32%; flex-shrink: 0; padding-top: .5mm; line-height: 1.5; }
.cl-sv { font-size: 8pt; color: #222; font-weight: 500; line-height: 1.5; flex: 1; }
.cl-price-block { flex-shrink: 0; }
.cl-price-lbl { font-size: 6.5pt; text-transform: uppercase; letter-spacing: .1em; color: #aaa; margin-bottom: 1.5mm; }
.cl-price { font-size: 21pt; font-weight: 900; letter-spacing: -.04em; color: #111; line-height: 1; }
.cl-eur { font-size: 12pt; font-weight: 500; opacity: .5; }
.cl-series-mark { display: flex; align-items: center; gap: 3mm; margin-top: auto; padding-top: 4mm; flex-shrink: 0; }
.cl-sm-line { width: 7mm; height: .5mm; flex-shrink: 0; }
.cl-sm-text { font-size: 7pt; text-transform: uppercase; letter-spacing: .1em; color: #ccc; }

/* Description — sentences per line, paragraph groups */
.cl-desc-section { flex-shrink: 0; margin-top: 5mm; }
.cl-desc-rule { height: .3mm; background: #E6E6E2; margin-bottom: 5mm; }
.cl-desc-text { display: flex; flex-direction: column; gap: 4mm; }
.cl-desc-para { display: flex; flex-direction: column; gap: 0; }
.cl-desc-line { display: block; font-size: 8.5pt; line-height: 1.75; color: #3D3D3D; }
.cl-desc-line--meta { color: #888; font-size: 8pt; font-style: italic; margin-top: 1mm; }

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
