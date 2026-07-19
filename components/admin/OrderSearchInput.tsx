'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function OrderSearchInput({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set('q', value.trim());
        params.delete('page');
      } else {
        params.delete('q');
        params.delete('page');
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [value]);  // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative', minWidth: 240 }}>
      <svg
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', pointerEvents: 'none' }}
      >
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="search"
        className="admin-form-input"
        placeholder="Търси по клиент, имейл, телефон..."
        value={value}
        onChange={e => setValue(e.target.value)}
        style={{ paddingLeft: 32, paddingRight: value ? 32 : 12 }}
      />
      {value && (
        <button
          onClick={() => setValue('')}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 2 }}
          title="Изчисти"
        >
          ×
        </button>
      )}
    </div>
  );
}
