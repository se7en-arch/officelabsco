'use client';
import { useState, useCallback } from 'react';
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

function fmt(n: number) {
  return n.toLocaleString('bg-BG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dealerPrice(price: number, discount: number) {
  return Math.round(price * (1 - discount / 100) * 100) / 100;
}

export default function DealerDashboard({
  products, discount, companyName,
}: { products: Product[]; discount: number; companyName: string }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors] = useState<Record<number, number>>({});
  const [search, setSearch] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCart, setShowCart] = useState(false);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  function getQtyKey(id: number, color: string | null) { return `${id}__${color ?? ''}`; }

  function addToCart(p: Product) {
    const colorIdx = selectedColors[p.id] ?? 0;
    const variant = p.colorVariants?.[colorIdx];
    const color = variant?.name ?? null;
    const image = variant?.images[0] ?? p.image;
    const qty = qtys[getQtyKey(p.id, color)] ?? 1;
    const dp = dealerPrice(p.price, discount);

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
        body: JSON.stringify({ items: cart, notes }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      setCart([]);
      setShowCart(false);
      router.push(`/dealers/orders/${order.id}`);
    } catch {
      alert('Грешка при поръчката.');
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <>
      <div className="dl-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="dl-title">Продуктов каталог</h1>
            <p className="dl-subtitle">{products.length} продукта · Вашата отстъпка: <strong style={{ color: '#F59E0B' }}>{discount}%</strong></p>
          </div>
          <input
            className="dl-form-group"
            style={{ margin: 0, padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, minWidth: 240, outline: 'none' }}
            placeholder="Търси по продукт, серия или код..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="dl-product-grid">
          {filtered.map(p => {
            const colorIdx = selectedColors[p.id] ?? 0;
            const variant = p.colorVariants?.[colorIdx];
            const displayImage = variant?.images[0] ?? p.image;
            const dp = dealerPrice(p.price, discount);
            const qKey = getQtyKey(p.id, variant?.name ?? null);
            const qty = qtys[qKey] ?? 1;

            return (
              <div key={p.id} className="dl-product-card">
                <div className="dl-product-card__img">
                  {displayImage && displayImage !== '/images/no-image.svg'
                    ? <img src={displayImage} alt={p.name} />
                    : <div className="dl-product-card__no-img">Без снимка</div>
                  }
                </div>
                <div className="dl-product-card__body">
                  <div className="dl-product-card__series">{p.series}</div>
                  <div className="dl-product-card__name">{p.name}</div>
                  {p.sku && <div className="dl-product-card__sku">{p.sku}</div>}

                  <div className="dl-product-card__prices">
                    <div className="dl-product-card__dealer">{fmt(dp)} лв.</div>
                    <div className="dl-product-card__retail">{fmt(p.price)} лв.</div>
                    <div className="dl-product-card__discount">−{discount}%</div>
                  </div>

                  {p.colorVariants && p.colorVariants.length > 1 && (
                    <div className="dl-product-card__colors">
                      {p.colorVariants.map((v, idx) => (
                        <button
                          key={v.name}
                          title={v.name}
                          className={`dl-product-card__color-btn${colorIdx === idx ? ' active' : ''}`}
                          style={{ background: v.color }}
                          onClick={() => setSelectedColors(s => ({ ...s, [p.id]: idx }))}
                        />
                      ))}
                      <span className="dl-product-card__color-name">{variant?.name}</span>
                    </div>
                  )}

                  <div className="dl-product-card__spacer" />

                  <div className="dl-product-card__footer">
                    <div className="dl-product-card__qty">
                      <button className="dl-product-card__qty-btn" onClick={() => changeQty(qKey, -1)}>−</button>
                      <input
                        className="dl-product-card__qty-input"
                        type="number" min={1} value={qty}
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
          <div className="dl-cart-bar__total">{fmt(cartTotal)} лв.</div>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>Вашата поръчка</h2>
              <button style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#6B7280' }} onClick={() => setShowCart(false)}>✕</button>
            </div>

            <table className="dl-order-table" style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>Продукт</th>
                  <th>Цвят</th>
                  <th style={{ textAlign: 'right' }}>Ед. цена</th>
                  <th style={{ textAlign: 'center' }}>Бр.</th>
                  <th style={{ textAlign: 'right' }}>Сума</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={`${item.productId}-${item.color}`}>
                    <td style={{ fontWeight: 600 }}>{item.productName}</td>
                    <td style={{ color: '#6B7280' }}>{item.color ?? '—'}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(item.unitPrice)} лв.</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.unitPrice * item.quantity)} лв.</td>
                    <td>
                      <button style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 14 }}
                        onClick={() => removeFromCart(item.productId, item.color)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 18, fontWeight: 800, marginBottom: 20 }}>
              Общо: {fmt(cartTotal)} лв.
            </div>

            <div className="dl-form-group">
              <label>Бележки към поръчката</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Допълнителни изисквания, срокове, адрес за доставка..."
                style={{ padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <button className="dl-btn dl-btn--primary dl-btn--full" style={{ background: '#F59E0B' }}
              onClick={placeOrder} disabled={checkingOut}>
              {checkingOut ? 'Изпращане...' : 'Потвърди поръчката'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
