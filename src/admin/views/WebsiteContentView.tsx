import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, Save } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';

type ContentSectionKey = 'about' | 'whyUs' | 'howItWorks' | 'contact' | 'footer';

export const WebsiteContentView: React.FC<{
  focusedSection?: 'about' | 'contact' | 'footer';
}> = ({ focusedSection }) => {
  const { websiteContent, updateWebsiteContent } = useAdmin();
  const [activeSection, setActiveSection] = useState<ContentSectionKey>(
    focusedSection || 'about'
  );

  const [aboutForm, setAboutForm] = useState(websiteContent.about);
  const [whyUsForm, setWhyUsForm] = useState(websiteContent.whyChooseUs);
  const [howItWorksForm, setHowItWorksForm] = useState(websiteContent.howItWorks);
  const [contactForm, setContactForm] = useState(websiteContent.contact);
  const [footerForm, setFooterForm] = useState(websiteContent.footer);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (focusedSection) {
      setActiveSection(focusedSection);
    }
  }, [focusedSection]);

  useEffect(() => {
    setAboutForm(websiteContent.about);
    setWhyUsForm(websiteContent.whyChooseUs);
    setHowItWorksForm(websiteContent.howItWorks);
    setContactForm(websiteContent.contact);
    setFooterForm(websiteContent.footer);
  }, [websiteContent]);

  const handleSaveCurrentSection = () => {
    if (activeSection === 'about') updateWebsiteContent('about', aboutForm);
    else if (activeSection === 'whyUs') updateWebsiteContent('whyChooseUs', whyUsForm);
    else if (activeSection === 'howItWorks') updateWebsiteContent('howItWorks', howItWorksForm);
    else if (activeSection === 'contact') updateWebsiteContent('contact', contactForm);
    else if (activeSection === 'footer') updateWebsiteContent('footer', footerForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const tabs: Array<{ id: ContentSectionKey; label: string }> = [
    { id: 'about', label: 'About Section' },
    { id: 'whyUs', label: 'Why Choose Us' },
    { id: 'howItWorks', label: 'How It Works' },
    { id: 'contact', label: 'Contact Section' },
    { id: 'footer', label: 'Footer Content' },
  ];

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="Website Copy & Sections"
        title="Website Content Editor"
        description="Customize your About story, trust pillars, step-by-step center process, customer contact prompts, and legal footer disclaimers."
        actions={
          <button
            type="button"
            onClick={handleSaveCurrentSection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] font-semibold text-xs transition-colors cursor-pointer"
          >
            {savedSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-900" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{savedSuccess ? 'Published Live' : 'Publish Section'}</span>
          </button>
        }
      />

      {/* Section Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#141419] border border-white/[0.07] overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeSection === tab.id
                ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                : 'text-[#85838A] hover:text-[#E8E5DF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <CmsSurfaceCard
          className="lg:col-span-7 space-y-4"
          title={`Editing: ${tabs.find((t) => t.id === activeSection)?.label || ''}`}
          headerRight={
            <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Live Sync Ready
            </span>
          }
        >
          {activeSection === 'about' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={aboutForm.heading}
                  onChange={(e) => setAboutForm({ ...aboutForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Subheading
                </label>
                <input
                  type="text"
                  value={aboutForm.subheading}
                  onChange={(e) => setAboutForm({ ...aboutForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Full Center Story
                </label>
                <textarea
                  rows={4}
                  value={aboutForm.bio}
                  onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                    Years Active
                  </label>
                  <input
                    type="text"
                    value={aboutForm.experienceYears}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, experienceYears: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#C9A96E] outline-none focus:border-[#C9A96E]/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                    Clients Served
                  </label>
                  <input
                    type="text"
                    value={aboutForm.customersServed}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, customersServed: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#C9A96E] outline-none focus:border-[#C9A96E]/60"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                    Success Rate
                  </label>
                  <input
                    type="text"
                    value={aboutForm.successRate}
                    onChange={(e) =>
                      setAboutForm({ ...aboutForm, successRate: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#C9A96E] outline-none focus:border-[#C9A96E]/60"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'whyUs' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={whyUsForm.heading}
                  onChange={(e) => setWhyUsForm({ ...whyUsForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Subheading
                </label>
                <input
                  type="text"
                  value={whyUsForm.subheading}
                  onChange={(e) => setWhyUsForm({ ...whyUsForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-medium text-[#E8E5DF] block">
                  Trust Pillars
                </span>
                {whyUsForm.points.map((pt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#101014] border border-white/[0.07] space-y-2"
                  >
                    <input
                      type="text"
                      value={pt.title}
                      onChange={(e) => {
                        const newPts = [...whyUsForm.points];
                        newPts[idx] = { ...newPts[idx], title: e.target.value };
                        setWhyUsForm({ ...whyUsForm, points: newPts });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] font-semibold text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                    />
                    <textarea
                      rows={2}
                      value={pt.desc}
                      onChange={(e) => {
                        const newPts = [...whyUsForm.points];
                        newPts[idx] = { ...newPts[idx], desc: e.target.value };
                        setWhyUsForm({ ...whyUsForm, points: newPts });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] text-xs text-[#85838A] outline-none focus:border-[#C9A96E]/60"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'howItWorks' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={howItWorksForm.heading}
                  onChange={(e) =>
                    setHowItWorksForm({ ...howItWorksForm, heading: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-semibold"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                {howItWorksForm.steps.map((st, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#101014] border border-white/[0.07] space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold text-[#C9A96E] shrink-0">
                        Step {st.stepNumber}
                      </span>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const newSteps = [...howItWorksForm.steps];
                          newSteps[idx] = { ...newSteps[idx], title: e.target.value };
                          setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                        }}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] font-semibold text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={st.desc}
                      onChange={(e) => {
                        const newSteps = [...howItWorksForm.steps];
                        newSteps[idx] = { ...newSteps[idx], desc: e.target.value };
                        setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0A0A0E] border border-white/[0.06] text-xs text-[#85838A] outline-none focus:border-[#C9A96E]/60"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Contact Heading
                </label>
                <input
                  type="text"
                  value={contactForm.heading}
                  onChange={(e) => setContactForm({ ...contactForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Subheading
                </label>
                <input
                  type="text"
                  value={contactForm.subheading}
                  onChange={(e) => setContactForm({ ...contactForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Phone Call Prompt
                </label>
                <input
                  type="text"
                  value={contactForm.phonePrompt}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phonePrompt: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  WhatsApp Direct Prompt
                </label>
                <input
                  type="text"
                  value={contactForm.whatsappPrompt}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, whatsappPrompt: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Walk-In Visiting Prompt
                </label>
                <input
                  type="text"
                  value={contactForm.visitingPrompt}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, visitingPrompt: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={footerForm.tagline}
                  onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerForm.copyrightText}
                  onChange={(e) =>
                    setFooterForm({ ...footerForm, copyrightText: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#E8E5DF] block mb-1.5">
                  Legal Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={footerForm.disclaimer}
                  onChange={(e) => setFooterForm({ ...footerForm, disclaimer: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] outline-none focus:border-[#C9A96E]/60 leading-relaxed"
                />
              </div>
            </div>
          )}
        </CmsSurfaceCard>

        {/* Preview Column */}
        <CmsSurfaceCard
          className="lg:col-span-5 sticky top-20 space-y-4"
          title="Real-Time Public Preview"
          headerRight={
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <Eye className="w-3.5 h-3.5" />
              <span>Synchronized</span>
            </span>
          }
        >
          {activeSection === 'about' && (
            <div className="p-4 rounded-xl bg-[#0A0A0E] border border-white/[0.07] space-y-3">
              <div className="font-editorial text-xl text-[#E8E5DF]">{aboutForm.heading}</div>
              <div className="text-xs text-[#DFC492]">{aboutForm.subheading}</div>
              <p className="text-xs text-[#85838A] leading-relaxed">{aboutForm.bio}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                <div>
                  <div className="font-mono text-sm text-[#C9A96E]">{aboutForm.experienceYears}</div>
                  <div className="text-[10px] text-[#85838A]">Years</div>
                </div>
                <div>
                  <div className="font-mono text-sm text-[#C9A96E]">{aboutForm.customersServed}</div>
                  <div className="text-[10px] text-[#85838A]">Clients</div>
                </div>
                <div>
                  <div className="font-mono text-sm text-[#C9A96E]">{aboutForm.successRate}</div>
                  <div className="text-[10px] text-[#85838A]">Accuracy</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'whyUs' && (
            <div className="p-4 rounded-xl bg-[#0A0A0E] border border-white/[0.07] space-y-3">
              <div className="font-editorial text-xl text-[#E8E5DF]">{whyUsForm.heading}</div>
              <div className="text-xs text-[#85838A]">{whyUsForm.subheading}</div>
              <div className="space-y-2">
                {whyUsForm.points.map((pt, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#141419] border border-white/[0.06]">
                    <div className="text-xs font-medium text-[#E8E5DF]">{pt.title}</div>
                    <div className="text-[11px] text-[#85838A] mt-0.5">{pt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'howItWorks' && (
            <div className="p-4 rounded-xl bg-[#0A0A0E] border border-white/[0.07] space-y-3">
              <div className="font-editorial text-xl text-[#E8E5DF]">{howItWorksForm.heading}</div>
              <div className="space-y-2">
                {howItWorksForm.steps.map((st, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-[#141419] border border-white/[0.06]">
                    <div className="text-xs font-medium text-[#DFC492]">
                      Step {st.stepNumber} — {st.title}
                    </div>
                    <div className="text-[11px] text-[#85838A] mt-0.5">{st.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="p-4 rounded-xl bg-[#0A0A0E] border border-white/[0.07] space-y-2.5">
              <div className="font-editorial text-xl text-[#E8E5DF]">{contactForm.heading}</div>
              <div className="text-xs text-[#85838A]">{contactForm.subheading}</div>
              <div className="pt-2 space-y-1.5 text-[11px] text-[#E8E5DF]/80">
                <div>Phone: {contactForm.phonePrompt}</div>
                <div>WhatsApp: {contactForm.whatsappPrompt}</div>
                <div>Visiting: {contactForm.visitingPrompt}</div>
              </div>
            </div>
          )}

          {activeSection === 'footer' && (
            <div className="p-4 rounded-xl bg-[#0A0A0E] border border-white/[0.07] space-y-2.5">
              <div className="font-editorial text-lg text-[#E8E5DF]">{footerForm.tagline}</div>
              <div className="text-[11px] font-mono text-[#C9A96E]">{footerForm.copyrightText}</div>
              <p className="text-[11px] text-[#85838A] leading-relaxed">
                {footerForm.disclaimer}
              </p>
            </div>
          )}
        </CmsSurfaceCard>
      </div>
    </div>
  );
};
