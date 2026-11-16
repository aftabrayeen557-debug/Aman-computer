import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Clock,
  MessageCircle,
  Home,
  Bell,
  FileText,
  Layers,
  Image as ImageIcon,
  Compass,
  Landmark,
  MapPin,
} from 'lucide-react';
import { NavigationPage } from '../types';
import PullCord from './PullCord';

interface NavbarProps {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean | ((prev: boolean) => boolean)) => void;
  onHireClick: () => void;
}

interface SidebarNavItem {
  id: string;
  label: string;
  page: NavigationPage;
  sectionId?: string;
  icon: typeof Home;
}

const SIDEBAR_ITEMS: SidebarNavItem[] = [
  { id: 'home', label: 'Home', page: 'home', sectionId: 'home', icon: Home },
  { id: 'updates', label: 'Latest Updates', page: 'web-development', icon: Bell },
  { id: 'documents', label: 'Documents Need', page: 'app-development', icon: FileText },
  { id: 'services', label: 'Our Services', page: 'ui-ux', icon: Layers },
  { id: 'gallery', label: 'Gallery', page: 'photography', icon: ImageIcon },
  { id: 'journey', label: 'Our Journey', page: 'my-story', icon: Compass },
  { id: 'schemes', label: 'Government Schemes', page: 'home', sectionId: 'schemes', icon: Landmark },
  { id: 'contact', label: 'Contact & Location', page: 'contact', sectionId: 'contact-footer', icon: MapPin },
];

const WHATSAPP_URL = 'https://wa.me/918595515718';

function formatKolkataTime(now = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(now);
    let h = '';
    let m = '';
    let ap = '';
    parts.forEach((p) => {
      if (p.type === 'hour') h = p.value;
      if (p.type === 'minute') m = p.value;
      if (p.type === 'dayPeriod') ap = p.value.toLowerCase();
    });
    if (h && m && ap) return `${h}:${m}${ap}`;
  } catch {
    // Fallback below
  }
  const h = now.getHours();
  return `${h % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
}

export default function Navbar({
  currentPage,
  setCurrentPage,
  darkMode,
  setDarkMode,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('home');
  const [scrolled, setScrolled] = useState(false);
  const [localTime, setLocalTime] = useState(() => formatKolkataTime());
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const openBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => setLocalTime(formatKolkataTime(new Date()));
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = setTimeout(() => closeBtnRef.current?.focus(), 60);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        openBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  const handleNavClick = (item: SidebarNavItem) => {
    setActiveId(item.id);
    setDrawerOpen(false);
    if (item.sectionId) {
      const el = document.getElementById(item.sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    setCurrentPage(item.page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = item.page === 'home' ? '' : item.page;
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-[#E8E4E0]/90 dark:bg-[#1A1818]/90 backdrop-blur-md border-b border-[#D5CDCA]/80 dark:border-[rgba(196,176,176,0.18)] shadow-xs'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pl-18 md:pl-22 xl:pl-6 h-20 flex items-center justify-between gap-4">
          <button
            onClick={() => handleNavClick(SIDEBAR_ITEMS[0])}
            aria-label="Aman Computer Home"
            className="flex items-center gap-2.5 text-base sm:text-lg font-display font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded-lg py-1"
          >
            <span className="tracking-wide">Aman Computer</span>
          </button>

          <nav
            aria-label="Main Navigation"
            className="hidden xl:flex items-center gap-5 text-xs font-medium text-[#1A1818]/80 dark:text-[#E8E4E0]/80"
          >
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = activeId === item.id || (item.page !== 'home' && currentPage === item.page);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer hover:text-[#1A1818] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] rounded ${
                    isActive ? 'font-bold text-[#1A1818] dark:text-white underline underline-offset-8 decoration-2 decoration-[#C9A96E]' : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[0.875rem] border border-[#C4B0B0]/45 dark:border-[#C4B0B0]/20 bg-[#F2EEEB]/65 dark:bg-[#221F1F]/70 text-xs font-medium text-[#1A1818]/75 dark:text-[#E8E4E0]/75 whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 opacity-60" />
              <span className="tabular-nums">Local time · {localTime}</span>
            </div>

            <PullCord darkMode={darkMode} onToggle={() => setDarkMode((prev) => !prev)} />
          </div>
        </div>
      </header>

      {/* Translucent Backdrop */}
      <div
        onClick={() => {
          setDrawerOpen(false);
          openBtnRef.current?.focus();
        }}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#1A1818]/25 dark:bg-black/55 backdrop-blur-xs transition-opacity duration-350 ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Translucent Frosted-Glass Floating Rail & Expandable Sidebar */}
      <aside
        id="aman-glass-sidebar"
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen || undefined}
        aria-label="Site navigation"
        className={`fixed z-50 flex flex-col border border-[#C4B0B0]/50 dark:border-[#C4B0B0]/20 bg-gradient-to-b from-[#F6F2EE]/85 to-[#EAE4DF]/72 dark:from-[#282424]/82 dark:to-[#181616]/74 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_18px_44px_-14px_rgba(26,24,24,0.18)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.5)] text-[#1A1818] dark:text-[#E8E4E0] transition-all duration-400 ease-[cubic-bezier(0.215,0.61,0.355,1)] ${
          drawerOpen
            ? 'left-0 md:left-4 top-0 md:top-3.5 bottom-0 md:bottom-3.5 w-[min(86vw,320px)] md:w-[258px] rounded-r-3xl md:rounded-3xl p-4 overflow-y-auto'
            : 'left-3.5 md:left-4 top-3.5 md:top-1/2 md:-translate-y-1/2 w-[46px] h-[46px] md:w-[54px] md:h-auto md:p-2 rounded-[14px] md:rounded-[26px] items-center justify-center md:justify-start gap-1'
        }`}
      >
        {/* Expand trigger (collapsed) */}
        {!drawerOpen && (
          <button
            ref={openBtnRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation sidebar"
            aria-expanded={false}
            aria-controls="aman-glass-sidebar"
            className="group relative w-11 h-11 md:w-9.5 md:h-9.5 rounded-[13px] grid place-items-center text-[#1A1818]/70 dark:text-[#E8E4E0]/70 hover:bg-[#C9A96E]/20 hover:text-[#1A1818] dark:hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-4.5 h-4.5" />
            <span className="hidden md:block pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-[#1A1818] text-[#F3EEEC] text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md">
              Menu
            </span>
          </button>
        )}

        {/* Expanded Header */}
        {drawerOpen && (
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1A1818]/10 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#DEC38F] to-[#C9A96E] text-[#1A1818] text-xs font-extrabold grid place-items-center shadow-xs">
                A
              </span>
              <span className="text-sm font-bold tracking-tight">Aman Computer</span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                openBtnRef.current?.focus();
              }}
              aria-label="Close navigation sidebar"
              className="w-9 h-9 rounded-xl grid place-items-center border border-[#1A1818]/10 dark:border-white/12 bg-[#1A1818]/5 dark:bg-white/5 hover:bg-[#C9A96E]/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {drawerOpen && (
          <div className="text-[11px] uppercase tracking-[0.09em] font-semibold text-[#1A1818]/45 dark:text-[#E8E4E0]/45 px-2.5 pt-1 pb-1.5">
            Navigate
          </div>
        )}

        {!drawerOpen && <div className="hidden md:block h-px w-6 bg-[#1A1818]/10 dark:bg-white/12 my-0.5" />}

        {/* 8 Navigation Items */}
        <nav
          aria-label="Sidebar sections"
          className={`${drawerOpen ? 'flex flex-col gap-1' : 'hidden md:flex md:flex-col md:gap-1'}`}
        >
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeId === item.id || (item.page !== 'home' && currentPage === item.page);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`group relative flex items-center transition-all cursor-pointer ${
                  drawerOpen
                    ? 'w-full min-h-11 px-3 rounded-xl gap-3 justify-start text-left'
                    : 'w-9.5 h-9.5 rounded-[13px] justify-center'
                } ${
                  isActive
                    ? 'bg-gradient-to-br from-[#DEC38F] to-[#C9A96E] text-[#1A1818] font-semibold shadow-sm'
                    : 'text-[#1A1818]/70 dark:text-[#E8E4E0]/70 hover:bg-[#C9A96E]/18 hover:text-[#1A1818] dark:hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" />
                {drawerOpen && <span className="text-[13.5px] whitespace-nowrap">{item.label}</span>}
                {!drawerOpen && (
                  <span className="hidden md:block pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-[#1A1818] text-[#F3EEEC] text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md z-10">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {!drawerOpen && <div className="hidden md:block h-px w-6 bg-[#1A1818]/10 dark:bg-white/12 my-0.5" />}

        {/* Bottom WhatsApp + Live IST Clock */}
        <div
          className={`${
            drawerOpen
              ? 'mt-auto pt-3 border-t border-[#1A1818]/10 dark:border-white/10 flex flex-col gap-2'
              : 'hidden md:flex md:flex-col md:gap-1'
          }`}
        >
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp us at +91 85955 15718"
            className={`group relative flex items-center transition-colors ${
              drawerOpen
                ? 'w-full min-h-12 px-3 py-2.5 rounded-[14px] gap-3 bg-[#16A34A]/10 dark:bg-[#34D399]/12 border border-[#16A34A]/28 dark:border-[#34D399]/28 hover:bg-[#16A34A]/16'
                : 'w-9.5 h-9.5 rounded-[13px] justify-center text-[#15803D] dark:text-[#34D399] hover:bg-[#16A34A]/14'
            }`}
          >
            <MessageCircle className="w-4.5 h-4.5 text-[#15803D] dark:text-[#34D399] shrink-0" />
            {drawerOpen ? (
              <>
                <span className="flex flex-col flex-1 min-w-0 text-left">
                  <span className="text-[10.5px] font-bold tracking-[0.08em] uppercase text-[#15803D] dark:text-[#34D399]">
                    WHATSAPP US
                  </span>
                  <span className="text-[13.5px] font-semibold tabular-nums whitespace-nowrap truncate">
                    +91 85955 15718
                  </span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#15803D] dark:text-[#34D399] shrink-0" />
              </>
            ) : (
              <span className="hidden md:block pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-[#1A1818] text-[#F3EEEC] text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md z-10">
                WhatsApp us · +91 85955 15718
              </span>
            )}
          </a>

          <div
            aria-label="Local time"
            className={`group relative flex items-center ${
              drawerOpen
                ? 'px-2.5 pt-1 text-xs font-medium text-[#1A1818]/65 dark:text-[#E8E4E0]/65 gap-2 tabular-nums'
                : 'w-9.5 h-9.5 rounded-[13px] justify-center text-[#1A1818]/65 dark:text-[#E8E4E0]/65'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {drawerOpen ? (
              <span className="whitespace-nowrap">Local time · {localTime}</span>
            ) : (
              <span className="hidden md:block pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all bg-[#1A1818] text-[#F3EEEC] text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap shadow-md z-10">
                Local time · {localTime}
              </span>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
