import { POPUP_TYPES, POPUP_PAGES, POPUP_FREQUENCIES } from './popup-types';

type Result = { data: Record<string, unknown> } | { error: string };

const str = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim().slice(0, max);
  return t || null;
};
const int = (v: unknown, min: number, max: number, fallback: number): number => {
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
};
const date = (v: unknown): Date | null | 'bad' => {
  if (v === null || v === undefined || v === '') return null;
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? 'bad' : d;
};
// Only same-site paths or https URLs — no javascript:, data:, protocol-relative etc.
const safeUrl = (v: unknown, max: number): string | null => {
  const t = str(v, max);
  if (!t) return null;
  if (t.startsWith('/') && !t.startsWith('//')) return t;
  if (t.startsWith('https://')) return t;
  return null;
};

// Validates the fields present in `body` (partial updates allowed) and
// returns a Prisma-ready data object.
export function parsePopupInput(body: Record<string, unknown>, partial: boolean): Result {
  const d: Record<string, unknown> = {};

  if ('name' in body || !partial) {
    const name = str(body.name, 80);
    if (!name) return { error: 'Въведи име на попъпа' };
    d.name = name;
  }
  if ('type' in body || !partial) {
    if (!(POPUP_TYPES as readonly string[]).includes(String(body.type))) return { error: 'Невалиден тип' };
    d.type = body.type;
  }
  if ('active' in body) d.active = body.active === true;
  if ('priority' in body) d.priority = int(body.priority, -100, 100, 0);
  if ('pages' in body) {
    if (!(POPUP_PAGES as readonly string[]).includes(String(body.pages))) return { error: 'Невалидни страници' };
    d.pages = body.pages;
  }
  if ('frequency' in body) {
    if (!(POPUP_FREQUENCIES as readonly string[]).includes(String(body.frequency))) return { error: 'Невалидна честота' };
    d.frequency = body.frequency;
  }
  if ('frequencyDays' in body) d.frequencyDays = int(body.frequencyDays, 1, 365, 7);
  if ('delaySeconds' in body) d.delaySeconds = int(body.delaySeconds, 0, 60, 2);

  if ('startsAt' in body) {
    const s = date(body.startsAt);
    if (s === 'bad') return { error: 'Невалидна начална дата' };
    d.startsAt = s;
  }
  if ('endsAt' in body) {
    const e = date(body.endsAt);
    if (e === 'bad') return { error: 'Невалидна крайна дата' };
    d.endsAt = e;
  }
  if (d.startsAt instanceof Date && d.endsAt instanceof Date && d.endsAt <= d.startsAt) {
    return { error: 'Крайната дата трябва да е след началната' };
  }

  for (const [k, max] of [['title', 120], ['titleEn', 120], ['text', 400], ['textEn', 400], ['ctaLabel', 40], ['ctaLabelEn', 40]] as const) {
    if (k in body) d[k] = str(body[k], max);
  }
  if ('ctaLink' in body) {
    const link = safeUrl(body.ctaLink, 300);
    if (body.ctaLink && !link) return { error: 'Линкът трябва да започва с / или https://' };
    d.ctaLink = link;
  }
  if ('image' in body) {
    const img = safeUrl(body.image, 500);
    if (body.image && !img) return { error: 'Снимката трябва да е път (/…) или https:// URL' };
    d.image = img;
  }
  if ('promoCode' in body) {
    const code = str(body.promoCode, 50);
    d.promoCode = code ? code.toUpperCase() : null;
  }
  if ('accent' in body) {
    if (!/^#[0-9a-fA-F]{6}$/.test(String(body.accent))) return { error: 'Цветът трябва да е във формат #RRGGBB' };
    d.accent = body.accent;
  }
  if ('showCountdown' in body) d.showCountdown = body.showCountdown === true;

  return { data: d };
}
