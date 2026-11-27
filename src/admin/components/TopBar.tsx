import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Clock,
  ExternalLink,
  Globe,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquareText,
  Moon,
  Newspaper,
  Search,
  SearchCheck,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getNavItemForTab, resolveStudioTab } from '../config/navigation';
import {
  calculateOwnerProfileCompletion,
  getOwnerProfileInitials,
} from '../services/ownerProfileService';
import { AdminTab } from '../types';
import { normalizeBrandLogoUrl } from '../../lib/brandAssets';

const GLASS_PREFS_KEY = 'aman_studio_glass_v1';

interface TopPillItem {
  tab: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  icon3d?: string;
}

export const TopBar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setMobileMenuOpen,
    setSearchModalOpen,
    darkMode,
    toggleDarkMode,
    logout,
    currentUser,
    ownerProfile,
    websiteContent,
    enquiries,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAdmin();

  const brandSettings = websiteContent?.brandSettings;
  const resolvedTab = resolveStudioTab(currentTab);
  const activeNav = getNavItemForTab(resolvedTab);
  const ownerName = ownerProfile.fullName || currentUser?.name || 'Sharique Aman';
  const ownerEmail = ownerProfile.email || currentUser?.email || 'shariqueaman77@gmail.com';
  const ownerDesignation =
    ownerProfile.designation || currentUser?.role || 'Founder & Proprietor';
  const initials = getOwnerProfileInitials(ownerName);
  const completion = calculateOwnerProfileCompletion(ownerProfile);

  const pendingEnquiryCount = useMemo(
    () =>
      enquiries.filter((e) => e.status === 'new' || e.status === 'pending').length,
    [enquiries]
  );

  const [istTime, setIstTime] = useState('');
  const [glassOpen, setGlassOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [glassBlur, setGlassBlur] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GLASS_PREFS_KEY);
      if (saved) return JSON.parse(saved).blur ?? 22;
    } catch {
      // ignore
    }
    return 22;
  });

  const [glassTint, setGlassTint] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GLASS_PREFS_KEY);
      if (saved) return JSON.parse(saved).tint ?? 7;
    } catch {
      // ignore
    }
    return 7;
  });

  const [glassDepth, setGlassDepth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(GLASS_PREFS_KEY);
      if (saved) return JSON.parse(saved).depth ?? 100;
    } catch {
      // ignore
    }
    return 100;
  });

  const glassRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarFailed(false);
  }, [ownerProfile.profileImage]);

  useEffect(() => {
    const blurVal = `${glassBlur}px`;
    const tintVal = (glassTint / 100).toFixed(3);
    const depthVal = (glassDepth / 100).toFixed(2);
    document.documentElement.style.setProperty('--st-blur', blurVal);
    document.documentElement.style.setProperty('--st-gl-alpha', tintVal);
    document.documentElement.style.setProperty('--st-depth', depthVal);
    const root = document.querySelector<HTMLElement>('.admin-studio-theme');
    if (root) {
      root.style.setProperty('--st-blur', blurVal);
      root.style.setProperty('--st-gl-alpha', tintVal);
      root.style.setProperty('--st-depth', depthVal);
    }
    try {
      localStorage.setItem(
        GLASS_PREFS_KEY,
        JSON.stringify({ blur: glassBlur, tint: glassTint, depth: glassDepth })
      );
    } catch {
      // ignore
    }
  }, [glassBlur, glassTint, glassDepth]);

  useEffect(() => {
    const updateClock = () => {
      const formatted = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setIstTime(formatted);
    };
    updateClock();
    const timer = window.setInterval(updateClock, 15000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (glassRef.current && !glassRef.current.contains(target)) {
        setGlassOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGlassOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const primaryPills: TopPillItem[] = useMemo(() => {
    const base: TopPillItem[] = [
      {
        tab: 'overview',
        label: 'Overview',
        icon: LayoutDashboard,
        icon3d: '/assets/3d-icons/01-dashboard.png',
      },
      {
        tab: 'enquiries',
        label: 'Enquiries',
        icon: MessageSquareText,
        icon3d: '/assets/3d-icons/21-customer-enquiries.png',
        badge: pendingEnquiryCount > 0 ? pendingEnquiryCount : undefined,
      },
      {
        tab: 'government-schemes',
        label: 'Schemes',
        icon: Landmark,
        icon3d: '/assets/3d-icons/08-government-schemes.png',
      },
      {
        tab: 'services',
        label: 'Services',
        icon: Layers,
        icon3d: '/assets/3d-icons/12-our-services.png',
      },
      {
        tab: 'latest-updates',
        label: 'Updates',
        icon: Newspaper,
        icon3d: '/assets/3d-icons/10-latest-updates.png',
      },
      {
        tab: 'owner-profile',
        label: 'Owner',
        icon: UserCheck,
        icon3d: '/assets/3d-icons/02-owner-profile.png',
      },
    ];
    const inBase = base.some((item) => item.tab === resolvedTab);
    if (!inBase) {
      base.push({
        tab: resolvedTab,
        label: activeNav.shortLabel || activeNav.label,
        icon: activeNav.icon,
        icon3d: activeNav.icon3d,
      });
    }
    return base;
  }, [pendingEnquiryCount, resolvedTab, activeNav]);

  const showAvatarImg = Boolean(ownerProfile.profileImage) && !avatarFailed;

  return (
    <header className="sticky top-2.5 sm:top-3 z-30 studio-glass-bar rounded-[18px] sm:rounded-[20px] px-2.5 sm:px-3.5 py-2 sm:py-0 sm:min-h-[56px] flex flex-wrap md:flex-nowrap items-center justify-between gap-2 sm:gap-3">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="sm:hidden w-8 h-8 rounded-[10px] grid place-items-center text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
          aria-label="Open full navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('overview')}
          className="flex items-center gap-2.5 min-w-0 text-left group cursor-pointer"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.2)]">
            <img
              src={normalizeBrandLogoUrl(brandSettings?.logoUrl, true)}
              alt={brandSettings?.shopName || 'Aman Computer'}
              width={36}
              height={36}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="text-[13px] sm:text-[14px] font-semibold text-[var(--st-tx)] truncate">
              {brandSettings?.shopName || 'Aman Computer'}
            </div>
            <div className="hidden xl:block text-[9.5px] font-mono uppercase tracking-[0.14em] text-[var(--st-mut)] truncate">
              Owner Control Center
            </div>
          </div>
        </button>
      </div>

      {/* Center: Animated Sliding Navigation Pill Track */}
      <nav
        aria-label="Primary Workspace Switcher"
        className="order-3 md:order-2 w-full md:w-auto max-w-full flex items-center gap-0.5 p-1 rounded-full bg-[#24180d]/[0.06] dark:bg-black/28 border border-[var(--st-line)] overflow-x-auto scrollbar-none"
      >
        {primaryPills.map((item) => {
          const Icon = item.icon;
          const isActive = item.tab === resolvedTab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => setCurrentTab(item.tab)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative z-[1] flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] sm:text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'text-[#f6ecdc] dark:text-[#20150b] font-semibold'
                  : 'text-[var(--st-mut)] hover:text-[var(--st-tx)] font-medium'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="topBarSlidingPill"
                  aria-hidden="true"
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 34,
                    mass: 0.85,
                  }}
                  className="absolute inset-0 rounded-full bg-[#20150b] dark:bg-[#f1e8da] shadow-[0_4px_14px_rgba(0,0,0,0.28)] -z-10"
                />
              )}
              {item.icon3d ? (
                <img
                  src={item.icon3d}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="w-3.5 h-3.5 shrink-0 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
                />
              ) : (
                <Icon className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C9A96E] text-[#1c1208] text-[9.5px] font-bold grid place-items-center tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right: Search, Glass Tune, Theme Toggle, Alerts, Profile Menu */}
      <div className="order-2 md:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Search Trigger */}
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="studio-btn-secondary flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
          title="Search workspace (⌘K)"
          aria-label="Search workspace"
        >
          <Search className="w-3.5 h-3.5 text-[#C9A96E]" />
          <kbd className="hidden xl:inline text-[10px] font-mono text-[var(--st-mut)]">
            ⌘K
          </kbd>
        </button>

        {/* IST Clock on large screens */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full studio-glass-soft text-[11px] font-mono text-[var(--st-mut)] tabular-nums select-none">
          <Clock className="w-3 h-3 text-[#C9A96E]" />
          <span className="text-[var(--st-tx)]">{istTime || '09:00 AM'}</span>
          <span className="text-[9.5px] uppercase">IST</span>
        </div>

        {/* Glass Comfort Tuner */}
        <div className="relative" ref={glassRef}>
          <button
            type="button"
            onClick={() => {
              setGlassOpen((prev) => !prev);
              setNotifOpen(false);
              setProfileOpen(false);
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full studio-btn-secondary text-xs font-medium text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
            aria-expanded={glassOpen}
            aria-label="Adjust frosted glass appearance"
            title="Adjust glass blur, tint and depth"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span className="hidden lg:inline">Glass</span>
          </button>

          {glassOpen && (
            <div className="absolute right-0 mt-2.5 w-64 rounded-2xl studio-glass-popover p-4 z-50 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--st-tx)]">
                  Glass Material Controls
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setGlassBlur(22);
                    setGlassTint(7);
                    setGlassDepth(100);
                  }}
                  className="text-[10.5px] font-mono text-[#C9A96E] hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--st-mut)]">
                  <label htmlFor="studio-blur-range">Blur Intensity</label>
                  <span className="font-mono tabular-nums">{glassBlur}px</span>
                </div>
                <input
                  id="studio-blur-range"
                  type="range"
                  min={4}
                  max={36}
                  value={glassBlur}
                  onChange={(e) => setGlassBlur(Number(e.target.value))}
                  className="w-full accent-[#94652a] dark:accent-[#C9A96E] cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--st-mut)]">
                  <label htmlFor="studio-tint-range">Glass Tint</label>
                  <span className="font-mono tabular-nums">{glassTint}%</span>
                </div>
                <input
                  id="studio-tint-range"
                  type="range"
                  min={2}
                  max={24}
                  value={glassTint}
                  onChange={(e) => setGlassTint(Number(e.target.value))}
                  className="w-full accent-[#94652a] dark:accent-[#C9A96E] cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--st-mut)]">
                  <label htmlFor="studio-depth-range">Edge &amp; Depth</label>
                  <span className="font-mono tabular-nums">{glassDepth}%</span>
                </div>
                <input
                  id="studio-depth-range"
                  type="range"
                  min={50}
                  max={140}
                  value={glassDepth}
                  onChange={(e) => setGlassDepth(Number(e.target.value))}
                  className="w-full accent-[#94652a] dark:accent-[#C9A96E] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleDarkMode}
          className="w-8 h-8 rounded-full grid place-items-center bg-black/[0.05] dark:bg-white/[0.06] border border-[var(--st-line)] text-[var(--st-tx)] hover:border-[#C9A96E]/55 transition-colors cursor-pointer"
          aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
          title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {darkMode ? (
            <Sun className="w-3.5 h-3.5 text-[#DFC492]" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[#20150b]" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setGlassOpen(false);
              setProfileOpen(false);
            }}
            className="relative w-8 h-8 rounded-full grid place-items-center bg-black/[0.05] dark:bg-white/[0.06] border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:border-[#C9A96E]/55 transition-colors cursor-pointer"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#C9A96E] ring-2 ring-[#f8efe0] dark:ring-[#1c1208]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-[min(20.5rem,calc(100vw-2rem))] rounded-2xl studio-glass-popover p-3.5 z-50">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[var(--st-line)]">
                <span className="text-xs font-semibold text-[var(--st-tx)]">
                  Workspace Alerts
                  {unreadNotificationCount > 0 && (
                    <span className="ml-1.5 font-mono text-[11px] text-[#C9A96E] tabular-nums">
                      ({unreadNotificationCount})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-[#C9A96E] hover:underline transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="p-1 rounded text-[var(--st-mut)] hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear notifications"
                      aria-label="Clear notifications"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto admin-studio-scroll">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[var(--st-mut)]">
                    All alerts acknowledged. No pending notices.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        markNotificationRead(item.id);
                        if (item.linkToTab) {
                          setCurrentTab(item.linkToTab);
                        }
                        setNotifOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-colors cursor-pointer ${
                        !item.read
                          ? 'bg-[#C9A96E]/12 border-[#C9A96E]/35 text-[var(--st-tx)]'
                          : 'bg-transparent border-transparent text-[var(--st-mut)] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] opacity-85 line-clamp-2 mt-0.5">
                        {item.description}
                      </div>
                      <div className="text-[10px] font-mono opacity-65 mt-1 tabular-nums">
                        {item.timestamp}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-[var(--st-line)] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('activity-logs');
                    setNotifOpen(false);
                  }}
                  className="text-[11px] font-medium text-[#C9A96E] hover:underline transition-colors cursor-pointer"
                >
                  Open Security &amp; Activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Owner Avatar & Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setGlassOpen(false);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#C9A96E]/45 transition-all cursor-pointer"
            aria-expanded={profileOpen}
            aria-label="Open owner profile menu"
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A96E] text-[#1c1208] flex items-center justify-center font-bold text-[11px] overflow-hidden shrink-0 shadow-xs">
              {showAvatarImg ? (
                <img
                  src={ownerProfile.profileImage}
                  alt={ownerName}
                  onError={() => setAvatarFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2.5 w-64 rounded-2xl studio-glass-popover p-2 z-50">
              <div className="px-2.5 py-2.5 border-b border-[var(--st-line)] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-[var(--st-tx)] truncate">
                    {ownerName}
                  </div>
                  <span className="text-[10px] font-mono text-[#C9A96E] tabular-nums shrink-0">
                    {completion.percentage}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[var(--st-mut)] truncate">
                  {ownerEmail}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E] truncate">
                  {ownerDesignation}
                </div>
              </div>

              <div className="py-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('owner-profile');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <img
                    src="/assets/3d-icons/02-owner-profile.png"
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
                  />
                  <span>Owner Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('website-settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <img
                    src="/assets/3d-icons/24-website-settings.png"
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
                  />
                  <span>Website Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('seo-manager');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <img
                    src="/assets/3d-icons/25-seo-manager.png"
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
                  />
                  <span>SEO Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('activity-logs');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
                >
                  <img
                    src="/assets/3d-icons/26-security-activity.png"
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4 object-contain shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.18)] group-hover:scale-110 transition-transform"
                  />
                  <span>Security &amp; Activity</span>
                </button>
              </div>

              <div className="pt-1.5 border-t border-[var(--st-line)] space-y-0.5">
                <a
                  href="/"
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
                >
                  <span>View Public Website</span>
                  <ExternalLink className="w-3 h-3 text-[#C9A96E]" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-rose-700 dark:text-[#e8918a] hover:bg-rose-500/12 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign Out &amp; Lock</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
