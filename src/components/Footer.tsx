import { ArrowUp, ArrowRight } from 'lucide-react';
import { NavigationPage } from '../types';

interface FooterProps {
  onHireClick: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export default function Footer({ onHireClick, onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOurServicesClick = () => {
    const el = document.querySelector('#works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('home');
    }
  };

  const handleAboutClick = () => {
    onNavigate('home');
    setTimeout(() => {
      const el = document.querySelector('#about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] bg-[#E8E4E0] dark:bg-[#1A1818] text-[#1A1818] dark:text-[#E8E4E0] pt-24 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Banner */}
        <div className="max-w-3xl mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
            Aman Computer — Cyber Cafe &amp; Digital Center
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight mb-4 leading-tight">
            Online &amp; Government Services
            <span className="block text-xl sm:text-2xl font-normal text-neutral-600 dark:text-neutral-400 mt-2">
              Customer-focused Digital Assistance
            </span>
          </h2>
          <p className="text-base text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8">
            Comprehensive digital assistance for online forms, government schemes, identity cards, banking, bill payments and official documentation.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://wa.me/918595515718"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] hover:opacity-90 transition-opacity flex items-center gap-2.5 shadow-md cursor-pointer no-underline"
            >
              <span>WhatsApp Us</span>
              <span className="w-5 h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center">
                <ArrowRight className="w-3 h-3" />
              </span>
            </a>

            <button
              onClick={handleOurServicesClick}
              className="px-6 py-3.5 text-xs sm:text-sm font-semibold rounded-full border border-[#B5A8A8] dark:border-[rgba(196,176,176,0.3)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span>Our Services</span>
            </button>
          </div>
        </div>

        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 py-12 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] text-xs font-mono">
          {/* Col 1: OUR SERVICES */}
          <div>
            <div className="font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Our Services
            </div>
            <ul className="space-y-2.5 text-neutral-700 dark:text-neutral-300">
              <li>
                <button
                  onClick={() => onNavigate('web-development')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Latest Updates
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app-development')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Documents Need
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ui-ux')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Our Services
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('photography')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: QUICK LINKS */}
          <div>
            <div className="font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Quick Links
            </div>
            <ul className="space-y-2.5 text-neutral-700 dark:text-neutral-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={handleAboutClick}
                  className="hover:underline cursor-pointer text-left"
                >
                  About Aman Computer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-story')}
                  className="hover:underline cursor-pointer text-left"
                >
                  Our Journey
                </button>
              </li>
              <li>
                <a
                  href="https://wa.me/918595515718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer text-left inline-block"
                >
                  Contact &amp; Location
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/918595515718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline cursor-pointer text-left inline-block"
                >
                  WhatsApp Us
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: BUSINESS INFORMATION */}
          <div>
            <div className="font-bold uppercase tracking-wider text-neutral-400 mb-4">
              Business Information
            </div>
            <ul className="space-y-2.5 text-neutral-700 dark:text-neutral-300">
              <li className="font-bold text-[#1A1818] dark:text-white text-sm">
                Aman Computer
              </li>
              <li>Cyber Cafe &amp; Digital Center</li>
              <li>Online &amp; Government Services</li>
              <li>Customer-focused Digital Assistance</li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline Bar */}
        <div className="pt-8 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
          <div>
            © 2026 Aman Computer. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('privacy-policy')}
              className="hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="opacity-30">|</span>
            <button
              onClick={() => onNavigate('terms-and-conditions')}
              className="hover:underline cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="hover:text-[#1A1818] dark:hover:text-[#E8E4E0] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
