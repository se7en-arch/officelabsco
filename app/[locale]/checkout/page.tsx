'use client';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useCart } from '@/lib/cart-store';
import { useTranslations } from 'next-intl';
import BuyNowPayLater from '@/components/BuyNowPayLater';

const CARRIERS = [
  { id: 'speedy', label: 'Speedy' },
  { id: 'econt',  label: 'Econt' },
  { id: 'dpd',    label: 'DPD' },
  { id: 'dhl',    label: 'DHL' },
];

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const { items, total, clear } = useCart();
  const rawTotal = total();

  const STEPS = [t('stepData'), t('stepDelivery'), t('stepPayment')];

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [phone, setPhone]           = useState('');
  const [email, setEmail]           = useState('');
  const [custType, setCustType]     = useState<'person' | 'company'>('person');
  const [company, setCompany]       = useState('');
  const [eik, setEik]               = useState('');
  const [vat, setVat]               = useState('');
  const [mol, setMol]               = useState('');

  const [carrier, setCarrier]       = useState('speedy');
  const [delivType, setDelivType]   = useState<'address' | 'office'>('address');
  const [city, setCity]             = useState('');
  const [address, setAddress]       = useState('');
  const [postcode, setPostcode]     = useState('');

  const [payment, setPayment]       = useState<'card' | 'cod'>('card');
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // ── Regex patterns ──────────────────────────────────────────
  const RX = {
    name:     /^[А-ЯA-Zа-яa-zÀ-ÿ][А-ЯA-Zа-яa-zÀ-ÿ\s\-']{1,49}$/u,
    phone:    /^(\+359|0)([ \-]?\d){8,10}$/,
    email:    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    eik:      /^\d{9}(\d{4})?$/,
    vat:      /^BG\d{9,10}$/i,
    postcode: /^[1-9]\d{3}$/,
    city:     /^[А-ЯA-Zа-яa-zÀ-ÿ][А-ЯA-Zа-яa-zÀ-ÿ0-9\s\-\.]{1,79}$/u,
    address:  /^.{5,200}$/,
    company:  /^.{2,100}$/,
    mol:      /^[А-ЯA-Zа-яa-zÀ-ÿ\s\-]{5,100}$/u,
  };

  const MSGS: Record<string, string> = {
    firstName_invalid: 'Само букви, минимум 2 символа',
    lastName_invalid:  'Само букви, минимум 2 символа',
    phone_invalid:     'Формат: +359 88 888 8888 или 088 888 8888',
    email_invalid:     'Невалиден имейл адрес (напр. ivan@mail.bg)',
    eik_invalid:       'ЕИК трябва да е 9 или 13 цифри',
    vat_invalid:       'Формат: BG123456789 (BG + 9 или 10 цифри)',
    postcode_invalid:  'Пощенски код: 4 цифри (напр. 1000)',
    city_invalid:      'Невалидно населено място',
    address_invalid:   'Адресът трябва да е поне 5 символа',
    company_invalid:   'Минимум 2 символа',
    mol_invalid:       'Въведете поне две имена (само букви)',
  };

  function fieldError(name: string, value: string): string {
    const req = t('required');
    const v = value.trim();
    if (!v) return req;
    switch (name) {
      case 'firstName': return RX.name.test(v)     ? '' : MSGS.firstName_invalid;
      case 'lastName':  return RX.name.test(v)     ? '' : MSGS.lastName_invalid;
      case 'phone':     return RX.phone.test(v)    ? '' : MSGS.phone_invalid;
      case 'email':     return RX.email.test(v)    ? '' : MSGS.email_invalid;
      case 'company':   return RX.company.test(v)  ? '' : MSGS.company_invalid;
      case 'eik':       return RX.eik.test(v)      ? '' : MSGS.eik_invalid;
      case 'vat':       return RX.vat.test(v)      ? '' : MSGS.vat_invalid;
      case 'mol':       return RX.mol.test(v)      ? '' : MSGS.mol_invalid;
      case 'city':      return RX.city.test(v)     ? '' : MSGS.city_invalid;
      case 'postcode':  return RX.postcode.test(v) ? '' : MSGS.postcode_invalid;
      case 'address':   return RX.address.test(v)  ? '' : MSGS.address_invalid;
      default: return '';
    }
  }

  function touch(name: string, value: string) {
    setTouched(prev => new Set(prev).add(name));
    const msg = fieldError(name, value);
    setErrors(prev => ({ ...prev, [name]: msg }));
  }

  // VAT is optional — validate only if filled
  function touchVat(value: string) {
    const v = value.trim();
    const msg = v && !RX.vat.test(v) ? MSGS.vat_invalid : '';
    setTouched(prev => new Set(prev).add('vat'));
    setErrors(prev => ({ ...prev, vat: msg }));
  }

  function validate0() {
    const fields: [string, string][] = [
      ['firstName', firstName], ['lastName', lastName],
      ['phone', phone], ['email', email],
    ];
    if (custType === 'company') {
      fields.push(['company', company], ['eik', eik], ['mol', mol]);
    }
    const e: Record<string, string> = {};
    fields.forEach(([n, v]) => {
      const msg = fieldError(n, v);
      if (msg) e[n] = msg;
    });
    if (custType === 'company' && vat.trim() && !RX.vat.test(vat.trim())) {
      e.vat = MSGS.vat_invalid;
    }
    setErrors(e);
    setTouched(new Set(fields.map(([n]) => n)));
    return Object.keys(e).length === 0;
  }

  function validate1() {
    const fields: [string, string][] = [['city', city]];
    if (delivType === 'address') {
      fields.push(['address', address], ['postcode', postcode]);
    }
    const e: Record<string, string> = {};
    fields.forEach(([n, v]) => {
      const msg = fieldError(n, v);
      if (msg) e[n] = msg;
    });
    setErrors(e);
    setTouched(new Set(fields.map(([n]) => n)));
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 0 && !validate0()) return;
    if (step === 1 && !validate1()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const ss = typeof sessionStorage !== 'undefined' ? sessionStorage : null;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, phone,
          company: company || null, eik: eik || null, vat: vat || null, mol: mol || null,
          carrier, delivType, city,
          address: delivType === 'address' ? address : null,
          postcode: delivType === 'address' ? postcode : null,
          payment,
          total: rawTotal,
          items: items.map(i => ({
            id: i.id, name: i.name, slug: i.slug,
            price: i.price, quantity: i.quantity, image: i.image,
          })),
          timezone:    tz ?? null,
          utmSource:   ss?.getItem('utm_source')   ?? null,
          utmMedium:   ss?.getItem('utm_medium')   ?? null,
          utmCampaign: ss?.getItem('utm_campaign') ?? null,
        }),
      });
    } catch {}
    clear();
    setDone(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const carrierLabel = CARRIERS.find(c => c.id === carrier)?.label ?? carrier;

  if (items.length === 0 && !done) {
    return (
      <div className="page-wrap">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-state__title">{t('cartEmpty')}</div>
          <div className="empty-state__sub">{t('cartEmptyDesc')}</div>
          <Link href="/shop" className="btn-primary">{t('toShop')}</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-wrap">
        <div className="checkout-success">
          <div className="checkout-success__icon">✓</div>
          <h1 className="checkout-success__title">{t('successTitle')}</h1>
          <p className="checkout-success__sub">
            {t('successEmail', { email })}<br />
            {t('successCall', { carrier: carrierLabel })}
          </p>
          <Link href="/shop" className="btn-primary" style={{ marginTop: 24 }}>{t('continueShopping')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <nav className="breadcrumb">
        <Link href="/">{t('breadHome')}</Link>
        <span className="breadcrumb__sep">/</span>
        <Link href="/cart">{t('breadCart')}</Link>
        <span className="breadcrumb__sep">/</span>
        <span style={{ color: 'var(--text)' }}>{t('breadOrder')}</span>
      </nav>

      {/* Progress */}
      <div className="co-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`co-step${i === step ? ' active' : ''}${i < step ? ' done' : ''}`}>
            <span className="co-step__num">{i < step ? '✓' : i + 1}</span>
            <span className="co-step__label">{s}</span>
            {i < STEPS.length - 1 && <span className="co-step__line" />}
          </div>
        ))}
      </div>

      <div className="co-layout">
        {/* ── FORM ── */}
        <div className="co-form">

          {/* STEP 0 — Personal */}
          {step === 0 && (
            <div className="co-section">
              <h2 className="co-section__title">{t('personalTitle')}</h2>

              <div className="co-row">
                <div className="co-field">
                  <label className="co-label">{t('firstName')} <span>*</span></label>
                  <input
                    className={`co-input${errors.firstName ? ' error' : touched.has('firstName') && !errors.firstName ? ' valid' : ''}`}
                    value={firstName}
                    onChange={e => { setFirstName(e.target.value); if (touched.has('firstName')) touch('firstName', e.target.value); }}
                    onBlur={e => touch('firstName', e.target.value)}
                    placeholder="Иван"
                    maxLength={50}
                    autoComplete="given-name"
                  />
                  {errors.firstName && <span className="co-err">{errors.firstName}</span>}
                </div>
                <div className="co-field">
                  <label className="co-label">{t('lastName')} <span>*</span></label>
                  <input
                    className={`co-input${errors.lastName ? ' error' : touched.has('lastName') && !errors.lastName ? ' valid' : ''}`}
                    value={lastName}
                    onChange={e => { setLastName(e.target.value); if (touched.has('lastName')) touch('lastName', e.target.value); }}
                    onBlur={e => touch('lastName', e.target.value)}
                    placeholder="Иванов"
                    maxLength={50}
                    autoComplete="family-name"
                  />
                  {errors.lastName && <span className="co-err">{errors.lastName}</span>}
                </div>
              </div>

              <div className="co-row">
                <div className="co-field">
                  <label className="co-label">{t('phone')} <span>*</span></label>
                  <input
                    className={`co-input${errors.phone ? ' error' : touched.has('phone') && !errors.phone ? ' valid' : ''}`}
                    value={phone}
                    onChange={e => { setPhone(e.target.value); if (touched.has('phone')) touch('phone', e.target.value); }}
                    onBlur={e => touch('phone', e.target.value)}
                    placeholder="+359 88 888 8888"
                    type="tel"
                    maxLength={16}
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="co-err">{errors.phone}</span>}
                </div>
                <div className="co-field">
                  <label className="co-label">{t('email')} <span>*</span></label>
                  <input
                    className={`co-input${errors.email ? ' error' : touched.has('email') && !errors.email ? ' valid' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (touched.has('email')) touch('email', e.target.value); }}
                    onBlur={e => touch('email', e.target.value)}
                    placeholder="ivan@example.com"
                    type="email"
                    maxLength={100}
                    autoComplete="email"
                  />
                  {errors.email && <span className="co-err">{errors.email}</span>}
                </div>
              </div>

              <div className="co-toggle-wrap">
                <button className={`co-toggle${custType === 'person' ? ' active' : ''}`} onClick={() => setCustType('person')}>{t('person')}</button>
                <button className={`co-toggle${custType === 'company' ? ' active' : ''}`} onClick={() => setCustType('company')}>{t('companyInvoice')}</button>
              </div>

              {custType === 'company' && (
                <div className="co-company-fields">
                  <div className="co-field">
                    <label className="co-label">{t('company')} <span>*</span></label>
                    <input
                      className={`co-input${errors.company ? ' error' : touched.has('company') && !errors.company ? ' valid' : ''}`}
                      value={company}
                      onChange={e => { setCompany(e.target.value); if (touched.has('company')) touch('company', e.target.value); }}
                      onBlur={e => touch('company', e.target.value)}
                      placeholder="ООД / ЕООД / АД"
                      maxLength={100}
                    />
                    {errors.company && <span className="co-err">{errors.company}</span>}
                  </div>
                  <div className="co-row">
                    <div className="co-field">
                      <label className="co-label">{t('eik')} <span>*</span></label>
                      <input
                        className={`co-input${errors.eik ? ' error' : touched.has('eik') && !errors.eik ? ' valid' : ''}`}
                        value={eik}
                        onChange={e => { const v = e.target.value.replace(/\D/g, ''); setEik(v); if (touched.has('eik')) touch('eik', v); }}
                        onBlur={e => touch('eik', e.target.value)}
                        placeholder="123456789"
                        inputMode="numeric"
                        maxLength={13}
                      />
                      {errors.eik && <span className="co-err">{errors.eik}</span>}
                    </div>
                    <div className="co-field">
                      <label className="co-label">{t('vat')} <small>({t('vatOptional')})</small></label>
                      <input
                        className={`co-input${errors.vat ? ' error' : touched.has('vat') && vat.trim() && !errors.vat ? ' valid' : ''}`}
                        value={vat}
                        onChange={e => { setVat(e.target.value.toUpperCase()); if (touched.has('vat')) touchVat(e.target.value); }}
                        onBlur={e => touchVat(e.target.value)}
                        placeholder="BG123456789"
                        maxLength={13}
                      />
                      {errors.vat && <span className="co-err">{errors.vat}</span>}
                    </div>
                  </div>
                  <div className="co-field">
                    <label className="co-label">{t('mol')} <span>*</span></label>
                    <input
                      className={`co-input${errors.mol ? ' error' : touched.has('mol') && !errors.mol ? ' valid' : ''}`}
                      value={mol}
                      onChange={e => { setMol(e.target.value); if (touched.has('mol')) touch('mol', e.target.value); }}
                      onBlur={e => touch('mol', e.target.value)}
                      placeholder="Три имена на представляващия"
                      maxLength={100}
                    />
                    {errors.mol && <span className="co-err">{errors.mol}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Delivery */}
          {step === 1 && (
            <div className="co-section">
              <h2 className="co-section__title">{t('deliveryTitle')}</h2>

              <div className="co-field" style={{ marginBottom: 24 }}>
                <label className="co-label">{t('courier')}</label>
                <div className="co-carriers">
                  {CARRIERS.map((c) => (
                    <button
                      key={c.id}
                      className={`co-carrier${carrier === c.id ? ' active' : ''}`}
                      onClick={() => setCarrier(c.id)}
                    >
                      <span className="co-carrier__name">{c.label}</span>
                      <span className="co-carrier__price">{t('deliveryFree')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="co-toggle-wrap" style={{ marginBottom: 24 }}>
                <button className={`co-toggle${delivType === 'address' ? ' active' : ''}`} onClick={() => setDelivType('address')}>{t('toAddress')}</button>
                <button className={`co-toggle${delivType === 'office' ? ' active' : ''}`} onClick={() => setDelivType('office')}>{t('toOffice')}</button>
              </div>

              <div className="co-row">
                <div className="co-field">
                  <label className="co-label">{t('city')} <span>*</span></label>
                  <input
                    className={`co-input${errors.city ? ' error' : touched.has('city') && !errors.city ? ' valid' : ''}`}
                    value={city}
                    onChange={e => { setCity(e.target.value); if (touched.has('city')) touch('city', e.target.value); }}
                    onBlur={e => touch('city', e.target.value)}
                    placeholder="София"
                    maxLength={80}
                    autoComplete="address-level2"
                  />
                  {errors.city && <span className="co-err">{errors.city}</span>}
                </div>
                {delivType === 'address' && (
                  <div className="co-field">
                    <label className="co-label">{t('postcode')} <span>*</span></label>
                    <input
                      className={`co-input${errors.postcode ? ' error' : touched.has('postcode') && !errors.postcode ? ' valid' : ''}`}
                      value={postcode}
                      onChange={e => { const v = e.target.value.replace(/\D/g, '').slice(0, 4); setPostcode(v); if (touched.has('postcode')) touch('postcode', v); }}
                      onBlur={e => touch('postcode', e.target.value)}
                      placeholder="1000"
                      inputMode="numeric"
                      maxLength={4}
                      autoComplete="postal-code"
                    />
                    {errors.postcode && <span className="co-err">{errors.postcode}</span>}
                  </div>
                )}
              </div>

              {delivType === 'address' && (
                <div className="co-field">
                  <label className="co-label">{t('address')} <span>*</span></label>
                  <input
                    className={`co-input${errors.address ? ' error' : touched.has('address') && !errors.address ? ' valid' : ''}`}
                    value={address}
                    onChange={e => { setAddress(e.target.value); if (touched.has('address')) touch('address', e.target.value); }}
                    onBlur={e => touch('address', e.target.value)}
                    placeholder="ул. Примерна 1, ет. 2, ап. 3"
                    maxLength={200}
                    autoComplete="street-address"
                  />
                  {errors.address && <span className="co-err">{errors.address}</span>}
                </div>
              )}

              {delivType === 'office' && (
                <p className="co-hint">{t('officeHint', { carrier: carrierLabel })}</p>
              )}
            </div>
          )}

          {/* STEP 2 — Payment */}
          {step === 2 && (
            <div className="co-section">
              <h2 className="co-section__title">{t('paymentTitle')}</h2>
              <div className="co-payments">
                <button
                  className={`co-payment${payment === 'card' ? ' active' : ''}`}
                  onClick={() => setPayment('card')}
                >
                  <span className="co-payment__icon">💳</span>
                  <div>
                    <div className="co-payment__label">{t('cardLabel')}</div>
                    <div className="co-payment__sub">{t('cardSub')}</div>
                  </div>
                </button>
                <button
                  className={`co-payment${payment === 'cod' ? ' active' : ''}`}
                  onClick={() => setPayment('cod')}
                >
                  <span className="co-payment__icon">💵</span>
                  <div>
                    <div className="co-payment__label">{t('codLabel')}</div>
                    <div className="co-payment__sub">{t('codSub')}</div>
                  </div>
                </button>
              </div>

              <BuyNowPayLater price={rawTotal} />

              {payment === 'card' && (
                <div className="co-card-info">
                  <p>{t('cardHint')}</p>
                </div>
              )}
              {payment === 'cod' && (
                <div className="co-card-info">
                  <p>{t('codHint')}</p>
                </div>
              )}

              <div className="co-review">
                <h3 className="co-review__title">{t('reviewTitle')}</h3>
                <div className="co-review__row"><span>{t('reviewClient')}</span><span>{firstName} {lastName}</span></div>
                <div className="co-review__row"><span>{t('reviewPhone')}</span><span>{phone}</span></div>
                <div className="co-review__row"><span>{t('reviewEmail')}</span><span>{email}</span></div>
                {custType === 'company' && (
                  <>
                    <div className="co-review__row"><span>{t('reviewCompany')}</span><span>{company}</span></div>
                    <div className="co-review__row"><span>{t('reviewEik')}</span><span>{eik}</span></div>
                    {vat && <div className="co-review__row"><span>{t('reviewVat')}</span><span>{vat}</span></div>}
                  </>
                )}
                <div className="co-review__row"><span>{t('reviewCourier')}</span><span>{carrierLabel}</span></div>
                <div className="co-review__row">
                  <span>{t('reviewDelivery')}</span>
                  <span>{delivType === 'address' ? `${city}, ${address}` : t('toOfficeCity', { city })}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="co-nav">
            {step > 0 && (
              <button className="co-nav__back" onClick={() => setStep(s => s - 1)}>{t('back')}</button>
            )}
            {step < 2 ? (
              <button className="co-nav__next" onClick={next}>{t('next')}</button>
            ) : (
              <button className="co-nav__submit" onClick={submit}>
                {payment === 'card' ? t('confirmPay') : t('confirmOrder')}
              </button>
            )}
          </div>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="co-summary">
          <div className="co-summary__title">{t('summaryTitle')}</div>
          {items.map((item) => (
            <div key={item.id} className="co-summary__item">
              <div className="co-summary__img">
                <Image src={item.image} alt={item.name} width={52} height={52} style={{ objectFit: 'contain', padding: 4 }} />
              </div>
              <div className="co-summary__info">
                <span className="co-summary__name">{item.name}</span>
                <span className="co-summary__qty">× {item.quantity}</span>
              </div>
              <span className="co-summary__price">{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <div className="co-summary__divider" />
          <div className="co-summary__row">
            <span>{t('summaryDelivery')}</span><span>{t('summaryDeliveryFree')}</span>
          </div>
          <div className="co-summary__row co-summary__row--total">
            <span>{t('summaryTotal')}</span><strong>{rawTotal.toFixed(2)} €</strong>
          </div>
          {step < 2 && <BuyNowPayLater key={step} price={rawTotal} />}
        </div>
      </div>
    </div>
  );
}
