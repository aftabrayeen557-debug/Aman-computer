import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SKILL_DOORS } from '../data/portfolioData';
import { NavigationPage } from '../types';

interface SkillDoorsSectionProps {
  onOpenDoor: (page: NavigationPage) => void;
}

export default function SkillDoorsSection({ onOpenDoor }: SkillDoorsSectionProps) {
  const [hoveredDoor, setHoveredDoor] = useState<NavigationPage | null>(null);

  return (
    <section id="doors" className="py-24 md:py-32 scroll-mt-12 bg-neutral-100/40 dark:bg-neutral-900/30 border-y border-neutral-200/80 dark:border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
            <span>Interactive Portfolio Doors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            My work, one door per skill.
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 italic">
            "Magic happens behind the doors. Swipe along the wall."
          </p>
        </div>

        {/* The 5 Doors Wall */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {SKILL_DOORS.map((door) => {
            const isHovered = hoveredDoor === door.id;

            return (
              <div
                key={door.id}
                onMouseEnter={() => setHoveredDoor(door.id)}
                onMouseLeave={() => setHoveredDoor(null)}
                onClick={() => onOpenDoor(door.id)}
                className="group relative rounded-3xl overflow-hidden border border-neutral-300/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[460px] transform hover:-translate-y-1.5"
              >
                {/* Door Frame Inner Background */}
                <div className="relative h-56 overflow-hidden bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
                  <img
                    src={door.image}
                    alt={door.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover filter saturate-[0.9] group-hover:scale-106 transition-transform duration-700 ease-out"
                  />
                  
                  {/* Subtle Door Number Stamped on Top */}
                  <div className="absolute top-4 left-4 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-neutral-900/80 dark:bg-black/80 backdrop-blur-md text-white border border-white/10">
                    DOOR {door.number}
                  </div>

                  {/* Door Handle Graphic (Architectural brass door handle feel) */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-12 rounded-full bg-neutral-300/80 dark:bg-neutral-700/80 border border-neutral-400 dark:border-neutral-600 shadow-xs flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-400" />
                  </div>
                </div>

                {/* Door Body Information */}
                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    <div className="text-xs font-mono text-neutral-400 dark:text-neutral-500 mb-1">
                      {door.projectCount}
                    </div>
                    <h3 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-2 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                      {door.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed mb-4">
                      {door.tagline}
                    </p>
                  </div>

                  <div>
                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1 mb-5">
                      {door.skills.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Open Door Action Button */}
                    <button
                      type="button"
                      className="w-full py-2.5 px-3.5 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 group-hover:bg-neutral-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-950 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>Open Door</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
