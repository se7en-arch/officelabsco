'use client';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useState, useEffect, useRef } from 'react';

interface Slide {
  title: string;
  subtitle: string;
  bgImage: string;
  href: string;
  btnText: string;
}

const INTERVAL = 7000;
const TRANSITION_MS = 1400;

function SlideContent({ slide, cls }: { slide: Slide; cls: string }) {
  return (
    <div className={`home-hero__slide ${cls}`}>
      <div className="home-hero__bg">
        <Image
          src={slide.bgImage}
          alt={slide.title}
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="100vw"
        />
        <div className="home-hero__overlay" />
      </div>
      <h1 className="home-hero__title">{slide.title}</h1>
      <p className="home-hero__sub">{slide.subtitle}</p>
      <div className="home-pill-wrap">
        <div className="home-pill">
          <Link href={slide.href} className="home-pill__btn">{slide.btnText}</Link>
        </div>
      </div>
    </div>
  );
}

export default function HomeSlider({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [exitingIdx, setExitingIdx] = useState<number | null>(null);
  const pausedRef = useRef(false);
  const transitioningRef = useRef(false);
  const currentRef = useRef(0);

  const goTo = (next: number) => {
    if (transitioningRef.current || next === currentRef.current) return;
    transitioningRef.current = true;
    setExitingIdx(currentRef.current);
    currentRef.current = next;
    setCurrent(next);
    setTimeout(() => {
      setExitingIdx(null);
      transitioningRef.current = false;
    }, TRANSITION_MS);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current || transitioningRef.current) return;
      goTo((currentRef.current + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <main
      className="home-page"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="home-hero">
        {exitingIdx !== null && (
          <SlideContent
            key={`exit-${exitingIdx}`}
            slide={slides[exitingIdx]}
            cls="home-hero__slide--exit"
          />
        )}
        <SlideContent
          key={`enter-${current}`}
          slide={slides[current]}
          cls={exitingIdx !== null ? 'home-hero__slide--enter' : 'home-hero__slide--idle'}
        />

        <div className="slider__dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`slider__dot${i === current ? ' active' : ''}`}
              onClick={() => {
                pausedRef.current = true;
                goTo(i);
                setTimeout(() => { pausedRef.current = false; }, 8000);
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
