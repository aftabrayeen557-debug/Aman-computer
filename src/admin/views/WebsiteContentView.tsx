import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Save, Eye, Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export const WebsiteContentView: React.FC = () => {
  const { websiteContent, updateWebsiteContent } = useAdmin();
  const [activeSection, setActiveSection] = useState<'hero' | 'about' | 'whyUs' | 'howItWorks' | 'contact' | 'footer'>('hero');

  // Form local states initialized from context
  const [heroForm, setHeroForm] = useState(websiteContent.hero);
  const [aboutForm, setAboutForm] = useState(websiteContent.about);
  const [whyUsForm, setWhyUsForm] = useState(websiteContent.whyChooseUs);
  const [howItWorksForm, setHowItWorksForm] = useState(websiteContent.howItWorks);
  const [contactForm, setContactForm] = useState(websiteContent.contact);
  const [footerForm, setFooterForm] = useState(websiteContent.footer);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveCurrentSection = () => {
    if (activeSection === 'hero') updateWebsiteContent('hero', heroForm);
    else if (activeSection === 'about') updateWebsiteContent('about', aboutForm);
    else if (activeSection === 'whyUs') updateWebsiteContent('whyChooseUs', whyUsForm);
    else if (activeSection === 'howItWorks') updateWebsiteContent('howItWorks', howItWorksForm);
    else if (activeSection === 'contact') updateWebsiteContent('contact', contactForm);
    else if (activeSection === 'footer') updateWebsiteContent('footer', footerForm);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
            Website Content Management System (CMS)
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
            Customize public marketing headlines, announcements, why choose us proofs & contact prompts
          </p>
        </div>

        <button
          onClick={handleSaveCurrentSection}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1818] hover:bg-[#302A2A] dark:bg-[#E8E4E0] dark:hover:bg-white text-[#E8E4E0] dark:text-[#1A1818] font-semibold text-xs shadow-xs transition-colors self-start sm:self-auto"
        >
          {savedSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Saved to Live Site!' : 'Publish Section Changes'}</span>
        </button>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] overflow-x-auto scrollbar-none">
        {(
          [
            { id: 'hero', label: '1. Hero & Announcements' },
            { id: 'about', label: '2. About & Experience' },
            { id: 'whyUs', label: '3. Why Choose Us' },
            { id: 'howItWorks', label: '4. How It Works (3 Steps)' },
            { id: 'contact', label: '5. Contact & Visiting' },
            { id: 'footer', label: '6. Footer & Legal Disclaimer' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] shadow-xs'
                : 'text-[#6B5C5C] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid: Editor Form on Left + Real-time Visual Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form Column */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
            <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] uppercase tracking-wide font-mono">
              Editing: {activeSection.toUpperCase()}
            </h3>
            <span className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">
              Live Preview Synchronized
            </span>
          </div>

          {/* SECTION: HERO */}
          {activeSection === 'hero' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Top Chip Badge
                </label>
                <input
                  type="text"
                  value={heroForm.badge}
                  onChange={(e) => setHeroForm({ ...heroForm, badge: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Main Headline
                </label>
                <textarea
                  rows={2}
                  value={heroForm.headline}
                  onChange={(e) => setHeroForm({ ...heroForm, headline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Subheadline / Value Pitch
                </label>
                <textarea
                  rows={2}
                  value={heroForm.subheadline}
                  onChange={(e) => setHeroForm({ ...heroForm, subheadline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaPrimaryText}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaPrimaryText: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                    Primary Destination Link
                  </label>
                  <input
                    type="text"
                    value={heroForm.ctaPrimaryLink}
                    onChange={(e) => setHeroForm({ ...heroForm, ctaPrimaryLink: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Urgent Notice Ticker (Top Bar)
                </label>
                <input
                  type="text"
                  value={heroForm.announcement}
                  onChange={(e) => setHeroForm({ ...heroForm, announcement: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Store Operating Hours Text
                </label>
                <input
                  type="text"
                  value={heroForm.timingNotice}
                  onChange={(e) => setHeroForm({ ...heroForm, timingNotice: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
            </div>
          )}

          {/* SECTION: ABOUT */}
          {activeSection === 'about' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={aboutForm.heading}
                  onChange={(e) => setAboutForm({ ...aboutForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={aboutForm.subheading}
                  onChange={(e) => setAboutForm({ ...aboutForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Full Story Bio
                </label>
                <textarea
                  rows={4}
                  value={aboutForm.bio}
                  onChange={(e) => setAboutForm({ ...aboutForm, bio: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                    Years Active
                  </label>
                  <input
                    type="text"
                    value={aboutForm.experienceYears}
                    onChange={(e) => setAboutForm({ ...aboutForm, experienceYears: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs font-mono font-bold text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                    Clients Served
                  </label>
                  <input
                    type="text"
                    value={aboutForm.customersServed}
                    onChange={(e) => setAboutForm({ ...aboutForm, customersServed: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs font-mono font-bold text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                    Success Rate
                  </label>
                  <input
                    type="text"
                    value={aboutForm.successRate}
                    onChange={(e) => setAboutForm({ ...aboutForm, successRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs font-mono font-bold text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION: WHY CHOOSE US */}
          {activeSection === 'whyUs' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={whyUsForm.heading}
                  onChange={(e) => setWhyUsForm({ ...whyUsForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={whyUsForm.subheading}
                  onChange={(e) => setWhyUsForm({ ...whyUsForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block">
                  Trust Pillars (4 Core Points)
                </span>
                {whyUsForm.points.map((pt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] space-y-1.5">
                    <input
                      type="text"
                      value={pt.title}
                      onChange={(e) => {
                        const newPts = [...whyUsForm.points];
                        newPts[idx].title = e.target.value;
                        setWhyUsForm({ ...whyUsForm, points: newPts });
                      }}
                      className="w-full p-1.5 rounded-lg bg-transparent font-bold text-xs text-[#1A1818] dark:text-[#E8E4E0]"
                    />
                    <textarea
                      rows={2}
                      value={pt.desc}
                      onChange={(e) => {
                        const newPts = [...whyUsForm.points];
                        newPts[idx].desc = e.target.value;
                        setWhyUsForm({ ...whyUsForm, points: newPts });
                      }}
                      className="w-full p-1.5 rounded-lg bg-transparent text-xs text-[#857878] dark:text-[#B5A8A8]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: HOW IT WORKS */}
          {activeSection === 'howItWorks' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Section Heading
                </label>
                <input
                  type="text"
                  value={howItWorksForm.heading}
                  onChange={(e) => setHowItWorksForm({ ...howItWorksForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>

              <div className="space-y-2 pt-2">
                {howItWorksForm.steps.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-[rgba(196,176,176,0.2)] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#6B5C5C] dark:text-[#C4B0B0]">
                        Step {st.stepNumber}
                      </span>
                      <input
                        type="text"
                        value={st.title}
                        onChange={(e) => {
                          const newSteps = [...howItWorksForm.steps];
                          newSteps[idx].title = e.target.value;
                          setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                        }}
                        className="flex-1 p-1 rounded-lg bg-transparent font-bold text-xs text-[#1A1818] dark:text-[#E8E4E0]"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={st.desc}
                      onChange={(e) => {
                        const newSteps = [...howItWorksForm.steps];
                        newSteps[idx].desc = e.target.value;
                        setHowItWorksForm({ ...howItWorksForm, steps: newSteps });
                      }}
                      className="w-full p-1 rounded-lg bg-transparent text-xs text-[#857878] dark:text-[#B5A8A8]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: CONTACT */}
          {activeSection === 'contact' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Contact Heading
                </label>
                <input
                  type="text"
                  value={contactForm.heading}
                  onChange={(e) => setContactForm({ ...contactForm, heading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Subheading
                </label>
                <input
                  type="text"
                  value={contactForm.subheading}
                  onChange={(e) => setContactForm({ ...contactForm, subheading: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  WhatsApp Direct Prompt
                </label>
                <input
                  type="text"
                  value={contactForm.whatsappPrompt}
                  onChange={(e) => setContactForm({ ...contactForm, whatsappPrompt: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
            </div>
          )}

          {/* SECTION: FOOTER */}
          {activeSection === 'footer' && (
            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={footerForm.tagline}
                  onChange={(e) => setFooterForm({ ...footerForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={footerForm.copyrightText}
                  onChange={(e) => setFooterForm({ ...footerForm, copyrightText: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] block mb-1">
                  Legal Statutory Disclaimer
                </label>
                <textarea
                  rows={3}
                  value={footerForm.disclaimer}
                  onChange={(e) => setFooterForm({ ...footerForm, disclaimer: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-white/70 dark:bg-black/30 border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs text-[#1A1818] dark:text-[#E8E4E0] outline-hidden"
                />
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.18)] shadow-lg sticky top-20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Real-Time Public Preview</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-4 rounded-2xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.25)] space-y-3">
            <div className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]">
              {heroForm.badge}
            </div>
            <h2 className="text-base font-bold text-[#1A1818] dark:text-[#E8E4E0] leading-snug">
              {heroForm.headline}
            </h2>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] leading-relaxed">
              {heroForm.subheadline}
            </p>

            <div className="pt-2 flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                {heroForm.ctaPrimaryText}
              </span>
              <span className="px-3 py-1.5 rounded-xl border border-[rgba(196,176,176,0.4)] text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
                {heroForm.ctaSecondaryText}
              </span>
            </div>

            <div className="pt-2 text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8] border-t border-[rgba(196,176,176,0.2)]">
              📢 {heroForm.announcement}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] text-[#857878] dark:text-[#B5A8A8] font-mono">
            {footerForm.tagline}
          </div>
        </div>
      </div>
    </div>
  );
};
