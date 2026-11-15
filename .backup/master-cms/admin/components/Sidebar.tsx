import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  X,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { AdminTab } from '../types';
import { STUDIO_NAV_GROUPS, resolveStudioTab } from '../config/navigation';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    unreadNotificationCount,
    logout,
  } = useAdmin();

  const activeTab = resolveStudioTab(currentTab);

  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Studio Sidebar Container */}
      <aside
        aria-label="Admin Control Navigation"
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#111318] border-r border-white/[0.07] flex flex-col transition-all duration-300 ease-out ${
          sidebarCollapsed ? 'w-[76px]' : 'w-[264px]'
        } ${
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-white/[0.07] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => handleSelectTab('overview')}
            className="flex items-center gap-3 min-w-0 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-[#191C22] border border-orange-500/40 text-orange-400 flex items-center justify-center font-editorial text-lg font-medium shrink-0 group-hover:border-orange-400/70 shadow-[0_0_20px_-6px_rgba(249,115,22,0.55)] transition-all">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-editorial text-lg leading-none text-[#F5F2EC] tracking-tight truncate">
                  Aman Computer
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#92949B] mt-1 truncate">
                  Owner Dashboard
                </div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#92949B] hover:text-orange-100 hover:bg-[#191C22] transition-colors cursor-pointer"
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
              className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[#92949B] hover:text-orange-100 hover:bg-[#191C22] transition-colors cursor-pointer"
              aria-label="Close navigation drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Groups */}
        <nav className="flex-1 overflow-y-auto admin-studio-scroll px-3 py-4 space-y-5">
          {STUDIO_NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              {!sidebarCollapsed ? (
                <div className="px-2.5 pb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#92949B]/80">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="h-px bg-white/[0.06] my-2 mx-1.5" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.tab;
                  const showAlertBadge =
                    item.tab === 'activity-logs' && unreadNotificationCount > 0;

                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleSelectTab(item.tab)}
                      title={sidebarCollapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#191C22] text-[#F5F2EC] border border-orange-500/35 font-medium shadow-[0_0_24px_-12px_rgba(249,115,22,0.55)]'
                          : 'text-[#92949B] border border-transparent hover:text-[#F5F2EC] hover:bg-white/[0.03]'
                      }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-gradient-to-b from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.85)]"
                        />
                      )}
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-orange-400' : 'text-[#92949B]'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate text-left">{item.label}</span>
                      )}
                      {showAlertBadge && !sidebarCollapsed && (
                        <span className="text-[10px] font-mono font-semibold text-orange-400 tabular-nums">
                          {unreadNotificationCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Studio Actions */}
        <div className="p-3 border-t border-white/[0.07] bg-[#090A0C]/55 shrink-0 space-y-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/[0.08] bg-[#191C22]/60 text-xs font-medium text-[#F5F2EC] hover:border-orange-500/40 hover:text-orange-100 transition-colors"
            title="Open Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            {!sidebarCollapsed && <span>Public Website</span>}
          </a>

          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-orange-500/30 bg-orange-500/10 text-xs font-medium text-orange-100 hover:bg-orange-500/20 hover:border-orange-400/50 transition-colors cursor-pointer"
            title="Sign Out & Lock Workspace"
          >
            <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out &amp; Lock</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
