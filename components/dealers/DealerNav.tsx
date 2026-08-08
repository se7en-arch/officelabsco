'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  companyName: string;
  discount: number;
  active: 'dashboard' | 'orders' | 'account';
}

export default function DealerNav({ companyName, discount, active }: Props) {
  const router = useRouter();

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
    <div className="dl-topbar">
      <div className="dl-topbar__logo">OfficeLabs Co</div>
      <div className="dl-topbar__sep" />
      <div className="dl-topbar__label">Дилърски портал</div>
      <div className="dl-topbar__spacer" />
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
      <button className="dl-topbar__logout" onClick={logout}>Изход</button>
    </div>
  );
}
