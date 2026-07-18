'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Вход или регистрация">
        <button className="auth-modal__close" onClick={onClose} aria-label="Затвори">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="auth-modal__ico">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </div>

        <h2 className="auth-modal__title">Запази тази обява</h2>
        <p className="auth-modal__sub">Влез в профила си или се регистрирай, за да запазваш обяви и да ги намираш по-лесно.</p>

        <div className="auth-modal__actions">
          <Link href="/register" className="auth-modal__btn auth-modal__btn--primary" onClick={onClose}>
            Регистрация
          </Link>
          <Link href="/login" className="auth-modal__btn auth-modal__btn--secondary" onClick={onClose}>
            Вход
          </Link>
        </div>
      </div>
    </div>
  );
}
