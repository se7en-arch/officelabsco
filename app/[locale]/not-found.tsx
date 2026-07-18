import { Link } from '@/i18n/navigation';

export default function NotFound() {
  return (
    <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 120, paddingBottom: 120 }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--line)', marginBottom: 8 }}>404</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Страницата не е намерена</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>
        Адресът, който търсиш, не съществува или е бил преместен.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/shop" className="btn-primary">
          Към магазина
        </Link>
        <Link href="/" className="btn-secondary">
          Начална страница
        </Link>
      </div>
    </div>
  );
}
