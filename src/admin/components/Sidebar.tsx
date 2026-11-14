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
            className="flex items-center gap-3 min-w-0 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#191C22] border border-[#C6A56B]/30 text-[#C6A56B] flex items-center justify-center font-editorial text-lg font-medium shrink-0 group-hover:border-[#C6A56B]/60 transition-colors">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="font-editorial text-lg leading-none text-[#F5F2EC] tracking-tight truncate">
                  Aman Computer
                </div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#92949B] mt-1 truncate">
                  Studio Control
                </div>
              </div>
            )}
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex w-7 h-7 rounded-md items-center justify-center text-[#92949B] hover:text-[#F3EFE7] hover:bg-[#191C22] transition-colors"
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
              className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-[#92949B] hover:text-[#F3EFE7] hover:bg-[#191C22] transition-colors"
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

                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => handleSelectTab(item.tab)}
                      title={sidebarCollapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                        isActive
                          ? 'bg-[#191C22] text-[#F3EFE7] border border-[#C6A56B]/30 font-medium'
                          : 'text-[#92949B] border border-transparent hover:text-[#F5F2EC] hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-[#C6A56B]' : 'text-[#92949B]'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate text-left">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Studio Actions */}
        <div className="p-3 border-t border-white/[0.07] bg-[#090A0C]/45 shrink-0 space-y-2">
          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-white/[0.08] bg-[#191C22]/60 text-xs font-medium text-[#F5F2EC] hover:border-[#C6A56B]/35 hover:text-[#F3EFE7] transition-colors"
            title="Open Public Website"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#C6A56B] shrink-0" />
            {!sidebarCollapsed && <span>Public Website</span>}
          </a>

          <button
            type="button"
            onClick={() => {
              void logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#C6A56B]/25 bg-[#C6A56B]/10 text-xs font-medium text-[#F3EFE7] hover:bg-[#C6A56B]/20 hover:border-[#C6A56B]/45 transition-colors"
            title="Sign Out & Lock Control Center"
          >
            <Lock className="w-3.5 h-3.5 text-[#C6A56B] shrink-0" />
            {!sidebarCollapsed && <span>Sign Out &amp; Lock</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
