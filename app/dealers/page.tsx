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
    <>
      <style>{`
        .dl-login-bg {
          position: fixed; inset: 0; z-index: 0;
          background: url('/images/Hero AboutUs 2.webp') center/cover no-repeat;
        }
        .dl-login-bg::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(
            145deg,
            rgba(10,10,10,.78) 0%,
            rgba(28,28,28,.55) 45%,
            rgba(245,158,11,.22) 100%
          );
        }
        .dl-login-scene {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .dl-glass-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,.09);
          backdrop-filter: blur(28px) saturate(1.6);
          -webkit-backdrop-filter: blur(28px) saturate(1.6);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 28px;
          padding: 44px 40px 36px;
          box-shadow:
            0 8px 48px rgba(0,0,0,.4),
            inset 0 1px 0 rgba(255,255,255,.18),
            inset 0 -1px 0 rgba(0,0,0,.12);
        }
        .dl-glass-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 32px;
        }
        .dl-glass-logo__name {
          font-size: 17px; font-weight: 800; letter-spacing: -.03em; color: #fff;
        }
        .dl-glass-logo__pill {
          font-size: 10px; font-weight: 700; color: #F59E0B;
          text-transform: uppercase; letter-spacing: .1em;
          padding: 3px 9px;
          background: rgba(245,158,11,.15);
          border: 1px solid rgba(245,158,11,.3);
          border-radius: 20px;
        }
        .dl-glass-card h1 {
          font-size: 28px; font-weight: 800; letter-spacing: -.05em; color: #fff;
          margin-bottom: 6px; line-height: 1.1;
        }
        .dl-glass-subtitle {
          font-size: 14px; color: rgba(255,255,255,.45); margin-bottom: 30px;
        }
        .dl-glass-form-group {
          display: flex; flex-direction: column; gap: 7px; margin-bottom: 16px;
        }
        .dl-glass-form-group label {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .dl-glass-form-group input {
          padding: 13px 15px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 12px;
          font-size: 14px; font-family: inherit; color: #fff;
          outline: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .dl-glass-form-group input::placeholder { color: rgba(255,255,255,.22); }
        .dl-glass-form-group input:focus {
          border-color: rgba(245,158,11,.6);
          background: rgba(255,255,255,.11);
          box-shadow: 0 0 0 3px rgba(245,158,11,.12);
        }
        .dl-glass-error {
          font-size: 13px; color: #FCA5A5;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.22);
          padding: 10px 14px; border-radius: 10px;
          margin-bottom: 16px;
        }
        .dl-glass-btn {
          width: 100%; padding: 14px 20px;
          border: none; border-radius: 12px; cursor: pointer;
          font-size: 15px; font-weight: 800; font-family: inherit;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: #1C1C1C; letter-spacing: -.01em;
          box-shadow: 0 4px 24px rgba(245,158,11,.4), inset 0 1px 0 rgba(255,255,255,.3);
          transition: opacity .15s, transform .12s, box-shadow .15s;
          margin-top: 10px;
        }
        .dl-glass-btn:hover:not(:disabled) {
          opacity: .93; transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(245,158,11,.5), inset 0 1px 0 rgba(255,255,255,.3);
        }
        .dl-glass-btn:active:not(:disabled) { transform: translateY(0); }
        .dl-glass-btn:disabled { opacity: .45; cursor: not-allowed; }
        .dl-glass-divider {
          display: flex; align-items: center; gap: 12px; margin: 26px 0 22px;
        }
        .dl-glass-divider::before, .dl-glass-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.1);
        }
        .dl-glass-divider span {
          font-size: 11px; color: rgba(255,255,255,.3); white-space: nowrap;
        }
        .dl-glass-footer {
          text-align: center; font-size: 13px; color: rgba(255,255,255,.4);
        }
        .dl-glass-footer a {
          color: #F59E0B; font-weight: 700; text-decoration: none;
          transition: color .15s;
        }
        .dl-glass-footer a:hover { color: #FCD34D; }
      `}</style>

      <div className="dl-login-bg" />

      <div className="dl-login-scene">
        <div className="dl-glass-card">

          <div className="dl-glass-logo">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="rgba(245,158,11,.9)" aria-hidden="true">
              <ellipse cx="8" cy="3.2" rx="2.6" ry="3.2" />
              <ellipse cx="12.8" cy="8" rx="3.2" ry="2.6" />
              <ellipse cx="8" cy="12.8" rx="2.6" ry="3.2" />
              <ellipse cx="3.2" cy="8" rx="3.2" ry="2.6" />
            </svg>
            <span className="dl-glass-logo__name">OfficeLabs Co</span>
            <span className="dl-glass-logo__pill">Дилъри</span>
          </div>

          <h1>Добре дошли</h1>
          <div className="dl-glass-subtitle">Влезте в дилърския си акаунт</div>

          {error && <div className="dl-glass-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="dl-glass-form-group">
              <label htmlFor="email">Имейл адрес</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="your@company.com"
              />
            </div>
            <div className="dl-glass-form-group">
              <label htmlFor="password">Парола</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="dl-glass-btn" disabled={loading}>
              {loading ? 'Влизане...' : 'Вход →'}
            </button>
          </form>

          <div className="dl-glass-divider">
            <span>или</span>
          </div>

          <div className="dl-glass-footer">
            Нямате акаунт?{' '}
            <Link href="/dealers/register">Регистрирайте се</Link>
          </div>

        </div>
      </div>
    </>
  );
}
