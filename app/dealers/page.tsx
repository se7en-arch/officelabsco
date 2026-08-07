'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DealerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/dealers/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      if (data.status === 'PENDING')   router.push('/dealers/pending');
      else if (data.status === 'REJECTED') setError('Акаунтът ви е отхвърлен. Свържете се с нас.');
      else router.push('/dealers/dashboard');
    } catch {
      setError('Грешка при свързване.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 4 }}>OfficeLabs Co</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Дилърски портал</div>
        </div>

        <div className="dl-card">
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Вход</h1>

          {error && <div className="dl-form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="dl-form-group">
              <label htmlFor="email">Имейл</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="dl-form-group">
              <label htmlFor="password">Парола</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="dl-btn dl-btn--primary dl-btn--full" disabled={loading}>
              {loading ? 'Влизане...' : 'Вход'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            Нямате акаунт?{' '}
            <Link href="/dealers/register" style={{ color: '#1C1C1C', fontWeight: 600 }}>Регистрирайте се</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
