'use client';
import { useEffect, useState } from 'react';
import DealerNav from '@/components/dealers/DealerNav';

interface DealerAddress {
  id: string; label: string; address: string; city: string; postcode: string | null; isDefault: boolean;
}
interface DealerProfile {
  companyName: string; contactName: string; email: string; phone: string;
  address: string; city: string; companyPostcode: string | null;
  eik: string; vatRegistered: boolean; vatNumber: string | null;
  discountPercent: number; status: string; createdAt: string;
  addresses: DealerAddress[];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
}

const emptyAddr = { label: '', address: '', city: '', postcode: '' };

export default function DealerAccountPage() {
  const [profile, setProfile]     = useState<DealerProfile | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showAdd, setShowAdd]     = useState(false);
  const [newAddr, setNewAddr]     = useState(emptyAddr);
  const [saving, setSaving]       = useState(false);
  const [addrErr, setAddrErr]     = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);

  async function loadProfile() {
    const r = await fetch('/api/dealers/me');
    if (r.ok) setProfile(await r.json());
    setLoading(false);
  }

  useEffect(() => { loadProfile(); }, []);

  async function addAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddrErr('');
    if (!newAddr.address.trim() || !newAddr.city.trim()) { setAddrErr('Адресът и градът са задължителни.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/dealers/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddr, isDefault: !profile?.addresses.length }),
      });
      const data = await res.json();
      if (!res.ok) { setAddrErr(data.error); return; }
      setNewAddr(emptyAddr);
      setShowAdd(false);
      loadProfile();
    } catch {
      setAddrErr('Грешка при запазване.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddr(id: string) {
    if (!confirm('Изтриване на адреса?')) return;
    setDeleting(id);
    await fetch('/api/dealers/addresses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    loadProfile();
  }

  async function setDefault(id: string) {
    await fetch('/api/dealers/addresses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDefault: true }),
    });
    loadProfile();
  }

  if (loading) return (
    <>
      <div className="dl-topbar"><div className="dl-topbar__logo">OfficeLabs Co</div></div>
      <div className="dl-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <div style={{ color: '#9CA3AF' }}>Зареждане...</div>
      </div>
    </>
  );
  if (!profile) return null;

  const isApproved = profile.status === 'APPROVED';

  return (
    <>
      <style>{`
        .addr-card {
          background: var(--card,#fff); border: 1px solid var(--border,#E5E7EB);
          border-radius: 12px; padding: 16px 20px;
          display: flex; align-items: flex-start; justify-content: space-between; gap: 12;
        }
        .addr-card--default { border-color: #F59E0B; background: rgba(245,158,11,.04); }
        .addr-label { font-size: 12px; font-weight: 700; color: #F59E0B; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
        .addr-text { font-size: 14px; font-weight: 600; }
        .addr-sub { font-size: 13px; color: #6B7280; margin-top: 2px; }
        .addr-badge { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 2px 8px; border-radius: 20px; background: rgba(245,158,11,.15); color: #B45309; border: 1px solid rgba(245,158,11,.3); }
        .addr-actions { display: flex; gap: 8px; flex-shrink: 0; }
        .addr-btn { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 8px; border: 1px solid var(--border,#E5E7EB); background: transparent; cursor: pointer; color: var(--text,#111); transition: background .15s; }
        .addr-btn:hover { background: var(--bg-hover,#F3F4F6); }
        .addr-btn--del { color: #EF4444; border-color: rgba(239,68,68,.3); }
        .addr-btn--del:hover { background: rgba(239,68,68,.07); }
        .addr-add-form { background: var(--card,#fff); border: 1px dashed rgba(245,158,11,.4); border-radius: 12px; padding: 20px; margin-top: 8px; }
        .addr-add-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .addr-add-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .addr-add-group label { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: .06em; }
        .addr-add-group input { padding: 9px 12px; border: 1px solid var(--border,#E5E7EB); border-radius: 8px; font-size: 14px; font-family: inherit; background: var(--bg,#fff); color: var(--text,#111); outline: none; }
        .addr-add-group input:focus { border-color: #F59E0B; box-shadow: 0 0 0 3px rgba(245,158,11,.1); }
        .addr-err { font-size: 13px; color: #EF4444; margin-bottom: 10px; }
        .addr-save-btn { padding: 9px 20px; background: linear-gradient(135deg,#F59E0B,#D97706); color: #fff; border: none; border-radius: 9px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .addr-save-btn:disabled { opacity: .5; cursor: not-allowed; }
        @media(max-width:540px){.addr-add-row{grid-template-columns:1fr}.addr-card{flex-direction:column}}
      `}</style>

      <DealerNav companyName={profile.companyName} discount={profile.discountPercent} active="account" />
      <div className="dl-page">
        <h1 className="dl-title">Моят профил</h1>
        <p className="dl-subtitle">Акаунт от {fmt(profile.createdAt)}</p>

        {/* Stats */}
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

        {/* Company info */}
        <div className="dl-card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em' }}>Фирмена информация</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {([
              ['Фирма', profile.companyName],
              ['ЕИК', profile.eik],
              ['ДДС регистрация', profile.vatRegistered ? (profile.vatNumber || 'Да') : 'Не'],
              ['Контактно лице', profile.contactName],
              ['Имейл', profile.email],
              ['Телефон', profile.phone],
              ['Адрес на фирмата', `${profile.address}, ${profile.city}${profile.companyPostcode ? ' ' + profile.companyPostcode : ''}`],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery addresses */}
        <div className="dl-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.06em', margin: 0 }}>
              Адреси за доставка
            </h2>
            {isApproved && !showAdd && (
              <button onClick={() => setShowAdd(true)} style={{ fontSize: 13, fontWeight: 700, padding: '6px 14px', borderRadius: 9, border: '1px solid rgba(245,158,11,.4)', background: 'rgba(245,158,11,.08)', color: '#B45309', cursor: 'pointer', fontFamily: 'inherit' }}>
                + Добави адрес
              </button>
            )}
          </div>

          {profile.addresses.length === 0 && !showAdd && (
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>
              {isApproved ? 'Нямате запазени адреси за доставка.' : 'Адресите за доставка ще бъдат достъпни след одобрение.'}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.addresses.map(addr => (
              <div key={addr.id} className={`addr-card${addr.isDefault ? ' addr-card--default' : ''}`}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="addr-label">{addr.label}</span>
                    {addr.isDefault && <span className="addr-badge">По подразбиране</span>}
                  </div>
                  <div className="addr-text">{addr.address}</div>
                  <div className="addr-sub">{addr.city}{addr.postcode ? `, ${addr.postcode}` : ''}</div>
                </div>
                <div className="addr-actions">
                  {!addr.isDefault && (
                    <button className="addr-btn" onClick={() => setDefault(addr.id)}>По подразбиране</button>
                  )}
                  <button className="addr-btn addr-btn--del" disabled={deleting === addr.id} onClick={() => deleteAddr(addr.id)}>
                    {deleting === addr.id ? '...' : 'Изтрий'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {showAdd && (
            <form className="addr-add-form" onSubmit={addAddress}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Нов адрес за доставка</div>
              {addrErr && <div className="addr-err">{addrErr}</div>}
              <div className="addr-add-row">
                <div className="addr-add-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Наименование</label>
                  <input type="text" value={newAddr.label} onChange={e => setNewAddr(a => ({ ...a, label: e.target.value }))} placeholder="Офис / Склад / Обект" maxLength={100} />
                </div>
                <div className="addr-add-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Адрес *</label>
                  <input type="text" value={newAddr.address} onChange={e => setNewAddr(a => ({ ...a, address: e.target.value }))} placeholder="ул. Примерна 1" required />
                </div>
                <div className="addr-add-group">
                  <label>Град *</label>
                  <input type="text" value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))} placeholder="София" required />
                </div>
                <div className="addr-add-group">
                  <label>Пощенски код</label>
                  <input type="text" value={newAddr.postcode} onChange={e => setNewAddr(a => ({ ...a, postcode: e.target.value }))} placeholder="1000" maxLength={10} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="submit" className="addr-save-btn" disabled={saving}>{saving ? 'Запазване...' : 'Запази адреса'}</button>
                <button type="button" className="addr-btn" onClick={() => { setShowAdd(false); setAddrErr(''); setNewAddr(emptyAddr); }}>Отказ</button>
              </div>
            </form>
          )}
        </div>

        <p style={{ fontSize: 13, color: '#9CA3AF' }}>
          За промяна на фирмената информация се свържете с нас на{' '}
          <a href="mailto:info@officelabsco.com" style={{ color: '#F59E0B' }}>info@officelabsco.com</a>
        </p>
      </div>
    </>
  );
}
