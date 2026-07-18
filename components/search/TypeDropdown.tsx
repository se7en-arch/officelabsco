'use client';

import { useEffect, useRef, useState } from 'react';
import { PROP_TYPES } from '@/lib/data';
import { HomeIcon } from '@/components/icons';
import MobileSheet from './MobileSheet';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  value: string;
  onChange: (type: string) => void;
}

export default function TypeDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, PROP_TYPES.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    if (e.key === 'Enter' && highlighted >= 0) { e.preventDefault(); select(PROP_TYPES[highlighted]); }
    if (e.key === 'Escape') setOpen(false);
  }

  function select(type: string) {
    onChange(type);
    setOpen(false);
  }

  return (
    <div className="type-dd-wrap" ref={wrapRef}>
      <div className="srch__f">
        <input
          type="text"
          placeholder="Какво?"
          readOnly
          value={value}
          onClick={() => { setOpen(prev => !prev); setHighlighted(-1); }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Desktop dropdown */}
      {!isMobile && (
        <div className={`type-dd${open ? ' open' : ''}`}>
          <div className="type-dd__sep">Вид имот</div>
          {PROP_TYPES.map((type, i) => (
            <div
              key={type}
              className={`type-dd__item${i === highlighted ? ' highlighted' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(type); }}
            >
              <HomeIcon />{type}
            </div>
          ))}
        </div>
      )}

      {/* Mobile full-screen sheet */}
      <MobileSheet open={isMobile && open} title="Вид имот" onClose={() => setOpen(false)}>
        <div className="type-dd__sep">Вид имот</div>
        {PROP_TYPES.map(type => (
          <div key={type} className="type-dd__item" style={{ padding: '15px 20px', fontSize: 16 }} onClick={() => select(type)}>
            <HomeIcon />{type}
          </div>
        ))}
      </MobileSheet>
    </div>
  );
}

