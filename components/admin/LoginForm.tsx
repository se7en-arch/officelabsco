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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <ellipse cx="8" cy="3.2" rx="2.6" ry="3.2" />
            <ellipse cx="12.8" cy="8" rx="3.2" ry="2.6" />
            <ellipse cx="8" cy="12.8" rx="2.6" ry="3.2" />
            <ellipse cx="3.2" cy="8" rx="3.2" ry="2.6" />
          </svg>
          .office labs
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
