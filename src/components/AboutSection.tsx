import { ABOUT_DETAILS, HERO_IMAGE } from '../data/portfolioData';
import { GraduationCap, MapPin, Globe, Award, Sparkles, Check } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 md:py-32 scroll-mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Portrait & Quick Stats */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-lg mb-8">
              <div className="aspect-4/4 overflow-hidden">
                <img
                  src={HERO_IMAGE}
                  alt="Rishi Thakor portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter saturate-[0.95]"
                />
              </div>
              <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-1">
                  {ABOUT_DETAILS.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                  {ABOUT_DETAILS.title}
                </p>

                <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{ABOUT_DETAILS.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Timezone: {ABOUT_DETAILS.timezone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
                    <span>CSC & Digital Seva Certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Education Callout Box */}
            <div className="p-6 rounded-2xl bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80">
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>Authorized Center</span>
              </div>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Authorized digital facilitator for government citizen services, online registration systems, banking facilitation, and document processing.
              </p>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Skills Matrix */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2">
                My Story & Philosophy
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-8">
                Bridging Design Sensibility with Robust Engineering
              </h2>

              <div className="space-y-5 text-neutral-600 dark:text-neutral-300 text-base leading-relaxed mb-12">
                {ABOUT_DETAILS.bioParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Technical & Design Skill Sets */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-6">
                Toolkit & Technical Proficiencies
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ABOUT_DETAILS.skills.map((skillGroup) => (
                  <div
                    key={skillGroup.category}
                    className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800"
                  >
                    <div className="text-sm font-semibold text-neutral-950 dark:text-neutral-100 mb-3 font-display">
                      {skillGroup.category}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGroup.items.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-md"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
