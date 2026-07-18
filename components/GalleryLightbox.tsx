'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

function getSpan(idx: number, total: number): 'wide' | 'full' | 'normal' {
  const posInGroup = idx % 5;
  const isLast     = idx === total - 1;
  if (isLast && posInGroup !== 4) return 'full';
  if (posInGroup === 0) return 'wide';
  return 'normal';
}

interface Props {
  images: string[];
  tag:    string;
}

export default function GalleryLightbox({ images, tag }: Props) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev  = useCallback(() => setActive(i => i !== null ? (i - 1 + images.length) % images.length : null), [images.length]);
  const next  = useCallback(() => setActive(i => i !== null ? (i + 1) % images.length : null), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowLeft')   prev();
      if (e.key === 'ArrowRight')  next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = active !== null ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [active]);

  return (
    <>
      {/* ── Grid ── */}
      <div className="gal-grid">
        {images.map((src, idx) => {
          const span  = getSpan(idx, images.length);
          const cls   = span === 'wide' ? 'gal-item gal-item--wide gal-item--btn'
                      : span === 'full' ? 'gal-item gal-item--full gal-item--btn'
                      : 'gal-item gal-item--btn';
          const sizes = span === 'full' ? '(max-width:1280px) 100vw, 1280px'
                      : span === 'wide' ? '(max-width:768px) 100vw, 853px'
                      : '(max-width:768px) 100vw, 420px';
          return (
            <button key={src} className={cls} onClick={() => setActive(idx)} aria-label="Отвори снимка">
              <Image src={src} alt={`${tag} — офис интериор`} fill className="gal-img"
                sizes={sizes} priority={idx < 2} />
            </button>
          );
        })}
      </div>

      {/* ── Lightbox ── */}
      {active !== null && (
        <div className="lb-overlay" onClick={close}>

          {/* Close */}
          <button className="lb-close" onClick={close} aria-label="Затвори">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2 2l16 16M18 2L2 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Counter */}
          <div className="lb-counter">{active + 1} / {images.length}</div>

          {/* Prev */}
          <button className="lb-arrow lb-arrow--prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="Предишна">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Image */}
          <div className="lb-img-wrap" onClick={e => e.stopPropagation()}>
            <Image
              key={images[active]}
              src={images[active]}
              alt={`${tag} — офис интериор`}
              fill
              className="lb-img"
              sizes="100vw"
              priority
            />
          </div>

          {/* Next */}
          <button className="lb-arrow lb-arrow--next" onClick={e => { e.stopPropagation(); next(); }} aria-label="Следваща">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

        </div>
      )}
    </>
  );
}
