import React, { useEffect, useState } from 'react';
import { Globe, Save, SearchCheck } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { SeoSettings } from '../types';
import {
  CmsMediaField,
  CmsPageHeader,
  CmsSurfaceCard,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';
import { INITIAL_WEBSITE_CONTENT } from '../data/initialData';

export const SeoManagerView: React.FC = () => {
  const { websiteContent, updateWebsiteContent, showToast } = useAdmin();

  const defaults: SeoSettings = INITIAL_WEBSITE_CONTENT.seoSettings || {
    pageTitle: 'Aman Computer — Cyber Cafe & Digital Center, Varanasi',
    metaDescription:
      'Authorized digital seva, online government forms, PAN & Aadhaar facilitation, AEPS banking, ticket booking, and commercial printing at Aman Computer, Varanasi.',
    keywords:
      'Aman Computer, Cyber Cafe Varanasi, Digital Seva Kendra, PAN Card Center, Aadhaar Update, Online Exam Forms, CSC Center',
    ogImageUrl: '/og.jpg',
    canonicalUrl: '',
  };

  const [draft, setDraft] = useState<SeoSettings>(
    websiteContent.seoSettings || defaults
  );

  useEffect(() => {
    if (websiteContent.seoSettings) {
      setDraft(websiteContent.seoSettings);
    }
  }, [websiteContent.seoSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent('seoSettings', {
      pageTitle: draft.pageTitle.trim() || defaults.pageTitle,
      metaDescription: draft.metaDescription.trim(),
      keywords: draft.keywords.trim(),
      ogImageUrl: draft.ogImageUrl.trim(),
      canonicalUrl: draft.canonicalUrl.trim(),
    });
  };

  const descriptionLength = draft.metaDescription.length;

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="System & Security · Search Visibility"
        title="SEO Manager"
        description="Manage search engine titles, social preview descriptions, keywords, canonical URLs, and OpenGraph sharing imagery."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <CmsSurfaceCard
          title="Search & Social Metadata"
          subtitle="Applied dynamically to public website metadata headers."
          className="xl:col-span-7"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Page Title (&lt;title&gt;)
              </label>
              <input
                type="text"
                value={draft.pageTitle}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, pageTitle: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#E8E5DF]">
                  Meta Description
                </label>
                <span
                  className={`text-[10px] font-mono ${
                    descriptionLength > 160 ? 'text-amber-400' : 'text-[#85838A]'
                  }`}
                >
                  {descriptionLength} / 160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={draft.metaDescription}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    metaDescription: e.target.value,
                  }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={draft.keywords}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, keywords: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Canonical URL (Optional)
              </label>
              <input
                type="url"
                value={draft.canonicalUrl}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, canonicalUrl: e.target.value }))
                }
                placeholder="https://your-domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <CmsMediaField
              label="Social Share Image (OpenGraph)"
              value={draft.ogImageUrl}
              onChange={(url) => setDraft((prev) => ({ ...prev, ogImageUrl: url }))}
              onRemove={(prevUrl) => {
                if (!prevUrl.startsWith('/')) void deleteStorageFileByUrl(prevUrl);
              }}
              bucket="media-library"
              folder="seo"
              aspectClass="aspect-[1200/630] max-w-md"
              emptyLabel="No share preview image configured"
              onError={(msg) => showToast('SEO Image Error', msg, 'error')}
              helperText="Recommended aspect ratio: 1200 x 630 px for WhatsApp and Google previews."
            />

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save SEO Metadata</span>
              </button>
            </div>
          </form>
        </CmsSurfaceCard>

        <div className="xl:col-span-5 space-y-6">
          <CmsSurfaceCard
            title="Search Result Preview"
            subtitle="Approximate appearance on Google Search."
          >
            <div className="rounded-xl bg-[#0A0A0E] border border-white/[0.07] p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-[#85838A]">
                <Globe className="w-3.5 h-3.5 text-[#C9A96E]" />
                <span className="truncate font-mono">
                  {draft.canonicalUrl || 'amancomputer.in'}
                </span>
              </div>
              <div className="text-base font-medium text-[#A9D6FF] leading-snug">
                {draft.pageTitle || defaults.pageTitle}
              </div>
              <p className="text-xs text-[#85838A] leading-relaxed line-clamp-3">
                {draft.metaDescription || defaults.metaDescription}
              </p>
            </div>
          </CmsSurfaceCard>

          <CmsSurfaceCard
            title="WhatsApp & Social Card"
            subtitle="Preview when links are shared in messages."
          >
            <div className="rounded-xl bg-[#0A0A0E] border border-white/[0.07] overflow-hidden">
              {draft.ogImageUrl ? (
                <img
                  src={draft.ogImageUrl}
                  alt="Social share preview"
                  className="w-full aspect-[1200/630] object-cover border-b border-white/[0.06]"
                />
              ) : (
                <div className="aspect-[1200/630] bg-[#16161B] flex items-center justify-center text-[#85838A]">
                  <SearchCheck className="w-7 h-7 text-[#C9A96E]/60" />
                </div>
              )}
              <div className="p-4 space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E]">
                  AMAN COMPUTER
                </div>
                <div className="text-sm font-medium text-[#E8E5DF] line-clamp-1">
                  {draft.pageTitle || defaults.pageTitle}
                </div>
                <div className="text-xs text-[#85838A] line-clamp-2">
                  {draft.metaDescription}
                </div>
              </div>
            </div>
          </CmsSurfaceCard>
        </div>
      </div>
    </div>
  );
};
