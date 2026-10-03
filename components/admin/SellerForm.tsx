'use client';
import { useState } from 'react';
import type { Seller } from '@/lib/seller';

const FIELDS: Array<{ key: keyof Seller; label: string; hint?: string }> = [
  { key: 'name', label: 'Юридическо име' },
  { key: 'eik', label: 'ЕИК' },
  { key: 'vatNumber', label: 'ДДС номер', hint: 'По желание' },
  { key: 'address', label: 'Адрес на управление' },
  { key: 'bankName', label: 'Банка' },
  { key: 'iban', label: 'IBAN' },
  { key: 'bic', label: 'BIC' },
];

export default function SellerForm({ initial }: { initial: Seller }) {
  const [seller, setSeller] = useState<Seller>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function set<K extends keyof Seller>(key: K, value: Seller[K]) {
    setSeller((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    setSaving(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seller),
      });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? { ok: true, text: 'Данните са записани.' } : { ok: false, text: data.error ?? 'Грешка при запис.' });
    } catch {
      setMsg({ ok: false, text: 'Грешка при свързване.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card" style={{ marginTop: 24 }}>
      <div className="admin-card__header">
        <h2>Данни за фирмата (проформа)</h2>
      </div>
      <div className="admin-card__body" style={{ display: 'grid', gap: 14, padding: 20 }}>
        <p style={{ fontSize: 12, color: '#b45309' }}>
          Текущите данни са тестови. Замени ги с реалните, преди да изпратиш първата проформа.
        </p>
        {FIELDS.map((f) => (
          <div key={f.key} className="admin-field">
            <label>{f.label}{f.hint ? <span style={{ color: '#888', fontWeight: 400 }}> ({f.hint})</span> : null}</label>
            <input
              className="admin-form-input"
              value={String(seller[f.key] ?? '')}
              onChange={(e) => set(f.key, e.target.value as never)}
            />
          </div>
        ))}
        <div className="admin-field">
          <label>Срок за плащане (дни)</label>
          <input
            className="admin-form-input"
            type="number" min={1} max={60}
            value={seller.paymentDays}
            onChange={(e) => set('paymentDays', parseInt(e.target.value, 10) || 3)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button type="button" className="admin-btn" onClick={save} disabled={saving}>
            {saving ? 'Записване…' : 'Запази'}
          </button>
          {msg && <span style={{ fontSize: 13, color: msg.ok ? '#15803d' : '#b91c1c' }}>{msg.text}</span>}
        </div>
      </div>
    </div>
  );
}
