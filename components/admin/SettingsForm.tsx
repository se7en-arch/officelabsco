'use client';
import { useState } from 'react';

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [seo, setSeo] = useState({
    heroTitle: initialSettings.heroTitle ?? '',
    heroSubtitle: initialSettings.heroSubtitle ?? '',
    seoTitle: initialSettings.seoTitle ?? '',
    seoDescription: initialSettings.seoDescription ?? '',
    metaKeywords: initialSettings.metaKeywords ?? '',
  });

  const [pass, setPass] = useState({ newUsername: '', newPassword: '', confirmPassword: '' });
  const [savingSeo, setSavingSeo] = useState(false);
  const [savedSeo, setSavedSeo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [savedPass, setSavedPass] = useState(false);
  const [passError, setPassError] = useState('');

  async function saveSeo() {
    setSavingSeo(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seo),
    });
    setSavingSeo(false);
    setSavedSeo(true);
    setTimeout(() => setSavedSeo(false), 2500);
  }

  async function savePass() {
    setPassError('');
    if (!pass.newPassword.trim()) { setPassError('Въведи нова парола'); return; }
    if (pass.newPassword !== pass.confirmPassword) { setPassError('Паролите не съвпадат'); return; }
    setSavingPass(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newUsername: pass.newUsername, newPassword: pass.newPassword }),
    });
    setSavingPass(false);
    setSavedPass(true);
    setPass({ newUsername: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSavedPass(false), 2500);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* SEO & Content */}
      <div className="admin-card">
        <div className="admin-card__header"><h2>Съдържание и SEO</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Hero заглавие</label>
              <input className="admin-form-input" value={seo.heroTitle}
                onChange={e => setSeo(s => ({ ...s, heroTitle: e.target.value }))}
                placeholder="напр. Мебели за модерния офис" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Hero подзаглавие</label>
              <input className="admin-form-input" value={seo.heroSubtitle}
                onChange={e => setSeo(s => ({ ...s, heroSubtitle: e.target.value }))}
                placeholder="напр. Открийте нашата колекция" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">SEO заглавие на сайта</label>
              <input className="admin-form-input" value={seo.seoTitle}
                onChange={e => setSeo(s => ({ ...s, seoTitle: e.target.value }))}
                placeholder="напр. .office labs — Офис мебели" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">SEO мета описание</label>
              <textarea className="admin-form-textarea" rows={2} value={seo.seoDescription}
                onChange={e => setSeo(s => ({ ...s, seoDescription: e.target.value }))}
                placeholder="Кратко описание за търсачките..." />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">Ключови думи</label>
              <input className="admin-form-input" value={seo.metaKeywords}
                onChange={e => setSeo(s => ({ ...s, metaKeywords: e.target.value }))}
                placeholder="офис мебели, бюро, стол, ергономичен" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <button className="admin-action-btn" onClick={saveSeo} disabled={savingSeo} style={{ padding: '9px 20px' }}>
              {savingSeo ? 'Запазване...' : 'Запази настройките'}
            </button>
            {savedSeo && (
              <span style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Запазено
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Password change */}
      <div className="admin-card">
        <div className="admin-card__header"><h2>Промяна на достъп</h2></div>
        <div style={{ padding: 20 }}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Ново потребителско име</label>
              <input className="admin-form-input" value={pass.newUsername}
                onChange={e => setPass(p => ({ ...p, newUsername: e.target.value }))}
                placeholder="оставете празно за без промяна" />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">Нова парола *</label>
              <input className="admin-form-input" type="password" value={pass.newPassword}
                onChange={e => setPass(p => ({ ...p, newPassword: e.target.value }))} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Потвърди паролата *</label>
              <input className="admin-form-input" type="password" value={pass.confirmPassword}
                onChange={e => setPass(p => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
          </div>
          {passError && <p className="admin-error" style={{ marginBottom: 12 }}>{passError}</p>}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="admin-action-btn" onClick={savePass} disabled={savingPass} style={{ padding: '9px 20px' }}>
              {savingPass ? 'Запазване...' : 'Смени паролата'}
            </button>
            {savedPass && (
              <span style={{ color: 'var(--success)', fontSize: 14, fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Паролата е сменена — влезте отново
              </span>
            )}
          </div>
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)' }}>
            След промяна на паролата ще трябва да влезете отново.
          </p>
        </div>
      </div>
    </div>
  );
}
