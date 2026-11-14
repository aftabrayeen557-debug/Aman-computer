import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { PullCordToggle } from './PullCordToggle';
import {
  Menu,
  Search,
  Bell,
  Clock,
  User,
  LogOut,
  ExternalLink,
  Settings2,
  Database,
  Ticket,
  Lock,
} from 'lucide-react';
import { AdminTab } from '../types';

export const TopBar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setMobileMenuOpen,
    setSearchModalOpen,
    logout,
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    receipts,
  } = useAdmin();

  const operatorName = currentUser?.name || 'Admin Operator';
  const operatorEmail = currentUser?.email || 'Not signed in';
  const operatorRole = currentUser?.role || 'Administrator';
  const operatorInitials = operatorName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'AC';

  const [currentTime, setCurrentTime] = useState('');
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Live IST Clock matching cyber cafe counter
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabLabels: Record<AdminTab, string> = {
    overview: 'Operations Overview',
    customers: 'Customer Directory',
    enquiries: 'Customer Enquiries',
    services: 'Services & Rate Card',
    'latest-updates': 'Latest Updates (Door 0)',
    'doc-requirements': 'Documents Need (Door 1)',
    gallery: 'Center Gallery (Door 4)',
    journey: 'Our Journey Timeline',
    'website-content': 'Website CMS Sections',
    faqs: 'FAQ Management',
    testimonials: 'Testimonial Reviews',
    'business-profile': 'Business Profile & KYC',
    receipts: 'Receipts & Token Counter',
    media: 'Media Vault',
    reports: 'Reports & Revenue Analytics',
    notifications: 'Operational Alerts',
    staff: 'Staff & Terminal Operators',
    'activity-logs': 'Audit Activity Logs',
    'backup-restore': 'Data Backup & Restore',
    settings: 'Terminal Configuration',
  };

  const activeTokensCount = receipts.filter((r) => r.status !== 'Completed & Delivered').length;

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#F0ECE9]/85 dark:bg-[#1A1818]/85 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)] backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-[#857878] dark:text-[#B5A8A8] hidden sm:inline">
            Aman Computer
          </span>
          <span className="text-[#857878] dark:text-[#B5A8A8] hidden sm:inline">/</span>
          <span className="font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
            {tabLabels[currentTab] || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Right: Search, Tokens, Clock, Pull Cord, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Trigger */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] text-xs text-[#857878] dark:text-[#B5A8A8] hover:text-[#1A1818] dark:hover:text-[#E8E4E0] transition-colors shadow-2xs"
          title="Search (CMD+K or /)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Jump</span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#6B5C5C] dark:text-[#C4B0B0]">
            ⌘K
          </kbd>
        </button>

        {/* Counter Tokens Quick Button */}
        <button
          onClick={() => setCurrentTab('receipts')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/15 transition-colors"
          title="Active Counter Tokens"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>{activeTokensCount} Tokens</span>
        </button>

        {/* Live IST Clock Chip */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] bg-[rgba(242,238,235,0.5)] dark:bg-[rgba(196,176,176,0.04)] text-xs text-[#857878] dark:text-[#B5A8A8] font-mono select-none">
          <Clock className="w-3.5 h-3.5 text-[#6B5C5C] dark:text-[#C4B0B0]" />
          <span className="text-[#1A1818] dark:text-[#E8E4E0] font-semibold tabular-nums">
            {currentTime || '08:45:00 AM'}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            IST Counter Open
          </span>
        </div>

        {/* The Physical Pull-Cord Theme Toggle */}
        <div className="px-1 flex items-center">
          <PullCordToggle />
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifDropdownOpen((prev) => !prev);
              setProfileDropdownOpen(false);
            }}
            className="relative p-2 rounded-xl text-[#6B5C5C] dark:text-[#B5A8A8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#F0ECE9] dark:ring-[#1A1818]" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.15)] shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
                <span className="text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                  Recent Alerts ({unreadNotificationCount} unread)
                </span>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[10px] text-[#6B5C5C] dark:text-[#C4B0B0] hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkToTab) setCurrentTab(n.linkToTab);
                      setNotifDropdownOpen(false);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                      !n.read
                        ? 'bg-[rgba(196,176,176,0.2)] dark:bg-[rgba(196,176,176,0.1)] text-[#1A1818] dark:text-[#E8E4E0]'
                        : 'text-[#857878] dark:text-[#B5A8A8] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold">{n.title}</div>
                    <div className="text-[11px] opacity-80 line-clamp-2 mt-0.5">{n.description}</div>
                    <div className="text-[9px] font-mono opacity-60 mt-1">{n.timestamp}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] text-center">
                <button
                  onClick={() => {
                    setCurrentTab('notifications');
                    setNotifDropdownOpen(false);
                  }}
                  className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:underline"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Operator Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileDropdownOpen((prev) => !prev);
              setNotifDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#857878] to-[#1A1818] text-white flex items-center justify-center font-bold text-xs shadow-inner">
              {operatorInitials}
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">{operatorName}</div>
              <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8]">{operatorRole}</div>
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#F0ECE9] dark:bg-[#1A1818] border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.15)] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2 border-b border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)]">
                <div className="font-bold text-xs text-[#1A1818] dark:text-[#E8E4E0]">{operatorName}</div>
                <div className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8] truncate">{operatorEmail}</div>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentTab('staff');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Workstations & Staff</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('backup-restore');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Backup & Restore</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('settings');
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Terminal Settings</span>
                </button>
              </div>

              <div className="pt-1 mt-1 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] space-y-0.5">
                <button
                  onClick={() => {
                    void logout();
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign Out / Lock Terminal</span>
                </button>

                <a
                  href="/"
                  className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>View Public Site</span>
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
