import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Camera,
  Eye,
  EyeOff,
  Plus,
  Save,
  Sparkles,
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

interface HeroManagerViewProps {
  mode: 'headline' | 'showcase' | 'portrait';
}

export const HeroManagerView: React.FC<HeroManagerViewProps> = ({ mode }) => {
  const { websiteContent, updateWebsiteContent, setCurrentTab, showToast } =
    useAdmin();

  const [heroDraft, setHeroDraft] = useState<WebsiteSectionContent['hero']>(
    websiteContent.hero
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

  useEffect(() => {
    setHeroDraft(websiteContent.hero);
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

  const handleSaveHeadline = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent('hero', {
      ...heroDraft,
      badge: heroDraft.badge.trim(),
      headline: heroDraft.headline.trim(),
      subheadline: heroDraft.subheadline.trim(),
      ctaPrimaryText: heroDraft.ctaPrimaryText.trim(),
      ctaPrimaryLink: heroDraft.ctaPrimaryLink.trim(),
      ctaSecondaryText: heroDraft.ctaSecondaryText.trim(),
      ctaSecondaryLink: heroDraft.ctaSecondaryLink.trim(),
      announcement: heroDraft.announcement.trim(),
      timingNotice: heroDraft.timingNotice.trim(),
    });
  };

  const handleAddShowcaseCard = () => {
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
    updateWebsiteContent('heroShowcase', nextList);
  };

  const handleSaveShowcaseList = () => {
    const normalized = showcaseDraft
      .map((item, idx) => ({
        ...item,
        label: item.label.trim(),
        displayOrder: idx + 1,
      }))
      .filter((item) => item.label.length > 0);
    setShowcaseDraft(normalized);
    updateWebsiteContent('heroShowcase', normalized);
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

  const handleSavePortrait = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateWebsiteContent('ownerPortrait', {
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
            ? 'Customize the primary hero headline, subheadline, buttons, and daily center timings shown above the fold.'
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <CmsSurfaceCard
            title="Hero Editorial Copy & Links"
            subtitle="Changes update the homepage hero headline and primary action links."
            className="xl:col-span-7"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                    placeholder="Open Mon–Sat: 8:00 AM – 9:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={heroDraft.headline}
                  onChange={(e) =>
                    setHeroDraft((prev) => ({ ...prev, headline: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-sm font-editorial text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  placeholder="Welcome to Aman Computer."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Subheadline Prefix (Shown Above Flip-Notebook)
                </label>
                <input
                  type="text"
                  value={heroDraft.subheadline}
                  onChange={(e) =>
                    setHeroDraft((prev) => ({ ...prev, subheadline: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  placeholder="Your one-stop center for"
                />
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

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Hero Headline</span>
                </button>
              </div>
            </form>
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="Live Hero Preview"
            subtitle="Reflects how the top banner reads on desktop and mobile."
            className="xl:col-span-5"
          >
            <div className="rounded-2xl bg-[#0A0A0E] border border-white/[0.08] p-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#211B16] border border-[#C9A96E]/35 text-[10px] font-mono uppercase tracking-[0.18em] text-[#C9A96E]">
                {heroDraft.badge || 'CYBER CAFE & DIGITAL CENTER'}
              </div>
              <h2 className="font-editorial text-3xl text-[#E8E5DF] leading-tight">
                {heroDraft.headline || 'Welcome to Aman Computer.'}
              </h2>
              <p className="text-sm text-[#85838A]">
                {heroDraft.subheadline || 'Your one-stop center for'}{' '}
                <span className="text-[#DFC492] font-medium">
                  {activePreviewCard?.label || 'Online Job Forms & Digital Seva'}
                </span>
              </p>
              {heroDraft.announcement && (
                <div className="rounded-xl bg-[#141419] border border-white/[0.06] px-3.5 py-2.5 text-xs text-[#E8E5DF]/85 leading-relaxed">
                  {heroDraft.announcement}
                </div>
              )}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="px-4 py-2 rounded-xl bg-[#C9A96E] text-[#0A0A0E] text-xs font-semibold">
                  {heroDraft.ctaPrimaryText || 'WhatsApp Us'}
                </span>
                <span className="px-4 py-2 rounded-xl bg-[#16161B] border border-white/[0.08] text-[#E8E5DF] text-xs font-medium">
                  {heroDraft.ctaSecondaryText || 'Explore Services'}
                </span>
              </div>
              <div className="pt-3 border-t border-white/[0.06] text-[11px] font-mono text-[#85838A]">
                {heroDraft.timingNotice}
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
