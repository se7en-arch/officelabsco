'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnderConstruction() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Грешна парола');
        setLoading(false);
      }
    } catch {
      setError('Грешка при свързване');
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; }

        .wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .inner {
          width: 100%;
          max-width: 360px;
        }

        .logo {
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -.025em;
          color: #111;
          margin-bottom: 48px;
        }
        .logo span { font-weight: 400; opacity: .4; }

        h1 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -.03em;
          color: #111;
          margin-bottom: 8px;
        }

        .sub {
          font-size: 14px;
          color: #888;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        input[type="password"] {
          width: 100%;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          color: #111;
          outline: none;
          font-family: inherit;
          transition: border-color .15s;
          background: #fafafa;
        }
        input[type="password"]:focus { border-color: #111; background: #fff; }
        input[type="password"]::placeholder { color: #bbb; }

        .error {
          font-size: 12px;
          color: #d00;
          margin-top: 8px;
          min-height: 18px;
        }

        button[type="submit"] {
          margin-top: 12px;
          width: 100%;
          background: #111;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: opacity .15s;
        }
        button[type="submit"]:hover:not(:disabled) { opacity: .8; }
        button[type="submit"]:disabled { opacity: .4; cursor: not-allowed; }
      `}</style>

      <div className="wrap">
        <div className="inner">
          <div className="logo">OfficeLabs<span>co.</span></div>
          <h1>Сайтът е в разработка</h1>
          <p className="sub">Очаквайте скоро.</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Парола за достъп"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <div className="error">{error}</div>
            <button type="submit" disabled={loading || !password}>
              {loading ? 'Влизане…' : 'Влез'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
