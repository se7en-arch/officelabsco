'use client';
import { useState, useEffect, useRef } from 'react';

interface Section { id: string; title: string; }

export default function LegalLayout({
  title,
  updated,
  icon,
  sections,
  children,
}: {
  title: string;
  updated: string;
  icon?: React.ReactNode;
  sections: Section[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-8% 0px -82% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  return (
    <>
      <style>{`
        :root {
          --accent:     oklch(0.705 0.213 47.604);
          --accent-dim: oklch(0.62 0.18 47.604);
          --accent-bg:  oklch(0.705 0.213 47.604 / 0.08);
          --txt:        #1d1d1f;
          --txt2:       #3a3a3c;
          --txt3:       #6e6e73;
          --border:     #d2d2d7;
          --bg-hero:    #f5f5f7;
          --bg-page:    #fff;
          --sidebar-w:  260px;
        }

        html { scroll-behavior: smooth; }

        /* ── HERO ──────────────────────────────────────── */
        .lgl-hero {
          background: var(--bg-hero);
          padding: 64px 52px 52px;
          border-bottom: 1px solid var(--border);
        }
        .lgl-hero__in {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .lgl-hero__icon {
          width: 64px;
          height: 64px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-bg);
          border-radius: 18px;
          color: var(--accent);
          transition: transform .3s ease;
        }
        .lgl-hero__icon:hover { transform: scale(1.05) rotate(-3deg); }
        .lgl-hero h1 {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: clamp(1.9rem, 3.5vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -.04em;
          color: var(--txt);
          line-height: 1.08;
          margin-bottom: 8px;
        }
        .lgl-hero__meta {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 13px;
          color: var(--txt3);
          letter-spacing: .01em;
        }


        /* ── OUTER GRID ───────────────────────────────── */
        .lgl-outer {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 52px 96px;
          display: grid;
          grid-template-columns: var(--sidebar-w) 1fr;
          gap: 80px;
          align-items: start;
        }

        /* ── SIDEBAR ──────────────────────────────────── */
        .lgl-sidebar {
          position: sticky;
          top: 24px;
          padding-top: 44px;
          transition: top .2s ease;
        }
        .lgl-sidebar__label {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--txt3);
          margin-bottom: 12px;
          padding-left: 14px;
        }
        .lgl-sidebar nav {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .lgl-sidebar a {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 13px;
          line-height: 1.45;
          color: var(--txt2);
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 6px;
          position: relative;
          transition: color .18s ease, background .18s ease;
          display: block;
        }
        .lgl-sidebar a::before {
          content: '';
          position: absolute;
          left: 0; top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 2.5px;
          height: 60%;
          background: var(--accent);
          border-radius: 2px;
          transition: transform .2s ease, opacity .2s ease;
          opacity: 0;
        }
        .lgl-sidebar a:hover {
          color: var(--txt);
          background: var(--bg-hero);
        }
        .lgl-sidebar a.active {
          color: var(--accent);
          font-weight: 500;
          background: var(--accent-bg);
        }
        .lgl-sidebar a.active::before {
          transform: translateY(-50%) scaleY(1);
          opacity: 1;
        }

        /* ── CONTENT ──────────────────────────────────── */
        .lgl-content {
          padding-top: 44px;
          min-width: 0;
        }

        .lgl-section {
          padding-bottom: 52px;
          margin-bottom: 52px;
          border-bottom: 1px solid var(--border);
          scroll-margin-top: 80px;
        }
        .lgl-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .lgl-section h2 {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -.025em;
          color: var(--txt);
          margin-bottom: 20px;
          line-height: 1.2;
        }
        .lgl-section h3 {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: .95rem;
          font-weight: 600;
          color: var(--txt);
          margin: 26px 0 10px;
        }
        .lgl-section p {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 16px;
          color: var(--txt2);
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .lgl-section p:last-child { margin-bottom: 0; }
        .lgl-section ul,
        .lgl-section ol {
          font-family: var(--font-inter), system-ui, sans-serif;
          font-size: 16px;
          color: var(--txt2);
          line-height: 1.8;
          padding-left: 20px;
          margin-bottom: 14px;
        }
        .lgl-section li { margin-bottom: 6px; }
        .lgl-section li:last-child { margin-bottom: 0; }
        .lgl-section a {
          color: var(--accent);
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: border-color .15s ease, color .15s ease;
        }
        .lgl-section a:hover {
          color: var(--accent-dim);
          border-bottom-color: var(--accent-dim);
        }
        .lgl-section strong { color: var(--txt); font-weight: 600; }
        .lgl-section code {
          font-family: ui-monospace, 'SF Mono', Menlo, monospace;
          font-size: .875em;
          background: var(--bg-hero);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--txt2);
        }

        .lgl-notice {
          background: var(--accent-bg);
          border-left: 3px solid var(--accent);
          border-radius: 0 8px 8px 0;
          padding: 16px 20px;
          font-size: 15px;
          color: var(--txt2);
          line-height: 1.7;
          margin-bottom: 20px;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .lgl-notice strong { color: var(--txt); }

        /* ── RESPONSIVE ──────────────────────────────── */
        @media (max-width: 860px) {
          .lgl-hero { padding: 40px 24px 36px; }
          .lgl-hero__in { flex-direction: column; align-items: flex-start; gap: 20px; }
          .lgl-outer {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 24px 64px;
          }
          .lgl-sidebar {
            position: static;
            padding-top: 0;
            border-bottom: 1px solid var(--border);
            margin-bottom: 32px;
          }
          .lgl-sidebar nav { padding: 16px 0 20px; }
          .lgl-sidebar__label { padding-left: 4px; }
          .lgl-content { padding-top: 0; }
          .lgl-section { scroll-margin-top: 80px; }
        }

        @media (max-width: 480px) {
          .lgl-hero h1 { font-size: 1.7rem; }
          .lgl-section h2 { font-size: 1.2rem; }
          .lgl-section p,
          .lgl-section ul,
          .lgl-section ol { font-size: 15px; }
        }
      `}</style>

      {/* HERO */}
      <div className="lgl-hero">
        <div className="lgl-hero__in">
          {icon && <div className="lgl-hero__icon">{icon}</div>}
          <div>
            <h1>{title}</h1>
            <p className="lgl-hero__meta">Последно обновяване: {updated}</p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="lgl-outer">
        <aside className="lgl-sidebar">
          <div className="lgl-sidebar__label">Съдържание</div>
          <nav>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={activeId === s.id ? 'active' : ''}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="lgl-content">
          {children}
        </main>
      </div>
    </>
  );
}
