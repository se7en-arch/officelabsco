'use client';
import { useState } from 'react';

const ITEMS = [
  {
    icon: '💳',
    title: 'Stripe плащане',
    desc: 'Плащане с карта не е имплементирано. Създай акаунт на stripe.com, вземи publishable + secret ключове, добави @stripe/stripe-js и @stripe/react-stripe-js, направи /api/checkout-session и замени бутона "Плащане с карта" с Stripe Elements форма.',
  },
  {
    icon: '📱',
    title: 'Социални мрежи',
    desc: 'Facebook, Instagram, LinkedIn линковете в Footer-а са празни (#). Добави реалните URL-и в components/Footer.tsx.',
  },
  {
    icon: '🚧',
    title: 'Under Construction страница',
    desc: 'Преди пускане: изтрий PREVIEW_SECRET от Vercel → Settings → Environment Variables. Изтрий app/under-construction/ и app/api/unlock/ от кода и направи нов deploy.',
  },
  {
    icon: '💰',
    title: 'Плащане на кредит (Buy Now Pay Later)',
    desc: 'BuyNowPayLater компонентът е само визуален — без реална интеграция. Опции: Paytaka (paytaka.bg) или TBI Bank — и двете имат готови JS widget-и за онлайн магазини. Заявяваш партньорски достъп, те дават скрипт/iframe, интегрира се в product и checkout страниците.',
  },
  {
    icon: '📦',
    title: 'Econt Plugin — избор на офис',
    desc: 'Заяви API достъп: econt.com → Партньори → API (безплатно за онлайн магазини). Дават JS скрипт + callback функция. При избор на "До офис" в checkout зареждаш widget-а в модал — той връща обект с избрания офис и адрес.',
  },
  {
    icon: '🚐',
    title: 'Speedy Widget — избор на офис',
    desc: 'Регистрирай се на api.speedy.bg за API ключ (безплатно). Предоставят JS widget "Speedy Map" — iframe с карта за избор на офис. При избор на "До офис" и куриер Speedy го зареждаш в модал с callback при потвърждение.',
  },
];

export default function AnnouncementBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(90deg, #7a0000 0%, #a00000 50%, #7a0000 100%)',
      borderBottom: '1px solid rgba(255,100,100,.25)',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '9px 20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', opacity: .92 }}>
          ⚠ TO DO!
        </span>
        <span style={{ fontSize: 12, opacity: .55, marginLeft: 4 }}>
          {ITEMS.length} задачи
        </span>
        <span style={{
          marginLeft: 'auto',
          fontSize: 11,
          opacity: .6,
          display: 'inline-block',
          transition: 'transform .2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          ▼
        </span>
      </button>

      {open && (
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {ITEMS.map((item) => (
            <div key={item.title} style={{
              display: 'flex',
              gap: 12,
              padding: '10px 14px',
              background: 'rgba(0,0,0,.22)',
              borderRadius: 8,
              borderLeft: '3px solid rgba(255,255,255,.22)',
            }}>
              <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1.4 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.76)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
