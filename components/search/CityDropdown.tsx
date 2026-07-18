'use client';

import { useEffect, useRef, useState } from 'react';
import { BG_CITIES, BG_CITIES_TOP } from '@/lib/data';
import { PinIcon } from '@/components/icons';
import MobileSheet from './MobileSheet';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  value: string;
  onChange: (city: string) => void;
}

export default function CityDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [mq, setMq] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  const q = value.trim().toLowerCase();
  const items = q ? BG_CITIES.filter(c => c.toLowerCase().startsWith(q)) : BG_CITIES_TOP;
  const label = q ? (items.length ? 'Предложения' : '') : 'Популярни градове';

  const mqLow = mq.trim().toLowerCase();
  const mobileItems = mqLow ? BG_CITIES.filter(c => c.toLowerCase().startsWith(mqLow)) : BG_CITIES_TOP;
  const mobileLabel = mqLow ? (mobileItems.length ? 'Предложения' : '') : 'Популярни градове';

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!items.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, items.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(items[highlighted]); }
    if (e.key === 'Escape') setOpen(false);
  }

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setMq('');
  }

  return (
    <div className="city-dd-wrap" ref={wrapRef}>
      <div className="srch__f">
        <input
          type="text"
          placeholder="Къде?"
          autoComplete="off"
          value={value}
          readOnly={isMobile}
          onChange={e => { if (!isMobile) { onChange(e.target.value); setOpen(true); setHighlighted(-1); } }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Desktop dropdown */}
      {!isMobile && (
        <div className={`city-dd${open && items.length ? ' open' : ''}`}>
          {label && <div className="city-dd__sep">{label}</div>}
          {items.map((city, i) => (
            <div
              key={city}
              className={`city-dd__item${i === highlighted ? ' highlighted' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(city); }}
            >
              <PinIcon />{city}
            </div>
          ))}
        </div>
      )}

      {/* Mobile full-screen sheet */}
      <MobileSheet open={isMobile && open} title="Избери град" onClose={() => setOpen(false)}>
        <div style={{ padding: '14px 16px 8px' }}>
          <input
            autoFocus
            type="text"
            placeholder="Търси град..."
            value={mq}
            onChange={e => setMq(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb', borderRadius: 12, fontSize: 16, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
        {mobileLabel && <div className="city-dd__sep">{mobileLabel}</div>}
        {mobileItems.map(city => (
          <div key={city} className="city-dd__item" style={{ padding: '15px 20px', fontSize: 16 }} onClick={() => select(city)}>
            <PinIcon />{city}
          </div>
        ))}
      </MobileSheet>
    </div>
  );
}

