import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ExternalLink,
  FileCheck2,
  FolderGit2,
  Globe,
  Image as ImageIcon,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  Menu,
  MessageSquareText,
  Newspaper,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminTab } from '../types';
import {
  STUDIO_NAV_GROUPS,
  StudioNavItem,
  getParentIdForTab,
  resolveStudioTab,
} from '../config/navigation';
import { normalizeBrandLogoUrl } from '../../lib/brandAssets';

const EXPANDED_STORAGE_KEY = 'aman_admin_expanded_accordions_v1';

const DEFAULT_EXPANDED: Record<string, boolean> = {
  'hero-manager': false,
  'doors-management': true,
  'website-content-group': false,
};

interface RailShortcut {
  id: string;
  label: string;
  icon: React.ElementType;
  icon3d?: string;
  tab?: AdminTab;
  matchTabs?: AdminTab[];
  action?: 'search';
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    setSearchModalOpen,
    unreadNotificationCount,
    enquiries,
    websiteContent,
    logout,
  } = useAdmin();

  const compactBrandLogo = normalizeBrandLogoUrl(websiteContent?.brandSettings?.logoUrl, true);
  const brandShopName = websiteContent?.brandSettings?.shopName || 'Aman Computer';

  const [dockExpanded, setDockExpanded] = useState(false);
  const isOpen = dockExpanded || mobileMenuOpen;

  const closeSidebar = () => {
    setDockExpanded(false);
    setMobileMenuOpen(false);
  };

  const openSidebar = () => {
    setDockExpanded(true);
    setMobileMenuOpen(true);
  };

  const activeTab = resolveStudioTab(currentTab);
  const pendingEnquiryCount = useMemo(
    () => enquiries.filter((item) => item.status === 'new' || item.status === 'pending').length,
    [enquiries]
  );

  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(EXPANDED_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_EXPANDED, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_EXPANDED;
  });

  // Automatically expand the parent accordion matching the active tab
  useEffect(() => {
    const activeParentId = getParentIdForTab(activeTab);
    if (activeParentId) {
      setExpandedParents((prev) => {
        if (prev[activeParentId]) return prev;
        const next = { ...prev, [activeParentId]: true };
        try {
          localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore storage write errors
        }
        return next;
      });
    }
  }, [activeTab]);

  // Escape key closes expanded overlay drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock background page interaction/scrolling while expanded overlay drawer is active
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const toggleParent = (id: string) => {
    setExpandedParents((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(EXPANDED_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write errors
      }
      return next;
    });
  };

  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    closeSidebar();
  };

  const railShortcuts: RailShortcut[] = useMemo(
    () => [
      {
        id: 'rail-overview',
        label: 'Dashboard',
        icon: LayoutDashboard,
        icon3d: '/assets/3d-icons/01-dashboard.png',
        tab: 'overview',
      },
      {
        id: 'rail-search',
        label: 'Search Workspace',
        icon: Search,
        action: 'search',
      },
      {
        id: 'rail-enquiries',
        label: 'Customer Enquiries',
        icon: MessageSquareText,
        icon3d: '/assets/3d-icons/21-customer-enquiries.png',
        tab: 'enquiries',
        matchTabs: ['enquiries', 'customers'],
        badgeCount: pendingEnquiryCount,
      },
      {
        id: 'rail-schemes',
        label: 'Government Schemes',
        icon: Landmark,
        icon3d: '/assets/3d-icons/08-government-schemes.png',
        tab: 'government-schemes',
      },
      {
        id: 'rail-services',
        label: 'Our Services',
        icon: Layers,
        icon3d: '/assets/3d-icons/12-our-services.png',
        tab: 'services',
      },
      {
        id: 'rail-hero',
        label: 'Hero Section',
        icon: Sparkles,
        icon3d: '/assets/3d-icons/03-hero-section-manager.png',
        tab: 'hero-headline',
        matchTabs: ['hero-headline', 'hero-showcase', 'hero-portrait', 'brand-settings'],
      },
      {
        id: 'rail-updates',
        label: 'Latest Updates',
        icon: Newspaper,
        icon3d: '/assets/3d-icons/10-latest-updates.png',
        tab: 'latest-updates',
      },
      {
        id: 'rail-docs',
        label: 'Documents Needed',
        icon: FileCheck2,
        icon3d: '/assets/3d-icons/11-documents-needed.png',
        tab: 'doc-requirements',
      },
      {
        id: 'rail-gallery',
        label: 'Gallery & Journey',
        icon: ImageIcon,
        icon3d: '/assets/3d-icons/13-gallery.png',
        tab: 'gallery',
        matchTabs: ['gallery', 'journey'],
      },
      {
        id: 'rail-media',
        label: 'Media Library',
        icon: FolderGit2,
        icon3d: '/assets/3d-icons/23-media-library.png',
        tab: 'media',
      },
      {
        id: 'rail-profile',
        label: 'Owner Profile',
        icon: UserCheck,
        icon3d: '/assets/3d-icons/02-owner-profile.png',
        tab: 'owner-profile',
        matchTabs: ['owner-profile', 'business-profile'],
      },
    ],
    [pendingEnquiryCount]
  );

  const railSystemShortcuts: RailShortcut[] = useMemo(
    () => [
      {
        id: 'rail-settings',
        label: 'Website Settings',
        icon: Globe,
        icon3d: '/assets/3d-icons/24-website-settings.png',
        tab: 'website-settings',
        matchTabs: ['website-settings', 'seo-manager', 'content-about', 'content-contact', 'faqs', 'content-footer'],
      },
      {
        id: 'rail-security',
        label: 'Security & Activity',
        icon: ShieldCheck,
        icon3d: '/assets/3d-icons/26-security-activity.png',
        tab: 'activity-logs',
        badgeCount: unreadNotificationCount,
      },
    ],
    [unreadNotificationCount]
  );

  const renderBadge = (tab?: AdminTab) => {
    if (!tab) return null;
    if (tab === 'activity-logs' && unreadNotificationCount > 0) {
      return (
        <span className="text-[10px] font-mono font-semibold text-[#C9A96E] tabular-nums px-1.5 py-0.5 rounded bg-[#C9A96E]/15">
          {unreadNotificationCount}
        </span>
      );
    }
    if (tab === 'enquiries' && pendingEnquiryCount > 0) {
      return (
        <span className="text-[10px] font-mono font-semibold text-[#C9A96E] tabular-nums px-1.5 py-0.5 rounded bg-[#C9A96E]/15">
          {pendingEnquiryCount}
        </span>
      );
    }
    return null;
  };

  const renderLeafButton = (item: StudioNavItem, nested = false) => {
    const Icon = item.icon;
    const isActive = item.tab === activeTab;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => item.tab && handleSelectTab(item.tab)}
        aria-current={isActive ? 'page' : undefined}
        className={`group relative w-full flex items-center gap-2.5 rounded-xl text-[12.5px] transition-all cursor-pointer active:scale-[0.98] ${
          nested ? 'pl-8 pr-2.5 py-1.5' : 'px-2.5 py-2'
        } ${
          isActive
            ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#211B16] dark:text-[#f1e7d6] border border-[#C9A96E]/45 font-medium shadow-xs'
            : 'text-[var(--st-mut)] border border-transparent hover:text-[var(--st-tx)] hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
        }`}
      >
        {isActive && (
          <motion.span
            layoutId="activeNavIndicator"
            aria-hidden="true"
            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#C9A96E]"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}
        {item.icon3d ? (
          <img
            src={item.icon3d}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={`w-[18px] h-[18px] shrink-0 object-contain transition-transform group-hover:scale-105 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)] ${
              isActive ? 'brightness-110 scale-105' : 'opacity-85'
            }`}
          />
        ) : (
          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-[#C9A96E]' : 'text-[var(--st-mut)]'
            }`}
          />
        )}
        <span className="flex-1 truncate text-left">{item.label}</span>
        {renderBadge(item.tab)}
      </button>
    );
  };

  const renderRailButton = (shortcut: RailShortcut) => {
    const Icon = shortcut.icon;
    const isActive = shortcut.tab
      ? shortcut.matchTabs
        ? shortcut.matchTabs.includes(activeTab)
        : activeTab === shortcut.tab
      : false;

    return (
      <button
        key={shortcut.id}
        type="button"
        onClick={() => {
          if (shortcut.action === 'search') {
            setSearchModalOpen(true);
            return;
          }
          if (shortcut.tab) {
            handleSelectTab(shortcut.tab);
          }
        }}
        aria-label={shortcut.label}
        aria-current={isActive ? 'page' : undefined}
        className={`group relative w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[13px] grid place-items-center transition-all duration-200 cursor-pointer active:scale-90 shrink-0 ${
          isActive
            ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#f1e8da] dark:text-[#20150b] shadow-[0_6px_16px_rgba(0,0,0,0.28)]'
            : 'text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1]'
        }`}
      >
        {shortcut.icon3d ? (
          <img
            src={shortcut.icon3d}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={`w-[22px] h-[22px] object-contain transition-all duration-200 group-hover:scale-110 drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)] ${
              isActive ? 'scale-105 brightness-110' : 'opacity-90 group-hover:opacity-100'
            }`}
          />
        ) : (
          <Icon className="w-[15px] h-[15px]" />
        )}
        {shortcut.badgeCount && shortcut.badgeCount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C9A96E] ring-2 ring-[#f8efe0] dark:ring-[#101014]"
          />
        ) : null}
        <span
          role="tooltip"
          className="hidden sm:block pointer-events-none absolute left-[50px] z-50 px-2.5 py-1 rounded-[9px] bg-[#24180d] text-[#f8efe0] border border-[#C9A96E]/35 text-[10.5px] font-medium whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150"
        >
          {shortcut.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Semi-transparent Blurred Overlay Backdrop when Sidebar is Expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="dockBackdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed inset-0 z-40 bg-[#24160a]/28 dark:bg-black/55 backdrop-blur-[4px]"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Collapsed Slim Floating Icon Rail (Always Fixed Left) */}
      <aside
        aria-label="Quick Floating Navigation Rail"
        aria-hidden={isOpen}
        className={`fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-[50px] sm:w-[54px] max-h-[calc(100dvh-20px)] flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-[26px] studio-glass-bar overflow-y-auto scrollbar-none transition-all duration-300 ${
          isOpen ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <button
          type="button"
          onClick={() => handleSelectTab('overview')}
          aria-label={`${brandShopName} — Dashboard Overview`}
          className="group relative w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-full grid place-items-center transition-transform duration-200 cursor-pointer hover:scale-105 active:scale-95 shrink-0"
        >
          <img
            src={compactBrandLogo}
            alt={brandShopName}
            width={34}
            height={34}
            className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.22)]"
          />
          <span
            role="tooltip"
            className="hidden sm:block pointer-events-none absolute left-[50px] z-50 px-2.5 py-1 rounded-[9px] bg-[#24180d] text-[#f8efe0] border border-[#C9A96E]/35 text-[10.5px] font-medium whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all duration-150"
          >
            {brandShopName}
          </span>
        </button>

        <button
          id="dockOpen"
          type="button"
          onClick={openSidebar}
          aria-label="Expand full navigation menu"
          aria-expanded={isOpen}
          className="group relative w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[13px] grid place-items-center text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all cursor-pointer active:scale-90 shrink-0"
        >
          <Menu className="w-4 h-4" />
          <span
            role="tooltip"
            className="hidden sm:block pointer-events-none absolute left-[50px] z-50 px-2.5 py-1 rounded-[9px] bg-[#24180d] text-[#f8efe0] border border-[#C9A96E]/35 text-[10.5px] font-medium whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
          >
            Expand Navigation
          </span>
        </button>

        <div className="w-7 h-px bg-[var(--st-line)] my-1 shrink-0" />

        <div className="flex flex-col items-center gap-1">
          {railShortcuts.map((shortcut) => renderRailButton(shortcut))}
        </div>

        <div className="w-7 h-px bg-[var(--st-line)] my-1 shrink-0" />

        <div className="flex flex-col items-center gap-1">
          {railSystemShortcuts.map((shortcut) => renderRailButton(shortcut))}
        </div>

        <div className="w-7 h-px bg-[var(--st-line)] my-1 shrink-0" />

        <a
          href="/"
          aria-label="Open Public Website"
          className="group relative w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[13px] grid place-items-center text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all active:scale-90 shrink-0"
        >
          <ExternalLink className="w-[15px] h-[15px]" />
          <span
            role="tooltip"
            className="hidden sm:block pointer-events-none absolute left-[50px] z-50 px-2.5 py-1 rounded-[9px] bg-[#24180d] text-[#f8efe0] border border-[#C9A96E]/35 text-[10.5px] font-medium whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
          >
            Public Website
          </span>
        </a>

        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          aria-label="Sign Out and Lock Workspace"
          className="group relative w-9 h-9 sm:w-[38px] sm:h-[38px] rounded-[13px] grid place-items-center text-rose-600 dark:text-[#e8918a] hover:bg-rose-500/12 transition-all cursor-pointer active:scale-90 shrink-0"
        >
          <Lock className="w-[15px] h-[15px]" />
          <span
            role="tooltip"
            className="hidden sm:block pointer-events-none absolute left-[50px] z-50 px-2.5 py-1 rounded-[9px] bg-[#24180d] text-[#f8efe0] border border-[#C9A96E]/35 text-[10.5px] font-medium whitespace-nowrap shadow-lg opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150"
          >
            Sign Out &amp; Lock
          </span>
        </button>
      </aside>

      {/* Expanded Floating Overlay Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Owner Control Navigation"
            initial={{ opacity: 0, x: -16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -14, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.215, 0.61, 0.355, 1] }}
            className="fixed left-2.5 sm:left-4 top-[max(12px,env(safe-area-inset-top))] bottom-[max(12px,env(safe-area-inset-bottom))] z-50 w-[min(256px,calc(100vw-20px))] sm:w-[244px] rounded-[22px] studio-glass-popover flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-3.5 py-3 border-b border-[var(--st-line)] flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleSelectTab('overview')}
                className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
              >
                <img
                  src={compactBrandLogo}
                  alt={brandShopName}
                  width={34}
                  height={34}
                  className="w-8 h-8 sm:w-[34px] sm:h-[34px] rounded-full object-contain shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_2px_8px_rgba(56,189,248,0.22)]"
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight text-[var(--st-tx)] truncate">
                    {brandShopName}
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[var(--st-mut)] truncate">
                    Owner Workspace
                  </div>
                </div>
              </button>

              <button
                id="dockClose"
                type="button"
                onClick={closeSidebar}
                aria-label="Close navigation menu"
                className="w-7 h-7 rounded-[9px] grid place-items-center text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Full 6-Group / 23-Route Hierarchy */}
            <nav className="flex-1 overflow-y-auto admin-studio-scroll px-2.5 py-3 space-y-4">
              {STUDIO_NAV_GROUPS.map((group) => (
                <div key={group.groupTitle} className="space-y-1">
                  <div className="px-2.5 pb-0.5 text-[9.5px] font-mono font-semibold uppercase tracking-[0.16em] text-[var(--st-mut2)]">
                    {group.groupTitle}
                  </div>

                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const hasChildren = Boolean(item.children && item.children.length > 0);
                      if (!hasChildren) {
                        return renderLeafButton(item, false);
                      }

                      const Icon = item.icon;
                      const children = item.children || [];
                      const hasActiveChild = children.some((child) => child.tab === activeTab);
                      const isExpanded = Boolean(expandedParents[item.id]);

                      return (
                        <div key={item.id} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleParent(item.id)}
                            aria-expanded={isExpanded}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12.5px] transition-colors cursor-pointer ${
                              hasActiveChild
                                ? 'text-[var(--st-tx)] font-medium bg-black/[0.04] dark:bg-white/[0.05]'
                                : 'text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                            }`}
                          >
                            {item.icon3d ? (
                              <img
                                src={item.icon3d}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                                className="w-[18px] h-[18px] shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.14)] opacity-90"
                              />
                            ) : (
                              <Icon
                                className={`w-4 h-4 shrink-0 transition-colors ${
                                  hasActiveChild ? 'text-[#C9A96E]' : 'text-[var(--st-mut)]'
                                }`}
                              />
                            )}
                            <span className="flex-1 truncate text-left">{item.label}</span>
                            <motion.span
                              animate={{ rotate: isExpanded ? 180 : 0 }}
                              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              className="shrink-0 text-[var(--st-mut)]"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </motion.span>
                          </button>

                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                key={`${item.id}-panel`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="relative space-y-0.5 pt-0.5 pb-1">
                                  <span
                                    aria-hidden="true"
                                    className="absolute left-4 top-1 bottom-2 w-px bg-[var(--st-line)]"
                                  />
                                  {children.map((child) => renderLeafButton(child, true))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* Fixed Bottom Shortcuts & Sign Out */}
            <div className="p-2.5 border-t border-[var(--st-line)] space-y-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  setSearchModalOpen(true);
                }}
                className="w-full flex items-center justify-between gap-2 py-2 px-3 rounded-xl border border-[var(--st-line)] bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[var(--st-tx)] hover:border-[#C9A96E]/50 transition-colors cursor-pointer"
              >
                <span className="inline-flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Quick Search</span>
                </span>
                <kbd className="text-[10px] font-mono text-[var(--st-mut)]">⌘K</kbd>
              </button>

              <a
                href="/"
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl border border-[var(--st-line)] bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[var(--st-tx)] hover:border-[#C9A96E]/50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
                <span>Public Website</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  closeSidebar();
                  void logout();
                }}
                className="w-full flex items-center gap-2 py-2 px-3 rounded-xl border border-rose-500/25 bg-rose-500/10 text-xs font-medium text-rose-700 dark:text-[#e8918a] hover:bg-rose-500/18 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Sign Out &amp; Lock</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
