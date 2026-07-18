'use client';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '@/lib/cart-store';
import { useTranslations } from 'next-intl';

const VALID_PROMOS: Record<string, number> = {
  PROMO5: 5,
  PROMO10: 10,
};

function parsePromo(code: string): number {
  return VALID_PROMOS[code.trim().toUpperCase()] ?? 0;
}

export default function CartPage() {
  const t = useTranslations('cart');
  const { items, removeItem, updateQty, total, count } = useCart();
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [promoError, setPromoError] = useState('');

  const discount = appliedPromo ? parsePromo(appliedPromo) : 0;
  const rawTotal = total();
  const discountAmount = parseFloat(((rawTotal * discount) / 100).toFixed(2));
  const finalTotal = parseFloat((rawTotal - discountAmount).toFixed(2));

  function applyPromo() {
    const pct = parsePromo(promoInput);
    if (!promoInput.trim()) {
      setPromoError(t('promoEnter'));
      return;
    }
    if (pct === 0) {
      setPromoError(t('promoInvalid'));
      return;
    }
    setAppliedPromo(promoInput.trim().toUpperCase());
    setPromoError('');
  }

  function removePromo() {
    setAppliedPromo('');
    setPromoInput('');
    setPromoError('');
  }

  if (items.length === 0) {
    return (
      <div className="page-wrap">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
          <div className="empty-state__title">{t('empty')}</div>
          <div className="empty-state__sub">{t('emptyDesc')}</div>
          <Link href="/shop" className="btn-primary">{t('toShop')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <nav className="breadcrumb">
        <Link href="/">{t('breadHome')}</Link>
        <span className="breadcrumb__sep">/</span>
        <span style={{ color: 'var(--text)' }}>{t('breadCart')}</span>
      </nav>

      <div className="cart-page">
        {/* Items */}
        <div>
          <h1 className="cart-items__title">{t('title', { count: count() })}</h1>

          {items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__img">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={84}
                  height={84}
                  style={{ objectFit: 'contain', padding: '6px' }}
                />
              </div>

              <div className="cart-item__info">
                <div className="cart-item__series">{item.seriesName}</div>
                <Link href={`/shop/${item.slug}`} className="cart-item__name">
                  {item.name}
                </Link>
                <div className="cart-item__category">{item.categoryName}</div>

                <div className="cart-item__actions">
                  <div className="qty" style={{ height: 36 }}>
                    <button
                      className="qty__btn"
                      style={{ height: 36, width: 36 }}
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="qty__val" style={{ lineHeight: '36px' }}>{item.quantity}</span>
                    <button
                      className="qty__btn"
                      style={{ height: 36, width: 36 }}
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button className="btn-remove" onClick={() => removeItem(item.id)}>
                    {t('remove')}
                  </button>
                </div>
              </div>

              <div className="cart-item__price">
                {item.price * item.quantity} €
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <div className="cart-summary__title">{t('summary')}</div>

          {items.map((item) => (
            <div key={item.id} className="summary-row">
              <span>{item.name} ×{item.quantity}</span>
              <span>{item.price * item.quantity} €</span>
            </div>
          ))}

          <div className="summary-row">
            <span>{t('delivery')}</span>
            <span>{t('deliveryFree')}</span>
          </div>

          {/* Promo code */}
          <div className="promo-wrap">
            {appliedPromo ? (
              <div className="promo-applied">
                <span className="promo-applied__tag">
                  {appliedPromo} <span className="promo-applied__pct">−{discount}%</span>
                </span>
                <button className="promo-applied__remove" onClick={removePromo} aria-label={t('promoRemove')}>✕</button>
              </div>
            ) : (
              <div className="promo-field">
                <input
                  className="promo-input"
                  type="text"
                  placeholder={t('promoPlaceholder')}
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                />
                <button className="promo-btn" onClick={applyPromo}>{t('promoApply')}</button>
              </div>
            )}
            {promoError && <p className="promo-error">{promoError}</p>}
          </div>

          {discount > 0 && (
            <>
              <div className="summary-row" style={{ color: 'var(--text-2)' }}>
                <span>{t('beforeDiscount')}</span>
                <span>{rawTotal.toFixed(2)} €</span>
              </div>
              <div className="summary-row" style={{ color: '#16a34a' }}>
                <span>{t('discount', { discount })}</span>
                <span>−{discountAmount.toFixed(2)} €</span>
              </div>
            </>
          )}

          <div className="summary-row summary-row--total">
            <span>{t('totalLabel')}</span>
            <span>{finalTotal.toFixed(2)} €</span>
          </div>

          <Link href="/checkout" className="btn-checkout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {t('checkout')}
          </Link>

          <Link
            href="/shop"
            style={{ display: 'block', textAlign: 'center', marginTop: 14, fontSize: 13, color: 'var(--muted)' }}
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
