'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logout, getInitials, type Session } from '@/lib/auth';
import {
  UserIcon, UserPlusIcon, LoginIcon, LogoutIcon,
  InfoCircleIcon, CrownIcon, PlusCircleIcon,
} from '@/components/icons';

export default function NavMenu() {
  const router       = useRouter();
  const [open, setOpen]       = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef       = useRef<HTMLButtonElement>(null);

  useEffect(() => { setSession(getSession()); }, []);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
    }
    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  function handleLogout() {
    logout();
    setSession(null);
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  const initials = session ? getInitials(session.name) : null;

  return (
    <div className="nav-act" ref={containerRef}>

      {/* ── "Публикувай +" pill button ── */}
      <Link href="/publish" className="btn-publish-pill">
        Публикувай <span className="btn-publish-plus">+</span>
      </Link>

      {/* ── Avatar / burger button ── */}
      <button
        ref={btnRef}
        className={`menu-pill${session ? ' menu-pill--avatar' : ''}`}
        aria-label="Меню"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={e => { e.stopPropagation(); setOpen(prev => !prev); }}
      >
        {session ? (
          <span className="nav-avatar">
            {session.avatar ? (
              <img src={session.avatar} alt="" className="nav-avatar__img" />
            ) : (
              <span className="nav-avatar__initials">{initials}</span>
            )}
          </span>
        ) : (
          <div className="pill-lines">
            <span /><span /><span />
          </div>
        )}
      </button>

      {/* ── Dropdown ── */}
      <div className={`dropdown${open ? ' open' : ''}`} role="menu">
        {session ? (
          <>
            {/* Profile header */}
            <div className="dd-profile-head">
              {session.avatar ? (
                <img src={session.avatar} alt="" className="dd-profile-avatar dd-profile-avatar--img" />
              ) : (
                <span className="dd-profile-avatar">{initials}</span>
              )}
              <div>
                <div className="dd-profile-name">{session.name}</div>
                <div className="dd-profile-email">{session.email}</div>
              </div>
            </div>

            <Link href="/profile" className="dd-item" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><UserIcon /></span>
              Моят профил
            </Link>
            <Link href="/publish" className="dd-item" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><PlusCircleIcon /></span>
              Публикувай обява
            </Link>
            <Link href="/pro" className="dd-item" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><CrownIcon /></span>
              Про план
              <span className="dd-pro-badge">⚡ PRO</span>
            </Link>

            <hr className="dd-sep" />

            <Link href="#" className="dd-item" role="menuitem">
              <span className="dd-item__icon"><InfoCircleIcon /></span>
              Помощен център
            </Link>
            <button className="dd-item dd-item--logout" role="menuitem" onClick={handleLogout}>
              <span className="dd-item__icon"><LogoutIcon /></span>
              Изход
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="dd-item dd-item--bold" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><UserPlusIcon /></span>
              Регистрация
            </Link>
            <Link href="/login" className="dd-item" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><LoginIcon /></span>
              Вход
            </Link>

            <hr className="dd-sep" />

            <Link href="/publish" className="dd-item" role="menuitem" onClick={() => setOpen(false)}>
              <span className="dd-item__icon"><PlusCircleIcon /></span>
              Публикувай имот
            </Link>
            <Link href="#" className="dd-item" role="menuitem">
              <span className="dd-item__icon"><InfoCircleIcon /></span>
              Помощен център
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

