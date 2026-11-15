import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  Filter,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { CmsPageHeader, CmsSurfaceCard } from '../components/CmsPrimitives';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs, currentUser, isSupabaseActive, showToast } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const modules = [
    'all',
    'Services',
    'Enquiries',
    'Security',
    'CMS Content',
    'Schemes',
    'Notices',
    'Gallery',
  ];

  const filtered = activityLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      log.operator.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ipAddress.includes(q);

    const matchesModule =
      selectedModule === 'all' || log.module.toLowerCase() === selectedModule.toLowerCase();

    return matchesSearch && matchesModule;
  });

  const exportLogs = () => {
    const headers = ['Timestamp', 'Operator', 'Module', 'Action', 'Details', 'IP Address'];
    const rows = filtered.map((l) => [
      `"${l.timestamp}"`,
      `"${l.operator}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `aman_computer_security_logs_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Logs Exported', `Exported ${filtered.length} records to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      <CmsPageHeader
        eyebrow="System & Security"
        title="Security & Activity"
        description="Monitor owner account protection status, active sign-in verification, and historical workspace change records."
        actions={
          <button
            type="button"
            onClick={exportLogs}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit CSV</span>
          </button>
        }
      />

      {/* Owner Account Protection Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Account Protection</span>
          </div>
          <div className="text-sm font-medium text-[#E8E5DF]">Verified Proprietor Only</div>
          <p className="text-[11px] text-[#85838A]">
            Access is restricted strictly to the verified Aman Computer owner account.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Session</span>
          </div>
          <div className="text-sm font-medium text-[#E8E5DF] truncate">
            {currentUser?.email || 'Verified Owner'}
          </div>
          <p className="text-[11px] text-[#85838A]">Email verification confirmed.</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
            Online Sync Status
          </div>
          <div
            className={`text-sm font-medium ${
              isSupabaseActive ? 'text-emerald-400' : 'text-[#DFC492]'
            }`}
          >
            {isSupabaseActive ? 'Cloud Sync Active' : 'Local Workspace Mode'}
          </div>
          <p className="text-[11px] text-[#85838A]">
            {activityLogs.length} security and content records stored.
          </p>
        </div>
      </div>

      {/* Filters */}
      <CmsSurfaceCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#85838A]" />
            <input
              type="text"
              placeholder="Search by operator, action, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#85838A] shrink-0 mr-1" />
            {modules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModule(m)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                  selectedModule === m
                    ? 'bg-[#211B16] border border-[#C9A96E]/40 text-[#DFC492]'
                    : 'bg-[#0A0A0E] border border-white/[0.06] text-[#85838A] hover:text-[#E8E5DF]'
                }`}
              >
                {m === 'all' ? 'All' : m}
              </button>
            ))}
          </div>
        </div>
      </CmsSurfaceCard>

      {/* Logs Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#141419] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-white/[0.07] bg-[#101014] text-[10px] font-mono uppercase tracking-wider text-[#85838A]">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Operator</th>
              <th className="p-3.5">Module</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-xs">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="p-3.5 text-[11px] font-mono text-[#85838A] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="p-3.5 font-medium text-[#E8E5DF] whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C9A96E]" />
                    <span>{log.operator}</span>
                  </div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#211B16] text-[#DFC492] border border-[#C9A96E]/25">
                    {log.module}
                  </span>
                </td>
                <td className="p-3.5 font-medium text-[#E8E5DF] whitespace-nowrap">
                  {log.action}
                </td>
                <td className="p-3.5 text-xs text-[#85838A] max-w-sm truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[#85838A]">
            No activity logs match your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
