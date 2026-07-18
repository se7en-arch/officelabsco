'use client';
import { useState, useEffect } from 'react';

interface Section { id: string; title: string; }

export default function LegalLayout({
  title,
  updated,
  sections,
  children,
}: {
  title: string;
  updated: string;
  sections: Section[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <style>{`
        .legal-hero {
          background: #f5f5f7;
          border-bottom: 1px solid #d2d2d7;
          padding: 52px 40px 40px;
        }
        .legal-hero__inner {
          max-width: 1080px;
          margin: 0 auto;
        }
        .legal-hero h1 {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 700;
          letter-spacing: -.03em;
          color: #1d1d1f;
          line-height: 1.1;
          margin-bottom: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
        }
        .legal-hero__meta {
          font-size: 14px;
          color: #6e6e73;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        }

        /* mobile TOC toggle */
        .legal-toc-toggle {
          display: none;
          width: 100%;
          background: #fff;
          border: none;
          border-bottom: 1px solid #d2d2d7;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          color: #1d1d1f;
          text-align: left;
          cursor: pointer;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .legal-toc-toggle svg { flex-shrink: 0; transition: transform .2s; }
        .legal-toc-toggle.open svg { transform: rotate(180deg); }

        .legal-outer {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 40px 80px;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 64px;
          align-items: start;
        }

        /* sidebar */
        .legal-sidebar {
          position: sticky;
          top: 80px;
          padding-top: 40px;
        }
        .legal-sidebar nav {
          display: flex;
          flex-direction: column;
        }
        .legal-sidebar__label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: #6e6e73;
          margin-bottom: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        }
        .legal-sidebar a {
          font-size: 13px;
          color: #424245;
          text-decoration: none;
          padding: 7px 10px 7px 12px;
          border-left: 2px solid transparent;
          line-height: 1.4;
          transition: color .15s, border-color .15s;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        }
        .legal-sidebar a:hover { color: #1d1d1f; }
        .legal-sidebar a.active {
          color: #0066cc;
          border-left-color: #0066cc;
          font-weight: 500;
        }

        /* content */
        .legal-content {
          padding-top: 40px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;
        }
        .legal-section {
          padding-bottom: 48px;
          margin-bottom: 48px;
          border-bottom: 1px solid #d2d2d7;
        }
        .legal-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .legal-section h2 {
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -.02em;
          color: #1d1d1f;
          margin-bottom: 18px;
          line-height: 1.25;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
        }
        .legal-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #1d1d1f;
          margin: 24px 0 10px;
        }
        .legal-section p {
          font-size: 16px;
          color: #3a3a3c;
          line-height: 1.75;
          margin-bottom: 14px;
        }
        .legal-section p:last-child { margin-bottom: 0; }
        .legal-section ul,
        .legal-section ol {
          font-size: 16px;
          color: #3a3a3c;
          line-height: 1.75;
          padding-left: 22px;
          margin-bottom: 14px;
        }
        .legal-section ul li,
        .legal-section ol li { margin-bottom: 6px; }
        .legal-section a { color: #0066cc; text-decoration: none; }
        .legal-section a:hover { text-decoration: underline; }
        .legal-section strong { color: #1d1d1f; font-weight: 600; }

        .legal-notice {
          background: #f5f5f7;
          border-radius: 10px;
          padding: 18px 22px;
          font-size: 15px;
          color: #3a3a3c;
          line-height: 1.65;
          margin-bottom: 16px;
        }

        @media (max-width: 768px) {
          .legal-hero { padding: 36px 20px 28px; }
          .legal-toc-toggle { display: flex; }
          .legal-outer {
            grid-template-columns: 1fr;
            gap: 0;
            padding: 0 20px 60px;
          }
          .legal-sidebar {
            position: static;
            padding-top: 0;
            border-bottom: 1px solid #d2d2d7;
            margin-bottom: 36px;
            overflow: hidden;
            max-height: 0;
            transition: max-height .3s ease;
          }
          .legal-sidebar.open {
            max-height: 800px;
          }
          .legal-sidebar nav { padding: 12px 0 20px; }
          .legal-content { padding-top: 0; }
        }
      `}</style>

      <div className="legal-hero">
        <div className="legal-hero__inner">
          <h1>{title}</h1>
          <p className="legal-hero__meta">Последно обновяване: {updated}</p>
        </div>
      </div>

      <button
        className={`legal-toc-toggle${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
      >
        Съдържание
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div className="legal-outer">
        <aside className={`legal-sidebar${menuOpen ? ' open' : ''}`}>
          <nav>
            <div className="legal-sidebar__label">Съдържание</div>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={activeId === s.id ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <main className="legal-content">
          {children}
        </main>
      </div>
    </>
  );
}
