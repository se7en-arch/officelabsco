'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

const GROUPS_BG = [
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
        a: 'Ще се свържем с вас за уточняване на доставката и ще ви информираме за статуса на поръчката.',
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
        a: 'Производството и доставката отнемат 20 работни дни след потвърждение на поръчката. Доставяме на територията на цялата страна.',
      },
      {
        q: 'Каква е цената на доставката?',
        a: 'Доставката е безплатна.',
      },
      {
        q: 'Доставяте ли до офис на куриер?',
        a: 'Да. При оформяне на поръчката можете да изберете доставка до адрес или до офис. Точният куриер и офисът се уговарят с вас след потвърждение на поръчката.',
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
        a: 'Монтажът е по желание и не е включен в цената на продукта. Цената му е посочена на страницата на всеки продукт.',
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
        a: 'Плащането се извършва по банков път, по проформа фактура. Не приемаме наложен платеж и плащане с карта на сайта.',
      },
      {
        q: 'Как се извършва плащането?',
        a: 'След потвърждение на поръчката изпращаме проформа фактура с банковите ни данни. Плащането се извършва по банков път.',
      },
      {
        q: 'Мога ли да получа фактура?',
        a: 'Да. Попълнете фирмените данни (ЕИК, ДДС номер, МОЛ) при оформяне на поръчката и ще издадем фактура.',
      },
    ],
  },
];


// English copy. Same groups and order as GROUPS_BG (icons are shared by index).
function buildGroupsEn() {
  return GROUPS_BG.map((group, gi) => ({
    ...group,
    title: [
      'Orders', 'Delivery', 'Returns and warranty', 'Products', 'Payment',
    ][gi],
    items: group.items.map((item, i) => ({
      q: EN_QA[gi][i][0],
      a: EN_QA[gi][i][1],
    })),
  }));
}

const EN_QA: [string, string][][] = [
  [
    ['How do I place an order?', 'Choose the product you want, add it to your cart and proceed to checkout. Enter your delivery details and confirm the order. You will receive a confirmation email straight away.'],
    ['Can I cancel an order?', 'Yes — contact us at info@officelabsco.com within 2 hours of placing it. Once the order has been dispatched, cancellation is not possible, but you can return the goods.'],
    ['How can I track my order?', 'We will contact you to arrange delivery and keep you informed about the status of your order.'],
    ['Is my order confirmed if I did not receive an email?', 'Check your "Spam" folder. If the email is missing, contact us and we will check the status of your order.'],
  ],
  [
    ['How long does delivery take?', 'Production and delivery take 20 working days from order confirmation. We deliver anywhere in Bulgaria.'],
    ['How much does delivery cost?', 'Delivery is free.'],
    ['Can I have my order delivered to a courier office?', 'Yes. When you place your order you can choose delivery to an address or to an office. The exact courier and office are agreed with you after the order is confirmed.'],
    ['What should I do if the parcel arrives damaged?', 'Refuse to accept the parcel and contact us immediately at info@officelabsco.com. We will arrange a replacement or a full refund.'],
  ],
  [
    ['How long do I have to return a product?', 'You have a statutory right of withdrawal within 14 calendar days of receipt. We also accept returns within 30 days for unused goods in their original packaging.'],
    ['How do I start a return?', 'Send an email to info@officelabsco.com with your order number and the reason for the return. We will give you instructions for sending the goods back.'],
    ['Who pays for return shipping?', 'Return costs are for your account, unless the goods are defective or we sent the wrong product — in that case we cover the costs.'],
    ['What warranty do the products have?', 'All products come with a 2-year statutory warranty. In case of a manufacturing defect you are entitled to free repair, replacement or a refund.'],
    ['How do I file a complaint?', 'Send an email to info@officelabsco.com describing the problem and attaching photos. We review complaints within 30 days.'],
  ],
  [
    ['Which furniture series do you offer?', 'We offer four designer series: ASTRA (modern minimalism), TERRA (natural materials), NOVA (functional design) and LOFT (industrial aesthetic).'],
    ['Do the photos match the real product colours?', 'We make every effort to make the photos as accurate as possible, but slight colour differences are possible due to the settings of different screens.'],
    ['Do you make custom orders?', 'Contact us at info@officelabsco.com with your requirements — we will let you know what is possible.'],
    ['Do the products need assembly?', 'Assembly is optional and is not included in the product price. The assembly price is shown on each product page.'],
  ],
  [
    ['Which payment methods do you accept?', 'Payment is made by bank transfer against a proforma invoice. We do not accept cash on delivery or card payments on the website.'],
    ['How does payment work?', 'After you place your order we send you a proforma invoice with our bank details. Payment is made by bank transfer.'],
    ['Can I get an invoice?', 'Yes. Enter your company details (UIC, VAT number, company representative) when placing your order and we will issue an invoice.'],
  ],
];

const UI = {
  bg: {
    eye: 'Помощен център',
    title: 'Често задавани въпроси',
    sub: 'Намерете отговор на най-честите въпроси за поръчки, доставка, връщане и продукти.',
    ctaTitle: 'Не намерихте отговор?',
    ctaText: 'Свържете се с нас — ще отговорим в рамките на 1 работен ден.',
    ctaBtn: 'Свържете се с нас',
  },
  en: {
    eye: 'Help centre',
    title: 'Frequently asked questions',
    sub: 'Find answers to the most common questions about orders, delivery, returns and products.',
    ctaTitle: "Didn't find your answer?",
    ctaText: 'Contact us — we will reply within 1 working day.',
    ctaBtn: 'Contact us',
  },
};

export default function FaqPage() {
  const locale = useLocale();
  const ui = locale === 'en' ? UI.en : UI.bg;
  const groups = locale === 'en' ? buildGroupsEn() : GROUPS_BG;
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
          <p className="faq-hero__eye">{ui.eye}</p>
          <h1>{ui.title}</h1>
          <p className="faq-hero__sub">
            {ui.sub}
          </p>
        </div>

        <div className="faq-body">
          {groups.map(group => (
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
              <h3>{ui.ctaTitle}</h3>
              <p>{ui.ctaText}</p>
            </div>
            <Link href="/contact" className="faq-cta__btn">
              {ui.ctaBtn}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
