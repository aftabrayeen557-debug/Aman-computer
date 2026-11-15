import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Globe, Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { WebsiteSettings } from '../types';
import {
  CmsPageHeader,
  CmsSurfaceCard,
  CmsToggle,
} from '../components/CmsPrimitives';
import { INITIAL_WEBSITE_CONTENT } from '../data/initialData';

export const WebsiteSettingsView: React.FC = () => {
  const { websiteContent, updateWebsiteContent } = useAdmin();

  const defaults: WebsiteSettings = INITIAL_WEBSITE_CONTENT.websiteSettings || {
    maintenanceMode: false,
    maintenanceMessage:
      'Our website is currently undergoing a brief scheduled update. Please reach us directly on WhatsApp (+91 85955 15718) for immediate digital service assistance.',
    announcementEnabled: false,
    announcementText: '',
    whatsappButtonEnabled: true,
    sectionVisibility: {
      hero: true,
      doors: true,
      schemes: true,
      journey: true,
      footer: true,
    },
  };

  const [draft, setDraft] = useState<WebsiteSettings>(
    websiteContent.websiteSettings || defaults
  );

  useEffect(() => {
    if (websiteContent.websiteSettings) {
      setDraft(websiteContent.websiteSettings);
    }
  }, [websiteContent.websiteSettings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent('websiteSettings', {
      ...draft,
      maintenanceMessage: draft.maintenanceMessage.trim(),
      announcementText: draft.announcementText.trim(),
    });
  };

  const toggleSection = (
    key: keyof WebsiteSettings['sectionVisibility'],
    val: boolean
  ) => {
    setDraft((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [key]: val,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="System & Security · Storefront Controls"
        title="Website Settings"
        description="Manage public website availability, maintenance notice, top announcement ribbon, WhatsApp quick button, and section visibility."
      />

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <CmsSurfaceCard
          title="Availability & Floating Controls"
          subtitle="Control visitor-facing banners and quick contact triggers."
          className="xl:col-span-7"
        >
          <div className="space-y-4">
            <CmsToggle
              checked={draft.maintenanceMode}
              onChange={(next) =>
                setDraft((prev) => ({ ...prev, maintenanceMode: next }))
              }
              label="Maintenance Mode Overlay"
              description="Temporarily display a calm maintenance notice on the public website while keeping your owner workspace active."
            />

            {draft.maintenanceMode && (
              <div>
                <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                  Maintenance Message
                </label>
                <textarea
                  rows={3}
                  value={draft.maintenanceMessage}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      maintenanceMessage: e.target.value,
                    }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-amber-500/35 text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none resize-none"
                />
              </div>
            )}

            <CmsToggle
              checked={draft.announcementEnabled}
              onChange={(next) =>
                setDraft((prev) => ({ ...prev, announcementEnabled: next }))
              }
              label="Top Announcement Ribbon"
              description="Show a subtle top notice strip above the navigation bar for exam dates or holiday hours."
            />

            <div>
              <label className="block text-xs font-medium text-[#E8E5DF] mb-1.5">
                Announcement Ribbon Copy
              </label>
              <input
                type="text"
                value={draft.announcementText}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, announcementText: e.target.value }))
                }
                placeholder="e.g., Counter open until 9:00 PM today for SSC & UP Scholarship submissions."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] focus:border-[#C9A96E]/60 outline-none"
              />
            </div>

            <CmsToggle
              checked={draft.whatsappButtonEnabled}
              onChange={(next) =>
                setDraft((prev) => ({ ...prev, whatsappButtonEnabled: next }))
              }
              label="WhatsApp Direct CTA Links"
              description="Allow visitors to launch direct WhatsApp chat inquiries from the storefront."
            />

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Website Settings</span>
              </button>
            </div>
          </div>
        </CmsSurfaceCard>

        <div className="xl:col-span-5 space-y-6">
          <CmsSurfaceCard
            title="Homepage Section Visibility"
            subtitle="Choose which sections visitors see on the landing page."
          >
            <div className="space-y-2.5">
              <CmsToggle
                checked={draft.sectionVisibility.hero}
                onChange={(v) => toggleSection('hero', v)}
                label="Hero Banner & Flip Notebook"
              />
              <CmsToggle
                checked={draft.sectionVisibility.doors}
                onChange={(v) => toggleSection('doors', v)}
                label="Four Interactive Portal Doors"
              />
              <CmsToggle
                checked={draft.sectionVisibility.schemes}
                onChange={(v) => toggleSection('schemes', v)}
                label="Government Schemes Highlights"
              />
              <CmsToggle
                checked={draft.sectionVisibility.journey}
                onChange={(v) => toggleSection('journey', v)}
                label="The Journey Timeline"
              />
              <CmsToggle
                checked={draft.sectionVisibility.footer}
                onChange={(v) => toggleSection('footer', v)}
                label="Footer & Contact Section"
              />
            </div>
          </CmsSurfaceCard>

          <CmsSurfaceCard title="Live Storefront Status">
            <div className="rounded-xl bg-[#0A0A0E] border border-white/[0.07] p-4 flex items-start gap-3">
              {draft.maintenanceMode ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-[#E8E5DF] flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>
                    {draft.maintenanceMode
                      ? 'Maintenance Screen Enabled'
                      : 'Public Website Online'}
                  </span>
                </div>
                <p className="text-[11px] text-[#85838A] leading-relaxed">
                  {draft.maintenanceMode
                    ? draft.maintenanceMessage
                    : 'Visitors can freely browse visible sections and reach out via your published channels.'}
                </p>
              </div>
            </div>
          </CmsSurfaceCard>
        </div>
      </form>
    </div>
  );
};
