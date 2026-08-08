import type { ReactNode } from 'react';

export const metadata = { title: 'OfficeLabs — Дилърски портал' };

export default function DealersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #0c0c0c;
          color: #fff;
          min-height: 100vh;
        }

        /* Ambient glow for authenticated pages (covered by login/register fixed bg) */
        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse at 15% 0%, rgba(245,158,11,.10) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 100%, rgba(28,28,28,.6) 0%, transparent 55%);
          pointer-events: none;
        }

        /* ── Topbar ── */
        .dl-topbar {
          position: sticky; top: 0; z-index: 100;
          height: 58px;
          background: rgba(10,10,10,.8);
          backdrop-filter: blur(20px) saturate(1.5);
          -webkit-backdrop-filter: blur(20px) saturate(1.5);
          border-bottom: 1px solid rgba(255,255,255,.08);
          color: #fff;
          display: flex; align-items: center; padding: 0 24px; gap: 16px;
        }
        .dl-topbar__logo { font-size: 15px; font-weight: 800; letter-spacing: -.03em; color: #fff; }
        .dl-topbar__sep { width: 1px; height: 16px; background: rgba(255,255,255,.12); }
        .dl-topbar__label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.35); }
        .dl-topbar__spacer { flex: 1; }
        .dl-topbar__nav { display: flex; align-items: center; gap: 2px; }
        .dl-topbar__link {
          padding: 6px 13px; border-radius: 8px; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.55); text-decoration: none; transition: background .15s, color .15s;
        }
        .dl-topbar__link:hover { background: rgba(255,255,255,.08); color: rgba(255,255,255,.9); }
        .dl-topbar__link.active {
          background: rgba(245,158,11,.15);
          color: #F59E0B;
          border: 1px solid rgba(245,158,11,.25);
        }
        .dl-topbar__logout {
          padding: 6px 14px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 8px; font-size: 13px; color: rgba(255,255,255,.65);
          cursor: pointer; font-family: inherit; transition: background .15s, color .15s;
        }
        .dl-topbar__logout:hover { background: rgba(255,255,255,.12); color: #fff; }

        /* ── Page containers ── */
        .dl-page {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px;
        }
        .dl-page--narrow { max-width: 480px; }
        .dl-page--medium { max-width: 720px; }

        /* ── Glass card ── */
        .dl-card {
          background: rgba(255,255,255,.07);
          backdrop-filter: blur(18px) saturate(1.4);
          -webkit-backdrop-filter: blur(18px) saturate(1.4);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 18px;
          padding: 28px;
        }

        /* ── Forms ── */
        .dl-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .dl-form-group label { font-size: 12px; font-weight: 600; color: rgba(255,255,255,.55); text-transform: uppercase; letter-spacing: .07em; }
        .dl-form-group input, .dl-form-group select, .dl-form-group textarea {
          padding: 11px 13px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #fff;
          outline: none; transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .dl-form-group input::placeholder,
        .dl-form-group textarea::placeholder { color: rgba(255,255,255,.22); }
        .dl-form-group input:focus,
        .dl-form-group select:focus,
        .dl-form-group textarea:focus {
          border-color: rgba(245,158,11,.6);
          background: rgba(255,255,255,.1);
          box-shadow: 0 0 0 3px rgba(245,158,11,.12);
        }
        .dl-form-group select option { background: #1a1a1a; color: #fff; }
        .dl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dl-form-hint { font-size: 12px; color: rgba(255,255,255,.3); }
        .dl-form-error {
          font-size: 13px; color: #FCA5A5;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.22);
          padding: 10px 14px; border-radius: 10px;
        }

        /* Search input (standalone, not in form-group) */
        .dl-search-input {
          padding: 11px 14px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #fff;
          outline: none; min-width: 240px;
          transition: border-color .15s, background .15s;
        }
        .dl-search-input::placeholder { color: rgba(255,255,255,.3); }
        .dl-search-input:focus {
          border-color: rgba(245,158,11,.5);
          background: rgba(255,255,255,.1);
        }

        /* ── Buttons ── */
        .dl-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 22px; border-radius: 10px; font-size: 14px; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: opacity .15s, transform .1s, box-shadow .15s;
          border: none; text-decoration: none; letter-spacing: -.01em;
        }
        .dl-btn--primary {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(245,158,11,.3);
        }
        .dl-btn--primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); box-shadow: 0 6px 28px rgba(245,158,11,.4); }
        .dl-btn--outline {
          background: rgba(255,255,255,.07);
          border: 1.5px solid rgba(255,255,255,.18);
          color: rgba(255,255,255,.75);
        }
        .dl-btn--outline:hover:not(:disabled) { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.3); color: #fff; }
        .dl-btn--full { width: 100%; }
        .dl-btn--sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
        .dl-btn--danger { background: linear-gradient(135deg, #EF4444, #DC2626); color: #fff; }
        .dl-btn--success { background: linear-gradient(135deg, #22C55E, #16A34A); color: #fff; }
        .dl-btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

        /* ── Badges ── */
        .dl-badge {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
        }
        .dl-badge--pending    { background: rgba(251,191,36,.15); color: #FCD34D; border: 1px solid rgba(251,191,36,.25); }
        .dl-badge--approved   { background: rgba(34,197,94,.12);  color: #86EFAC; border: 1px solid rgba(34,197,94,.22); }
        .dl-badge--rejected   { background: rgba(239,68,68,.12);  color: #FCA5A5; border: 1px solid rgba(239,68,68,.22); }
        .dl-badge--new        { background: rgba(96,165,250,.12); color: #93C5FD; border: 1px solid rgba(96,165,250,.22); }
        .dl-badge--processing { background: rgba(251,191,36,.12); color: #FCD34D; border: 1px solid rgba(251,191,36,.22); }
        .dl-badge--shipped    { background: rgba(167,139,250,.12); color: #C4B5FD; border: 1px solid rgba(167,139,250,.22); }
        .dl-badge--completed  { background: rgba(34,197,94,.12);  color: #86EFAC; border: 1px solid rgba(34,197,94,.22); }
        .dl-badge--cancelled  { background: rgba(255,255,255,.06); color: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.1); }

        /* ── Typography ── */
        .dl-title  { font-size: 24px; font-weight: 800; letter-spacing: -.04em; margin-bottom: 4px; color: #fff; }
        .dl-subtitle { font-size: 14px; color: rgba(255,255,255,.4); margin-bottom: 24px; }

        /* ── Product grid ── */
        .dl-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
          gap: 12px;
        }

        /* ── Product card ── */
        .dl-product-card {
          background: rgba(255,255,255,.07);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,.25);
          display: flex; flex-direction: row; align-items: stretch;
          position: relative; overflow: hidden;
          transition: box-shadow .2s, border-color .2s;
          min-height: 160px;
        }
        .dl-product-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,.45);
          border-color: rgba(255,255,255,.18);
        }

        .dl-product-card__badge {
          position: absolute; top: 0; right: 0;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: #fff;
          font-size: 12px; font-weight: 800; letter-spacing: -.01em;
          padding: 5px 13px;
          border-radius: 0 18px 0 12px;
          line-height: 1; z-index: 2;
        }

        .dl-product-card__img {
          width: 160px; min-height: 160px; flex-shrink: 0;
          background: rgba(255,255,255,.04);
          border-right: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .dl-product-card__img img {
          width: 100%; height: 100%; object-fit: contain; padding: 16px;
          transition: transform .3s;
        }
        .dl-product-card:hover .dl-product-card__img img { transform: scale(1.04); }
        .dl-product-card__no-img {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,.2); font-size: 11px;
        }

        .dl-product-card__body {
          flex: 1; padding: 18px 20px 16px; display: flex; flex-direction: column; gap: 10px;
          min-width: 0;
        }
        .dl-product-card__series {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,.35);
          text-transform: uppercase; letter-spacing: .1em;
        }
        .dl-product-card__name {
          font-size: 18px; font-weight: 800; color: #fff;
          letter-spacing: -.03em; line-height: 1.2; margin-top: -2px;
        }
        .dl-product-card__colors {
          display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        }
        .dl-product-card__color-btn {
          width: 18px; height: 18px; border-radius: 50%; cursor: pointer; padding: 0; border: none;
          box-shadow: 0 0 0 1.5px rgba(255,255,255,.2);
          transition: box-shadow .15s; outline: none; flex-shrink: 0;
        }
        .dl-product-card__color-btn.active { box-shadow: 0 0 0 2px rgba(0,0,0,.6), 0 0 0 4px #F59E0B; }
        .dl-product-card__color-name { font-size: 11px; color: rgba(255,255,255,.4); }

        /* Price blocks */
        .dl-product-card__prices { display: flex; gap: 8px; }
        .dl-product-card__price-block {
          flex: 1; border-radius: 10px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .dl-product-card__price-block--retail { background: rgba(220,38,38,.15); border: 1px solid rgba(220,38,38,.2); }
        .dl-product-card__price-block--dealer  { background: rgba(5,46,22,.8);   border: 1px solid rgba(34,197,94,.15); }

        .dl-product-card__price-head {
          font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
        }
        .dl-product-card__price-block--retail .dl-product-card__price-head { color: rgba(248,113,113,.7); }
        .dl-product-card__price-block--dealer  .dl-product-card__price-head { color: rgba(134,239,172,.55); }
        .dl-product-card__price-main { font-size: 17px; font-weight: 800; letter-spacing: -.03em; line-height: 1; }
        .dl-product-card__price-block--retail .dl-product-card__price-main { color: #F87171; }
        .dl-product-card__price-block--dealer  .dl-product-card__price-main { color: #86EFAC; }
        .dl-product-card__price-vat { font-size: 11px; font-weight: 500; margin-top: 1px; }
        .dl-product-card__price-block--retail .dl-product-card__price-vat { color: rgba(248,113,113,.45); }
        .dl-product-card__price-block--dealer  .dl-product-card__price-vat { color: rgba(134,239,172,.38); }

        /* Quantity + add */
        .dl-product-card__actions { display: flex; gap: 8px; align-items: center; margin-top: auto; }
        .dl-product-card__qty {
          display: flex; align-items: center;
          border: 1.5px solid rgba(255,255,255,.14);
          border-radius: 10px; overflow: hidden; height: 42px;
        }
        .dl-product-card__qty-btn {
          width: 38px; height: 100%; border: none; background: transparent;
          cursor: pointer; font-size: 18px; font-weight: 300; color: rgba(255,255,255,.8);
          display: flex; align-items: center; justify-content: center;
          transition: background .15s; flex-shrink: 0;
        }
        .dl-product-card__qty-btn:hover { background: rgba(255,255,255,.1); }
        .dl-product-card__qty-input {
          width: 36px; text-align: center;
          border: none; border-left: 1.5px solid rgba(255,255,255,.14); border-right: 1.5px solid rgba(255,255,255,.14);
          background: transparent; font-size: 14px; font-weight: 700;
          font-family: inherit; color: #fff; height: 100%;
          -moz-appearance: textfield; padding: 0;
        }
        .dl-product-card__qty-input::-webkit-outer-spin-button,
        .dl-product-card__qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .dl-product-card__add {
          flex: 1; height: 42px;
          background: linear-gradient(135deg, #F59E0B, #D97706);
          color: #fff; border: none;
          border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: inherit; letter-spacing: .01em;
          transition: opacity .15s, box-shadow .15s;
          box-shadow: 0 2px 10px rgba(245,158,11,.3);
        }
        .dl-product-card__add:hover { opacity: .9; box-shadow: 0 4px 18px rgba(245,158,11,.45); }
        .dl-product-card__added { background: linear-gradient(135deg, #22C55E, #16A34A); box-shadow: 0 2px 10px rgba(34,197,94,.3); }

        /* ── Cart bar ── */
        .dl-cart-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(10,10,10,.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,255,255,.1);
          color: #fff; padding: 14px 24px;
          display: flex; align-items: center; gap: 16px;
          transform: translateY(100%); transition: transform .25s;
        }
        .dl-cart-bar.visible { transform: translateY(0); }
        .dl-cart-bar__info { flex: 1; }
        .dl-cart-bar__count { font-size: 13px; color: rgba(255,255,255,.5); }
        .dl-cart-bar__total { font-size: 18px; font-weight: 800; }

        /* ── Orders table ── */
        .dl-order-table { width: 100%; border-collapse: collapse; }
        .dl-order-table th, .dl-order-table td {
          padding: 12px 16px; text-align: left; font-size: 13px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          color: #fff;
        }
        .dl-order-table th {
          font-weight: 700; color: rgba(255,255,255,.35); font-size: 11px;
          text-transform: uppercase; letter-spacing: .07em;
          background: rgba(255,255,255,.03);
        }
        .dl-order-table tr:last-child td { border-bottom: none; }
        .dl-order-table tr:hover td { background: rgba(255,255,255,.04); }

        /* ── Stat row ── */
        .dl-stat-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .dl-stat {
          flex: 1; min-width: 140px;
          background: rgba(255,255,255,.07);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 12px; padding: 16px 20px;
        }
        .dl-stat__label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.35); margin-bottom: 6px; }
        .dl-stat__value { font-size: 22px; font-weight: 800; letter-spacing: -.03em; color: #fff; }
        .dl-stat__value--accent { color: #F59E0B; }

        @media (max-width: 600px) {
          .dl-form-row { grid-template-columns: 1fr; }
          .dl-page { padding: 20px 16px 80px; }
          .dl-card { padding: 20px; }
          .dl-product-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      {children}
    </>
  );
}
