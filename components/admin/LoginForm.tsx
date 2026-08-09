'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push('/adminpanel/dashboard');
    } else {
      const data = await res.json();
      setError(data.error);
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__box">
        <div className="admin-login__logo">
          <span style={{ fontWeight: 700 }}>OfficeLabs</span><span style={{ fontWeight: 400, fontSize: '0.88em', letterSpacing: 0, opacity: 0.55 }}>co.</span>
        </div>
        <h1>Вход в администрацията</h1>
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Потребителско име</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="admin-field">
            <label>Парола</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="admin-error">{error}</p>}
          <button type="submit" className="admin-btn" disabled={loading}>
            {loading ? 'Влизане...' : 'Вход'}
          </button>
        </form>
      </div>
    </div>
  );
}
