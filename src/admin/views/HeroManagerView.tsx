import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarRange,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Laptop,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  SunMoon,
  Tablet,
  Trash2,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import {
  HeroShowcaseItem,
  OwnerPortraitConfig,
  WebsiteSectionContent,
} from '../types';
import {
  CmsMediaField,
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';
import { INITIAL_WEBSITE_CONTENT } from '../data/initialData';
import {
  HERO_CONTENT_LIMITS,
  HERO_DEFAULT_COPY,
  HERO_MOBILE_LINE_LIMITS,
  normalizeHeroText,
  validateHeroContent,
} from '../services/heroValidationService';

interface HeroManagerViewProps {
  mode: 'headline' | 'showcase' | 'portrait';
}

type PreviewViewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_PREVIEW_SPECS: Record<
  PreviewViewport,
  {
    label: string;
    widthLabel: string;
    h1Size: string;
    h1LineHeight: number;
    subSize: string;
    subLineHeight: number;
    descSize: string;
    descLineHeight: number;
    containerMaxWidth: string;
    paddingClass: string;
  }
> = {
  mobile: {
    label: 'Mobile',
    widthLabel: '390px',
    h1Size: '36px',
    h1LineHeight: 1.1,
    subSize: '19px',
    subLineHeight: 1.14,
    descSize: '15px',
    descLineHeight: 1.5,
    containerMaxWidth: '390px',
    paddingClass: 'px-5 py-6',
  },
  tablet: {
    label: 'Tablet',
    widthLabel: '768px',
    h1Size: '44px',
    h1LineHeight: 1.1,
    subSize: '22px',
    subLineHeight: 1.14,
    descSize: '16px',
    descLineHeight: 1.5,
    containerMaxWidth: '100%',
    paddingClass: 'px-6 py-7',
  },
  desktop: {
    label: 'Desktop',
    widthLabel: '1280px+',
    h1Size: '58px',
    h1LineHeight: 1.09,
    subSize: '25px',
    subLineHeight: 1.15,
    descSize: '17px',
    descLineHeight: 1.5,
    containerMaxWidth: '100%',
    paddingClass: 'px-7 py-8',
  },
};

const hydrateInitialHeroDraft = (
  hero: WebsiteSectionContent['hero'] | undefined
): WebsiteSectionContent['hero'] => {
  const base = INITIAL_WEBSITE_CONTENT.hero;
  const src = hero || base;
  const h = src.headline ?? '';
  const s = src.subheadline ?? '';
  const d = src.description ?? '';
  const isOldDefaultStub =
    h.trim() === 'Welcome to Aman Computer.' &&
    s.trim() === 'Your one-stop center for' &&
    !d.trim();

  return {
    ...base,
    ...src,
    headline: isOldDefaultStub ? HERO_DEFAULT_COPY.headline : h,
    subheadline: isOldDefaultStub ? HERO_DEFAULT_COPY.subheadline : s,
    description: isOldDefaultStub || !d ? HERO_DEFAULT_COPY.description : d,
  };
};

export const HeroManagerView: React.FC<HeroManagerViewProps> = ({ mode }) => {
  const { websiteContent, updateWebsiteContent, setCurrentTab, showToast } =
    useAdmin();

  const [heroDraft, setHeroDraft] = useState<WebsiteSectionContent['hero']>(() =>
    hydrateInitialHeroDraft(websiteContent.hero)
  );
  const [showcaseDraft, setShowcaseDraft] = useState<HeroShowcaseItem[]>(
    websiteContent.heroShowcase || INITIAL_WEBSITE_CONTENT.heroShowcase || []
  );
  const [newShowcaseLabel, setNewShowcaseLabel] = useState('');
  const [portraitDraft, setPortraitDraft] = useState<OwnerPortraitConfig>(
    websiteContent.ownerPortrait ||
      INITIAL_WEBSITE_CONTENT.ownerPortrait || {
        imageUrl: '',
        visible: false,
        caption: 'Sharique Aman',
        subcaption: 'Founder & Proprietor',
        altText: 'Aman Computer Proprietor Portrait',
      }
  );
  const [flipPreviewIndex, setFlipPreviewIndex] = useState(0);
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>('mobile');
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [mobileLineCounts, setMobileLineCounts] = useState({
    headline: 2,
    subheadline: 2,
    description: 3,
  });

  const measureH1Ref = useRef<HTMLHeadingElement | null>(null);
  const measureSubRef = useRef<HTMLParagraphElement | null>(null);
  const measureDescRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    setHeroDraft(hydrateInitialHeroDraft(websiteContent.hero));
  }, [websiteContent.hero]);

  useEffect(() => {
    setShowcaseDraft(
      websiteContent.heroShowcase || INITIAL_WEBSITE_CONTENT.heroShowcase || []
    );
  }, [websiteContent.heroShowcase]);

  useEffect(() => {
    if (websiteContent.ownerPortrait) {
      setPortraitDraft(websiteContent.ownerPortrait);
    }
  }, [websiteContent.ownerPortrait]);

  const visibleShowcaseItems = showcaseDraft
    .filter((item) => item.visible && item.label.trim().length > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  useEffect(() => {
    if (mode !== 'showcase' || visibleShowcaseItems.length === 0) return;
    const timer = window.setInterval(() => {
      setFlipPreviewIndex((prev) => (prev + 1) % visibleShowcaseItems.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, [mode, visibleShowcaseItems.length]);

  const heroValidation = useMemo(() => validateHeroContent(heroDraft), [heroDraft]);

  const headlineLen = normalizeHeroText(heroDraft.headline).length;
  const subheadlineLen = normalizeHeroText(heroDraft.subheadline).length;
  const descriptionLen = normalizeHeroText(heroDraft.description).length;

  useLayoutEffect(() => {
    if (mode !== 'headline') return;
    const countLines = (el: HTMLElement | null, fallbackLineHeight: number): number => {
      if (!el) return 0;
      const text = (el.textContent || '').trim();
      if (!text) return 0;
      const computed = window.getComputedStyle(el);
      const lh = parseFloat(computed.lineHeight) || fallbackLineHeight;
      if (!lh) return 1;
      return Math.max(1, Math.round(el.scrollHeight / lh));
    };

    setMobileLineCounts({
      headline: countLines(measureH1Ref.current, 39.6),
      subheadline: countLines(measureSubRef.current, 21.7),
      description: countLines(measureDescRef.current, 22.5),
    });
  }, [mode, heroDraft.headline, heroDraft.subheadline, heroDraft.description]);

  const lineWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (mobileLineCounts.headline > HERO_MOBILE_LINE_LIMITS.headline) {
      warnings.push(
        `Main headline wraps to ${mobileLineCounts.headline} lines on 390px mobile (recommended max ${HERO_MOBILE_LINE_LIMITS.headline} lines).`
      );
    }
    if (mobileLineCounts.subheadline > HERO_MOBILE_LINE_LIMITS.subheadline) {
      warnings.push(
        `Supporting headline wraps to ${mobileLineCounts.subheadline} lines on 390px mobile (recommended max ${HERO_MOBILE_LINE_LIMITS.subheadline} lines).`
      );
    }
    if (mobileLineCounts.description > HERO_MOBILE_LINE_LIMITS.description) {
      warnings.push(
        `Description wraps to ${mobileLineCounts.description} lines on 390px mobile (recommended max ${HERO_MOBILE_LINE_LIMITS.description} lines).`
      );
    }
    return warnings;
  }, [mobileLineCounts]);

  const handleRestrictedFieldChange = (
    field: 'headline' | 'subheadline' | 'description',
    nextRaw: string,
    maxChars: number
  ) => {
    const currentRaw = String(heroDraft[field] ?? '');
    // Prevent entering extra characters beyond maxChars while still allowing edits that shorten legacy oversized text
    if (nextRaw.length > maxChars && nextRaw.length > currentRaw.length) {
      return;
    }
    setHeroDraft((prev) => ({ ...prev, [field]: nextRaw }));
  };

  const handleBlurTrim = (
    field: 'badge' | 'headline' | 'subheadline' | 'description' | 'timingNotice' | 'announcement'
  ) => {
    setHeroDraft((prev) => ({
      ...prev,
      [field]: normalizeHeroText(prev[field]),
    }));
  };

  const handleLoadRecommendedCopy = () => {
    setHeroDraft((prev) => ({
      ...prev,
      headline: HERO_DEFAULT_COPY.headline,
      subheadline: HERO_DEFAULT_COPY.subheadline,
      description: HERO_DEFAULT_COPY.description,
    }));
  };

  const handleSaveHeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateHeroContent(heroDraft);
    if (!check.valid) {
      const firstError =
        Object.values(check.errors)[0] ||
        'Please resolve Hero text length and required field validation errors before saving.';
      showToast('Validation Error', firstError, 'error');
      return;
    }
    const ok = await updateWebsiteContent('hero', check.sanitized);
    if (ok) {
      setHeroDraft(check.sanitized);
    }
  };

  const handleAddShowcaseCard = async () => {
    const trimmed = newShowcaseLabel.trim();
    if (!trimmed) {
      showToast('Enter Service Label', 'Please enter a showcase card title first.', 'warning');
      return;
    }
    const nextOrder =
      showcaseDraft.reduce((max, item) => Math.max(max, item.displayOrder), 0) + 1;
    const nextItem: HeroShowcaseItem = {
      id: `hs-${Date.now().toString(36)}`,
      label: trimmed,
      visible: true,
      displayOrder: nextOrder,
    };
    const nextList = [...showcaseDraft, nextItem];
    setShowcaseDraft(nextList);
    setNewShowcaseLabel('');
    await updateWebsiteContent('heroShowcase', nextList);
  };

  const handleSaveShowcaseList = async () => {
    const normalized = showcaseDraft
      .map((item, idx) => ({
        ...item,
        label: item.label.trim(),
        displayOrder: idx + 1,
      }))
      .filter((item) => item.label.length > 0);
    setShowcaseDraft(normalized);
    await updateWebsiteContent('heroShowcase', normalized);
  };

  const handleMoveShowcase = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= showcaseDraft.length) return;
    const next = [...showcaseDraft];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    const reordered = next.map((item, i) => ({ ...item, displayOrder: i + 1 }));
    setShowcaseDraft(reordered);
  };

  const handleSavePortrait = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateWebsiteContent('ownerPortrait', {
      ...portraitDraft,
      imageUrl: portraitDraft.imageUrl.trim(),
      caption: portraitDraft.caption.trim(),
      subcaption: portraitDraft.subcaption.trim(),
      altText: portraitDraft.altText.trim() || 'Aman Computer Proprietor Portrait',
    });
  };

  const modeTabs: Array<{ id: 'hero-headline' | 'hero-showcase' | 'hero-portrait'; label: string; icon: React.ElementType }> = [
    { id: 'hero-headline', label: 'Hero Headline', icon: Sparkles },
    { id: 'hero-showcase', label: 'Featured Showcase', icon: CalendarRange },
    { id: 'hero-portrait', label: 'Owner Portrait', icon: Camera },
  ];

  const activePreviewCard =
    visibleShowcaseItems[flipPreviewIndex % Math.max(1, visibleShowcaseItems.length)];
  const vpSpec = VIEWPORT_PREVIEW_SPECS[previewViewport];

  const renderCounterBadge = (current: number, max: number, hasError: boolean) => {
    const nearLimit = current >= Math.floor(max * 0.85) && current <= max;
    const toneClass = hasError
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
      : nearLimit
      ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
      : 'text-[#9F9CA3] bg-white/[0.04] border-white/[0.08]';
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-mono tabular-nums ${toneClass}`}
      >
        {current}/{max}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Owner & Brand · Hero Section Manager"
        title={
          mode === 'headline'
            ? 'Hero Headline & Opening Notice'
            : mode === 'showcase'
            ? 'Featured Service Showcase'
            : 'Optional Owner Portrait'
        }
        description={
          mode === 'headline'
            ? 'Edit the hero headline, supporting headline, description, buttons, and center timings with live Mobile, Tablet & Desktop typography preview.'
            : mode === 'showcase'
            ? 'Manage the animated flip-calendar service cards cycling directly inside the homepage hero.'
            : 'Control the optional portrait displayed in the hero section. When hidden or empty, the hero displays only editorial typography and service cards.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-[#101014] p-1 border border-white/[0.07]">
            {modeTabs.map((tab) => {
              const Icon = tab.icon;
              const isCurrent =
                (mode === 'headline' && tab.id === 'hero-headline') ||
                (mode === 'showcase' && tab.id === 'hero-showcase') ||
                (mode === 'portrait' && tab.id === 'hero-portrait');
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                      : 'text-[#85838A] hover:text-[#E8E5DF]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        }
      />

      {mode === 'headline' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <CmsSurfaceCard
            title="Hero Editorial Copy & Links"
            subtitle="Strict character limits ensure crisp typography and clean mobile line wrapping."
            className="xl:col-span-6"
            headerRight={
              <button
                type="button"
                onClick={handleLoadRecommendedCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#211B16] border border-[#C9A96E]/35 text-[11px] font-medium text-[#DFC492] hover:bg-[#C9A96E]/15 transition-colors cursor-pointer"
                title="Load refined default Aman Computer hero copy"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Recommended Copy</span>
              </button>
            }
          >
            <form onSubmit={handleSaveHeadline} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Top Badge Label
                  </label>
                  <input
                    type="text"
                    value={heroDraft.badge}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({ ...prev, badge: e.target.value }))
                    }
                    onBlur={() => handleBlurTrim('badge')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                    placeholder="CYBER CAFE & DIGITAL CENTER"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Timing Notice
                  </label>
                  <input
                    type="text"
                    value={heroDraft.timingNotice}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({ ...prev, timingNotice: e.target.value }))
                    }
                    onBlur={() => handleBlurTrim('timingNotice')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                    placeholder="Open Mon–Sat: 8:00 AM – 9:00 PM"
                  />
                </div>
              </div>

              {/* Main Headline (Max 45 chars, max 3 mobile lines) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="heroHeadlineInput" className="text-xs font-medium text-[#E8E5DF]">
                    Main Headline <span className="text-[#85838A]">(Required · Max 3 lines on mobile)</span>
                  </label>
                  {renderCounterBadge(
                    headlineLen,
                    HERO_CONTENT_LIMITS.headline,
                    Boolean(heroValidation.errors.headline)
                  )}
                </div>
                <input
                  id="heroHeadlineInput"
                  type="text"
                  maxLength={HERO_CONTENT_LIMITS.headline}
                  value={heroDraft.headline}
                  onChange={(e) =>
                    handleRestrictedFieldChange(
                      'headline',
                      e.target.value,
                      HERO_CONTENT_LIMITS.headline
                    )
                  }
                  onBlur={() => handleBlurTrim('headline')}
                  aria-invalid={Boolean(heroValidation.errors.headline)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border text-sm font-editorial text-[#E8E5DF] outline-none ${
                    heroValidation.errors.headline
                      ? 'border-rose-500/70 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-[#C9A96E]/60'
                  }`}
                  placeholder={HERO_DEFAULT_COPY.headline}
                />
                {heroValidation.errors.headline && (
                  <p role="alert" className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{heroValidation.errors.headline}</span>
                  </p>
                )}
              </div>

              {/* Supporting Headline (Max 65 chars, max 2 mobile lines) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="heroSubheadlineInput" className="text-xs font-medium text-[#E8E5DF]">
                    Supporting Headline <span className="text-[#85838A]">(Required · Max 2 lines on mobile)</span>
                  </label>
                  {renderCounterBadge(
                    subheadlineLen,
                    HERO_CONTENT_LIMITS.subheadline,
                    Boolean(heroValidation.errors.subheadline)
                  )}
                </div>
                <input
                  id="heroSubheadlineInput"
                  type="text"
                  maxLength={HERO_CONTENT_LIMITS.subheadline}
                  value={heroDraft.subheadline}
                  onChange={(e) =>
                    handleRestrictedFieldChange(
                      'subheadline',
                      e.target.value,
                      HERO_CONTENT_LIMITS.subheadline
                    )
                  }
                  onBlur={() => handleBlurTrim('subheadline')}
                  aria-invalid={Boolean(heroValidation.errors.subheadline)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border text-xs text-[#E8E5DF] outline-none ${
                    heroValidation.errors.subheadline
                      ? 'border-rose-500/70 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-[#C9A96E]/60'
                  }`}
                  placeholder={HERO_DEFAULT_COPY.subheadline}
                />
                {heroValidation.errors.subheadline && (
                  <p role="alert" className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{heroValidation.errors.subheadline}</span>
                  </p>
                )}
              </div>

              {/* Description (Max 180 chars, max 4 mobile lines) */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label htmlFor="heroDescriptionInput" className="text-xs font-medium text-[#E8E5DF]">
                    Hero Description <span className="text-[#85838A]">(Required · Max 4 lines on mobile)</span>
                  </label>
                  {renderCounterBadge(
                    descriptionLen,
                    HERO_CONTENT_LIMITS.description,
                    Boolean(heroValidation.errors.description)
                  )}
                </div>
                <textarea
                  id="heroDescriptionInput"
                  rows={3}
                  maxLength={HERO_CONTENT_LIMITS.description}
                  value={heroDraft.description ?? ''}
                  onChange={(e) =>
                    handleRestrictedFieldChange(
                      'description',
                      e.target.value,
                      HERO_CONTENT_LIMITS.description
                    )
                  }
                  onBlur={() => handleBlurTrim('description')}
                  aria-invalid={Boolean(heroValidation.errors.description)}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border text-xs text-[#E8E5DF] outline-none resize-none leading-relaxed ${
                    heroValidation.errors.description
                      ? 'border-rose-500/70 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-[#C9A96E]/60'
                  }`}
                  placeholder={HERO_DEFAULT_COPY.description}
                />
                {heroValidation.errors.description && (
                  <p role="alert" className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{heroValidation.errors.description}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Hero Announcement Text
                </label>
                <textarea
                  rows={2}
                  value={heroDraft.announcement}
                  onChange={(e) =>
                    setHeroDraft((prev) => ({ ...prev, announcement: e.target.value }))
                  }
                  onBlur={() => handleBlurTrim('announcement')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
                  placeholder="Short notice highlighted on the public storefront..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.06]">
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={heroDraft.ctaPrimaryText}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({
                        ...prev,
                        ctaPrimaryText: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Primary CTA Link
                  </label>
                  <input
                    type="text"
                    value={heroDraft.ctaPrimaryLink}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({
                        ...prev,
                        ctaPrimaryLink: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Secondary CTA Label
                  </label>
                  <input
                    type="text"
                    value={heroDraft.ctaSecondaryText}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({
                        ...prev,
                        ctaSecondaryText: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Secondary CTA Link
                  </label>
                  <input
                    type="text"
                    value={heroDraft.ctaSecondaryLink}
                    onChange={(e) =>
                      setHeroDraft((prev) => ({
                        ...prev,
                        ctaSecondaryLink: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[11px] text-[#85838A]">
                  {heroValidation.valid
                    ? 'All character limits satisfied.'
                    : 'Fix validation errors above before saving.'}
                </span>
                <button
                  type="submit"
                  disabled={!heroValidation.valid}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] disabled:bg-white/[0.08] disabled:text-[#85838A] disabled:cursor-not-allowed text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Hero Headline</span>
                </button>
              </div>
            </form>
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="Live Public Hero Preview"
            subtitle="Exact storefront typography scale, spacing & mobile line-wrap telemetry."
            className="xl:col-span-6"
            headerRight={
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center rounded-xl bg-[#0A0A0E] p-1 border border-white/[0.07]">
                  {(
                    [
                      { id: 'mobile', label: 'Mobile', icon: Smartphone },
                      { id: 'tablet', label: 'Tablet', icon: Tablet },
                      { id: 'desktop', label: 'Desktop', icon: Laptop },
                    ] as const
                  ).map((vp) => {
                    const Icon = vp.icon;
                    const active = previewViewport === vp.id;
                    return (
                      <button
                        key={vp.id}
                        type="button"
                        onClick={() => setPreviewViewport(vp.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/35'
                            : 'text-[#85838A] hover:text-[#E8E5DF]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{vp.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewTheme((t) => (t === 'light' ? 'dark' : 'light'))
                  }
                  className="p-2 rounded-xl bg-[#0A0A0E] border border-white/[0.07] text-[#9F9CA3] hover:text-[#E8E5DF] cursor-pointer"
                  title="Toggle preview light / dark mode"
                  aria-label="Toggle preview light or dark mode"
                >
                  <SunMoon className="w-3.5 h-3.5" />
                </button>
              </div>
            }
          >
            {/* Mobile line-wrap measurement sandbox (exact 350px text column matching 390px mobile shell) */}
            <div
              aria-hidden="true"
              className="pointer-events-none fixed -left-[9999px] top-0 opacity-0"
              style={{
                width: '350px',
                fontFamily: "'Onest', ui-sans-serif, system-ui, sans-serif",
              }}
            >
              <h2
                ref={measureH1Ref}
                style={{
                  fontSize: '36px',
                  lineHeight: 1.1,
                  fontWeight: 650,
                  letterSpacing: '-0.025em',
                  maxWidth: 'min(100%, 16ch)',
                  textWrap: 'balance',
                }}
              >
                {heroDraft.headline}
              </h2>
              <p
                ref={measureSubRef}
                style={{
                  fontSize: '19px',
                  lineHeight: 1.14,
                  fontWeight: 500,
                  letterSpacing: '-0.015em',
                  maxWidth: 'min(100%, 36ch)',
                }}
              >
                {heroDraft.subheadline}
              </p>
              <p
                ref={measureDescRef}
                style={{
                  fontSize: '15px',
                  lineHeight: 1.5,
                  fontWeight: 400,
                  maxWidth: 'min(100%, 54ch)',
                }}
              >
                {heroDraft.description}
              </p>
            </div>

            {/* Line-wrap & responsive viewport metrics */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="text-[#9F9CA3]">
                Viewport: <strong className="text-[#DFC492]">{vpSpec.label} ({vpSpec.widthLabel})</strong>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    mobileLineCounts.headline > HERO_MOBILE_LINE_LIMITS.headline
                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/35'
                      : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                  }`}
                >
                  H1: {mobileLineCounts.headline}/{HERO_MOBILE_LINE_LIMITS.headline} mobile lines
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    mobileLineCounts.subheadline > HERO_MOBILE_LINE_LIMITS.subheadline
                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/35'
                      : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                  }`}
                >
                  Sub: {mobileLineCounts.subheadline}/{HERO_MOBILE_LINE_LIMITS.subheadline} mobile lines
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md border ${
                    mobileLineCounts.description > HERO_MOBILE_LINE_LIMITS.description
                      ? 'text-amber-300 bg-amber-500/10 border-amber-500/35'
                      : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
                  }`}
                >
                  Desc: {mobileLineCounts.description}/{HERO_MOBILE_LINE_LIMITS.description} mobile lines
                </span>
              </div>
            </div>

            {lineWarnings.length > 0 ? (
              <div className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-200 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Mobile Line Wrapping Warning</span>
                </div>
                {lineWarnings.map((warn, idx) => (
                  <p key={idx} className="text-[11px] leading-relaxed text-amber-100/90">
                    {warn}
                  </p>
                ))}
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3.5 py-2 text-[11px] text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Balanced visual line count verified at 390px mobile width.</span>
              </div>
            )}

            {/* Authentic Public Hero Frame */}
            <div className="overflow-x-auto pb-1">
              <div
                className={`mx-auto rounded-2xl border overflow-hidden transition-all ${
                  previewTheme === 'light'
                    ? 'border-[#D5CDCA] text-[#1A1818]'
                    : 'border-white/[0.1] text-[#E8E4E0]'
                }`}
                style={{
                  width: previewViewport === 'mobile' ? '390px' : '100%',
                  maxWidth: vpSpec.containerMaxWidth,
                  fontFamily: "'Onest', ui-sans-serif, system-ui, sans-serif",
                  background:
                    previewTheme === 'light'
                      ? 'radial-gradient(120% 90% at 62% 30%, #EEEAE6 0%, #E8E4E0 48%, #D8CDCA 100%)'
                      : 'radial-gradient(120% 90% at 62% 30%, #2A2525 0%, #1F1C1C 48%, #141212 100%)',
                }}
              >
                <div className={vpSpec.paddingClass}>
                  <div className="space-y-3.5">
                    <p
                      className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.08em]"
                      style={{
                        color:
                          previewTheme === 'light'
                            ? 'rgba(26,24,24,0.68)'
                            : 'rgba(232,228,224,0.68)',
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            previewTheme === 'light'
                              ? 'rgba(26,24,24,0.5)'
                              : 'rgba(232,228,224,0.5)',
                        }}
                      />
                      <span>{heroDraft.badge || 'CYBER CAFE & DIGITAL CENTER'}</span>
                    </p>

                    <h2
                      style={{
                        fontSize: vpSpec.h1Size,
                        lineHeight: vpSpec.h1LineHeight,
                        fontWeight: 650,
                        letterSpacing: '-0.025em',
                        maxWidth: 'min(100%, 16ch)',
                        textWrap: 'balance',
                      }}
                    >
                      {heroDraft.headline || HERO_DEFAULT_COPY.headline}
                    </h2>

                    <p
                      style={{
                        fontSize: vpSpec.subSize,
                        lineHeight: vpSpec.subLineHeight,
                        fontWeight: 500,
                        letterSpacing: '-0.015em',
                        maxWidth:
                          previewViewport === 'mobile'
                            ? 'min(100%, 36ch)'
                            : 'min(100%, 38ch)',
                        color:
                          previewTheme === 'light'
                            ? 'rgba(26,24,24,0.78)'
                            : 'rgba(232,228,224,0.8)',
                      }}
                    >
                      {heroDraft.subheadline || HERO_DEFAULT_COPY.subheadline}
                    </p>

                    <p
                      style={{
                        fontSize: vpSpec.descSize,
                        lineHeight: vpSpec.descLineHeight,
                        fontWeight: 400,
                        maxWidth: 'min(100%, 54ch)',
                        color:
                          previewTheme === 'light'
                            ? 'rgba(26,24,24,0.72)'
                            : 'rgba(232,228,224,0.72)',
                      }}
                    >
                      {heroDraft.description || HERO_DEFAULT_COPY.description}
                    </p>

                    {/* Compact Flip-Notebook Service Chip */}
                    <div className="pt-0.5">
                      <span
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold tracking-tight shadow-sm"
                        style={{
                          background: 'linear-gradient(180deg, #fdfcf9 0%, #f3f1ec 100%)',
                          color: '#0a0a0a',
                          boxShadow: '0 2px 0 #d8d4cb, 0 6px 14px -6px rgba(0,0,0,0.28)',
                        }}
                      >
                        <span>
                          {activePreviewCard?.label || 'Online Job Forms & Exam Registration'}
                        </span>
                      </span>
                    </div>

                    {heroDraft.announcement && (
                      <div
                        className="rounded-xl px-3 py-2 text-xs leading-relaxed border"
                        style={{
                          background:
                            previewTheme === 'light'
                              ? 'rgba(255,255,255,0.45)'
                              : 'rgba(255,255,255,0.05)',
                          borderColor:
                            previewTheme === 'light'
                              ? 'rgba(26,24,24,0.1)'
                              : 'rgba(232,228,224,0.12)',
                        }}
                      >
                        {heroDraft.announcement}
                      </div>
                    )}

                    {/* CTA Pills */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      <span
                        className="inline-flex items-center gap-2 rounded-full pl-4 pr-1.5 py-1.5 text-[13px] font-medium"
                        style={{
                          background: previewTheme === 'light' ? '#1A1818' : '#E8E4E0',
                          color: previewTheme === 'light' ? '#E8E4E0' : '#1A1818',
                        }}
                      >
                        <span>{heroDraft.ctaPrimaryText || 'WhatsApp Us'}</span>
                        <span
                          className="w-6 h-6 rounded-full grid place-items-center"
                          style={{
                            background: previewTheme === 'light' ? '#E8E4E0' : '#1A1818',
                            color: previewTheme === 'light' ? '#1A1818' : '#E8E4E0',
                          }}
                        >
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </span>
                      <span
                        className="inline-flex items-center rounded-full px-4 py-2 text-[13px] font-medium border"
                        style={{
                          borderColor:
                            previewTheme === 'light'
                              ? '#D5CDCA'
                              : 'rgba(196,176,176,0.22)',
                        }}
                      >
                        {heroDraft.ctaSecondaryText || 'Explore Services'}
                      </span>
                    </div>

                    <p
                      className="text-[12px]"
                      style={{
                        color:
                          previewTheme === 'light'
                            ? 'rgba(26,24,24,0.64)'
                            : 'rgba(232,228,224,0.64)',
                      }}
                    >
                      Designed &amp; Developed by{' '}
                      <span className="underline underline-offset-2 font-medium">
                        Md Aftab
                      </span>
                    </p>
                  </div>

                  {/* Hero Bottom Timing Bar */}
                  <div
                    className="mt-5 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-[0.04em]"
                    style={{
                      borderColor:
                        previewTheme === 'light'
                          ? 'rgba(26,24,24,0.1)'
                          : 'rgba(232,228,224,0.12)',
                      color:
                        previewTheme === 'light'
                          ? 'rgba(26,24,24,0.7)'
                          : 'rgba(232,228,224,0.7)',
                    }}
                  >
                    <span>{heroDraft.timingNotice || 'Walk-in & Online Assistance'}</span>
                    <span>Scroll to explore ↓</span>
                  </div>
                </div>
              </div>
            </div>
          </CmsSurfaceCard>
        </div>
      )}

      {mode === 'showcase' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <CmsSurfaceCard
            title="Hero Flip-Notebook Services"
            subtitle="Add, reorder, show, or hide service titles cycling in the homepage spiral notebook."
            className="xl:col-span-7"
            headerRight={
              <button
                type="button"
                onClick={handleSaveShowcaseList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Sequence</span>
              </button>
            }
          >
            <div className="flex flex-col sm:flex-row gap-2 pb-4 mb-4 border-b border-white/[0.06]">
              <input
                type="text"
                value={newShowcaseLabel}
                onChange={(e) => setNewShowcaseLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddShowcaseCard();
                  }
                }}
                placeholder="Add new featured service label (e.g., Ayushman Health Cards)..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] focus:border-[#C9A96E]/60 outline-none"
              />
              <button
                type="button"
                onClick={handleAddShowcaseCard}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#211B16] border border-[#C9A96E]/40 text-xs font-medium text-[#DFC492] hover:bg-[#C9A96E]/15 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>

            {showcaseDraft.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/[0.1] bg-[#0A0A0E] p-8 text-center text-xs text-[#85838A]">
                No showcase cards configured yet. Add a service card above to activate the flip-notebook.
              </div>
            ) : (
              <div className="space-y-2 max-h-[520px] overflow-y-auto admin-studio-scroll pr-1">
                {showcaseDraft.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${
                      item.visible
                        ? 'bg-[#101014] border-white/[0.07]'
                        : 'bg-[#0A0A0E] border-white/[0.04] opacity-60'
                    }`}
                  >
                    <span className="w-6 text-center text-[10px] font-mono text-[#85838A] shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShowcaseDraft((prev) =>
                          prev.map((row) =>
                            row.id === item.id ? { ...row, label: val } : row
                          )
                        );
                      }}
                      className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/50 outline-none"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveShowcase(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveShowcase(idx, 1)}
                        disabled={idx === showcaseDraft.length - 1}
                        className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowcaseDraft((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, visible: !row.visible }
                                : row
                            )
                          );
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          item.visible
                            ? 'text-[#C9A96E] hover:bg-[#C9A96E]/10'
                            : 'text-[#85838A] hover:bg-white/[0.05]'
                        }`}
                        title={item.visible ? 'Visible on homepage' : 'Hidden'}
                      >
                        {item.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = showcaseDraft
                            .filter((row) => row.id !== item.id)
                            .map((row, i) => ({ ...row, displayOrder: i + 1 }));
                          setShowcaseDraft(next);
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="Live Spiral Notebook Preview"
            subtitle={`${visibleShowcaseItems.length} active card${visibleShowcaseItems.length === 1 ? '' : 's'} cycling cleanly in the hero.`}
            className="xl:col-span-5"
          >
            <div className="rounded-2xl bg-[#0A0A0E] border border-white/[0.08] p-6 space-y-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#85838A]">
                {heroDraft.subheadline || 'Your one-stop center for'}
              </div>
              <div className="rounded-2xl bg-[#16161B] border border-[#C9A96E]/35 p-6 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E]">
                    AMAN COMPUTER · DIGITAL SEVA
                  </span>
                  <span className="text-[10px] font-mono text-[#85838A]">
                    {visibleShowcaseItems.length > 0
                      ? `${(flipPreviewIndex % visibleShowcaseItems.length) + 1} / ${visibleShowcaseItems.length}`
                      : '0 / 0'}
                  </span>
                </div>
                <div className="min-h-[64px] flex items-center">
                  <span className="font-editorial text-2xl text-[#E8E5DF] leading-snug">
                    {activePreviewCard?.label || 'No visible service cards selected'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#85838A] leading-relaxed">
                Click <span className="text-[#DFC492]">Save Sequence</span> to publish reordering, labels, or visibility changes to the public storefront immediately.
              </p>
            </div>
          </CmsSurfaceCard>
        </div>
      )}

      {mode === 'portrait' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <CmsSurfaceCard
            title="Owner Portrait Configuration"
            subtitle="Upload an official portrait photo or keep this block disabled to show pure editorial typography."
            className="xl:col-span-7"
          >
            <form onSubmit={handleSavePortrait} className="space-y-5">
              <CmsToggle
                checked={portraitDraft.visible}
                onChange={(next) =>
                  setPortraitDraft((prev) => ({ ...prev, visible: next }))
                }
                label="Display Owner Portrait on Homepage Hero"
                description="Turn off to hide the hero portrait container completely. No fallback stock image will ever be shown."
              />

              <CmsMediaField
                label="Portrait Image"
                value={portraitDraft.imageUrl}
                onChange={(nextUrl) =>
                  setPortraitDraft((prev) => ({ ...prev, imageUrl: nextUrl }))
                }
                onRemove={(prevUrl) => {
                  void deleteStorageFileByUrl(prevUrl);
                }}
                bucket="media-library"
                folder="hero-portrait"
                emptyLabel="No owner portrait uploaded — hero portrait remains hidden until an image is uploaded and enabled"
                aspectClass="aspect-[4/3] max-w-md"
                onError={(msg) => showToast('Upload Failed', msg, 'error')}
                helperText="Recommended: clean transparent PNG or vertical portrait photo (max 5 MB)."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Caption Name
                  </label>
                  <input
                    type="text"
                    value={portraitDraft.caption}
                    onChange={(e) =>
                      setPortraitDraft((prev) => ({ ...prev, caption: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                    Subcaption Role
                  </label>
                  <input
                    type="text"
                    value={portraitDraft.subcaption}
                    onChange={(e) =>
                      setPortraitDraft((prev) => ({
                        ...prev,
                        subcaption: e.target.value,
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Accessible Alt Text
                </label>
                <input
                  type="text"
                  value={portraitDraft.altText}
                  onChange={(e) =>
                    setPortraitDraft((prev) => ({ ...prev, altText: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Portrait Settings</span>
                </button>
              </div>
            </form>
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="Public Hero Portrait Preview"
            subtitle="Preview reflects exact storefront behavior."
            className="xl:col-span-5"
          >
            <div className="rounded-2xl bg-[#0A0A0E] border border-white/[0.08] p-6">
              {portraitDraft.visible && portraitDraft.imageUrl ? (
                <div className="space-y-3 text-center">
                  <div className="max-w-[260px] mx-auto rounded-2xl overflow-hidden border border-[#C9A96E]/35 bg-[#141419]">
                    <img
                      src={portraitDraft.imageUrl}
                      alt={portraitDraft.altText || 'Owner portrait preview'}
                      className="w-full h-72 object-cover"
                    />
                  </div>
                  <div className="font-editorial text-xl text-[#E8E5DF]">
                    {portraitDraft.caption || 'Sharique Aman'}
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A96E]">
                    {portraitDraft.subcaption || 'Founder & Proprietor'}
                  </div>
                </div>
              ) : (
                <div className="py-14 px-6 text-center space-y-2.5">
                  <div className="w-11 h-11 mx-auto rounded-xl bg-[#16161B] border border-white/[0.07] flex items-center justify-center text-[#85838A]">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <div className="font-editorial text-lg text-[#E8E5DF]">
                    Hero Portrait Hidden
                  </div>
                  <p className="text-xs text-[#85838A] max-w-xs mx-auto leading-relaxed">
                    {portraitDraft.imageUrl
                      ? 'Portrait visibility is turned off. The homepage will not render this image until enabled.'
                      : 'No portrait uploaded. No placeholder or stock photo will be shown on the live website.'}
                  </p>
                </div>
              )}
            </div>
          </CmsSurfaceCard>
        </div>
      )}
    </div>
  );
};
