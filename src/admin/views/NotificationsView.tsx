import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { NotificationItem, AdminTab } from '../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    clearNotifications, 
    setCurrentTab,
    showToast 
  } = useAdmin();

  const [filter, setFilter] = useState<'all' | 'unread' | 'alert' | 'warning'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alert') return n.level === 'alert';
    if (filter === 'warning') return n.level === 'warning';
    return true;
  });

  const getLevelIcon = (level: NotificationItem['level']) => {
    switch (level) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleActionClick = (item: NotificationItem) => {
    markNotificationRead(item.id);
    if (item.linkToTab) {
      setCurrentTab(item.linkToTab);
      showToast('Navigated', `Opened ${item.linkToTab} module`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Operator Alerts & Activity Feeds
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Notifications Center
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Real-time cyber cafe telemetry: new customer form submissions, ink level alerts, and pending status reminders.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#252222] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 text-xs font-medium text-[#2E2828] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> Mark all read
          </button>
          <button
            onClick={clearNotifications}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#252222] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 text-xs font-medium text-red-500 hover:bg-red-500/10 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'all'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'unread'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('alert')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
            filter === 'alert'
              ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
              : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
          }`}
        >
          Urgent Alerts ({notifications.filter((n) => n.level === 'alert').length})
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              item.read
                ? 'bg-[#DFDAD5]/70 dark:bg-[#201D1D]/70 border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10 opacity-75'
                : 'bg-[#E4DFDA] dark:bg-[#252222] border-[#6B5C5C]/25 dark:border-[#C4B0B0]/25 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-[#DFDAD5] dark:bg-[#1A1818]">
                {getLevelIcon(item.level)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-xs text-[#2E2828] dark:text-[#E8E4E0]">
                    {item.title}
                  </h4>
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5 leading-relaxed">
                  {item.description}
                </p>
                <span className="text-[10px] font-mono text-[#8F7E7E] dark:text-[#7A6E6E] mt-1.5 inline-block">
                  {item.timestamp}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {item.linkToTab && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(item);
                  }}
                  className="px-2.5 py-1 rounded text-[11px] font-medium bg-[#DFDAD5] dark:bg-[#1A1818] text-[#2E2828] dark:text-[#E8E4E0] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer"
                >
                  View <ExternalLink className="w-3 h-3" />
                </button>
              )}
              {!item.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(item.id);
                  }}
                  className="p-1 rounded text-[#6B5C5C] dark:text-[#A89898] hover:text-[#2E2828] cursor-pointer"
                  title="Mark as read"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[#6B5C5C] dark:text-[#A89898] rounded-xl border border-dashed border-[#6B5C5C]/20 dark:border-[#C4B0B0]/20">
            No notifications matching this filter.
          </div>
        )}
      </div>
    </div>
  );
};
