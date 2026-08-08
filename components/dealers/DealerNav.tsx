'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Props {
  companyName: string;
  discount: number;
  active: 'dashboard' | 'orders' | 'account';
}

export default function DealerNav({ companyName, discount, active }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  async function logout() {
    await fetch('/api/dealers/auth', { method: 'DELETE' });
    router.push('/dealers');
  }

  const links = [
    { href: '/dealers/dashboard', label: 'Продукти', key: 'dashboard' },
    { href: '/dealers/orders',    label: 'Поръчки',  key: 'orders' },
    { href: '/dealers/account',   label: 'Профил',   key: 'account' },
  ];

  return (
    <>
      <div className="dl-topbar">
        <div className="dl-topbar__logo">OfficeLabs Co</div>
        <div className="dl-topbar__sep" />
        <div className="dl-topbar__label">Дилърски портал</div>
        <div className="dl-topbar__spacer" />

        {/* Desktop nav */}
        <nav className="dl-topbar__nav">
          {links.map(l => (
            <Link key={l.key} href={l.href} className={`dl-topbar__link${active === l.key ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="dl-topbar__sep" />
        <span className="dl-topbar__company">
          {companyName} · <span style={{ color: '#F59E0B', fontWeight: 700 }}>{discount}% отстъпка</span>
        </span>
        <div className="dl-topbar__sep" />
        <button className="dl-topbar__logout dl-desktop-only" onClick={logout}>Изход</button>

        {/* Burger button */}
        <button className="dl-burger" onClick={() => setOpen(o => !o)} aria-label="Меню" aria-expanded={open}>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {open && <div className="dl-menu-overlay" onClick={() => setOpen(false)} />}

      {/* Mobile drawer */}
      <div className={`dl-mobile-menu${open ? ' open' : ''}`}>
        <div className="dl-mobile-menu__company">
          <div className="dl-mobile-menu__company-name">{companyName}</div>
          <div className="dl-mobile-menu__company-discount">{discount}% дилърска отстъпка</div>
        </div>
        <nav className="dl-mobile-menu__nav">
          {links.map(l => (
            <Link
              key={l.key} href={l.href}
              className={`dl-mobile-menu__link${active === l.key ? ' active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="dl-mobile-menu__footer">
          <button className="dl-mobile-menu__logout" onClick={logout}>Изход</button>
        </div>
      </div>
    </>
  );
}
