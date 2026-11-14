import { ArrowRight, Sparkles, ArrowDown } from 'lucide-react';
import { HERO_IMAGE } from '../data/portfolioData';
import FlipCalendar from './FlipCalendar';

interface HeroProps {
  onHireClick: () => void;
  onExploreWork: () => void;
  onAbilityCardClick: () => void;
}

export default function Hero({ onHireClick, onExploreWork, onAbilityCardClick }: HeroProps) {
  return (
    <section id="home" className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
          {/* Left Column: Typographic Greeting + Flip Calendar */}
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            {/* Eyebrow */}
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-4">
              CYBER CAFE & DIGITAL CENTER
            </p>

            {/* Headline with Flip Calendar */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] leading-[1.08] mb-8">
              <span className="block">Welcome to Aman Computer.</span>
              <span className="block text-neutral-500 dark:text-neutral-400 font-medium">Your one-stop center for</span>
              <FlipCalendar />
            </h1>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {/* WhatsApp Us Pill */}
              <a
                href="https://wa.me/918595515718"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] hover:opacity-90 transition-opacity flex items-center gap-2.5 shadow-md cursor-pointer"
              >
                <span>WhatsApp Us</span>
                <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </a>

              {/* Explore Services Outline Pill */}
              <button
                onClick={onExploreWork}
                className="px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full border border-[#B5A8A8] dark:border-[rgba(196,176,176,0.3)] text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span>Explore Services</span>
              </button>
            </div>
          </div>

          {/* Right Column: Portrait Cutout + Ability Card Trigger */}
          <div className="lg:col-span-5 relative flex flex-col items-center lg:items-end">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Cut-out Portrait Container */}
              <div className="relative aspect-4/5 rounded-3xl overflow-hidden border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)] bg-[#DED8D4] dark:bg-[#252121] shadow-2xl">
                <img
                  src={HERO_IMAGE}
                  alt="Rishi Thakor"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-102"
                />

                {/* Subtle bottom shadow vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Holographic Ability Card Button */}
                <button
                  onClick={onAbilityCardClick}
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#1A1818]/90 dark:bg-[#E8E4E0]/95 backdrop-blur-md text-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide border border-white/20 shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                  <span>My ability card</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Hairline Bar (Exact from therishithakor.com) */}
        <div className="mt-16 pt-5 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)] flex flex-wrap items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[#1A1818] dark:text-[#E8E4E0]">Available for work</span>
          </div>

          <div>
            <span>Remote-first, worldwide · Replies within 5 hours</span>
          </div>

          <button
            onClick={onExploreWork}
            className="flex items-center gap-1.5 hover:text-[#1A1818] dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Scroll to explore</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
