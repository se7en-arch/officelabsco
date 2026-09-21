import type { Popup } from '@/lib/generated/prisma/client';
import type { PopupAdmin, PopupType, PopupPages, PopupFrequency } from './popup-types';

export function toAdminPopup(p: Popup): PopupAdmin {
  return {
    id: p.id, name: p.name, type: p.type as PopupType, active: p.active, priority: p.priority,
    startsAt: p.startsAt ? p.startsAt.toISOString() : null,
    endsAt: p.endsAt ? p.endsAt.toISOString() : null,
    pages: p.pages as PopupPages, frequency: p.frequency as PopupFrequency,
    frequencyDays: p.frequencyDays, delaySeconds: p.delaySeconds,
    title: p.title, titleEn: p.titleEn, text: p.text, textEn: p.textEn, image: p.image,
    ctaLabel: p.ctaLabel, ctaLabelEn: p.ctaLabelEn, ctaLink: p.ctaLink, promoCode: p.promoCode,
    accent: p.accent, showCountdown: p.showCountdown, version: p.version,
  };
}
