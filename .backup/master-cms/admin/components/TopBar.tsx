import React, { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Clock,
  Database,
  ExternalLink,
  Lock,
  Menu,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { getNavItemForTab } from '../config/navigation';
import {
  calculateOwnerProfileCompletion,
  getOwnerProfileInitials,
} from '../services/ownerProfileService';

export const TopBar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    setMobileMenuOpen,
    setSearchModalOpen,
    logout,
    currentUser,
    ownerProfile,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useAdmin();

  const activeNav = getNavItemForTab(currentTab);
  const ownerName = ownerProfile.fullName || currentUser?.name || 'Sharique Aman';
  const ownerEmail = ownerProfile.email || currentUser?.email || 'shariqueaman77@gmail.com';
  const ownerDesignation = ownerProfile.designation || currentUser?.role || 'Founder & Proprietor';
  const initials = getOwnerProfileInitials(ownerName);
  const completion = calculateOwnerProfileCompletion(ownerProfile);

  const [istTime, setIstTime] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAvatarFailed(false);
  }, [ownerProfile.profileImage]);

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
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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

  const showAvatarImg = Boolean(ownerProfile.profileImage) && !avatarFailed;

  return (
    <header className="h-16 px-4 sm:px-6 lg:px-8 bg-[#111318]/92 border-b border-white/[0.07] backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 sm:gap-4">
      {/* Left: Mobile Drawer Trigger & Editorial Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-lg text-[#92949B] hover:text-[#F5F2EC] hover:bg-[#191C22] transition-colors cursor-pointer"
          aria-label="Open studio navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs min-w-0">
          <button
            type="button"
            onClick={() => setCurrentTab('overview')}
            className="hidden sm:inline font-mono uppercase tracking-[0.12em] text-[11px] text-[#92949B] hover:text-orange-400 transition-colors shrink-0 cursor-pointer"
          >
            Aman Computer
          </button>
          <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-[#92949B]/50 shrink-0" />
          <span className="hidden md:inline font-mono uppercase tracking-[0.12em] text-[11px] text-[#92949B] shrink-0">
            {activeNav.groupTitle}
          </span>
          <ChevronRight className="hidden md:inline w-3.5 h-3.5 text-[#92949B]/50 shrink-0" />
          <span className="text-sm font-medium text-[#F5F2EC] truncate">
            {activeNav.label}
          </span>
        </nav>
      </div>

      {/* Right: Search Trigger, IST Clock, Notifications Popover, Owner Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#191C22] border border-white/[0.08] text-xs text-[#92949B] hover:border-orange-500/40 hover:text-[#F5F2EC] transition-colors cursor-pointer"
          title="Open command search (Ctrl+K or ⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden md:inline">Search workspace…</span>
          <kbd className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#090A0C] border border-white/[0.08] text-[#92949B]">
            ⌘K
          </kbd>
        </button>

        {/* Static IST Time Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#191C22]/70 border border-white/[0.06] text-xs font-mono text-[#92949B] tabular-nums select-none">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-[#F5F2EC]">{istTime || '09:00 AM'}</span>
          <span className="text-[10px] tracking-wider uppercase text-[#92949B]">IST</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg bg-[#191C22]/70 border border-white/[0.07] text-[#92949B] hover:text-[#F5F2EC] hover:border-orange-500/35 transition-colors cursor-pointer"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.9)]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl bg-[#191C22] border border-orange-500/25 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.85)] p-3.5 z-50">
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-white/[0.08]">
                <span className="text-xs font-medium text-[#F5F2EC]">
                  Studio Alerts
                  {unreadNotificationCount > 0 && (
                    <span className="ml-1.5 font-mono text-[11px] text-orange-400 tabular-nums">
                      ({unreadNotificationCount})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {unreadNotificationCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-orange-400 hover:text-orange-200 transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={clearNotifications}
                      className="p-1 rounded text-[#92949B] hover:text-rose-300 transition-colors cursor-pointer"
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
                  <div className="py-6 text-center text-xs text-[#92949B]">
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
                      className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                        !item.read
                          ? 'bg-[#111318] border-orange-500/25 text-[#F5F2EC]'
                          : 'bg-transparent border-transparent text-[#92949B] hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{item.title}</span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] opacity-80 line-clamp-2 mt-0.5">
                        {item.description}
                      </div>
                      <div className="text-[10px] font-mono opacity-60 mt-1 tabular-nums">
                        {item.timestamp}
                      </div>
                    </button>
                  ))
                )}
              </div>

              <div className="pt-2.5 mt-2.5 border-t border-white/[0.08] flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('activity-logs');
                    setNotifOpen(false);
                  }}
                  className="text-[11px] font-medium text-orange-400 hover:text-orange-200 transition-colors cursor-pointer"
                >
                  Open Security &amp; Activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Owner Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-lg bg-[#191C22]/70 border border-white/[0.07] hover:border-orange-500/35 transition-colors cursor-pointer"
            aria-expanded={profileOpen}
            aria-label="Open owner profile menu"
          >
            <div className="w-7 h-7 rounded-md bg-[#111318] border border-orange-500/40 text-orange-400 flex items-center justify-center font-editorial text-sm font-medium overflow-hidden shrink-0">
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
            <div className="hidden sm:block text-left leading-tight max-w-[140px]">
              <div className="text-xs font-medium text-[#F5F2EC] truncate">
                {ownerName}
              </div>
              <div className="text-[10px] font-mono text-[#92949B] truncate">
                {ownerDesignation}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#92949B] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#191C22] border border-orange-500/25 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.85)] p-2 z-50">
              <div className="px-2.5 py-2.5 border-b border-white/[0.08] space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-[#F5F2EC] truncate">{ownerName}</div>
                  <span className="text-[10px] font-mono text-orange-400 tabular-nums shrink-0">
                    {completion.percentage}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#92949B] truncate">
                  {ownerEmail}
                </div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-orange-400 truncate">
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
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#F5F2EC] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Owner Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('settings');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#F5F2EC] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-orange-400" />
                  <span>Owner Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('activity-logs');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#F5F2EC] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  <span>Security &amp; Activity</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('backup-restore');
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-[#F5F2EC] hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-orange-400" />
                  <span>Backup &amp; Restore</span>
                </button>
              </div>

              <div className="pt-1.5 border-t border-white/[0.08] space-y-0.5">
                <a
                  href="/"
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-[#92949B] hover:text-[#F5F2EC] hover:bg-white/[0.04] transition-colors"
                >
                  <span>View Public Website</span>
                  <ExternalLink className="w-3 h-3 text-orange-400" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    void logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-orange-100 hover:bg-orange-500/15 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-orange-400" />
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
