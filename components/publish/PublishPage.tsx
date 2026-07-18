'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROP_TYPES, BG_CITIES } from '@/lib/data';
import { addListing } from '@/lib/listings';
import s from './PublishPage.module.css';

/* ── Static options ── */
const DEAL_SEGS = [
  { value: 'Под наем',      label: 'Под наем'   },
  { value: 'Продажба',      label: 'Продажба'   },
  { value: 'От инвеститор', label: 'Инвеститор' },
];
const FURNISHING_SEGS = [
  { value: 'Без обзавеждане',    label: 'Без'      },
  { value: 'Частично обзаведен', label: 'Частично' },
  { value: 'Напълно обзаведен',  label: 'Напълно'  },
];
const PARKING_SEGS = [
  { value: 'none', label: 'Без'   },
  { value: 'one',  label: '1 бр.' },
  { value: 'two',  label: '2+'    },
];
const CONSTRUCTION = ['Тухла', 'Панел', 'ЕПК', 'Гредоред', 'Стоманобетон'];
const AMENITY_GROUPS = [
  {
    label: 'Отопление и климатизация',
    items: ['Климатик', 'Централно отопление', 'Подово отопление', 'Газово отопление', 'Камина', 'Конвектори', 'Топлинна помпа', 'Котел'],
  },
  {
    label: 'Тераси и зелени площи',
    items: ['Тераса / Балкон', 'Веранда', 'Двор', 'Градина', 'Покривна тераса', 'Зимна градина'],
  },
  {
    label: 'Допълнителни пространства',
    items: ['Мазе / Склад', 'Тавански склад', 'Килер', 'Перално помещение', 'Гараж', 'Подземен паркинг'],
  },
  {
    label: 'Сигурност',
    items: ['Домофон', 'Видеодомофон', 'Алармена система', 'Видеонаблюдение', 'Охрана 24/7', 'Метална врата', 'Решетки на прозорци', 'Сейф'],
  },
  {
    label: 'Спорт и релакс',
    items: ['Басейн', 'Фитнес зала', 'Сауна', 'СПА', 'Джакузи', 'Тенис корт', 'Детска площадка', 'Зона за барбекю'],
  },
  {
    label: 'Бяла техника и уреди',
    items: ['Перална машина', 'Съдомиялна машина', 'Хладилник', 'Готварска печка / Фурна', 'Микровълнова', 'Аспиратор', 'Сушилня'],
  },
  {
    label: 'Свързаност',
    items: ['Интернет / Оптика', 'Кабелна ТВ', 'Сателитна ТВ', 'Smart Home система'],
  },
  {
    label: 'Сграда и локация',
    items: ['Асансьор', 'Нова сграда', 'Реновирана сграда', 'Луксозна сграда', 'Панорамна гледка', 'Морска гледка', 'Планинска гледка', 'До метро', 'До автобусна спирка', 'До транспорт', 'Велоалея'],
  },
];

export default function PublishPage() {
  const router = useRouter();

  const [title,        setTitle]        = useState('');
  const [desc,         setDesc]         = useState('');
  const [propType,     setPropType]     = useState('');
  const [dealType,     setDealType]     = useState('');
  const [area,         setArea]         = useState('');
  const [rooms,        setRooms]        = useState('');
  const [floor,        setFloor]        = useState('');
  const [totalFloors,  setTotalFloors]  = useState('');
  const [furnishing,   setFurnishing]   = useState('');
  const [construction, setConstruction] = useState('');
  const [yearBuilt,    setYearBuilt]    = useState('');
  const [parking,      setParking]      = useState('none');
  const [amenities,    setAmenities]    = useState<string[]>([]);
  const [images,       setImages]       = useState<string[]>([]);
  const [mainIndex,    setMainIndex]    = useState(0);
  const [dragOver,     setDragOver]     = useState(false);
  const [dragThumb,    setDragThumb]    = useState<number | null>(null);
  const [dragOverThumb,setDragOverThumb]= useState<number | null>(null);
  const [city,         setCity]         = useState('');
  const [district,     setDistrict]     = useState('');
  const [address,      setAddress]      = useState('');
  const [price,        setPrice]        = useState('');
  const [deposit,      setDeposit]      = useState('');
  const [modalErrors,  setModalErrors]  = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function toggleAmenity(a: string) {
    setAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) setImages(prev => [...prev, e.target!.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(i: number) {
    setImages(p => p.filter((_, j) => j !== i));
    setMainIndex(prev => i < prev ? prev - 1 : i === prev ? Math.max(0, prev - 1) : prev);
  }

  function onThumbDrop(targetIndex: number) {
    if (dragThumb === null || dragThumb === targetIndex) {
      setDragThumb(null); setDragOverThumb(null); return;
    }
    const from = dragThumb;
    setImages(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
    setMainIndex(prev => {
      if (prev === from) return targetIndex;
      if (from < prev && targetIndex >= prev) return prev - 1;
      if (from > prev && targetIndex <= prev) return prev + 1;
      return prev;
    });
    setDragThumb(null); setDragOverThumb(null);
  }

  function replaceImage(i: number, files: FileList | null) {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result)
        setImages(p => p.map((img, j) => j === i ? e.target!.result as string : img));
    };
    reader.readAsDataURL(files[0]);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (images.length === 0)   errors.push('Добави поне 1 снимка на имота');
    if (!title.trim())         errors.push('Въведи заглавие на обявата');
    if (!desc.trim())          errors.push('Въведи подробно описание');
    if (!propType)             errors.push('Избери вид имот');
    if (!dealType)             errors.push('Избери вид сделка');
    if (!area)                 errors.push('Въведи квадратура');
    if (!rooms)                errors.push('Въведи брой стаи');
    if (!floor)                errors.push('Въведи етаж');
    if (!totalFloors)          errors.push('Въведи общ брой етажи');
    if (!yearBuilt)            errors.push('Въведи година на строеж');
    if (!furnishing)           errors.push('Избери обзавеждане');
    if (!construction)         errors.push('Избери конструкция');
    if (!city)                 errors.push('Избери град');
    if (!district.trim())      errors.push('Въведи квартал / район');
    if (!price)                errors.push('Въведи цена');
    if (!deposit)              errors.push('Въведи депозит');
    return errors;
  }

  function publish() {
    const errors = validate();
    if (errors.length > 0) {
      setModalErrors(errors);
      return;
    }
    const cardDesc = title || `${propType}${district ? ` в ${district}` : ''}, ${city}`;
    addListing({ type: propType, desc: cardDesc, price: Number(price), img: images[mainIndex] || '', city, district, dealType, area, rooms });
    router.push('/search');
  }

  return (
    <div className={s.page}>

      {/* ── Back nav ── */}
      <div className={s.topNav}>
        <Link href="/profile" className={s.backBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Обратно към профила
        </Link>
      </div>

      {/* ── Page header ── */}
      <div className={s.pageHeader}>
        <h1 className={s.pageTitle}>Публикувай обява</h1>
        <p className={s.pageSub}>Попълни всички детайли за твоя имот</p>
      </div>

      {/* ── Single column sections ── */}
      <div className={s.sections}>

        {/* ── Images ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Снимки на имота</div>
              <div className={s.cardDesc}>Препоръчително минимум 5 снимки</div>
            </div>
          </div>

          <div
            className={`${s.uploadZone}${dragOver ? ` ${s.uploadZoneDrag}` : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          >
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
            <div className={s.uploadIcon}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <span className={s.uploadText}><span className={s.uploadLink}>Качи снимки</span> или провлачи тук</span>
            <span className={s.uploadHint}>PNG, JPG до 10 MB</span>
          </div>

          {images.length > 0 && (
            <>
              <div className={s.thumbGrid}>
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`${s.thumb}${dragThumb === i ? ` ${s.thumbDragging}` : ''}${dragOverThumb === i && dragThumb !== i ? ` ${s.thumbDragOver}` : ''}`}
                    draggable
                    onDragStart={() => setDragThumb(i)}
                    onDragEnter={e => { e.preventDefault(); setDragOverThumb(i); }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onThumbDrop(i)}
                    onDragEnd={() => { setDragThumb(null); setDragOverThumb(null); }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Снимка ${i + 1}`} className={s.thumbImg} />
                    <div className={s.thumbDragHandle}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                        <circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/>
                        <circle cx="2.5" cy="5" r="1.2"/><circle cx="7.5" cy="5" r="1.2"/>
                        <circle cx="2.5" cy="8" r="1.2"/><circle cx="7.5" cy="8" r="1.2"/>
                      </svg>
                    </div>
                    <div className={s.thumbOverlay}>
                      {i !== mainIndex && (
                        <button type="button" className={s.thumbBtnMain} onClick={e => { e.stopPropagation(); setMainIndex(i); }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          Основна
                        </button>
                      )}
                      <label className={s.thumbBtn}>
                        Смени
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => replaceImage(i, e.target.files)} />
                      </label>
                      <button type="button" className={s.thumbBtnDanger} onClick={() => removeImage(i)}>Изтрий</button>
                    </div>
                    {i === mainIndex && (
                      <span className={s.thumbMain}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        Основна
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className={s.thumbHint}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/>
                  <line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/>
                </svg>
                Провлачи за да наредиш · Натисни ★ за основна снимка
              </p>
            </>
          )}
        </div>

        {/* ── Description ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Описание</div>
              <div className={s.cardDesc}>Заглавие и подробно описание на имота</div>
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Заглавие на обявата</label>
            <input className={s.input} type="text" placeholder="напр. Луксозен двустаен апартамент в центъра" value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className={s.fieldGroup}>
            <div className={s.labelRow}>
              <label className={s.label}>Подробно описание</label>
              <span className={s.labelMeta}>{desc.length} / 2000</span>
            </div>
            <div className={s.richEditor}>
              <div className={s.toolbar}>
                {['B', 'I', 'U'].map(f => (
                  <button key={f} type="button" className={s.toolBtn} style={{ fontWeight: f === 'B' ? 700 : 400, fontStyle: f === 'I' ? 'italic' : 'normal', textDecoration: f === 'U' ? 'underline' : 'none' }}>
                    {f}
                  </button>
                ))}
                <div className={s.toolSep} />
                <button type="button" className={s.toolBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </button>
                <button type="button" className={s.toolBtn}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
              <textarea className={s.textarea} placeholder="Опишете имота подробно — локация, обзавеждане, транспорт, предимства..." value={desc} onChange={e => setDesc(e.target.value.slice(0, 2000))} rows={6} />
            </div>
          </div>
        </div>

        {/* ── Category ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Категория</div>
              <div className={s.cardDesc}>Вид имот и тип сделка</div>
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Вид имот <span className={s.req}>*</span></label>
            <div className={s.selectWrap}>
              <select className={s.select} value={propType} onChange={e => setPropType(e.target.value)}>
                <option value="">Избери вид имот</option>
                {PROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronIcon />
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Вид сделка</label>
            <div className={s.segmented}>
              {DEAL_SEGS.map(seg => (
                <button
                  key={seg.value}
                  type="button"
                  className={`${s.segmentedBtn}${dealType === seg.value ? ` ${s.segmentedActive}` : ''}`}
                  onClick={() => setDealType(dealType === seg.value ? '' : seg.value)}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Property details ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Детайли на имота</div>
              <div className={s.cardDesc}>Площ, стаи, етаж и характеристики</div>
            </div>
          </div>

          <div className={s.detailsGrid}>
            <div className={s.fieldGroup}>
              <label className={s.label}>Квадратура</label>
              <div className={s.inputSuffix}>
                <input className={s.input} type="number" placeholder="0" value={area} onChange={e => setArea(e.target.value)} />
                <span className={s.suffix}>м²</span>
              </div>
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Брой стаи</label>
              <input className={s.input} type="number" placeholder="0" value={rooms} onChange={e => setRooms(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Етаж</label>
              <input className={s.input} type="number" placeholder="0" value={floor} onChange={e => setFloor(e.target.value)} />
            </div>
            <div className={s.fieldGroup}>
              <label className={s.label}>Общо етажи</label>
              <input className={s.input} type="number" placeholder="0" value={totalFloors} onChange={e => setTotalFloors(e.target.value)} />
            </div>
            <div className={s.fieldGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={s.label}>Година на строеж</label>
              <input className={s.input} type="number" placeholder="напр. 2015" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)} style={{ maxWidth: 180 }} />
            </div>
          </div>
        </div>

        {/* ── Furnishing ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1H6v-1a2 2 0 0 0-4 0z"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Обзавеждане</div>
              <div className={s.cardDesc}>Степен на обзавеждане на имота</div>
            </div>
          </div>

          <div className={s.segmented}>
            {FURNISHING_SEGS.map(seg => (
              <button
                key={seg.value}
                type="button"
                className={`${s.segmentedBtn}${furnishing === seg.value ? ` ${s.segmentedActive}` : ''}`}
                onClick={() => setFurnishing(furnishing === seg.value ? '' : seg.value)}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Parking ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Паркиране</div>
              <div className={s.cardDesc}>Брой паркоместа към имота</div>
            </div>
          </div>

          <div className={s.segmented}>
            {PARKING_SEGS.map(seg => (
              <button
                key={seg.value}
                type="button"
                className={`${s.segmentedBtn}${parking === seg.value ? ` ${s.segmentedActive}` : ''}`}
                onClick={() => setParking(seg.value)}
              >
                {seg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Construction ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Конструкция</div>
              <div className={s.cardDesc}>Вид строителна конструкция на сградата</div>
            </div>
          </div>

          <div className={s.chipGroup}>
            {CONSTRUCTION.map(c => (
              <button
                key={c}
                type="button"
                className={`${s.chip}${construction === c ? ` ${s.chipActive}` : ''}`}
                onClick={() => setConstruction(construction === c ? '' : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* ── Amenities ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Удобства и екстри</div>
              <div className={s.cardDesc}>Избери всички налични удобства</div>
            </div>
          </div>

          <div className={s.amenityGroups}>
            {AMENITY_GROUPS.map(group => (
              <div key={group.label} className={s.amenityGroup}>
                <div className={s.amenityGroupLabel}>{group.label}</div>
                <div className={s.chipGroup}>
                  {group.items.map(a => (
                    <button
                      key={a}
                      type="button"
                      className={`${s.chip}${amenities.includes(a) ? ` ${s.chipActive}` : ''}`}
                      onClick={() => toggleAmenity(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Location ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Местоположение</div>
              <div className={s.cardDesc}>Град, квартал и адрес</div>
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Град <span className={s.req}>*</span></label>
            <div className={s.selectWrap}>
              <select className={s.select} value={city} onChange={e => setCity(e.target.value)}>
                <option value="">Избери град</option>
                {BG_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronIcon />
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Квартал / Район</label>
            <input className={s.input} type="text" placeholder="напр. Младост 1" value={district} onChange={e => setDistrict(e.target.value)} />
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Адрес (по избор)</label>
            <input className={s.input} type="text" placeholder="ул. / бл. / No" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
        </div>

        {/* ── Pricing ── */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div className={s.cardIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <div className={s.cardTitle}>Ценообразуване</div>
              <div className={s.cardDesc}>Цена и депозит в евро</div>
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Цена <span className={s.req}>*</span></label>
            <div className={s.priceInput}>
              <span className={s.priceCurrency}>€</span>
              <input className={s.priceField} type="number" placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
          </div>

          <div className={s.fieldGroup}>
            <label className={s.label}>Депозит</label>
            <div className={s.priceInput}>
              <span className={s.priceCurrency}>€</span>
              <input className={s.priceField} type="number" placeholder="0.00" value={deposit} onChange={e => setDeposit(e.target.value)} />
            </div>
          </div>
        </div>

      </div>{/* end sections */}

      {/* ── Fixed bottom bar ── */}
      <div className={s.bottomBar}>
        <Link href="/profile" className={s.cancelBtn}>Откажи</Link>
        <button type="button" className={s.publishBtn} onClick={publish}>
          Публикувай
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      {/* ── Validation modal ── */}
      {modalErrors.length > 0 && (
        <div className={s.modalOverlay} onClick={() => setModalErrors([])}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="12" y1="18.5" x2="12.01" y2="18.5" strokeWidth="2.5"/>
              </svg>
            </div>
            <h2 className={s.modalTitle}>Непълна обява</h2>
            <p className={s.modalSub}>Попълни следните полета преди да публикуваш:</p>
            <ul className={s.modalList}>
              {modalErrors.map((err, i) => (
                <li key={i} className={s.modalItem}>
                  <span className={s.modalDot} />
                  {err}
                </li>
              ))}
            </ul>
            <button className={s.modalBtn} onClick={() => setModalErrors([])}>Разбрах</button>
          </div>
        </div>
      )}

    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className={s.chevron} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
