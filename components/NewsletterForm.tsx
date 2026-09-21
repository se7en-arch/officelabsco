'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { markSubscribed } from '@/lib/popup-client';

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// The shop's dark "ready for your new furniture?" signup strip. Same
// /api/subscribe as the email popup — consent is required and recorded.
export default function NewsletterForm() {
  const t = useTranslations('shop');
  const n = useTranslations('newsletter');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'busy') return;
    if (!EMAIL_RX.test(email.trim())) { setError(n('invalidEmail')); return; }
    if (!consent) { setError(n('consentRequired')); return; }
    setState('busy'); setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent: true, locale, website }),
      });
      if (!res.ok) { setError(res.status === 429 ? n('tooMany') : n('error')); setState('idle'); return; }
      markSubscribed();
      setState('done');
    } catch {
      setError(n('error')); setState('idle');
    }
  }

  if (state === 'done') {
    return <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', margin: 0 }}>✓ {n('thanks')}</p>;
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="cta-form">
        <input
          className="cta-input" type="email" inputMode="email" autoComplete="email"
          placeholder={t('ctaEmail')} value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
        />
        <button className="cta-submit" type="submit" disabled={state === 'busy'}>
          {state === 'busy' ? '…' : t('ctaSend')}
        </button>
      </div>
      <input
        type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website}
        onChange={(e) => setWebsite(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, marginTop: 12, cursor: 'pointer' }}>
        <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(''); }} style={{ marginTop: 2 }} />
        <span>
          {n('consent')}{' '}
          <Link href="/privacy" style={{ color: '#fff', textDecoration: 'underline' }}>{n('privacy')}</Link>.
        </span>
      </label>
      {error && <p style={{ fontSize: 12.5, color: '#fca5a5', margin: '8px 0 0' }}>{error}</p>}
    </form>
  );
}
