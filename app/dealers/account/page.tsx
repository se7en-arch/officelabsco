'use client';
import { useEffect, useState } from 'react';
import DealerNav from '@/components/dealers/DealerNav';

interface DealerProfile {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  eik: string;
  vatRegistered: boolean;
  vatNumber: string | null;
  discountPercent: number;
  status: string;
  createdAt: string;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function DealerAccountPage() {
  const [profile, setProfile] = useState<DealerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dealers/me').then(r => r.json()).then(setProfile).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <div className="dl-topbar"><div className="dl-topbar__logo">OfficeLabs Co</div></div>
      <div className="dl-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ color: '#9CA3AF' }}>Зареждане...</div>
      </div>
    </>
  );

  if (!profile) return null;

  return (
    <>
      <DealerNav companyName={profile.companyName} discount={profile.discountPercent} active="account" />
      <div className="dl-page">
        <h1 className="dl-title">Моят профил</h1>
        <p className="dl-subtitle">Акаунт от {fmt(profile.createdAt)}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="dl-stat">
            <div className="dl-stat__label">Дилърска отстъпка</div>
            <div className="dl-stat__value" style={{ color: '#F59E0B' }}>{profile.discountPercent}%</div>
          </div>
          <div className="dl-stat">
            <div className="dl-stat__label">Статус</div>
            <div style={{ marginTop: 4 }}>
              <span className={`dl-badge dl-badge--${profile.status.toLowerCase()}`}>
                {{ APPROVED: 'Одобрен', PENDING: 'Чака одобрение', REJECTED: 'Отказан' }[profile.status] ?? profile.status}
              </span>
            </div>
          </div>
        </div>

        <div className="dl-card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em' }}>Фирмена информация</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {[
              ['Фирма', profile.companyName],
              ['ЕИК', profile.eik],
              ['ДДС регистрация', profile.vatRegistered ? (profile.vatNumber || 'Да') : 'Не'],
              ['Контактно лице', profile.contactName],
              ['Имейл', profile.email],
              ['Телефон', profile.phone],
              ['Адрес', profile.address],
              ['Град', profile.city],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#9CA3AF' }}>
          За промяна на данните се свържете с нас на{' '}
          <a href="mailto:info@officelabsco.com" style={{ color: '#F59E0B' }}>info@officelabsco.com</a>
        </p>
      </div>
    </>
  );
}
