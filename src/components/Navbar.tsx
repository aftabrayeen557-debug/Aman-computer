import { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, Clock, MessageCircle, ExternalLink, Shield } from 'lucide-react';
import { NavigationPage } from '../types';
import PullCord from './PullCord';

interface NavbarProps {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  onHireClick: () => void;
}

interface NavItem {
  num: string;
  label: string;
  id: NavigationPage;
  isExternal?: boolean;
  externalUrl?: string;
}

const NAV_ITEMS: NavItem[] = [
  { num: '01', label: 'Home', id: 'home' },
  { num: '02', label: 'Latest Updates', id: 'web-development' },
  { num: '03', label: 'Documents Need', id: 'app-development' },
  { num: '04', label: 'Our Services', id: 'ui-ux' },
  { num: '05', label: 'Gallery', id: 'photography' },
  { num: '06', label: 'Our Journey', id: 'my-story' },
  { 
    num: '07', 
    label: 'Contact & Location', 
    id: 'contact',
    isExternal: true,
    externalUrl: 'https://wa.me/918595515718'
  },
];

const WHATSAPP_URL = 'https://wa.me/918595515718';

export default function Navbar({
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
  onHireClick,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [localTime, setLocalTime] = useState('');
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLocalTime(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Body scroll locking and Escape key handling
  useEffect(() => {
    if (drawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Focus close button on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 80);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setDrawerOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [drawerOpen]);

  const handleNavClick = (item: NavItem) => {
    setDrawerOpen(false);
    if (item.isExternal && item.externalUrl) {
      window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setCurrentPage(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = item.id === 'home' ? '' : item.id;
  };

  const openWhatsApp = () => {
    setDrawerOpen(false);
    window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Top Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#E8E4E0]/90 dark:bg-[#1A1818]/90 backdrop-blur-md border-b border-[#D5CDCA]/80 dark:border-[rgba(196,176,176,0.18)] shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Brand Wordmark */}
          <button
            onClick={() => handleNavClick(NAV_ITEMS[0])}
            aria-label="Aman Computer Home"
            className="group flex items-center gap-2.5 text-base sm:text-lg font-display font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="tracking-wider">AMAN COMPUTER</span>
          </button>

          {/* Desktop Center Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden xl:flex items-center gap-5 text-xs font-medium text-[#1A1818]/80 dark:text-[#E8E4E0]/80">
            {NAV_ITEMS.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.num}
                  onClick={() => handleNavClick(item)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer hover:text-[#1A1818] dark:hover:text-white flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded ${
                    isActive ? 'font-bold text-[#1A1818] dark:text-white underline underline-offset-8 decoration-2 decoration-emerald-500' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">{item.num}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Zone: Time chip, Pull Cord, Hire/WhatsApp CTA, Menu Drawer Trigger */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Local Time Chip */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[11px] font-mono text-neutral-600 dark:text-neutral-300">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>IST {localTime}</span>
            </div>

            {/* Pull Cord Light/Dark mode switcher */}
            <PullCord darkMode={darkMode} onToggle={() => setDarkMode((prev) => !prev)} />

            {/* WhatsApp CTA Button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs font-semibold rounded-full bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] hover:opacity-90 transition-opacity shadow-xs cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp Us</span>
            </a>

            {/* Menu Trigger Button (Transforms hamburger to close icon) */}
            <button
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label={drawerOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              aria-expanded={drawerOpen}
              aria-controls="cinematic-sidebar-drawer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 hover:bg-black/10 dark:hover:bg-white/15 hover:border-black/20 dark:hover:border-white/30 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                <Menu
                  className={`w-4 h-4 transition-all duration-300 transform ${
                    drawerOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                  }`}
                />
                <X
                  className={`w-4 h-4 absolute transition-all duration-300 transform ${
                    drawerOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
                  }`}
                />
              </div>
              <span className="text-xs font-medium tracking-wide uppercase">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop Overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Premium Cinematic Floating Sidebar Drawer */}
      <aside
        id="cinematic-sidebar-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className={`fixed top-3 right-3 bottom-3 w-[min(calc(100vw-24px),390px)] z-50 flex flex-col rounded-3xl bg-[#121111]/95 dark:bg-[#0C0B0B]/95 text-white backdrop-blur-2xl border border-white/12 shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform overflow-hidden ${
          drawerOpen
            ? 'translate-x-0 opacity-100 scale-100'
            : 'translate-x-[110%] opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Subtle Ambient Glow Effect inside Drawer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl"
        />

        {/* Minimal Brand Header */}
        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div>
              <span className="font-display font-bold text-sm tracking-wider text-white">
                AMAN COMPUTER
              </span>
              <span className="block text-[10px] text-white/40 tracking-wider uppercase font-mono">
                Digital Center & Cyber Cafe
              </span>
            </div>
          </div>

          {/* Premium Close Button */}
          <button
            ref={closeBtnRef}
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white/70 hover:text-white transition-all text-xs font-mono tracking-wider cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <span>ESC</span>
            <X className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Staggered Navigation List */}
        <nav
          aria-label="Sidebar Menu"
          className="relative flex-1 px-4 py-4 overflow-y-auto overflow-x-hidden space-y-1 scrollbar-thin scrollbar-thumb-white/10"
        >
          {NAV_ITEMS.map((item, index) => {
            const isActive = currentPage === item.id;
            const delayMs = drawerOpen ? index * 40 + 60 : 0;

            return (
              <button
                key={item.num}
                onClick={() => handleNavClick(item)}
                style={{
                  transitionDelay: `${delayMs}ms`,
                }}
                className={`group w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all duration-300 cursor-pointer transform focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  drawerOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                } ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold border-l-2 border-emerald-400 pl-4 shadow-inner'
                    : 'text-white/75 hover:text-white hover:bg-white/5 hover:translate-x-1'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`text-xs font-mono tracking-wider transition-colors ${
                      isActive
                        ? 'text-emerald-400 font-bold'
                        : 'text-white/35 group-hover:text-emerald-400'
                    }`}
                  >
                    {item.num}
                  </span>
                  <span className="text-base tracking-tight">{item.label}</span>
                </div>

                <div className="flex items-center">
                  {item.isExternal ? (
                    <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-emerald-400 transition-colors" />
                  ) : (
                    <ArrowRight
                      className={`w-4 h-4 transition-all duration-200 ${
                        isActive
                          ? 'text-emerald-400 translate-x-0 opacity-100'
                          : 'text-white/20 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom CTA & Footer Section */}
        <div className="relative p-4 sm:p-5 border-t border-white/8 bg-black/30 shrink-0 space-y-3">
          {/* WhatsApp Direct CTA Card */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setDrawerOpen(false)}
            className="group block p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-emerald-900/30 to-black/40 border border-emerald-500/25 hover:border-emerald-400/50 hover:from-emerald-900/50 transition-all duration-300 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide uppercase">
                <MessageCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>WhatsApp Us</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/70 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Direct Chat
              </span>
            </div>
            <div className="flex items-center justify-between text-white group-hover:text-emerald-300 transition-colors">
              <span className="text-sm sm:text-base font-bold font-mono tracking-wide">
                +91 85955 15718
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Minimal Bottom Info Row */}
          <div className="flex items-center justify-between text-[11px] text-white/40 pt-1 font-mono">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-white/30" />
              <span>IST {localTime}</span>
            </div>
            <a
              href="/admin"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Admin Login</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
