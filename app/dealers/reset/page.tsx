'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const missingLink = !id || !token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Паролата трябва да е поне 8 символа.'); return; }
    if (password !== confirm) { setError('Паролите не съвпадат.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/dealers/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Грешка. Опитайте отново.'); return; }
      setDone(true);
    } catch {
      setError('Грешка при свързване.');
    } finally {
      setLoading(false);
    }
  }

  const card: React.CSSProperties = {
    maxWidth: 400, margin: '60px auto', padding: 32, background: '#fff',
    borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,.08)',
  };
  const input: React.CSSProperties = {
    width: '100%', padding: '11px 12px', border: '1px solid #d1d5db', borderRadius: 10,
    fontSize: 14, marginTop: 6, boxSizing: 'border-box',
  };
  const btn: React.CSSProperties = {
    width: '100%', padding: 12, marginTop: 16, background: '#1C1C1C', color: '#fff',
    border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
  };

  if (missingLink) {
    return (
      <div style={card}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Невалиден линк</h1>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>Линкът за смяна на парола е непълен. Поискайте нов от страницата за вход.</p>
        <p style={{ marginTop: 18, fontSize: 14 }}><Link href="/">Към входа</Link></p>
      </div>
    );
  }

  if (done) {
    return (
      <div style={card}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>Паролата е сменена</h1>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>Можете да влезете с новата си парола.</p>
        <button style={btn} onClick={() => router.push('/')}>Към входа</button>
      </div>
    );
  }

  return (
    <div style={card}>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Нова парола</h1>
      <p style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Задайте нова парола за дилърския си акаунт (поне 8 символа).</p>
      {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 12px', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>Нова парола
          <input style={input} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginTop: 14 }}>Повторете паролата
          <input style={input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
        </label>
        <button style={btn} type="submit" disabled={loading}>{loading ? 'Запазване...' : 'Запази новата парола'}</button>
      </form>
    </div>
  );
}

export default function DealerResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
