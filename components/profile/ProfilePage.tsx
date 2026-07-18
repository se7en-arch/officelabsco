'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, logout, getInitials, updateAvatar, type Session } from '@/lib/auth';
import s from './ProfilePage.module.css';

const MY_LISTINGS = [
  { id: 1, type: 'Двустаен апартамент', city: 'Пловдив', price: 600, status: 'active'   as const, img: '11.jpg',  views: 142, saves: 8 },
  { id: 2, type: 'Тристаен апартамент',  city: 'София',   price: 870, status: 'inactive' as const, img: 'b2.jpg', views: 67,  saves: 3 },
  { id: 3, type: 'Едностаен апартамент', city: 'Варна',   price: 390, status: 'draft'    as const, img: 'v1.jpg', views: 0,   saves: 0 },
];

const SAVED_PROPS = [
  { id: 1, type: 'Двустаен апартамент',  city: 'София',   price: 520, img: 'b1.jpg' },
  { id: 2, type: 'Мезонет',              city: 'Пловдив', price: 870, img: '33.jpg' },
  { id: 3, type: 'Едностаен апартамент', city: 'Варна',   price: 420, img: 'v1.jpg' },
  { id: 4, type: 'Тристаен апартамент',  city: 'Бургас',  price: 760, img: 'v2.jpg' },
];

const DEALS = [
  { id: 1, type: 'Двустаен апартамент',  city: 'Пловдив', price: 600, img: '11.jpg',  status: 'negotiation' as const, partner: 'Иван Петров',    updated: '20.04.2026' },
  { id: 2, type: 'Едностаен апартамент', city: 'София',   price: 390, img: 'b1.jpg',  status: 'signed'      as const, partner: 'Мария Иванова',  updated: '15.04.2026' },
  { id: 3, type: 'Тристаен апартамент',  city: 'Варна',   price: 780, img: 'v4.jpg',  status: 'completed'   as const, partner: 'Петьо Стоянов',  updated: '01.03.2026' },
];

const CHATS = [
  { id: 1, name: 'Иван Петров',    initials: 'ИП', lastMsg: 'Кога можем да уговорим оглед?',     time: '14:32',  unread: 2, prop: 'Двустаен ап., Пловдив' },
  { id: 2, name: 'Мария Иванова',  initials: 'МИ', lastMsg: 'Благодаря за информацията!',        time: 'Вчера',  unread: 0, prop: 'Едностаен ап., София'  },
  { id: 3, name: 'Георги Стоянов', initials: 'ГС', lastMsg: 'Договорът е подписан.',             time: '18.04',  unread: 0, prop: 'Тристаен ап., Варна'   },
  { id: 4, name: 'Петя Георгиева', initials: 'ПГ', lastMsg: 'Имате ли свободни дати за оглед?',  time: '12.04',  unread: 0, prop: 'Двустаен ап., Бургас'  },
];

const REVIEWS = [
  { id: 1, name: 'Иван Петров',    initials: 'ИП', rating: 5, date: '10.04.2026', text: 'Отличен собственик! Имотът беше точно като описанието, без скрити такси. Бърза и ефективна сделка. Препоръчвам!' },
  { id: 2, name: 'Мария Иванова',  initials: 'МИ', rating: 4, date: '15.03.2026', text: 'Много добра комуникация и коректно отношение. Само малки закъснения при отговорите на съобщенията.' },
  { id: 3, name: 'Петя Георгиева', initials: 'ПГ', rating: 5, date: '28.02.2026', text: 'Имотът е в перфектно състояние. Препоръчвам без резерви!' },
];

const STATUS_LABEL = { active: 'Активна', inactive: 'Неактивна', draft: 'Чернова' };
const DEAL_LABEL   = { negotiation: 'Договаряне', signed: 'Подписан', completed: 'Завършен' };
const DEAL_STEPS   = ['Договаряне', 'Документи', 'Подписан'];

type Tab = 'listings' | 'saved' | 'deals' | 'chats' | 'reviews' | 'settings';

/* ── Stars helper ── */
function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className={s.stars}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#FFA627' : '#e5e7eb'} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

/* ── Toggle helper ── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={s.toggle}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className={s.toggleTrack}>
        <span className={s.toggleThumb} />
      </span>
    </label>
  );
}

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const [tab,     setTab]     = useState<Tab>('listings');
  const [session, setSession] = useState<Session | null>(null);
  const [ready,   setReady]   = useState(false);
  const [avatar,  setAvatar]  = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/login'); return; }
    setSession(s);
    setAvatar(s.avatar || null);
    setReady(true);
  }, [router]);

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new window.Image();
      img.onload = () => {
        const SIZE = 200;
        const canvas = document.createElement('canvas');
        const ratio = Math.min(SIZE / img.width, SIZE / img.height);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.82);
        updateAvatar(session.userId, base64);
        setAvatar(base64);
        setSession(prev => prev ? { ...prev, avatar: base64 } : prev);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleLogout() {
    logout();
    router.push('/login');
  }

  if (!ready) return null;

  const totalUnread = CHATS.reduce((a, c) => a + c.unread, 0);
  const activeDeals = DEALS.filter(d => d.status !== 'completed').length;
  const initials    = getInitials(session!.name);

  const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'listings', label: 'Моите обяви',     icon: <HomeIcon />,     badge: MY_LISTINGS.length },
    { id: 'saved',    label: 'Запазени имоти',  icon: <BookmarkIcon /> },
    { id: 'deals',    label: 'Активни сделки',  icon: <DealIcon />,     badge: activeDeals || undefined },
    { id: 'chats',    label: 'История на чата', icon: <ChatIcon />,     badge: totalUnread || undefined },
    { id: 'reviews',  label: 'Отзиви',          icon: <StarIcon /> },
    { id: 'settings', label: 'Настройки',       icon: <SettingsIcon /> },
  ];

  return (
    <div className={s.page}>

      {/* ── SIDEBAR ── */}
      <aside className={s.aside}>
        <div className={s.userCard}>
          <div className={s.avatarWrap}>
            <button className={s.avatarBtn} onClick={handleAvatarClick} title="Смени снимката">
              {avatar ? (
                <img src={avatar} alt="Профилна снимка" className={s.avatarImg} />
              ) : (
                <div className={s.avatar}>{initials}</div>
              )}
              <span className={s.avatarOverlay}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </span>
            </button>
            <span className={s.verifiedDot} title="Верифициран акаунт">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>
          <div className={s.userName}>{session!.name}</div>
          <span className={s.roleBadge}>Собственик</span>
          <div className={s.userStats}>
            <div className={s.stat}><b>{MY_LISTINGS.length}</b><span>Обяви</span></div>
            <div className={s.statDiv} />
            <div className={s.stat}><b>{DEALS.length}</b><span>Сделки</span></div>
            <div className={s.statDiv} />
            <div className={s.stat}><b>4.8★</b><span>Рейтинг</span></div>
          </div>
          <div className={s.memberSince}>{session!.email}</div>
        </div>

        <nav className={s.nav}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`${s.navItem}${tab === t.id ? ` ${s.navItemActive}` : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className={s.navIcon}>{t.icon}</span>
              <span className={s.navLabel}>{t.label}</span>
              {t.badge != null && (
                <span className={`${s.navBadge}${tab === t.id ? ` ${s.navBadgeActive}` : ''}`}>{t.badge}</span>
              )}
            </button>
          ))}
          <button type="button" className={s.navItem} onClick={handleLogout} style={{ marginTop: 8, color: '#ef4444' }}>
            <span className={s.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span className={s.navLabel}>Изход</span>
          </button>
        </nav>
      </aside>

      {/* ── MAIN ── */}
      <div className={s.main}>
        {/* Mobile tab strip */}
        <div className={s.mobileTabStrip}>
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              className={`${s.mobileTab}${tab === t.id ? ` ${s.mobileTabActive}` : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge != null && <span className={s.mobileTabBadge}>{t.badge}</span>}
            </button>
          ))}
        </div>

        {tab === 'listings' && <ListingsTab />}
        {tab === 'saved'    && <SavedTab />}
        {tab === 'deals'    && <DealsTab />}
        {tab === 'chats'    && <ChatsTab />}
        {tab === 'reviews'  && <ReviewsTab />}
        {tab === 'settings' && <SettingsTab name={session!.name} email={session!.email} />}
      </div>
    </div>
  );
}

/* ════════════════════════════════════
   LISTINGS TAB
════════════════════════════════════ */
function ListingsTab() {
  const [listings, setListings] = useState(MY_LISTINGS);

  function remove(id: number) { setListings(p => p.filter(l => l.id !== id)); }
  function toggle(id: number) {
    setListings(p => p.map(l =>
      l.id === id ? { ...l, status: l.status === 'active' ? 'inactive' as const : 'active' as const } : l
    ));
  }

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.sectionTitle}>Моите обяви</h2>
          <p className={s.sectionSub}>{listings.length} обяви общо</p>
        </div>
        <button type="button" className={s.btnPrimary}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Публикувай обява
        </button>
      </div>

      {listings.length === 0 ? (
        <div className={s.empty}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="13" y2="13" />
          </svg>
          <p>Нямате публикувани обяви.</p>
          <button type="button" className={s.btnPrimary}>Публикувай първата си обява</button>
        </div>
      ) : (
        <div className={s.listingsList}>
          {listings.map(l => (
            <div key={l.id} className={s.listingRow}>
              <div className={s.listingImg}>
                <Image src={`/images/${l.img}`} alt={l.type} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className={s.listingInfo}>
                <div className={s.listingTop}>
                  <span className={s.listingType}>{l.type}</span>
                  <span className={`${s.statusBadge} ${s[`status_${l.status}`]}`}>{STATUS_LABEL[l.status]}</span>
                </div>
                <div className={s.listingCity}>{l.city}</div>
                <div className={s.listingMeta}>
                  <span className={s.listingPrice}>{l.price} €<em>/мес</em></span>
                  <span className={s.listingStat}>{l.views} прегледа</span>
                  <span className={s.listingStat}>{l.saves} запазвания</span>
                </div>
              </div>
              <div className={s.listingActions}>
                <button type="button" className={s.btnGhost} onClick={() => toggle(l.id)}>
                  {l.status === 'active' ? 'Деактивирай' : 'Активирай'}
                </button>
                <Link href="/property/1" className={s.btnGhost}>Редактирай</Link>
                <button type="button" className={s.btnDanger} onClick={() => remove(l.id)}>Изтрий</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════
   SAVED TAB
════════════════════════════════════ */
function SavedTab() {
  const [saved, setSaved] = useState(SAVED_PROPS);

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.sectionTitle}>Запазени имоти</h2>
          <p className={s.sectionSub}>{saved.length} имота</p>
        </div>
        <Link href="/search" className={s.btnGhost}>Разгледай още</Link>
      </div>

      {saved.length === 0 ? (
        <div className={s.empty}>
          <p>Нямате запазени имоти.</p>
          <Link href="/search" className={s.btnPrimary}>Разгледай обяви</Link>
        </div>
      ) : (
        <div className={s.savedGrid}>
          {saved.map((p, i) => (
            <div key={p.id} className={s.savedCard}>
              <Link href="/property/1" style={{ display: 'contents' }}>
                <div className={s.savedImg}>
                  <Image src={`/images/${p.img}`} alt={p.type} fill style={{ objectFit: 'cover' }} />
                </div>
                <div className={s.savedBody}>
                  <div className={s.savedType}>{p.type}</div>
                  <div className={s.savedCity}>{p.city}</div>
                  <div className={s.savedPrice}>{p.price} €</div>
                </div>
              </Link>
              <button
                type="button"
                className={s.savedRemove}
                onClick={() => setSaved(prev => prev.filter((_, j) => j !== i))}
                title="Премахни"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ════════════════════════════════════
   DEALS TAB
════════════════════════════════════ */
function DealsTab() {
  const stepOf = (status: typeof DEALS[0]['status']) =>
    status === 'negotiation' ? 0 : status === 'signed' ? 2 : 3;

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.sectionTitle}>Активни сделки</h2>
          <p className={s.sectionSub}>
            {DEALS.filter(d => d.status !== 'completed').length} активни · {DEALS.length} общо
          </p>
        </div>
      </div>

      <div className={s.dealsList}>
        {DEALS.map(deal => (
          <div key={deal.id} className={s.dealCard}>
            <div className={s.dealImg}>
              <Image src={`/images/${deal.img}`} alt={deal.type} fill style={{ objectFit: 'cover' }} />
            </div>
            <div className={s.dealInfo}>
              <div className={s.dealTop}>
                <span className={s.dealType}>{deal.type} · {deal.city}</span>
                <span className={`${s.dealStatus} ${s[`deal_${deal.status}`]}`}>{DEAL_LABEL[deal.status]}</span>
              </div>
              <div className={s.dealMeta}>
                {deal.price} €/мес · с {deal.partner} · {deal.updated}
              </div>
              <div className={s.dealTimeline}>
                {DEAL_STEPS.map((step, i) => {
                  const done = i <= stepOf(deal.status);
                  return (
                    <div key={step} className={s.dealStep}>
                      <div className={`${s.dealDot}${done ? ` ${s.dealDotDone}` : ''}`} />
                      {i < DEAL_STEPS.length - 1 && (
                        <div className={`${s.dealLine}${i < stepOf(deal.status) ? ` ${s.dealLineDone}` : ''}`} />
                      )}
                      <span className={`${s.dealStepLabel}${done ? ` ${s.dealStepLabelDone}` : ''}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className={s.dealActions}>
              <Link href="/property/1" className={s.btnGhost}>Виж имота</Link>
              {deal.status !== 'completed' && (
                <button type="button" className={s.btnPrimary}>Чат</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════
   CHATS TAB
════════════════════════════════════ */
function ChatsTab() {
  const [activeChat, setActiveChat] = useState<number | null>(null);

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.sectionTitle}>История на чата</h2>
          <p className={s.sectionSub}>{CHATS.length} разговора</p>
        </div>
      </div>

      <div className={s.chatList}>
        {CHATS.map(chat => (
          <button
            key={chat.id}
            type="button"
            className={`${s.chatRow}${activeChat === chat.id ? ` ${s.chatRowActive}` : ''}`}
            onClick={() => setActiveChat(chat.id === activeChat ? null : chat.id)}
          >
            <div className={s.chatAvatar}>{chat.initials}</div>
            <div className={s.chatBody}>
              <div className={s.chatMeta}>
                <span className={s.chatName}>{chat.name}</span>
                <span className={s.chatTime}>{chat.time}</span>
              </div>
              <div className={s.chatProp}>{chat.prop}</div>
              <div className={`${s.chatMsg}${chat.unread > 0 ? ` ${s.chatMsgUnread}` : ''}`}>
                {chat.lastMsg}
              </div>
            </div>
            {chat.unread > 0 && <span className={s.chatBadge}>{chat.unread}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════
   REVIEWS TAB
════════════════════════════════════ */
function ReviewsTab() {
  const breakdown = [
    { stars: 5, count: 18 },
    { stars: 4, count: 4 },
    { stars: 3, count: 2 },
    { stars: 2, count: 0 },
    { stars: 1, count: 0 },
  ];
  const total = breakdown.reduce((a, b) => a + b.count, 0);

  return (
    <section className={s.section}>
      <div className={s.sectionHead}>
        <div>
          <h2 className={s.sectionTitle}>Отзиви</h2>
          <p className={s.sectionSub}>{total} отзива</p>
        </div>
      </div>

      <div className={s.ratingCard}>
        <div className={s.ratingBig}>
          <span className={s.ratingNum}>4.8</span>
          <Stars rating={4.8} size={18} />
          <span className={s.ratingTotal}>{total} отзива</span>
        </div>
        <div className={s.ratingBreakdown}>
          {breakdown.map(b => (
            <div key={b.stars} className={s.ratingRow}>
              <span className={s.ratingRowLabel}>{b.stars}★</span>
              <div className={s.ratingBar}>
                <div className={s.ratingFill} style={{ width: `${total ? (b.count / total) * 100 : 0}%` }} />
              </div>
              <span className={s.ratingRowCount}>{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={s.reviewsList}>
        {REVIEWS.map(r => (
          <div key={r.id} className={s.reviewCard}>
            <div className={s.reviewHead}>
              <div className={s.reviewAvatar}>{r.initials}</div>
              <div className={s.reviewMeta}>
                <span className={s.reviewName}>{r.name}</span>
                <span className={s.reviewDate}>{r.date}</span>
              </div>
              <Stars rating={r.rating} />
            </div>
            <p className={s.reviewText}>{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════
   SETTINGS TAB
════════════════════════════════════ */
function SettingsTab({ name, email: initEmail }: { name: string; email: string }) {
  const nameParts = name.split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName,  setLastName]  = useState(nameParts.slice(1).join(' ') || '');
  const [email,     setEmail]     = useState(initEmail);
  const [phone,     setPhone]     = useState('+359 88 123 4567');

  const [notifEmail,   setNotifEmail]   = useState(true);
  const [notifPush,    setNotifPush]    = useState(true);
  const [notifSms,     setNotifSms]     = useState(false);
  const [notifNewMsg,  setNotifNewMsg]  = useState(true);
  const [notifDeal,    setNotifDeal]    = useState(true);

  const notifs = [
    { label: 'Имейл известия',        desc: 'Получавай важни известия на имейл',              val: notifEmail,  set: setNotifEmail  },
    { label: 'Push известия',         desc: 'Известия в браузъра при ново съобщение',         val: notifPush,   set: setNotifPush   },
    { label: 'SMS известия',          desc: 'Кратко съобщение при важни промени',             val: notifSms,    set: setNotifSms    },
    { label: 'Нови съобщения',        desc: 'Когато получиш ново чат съобщение',              val: notifNewMsg, set: setNotifNewMsg },
    { label: 'Обновления на сделки',  desc: 'Промяна в статуса на активна сделка',           val: notifDeal,   set: setNotifDeal   },
  ];

  return (
    <section className={s.section}>
      <h2 className={s.sectionTitle} style={{ marginBottom: 24 }}>Настройки</h2>

      {/* Personal data */}
      <div className={s.settingsCard}>
        <div className={s.settingsCardHead}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>Лични данни</span>
        </div>
        <div className={s.settingsFields}>
          <div className={s.fieldRow}>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Име</label>
              <input className={s.fieldInput} value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Фамилия</label>
              <input className={s.fieldInput} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Имейл адрес</label>
            <input className={s.fieldInput} type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Телефонен номер</label>
            <input className={s.fieldInput} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className={s.fieldActions}>
            <button type="button" className={s.btnPrimary}>Запази промените</button>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className={s.settingsCard}>
        <div className={s.settingsCardHead}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>Промяна на парола</span>
        </div>
        <div className={s.settingsFields}>
          <div className={s.fieldGroup}>
            <label className={s.fieldLabel}>Текуща парола</label>
            <input className={s.fieldInput} type="password" placeholder="••••••••" />
          </div>
          <div className={s.fieldRow}>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Нова парола</label>
              <input className={s.fieldInput} type="password" placeholder="••••••••" />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.fieldLabel}>Потвърди паролата</label>
              <input className={s.fieldInput} type="password" placeholder="••••••••" />
            </div>
          </div>
          <div className={s.fieldActions}>
            <button type="button" className={s.btnPrimary}>Промени паролата</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={s.settingsCard}>
        <div className={s.settingsCardHead}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span>Известия</span>
        </div>
        <div className={s.toggleList}>
          {notifs.map(item => (
            <div key={item.label} className={s.toggleRow}>
              <div className={s.toggleInfo}>
                <span className={s.toggleLabel}>{item.label}</span>
                <span className={s.toggleDesc}>{item.desc}</span>
              </div>
              <Toggle checked={item.val} onChange={item.set} />
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      <div className={s.settingsCard}>
        <div className={s.settingsCardHead}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <span>Абонамент и плащания</span>
        </div>
        <div className={s.planRow}>
          <div>
            <div className={s.planBadge}>Безплатен план</div>
            <div className={s.planDesc}>До 3 активни обяви · без приоритетно позициониране</div>
          </div>
          <button type="button" className={s.btnPrimary}>Надгради до Premium</button>
        </div>
        <div className={s.payHistoryHead}>История на плащанията</div>
        <div className={s.payEmpty}>Все още няма платежни транзакции.</div>
      </div>

      {/* Danger zone */}
      <div className={`${s.settingsCard} ${s.dangerCard}`}>
        <div className={s.settingsCardHead}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ color: '#ef4444' }}>Опасна зона</span>
        </div>
        <div className={s.dangerRow}>
          <div>
            <div className={s.dangerLabel}>Изтриване на акаунт</div>
            <div className={s.dangerDesc}>Всички данни, обяви и история ще бъдат изтрити завинаги.</div>
          </div>
          <button type="button" className={s.btnDangerOutline}>Изтрий акаунта</button>
        </div>
      </div>
    </section>
  );
}

/* ── Icon components ── */
function HomeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function BookmarkIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}
function DealIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function StarIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}
function SettingsIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
}
