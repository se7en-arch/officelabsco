import type { ReactNode } from 'react';

export const metadata = { title: 'OfficeLabs — Дилърски портал' };

export default function DealersLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: system-ui, -apple-system, sans-serif; background: #F5F5F3; color: #111; }
        .dl-topbar {
          position: sticky; top: 0; z-index: 100;
          height: 56px; background: #1C1C1C; color: #fff;
          display: flex; align-items: center; padding: 0 24px; gap: 16px;
        }
        .dl-topbar__logo { font-size: 15px; font-weight: 800; letter-spacing: -.03em; }
        .dl-topbar__sep { width: 1px; height: 16px; background: rgba(255,255,255,.2); }
        .dl-topbar__label { font-size: 11px; text-transform: uppercase; letter-spacing: .12em; color: rgba(255,255,255,.45); }
        .dl-topbar__spacer { flex: 1; }
        .dl-topbar__nav { display: flex; align-items: center; gap: 4px; }
        .dl-topbar__link {
          padding: 6px 12px; border-radius: 6px; font-size: 13px; color: rgba(255,255,255,.7);
          text-decoration: none; transition: background .15s, color .15s;
        }
        .dl-topbar__link:hover { background: rgba(255,255,255,.1); color: #fff; }
        .dl-topbar__link.active { background: rgba(255,255,255,.12); color: #fff; }
        .dl-topbar__logout {
          padding: 6px 14px; background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
          border-radius: 6px; font-size: 13px; color: rgba(255,255,255,.8); cursor: pointer;
          font-family: inherit; transition: background .15s;
        }
        .dl-topbar__logout:hover { background: rgba(255,255,255,.18); }

        .dl-page { max-width: 1200px; margin: 0 auto; padding: 32px 24px 64px; }
        .dl-page--narrow { max-width: 480px; }
        .dl-page--medium { max-width: 720px; }

        .dl-card {
          background: #fff; border-radius: 12px;
          border: 1px solid #E8E8E4; padding: 32px;
        }

        .dl-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .dl-form-group label { font-size: 13px; font-weight: 600; color: #374151; }
        .dl-form-group input, .dl-form-group select, .dl-form-group textarea {
          padding: 10px 12px; border: 1px solid #D1D5DB; border-radius: 8px;
          font-size: 14px; font-family: inherit; color: #111; background: #fff;
          outline: none; transition: border-color .15s;
        }
        .dl-form-group input:focus, .dl-form-group select:focus, .dl-form-group textarea:focus {
          border-color: #1C1C1C;
        }
        .dl-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .dl-form-hint { font-size: 12px; color: #9CA3AF; }
        .dl-form-error { font-size: 13px; color: #EF4444; background: #FEF2F2; padding: 10px 14px; border-radius: 8px; }

        .dl-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 11px 24px; border-radius: 8px; font-size: 14px; font-weight: 700;
          font-family: inherit; cursor: pointer; transition: opacity .15s; border: none; text-decoration: none;
        }
        .dl-btn--primary { background: #1C1C1C; color: #fff; }
        .dl-btn--primary:hover { opacity: .85; }
        .dl-btn--outline { background: transparent; color: #1C1C1C; border: 1.5px solid #D1D5DB; }
        .dl-btn--outline:hover { border-color: #1C1C1C; }
        .dl-btn--full { width: 100%; }
        .dl-btn--sm { padding: 7px 14px; font-size: 13px; }
        .dl-btn--danger { background: #EF4444; color: #fff; }
        .dl-btn--success { background: #16A34A; color: #fff; }
        .dl-btn:disabled { opacity: .5; cursor: not-allowed; }

        .dl-badge {
          display: inline-block; padding: 2px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em;
        }
        .dl-badge--pending  { background: #FEF3C7; color: #92400E; }
        .dl-badge--approved { background: #D1FAE5; color: #065F46; }
        .dl-badge--rejected { background: #FEE2E2; color: #991B1B; }
        .dl-badge--new        { background: #EFF6FF; color: #1E40AF; }
        .dl-badge--processing { background: #FEF3C7; color: #92400E; }
        .dl-badge--shipped    { background: #F5F3FF; color: #5B21B6; }
        .dl-badge--completed  { background: #D1FAE5; color: #065F46; }
        .dl-badge--cancelled  { background: #F3F4F6; color: #6B7280; }

        .dl-title { font-size: 24px; font-weight: 800; letter-spacing: -.03em; margin-bottom: 4px; }
        .dl-subtitle { font-size: 14px; color: #6B7280; margin-bottom: 24px; }

        .dl-product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
          gap: 12px;
        }

        /* ── Card shell ── */
        .dl-product-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,.07);
          box-shadow: 0 2px 8px rgba(0,0,0,.04);
          display: flex;
          flex-direction: row;
          align-items: stretch;
          position: relative;
          overflow: hidden;
          transition: box-shadow .2s;
          min-height: 160px;
        }
        .dl-product-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.1); }

        /* ── Discount badge top-right ── */
        .dl-product-card__badge {
          position: absolute; top: 0; right: 0;
          background: #1C1C1E; color: #fff;
          font-size: 13px; font-weight: 800; letter-spacing: -.01em;
          padding: 6px 14px;
          border-radius: 0 18px 0 12px;
          line-height: 1;
          z-index: 2;
        }

        /* ── Left: image ── */
        .dl-product-card__img {
          width: 160px; min-height: 160px; flex-shrink: 0;
          background: #F5F5F7;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .dl-product-card__img img {
          width: 100%; height: 100%; object-fit: contain; padding: 16px;
          transition: transform .3s;
        }
        .dl-product-card:hover .dl-product-card__img img { transform: scale(1.04); }
        .dl-product-card__no-img {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          color: #C7C7CC; font-size: 11px;
        }

        /* ── Right: content ── */
        .dl-product-card__body {
          flex: 1; padding: 18px 20px 16px; display: flex; flex-direction: column; gap: 10px;
          min-width: 0;
        }

        .dl-product-card__series {
          font-size: 10px; font-weight: 600; color: #8E8E93;
          text-transform: uppercase; letter-spacing: .1em;
        }
        .dl-product-card__name {
          font-size: 18px; font-weight: 800; color: #1C1C1E;
          letter-spacing: -.03em; line-height: 1.2; margin-top: -2px;
        }
        .dl-product-card__colors {
          display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
        }
        .dl-product-card__color-btn {
          width: 18px; height: 18px; border-radius: 50%; cursor: pointer; padding: 0; border: none;
          box-shadow: 0 0 0 1.5px rgba(0,0,0,.14);
          transition: box-shadow .15s; outline: none; flex-shrink: 0;
        }
        .dl-product-card__color-btn.active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px #1C1C1E; }
        .dl-product-card__color-name { font-size: 11px; color: #8E8E93; }

        /* ── Price blocks ── */
        .dl-product-card__prices {
          display: flex; gap: 8px;
        }
        .dl-product-card__price-block {
          flex: 1; border-radius: 10px; padding: 10px 12px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .dl-product-card__price-block--retail {
          background: #FEF2F2;
        }
        .dl-product-card__price-block--dealer {
          background: #052E16;
        }
        .dl-product-card__price-head {
          font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
        }
        .dl-product-card__price-block--retail .dl-product-card__price-head { color: #F87171; }
        .dl-product-card__price-block--dealer .dl-product-card__price-head { color: rgba(134,239,172,.6); }

        .dl-product-card__price-main {
          font-size: 17px; font-weight: 800; letter-spacing: -.03em; line-height: 1;
        }
        .dl-product-card__price-block--retail .dl-product-card__price-main { color: #DC2626; }
        .dl-product-card__price-block--dealer .dl-product-card__price-main { color: #86EFAC; }

        .dl-product-card__price-vat {
          font-size: 11px; font-weight: 500; margin-top: 1px;
        }
        .dl-product-card__price-block--retail .dl-product-card__price-vat { color: #FCA5A5; }
        .dl-product-card__price-block--dealer .dl-product-card__price-vat { color: rgba(134,239,172,.4); }

        /* ── Actions row ── */
        .dl-product-card__actions {
          display: flex; gap: 8px; align-items: center; margin-top: auto;
        }
        .dl-product-card__qty {
          display: flex; align-items: center;
          border: 1.5px solid #E5E5EA; border-radius: 10px; overflow: hidden;
          height: 42px;
        }
        .dl-product-card__qty-btn {
          width: 38px; height: 100%; border: none; background: transparent;
          cursor: pointer; font-size: 18px; font-weight: 300; color: #1C1C1E;
          display: flex; align-items: center; justify-content: center;
          transition: background .15s; flex-shrink: 0;
        }
        .dl-product-card__qty-btn:hover { background: #F5F5F7; }
        .dl-product-card__qty-input {
          width: 36px; text-align: center;
          border: none; border-left: 1.5px solid #E5E5EA; border-right: 1.5px solid #E5E5EA;
          background: transparent; font-size: 14px; font-weight: 700;
          font-family: inherit; color: #1C1C1E; height: 100%;
          -moz-appearance: textfield; padding: 0;
        }
        .dl-product-card__qty-input::-webkit-outer-spin-button,
        .dl-product-card__qty-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .dl-product-card__add {
          flex: 1; height: 42px; background: #1C1C1E; color: #fff; border: none;
          border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: inherit; letter-spacing: .01em;
          transition: background .15s;
        }
        .dl-product-card__add:hover { background: #3A3A3C; }
        .dl-product-card__added { background: #34C759; }
        .dl-product-card__added:hover { background: #28A745; }

        .dl-cart-bar {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
          background: #1C1C1C; color: #fff; padding: 14px 24px;
          display: flex; align-items: center; gap: 16px;
          transform: translateY(100%); transition: transform .25s;
        }
        .dl-cart-bar.visible { transform: translateY(0); }
        .dl-cart-bar__info { flex: 1; }
        .dl-cart-bar__count { font-size: 13px; color: rgba(255,255,255,.6); }
        .dl-cart-bar__total { font-size: 18px; font-weight: 800; }

        .dl-order-table { width: 100%; border-collapse: collapse; }
        .dl-order-table th, .dl-order-table td {
          padding: 12px 16px; text-align: left; font-size: 13px;
          border-bottom: 1px solid #F3F4F6;
        }
        .dl-order-table th { font-weight: 700; color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; background: #FAFAFA; }
        .dl-order-table tr:last-child td { border-bottom: none; }
        .dl-order-table tr:hover td { background: #FAFAFA; }

        .dl-stat-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .dl-stat {
          flex: 1; min-width: 140px; background: #fff; border: 1px solid #E8E8E4;
          border-radius: 10px; padding: 16px 20px;
        }
        .dl-stat__label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #9CA3AF; margin-bottom: 6px; }
        .dl-stat__value { font-size: 22px; font-weight: 800; letter-spacing: -.03em; }
        .dl-stat__value--accent { color: #F59E0B; }

        @media (max-width: 600px) {
          .dl-form-row { grid-template-columns: 1fr; }
          .dl-page { padding: 20px 16px 80px; }
          .dl-card { padding: 20px; }
        }
      `}</style>
      {children}
    </>
  );
}
