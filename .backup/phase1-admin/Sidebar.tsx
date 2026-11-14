import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { AdminTab } from '../types';
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  Layers,
  Sparkles,
  FileCheck,
  Image,
  Milestone,
  FileEdit,
  HelpCircle,
  Star,
  Building2,
  Receipt,
  FolderGit2,
  BarChart3,
  Bell,
  UserCheck,
  FileText,
  Database,
  Settings2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Laptop,
  Lock,
} from 'lucide-react';

interface NavItemDef {
  tab: AdminTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'red' | 'amber' | 'emerald' | 'blue';
}

interface NavGroup {
  groupTitle: string;
  items: NavItemDef[];
}

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    logout,
    customers,
    enquiries,
    services,
    latestUpdates,
    docRequirements,
    receipts,
    unreadNotificationCount,
  } = useAdmin();

  const pendingEnquiriesCount = enquiries.filter((e) => e.status === 'new' || e.status === 'pending').length;
  const activeUpdatesCount = latestUpdates.filter((u) => u.published).length;
  const publishedDocsCount = docRequirements.filter((d) => d.published).length;
  const pendingReceiptsCount = receipts.filter((r) => r.status !== 'Completed & Delivered').length;

  const NAV_GROUPS: NavGroup[] = [
    {
      groupTitle: 'Operations',
      items: [
        { tab: 'overview', label: 'Overview', icon: LayoutDashboard },
        {
          tab: 'customers',
          label: 'Customer Management',
          icon: Users,
          badge: customers.length,
          badgeVariant: 'blue',
        },
        {
          tab: 'enquiries',
          label: 'Customer Enquiries',
          icon: MessageSquareText,
          badge: pendingEnquiriesCount > 0 ? pendingEnquiriesCount : undefined,
          badgeVariant: 'amber',
        },
        {
          tab: 'services',
          label: 'Services & Rates',
          icon: Layers,
          badge: services.length,
          badgeVariant: 'blue',
        },
      ],
    },
    {
      groupTitle: 'Website Content',
      items: [
        {
          tab: 'latest-updates',
          label: 'Latest Updates (Door 0)',
          icon: Sparkles,
          badge: activeUpdatesCount > 0 ? `${activeUpdatesCount} Live` : undefined,
          badgeVariant: 'emerald',
        },
        {
          tab: 'doc-requirements',
          label: 'Documents Need (Door 1)',
          icon: FileCheck,
          badge: publishedDocsCount > 0 ? `${publishedDocsCount} Live` : undefined,
          badgeVariant: 'emerald',
        },
        { tab: 'gallery', label: 'Center Gallery (Door 4)', icon: Image },
        { tab: 'journey', label: 'Our Journey Timeline', icon: Milestone },
        { tab: 'website-content', label: 'Website CMS Sections', icon: FileEdit },
        { tab: 'faqs', label: 'FAQ Management', icon: HelpCircle },
        { tab: 'testimonials', label: 'Testimonials', icon: Star },
      ],
    },
    {
      groupTitle: 'Business Management',
      items: [
        { tab: 'business-profile', label: 'Business Profile', icon: Building2 },
        {
          tab: 'receipts',
          label: 'Receipts & Tokens',
          icon: Receipt,
          badge: pendingReceiptsCount > 0 ? `${pendingReceiptsCount} Active` : undefined,
          badgeVariant: 'amber',
        },
        { tab: 'media', label: 'Media Library', icon: FolderGit2 },
        { tab: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      groupTitle: 'System',
      items: [
        {
          tab: 'notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
          badgeVariant: 'red',
        },
        { tab: 'staff', label: 'Staff & Operators', icon: UserCheck },
        { tab: 'activity-logs', label: 'Activity Logs', icon: FileText },
        { tab: 'backup-restore', label: 'Backup & Restore', icon: Database },
        { tab: 'settings', label: 'Terminal Settings', icon: Settings2 },
      ],
    },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#F0ECE9] dark:bg-[#1A1818] border-r border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10">
              AC
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 truncate">
                <div className="text-sm font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] truncate flex items-center gap-1.5">
                  <span>Aman Computer</span>
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    POS
                  </span>
                </div>
                <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono truncate">
                  Cyber Cafe & Digital Center
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-none">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              {!sidebarCollapsed ? (
                <div className="px-3 text-[10px] font-mono uppercase tracking-widest text-[#857878] dark:text-[#B5A8A8] font-bold">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="h-[1px] bg-[rgba(196,176,176,0.2)] dark:bg-[rgba(196,176,176,0.1)] my-2" />
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.tab;

                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleSelectTab(item.tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] shadow-xs'
                          : 'text-[#6B5C5C] dark:text-[#B5A8A8] hover:bg-[rgba(196,176,176,0.2)] dark:hover:bg-[rgba(196,176,176,0.08)] hover:text-[#1A1818] dark:hover:text-[#E8E4E0]'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />

                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between min-w-0">
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                                isActive
                                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                                  : item.badgeVariant === 'amber'
                                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                                  : item.badgeVariant === 'red'
                                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400'
                                  : item.badgeVariant === 'emerald'
                                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-[rgba(107,92,92,0.15)] dark:bg-[rgba(196,176,176,0.15)] text-[#6B5C5C] dark:text-[#B5A8A8]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Public Site Link & Live indicator */}
        <div className="p-3 border-t border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] bg-[rgba(196,176,176,0.08)] dark:bg-[rgba(0,0,0,0.15)] shrink-0 space-y-2">
          <button
            onClick={() => {
              void logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-amber-500/25 bg-amber-500/10 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-colors"
            title="Sign Out & Lock Terminal"
          >
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out & Lock</span>}
          </button>

          <a
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.15)] text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Return to Public Website"
          >
            <Laptop className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>View Public Site</span>}
            <ExternalLink className="w-3 h-3 text-[#857878] dark:text-[#B5A8A8]" />
          </a>

          {!sidebarCollapsed && (
            <div className="flex items-center justify-between text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono px-1">
              <span>Your Trust, Our Service.</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
