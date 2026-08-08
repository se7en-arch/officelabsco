'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DealerRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [vatReg, setVatReg] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    companyName: '', contactName: '', phone: '',
    address: '', city: '', eik: '', vatNumber: '',
  });

  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Паролите не съвпадат.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/dealers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, vatRegistered: vatReg }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push('/dealers/pending');
    } catch {
      setError('Грешка при регистрация.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        .dl-reg-bg {
          position: fixed; inset: 0; z-index: 0;
          background: url('/images/Hero AboutUs 2.webp') center/cover no-repeat;
        }
        .dl-reg-bg::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(
            145deg,
            rgba(10,10,10,.82) 0%,
            rgba(28,28,28,.60) 45%,
            rgba(245,158,11,.22) 100%
          );
        }
        .dl-reg-scene {
          position: relative; z-index: 1;
          min-height: 100vh;
          display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 24px 64px;
        }
        .dl-reg-card {
          width: 100%; max-width: 600px;
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
        .dl-reg-logo {
          display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
        }
        .dl-reg-logo__name {
          font-size: 17px; font-weight: 800; letter-spacing: -.03em; color: #fff;
        }
        .dl-reg-logo__pill {
          font-size: 10px; font-weight: 700; color: #F59E0B;
          text-transform: uppercase; letter-spacing: .1em;
          padding: 3px 9px;
          background: rgba(245,158,11,.15);
          border: 1px solid rgba(245,158,11,.3);
          border-radius: 20px;
        }
        .dl-reg-card h1 {
          font-size: 26px; font-weight: 800; letter-spacing: -.05em; color: #fff;
          margin-bottom: 6px; line-height: 1.1;
        }
        .dl-reg-subtitle {
          font-size: 13px; color: rgba(255,255,255,.4); margin-bottom: 30px; line-height: 1.5;
        }
        .dl-reg-section {
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em;
          color: rgba(245,158,11,.7); margin: 24px 0 14px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .dl-reg-section:first-of-type { margin-top: 0; }
        .dl-reg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .dl-reg-group { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .dl-reg-group label {
          font-size: 11px; font-weight: 700; color: rgba(255,255,255,.55);
          text-transform: uppercase; letter-spacing: .08em;
        }
        .dl-reg-group input {
          padding: 12px 14px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.13);
          border-radius: 10px;
          font-size: 14px; font-family: inherit; color: #fff;
          outline: none;
          transition: border-color .15s, background .15s, box-shadow .15s;
        }
        .dl-reg-group input::placeholder { color: rgba(255,255,255,.2); }
        .dl-reg-group input:focus {
          border-color: rgba(245,158,11,.6);
          background: rgba(255,255,255,.11);
          box-shadow: 0 0 0 3px rgba(245,158,11,.12);
        }
        .dl-reg-hint {
          font-size: 11px; color: rgba(255,255,255,.3); margin-top: -4px;
        }
        .dl-reg-checkbox-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
        }
        .dl-reg-checkbox-row input[type="checkbox"] {
          width: 17px; height: 17px; cursor: pointer;
          accent-color: #F59E0B;
        }
        .dl-reg-checkbox-row label {
          font-size: 13px; color: rgba(255,255,255,.7); cursor: pointer;
        }
        .dl-reg-error {
          font-size: 13px; color: #FCA5A5;
          background: rgba(239,68,68,.12);
          border: 1px solid rgba(239,68,68,.22);
          padding: 10px 14px; border-radius: 10px;
          margin-bottom: 20px;
        }
        .dl-reg-btn {
          width: 100%; padding: 14px 20px;
          border: none; border-radius: 12px; cursor: pointer;
          font-size: 15px; font-weight: 800; font-family: inherit;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: #fff; letter-spacing: -.01em;
          box-shadow: 0 4px 24px rgba(245,158,11,.4), inset 0 1px 0 rgba(255,255,255,.3);
          transition: opacity .15s, transform .12s, box-shadow .15s;
          margin-top: 10px;
        }
        .dl-reg-btn:hover:not(:disabled) {
          opacity: .93; transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(245,158,11,.5), inset 0 1px 0 rgba(255,255,255,.3);
        }
        .dl-reg-btn:active:not(:disabled) { transform: translateY(0); }
        .dl-reg-btn:disabled { opacity: .45; cursor: not-allowed; }
        .dl-reg-divider {
          display: flex; align-items: center; gap: 12px; margin: 26px 0 22px;
        }
        .dl-reg-divider::before, .dl-reg-divider::after {
          content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.1);
        }
        .dl-reg-divider span { font-size: 11px; color: rgba(255,255,255,.3); }
        .dl-reg-footer {
          text-align: center; font-size: 13px; color: rgba(255,255,255,.4);
        }
        .dl-reg-footer a {
          color: #F59E0B; font-weight: 700; text-decoration: none; transition: color .15s;
        }
        .dl-reg-footer a:hover { color: #FCD34D; }

        @media (max-width: 600px) {
          .dl-reg-row { grid-template-columns: 1fr; }
          .dl-reg-card { padding: 32px 24px 28px; }
        }
      `}</style>

      <div className="dl-reg-bg" />

      <div className="dl-reg-scene">
        <div className="dl-reg-card">

          <div className="dl-reg-logo">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="rgba(245,158,11,.9)" aria-hidden="true">
              <ellipse cx="8" cy="3.2" rx="2.6" ry="3.2" />
              <ellipse cx="12.8" cy="8" rx="3.2" ry="2.6" />
              <ellipse cx="8" cy="12.8" rx="2.6" ry="3.2" />
              <ellipse cx="3.2" cy="8" rx="3.2" ry="2.6" />
            </svg>
            <span className="dl-reg-logo__name">OfficeLabs Co</span>
            <span className="dl-reg-logo__pill">Дилъри</span>
          </div>

          <h1>Нов акаунт</h1>
          <div className="dl-reg-subtitle">
            След регистрацията акаунтът ви ще бъде прегледан и одобрен от нашия екип.
          </div>

          {error && <div className="dl-reg-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="dl-reg-section">Данни за фирма</div>

            <div className="dl-reg-row">
              <div className="dl-reg-group">
                <label>Фирма *</label>
                <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)} required placeholder="Фирма ООД" />
              </div>
              <div className="dl-reg-group">
                <label>ЕИК / БУЛСТАТ *</label>
                <input type="text" value={form.eik} onChange={e => set('eik', e.target.value)} required placeholder="123456789" />
              </div>
            </div>

            <div className="dl-reg-checkbox-row">
              <input type="checkbox" id="vatReg" checked={vatReg} onChange={e => setVatReg(e.target.checked)} />
              <label htmlFor="vatReg">Регистрирани по ДДС</label>
            </div>

            {vatReg && (
              <div className="dl-reg-group">
                <label>ДДС номер</label>
                <input type="text" placeholder="BG123456789" value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} />
              </div>
            )}

            <div className="dl-reg-section">Данни за контакт</div>

            <div className="dl-reg-row">
              <div className="dl-reg-group">
                <label>Лице за контакт *</label>
                <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} required placeholder="Иван Иванов" />
              </div>
              <div className="dl-reg-group">
                <label>Телефон *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="+359 88 888 8888" />
              </div>
            </div>

            <div className="dl-reg-row">
              <div className="dl-reg-group">
                <label>Адрес *</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} required placeholder="ул. Примерна 1" />
              </div>
              <div className="dl-reg-group">
                <label>Град *</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)} required placeholder="София" />
              </div>
            </div>

            <div className="dl-reg-section">Данни за вход</div>

            <div className="dl-reg-group">
              <label>Имейл *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="your@company.com" />
            </div>

            <div className="dl-reg-row">
              <div className="dl-reg-group">
                <label>Парола *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} placeholder="••••••••" />
                <span className="dl-reg-hint">Минимум 8 символа</span>
              </div>
              <div className="dl-reg-group">
                <label>Потвърди парола *</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="dl-reg-btn" disabled={loading}>
              {loading ? 'Регистриране...' : 'Регистрирай се →'}
            </button>
          </form>

          <div className="dl-reg-divider"><span>или</span></div>

          <div className="dl-reg-footer">
            Вече имате акаунт?{' '}
            <Link href="/dealers">Влезте тук</Link>
          </div>

        </div>
      </div>
    </>
  );
}
