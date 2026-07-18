import Link from 'next/link';
import LogoutButton from './LogoutButton';

const navItems = [
  {
    section: 'Главно',
    links: [
      {
        href: '/adminpanel/dashboard',
        label: 'Dashboard',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      },
      {
        href: '/adminpanel/orders',
        label: 'Поръчки',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      },
    ],
  },
  {
    section: 'Каталог',
    links: [
      {
        href: '/adminpanel/products',
        label: 'Продукти',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
      },
      {
        href: '/adminpanel/products/new',
        label: 'Нов продукт',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
      },
      {
        href: '/adminpanel/series',
        label: 'Серии',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>,
      },
      {
        href: '/adminpanel/categories',
        label: 'Категории',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
      },
    ],
  },
  {
    section: 'Медия и сайт',
    links: [
      {
        href: '/adminpanel/media',
        label: 'Медии',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
      },
      {
        href: '/adminpanel/settings',
        label: 'Настройки',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
      },
      {
        href: '/',
        label: 'Към сайта',
        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
      },
    ],
  },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-name">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <ellipse cx="8" cy="3.2" rx="2.6" ry="3.2" />
            <ellipse cx="12.8" cy="8" rx="3.2" ry="2.6" />
            <ellipse cx="8" cy="12.8" rx="2.6" ry="3.2" />
            <ellipse cx="3.2" cy="8" rx="3.2" ry="2.6" />
          </svg>
          .office labs
        </div>
        <div className="admin-sidebar__label">Admin Panel</div>
      </div>

      <nav className="admin-sidebar__nav">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="admin-sidebar__section">{group.section}</div>
            {group.links.map((link) => (
              <Link key={link.href} href={link.href} className="admin-nav-link">
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <LogoutButton />
      </div>
    </aside>
  );
}
