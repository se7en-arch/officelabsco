'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register, login } from '@/lib/auth';
import s from './AuthView.module.css';

type Mode = 'login' | 'register';

/* ── Password strength ── */
function getStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (p.length >= 8)  score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  const s4 = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ['Много слаба', 'Слаба', 'Средна', 'Добра', 'Силна'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#15803d'];
  return { score: s4, label: labels[s4], color: colors[s4] };
}

export default function AuthView({ mode }: { mode: Mode }) {
  const router   = useRouter();
  const isLogin  = mode === 'login';

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [showCf,   setShowCf]   = useState(false);
  const [loading,  setLoading]  = useState(false);

  const [errors, setErrors] = useState<Partial<Record<'name'|'email'|'password'|'confirm'|'form', string>>>({});

  const strength = getStrength(password);

  function clearError(field: string) {
    setErrors(prev => { const n = { ...prev }; delete (n as Record<string,string>)[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    /* Simulate network latency for realistic UX */
    await new Promise(r => setTimeout(r, 480));

    const result = isLogin
      ? login(email, password)
      : register(name, email, password, confirm);

    setLoading(false);

    if (!result.ok) {
      setErrors({ [result.field]: result.message });
      return;
    }

    router.push('/profile');
  }

  return (
    <div className={s.page}>

      {/* ── LEFT: form ── */}
      <div className={s.panel}>
        <div className={s.wrap}>

          <div className={s.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>

          <h1 className={s.title}>
            {isLogin ? 'Добре дошли' : 'Създайте акаунт'}
          </h1>
          <p className={s.subtitle}>
            {isLogin
              ? 'Влезте, за да запазвате обяви и да управлявате профила си.'
              : 'Регистрирайте се безплатно и намерете имота си по-лесно.'}
          </p>

          <form className={s.form} onSubmit={handleSubmit} noValidate>

            {/* Name — register only */}
            {!isLogin && (
              <div className={s.fieldWrap}>
                <input
                  className={`${s.input}${errors.name ? ` ${s.inputError}` : ''}`}
                  type="text"
                  placeholder="Пълно ime"
                  value={name}
                  onChange={e => { setName(e.target.value); clearError('name'); }}
                  autoComplete="name"
                  autoFocus
                />
                {errors.name && <span className={s.errorMsg}>{errors.name}</span>}
              </div>
            )}

            {/* Email */}
            <div className={s.fieldWrap}>
              <input
                className={`${s.input}${errors.email ? ` ${s.inputError}` : ''}`}
                type="email"
                placeholder="Имейл адрес"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError('email'); }}
                autoComplete="email"
                autoFocus={isLogin}
              />
              {errors.email && <span className={s.errorMsg}>{errors.email}</span>}
            </div>

            {/* Password */}
            <div className={s.fieldWrap}>
              <div className={s.inputWrap}>
                <input
                  className={`${s.input}${errors.password ? ` ${s.inputError}` : ''}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Парола"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password'); }}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <button type="button" className={s.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Скрий паролата' : 'Покажи паролата'}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className={s.errorMsg}>{errors.password}</span>}
              {/* Strength meter — register only */}
              {!isLogin && password.length > 0 && (
                <div className={s.strengthWrap}>
                  <div className={s.strengthBar}>
                    {[1,2,3,4].map(i => (
                      <div
                        key={i}
                        className={s.strengthSegment}
                        style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }}
                      />
                    ))}
                  </div>
                  <span className={s.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm password — register only */}
            {!isLogin && (
              <div className={s.fieldWrap}>
                <div className={s.inputWrap}>
                  <input
                    className={`${s.input}${errors.confirm ? ` ${s.inputError}` : ''}`}
                    type={showCf ? 'text' : 'password'}
                    placeholder="Потвърди паролата"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); clearError('confirm'); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className={s.eyeBtn} onClick={() => setShowCf(v => !v)} tabIndex={-1} aria-label={showCf ? 'Скрий паролата' : 'Покажи паролата'}>
                    {showCf ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.confirm && <span className={s.errorMsg}>{errors.confirm}</span>}
              </div>
            )}

            {/* Global form error */}
            {errors.form && (
              <div className={s.formError}>{errors.form}</div>
            )}

            <button type="submit" className={s.submit} disabled={loading}>
              {loading ? <span className={s.spinner} /> : (isLogin ? 'Влез в акаунта' : 'Създай акаунт')}
            </button>
          </form>

          <div className={s.or}>ИЛИ</div>

          <div className={s.socials}>
            <button className={s.socialBtn} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Продължи с Google
            </button>
            <button className={s.socialBtn} type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Продължи с Facebook
            </button>
          </div>

          <p className={s.terms}>
            С продължаването приемате{' '}
            <Link href="#">Условията за ползване</Link>
            {' '}и{' '}
            <Link href="#">Политиката за поверителност</Link>
            {' '}на FairSpace.
          </p>

          <p className={s.switchText}>
            {isLogin ? 'Нямате акаунт? ' : 'Вече имате акаунт? '}
            <Link href={isLogin ? '/register' : '/login'} className={s.switchLink}>
              {isLogin ? 'Регистрирайте се' : 'Влезте'}
            </Link>
          </p>

        </div>
      </div>

      {/* ── RIGHT: visual ── */}
      <div className={s.visual}>
        <div className={`${s.ring} ${s.ring1}`} />
        <div className={`${s.ring} ${s.ring2}`} />
        <span className={s.version}>V1.0.0</span>
      </div>

    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
