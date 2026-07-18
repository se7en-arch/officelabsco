'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

const AUTO_MS = 3000;
const SWIPE_MIN = 40;

export default function ProductGallery({
  image,
  images,
  productName,
}: {
  image: string;
  images?: string[];
  productName: string;
}) {
  const slides = images && images.length > 0 ? images : [image];
  const count = slides.length;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = setInterval(() => setCurrent(c => (c + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || count <= 1) return;

    const onStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      setPaused(true);
    };
    const onMove = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = Math.abs(touchStartX.current - e.touches[0].clientX);
      if (dx > 8) e.preventDefault();
    };
    const onEnd = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const delta = touchStartX.current - e.changedTouches[0].clientX;
      if (delta > SWIPE_MIN) setCurrent(c => (c + 1) % count);
      else if (delta < -SWIPE_MIN) setCurrent(c => (c - 1 + count) % count);
      touchStartX.current = null;
      setPaused(false);
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [count]);

  function prev() { setCurrent(c => (c - 1 + count) % count); setPaused(true); }
  function next() { setCurrent(c => (c + 1) % count); setPaused(true); }

  return (
    <div
      ref={containerRef}
      className="gallery"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="gallery__track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, i) => (
          <div key={i} className="gallery__slide">
            <Image
              src={src}
              alt={`${productName} — снимка ${i + 1}`}
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 900px) 100vw, 50vw"
              priority={i === 0}
            />
            {count > 1 && <span className="gallery__num">{i + 1} / {count}</span>}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button className="gallery__arrow gallery__arrow--prev" onClick={prev} aria-label="Предишна снимка">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="gallery__arrow gallery__arrow--next" onClick={next} aria-label="Следваща снимка">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          <div className="gallery__dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`gallery__dot${i === current ? ' active' : ''}`}
                onClick={() => { setCurrent(i); setPaused(true); }}
                aria-label={`Снимка ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
