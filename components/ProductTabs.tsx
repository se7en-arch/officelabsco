'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Review = {
  id: number;
  name: string;
  rating: number;
  text: string;
  verified: boolean;
  createdAt: string;
};

type Props = {
  description: string | null;
  seriesName: string;
  categoryName: string;
  dimensions?: string | null;
  weight?: string | null;
  colors?: string | null;
  material?: string | null;
  productId: number;
  reviews: Review[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="ptabs__stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 16 16"
          fill={i < rating ? '#F59E0B' : 'none'}
          stroke={i < rating ? '#F59E0B' : '#ccc'}
          strokeWidth="1.5">
          <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6z" />
        </svg>
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="star-picker">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="26" height="26" viewBox="0 0 16 16"
          fill={i < active ? '#F59E0B' : 'none'}
          stroke={i < active ? '#F59E0B' : '#ccc'}
          strokeWidth="1.5"
          style={{ cursor: 'pointer', transition: 'fill 0.1s, stroke 0.1s' }}
          onMouseEnter={() => setHovered(i + 1)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i + 1)}>
          <path d="M8 1.5l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.7l4-.6z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

export default function ProductTabs({
  description, seriesName, categoryName,
  dimensions, weight, colors, material,
  productId, reviews: initialReviews,
}: Props) {
  const t = useTranslations('product');
  const [tab, setTab] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [form, setForm] = useState({ name: '', rating: 0, text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const tabs = [
    { label: t('tabDescription') },
    { label: t('tabReviews'), badge: reviews.length > 0 ? reviews.length : null },
    { label: t('tabShipping') },
  ];

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.rating === 0) { setFormError('Моля, изберете оценка'); return; }
    if (form.name.trim().length < 2) { setFormError('Въведете вашето име'); return; }
    if (form.text.trim().length < 10) { setFormError('Мнението трябва да е поне 10 знака'); return; }

    setSubmitting(true);
    setFormError('');

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, name: form.name.trim(), rating: form.rating, text: form.text.trim() }),
    });

    if (res.ok) {
      const newReview = await res.json();
      setReviews(r => [...r, newReview]);
      setSubmitted(true);
      setForm({ name: '', rating: 0, text: '' });
    } else {
      setFormError('Грешка при изпращане. Моля, опитайте отново.');
    }
    setSubmitting(false);
  }

  return (
    <div className="ptabs">
      <nav className="ptabs__nav">
        {tabs.map((tab_, i) => (
          <button key={i}
            className={`ptabs__tab${tab === i ? ' active' : ''}`}
            onClick={() => setTab(i)}>
            {tab_.label}
            {tab_.badge != null && <span className="ptabs__badge">{tab_.badge}</span>}
          </button>
        ))}
      </nav>

      {/* Описание */}
      {tab === 0 && (
        <div className="ptabs__body">
          {description && <p className="ptabs__intro">{description}</p>}
          <table className="ptabs__specs-table">
            <tbody>
              <tr><th>{t('specSeries')}</th><td>{seriesName}</td></tr>
              <tr><th>{t('specCategory')}</th><td>{categoryName}</td></tr>
              {dimensions && <tr><th>{t('specDimensions')}</th><td>{dimensions}</td></tr>}
              {weight && <tr><th>{t('specWeight')}</th><td>{weight}</td></tr>}
              {colors && <tr><th>{t('specColors')}</th><td>{colors}</td></tr>}
              {material && <tr><th>{t('specMaterial')}</th><td>{material}</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Мнения */}
      {tab === 1 && (
        <div className="ptabs__body">
          {reviews.length > 0 ? (
            <div className="ptabs__reviews">
              {reviews.map((r, i) => (
                <div key={i} className="ptabs__review">
                  <div className="ptabs__review-avatar">{r.name.charAt(0)}</div>
                  <div className="ptabs__review-content">
                    <Stars rating={r.rating} />
                    <div className="ptabs__review-header">
                      <span className="ptabs__review-name">{r.name}</span>
                      {r.verified && (
                        <span className="ptabs__review-verified">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Потвърдена покупка
                        </span>
                      )}
                    </div>
                    <div className="ptabs__review-date">{formatDate(r.createdAt)}</div>
                    <p className="ptabs__review-text">{r.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="ptabs__no-reviews">Все още няма мнения за този продукт. Бъдете първи!</p>
          )}

          <div className="ptabs__review-form-wrap">
            <h3 className="ptabs__review-form-title">Напишете мнение</h3>
            {submitted ? (
              <p className="ptabs__review-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Благодарим за мнението ви!
              </p>
            ) : (
              <form className="ptabs__review-form" onSubmit={handleReviewSubmit}>
                <div className="ptabs__rf-rating">
                  <span className="ptabs__rf-label">Оценка</span>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <input
                  className="ptabs__rf-input"
                  placeholder="Вашето име"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  maxLength={60}
                />
                <textarea
                  className="ptabs__rf-textarea"
                  placeholder="Споделете мнението си за продукта..."
                  value={form.text}
                  onChange={e => setForm(f => ({ ...f, text: e.target.value }))}
                  rows={4}
                  maxLength={600}
                />
                {formError && <p className="ptabs__rf-error">{formError}</p>}
                <button type="submit" className="ptabs__rf-submit" disabled={submitting}>
                  {submitting ? 'Изпращане...' : 'Изпрати мнение'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Доставка */}
      {tab === 2 && (
        <div className="ptabs__body ptabs__shipping">
          <div className="ptabs__shipping-col">
            <h3 className="ptabs__shipping-heading">{t('shippingTitle')}</h3>
            <p>{t('shippingText')}</p>
            <table className="ptabs__delivery-table">
              <tbody>
                <tr>
                  <th>{t('shippingDestination')}</th>
                  <th>{t('shippingTime')}</th>
                  <th>{t('shippingPrice')}</th>
                </tr>
                <tr><td>{t('shippingSofia')}</td><td>{t('shippingTime1')}</td><td>{t('shippingFree')}</td></tr>
                <tr><td>{t('shippingNationwide')}</td><td>{t('shippingTime2')}</td><td>{t('shippingFree')}</td></tr>
                <tr><td>{t('shippingEU')}</td><td>{t('shippingTime3')}</td><td>{t('shippingOnRequest')}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="ptabs__shipping-col">
            <h3 className="ptabs__shipping-heading">{t('returnsTitle')}</h3>
            <p>{t('returnsText')}</p>
            <p>{t('returnsReasonsTitle')}</p>
            <ul className="ptabs__return-list">
              <li>{t('returnReason1')}</li>
              <li>{t('returnReason2')}</li>
              <li>{t('returnReason3')}</li>
            </ul>
            <p>{t('returnsPackaging')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
