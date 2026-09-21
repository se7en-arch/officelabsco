import type { PopupAdmin } from './popup-types';

export type PopupDraft = Omit<PopupAdmin, 'id' | 'version'> & { id?: number };

export const BLANK_DRAFT: PopupDraft = {
  name: '', type: 'promo', active: false, priority: 0, startsAt: null, endsAt: null,
  pages: 'shop', frequency: 'days', frequencyDays: 7, delaySeconds: 2,
  title: '', titleEn: '', text: '', textEn: '', image: '', ctaLabel: '', ctaLabelEn: '', ctaLink: '/shop',
  promoCode: '', accent: '#FF5733', showCountdown: false,
};

export type PopupTemplate = {
  id: string;
  label: string;
  hint: string;
  build: (now: Date) => Partial<PopupDraft>;
};

// ── date helpers (admin's local time) ───────────────────────────────────
const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m, d, h, min, 0, 0);
const iso = (d: Date) => d.toISOString();

/** Black Friday = the day after US Thanksgiving (4th Thursday of November). */
function blackFriday(year: number): Date {
  const nov1Weekday = at(year, 10, 1).getDay(); // 0 = Sun … 4 = Thu
  const firstThursday = 1 + ((4 - nov1Weekday + 7) % 7);
  return at(year, 10, firstThursday + 21 + 1);
}

/** The next occurrence of a yearly window that hasn't fully ended yet. */
function upcoming(now: Date, make: (year: number) => { start: Date; end: Date }) {
  const y = now.getFullYear();
  const cur = make(y);
  return cur.end.getTime() > now.getTime() ? cur : make(y + 1);
}

export const POPUP_TEMPLATES: PopupTemplate[] = [
  {
    id: 'black-friday',
    label: 'Black Friday',
    hint: 'Понеделник преди BF → Cyber Monday, с обратно броене',
    build: (now) => {
      const { start, end } = upcoming(now, (y) => {
        const bf = blackFriday(y);
        return { start: at(y, 10, bf.getDate() - 4), end: at(y, 10, bf.getDate() + 3, 23, 59) };
      });
      return {
        name: `Black Friday ${start.getFullYear()}`, type: 'promo', priority: 10,
        title: 'Black Friday', titleEn: 'Black Friday',
        text: 'Само до края на кампанията — специална отстъпка върху цялата ти поръчка.',
        textEn: 'Only until the campaign ends — a special discount on your whole order.',
        ctaLabel: 'Вземи отстъпката', ctaLabelEn: 'Get the discount', ctaLink: '/shop',
        accent: '#111827', showCountdown: true, frequency: 'days', frequencyDays: 1, delaySeconds: 2,
        startsAt: iso(start), endsAt: iso(end),
      };
    },
  },
  {
    id: 'christmas',
    label: 'Коледна разпродажба',
    hint: '1 → 24 декември, с обратно броене',
    build: (now) => {
      const { start, end } = upcoming(now, (y) => ({ start: at(y, 11, 1), end: at(y, 11, 24, 23, 59) }));
      return {
        name: `Коледа ${start.getFullYear()}`, type: 'promo', priority: 10,
        title: 'Коледна разпродажба', titleEn: 'Christmas Sale',
        text: 'Подари си (или на някого) мебел с характер — с празнична отстъпка.',
        textEn: 'Give yourself (or someone else) furniture with character — with a festive discount.',
        ctaLabel: 'Към подаръците', ctaLabelEn: 'See the collection', ctaLink: '/shop',
        accent: '#B91C1C', showCountdown: true, frequency: 'days', frequencyDays: 2, delaySeconds: 3,
        startsAt: iso(start), endsAt: iso(end),
      };
    },
  },
  {
    id: 'spring',
    label: 'Пролетна разпродажба',
    hint: '1 → 31 март',
    build: (now) => {
      const { start, end } = upcoming(now, (y) => ({ start: at(y, 2, 1), end: at(y, 2, 31, 23, 59) }));
      return {
        name: `Пролет ${start.getFullYear()}`, type: 'promo', priority: 5,
        title: 'Пролетна разпродажба', titleEn: 'Spring Sale',
        text: 'Освежи пространството си за новия сезон — с отстъпка до края на месеца.',
        textEn: 'Refresh your space for the new season — discounted until the end of the month.',
        ctaLabel: 'Разгледай', ctaLabelEn: 'Browse', ctaLink: '/shop',
        accent: '#7A9E87', showCountdown: true, frequency: 'days', frequencyDays: 3, delaySeconds: 3,
        startsAt: iso(start), endsAt: iso(end),
      };
    },
  },
  {
    id: 'summer',
    label: 'Летни оферти',
    hint: '1 → 31 юли',
    build: (now) => {
      const { start, end } = upcoming(now, (y) => ({ start: at(y, 6, 1), end: at(y, 6, 31, 23, 59) }));
      return {
        name: `Лято ${start.getFullYear()}`, type: 'promo', priority: 5,
        title: 'Летни оферти', titleEn: 'Summer Deals',
        text: 'Горещи цени за студени мебели — само през юли.',
        textEn: 'Hot prices on cool furniture — this July only.',
        ctaLabel: 'Виж офертите', ctaLabelEn: 'See the deals', ctaLink: '/shop',
        accent: '#F59E0B', showCountdown: true, frequency: 'days', frequencyDays: 3, delaySeconds: 3,
        startsAt: iso(start), endsAt: iso(end),
      };
    },
  },
  {
    id: 'email-first-order',
    label: 'Отстъпка срещу имейл',
    hint: 'Събира имейли и дава код за първата поръчка',
    build: () => ({
      name: 'Имейл — първа поръчка', type: 'email', priority: 1,
      title: 'Получи отстъпка за първата си поръчка', titleEn: 'Get a discount on your first order',
      text: 'Абонирай се и ние ще ти изпратим кода веднага. Без спам — само оферти и новини.',
      textEn: 'Subscribe and we will give you the code right away. No spam — just offers and news.',
      ctaLabel: 'Абонирай се', ctaLabelEn: 'Subscribe', ctaLink: '',
      accent: '#FF5733', frequency: 'days', frequencyDays: 30, delaySeconds: 8, pages: 'all',
    }),
  },
  {
    id: 'bar-sale',
    label: 'Лента: разпродажба',
    hint: 'Тънка лента най-горе, с броене и връзка',
    build: (now) => {
      const end = new Date(now.getTime() + 7 * 86_400_000);
      return {
        name: 'Лента — разпродажба', type: 'bar', priority: 5, pages: 'all',
        title: 'Разпродажба — специални цени до края на седмицата', titleEn: 'Sale — special prices until the end of the week',
        ctaLabel: 'Разгледай', ctaLabelEn: 'Browse', ctaLink: '/shop',
        accent: '#FF5733', showCountdown: true, frequency: 'session', delaySeconds: 0,
        endsAt: iso(new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59)),
      };
    },
  },
  {
    id: 'bar-delivery',
    label: 'Лента: безплатна доставка',
    hint: 'Постоянно съобщение най-горе',
    build: () => ({
      name: 'Лента — безплатна доставка', type: 'bar', priority: 1, pages: 'all',
      title: 'Безплатна доставка за всички поръчки', titleEn: 'Free delivery on all orders',
      ctaLabel: '', ctaLabelEn: '', ctaLink: '',
      accent: '#16a34a', showCountdown: false, frequency: 'session', delaySeconds: 0,
    }),
  },
];
