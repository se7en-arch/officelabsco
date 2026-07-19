'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';

const GROUPS = [
  {
    id: 'orders',
    title: 'Поръчки',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    items: [
      {
        q: 'Как да направя поръчка?',
        a: 'Изберете желания продукт, добавете го в количката и преминете към checkout. Попълнете данните за доставка и потвърдете поръчката. Ще получите имейл потвърждение незабавно.',
      },
      {
        q: 'Мога ли да анулирам поръчка?',
        a: 'Да — свържете се с нас на info@officelabsco.com в рамките на 2 часа след подаването. След изпращане на пратката анулирането не е възможно, но можете да върнете стоката.',
      },
      {
        q: 'Как мога да проследя поръчката си?',
        a: 'След изпращане на пратката ще получите имейл с номер за проследяване от съответния куриер.',
      },
      {
        q: 'Поръчката ми потвърдена ли е, ако не съм получил имейл?',
        a: 'Проверете папката "Спам". Ако имейлът липсва, свържете се с нас — ще проверим статуса на поръчката ви.',
      },
    ],
  },
  {
    id: 'delivery',
    title: 'Доставка',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    items: [
      {
        q: 'Колко е срокът за доставка?',
        a: '1–5 работни дни след потвърждение на поръчката, в зависимост от наличността и адреса на доставка.',
      },
      {
        q: 'Каква е цената на доставката?',
        a: 'Разходите за доставка се показват при финализиране на поръчката и зависят от избрания куриер и адреса.',
      },
      {
        q: 'Доставяте ли до офис на куриер?',
        a: 'Да. При оформяне на поръчката можете да изберете доставка до адрес или до офис на куриерска компания по ваш избор.',
      },
      {
        q: 'Какво да правя ако пратката пристигне повредена?',
        a: 'Откажете приемането на пратката и веднага се свържете с нас на info@officelabsco.com. Ще организираме замяна или пълно възстановяване на сумата.',
      },
    ],
  },
  {
    id: 'returns',
    title: 'Връщане и гаранция',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
      </svg>
    ),
    items: [
      {
        q: 'В какъв срок мога да върна продукт?',
        a: 'Имате законово право на отказ в рамките на 14 календарни дни от получаването. Освен това приемаме връщания до 30 дни при неизползвана стока в оригинална опаковка.',
      },
      {
        q: 'Как да инициирам връщане?',
        a: 'Изпратете имейл на info@officelabsco.com с номера на поръчката и причината за връщане. Ще ви дадем инструкции за изпращане.',
      },
      {
        q: 'Кой плаща за куриера при връщане?',
        a: 'Разходите за връщане са за ваша сметка, освен ако стоката е дефектна или сме изпратили грешен продукт — тогава ние поемаме разходите.',
      },
      {
        q: 'Каква гаранция имат продуктите?',
        a: 'Всички продукти се ползват с 2-годишна законова гаранция. При производствен дефект имате право на безплатен ремонт, замяна или възстановяване на сумата.',
      },
      {
        q: 'Как да подам рекламация?',
        a: 'Изпратете имейл на info@officelabsco.com с описание на проблема и снимки. Разглеждаме рекламации в срок до 30 дни.',
      },
    ],
  },
  {
    id: 'products',
    title: 'Продукти',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    items: [
      {
        q: 'Какви са сериите мебели, които предлагате?',
        a: 'Предлагаме четири авторски серии: ASTRA (модерен минимализъм), TERRA (природни материали), NOVA (функционален дизайн) и LOFT (индустриална естетика).',
      },
      {
        q: 'Цветовете на снимките точно ли съответстват на реалния продукт?',
        a: 'Полагаме усилия снимките да са максимално точни, но леки разлики в оцветяването са възможни поради настройките на различните монитори.',
      },
      {
        q: 'Има ли продукти по индивидуална поръчка?',
        a: 'Свържете се с нас на info@officelabsco.com с вашите изисквания — ще ви информираме за наличните възможности.',
      },
      {
        q: 'Продуктите изискват ли монтаж?',
        a: 'Информацията за монтаж е посочена на страницата на всеки продукт. При въпроси сме на ваше разположение.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Плащане',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    items: [
      {
        q: 'Какви начини на плащане приемате?',
        a: 'Приемаме наложен платеж (в брой при получаване) и плащане с банкова карта (Visa, Mastercard, Maestro) чрез защитена платежна страница.',
      },
      {
        q: 'Сигурно ли е плащането с карта?',
        a: 'Плащането се извършва чрез криптирана HTTPS връзка. Данните ви за карта не се съхраняват на нашите сървъри.',
      },
      {
        q: 'Мога ли да получа фактура?',
        a: 'Да. Попълнете фирмените данни (ЕИК, ДДС номер, МОЛ) при оформяне на поръчката и ще издадем фактура.',
      },
    ],
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <>
      <style>{`
        .faq-page { background: var(--bg); min-height: calc(100vh - 60px); }

        /* HERO */
        .faq-hero {
          background: var(--surface);
          border-bottom: 1px solid var(--line);
          padding: 72px 40px 60px;
          text-align: center;
        }
        .faq-hero__eye {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 14px;
        }
        .faq-hero h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          letter-spacing: -.04em;
          color: var(--text);
          line-height: 1.05;
          margin-bottom: 16px;
        }
        .faq-hero__sub {
          font-size: 16px;
          color: var(--text-2);
          max-width: 460px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* BODY */
        .faq-body {
          max-width: 760px;
          margin: 0 auto;
          padding: 64px 40px 96px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        /* GROUP */
        .faq-group__head {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .faq-group__icon {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: oklch(0.705 0.213 47.604 / 0.1);
          border-radius: 8px;
          color: oklch(0.705 0.213 47.604);
        }
        .faq-group__title {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -.03em;
          color: var(--text);
        }

        /* ITEM */
        .faq-item {
          border-bottom: 1px solid var(--line);
        }
        .faq-item:first-of-type {
          border-top: 1px solid var(--line);
        }
        .faq-item__btn {
          width: 100%;
          background: none;
          border: none;
          padding: 18px 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          font-family: inherit;
          text-align: left;
        }
        .faq-item__q {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          line-height: 1.4;
        }
        .faq-item__btn:hover .faq-item__q { color: oklch(0.705 0.213 47.604); }
        .faq-item__chevron {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: var(--muted);
          transition: transform .22s ease;
        }
        .faq-item__chevron.open { transform: rotate(180deg); }
        .faq-item__body {
          overflow: hidden;
          max-height: 0;
          transition: max-height .28s ease, opacity .22s ease;
          opacity: 0;
        }
        .faq-item__body.open {
          max-height: 400px;
          opacity: 1;
        }
        .faq-item__a {
          font-size: 14px;
          color: var(--text-2);
          line-height: 1.75;
          padding-bottom: 18px;
        }

        /* CTA */
        .faq-cta {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 32px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .faq-cta__left h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
        }
        .faq-cta__left p {
          font-size: 14px;
          color: var(--text-2);
        }
        .faq-cta__btn {
          background: var(--text);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 11px 20px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -.01em;
          text-decoration: none;
          white-space: nowrap;
          transition: opacity .15s;
          display: inline-block;
        }
        .faq-cta__btn:hover { opacity: .8; }

        @media (max-width: 640px) {
          .faq-hero { padding: 52px 24px 44px; }
          .faq-body { padding: 40px 24px 64px; }
          .faq-cta { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <main className="faq-page">
        <div className="faq-hero">
          <p className="faq-hero__eye">Помощен център</p>
          <h1>Често задавани въпроси</h1>
          <p className="faq-hero__sub">
            Намерете отговор на най-честите въпроси за поръчки, доставка, връщане и продукти.
          </p>
        </div>

        <div className="faq-body">
          {GROUPS.map(group => (
            <div key={group.id}>
              <div className="faq-group__head">
                <div className="faq-group__icon">{group.icon}</div>
                <h2 className="faq-group__title">{group.title}</h2>
              </div>

              <div>
                {group.items.map((item, i) => {
                  const key = `${group.id}-${i}`;
                  const isOpen = !!open[key];
                  return (
                    <div className="faq-item" key={key}>
                      <button
                        className="faq-item__btn"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                      >
                        <span className="faq-item__q">{item.q}</span>
                        <svg
                          className={`faq-item__chevron${isOpen ? ' open' : ''}`}
                          viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.2"
                          strokeLinecap="round" strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      <div className={`faq-item__body${isOpen ? ' open' : ''}`}>
                        <p className="faq-item__a">{item.a}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* CTA */}
          <div className="faq-cta">
            <div className="faq-cta__left">
              <h3>Не намерихте отговор?</h3>
              <p>Свържете се с нас — ще отговорим в рамките на 1 работен ден.</p>
            </div>
            <Link href="/contact" className="faq-cta__btn">
              Свържете се с нас
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
