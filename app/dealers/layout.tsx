import type { ReactNode } from 'react';

export const metadata = { title: 'OfficeLabs — Дилърски портал' };

export default function DealersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #F0EDE6;
          color: #1C1C1C;
          min-height: 100vh;
        }

        /* Subtle warm ambient for authenticated pages (covered by login/register fixed bg) */
        body::before {
          content: '';
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse at 10% 0%, rgba(245,158,11,.08) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 100%, rgba(220,210,195,.5) 0%, transparent 50%);
          pointer-events: none;
        }

        /* ── Topbar ── */
        .dl-topbar {
          position: sticky; top: 0; z-index: 100;
          height: 58px;
          background: rgba(255,255,255,.75);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          border-bottom: 1px solid rgba(0,0,0,.08);
          color: #1C1C1C;
          display: flex; align-items: center; padding: 0 24px; gap: 16px;
        }
        .dl-topbar__logo { font-size: 15px; font-weight: 800; letter-spacing: -.03em; color: #1C1C1C; }
        .dl-topbar__sep { width: 1px; height: 16px; background: rgba(0,0,0,.1); }
        .dl-topbar__label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: rgba(0,0,0,.3); }
        .dl-topbar__spacer { flex: 1; }
        .dl-topbar__nav { display: flex; align-items: center; gap: 2px; }
        .dl-topbar__link {
          padding: 6px 13px; border-radius: 8px; font-size: 13px; font-weight: 500;
          color: rgba(0,0,0,.5); text-decoration: none; transition: background .15s, color .15s;
        }
        .dl-topbar__link:hover { background: rgba(0,0,0,.05); color: #1C1C1C; }
        .dl-topbar__link.active {
          background: rgba(245,158,11,.12);
          color: #B45309;
          border: 1px solid rgba(245,158,11,.28);
        }
        .dl-topbar__logout {
          padding: 6px 14px;
          background: rgba(0,0,0,.05);
          border: 1px solid rgba(0,0,0,.1);
          border-radius: 8px; font-size: 13px; color: rgba(0,0,0,.55);
          cursor: pointer; font-family: inherit; transition: background .15s;
        }
        .dl-topbar__logout:hover { background: rgba(0,0,0,.09); color: #1C1C1C; }

        /* ── Page containers ── */
        .dl-page {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px;
        }
        .dl-page--narrow { max-width: 480px; }
        .dl-page--medium { max-width: 720px; }

        /* ── Glass card ── */
        .dl-card {
          background: rgba(255,255,255,.65);
          backdrop-filter: blur(16px) saturate(1.6);
          -webkit-backdrop-filter: blur(16px) saturate(1.6);
          border: 1px solid rgba(255,255,255,.9);
          border-radius: 18px;
          padding: 28px;
          box-shadow: 0 2px 16px rgba(0,0,0,.06);
        }

        /* ── Forms ── */
        .dl-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .dl-form-group label { font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: .07em; }
        .dl-form-group input, .dl-form-group select, .dl-form-group textarea {
          padding: 11px 13px;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #1C1C1C;
          outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .dl-form-group input::placeholder,
        .dl-form-group textarea::placeholder { color: #9CA3AF; }
        .dl-form-group input:focus,
        .dl-form-group select:focus,
        .dl-form-group textarea:focus {
          border-color: rgba(245,158,11,.6);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(245,158,11,.1);
        }
        .dl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dl-form-hint { font-size: 12px; color: #9CA3AF; }
        .dl-form-error {
          font-size: 13px; color: #B91C1C;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          padding: 10px 14px; border-radius: 10px;
        }

        /* Search input (standalone) */
        .dl-search-input {
          padding: 11px 14px;
          background: rgba(255,255,255,.8);
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #1C1C1C;
          outline: none; min-width: 240px;
          transition: border-color .15s, box-shadow .15s;
        }
        .dl-search-input::placeholder { color: #9CA3AF; }
        .dl-search-input:focus {
          border-color: rgba(245,158,11,.5);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(245,158,11,.1);
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
          background: rgba(255,255,255,.7);
          border: 1.5px solid rgba(0,0,0,.14);
          color: #374151;
        }
        .dl-btn--outline:hover:not(:disabled) { background: #fff; border-color: rgba(0,0,0,.25); color: #1C1C1C; }
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
        .dl-badge--pending    { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .dl-badge--approved   { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
        .dl-badge--rejected   { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
        .dl-badge--new        { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
        .dl-badge--processing { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .dl-badge--shipped    { background: #F5F3FF; color: #5B21B6; border: 1px solid #DDD6FE; }
        .dl-badge--completed  { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
        .dl-badge--cancelled  { background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB; }

        /* ── Typography ── */
        .dl-title  { font-size: 24px; font-weight: 800; letter-spacing: -.04em; margin-bottom: 4px; color: #1C1C1C; }
        .dl-subtitle { font-size: 14px; color: #6B7280; margin-bottom: 24px; }

        /* ── Product grid ── */
        .dl-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
          gap: 12px;
        }

        /* ── Product card ── */
        .dl-product-card {
          background: rgba(255,255,255,.7);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.9);
          border-radius: 18px;
          box-shadow: 0 2px 12px rgba(0,0,0,.07);
          display: flex; flex-direction: row; align-items: stretch;
          position: relative; overflow: hidden;
          transition: box-shadow .2s, border-color .2s;
          min-height: 160px;
        }
        .dl-product-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,.13);
          border-color: rgba(0,0,0,.06);
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
          background: #F8F7F4;
          border-right: 1px solid rgba(0,0,0,.06);
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .dl-product-card__img img {
          width: 100%; height: 100%; object-fit: contain; padding: 16px;
          transition: transform .3s;
        }
        .dl-product-card:hover .dl-product-card__img img { transform: scale(1.04); }
        .dl-product-card__no-img {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          color: #D1D5DB; font-size: 11px;
        }

        .dl-product-card__body {
          flex: 1; padding: 18px 20px 16px; display: flex; flex-direction: column; gap: 10px;
          min-width: 0;
        }
        .dl-product-card__series {
          font-size: 10px; font-weight: 600; color: #9CA3AF;
          text-transform: uppercase; letter-spacing: .1em;
        }
        .dl-product-card__name {
          font-size: 18px; font-weight: 800; color: #1C1C1C;
          letter-spacing: -.03em; line-height: 1.2; margin-top: -2px;
        }
        .dl-product-card__colors {
          display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        }
        .dl-product-card__color-btn {
          width: 18px; height: 18px; border-radius: 50%; cursor: pointer; padding: 0; border: none;
          box-shadow: 0 0 0 1.5px rgba(0,0,0,.15);
          transition: box-shadow .15s; outline: none; flex-shrink: 0;
        }
        .dl-product-card__color-btn.active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1C1C1C; }
        .dl-product-card__color-name { font-size: 11px; color: #9CA3AF; }

        /* Price blocks */
        .dl-product-card__prices { display: flex; gap: 8px; }
        .dl-product-card__price-block {
          flex: 1; border-radius: 10px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .dl-product-card__price-block--retail { background: #FEF2F2; border: 1px solid #FECACA; }
        .dl-product-card__price-block--dealer  { background: #052E16; border: 1px solid rgba(34,197,94,.2); }

        .dl-product-card__price-head {
          font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
        }
        .dl-product-card__price-block--retail .dl-product-card__price-head { color: #F87171; }
        .dl-product-card__price-block--dealer  .dl-product-card__price-head { color: rgba(134,239,172,.6); }
        .dl-product-card__price-main { font-size: 17px; font-weight: 800; letter-spacing: -.03em; line-height: 1; }
        .dl-product-card__price-block--retail .dl-product-card__price-main { color: #DC2626; }
        .dl-product-card__price-block--dealer  .dl-product-card__price-main { color: #86EFAC; }
        .dl-product-card__price-vat { font-size: 11px; font-weight: 500; margin-top: 1px; }
        .dl-product-card__price-block--retail .dl-product-card__price-vat { color: #FCA5A5; }
        .dl-product-card__price-block--dealer  .dl-product-card__price-vat { color: rgba(134,239,172,.4); }

        /* Quantity + add */
        .dl-product-card__actions { display: flex; gap: 8px; align-items: center; margin-top: auto; }
        .dl-product-card__qty {
          display: flex; align-items: center;
          border: 1.5px solid #E5E5EA;
          border-radius: 10px; overflow: hidden; height: 42px;
        }
        .dl-product-card__qty-btn {
          width: 38px; height: 100%; border: none; background: transparent;
          cursor: pointer; font-size: 18px; font-weight: 300; color: #374151;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s; flex-shrink: 0;
        }
        .dl-product-card__qty-btn:hover { background: #F5F5F7; }
        .dl-product-card__qty-input {
          width: 36px; text-align: center;
          border: none; border-left: 1.5px solid #E5E5EA; border-right: 1.5px solid #E5E5EA;
          background: transparent; font-size: 14px; font-weight: 700;
          font-family: inherit; color: #1C1C1C; height: 100%;
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
          box-shadow: 0 2px 10px rgba(245,158,11,.25);
        }
        .dl-product-card__add:hover { opacity: .9; box-shadow: 0 4px 18px rgba(245,158,11,.4); }
        .dl-product-card__added { background: linear-gradient(135deg, #22C55E, #16A34A); box-shadow: 0 2px 10px rgba(34,197,94,.25); }

        /* ── Cart bar ── */
        .dl-cart-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(0,0,0,.08);
          color: #1C1C1C; padding: 14px 24px;
          display: flex; align-items: center; gap: 16px;
          transform: translateY(100%); transition: transform .25s;
          box-shadow: 0 -4px 20px rgba(0,0,0,.08);
        }
        .dl-cart-bar.visible { transform: translateY(0); }
        .dl-cart-bar__info { flex: 1; }
        .dl-cart-bar__count { font-size: 13px; color: #6B7280; }
        .dl-cart-bar__total { font-size: 18px; font-weight: 800; color: #1C1C1C; }

        /* ── Orders table ── */
        .dl-order-table { width: 100%; border-collapse: collapse; }
        .dl-order-table th, .dl-order-table td {
          padding: 12px 16px; text-align: left; font-size: 13px;
          border-bottom: 1px solid rgba(0,0,0,.06);
          color: #1C1C1C;
        }
        .dl-order-table th {
          font-weight: 700; color: #9CA3AF; font-size: 11px;
          text-transform: uppercase; letter-spacing: .07em;
          background: rgba(0,0,0,.025);
        }
        .dl-order-table tr:last-child td { border-bottom: none; }
        .dl-order-table tr:hover td { background: rgba(0,0,0,.02); }

        /* ── Stat row ── */
        .dl-stat-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .dl-stat {
          flex: 1; min-width: 140px;
          background: rgba(255,255,255,.65);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,.9);
          border-radius: 12px; padding: 16px 20px;
          box-shadow: 0 1px 8px rgba(0,0,0,.05);
        }
        .dl-stat__label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #9CA3AF; margin-bottom: 6px; }
        .dl-stat__value { font-size: 22px; font-weight: 800; letter-spacing: -.03em; color: #1C1C1C; }
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
