'use client';
import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

type Plan = { months: number; rate: number };

const PROVIDERS = [
  {
    id: 'tbi',
    name: 'TBI Bank',
    color: '#F89728',
    descKey: 'tbiDesc',
    installKey: 'tbiInstall',
    plans: [
      { months: 3,  rate: 0 },
      { months: 6,  rate: 0 },
      { months: 12, rate: 0 },
      { months: 18, rate: 0.015 },
      { months: 24, rate: 0.015 },
    ] as Plan[],
    logo: (
      <svg width="32" height="32" viewBox="33 62 90 90" xmlns="http://www.w3.org/2000/svg">
        <circle cx="78.2" cy="106.25" r="37" fill="#fff"/>
        <path fill="#F89728" fillRule="nonzero" d="M 35.917969 106.253906 C 35.917969 129.347656 54.644531 148.125 78.074219 148.265625 L 78.359375 148.265625 C 101.335938 148.265625 120.199219 129.433594 120.199219 106.253906 C 120.199219 83.109375 101.335938 63.972656 78.359375 63.972656 L 78.074219 63.972656 C 54.644531 64.140625 35.917969 83.191406 35.917969 106.253906 Z M 78.074219 145.09375 C 56.695313 144.921875 39.175781 127.605469 39.175781 106.253906 C 39.175781 84.933594 56.695313 67.335938 78.074219 67.171875 L 78.359375 67.171875 C 99.574219 67.171875 116.941406 84.851563 116.941406 106.253906 C 116.941406 127.695313 99.574219 145.09375 78.359375 145.09375 Z"/>
        <path fill="#000" fillRule="nonzero" d="M 58.058594 122.1875 L 58.058594 96.128906 L 50.980469 96.128906 L 50.980469 90.628906 L 70.410156 90.628906 L 70.410156 96.128906 L 63.046875 96.128906 L 63.046875 122.1875 Z"/>
        <path fill="#000" fillRule="nonzero" d="M 87.617188 99.171875 C 87.617188 96.007813 84.675781 95.789063 82.265625 95.789063 L 78.371094 95.789063 L 78.371094 103.039063 L 81.789063 103.039063 C 84.628906 103.039063 87.617188 102.847656 87.617188 99.171875 Z M 88.386719 112.59375 C 88.386719 108.808594 85.441406 108.234375 82.195313 108.234375 L 78.371094 108.234375 L 78.371094 116.96875 L 82.726563 116.964844 C 85.914063 116.964844 88.386719 116.226563 88.386719 112.59375 Z M 92.210938 98.621094 C 92.25 101.695313 91.386719 103.851563 88.980469 105.382813 C 92.03125 106.613281 93.429688 109.886719 93.429688 112.925781 C 93.429688 119.5625 89.542969 122.1875 82.945313 122.1875 L 73.667969 122.1875 L 73.667969 90.628906 L 82.757813 90.628906 C 88.269531 90.628906 92.136719 92.5625 92.210938 98.621094 Z"/>
        <path fill="#000" fillRule="nonzero" d="M 97.804688 122.1875 L 97.804688 90.628906 L 102.824219 90.628906 L 102.824219 122.1875 Z"/>
      </svg>
    ),
  },
  {
    id: 'credissimo',
    name: 'Credissimo',
    color: '#F68939',
    descKey: 'credDesc',
    installKey: 'credInstall',
    plans: [
      { months: 6,  rate: 0.01 },
      { months: 12, rate: 0.012 },
      { months: 24, rate: 0.015 },
      { months: 36, rate: 0.015 },
      { months: 48, rate: 0.015 },
    ] as Plan[],
    logo: (
      <svg width="32" height="32" viewBox="76 -2 90 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id="cred-clip">
            <rect x="76" y="-2" width="90" height="90" rx="22"/>
          </clipPath>
        </defs>
        <rect x="76" y="-2" width="90" height="90" rx="22" fill="#F68939"/>
        <g clipPath="url(#cred-clip)">
          <path fill="#fff" fillRule="nonzero" d="M 123.832031 63.578125 C 123.832031 58.535156 122.210938 51.878906 119.191406 46.226563 L 109.5 50.265625 C 111.117188 53.488281 112.128906 58.335938 112.128906 61.5625 C 112.128906 69.429688 108.292969 74.070313 101.234375 74.070313 C 94.171875 74.070313 90.335938 69.429688 90.335938 61.5625 C 90.335938 58.335938 91.347656 53.488281 92.960938 50.265625 L 83.28125 46.226563 C 80.253906 51.878906 78.636719 58.535156 78.636719 63.578125 C 78.636719 76.890625 88.117188 84.15625 101.234375 84.15625 C 114.351563 84.15625 123.832031 76.890625 123.832031 63.578125"/>
          <path fill="#fff" fillRule="nonzero" d="M 139.574219 39.773438 C 134.722656 39.773438 129.886719 40.984375 125.25 43.207031 L 128.882813 51.878906 C 131.496094 50.667969 134.722656 49.859375 137.949219 49.859375 C 145.820313 49.859375 150.0625 53.894531 150.0625 61.964844 C 150.0625 69.832031 145.414063 73.867188 137.558594 73.867188 C 133.917969 73.867188 131.09375 72.859375 129.082031 71.851563 L 125.449219 80.527344 C 128.277344 82.550781 133.121094 84.15625 138.15625 84.15625 C 152.078125 84.15625 162.765625 76.492188 162.765625 61.964844 C 162.765625 46.828125 154.097656 39.773438 139.574219 39.773438"/>
          <path fill="#fff" fillRule="nonzero" d="M 101.84375 44.386719 C 106.476563 44.386719 111.527344 43.179688 116.164063 40.960938 L 112.527344 32.289063 C 109.917969 33.503906 106.679688 34.3125 103.453125 34.3125 C 95.585938 34.3125 91.347656 30.265625 91.347656 22.199219 C 91.347656 14.320313 95.988281 10.285156 103.855469 10.285156 C 107.484375 10.285156 110.316406 11.296875 112.328125 12.308594 L 115.960938 3.023438 C 113.136719 1.414063 108.292969 0.00390625 103.253906 0.00390625 C 89.328125 0.00390625 78.636719 7.667969 78.636719 22.199219 C 78.636719 37.328125 87.3125 44.386719 101.84375 44.386719"/>
          <path fill="#fff" fillRule="nonzero" d="M 117.578125 20.589844 C 117.578125 25.628906 119.191406 32.289063 122.210938 37.933594 L 131.902344 33.902344 C 130.289063 30.675781 129.285156 25.832031 129.285156 22.597656 C 129.285156 14.734375 133.121094 10.089844 140.171875 10.089844 C 147.238281 10.089844 151.070313 14.734375 151.070313 22.597656 C 151.070313 25.832031 150.0625 30.675781 148.449219 33.902344 L 158.132813 37.933594 C 161.148438 32.289063 162.765625 25.628906 162.765625 20.589844 C 162.765625 7.265625 153.285156 0.00390625 140.171875 0.00390625 C 127.058594 0.00390625 117.578125 7.265625 117.578125 20.589844"/>
        </g>
      </svg>
    ),
  },
  {
    id: 'unicredit',
    name: 'UniCredit Bulbank',
    color: '#E30613',
    descKey: 'ucbDesc',
    installKey: 'ucbInstall',
    plans: [
      { months: 6,  rate: 0.01 },
      { months: 12, rate: 0.012 },
      { months: 24, rate: 0.014 },
      { months: 36, rate: 0.016 },
      { months: 48, rate: 0.018 },
      { months: 60, rate: 0.02 },
    ] as Plan[],
    logo: (
      <svg width="32" height="32" viewBox="0 0 3.0095407 3.0076608" xmlns="http://www.w3.org/2000/svg">
        <path fill="#e51e26" fillRule="nonzero" strokeWidth="0.120381" d="m 3.0095407,1.5028904 c 0,0.8311148 -0.6717294,1.5047704 -1.502724,1.5047704 C 0.67582246,3.0076608 0,2.3340052 0,1.5028904 0,0.67189603 0.67582246,-0.00187994 1.5068167,-0.00187994 c 0.8309946,0 1.5047703,0.67365561 1.5047703,1.50465004"/>
        <path fill="#ffffff" fillRule="nonzero" strokeWidth="0.120381" d="m 1.4114746,1.0849254 c 0,0 0.1739514,-0.22487284 0.1903234,-0.25244026 0.016734,-0.0275675 0.023233,-0.049838 -0.023836,-0.0792112 -0.047189,-0.029373 -0.2046487,-0.12170579 -0.2359477,-0.1456617 -0.0313,-0.0240764 -0.025763,-0.11243645 0.06645,-0.13085486 0.092091,-0.018298 0.8920279,-0.0847486 1.2035757,-0.0516436 0.3115474,0.0332252 0.2691731,0.12170581 0.2708585,0.19345327 0.0018,0.0718678 -0.1253173,0.17527565 -0.294935,0.32816037 0,0 -0.2801279,0.25990378 -0.4846564,0.43867068 -0.2047683,0.1787666 -0.8590425,0.7298737 -0.986286,0.8294294 -0.12712301,0.099555 -0.62020608,0.4664787 -0.6522276,0.4904346 -0.0320214,0.024076 -0.12146503,0.096065 -0.17021961,0.045865 -0.0487546,-0.050199 0,-0.1061767 0.0246782,-0.1404855 0.024919,-0.034067 1.01854901,-1.4371154 1.09222251,-1.5257164"/>
        <path fill="#e51e26" fillRule="nonzero" strokeWidth="0.120381" d="m 2.863879,0.51046426 c 0.012759,0.0306971 0.024076,0.088962 0.019141,0.1081027 -0.017937,0.0695806 -0.1253174,0.17503495 -0.2948145,0.32816038 0,0 -0.2801282,0.25990386 -0.4847768,0.43867076 C 1.8986591,1.5641647 1.2445052,2.1152717 1.1173823,2.2148275 0.99013887,2.3143831 0.49717611,2.6811857 0.46503423,2.7052621 c -0.0243172,0.018299 -0.13302171,0.034067 -0.18069283,0.032743 0.0154089,0.02203 0.0428558,0.046468 0.0713862,0.073795 0.0501992,0.048756 0.13807773,-0.021669 0.17021962,-0.045746 C 0.55796883,2.7422193 1.0511723,2.3751758 1.1782954,2.2756202 1.3055386,2.1760647 1.9598129,1.6249573 2.1643414,1.4461907 2.3688696,1.2674239 2.6491181,1.0073996 2.6491181,1.0073996 2.8186153,0.85439457 2.9113091,0.77121089 2.9293664,0.70150994 2.9373095,0.66984953 2.948628,0.56921047 2.8638795,0.51046426"/>
      </svg>
    ),
  },
];

function calcMonthly(price: number, months: number, rate: number): number {
  if (rate === 0) return price / months;
  const r = rate;
  const n = months;
  return (price * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function BuyNowPayLater({ price }: { price: number }) {
  const t = useTranslations('bnpl');
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const providerInfo: Record<string, { tag: string; desc: string }> = {
    tbi: { tag: t('tbiInstall'), desc: t('tbiDesc') },
    credissimo: { tag: t('credInstall'), desc: t('credDesc') },
    unicredit: { tag: t('ucbInstall'), desc: t('ucbDesc') },
  };

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function pickProvider(id: string) {
    if (selectedProvider === id) {
      setSelectedProvider(null);
      setSelectedMonths(null);
    } else {
      setSelectedProvider(id);
      setSelectedMonths(null);
    }
  }

  return (
    <div className="bnpl-wrap" ref={ref}>
      <button className={`bnpl-btn${open ? ' open' : ''}`} onClick={() => setOpen((o) => !o)}>
        <span className="bnpl-btn__left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span className="bnpl-btn__text">{t('button')}</span>
        </span>
        <span className="bnpl-btn__badges">
          <span className="bnpl-badge">TBI</span>
          <span className="bnpl-badge">Cred</span>
          <span className="bnpl-badge">UCB</span>
          <span className="bnpl-btn__chevron">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
              <polyline points="2,4 6,8 10,4"/>
            </svg>
          </span>
        </span>
      </button>

      {open && (
        <div className="bnpl-panel">
          <p className="bnpl-panel__intro">
            {t('split', { price })}
          </p>
          <div className="bnpl-list">
            {PROVIDERS.map((p) => {
              const info = providerInfo[p.id];
              const isSelected = selectedProvider === p.id;
              const activePlan = isSelected && selectedMonths
                ? p.plans.find((pl) => pl.months === selectedMonths)
                : null;
              const monthly = activePlan ? calcMonthly(price, activePlan.months, activePlan.rate) : null;
              const totalCost = monthly ? monthly * (activePlan?.months ?? 1) : null;

              return (
                <div key={p.id} className={`bnpl-item${isSelected ? ' selected' : ''}`} style={isSelected ? { borderColor: p.color + '66' } : {}}>
                  <div className="bnpl-item__row">
                    <div className="bnpl-item__logo">{p.logo}</div>
                    <div className="bnpl-item__body">
                      <div className="bnpl-item__top">
                        <span className="bnpl-item__name">{p.name}</span>
                        <span className="bnpl-item__tag" style={{ background: p.color + '18', color: p.color }}>{info.tag}</span>
                      </div>
                      <p className="bnpl-item__desc">{info.desc}</p>
                    </div>
                    <button
                      className={`bnpl-item__btn${isSelected ? ' active' : ''}`}
                      style={isSelected
                        ? { background: p.color, borderColor: p.color, color: '#fff' }
                        : { borderColor: p.color, color: p.color }
                      }
                      onClick={() => pickProvider(p.id)}
                    >
                      {isSelected ? t('selected') : t('choose')}
                    </button>
                  </div>

                  {isSelected && (
                    <div className="bnpl-plans">
                      <p className="bnpl-plans__label">{t('installments')}:</p>
                      <div className="bnpl-chips">
                        {p.plans.map((pl) => {
                          const m = calcMonthly(price, pl.months, pl.rate);
                          return (
                            <button
                              key={pl.months}
                              className={`bnpl-chip${selectedMonths === pl.months ? ' active' : ''}`}
                              style={selectedMonths === pl.months ? { borderColor: p.color, background: p.color + '12', color: p.color } : {}}
                              onClick={() => setSelectedMonths(selectedMonths === pl.months ? null : pl.months)}
                            >
                              <span className="bnpl-chip__months">{t('months', { months: pl.months })}</span>
                              <span className="bnpl-chip__amount">{m.toFixed(2)} €</span>
                              {pl.rate === 0 && <span className="bnpl-chip__free" style={{ color: p.color }}>0%</span>}
                            </button>
                          );
                        })}
                      </div>

                      {monthly !== null && activePlan && (
                        <div className="bnpl-summary" style={{ borderColor: p.color + '40', background: p.color + '08' }}>
                          <div className="bnpl-summary__row">
                            <span className="bnpl-summary__label">{t('monthlyPayment')}</span>
                            <span className="bnpl-summary__val" style={{ color: p.color }}>{monthly.toFixed(2)} €</span>
                          </div>
                          <div className="bnpl-summary__row">
                            <span className="bnpl-summary__label">{t('installments')}</span>
                            <span className="bnpl-summary__val">{activePlan.months}</span>
                          </div>
                          <div className="bnpl-summary__row">
                            <span className="bnpl-summary__label">{t('interest')}</span>
                            <span className="bnpl-summary__val">
                              {activePlan.rate === 0
                                ? t('noInterest')
                                : t('interestRate', { rate: (activePlan.rate * 100).toFixed(1) })}
                            </span>
                          </div>
                          <div className="bnpl-summary__row">
                            <span className="bnpl-summary__label">{t('total')}</span>
                            <span className="bnpl-summary__val">{totalCost!.toFixed(2)} €</span>
                          </div>
                          <a
                            href="#"
                            className="bnpl-apply-btn"
                            style={{ background: p.color }}
                            onClick={(e) => e.preventDefault()}
                          >
                            {t('apply', { provider: p.name })}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"/>
                              <polyline points="12,5 19,12 12,19"/>
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p className="bnpl-panel__note">{t('disclaimer')}</p>
        </div>
      )}
    </div>
  );
}
