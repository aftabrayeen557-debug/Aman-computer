import type { WebsiteSectionContent } from '../types';

export const HERO_CONTENT_LIMITS = {
  headline: 45,
  subheadline: 65,
  description: 180,
} as const;

export const HERO_MOBILE_LINE_LIMITS = {
  headline: 3,
  subheadline: 2,
  description: 4,
} as const;

export const HERO_DEFAULT_COPY = {
  headline: 'Your Trusted Digital Partner',
  subheadline: 'Fast, Reliable & Professional Digital Services.',
  description:
    'From online applications and PAN services to Aadhaar assistance, photo studio and printing — all your digital needs, under one roof.',
} as const;

export const LEGACY_HERO_PATTERNS = [
  'welcome to aman computer.',
  'your one-stop center for',
  'aman computer is your local neighborhood digital partner',
  'your trust, our service — fast, honest & 100% reliable digital services',
  'from competitive exam forms, pan & aadhaar smart cards',
] as const;

export type HeroContentData = WebsiteSectionContent['hero'];

export type HeroValidationField = 'headline' | 'subheadline' | 'description';

export interface HeroValidationResult {
  valid: boolean;
  errors: Partial<Record<HeroValidationField, string>>;
  sanitized: HeroContentData;
}

/**
 * Collapses repeated whitespace/newlines into single spaces and trims ends.
 * Never truncates characters silently.
 */
export const normalizeHeroText = (value: unknown): string => {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks whether a hero payload matches pre-upgrade legacy text or exceeds strict limits.
 */
export const isLegacyOversizedHero = (hero?: Partial<HeroContentData> | null): boolean => {
  if (!hero) return true;
  const h = normalizeHeroText(hero.headline);
  const s = normalizeHeroText(hero.subheadline);
  const d = normalizeHeroText(hero.description);

  if (
    h.length > HERO_CONTENT_LIMITS.headline ||
    s.length > HERO_CONTENT_LIMITS.subheadline ||
    d.length > HERO_CONTENT_LIMITS.description
  ) {
    return true;
  }

  const combined = `${h} ${s} ${d}`.toLowerCase();
  return LEGACY_HERO_PATTERNS.some((pattern) => combined.includes(pattern));
};

/**
 * Strict shared validation used by HeroManagerView, AdminContext, and dbSaveWebsiteContent.
 * Enforces trimmed non-empty required fields and strict maximum character limits without truncation.
 */
export const validateHeroContent = (
  raw: Partial<HeroContentData> | null | undefined,
  fallback?: Partial<HeroContentData>
): HeroValidationResult => {
  const src = raw && typeof raw === 'object' ? raw : {};
  const headline = normalizeHeroText(src.headline);
  const subheadline = normalizeHeroText(src.subheadline);
  const description = normalizeHeroText(src.description);

  const errors: Partial<Record<HeroValidationField, string>> = {};

  if (!headline) {
    errors.headline = 'Main headline is required.';
  } else if (headline.length > HERO_CONTENT_LIMITS.headline) {
    errors.headline = `Main headline must be ${HERO_CONTENT_LIMITS.headline} characters or fewer (${headline.length}/${HERO_CONTENT_LIMITS.headline}).`;
  }

  if (!subheadline) {
    errors.subheadline = 'Supporting headline is required.';
  } else if (subheadline.length > HERO_CONTENT_LIMITS.subheadline) {
    errors.subheadline = `Supporting headline must be ${HERO_CONTENT_LIMITS.subheadline} characters or fewer (${subheadline.length}/${HERO_CONTENT_LIMITS.subheadline}).`;
  }

  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length > HERO_CONTENT_LIMITS.description) {
    errors.description = `Description must be ${HERO_CONTENT_LIMITS.description} characters or fewer (${description.length}/${HERO_CONTENT_LIMITS.description}).`;
  }

  const sanitized: HeroContentData = {
    badge: normalizeHeroText(src.badge ?? fallback?.badge ?? 'CYBER CAFE & DIGITAL CENTER'),
    headline,
    subheadline,
    description,
    ctaPrimaryText: normalizeHeroText(src.ctaPrimaryText ?? fallback?.ctaPrimaryText ?? 'WhatsApp Us'),
    ctaPrimaryLink: normalizeHeroText(src.ctaPrimaryLink ?? fallback?.ctaPrimaryLink ?? 'https://wa.me/918595515718'),
    ctaSecondaryText: normalizeHeroText(src.ctaSecondaryText ?? fallback?.ctaSecondaryText ?? 'Explore Services'),
    ctaSecondaryLink: normalizeHeroText(src.ctaSecondaryLink ?? fallback?.ctaSecondaryLink ?? '#works'),
    announcement: normalizeHeroText(src.announcement ?? fallback?.announcement ?? ''),
    timingNotice: normalizeHeroText(
      src.timingNotice ?? fallback?.timingNotice ?? 'Open Mon–Sat: 8:00 AM – 9:00 PM · Sun: 9:00 AM – 2:00 PM'
    ),
  };

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
};
