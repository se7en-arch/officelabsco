'use client';

import { useState, useId } from 'react';
import SearchBar from '@/components/search/SearchBar';
import s from './HeroSection.module.css';

const STATS = [
  { value: '2 400+', label: 'активни обяви' },
  { value: '24', label: 'квартала в БГ' },
  { value: '4.9 ★', label: 'рейтинг' },
];

export default function HeroSection() {
  const [deal, setDeal] = useState<'rent' | 'buy' | 'developer'>('rent');
  const uid = useId().replace(/:/g, '');

  return (
    <section className={s.hero}>
      {/* ── Map background ── */}
      <div className={s.mapBg} aria-hidden="true">
        <svg
          className={s.mapSvg}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern
              id={`${uid}-grid`}
              x="0" y="0"
              width="160" height="120"
              patternUnits="userSpaceOnUse"
            >
              {/* major road borders */}
              <line x1="0" y1="0.5" x2="160" y2="0.5" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5"/>
              <line x1="0.5" y1="0" x2="0.5" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="2.5"/>
              {/* secondary streets */}
              <line x1="0" y1="40" x2="160" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <line x1="0" y1="80" x2="160" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <line x1="53"  y1="0" x2="53"  y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              <line x1="106" y1="0" x2="106" y2="120" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
              {/* building blocks */}
              <rect x="6"   y="5"  width="38" height="26" fill="rgba(255,255,255,0.055)"  rx="1.5"/>
              <rect x="6"   y="45" width="30" height="24" fill="rgba(255,255,255,0.04)"  rx="1.5"/>
              <rect x="6"   y="86" width="34" height="26" fill="rgba(255,255,255,0.055)"  rx="1.5"/>
              <rect x="58"  y="5"  width="36" height="28" fill="rgba(255,255,255,0.04)"  rx="1.5"/>
              <rect x="58"  y="45" width="28" height="24" fill="rgba(255,255,255,0.055)"  rx="1.5"/>
              <rect x="58"  y="86" width="34" height="24" fill="rgba(255,255,255,0.04)"  rx="1.5"/>
              <rect x="110" y="5"  width="40" height="26" fill="rgba(255,255,255,0.055)"  rx="1.5"/>
              <rect x="110" y="45" width="34" height="24" fill="rgba(255,255,255,0.04)"  rx="1.5"/>
              <rect x="110" y="86" width="38" height="26" fill="rgba(255,255,255,0.055)"  rx="1.5"/>
            </pattern>
          </defs>

          {/* base */}
          <rect width="1440" height="800" fill="#252525"/>
          {/* street grid */}
          <rect width="1440" height="800" fill={`url(#${uid}-grid)`}/>
          {/* diagonal boulevard 1 */}
          <line x1="-80" y1="480" x2="1000" y2="-120" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
          {/* diagonal boulevard 2 */}
          <line x1="500" y1="680" x2="1700" y2="80"  stroke="rgba(255,255,255,0.055)" strokeWidth="3"/>
          {/* ring road */}
          <ellipse cx="720" cy="400" rx="580" ry="280" fill="none" stroke="rgba(255,255,255,0.065)" strokeWidth="3"/>
          {/* subtle warm glow center */}
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="45%">
            <stop offset="0%"   stopColor="#FFA627" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#FFA627" stopOpacity="0"/>
          </radialGradient>
          <rect width="1440" height="800" fill={`url(#${uid}-glow)`}/>
        </svg>
      </div>

      {/* ── Overlay ── */}
      <div className={s.overlay} aria-hidden="true"/>

      {/* ── Content ── */}
      <div className={s.content}>
        {/* deal tabs */}
        <div className={s.dealTabs}>
          <button
            className={`${s.dealTab}${deal === 'rent' ? ` ${s.dealTabActive}` : ''}`}
            onClick={() => setDeal('rent')}
          >
            Под наем
          </button>
          <button
            className={`${s.dealTab}${deal === 'buy' ? ` ${s.dealTabActive}` : ''}`}
            onClick={() => setDeal('buy')}
          >
            Продажба
          </button>
          <button
            className={`${s.dealTab}${deal === 'developer' ? ` ${s.dealTabActive}` : ''}`}
            onClick={() => setDeal('developer')}
          >
            От инвеститор
          </button>
        </div>

        {/* headline */}
        <h1 className={s.headline}>
          Намери своя дом<br />
          <span className={s.accent}>без компромиси</span>
        </h1>
        <p className={s.sub}>
          Хиляди обяви в цяла България —{' '}
          <span className={s.subHighlight}>прозрачно, бързо, справедливо.</span>
        </p>

        {/* search bar */}
        <div className={s.searchWrap}>
          <SearchBar className="srch--hero" />
        </div>

        {/* stats */}
        <div className={s.stats}>
          {STATS.map((st, i) => (
            <div key={st.label} className={s.statGroup}>
              {i > 0 && <div className={s.statDivider}/>}
              <div className={s.stat}>
                <span className={s.statVal}>{st.value}</span>
                <span className={s.statLbl}>{st.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Animated location pins ── */}
      <div className={`${s.pin} ${s.pin1}`} aria-hidden="true"/>
      <div className={`${s.pin} ${s.pin2}`} aria-hidden="true"/>
      <div className={`${s.pin} ${s.pin3}`} aria-hidden="true"/>
    </section>
  );
}
