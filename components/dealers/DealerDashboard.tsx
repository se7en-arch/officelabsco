'use client';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ColorVariant { name: string; color: string; images: string[]; }
interface Product {
  id: number; name: string; slug: string; sku: string | null;
  price: number; image: string; series: string; category: string;
  colorVariants: ColorVariant[] | null;
}
interface CartItem {
  productId: number; productName: string; productSlug: string;
  quantity: number; unitPrice: number; retailPrice: number;
  color: string | null; image: string;
}
interface DealerAddress {
  id: string; label: string; address: string; city: string;
  postcode: string | null; isDefault: boolean;
}

function fmt(n: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function dealerPrice(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}
function fmtOrderNum(n: number) {
  return `#Order${String(n).padStart(5, '0')}`;
}

export default function DealerDashboard({
  products, discount, companyName,
}: { products: Product[]; discount: number; companyName: string }) {
  const router = useRouter();
  const [cart, setCart]                         = useState<CartItem[]>([]);
  const [qtys, setQtys]                         = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors]     = useState<Record<number, number>>({});
  const [search, setSearch]                     = useState('');
  const [checkingOut, setCheckingOut]           = useState(false);
  const [notes, setNotes]                       = useState('');
  const [showCart, setShowCart]                 = useState(false);
  const [addresses, setAddresses]               = useState<DealerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showConfirm, setShowConfirm]           = useState(false);
  const [lastOrderNum, setLastOrderNum]         = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/dealers/addresses')
      .then(r => r.ok ? r.json() : [])
      .then((list: DealerAddress[]) => {
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  function getQtyKey(id: number, color: string | null) { return `${id}__${color ?? ''}`; }

  function addToCart(p: Product) {
    const colorIdx = selectedColors[p.id] ?? 0;
    const variant  = p.colorVariants?.[colorIdx];
    const color    = variant?.name ?? null;
    const image    = variant?.images[0] ?? p.image;
    const qty      = qtys[getQtyKey(p.id, color)] ?? 1;
    const dp       = dealerPrice(p.price, discount);
    setCart(prev => {
      const existing = prev.findIndex(i => i.productId === p.id && i.color === color);
      if (existing >= 0) {
        return prev.map((i, idx) => idx === existing ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { productId: p.id, productName: p.name, productSlug: p.slug, quantity: qty, unitPrice: dp, retailPrice: p.price, color, image }];
    });
  }

  function removeFromCart(productId: number, color: string | null) {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.color === color)));
  }

  const changeQty = useCallback((key: string, delta: number) => {
    setQtys(prev => ({ ...prev, [key]: Math.max(1, (prev[key] ?? 1) + delta) }));
  }, []);

  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.series.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? '').toLowerCase().includes(search.toLowerCase())
  );

  async function placeOrder() {
    if (!cart.length) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/dealers/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items:             cart,
          notes,
          deliveryAddressId: selectedAddressId || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      setCart([]);
      setNotes('');
      setShowCart(false);
      setLastOrderNum(order.orderNumber ?? null);
      setShowConfirm(true);
    } catch {
      alert('Грешка при поръчката.');
    } finally {
      setCheckingOut(false);
    }
  }

  function closeConfirm() {
    setShowConfirm(false);
    router.push('/dealers/orders');
  }

  return (
    <>
      <style>{`
        .dl-addr-select {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;
        }
        .dl-addr-option {
          display: flex; align-items: center; gap: 10px; padding: 12px 14px;
          border: 1px solid rgba(0,0,0,.1); border-radius: 10px; cursor: pointer;
          background: rgba(255,255,255,.5); transition: border-color .15s, background .15s;
        }
        .dl-addr-option:hover { border-color: rgba(245,158,11,.4); background: rgba(245,158,11,.06); }
        .dl-addr-option.selected { border-color: #F59E0B; background: rgba(245,158,11,.1); }
        .dl-addr-option input[type="radio"] { accent-color: #F59E0B; width: 16px; height: 16px; flex-shrink: 0; }
        .dl-addr-option-label { font-size: 12px; font-weight: 700; color: #B45309; text-transform: uppercase; letter-spacing: .06em; }
        .dl-addr-option-text { font-size: 13px; color: #4B5563; }
        .dl-addr-no-link { font-size: 13px; color: #9CA3AF; }
        .dl-addr-no-link a { color: #D97706; font-weight: 600; }

        /* Confirmation popup */
        .dl-confirm-overlay {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,.45); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center; padding: 24px;
        }
        .dl-confirm-modal {
          background: rgba(255,255,255,.88);
          backdrop-filter: blur(30px) saturate(1.6);
          -webkit-backdrop-filter: blur(30px) saturate(1.6);
          border: 1px solid rgba(255,255,255,.95);
          border-radius: 24px; padding: 40px 36px;
          width: 100%; max-width: 420px; text-align: center;
          box-shadow: 0 8px 40px rgba(0,0,0,.12);
        }
        .dl-confirm-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: #D1FAE5; border: 2px solid #6EE7B7;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; margin: 0 auto 20px; color: #065F46;
        }
        .dl-confirm-title { font-size: 22px; font-weight: 800; color: #1C1C1C; margin-bottom: 10px; letter-spacing: -.04em; }
        .dl-confirm-num { font-size: 15px; color: #D97706; font-weight: 700; margin-bottom: 12px; font-family: monospace; }
        .dl-confirm-text { font-size: 14px; color: #6B7280; line-height: 1.6; margin-bottom: 28px; }
        .dl-confirm-btn {
          width: 100%; padding: 13px; border-radius: 12px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 800; font-family: inherit;
          background: linear-gradient(135deg,#F59E0B,#D97706); color: #fff;
          box-shadow: 0 4px 20px rgba(245,158,11,.3);
          transition: opacity .15s, transform .1s;
        }
        .dl-confirm-btn:hover { opacity: .9; transform: translateY(-1px); }
      `}</style>

      <div className="dl-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="dl-title">Продуктов каталог</h1>
            <p className="dl-subtitle">{products.length} продукта · Вашата отстъпка: <strong style={{ color: '#F59E0B' }}>{discount}%</strong></p>
          </div>
          <input
            className="dl-search-input"
            placeholder="Търси по продукт, серия или код..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="dl-product-grid">
          {filtered.map(p => {
            const colorIdx    = selectedColors[p.id] ?? 0;
            const variant     = p.colorVariants?.[colorIdx];
            const displayImage = variant?.images[0] ?? p.image;
            const dp          = dealerPrice(p.price, discount);
            const qKey        = getQtyKey(p.id, variant?.name ?? null);
            const qty         = qtys[qKey] ?? 1;
            const retailVat   = Math.round(p.price * 1.2 * 100) / 100;
            const dpVat       = Math.round(dp    * 1.2 * 100) / 100;

            return (
              <div key={p.id} className="dl-product-card">
                <div className="dl-product-card__badge">−{discount}%</div>
                <div className="dl-product-card__img">
                  {displayImage && displayImage !== '/images/no-image.svg'
                    ? <img src={displayImage} alt={p.name} />
                    : <div className="dl-product-card__no-img">Без снимка</div>
                  }
                </div>
                <div className="dl-product-card__body">
                  <div>
                    <div className="dl-product-card__series">{p.series}</div>
                    <div className="dl-product-card__name">{p.name}</div>
                  </div>
                  {p.colorVariants && p.colorVariants.length > 0 && (
                    <div className="dl-product-card__colors">
                      {p.colorVariants.map((v, idx) => (
                        <button key={v.name} title={v.name}
                          className={`dl-product-card__color-btn${colorIdx === idx ? ' active' : ''}`}
                          style={{ background: v.color }}
                          onClick={() => setSelectedColors(s => ({ ...s, [p.id]: idx }))}
                        />
                      ))}
                      <span className="dl-product-card__color-name">{variant?.name}</span>
                    </div>
                  )}
                  <div className="dl-product-card__prices">
                    <div className="dl-product-card__price-block dl-product-card__price-block--retail">
                      <div className="dl-product-card__price-head">Клиентска</div>
                      <div className="dl-product-card__price-main">{fmt(p.price)} €</div>
                      <div className="dl-product-card__price-vat">{fmt(retailVat)} с ДДС</div>
                    </div>
                    <div className="dl-product-card__price-block dl-product-card__price-block--dealer">
                      <div className="dl-product-card__price-head">Дилърска</div>
                      <div className="dl-product-card__price-main">{fmt(dp)} €</div>
                      <div className="dl-product-card__price-vat">{fmt(dpVat)} с ДДС</div>
                    </div>
                  </div>
                  <div className="dl-product-card__actions">
                    <div className="dl-product-card__qty">
                      <button className="dl-product-card__qty-btn" onClick={() => changeQty(qKey, -1)}>−</button>
                      <input className="dl-product-card__qty-input" type="number" min={1} value={qty}
                        onChange={e => setQtys(s => ({ ...s, [qKey]: Math.max(1, parseInt(e.target.value) || 1) }))}
                      />
                      <button className="dl-product-card__qty-btn" onClick={() => changeQty(qKey, 1)}>+</button>
                    </div>
                    <button className="dl-product-card__add" onClick={() => addToCart(p)}>
                      Добави в количка
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart bar */}
      <div className={`dl-cart-bar${cartCount > 0 ? ' visible' : ''}`}>
        <div className="dl-cart-bar__info">
          <div className="dl-cart-bar__count">{cartCount} {cartCount === 1 ? 'артикул' : 'артикула'}</div>
          <div className="dl-cart-bar__total">{fmt(cartTotal)} €</div>
        </div>
        <button className="dl-btn dl-btn--outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)' }} onClick={() => setCart([])}>
          Изчисти
        </button>
        <button className="dl-btn dl-btn--primary" style={{ background: '#F59E0B' }} onClick={() => setShowCart(true)}>
          Преглед на поръчка →
        </button>
      </div>

      {/* Cart modal */}
      {showCart && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: 'rgba(255,255,255,.88)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            border: '1px solid rgba(255,255,255,.95)',
            borderRadius: 24,
            width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', padding: 32,
            boxShadow: '0 8px 40px rgba(0,0,0,.12)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1C', letterSpacing: '-.03em' }}>Вашата поръчка</h2>
              <button style={{ background: 'rgba(0,0,0,.06)', border: '1px solid rgba(0,0,0,.1)', borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} onClick={() => setShowCart(false)}>✕</button>
            </div>

            <table className="dl-order-table" style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>Продукт</th><th>Цвят</th>
                  <th style={{ textAlign: 'right' }}>Ед. цена</th>
                  <th style={{ textAlign: 'center' }}>Бр.</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={`${item.productId}-${item.color}`}>
                    <td style={{ fontWeight: 600, color: '#1C1C1C' }}>{item.productName}</td>
                    <td style={{ color: '#9CA3AF' }}>{item.color ?? '—'}</td>
                    <td style={{ textAlign: 'right', color: '#B45309', fontWeight: 700 }}>{fmt(item.unitPrice)} €</td>
                    <td style={{ textAlign: 'center', color: '#4B5563' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#1C1C1C' }}>{fmt(item.unitPrice * item.quantity)} €</td>
                    <td>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14 }}
                        onClick={() => removeFromCart(item.productId, item.color)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 18, fontWeight: 800, marginBottom: 24, color: '#1C1C1C', paddingTop: 8, borderTop: '1px solid rgba(0,0,0,.08)' }}>
              Общо:&nbsp;<span style={{ color: '#D97706' }}>{fmt(cartTotal)} €</span>
            </div>

            {/* Delivery address selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#B45309', marginBottom: 10 }}>Адрес за доставка</div>
              {addresses.length === 0 ? (
                <div className="dl-addr-no-link">
                  Нямате запазени адреси.{' '}
                  <a href="/dealers/account" target="_blank" rel="noopener">Добавете от профила →</a>
                </div>
              ) : (
                <div className="dl-addr-select">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`dl-addr-option${selectedAddressId === addr.id ? ' selected' : ''}`}>
                      <input type="radio" name="deliveryAddr" value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)} />
                      <div>
                        <div className="dl-addr-option-label">{addr.label}</div>
                        <div className="dl-addr-option-text">{addr.address}, {addr.city}{addr.postcode ? ` ${addr.postcode}` : ''}</div>
                      </div>
                    </label>
                  ))}
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                    <a href="/dealers/account" target="_blank" rel="noopener" style={{ color: '#D97706' }}>+ Управление на адреси</a>
                  </div>
                </div>
              )}
            </div>

            <div className="dl-form-group" style={{ marginBottom: 20 }}>
              <label>Бележки към поръчката</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Допълнителни изисквания, срокове..." />
            </div>

            <button className="dl-btn dl-btn--primary dl-btn--full" onClick={placeOrder} disabled={checkingOut}>
              {checkingOut ? 'Изпращане...' : 'Потвърди поръчката →'}
            </button>
          </div>
        </div>
      )}

      {/* Confirmation popup */}
      {showConfirm && (
        <div className="dl-confirm-overlay" onClick={closeConfirm}>
          <div className="dl-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="dl-confirm-icon">✓</div>
            <div className="dl-confirm-title">Поръчката е изпратена!</div>
            {lastOrderNum !== null && (
              <div className="dl-confirm-num">{fmtOrderNum(lastOrderNum)}</div>
            )}
            <div className="dl-confirm-text">
              Ще получите обаждане от нашия екип за потвърждение на поръчката и уточняване на детайлите по доставката.
            </div>
            <button className="dl-confirm-btn" onClick={closeConfirm}>
              Към моите поръчки →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
