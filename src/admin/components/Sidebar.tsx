import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
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

const EXPANDED_STORAGE_KEY = 'aman_admin_expanded_accordions_v1';

const DEFAULT_EXPANDED: Record<string, boolean> = {
  'hero-manager': false,
  'doors-management': true,
  'website-content-group': false,
};

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    unreadNotificationCount,
    enquiries,
    logout,
  } = useAdmin();

  const activeTab = resolveStudioTab(currentTab);
  const pendingEnquiryCount = enquiries.filter(
    (item) => item.status === 'new' || item.status === 'pending'
  ).length;

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

  // Close mobile navigation drawer on Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

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
    setMobileMenuOpen(false);
  };

  const renderBadge = (tab?: AdminTab) => {
    if (!tab || sidebarCollapsed) return null;
    if (tab === 'activity-logs' && unreadNotificationCount > 0) {
      return (
        <span className="text-[10px] font-mono font-semibold text-[#C9A96E] tabular-nums px-1.5 py-0.5 rounded bg-[#C9A96E]/10">
          {unreadNotificationCount}
        </span>
      );
    }
    if (tab === 'enquiries' && pendingEnquiryCount > 0) {
      return (
        <span className="text-[10px] font-mono font-semibold text-[#C9A96E] tabular-nums px-1.5 py-0.5 rounded bg-[#C9A96E]/10">
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
        title={sidebarCollapsed ? item.label : undefined}
        aria-current={isActive ? 'page' : undefined}
        className={`relative w-full flex items-center gap-3 rounded-lg text-[13px] transition-all cursor-pointer ${
          nested && !sidebarCollapsed ? 'pl-8 pr-2.5 py-1.5' : 'px-2.5 py-2'
        } ${
          isActive
            ? 'bg-[#211B16] text-[#E8E5DF] border border-[#C9A96E]/35 font-medium'
            : 'text-[#85838A] border border-transparent hover:text-[#E8E5DF] hover:bg-white/[0.03]'
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
        <Icon
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? 'text-[#C9A96E]' : 'text-[#85838A]'
          }`}
        />
        {!sidebarCollapsed && (
          <span className="flex-1 truncate text-left">{item.label}</span>
        )}
        {renderBadge(item.tab)}
      </button>
    );
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Luxury Editorial Sidebar Container */}
      <aside
        aria-label="Owner Control Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#101014] border-r border-white/[0.07] flex flex-col transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-white/[0.07] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#141419] border border-[#C9A96E]/45 text-[#C9A96E] flex items-center justify-center font-editorial text-lg font-medium shrink-0 group-hover:border-[#C9A96E]/80 transition-colors">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-editorial text-[17px] leading-none text-[#E8E5DF] tracking-tight truncate uppercase">
                  Aman Computer
                </div>
                <div className="text-[9.5px] font-mono uppercase tracking-[0.18em] text-[#85838A] mt-1 truncate">
                  Owner Control Center
                </div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#85838A] hover:text-[#E8E5DF] hover:bg-[#141419] transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[#85838A] hover:text-[#E8E5DF] hover:bg-[#141419] transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto admin-studio-scroll px-3 py-4 space-y-5">
          {STUDIO_NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1.5">
              {!sidebarCollapsed ? (
                <div className="px-2.5 pb-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-[#85838A]/80">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="h-px bg-white/[0.06] my-2 mx-1.5" />
              )}

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

                  // When sidebar is collapsed, clicking an accordion parent jumps directly to its first child
                  if (sidebarCollapsed) {
                    const firstChildTab = children[0]?.tab || 'overview';
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectTab(firstChildTab)}
                        title={item.label}
                        className={`relative w-full flex items-center justify-center px-2.5 py-2 rounded-lg transition-all cursor-pointer ${
                          hasActiveChild
                            ? 'bg-[#211B16] text-[#E8E5DF] border border-[#C9A96E]/35'
                            : 'text-[#85838A] border border-transparent hover:text-[#E8E5DF] hover:bg-white/[0.03]'
                        }`}
                      >
                        {hasActiveChild && (
                          <span
                            aria-hidden="true"
                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#C9A96E]"
                          />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            hasActiveChild ? 'text-[#C9A96E]' : 'text-[#85838A]'
                          }`}
                        />
                      </button>
                    );
                  }

                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleParent(item.id)}
                        aria-expanded={isExpanded}
                        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
                          hasActiveChild
                            ? 'text-[#E8E5DF] font-medium bg-white/[0.03]'
                            : 'text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.025]'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            hasActiveChild ? 'text-[#C9A96E]' : 'text-[#85838A]'
                          }`}
                        />
                        <span className="flex-1 truncate text-left">{item.label}</span>
                        <motion.span
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="shrink-0 text-[#85838A]"
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
                                className="absolute left-4 top-1 bottom-2 w-px bg-white/[0.07]"
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

        {/* Fixed Bottom Studio Actions */}
        <div className="p-3 border-t border-white/[0.07] bg-[#0A0A0E]/80 shrink-0 space-y-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/[0.08] bg-[#141419] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/45 hover:text-[#DFC492] transition-colors"
            title="Open Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
            {!sidebarCollapsed && <span>Public Website</span>}
          </a>

          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#C9A96E]/30 bg-[#211B16] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/60 hover:bg-[#2A221B] transition-colors cursor-pointer"
            title="Sign Out & Lock Workspace"
          >
            <Lock className="w-3.5 h-3.5 text-[#C9A96E] shrink-0" />
            {!sidebarCollapsed && <span>Sign Out &amp; Lock</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
