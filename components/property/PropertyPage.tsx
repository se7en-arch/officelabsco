'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookmarkIcon } from '@/components/icons';
import s from './PropertyPage.module.css';

const GALLERY_IMAGES = [
  { src: '/images/11.jpg', alt: 'Хол' },
  { src: '/images/22.jpg', alt: 'Спалня' },
  { src: '/images/33.jpg', alt: 'Кухня' },
  { src: '/images/44.jpg', alt: 'Баня' },
  { src: '/images/b1.jpg', alt: 'Изглед' },
  { src: '/images/b2.jpg', alt: 'Коридор' },
];

const AMENITIES = [
  { icon: '🏔️', label: 'Планински изглед' },
  { icon: '🍳', label: 'Кухня' },
  { icon: '📶', label: 'Интернет / Wifi' },
  { icon: '🅿️', label: 'Безплатен паркинг' },
  { icon: '🐾', label: 'Домашни любимци' },
  { icon: '🛗', label: 'Асансьор' },
  { icon: '👕', label: 'Пералня в имота' },
  { icon: '❄️', label: 'Климатик' },
  { icon: '🔥', label: 'Централно отопление' },
  { icon: '📺', label: 'Кабелна / спутникова ТВ' },
  { icon: '🔒', label: 'Видеонаблюдение' },
  { icon: '🏊', label: 'Плувен басейн' },
];

const MONTHS_BG = [
  'Януари','Февруари','Март','Април','Май','Юни',
  'Юли','Август','Септември','Октомври','Ноември','Декември',
];
const DAYS_BG = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'];

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const offset = (first === 0 ? 6 : first - 1);
  const days = new Date(year, month + 1, 0).getDate();
  return { offset, days };
}

function fmtDate(d: Date) {
  return d.toLocaleDateString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface ChatMsg { from: 'owner' | 'user'; text: string; }

export default function PropertyPage() {
  const today = new Date();

  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showTour, setShowTour]           = useState(false);
  const [show3D, setShow3D]               = useState(false);
  const [expandDesc, setExpandDesc]       = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [calOpen, setCalOpen]             = useState(false);
  const [calYear, setCalYear]             = useState(today.getFullYear());
  const [calMonth, setCalMonth]           = useState(today.getMonth());
  const [selectedDate, setSelectedDate]   = useState<Date | null>(null);
  const [chatOpen, setChatOpen]           = useState(false);
  const [dealOpen, setDealOpen]           = useState(false);
  const [chatInput, setChatInput]         = useState('');
  const [chatBottom, setChatBottom]       = useState(0);
  const [messages, setMessages]           = useState<ChatMsg[]>([
    { from: 'owner', text: 'Здравейте! Как мога да ви помогна с имота?' },
  ]);

  const amenitiesVisible = showAllAmenities ? AMENITIES : AMENITIES.slice(0, 10);

  const prevMonth = useCallback(() => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }, [calMonth]);

  const nextMonth = useCallback(() => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }, [calMonth]);

  const sendMsg = useCallback(() => {
    const t = chatInput.trim();
    if (!t) return;
    setMessages(ms => [...ms, { from: 'user', text: t }]);
    setChatInput('');
    setTimeout(() => {
      setMessages(ms => [...ms, { from: 'owner', text: 'Благодаря за съобщението! Ще отговоря в рамките на 1 час.' }]);
    }, 900);
  }, [chatInput]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAllPhotos(false); setShowTour(false); setShow3D(false);
        setCalOpen(false); setChatOpen(false); setDealOpen(false);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  // Lift chat above keyboard on mobile
  useEffect(() => {
    const vv = window.visualViewport;
    if (!chatOpen || !vv) { setChatBottom(0); return; }
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setChatBottom(kb);
    };
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      setChatBottom(0);
    };
  }, [chatOpen]);

  useEffect(() => {
    const open = showAllPhotos || showTour || show3D || calOpen || chatOpen || dealOpen;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showAllPhotos, showTour, show3D, calOpen, chatOpen, dealOpen]);

  const { offset, days } = buildCalendar(calYear, calMonth);

  return (
    <div className={s.wrap}>
      {/* Title row */}
      <div className={s.titleRow}>
        <h1 className={s.titleH1}>Двустаен апартамент в центъра, гр. Пловдив</h1>
      </div>

      {/* Gallery */}
      <div className={s.gallery}>
        <div className={s.galleryOverlayBtns}>
          <button className={s.galleryTag} onClick={() => setShow3D(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            3D план
          </button>
          <button className={s.galleryTag} onClick={() => setShowTour(true)}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/>
            </svg>
            Виртуална обиколка
          </button>
        </div>

        <div className={s.galleryMain}>
          <Image src={GALLERY_IMAGES[0].src} alt={GALLERY_IMAGES[0].alt} fill sizes="(max-width:900px) 100vw, 600px" style={{ objectFit: 'cover' }} priority />
        </div>

        <div className={s.galleryGrid}>
          {GALLERY_IMAGES.slice(1, 5).map((img, i) => (
            <button type="button" key={i} className={s.galleryThumb} onClick={() => setShowAllPhotos(true)}>
              <Image src={img.src} alt={img.alt} fill sizes="200px" style={{ objectFit: 'cover' }} />
            </button>
          ))}
        </div>

        <button className={s.showAllBtn} onClick={() => setShowAllPhotos(true)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
          </svg>
          Покажи всички снимки
        </button>
      </div>

      {/* Body */}
      <div className={s.body}>
        {/* ── LEFT ── */}
        <div className={s.left}>

          {/* Stats */}
          <div className={s.statsRow}>
            <div className={s.stat}>
              <span className={s.statLabel}>Площ</span>
              <span className={s.statVal}>82 кв.м</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Етаж</span>
              <span className={s.statVal}>2-ри от 4</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Паркомясто</span>
              <span className={`${s.statVal} ${s.statValYes}`}>ДА</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Газ</span>
              <span className={`${s.statVal} ${s.statValNo}`}>НЕ</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>ТЕЦ</span>
              <span className={`${s.statVal} ${s.statValNo}`}>НЕ</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Обзавеждане</span>
              <span className={`${s.statVal} ${s.statValYes}`}>Пълно</span>
            </div>
            <div className={s.stat}>
              <span className={s.statLabel}>Сметки</span>
              <span className={s.statVal}>Включени</span>
            </div>
          </div>

          {/* Highlights */}
          <div className={s.highlights}>
            <div className={s.highlight}>
              <div className={s.highlightIcon}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
                </svg>
              </div>
              <div className={s.highlightText}>
                <div className={s.highlightTitle}>Самостоятелно настаняване</div>
                <div className={s.highlightSub}>Влезте самостоятелно с ключалката-кутия.</div>
              </div>
            </div>
            <div className={s.highlight}>
              <div className={s.highlightIcon}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={s.highlightText}>
                <div className={s.highlightTitle}>Тишина и спокойствие</div>
                <div className={s.highlightSub}>Имотът се намира в тиха зона.</div>
              </div>
            </div>
            <div className={s.highlight}>
              <div className={s.highlightIcon}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className={s.highlightText}>
                <div className={s.highlightTitle}>Безкомисионна сделка</div>
                <div className={s.highlightSub}>Директно с верифициран собственик, без брокерска такса.</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className={s.descSection}>
            <div className={`${s.descText} ${expandDesc ? s.descTextExpanded : s.descTextCollapsed}`}>
              Панорамен Двустаен апартамент, чисто нов, завършен с най-висок клас материали, напълно обзаведен, на 5-ти етаж с гледка. Цената е без вкл. ДДС. Наем на Месец с ДДС 990 EUR. С включени Интернет, ТВ и Мазе 5 кв.м. към наема.
              <br /><br />
              Намира се в затворен комплекс South End, с 24/7 охрана, две нива подземни гаражи и с големи зелени площи. Мигновен достъп до булеварда, градски транспорт, Мол Парадайс и Метро. Всички Ел. Уреди са висок клас включени, както и Сушилня.
              <br /><br />
              При желание възможност за наемане на Подземно паркомясто Едно или повече в охраняеми подземен паркинг, от 129 EUR с ДДС/месец. Апартаментът разполага с просторна всекидневна, напълно оборудвана кухня, две спални и две бани. Идеален за семейство или двойка.
            </div>
            <button className={s.showMoreBtn} onClick={() => setExpandDesc(v => !v)}>
              {expandDesc ? 'Скрий ▲' : 'Покажи повече ▼'}
            </button>
          </div>

          {/* Amenities */}
          <div className={s.amenitiesSection}>
            <h2 className={s.sectionTitle}>Какво предлага имотът</h2>
            <div className={s.amenitiesGrid}>
              {amenitiesVisible.map((a, i) => (
                <div key={i} className={s.amenity}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  {a.label}
                </div>
              ))}
            </div>
            <button className={s.showAllAmenitiesBtn} onClick={() => setShowAllAmenities(v => !v)}>
              {showAllAmenities
                ? 'Скрий удобствата'
                : `Покажи всички ${AMENITIES.length} удобства`}
            </button>
          </div>

          {/* Owner */}
          <div className={s.ownerSection}>
            <h2 className={s.sectionTitle}>Информация за наемодател / продавач</h2>
            <div className={s.ownerCard}>
              <div className={s.ownerAvatarWrap}>
                <div className={s.ownerAvatar}>ИП</div>
                <div className={s.ownerVerifiedBadge}>
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <div className={s.ownerInfo}>
                <div className={s.ownerName}>Иван Петров</div>
                <div className={s.ownerMeta}>
                  <span className={s.ownerStars}>
                    {'★'.repeat(5)} 4.9 <span>(127 оценки)</span>
                  </span>
                  <span className={s.ownerBadgeVerified}>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round"/><polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Верифициран
                  </span>
                </div>
                <div className={s.ownerStats}>
                  <span className={s.ownerStatItem}>Член от <strong>2021 г.</strong></span>
                  <span className={s.ownerStatItem}>Отговаря в рамките на <strong>1 час</strong></span>
                  <span className={s.ownerStatItem}>Отговорност <strong>98%</strong></span>
                </div>
                <div className={s.ownerBtns}>
                  <button className={s.chatBtn} onClick={() => setChatOpen(true)}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Чат
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── RIGHT — BOOKING WIDGET ── */}
        <div className={s.right}>
          <div className={s.widget}>
            <div className={s.widgetPriceRow}>
              <div className={s.widgetPrice}>
                990 EUR <span>/ месец</span>
              </div>
              <button className={s.widgetBookmarkBtn} onClick={() => {}} aria-label="Запази">
                <BookmarkIcon />
              </button>
            </div>
            <div className={s.widgetRating}>
              <span style={{ color: 'var(--brand)' }}>★</span>
              <strong>4.9</strong>
              <span>· 127 оценки</span>
            </div>

            <button className={s.reserveBtn} onClick={() => setCalOpen(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Резервирай оглед
            </button>

            <button className={s.startDealBtn} onClick={() => setDealOpen(true)}>
              Започни сделка
            </button>

            <p className={s.widgetNote}>Няма да бъдете таксувани сега</p>

            <div className={s.widgetBreakdown}>
              <div className={s.widgetBreakdownRow}>
                <span>990 EUR × 1 месец</span>
                <span>990 EUR</span>
              </div>
              <div className={s.widgetBreakdownRow}>
                <span>Такса платформа</span>
                <span>0 EUR</span>
              </div>
              <div className={s.widgetBreakdownTotal}>
                <span>Общо</span>
                <span>990 EUR</span>
              </div>
            </div>

            <button className={s.reportLink}>Докладвай обявата</button>
          </div>
        </div>
      </div>

      {/* ── ALL PHOTOS MODAL ── */}
      {showAllPhotos && (
        <div className={s.photosModal} onClick={() => setShowAllPhotos(false)} style={{ cursor: 'pointer' }}>
          <button className={s.photosModalClose} onClick={() => setShowAllPhotos(false)}>✕</button>
          <div className={s.photosGrid} onClick={e => e.stopPropagation()}>
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className={s.photosGridItem}>
                <Image src={img.src} alt={img.alt} fill sizes="340px" style={{ objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VIRTUAL TOUR MODAL ── */}
      {(showTour || show3D) && (
        <div className={s.tourModal} onClick={() => { setShowTour(false); setShow3D(false); }} style={{ cursor: 'pointer' }}>
          <button className={s.tourClose} onClick={() => { setShowTour(false); setShow3D(false); }}>✕</button>
          <div className={s.tourBox} onClick={e => e.stopPropagation()}>
            <div className={s.tourIcon}>{show3D ? '📐' : '🔭'}</div>
            <div className={s.tourTitle}>{show3D ? '3D план на имота' : 'Виртуална обиколка'}</div>
            <div className={s.tourSub}>Тази функция ще бъде налична скоро.</div>
          </div>
        </div>
      )}

      {/* ── CALENDAR MODAL ── */}
      {calOpen && (
        <div className={s.calModal} onClick={() => setCalOpen(false)} style={{ cursor: 'pointer' }}>
          <div className={s.calBox} onClick={e => e.stopPropagation()}>
            <div className={s.calTitle}>Резервирай оглед</div>
            <div className={s.calSub}>Изберете удобна дата за преглед на имота.</div>

            <div className={s.calHeader}>
              <button className={s.calNavBtn} onClick={prevMonth}>‹</button>
              <span className={s.calMonthYear}>{MONTHS_BG[calMonth]} {calYear}</span>
              <button className={s.calNavBtn} onClick={nextMonth}>›</button>
            </div>

            <div className={s.calDaysHeader}>
              {DAYS_BG.map(d => <div key={d} className={s.calDayName}>{d}</div>)}
            </div>

            <div className={s.calGrid}>
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`e${i}`} className={s.calDayEmpty} />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const date = new Date(calYear, calMonth, day);
                const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isSelected = selectedDate
                  ? date.toDateString() === selectedDate.toDateString()
                  : false;
                const isToday = date.toDateString() === today.toDateString();
                return (
                  <button
                    key={day}
                    className={`${s.calDay} ${isSelected ? s.calDaySelected : ''} ${isToday && !isSelected ? s.calDayToday : ''}`}
                    disabled={isPast}
                    onClick={() => setSelectedDate(date)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button
              className={s.calConfirmBtn}
              disabled={!selectedDate}
              onClick={() => setCalOpen(false)}
            >
              {selectedDate ? `Потвърди – ${fmtDate(selectedDate)}` : 'Изберете дата'}
            </button>
            <button className={s.calCancelBtn} onClick={() => setCalOpen(false)}>Откажи</button>
          </div>
        </div>
      )}

      {/* ── CHAT MODAL ── */}
      {chatOpen && (
        <div className={s.chatModal} onClick={() => setChatOpen(false)} style={{ cursor: 'pointer', paddingBottom: chatBottom }}>
          <div className={s.chatBox} onClick={e => e.stopPropagation()}>
            <div className={s.chatHeader}>
              <div className={s.chatOwnerAvatar}>ИП</div>
              <div>
                <div className={s.chatOwnerName}>Иван Петров</div>
                <div className={s.chatOnline}><div className={s.chatOnlineDot} />Онлайн</div>
              </div>
              <button className={s.chatCloseBtn} onClick={() => setChatOpen(false)}>✕</button>
            </div>
            <div className={s.chatMessages}>
              {messages.map((m, i) => (
                <div key={i} className={m.from === 'owner' ? s.chatMsgOwner : s.chatMsgUser}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className={s.chatInputRow}>
              <input
                className={s.chatInput}
                placeholder="Напишете съобщение..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMsg()}
              />
              <button className={s.chatSendBtn} onClick={sendMsg}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round"/>
                  <polygon points="22,2 15,22 11,13 2,9"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACTION MODAL ── */}
      {dealOpen && (
        <div className={s.dealModal} onClick={() => setDealOpen(false)} style={{ cursor: 'pointer' }}>
          <div className={s.dealBox} onClick={e => e.stopPropagation()}>
            <div className={s.dealTitle}>Започни сделка</div>
            <div className={s.dealSub}>
              Следвайте стъпките за безопасна и прозрачна сделка директно между вас и собственика.
            </div>
            <div className={s.dealSteps}>
              <div className={s.dealStep}>
                <div className={s.dealStepNum}>1</div>
                <div className={s.dealStepText}>
                  <div className={s.dealStepTitle}>Потвърди условия</div>
                  <div className={s.dealStepSub}>Прегледайте цена, период и условия на наема.</div>
                </div>
              </div>
              <div className={s.dealStep}>
                <div className={s.dealStepNum}>2</div>
                <div className={s.dealStepText}>
                  <div className={s.dealStepTitle}>Оглед на имота</div>
                  <div className={s.dealStepSub}>Резервирайте дата и час за физически преглед.</div>
                </div>
              </div>
              <div className={s.dealStep}>
                <div className={s.dealStepNum}>3</div>
                <div className={s.dealStepText}>
                  <div className={s.dealStepTitle}>Подпиши договор</div>
                  <div className={s.dealStepSub}>Договорът се подписва дигитално чрез платформата.</div>
                </div>
              </div>
              <div className={s.dealStep}>
                <div className={s.dealStepNum}>4</div>
                <div className={s.dealStepText}>
                  <div className={s.dealStepTitle}>Финализирай плащането</div>
                  <div className={s.dealStepSub}>Сигурно плащане чрез FairSpace — без посредници.</div>
                </div>
              </div>
            </div>
            <button className={s.dealStartBtn} onClick={() => setDealOpen(false)}>
              Продължи към стъпка 1
            </button>
            <button className={s.dealCancelBtn} onClick={() => setDealOpen(false)}>Откажи</button>
          </div>
        </div>
      )}
    </div>
  );
}
