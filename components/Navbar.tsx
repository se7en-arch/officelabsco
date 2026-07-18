'use client';
import Image from 'next/image';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/lib/cart-store';
import { useState, useEffect, useRef } from 'react';


function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.98-1.69l1.54-8.31H6" />
    </svg>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <line x1="3" y1="3" x2="17" y2="17" />
          <line x1="17" y1="3" x2="3" y2="17" />
        </>
      ) : (
        <>
          <line x1="2" y1="5" x2="18" y2="5" />
          <line x1="2" y1="10" x2="18" y2="10" />
          <line x1="2" y1="15" x2="18" y2="15" />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total);
  const cartCount = useCart((s) => s.count());
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); setCartOpen(false); }, [pathname]);

  useEffect(() => {
    if (!cartOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [cartOpen]);

  function switchLocale() {
    const next = locale === 'bg' ? 'en' : 'bg';
    router.replace(pathname, { locale: next });
  }

  return (
    <>
      <header className="hdr">
        <div className="hdr__in">
          <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: 2, letterSpacing: '-.03em', fontFamily: 'var(--font-inter), system-ui, sans-serif', fontSize: '1.05rem' }}>
            <span style={{ fontWeight: 700 }}>OfficeLabs</span><span style={{ fontWeight: 400, fontSize: '0.88em', letterSpacing: '0', opacity: 0.6 }}>co.</span>
          </Link>

          <nav className="nav-links">
            <Link href="/" className={`nav-link${pathname === '/' ? ' active' : ''}`}>{t('home')}</Link>
            <Link href="/about" className={`nav-link${pathname === '/about' ? ' active' : ''}`}>{t('about')}</Link>
            <Link href="/shop" className={`nav-link${pathname.startsWith('/shop') ? ' active' : ''}`}>{t('shop')}</Link>
          </nav>

          <div className="nav-act">
            <button className="lang-btn" onClick={switchLocale} aria-label="Switch language">
              {t('lang')}
            </button>

            <div className="cart-wrap" ref={cartRef}>
              <button
                className="cart-pill cart-pill--icon"
                aria-label={t('cart')}
                onClick={() => setCartOpen((o) => !o)}
              >
                <CartIcon />
                {mounted && cartCount > 0 && (
                  <span className="cart-pill__badge">{cartCount > 9 ? '9+' : cartCount}</span>
                )}
              </button>

              {mounted && cartOpen && (
                <div className="cart-dropdown">
                  {items.length === 0 ? (
                    <div className="cart-dropdown__empty">
                      <p>{t('cartEmpty')}</p>
                    </div>
                  ) : (
                    <>
                      <div className="cart-dropdown__items">
                        {items.map((item) => (
                          <div key={item.id} className="cart-dropdown__item">
                            <div className="cart-dropdown__img">
                              <Image src={item.image} alt={item.name} width={48} height={48} style={{ objectFit: 'contain', padding: 4 }} />
                            </div>
                            <div className="cart-dropdown__info">
                              <span className="cart-dropdown__name">{item.name}</span>
                              <span className="cart-dropdown__meta">{item.quantity} × {item.price} €</span>
                            </div>
                            <span className="cart-dropdown__price">{(item.price * item.quantity).toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>
                      <div className="cart-dropdown__footer">
                        <div className="cart-dropdown__total">
                          <span>{t('total')}</span>
                          <strong>{total().toFixed(2)} €</strong>
                        </div>
                        <Link href="/cart" className="cart-dropdown__btn" onClick={() => setCartOpen(false)}>
                          {t('toCart')}
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="burger-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
              aria-expanded={menuOpen}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true">
          <button
            className="mobile-menu__close"
            onClick={() => setMenuOpen(false)}
            aria-label={t('closeMenu')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="3" x2="17" y2="17" />
              <line x1="17" y1="3" x2="3" y2="17" />
            </svg>
          </button>
          <nav className="mobile-menu__nav">
            <Link href="/" className={`mobile-menu__link${pathname === '/' ? ' active' : ''}`}>{t('home')}</Link>
            <Link href="/about" className={`mobile-menu__link${pathname === '/about' ? ' active' : ''}`}>{t('about')}</Link>
            <Link href="/shop" className={`mobile-menu__link${pathname.startsWith('/shop') ? ' active' : ''}`}>{t('shop')}</Link>
          </nav>
          <button className="lang-btn lang-btn--mobile" onClick={switchLocale}>
            {t('lang')}
          </button>
        </div>
      )}
    </>
  );
}
