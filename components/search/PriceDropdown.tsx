'use client';

import { useEffect, useRef, useState } from 'react';
import { fmtPrice } from '@/lib/utils';
import MobileSheet from './MobileSheet';
import { useIsMobile } from '@/hooks/useIsMobile';

interface Props {
  priceMin: string;
  priceMax: string;
  onChangeMin: (v: string) => void;
  onChangeMax: (v: string) => void;
}

export default function PriceDropdown({ priceMin, priceMax, onChangeMin, onChangeMax }: Props) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState(priceMin);
  const [localMax, setLocalMax] = useState(priceMax);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (open) { setLocalMin(priceMin); setLocalMax(priceMax); }
  }, [open]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  function apply() {
    onChangeMin(localMin);
    onChangeMax(localMax);
    setOpen(false);
  }

  const displayText =
    !priceMin && !priceMax ? '' :
    priceMin && !priceMax  ? `от ${fmtPrice(parseInt(priceMin))} €` :
    !priceMin && priceMax  ? `до ${fmtPrice(parseInt(priceMax))} €` :
    `${fmtPrice(parseInt(priceMin))} — ${fmtPrice(parseInt(priceMax))} €`;

  const priceInputs = (
    <>
      <div className="price-inputs" style={{ marginBottom: 12 }}>
        <input type="number" placeholder="от" min={0} step={500} value={localMin} onChange={e => setLocalMin(e.target.value)} style={{ fontSize: 16 }} />
        <span>—</span>
        <input type="number" placeholder="до" min={0} step={500} value={localMax} onChange={e => setLocalMax(e.target.value)} style={{ fontSize: 16 }} />
      </div>
      <button className="price-dd__apply" onClick={apply}>Приложи</button>
    </>
  );

  return (
    <div className="price-dd-wrap" ref={wrapRef}>
      <div className="srch__f">
        <input
          type="text"
          placeholder="За колко?"
          readOnly
          value={displayText}
          onClick={() => setOpen(prev => !prev)}
        />
      </div>

      {/* Desktop dropdown */}
      {!isMobile && (
        <div className={`price-dd${open ? ' open' : ''}`}>
          <div className="price-dd__title">Цена (€)</div>
          {priceInputs}
        </div>
      )}

      {/* Mobile full-screen sheet */}
      <MobileSheet open={isMobile && open} title="Цена (€)" onClose={() => setOpen(false)}>
        <div style={{ padding: '20px 20px 0' }}>
          {priceInputs}
        </div>
      </MobileSheet>
    </div>
  );
}

