'use client';
import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 120, paddingBottom: 120 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Нещо не е наред</h1>
      <p style={{ color: 'var(--text-2)', marginBottom: 32 }}>
        Възникна грешка при зареждане на тази страница.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={reset}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          Опитай отново
        </button>
        <Link href="/" className="btn-secondary">
          Начална страница
        </Link>
      </div>
    </div>
  );
}
