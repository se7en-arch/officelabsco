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
    <div style={{ minHeight: '100vh', padding: '32px 24px 64px', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 600 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.03em', marginBottom: 4 }}>OfficeLabs Co</div>
          <div style={{ fontSize: 13, color: '#6B7280' }}>Дилърски портал — Регистрация</div>
        </div>

        <div className="dl-card">
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Нов дилърски акаунт</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
            След регистрацията акаунтът ви ще бъде прегледан и одобрен от нашия екип.
          </p>

          {error && <div className="dl-form-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', marginBottom: 12 }}>Данни за фирма</p>

            <div className="dl-form-row">
              <div className="dl-form-group">
                <label>Фирма *</label>
                <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div className="dl-form-group">
                <label>ЕИК / БУЛСТАТ *</label>
                <input type="text" value={form.eik} onChange={e => set('eik', e.target.value)} required />
              </div>
            </div>

            <div className="dl-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="vatReg" checked={vatReg} onChange={e => setVatReg(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="vatReg" style={{ cursor: 'pointer', marginBottom: 0 }}>Регистрирани по ДДС</label>
            </div>

            {vatReg && (
              <div className="dl-form-group">
                <label>ДДС номер</label>
                <input type="text" placeholder="BG123456789" value={form.vatNumber} onChange={e => set('vatNumber', e.target.value)} />
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', margin: '20px 0 12px' }}>Данни за контакт</p>

            <div className="dl-form-row">
              <div className="dl-form-group">
                <label>Лице за контакт *</label>
                <input type="text" value={form.contactName} onChange={e => set('contactName', e.target.value)} required />
              </div>
              <div className="dl-form-group">
                <label>Телефон *</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
            </div>

            <div className="dl-form-row">
              <div className="dl-form-group">
                <label>Адрес *</label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)} required />
              </div>
              <div className="dl-form-group">
                <label>Град *</label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)} required />
              </div>
            </div>

            <p style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#9CA3AF', margin: '20px 0 12px' }}>Данни за вход</p>

            <div className="dl-form-group">
              <label>Имейл *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>

            <div className="dl-form-row">
              <div className="dl-form-group">
                <label>Парола *</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required minLength={8} />
                <span className="dl-form-hint">Минимум 8 символа</span>
              </div>
              <div className="dl-form-group">
                <label>Потвърди парола *</label>
                <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="dl-btn dl-btn--primary dl-btn--full" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Регистриране...' : 'Регистрирай се'}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
            Вече имате акаунт?{' '}
            <Link href="/dealers" style={{ color: '#1C1C1C', fontWeight: 600 }}>Влезте тук</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
