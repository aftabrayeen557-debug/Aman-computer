import React, { useEffect, useState } from 'react';
import { Save, SlidersHorizontal } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { BrandSettings } from '../types';
import {
  CmsMediaField,
  CmsPageHeader,
  CmsSurfaceCard,
} from '../components/CmsPrimitives';
import { deleteStorageFileByUrl } from '../services/storageService';
import { INITIAL_WEBSITE_CONTENT } from '../data/initialData';

export const BrandSettingsView: React.FC = () => {
  const { websiteContent, updateWebsiteContent, showToast } = useAdmin();

  const defaultBrand: BrandSettings = INITIAL_WEBSITE_CONTENT.brandSettings || {
    shopName: 'Aman Computer',
    tagline: 'Cyber Cafe & Digital Center — Your Trust, Our Service.',
    headerBadgeText: 'Authorised Digital Seva Center',
    logoUrl: '/icon-192.png',
    faviconUrl: '/favicon.ico',
    accentColor: '#C9A96E',
    footerBrandWordmark: 'Aman Computer',
  };

  const [draft, setDraft] = useState<BrandSettings>(
    websiteContent.brandSettings || defaultBrand
  );

  useEffect(() => {
    if (websiteContent.brandSettings) {
      setDraft(websiteContent.brandSettings);
    }
  }, [websiteContent.brandSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent('brandSettings', {
      ...draft,
      shopName: draft.shopName.trim() || 'Aman Computer',
      tagline: draft.tagline.trim(),
      headerBadgeText: draft.headerBadgeText.trim(),
      logoUrl: draft.logoUrl.trim(),
      faviconUrl: draft.faviconUrl.trim(),
      accentColor: draft.accentColor.trim() || '#C9A96E',
      footerBrandWordmark: draft.footerBrandWordmark.trim() || 'Aman Computer',
    });
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Owner & Brand · Brand Identity"
        title="Brand Settings"
        description="Configure Aman Computer's display wordmark, header badge, logo, browser favicon, and accent styling across the public website."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <CmsSurfaceCard
          title="Visual Identity & Assets"
          subtitle="Updates apply live to navigation bars, browser tab icon, and footer branding."
          className="xl:col-span-7"
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Shop Display Name
                </label>
                <input
                  type="text"
                  value={draft.shopName}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, shopName: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Header Badge Label
                </label>
                <input
                  type="text"
                  value={draft.headerBadgeText}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      headerBadgeText: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Shop Tagline
              </label>
              <input
                type="text"
                value={draft.tagline}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, tagline: e.target.value }))
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Footer Brand Wordmark
                </label>
                <input
                  type="text"
                  value={draft.footerBrandWordmark}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      footerBrandWordmark: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Brand Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={draft.accentColor || '#C9A96E'}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, accentColor: e.target.value }))
                    }
                    className="h-10 w-12 rounded-xl bg-[#0A0A0E] border border-white/[0.08] cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={draft.accentColor}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, accentColor: e.target.value }))
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-white/[0.06]">
              <CmsMediaField
                label="Brand Logo"
                value={draft.logoUrl}
                onChange={(url) => setDraft((prev) => ({ ...prev, logoUrl: url }))}
                onRemove={(prevUrl) => {
                  if (!prevUrl.startsWith('/')) void deleteStorageFileByUrl(prevUrl);
                }}
                bucket="media-library"
                folder="brand"
                aspectClass="aspect-square max-w-[180px]"
                emptyLabel="No custom logo uploaded"
                onError={(msg) => showToast('Logo Upload Error', msg, 'error')}
              />

              <CmsMediaField
                label="Browser Favicon"
                value={draft.faviconUrl}
                onChange={(url) =>
                  setDraft((prev) => ({ ...prev, faviconUrl: url }))
                }
                onRemove={(prevUrl) => {
                  if (!prevUrl.startsWith('/')) void deleteStorageFileByUrl(prevUrl);
                }}
                bucket="media-library"
                folder="brand"
                aspectClass="aspect-square max-w-[180px]"
                emptyLabel="No custom favicon uploaded"
                onError={(msg) => showToast('Favicon Upload Error', msg, 'error')}
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Brand Settings</span>
              </button>
            </div>
          </form>
        </CmsSurfaceCard>

        <CmsSurfaceCard
          title="Storefront Brand Preview"
          subtitle="Visual check of header lockup and footer signature."
          className="xl:col-span-5"
        >
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#0A0A0E] border border-white/[0.08] p-5 space-y-4">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#85838A]">
                Navbar Header Preview
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-[#141419] border border-white/[0.07] px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  {draft.logoUrl ? (
                    <img
                      src={draft.logoUrl}
                      alt={draft.shopName}
                      className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#211B16] border border-[#C9A96E]/35 flex items-center justify-center text-[#C9A96E] shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-editorial text-lg text-[#E8E5DF] truncate">
                      {draft.shopName || 'Aman Computer'}
                    </div>
                    <div className="text-[10px] font-mono text-[#85838A] truncate">
                      {draft.headerBadgeText}
                    </div>
                  </div>
                </div>
                <span
                  className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                  style={{ backgroundColor: draft.accentColor || '#C9A96E' }}
                  title={`Accent ${draft.accentColor}`}
                />
              </div>
            </div>

            <div className="rounded-2xl bg-[#0A0A0E] border border-white/[0.08] p-5 space-y-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#85838A]">
                Footer Signature Preview
              </div>
              <div className="font-editorial text-2xl text-[#E8E5DF]">
                {draft.footerBrandWordmark || draft.shopName || 'Aman Computer'}
              </div>
              <p className="text-xs text-[#85838A] leading-relaxed">
                {draft.tagline}
              </p>
            </div>
          </div>
        </CmsSurfaceCard>
      </div>
    </div>
  );
};
