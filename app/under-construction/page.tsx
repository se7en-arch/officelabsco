'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnderConstruction() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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

        body {
          background: #0a0a0c;
          color: #f0f0f2;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
          min-height: 100vh;
        }

        .uc-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }

        /* subtle background grid */
        .uc-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(30,215,96,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,215,96,.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* top green line */
        .uc-wrap::after {
          content: '';
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #1ed760 30%, #15a348 70%, transparent);
        }

        .uc-inner {
          position: relative;
          z-index: 1;
          max-width: 520px;
          width: 100%;
          text-align: center;
        }

        /* logo */
        .uc-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 56px;
        }
        .uc-logo__dot {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1ed760 0%, #15a348 100%);
          box-shadow: 0 0 24px rgba(30,215,96,.3);
        }
        .uc-logo__name {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: -.025em;
          color: #f0f0f2;
        }
        .uc-logo__name span {
          font-weight: 400;
          opacity: .5;
          font-size: .88em;
        }

        /* main content */
        .uc-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: #1ed760;
          margin-bottom: 20px;
        }

        .uc-title {
          font-size: clamp(2.4rem, 6vw, 3.6rem);
          font-weight: 800;
          letter-spacing: -.05em;
          line-height: 1.05;
          color: #f0f0f2;
          margin-bottom: 20px;
        }

        .uc-title span {
          background: linear-gradient(135deg, #1ed760, #15a348);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .uc-desc {
          font-size: 15px;
          color: #6060780;
          color: rgba(240,240,242,.45);
          line-height: 1.7;
          margin-bottom: 48px;
          max-width: 380px;
          margin-left: auto;
          margin-right: auto;
        }

        /* divider */
        .uc-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }
        .uc-divider::before,
        .uc-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,.06);
        }
        .uc-divider-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
        }

        /* unlock toggle */
        .uc-unlock-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(240,240,242,.25);
          font-size: 12px;
          letter-spacing: .05em;
          padding: 8px 16px;
          transition: color .2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .uc-unlock-toggle:hover { color: rgba(240,240,242,.5); }
        .uc-unlock-toggle svg { opacity: .6; }

        /* login form */
        .uc-form {
          margin-top: 16px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 28px 28px 24px;
          text-align: left;
          animation: fadeSlideIn .2s ease;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .uc-form-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(240,240,242,.4);
          margin-bottom: 8px;
        }

        .uc-form-input {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          padding: 11px 14px;
          font-size: 14px;
          color: #f0f0f2;
          outline: none;
          transition: border-color .15s;
          font-family: inherit;
        }
        .uc-form-input::placeholder { color: rgba(255,255,255,.2); }
        .uc-form-input:focus { border-color: rgba(30,215,96,.4); }

        .uc-form-error {
          font-size: 12px;
          color: #ff6060;
          margin-top: 8px;
          min-height: 18px;
        }

        .uc-form-btn {
          margin-top: 16px;
          width: 100%;
          background: #1ed760;
          color: #0a0a0c;
          border: none;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, opacity .15s;
          font-family: inherit;
          letter-spacing: .01em;
        }
        .uc-form-btn:hover:not(:disabled) { background: #22e868; }
        .uc-form-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* bottom meta */
        .uc-meta {
          position: fixed;
          bottom: 28px;
          left: 0; right: 0;
          text-align: center;
          font-size: 11px;
          color: rgba(255,255,255,.12);
          letter-spacing: .04em;
        }
      `}</style>

      <div className="uc-wrap">
        <div className="uc-inner">
          <div className="uc-logo">
            <div className="uc-logo__dot" />
            <div className="uc-logo__name">OfficeLabs<span>co.</span></div>
          </div>

          <p className="uc-eyebrow">В процес на разработка</p>
          <h1 className="uc-title">
            Очаквайте<br /><span>скоро</span>
          </h1>
          <p className="uc-desc">
            Работим по нещо красиво. Сайтът ще бъде готов съвсем скоро — следете ни.
          </p>

          <div className="uc-divider">
            <div className="uc-divider-dot" />
            <div className="uc-divider-dot" />
            <div className="uc-divider-dot" />
          </div>

          <button
            className="uc-unlock-toggle"
            onClick={() => setShowForm(v => !v)}
            aria-expanded={showForm}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Preview достъп
          </button>

          {showForm && (
            <form className="uc-form" onSubmit={handleSubmit}>
              <label className="uc-form-label" htmlFor="uc-password">Парола</label>
              <input
                id="uc-password"
                className="uc-form-input"
                type="password"
                placeholder="Въведи паролата за достъп"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <div className="uc-form-error">{error}</div>
              <button className="uc-form-btn" type="submit" disabled={loading || !password}>
                {loading ? 'Влизане…' : 'Влез'}
              </button>
            </form>
          )}
        </div>

        <div className="uc-meta">officelabsco.com</div>
      </div>
    </>
  );
}
