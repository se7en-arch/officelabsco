'use client';
import { useState } from 'react';
import type { Metadata } from 'next';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    await new Promise(r => setTimeout(r, 800));
    setStatus('done');
  }

  return (
    <>
      <style>{`
        .co-page {
          background: var(--bg);
          min-height: calc(100vh - 60px);
        }

        /* HERO */
        .co-hero {
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          padding: 72px 40px 60px;
          text-align: center;
        }
        .co-hero__eye {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 14px;
        }
        .co-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -.04em;
          color: var(--text);
          line-height: 1.05;
          margin-bottom: 16px;
        }
        .co-hero__sub {
          font-size: 16px;
          color: var(--text-2);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* BODY */
        .co-body {
          max-width: 1000px;
          margin: 0 auto;
          padding: 64px 40px 96px;
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 64px;
          align-items: start;
        }

        /* INFO SIDE */
        .co-info__label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 28px;
        }
        .co-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px 0;
          border-bottom: 1px solid var(--line);
        }
        .co-card:first-of-type { padding-top: 0; }
        .co-card:last-of-type { border-bottom: none; }
        .co-card__icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: oklch(0.705 0.213 47.604 / 0.1);
          border-radius: 10px;
          color: oklch(0.705 0.213 47.604);
        }
        .co-card__title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
          letter-spacing: -.01em;
        }
        .co-card__val {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.6;
        }
        .co-card__val a {
          color: oklch(0.705 0.213 47.604);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color .15s;
        }
        .co-card__val a:hover { border-bottom-color: oklch(0.62 0.18 47.604); }

        /* FORM SIDE */
        .co-form__label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 28px;
        }
        .co-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .co-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .co-field label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: .02em;
        }
        .co-field input,
        .co-field textarea {
          font-family: inherit;
          font-size: 14px;
          color: var(--text);
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 11px 14px;
          outline: none;
          transition: border-color .15s;
          resize: none;
        }
        .co-field input:focus,
        .co-field textarea:focus {
          border-color: oklch(0.705 0.213 47.604);
        }
        .co-field input::placeholder,
        .co-field textarea::placeholder { color: #bbb; }
        .co-field textarea { min-height: 130px; line-height: 1.6; }

        .co-submit {
          margin-top: 4px;
          width: 100%;
          background: var(--text);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 13px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -.01em;
          transition: opacity .15s;
        }
        .co-submit:hover:not(:disabled) { opacity: .8; }
        .co-submit:disabled { opacity: .4; cursor: not-allowed; }

        .co-success {
          text-align: center;
          padding: 40px 24px;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 12px;
        }
        .co-success__icon {
          width: 48px; height: 48px;
          background: oklch(0.705 0.213 47.604 / 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: oklch(0.705 0.213 47.604);
        }
        .co-success h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 6px;
        }
        .co-success p {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.6;
        }

        @media (max-width: 720px) {
          .co-hero { padding: 52px 24px 44px; }
          .co-body {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 40px 24px 64px;
          }
        }
      `}</style>

      <div className="co-page">
        {/* HERO */}
        <div className="co-hero">
          <p className="co-hero__eye">OfficeLabs Co</p>
          <h1>Свържете се с нас</h1>
          <p className="co-hero__sub">
            Имате въпрос, запитване или искате да разгледате мебелите ни на живо?
            Ще се радваме да чуем от вас.
          </p>
        </div>

        {/* BODY */}
        <div className="co-body">
          {/* Left — info */}
          <div>
            <p className="co-info__label">Информация за контакт</p>

            <div className="co-card">
              <div className="co-card__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="co-card__title">Имейл</p>
                <p className="co-card__val">
                  <a href="mailto:info@officelabsco.com">info@officelabsco.com</a>
                </p>
                <p className="co-card__val" style={{ fontSize: 12, marginTop: 2 }}>Отговаряме в рамките на 1 работен ден</p>
              </div>
            </div>

            <div className="co-card">
              <div className="co-card__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="co-card__title">Работно време</p>
                <p className="co-card__val">Понеделник – Петък: 9:00 – 18:00</p>
                <p className="co-card__val">Събота: 10:00 – 14:00</p>
              </div>
            </div>

            <div className="co-card">
              <div className="co-card__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <div>
                <p className="co-card__title">Адрес</p>
                <p className="co-card__val">България</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <p className="co-form__label">Изпратете съобщение</p>

            {status === 'done' ? (
              <div className="co-success">
                <div className="co-success__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Съобщението е изпратено!</h3>
                <p>Ще се свържем с вас в рамките на 1 работен ден.</p>
              </div>
            ) : (
              <form className="co-form" onSubmit={handleSubmit}>
                <div className="co-field">
                  <label htmlFor="co-name">Вашето име</label>
                  <input
                    id="co-name"
                    type="text"
                    placeholder="Иван Иванов"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="co-field">
                  <label htmlFor="co-email">Имейл адрес</label>
                  <input
                    id="co-email"
                    type="email"
                    placeholder="ivan@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="co-field">
                  <label htmlFor="co-msg">Съобщение</label>
                  <textarea
                    id="co-msg"
                    placeholder="Напишете вашето запитване..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="co-submit"
                  disabled={status === 'sending' || !form.name || !form.email || !form.message}
                >
                  {status === 'sending' ? 'Изпращане…' : 'Изпрати съобщение'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
