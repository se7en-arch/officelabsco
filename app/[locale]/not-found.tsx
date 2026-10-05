import { Link } from '@/i18n/navigation';
import { getLocale } from 'next-intl/server';

export default async function NotFound() {
  const en = (await getLocale()) === 'en';
  return (
    <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 120, paddingBottom: 120 }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--line)', marginBottom: 8 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>{en ? 'Page not found' : 'Страницата не е намерена'}</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>
        {en ? 'The address you are looking for does not exist or has been moved.' : 'Адресът, който търсиш, не съществува или е бил преместен.'}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/shop" className="btn-primary">
          {en ? 'Go to the shop' : 'Към магазина'}
        </Link>
        <Link href="/" className="btn-secondary">
          {en ? 'Home page' : 'Начална страница'}
        </Link>
      </div>
    </div>
  );
}
