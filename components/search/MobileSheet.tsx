'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import s from './MobileSheet.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MobileSheet({ open, title, onClose, children }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div className={s.overlay}>
      <div className={s.head}>
        <span className={s.ttl}>{title}</span>
        <button className={s.cls} onClick={onClose} aria-label="Затвори">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className={s.body}>{children}</div>
    </div>,
    document.body
  );
}
