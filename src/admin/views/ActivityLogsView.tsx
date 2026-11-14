import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ActivityLog } from '../types';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  Terminal, 
  User, 
  Laptop, 
  Clock, 
  ShieldCheck, 
  Download 
} from 'lucide-react';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs, showToast } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');

  const modules = ['all', 'Services', 'Enquiries', 'Security', 'CMS Content', 'Offers', 'Notices', 'Gallery'];

  const filtered = activityLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      log.operator.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.ipAddress.includes(q);

    const matchesModule = selectedModule === 'all' || log.module.toLowerCase() === selectedModule.toLowerCase();

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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aman_cyber_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Logs Exported', `Exported ${filtered.length} audit trail records to CSV`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#201D1D] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#6B5C5C] dark:text-[#A89898]">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            Audit Trail & Workstation Forensics
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#2E2828] dark:text-[#E8E4E0] mt-1">
            Activity & Security Logs
          </h2>
          <p className="text-xs text-[#6B5C5C] dark:text-[#A89898] mt-0.5">
            Immutable log of all counter operations: rate adjustments, customer status changes, and administrator logins.
          </p>
        </div>

        <button
          onClick={exportLogs}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Audit CSV
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B5C5C] dark:text-[#A89898]" />
          <input
            type="text"
            placeholder="Search by operator, action, detail or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#DFDAD5] dark:bg-[#201D1D] border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 text-xs text-[#2E2828] dark:text-[#E8E4E0] focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-[#6B5C5C] dark:text-[#A89898] shrink-0" />
          <span className="text-xs font-mono text-[#6B5C5C] dark:text-[#A89898] shrink-0">Module:</span>
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-2.5 py-1 rounded text-xs font-medium shrink-0 cursor-pointer transition-colors ${
                selectedModule === m
                  ? 'bg-[#2E2828] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818]'
                  : 'bg-[#DFDAD5] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898]'
              }`}
            >
              {m === 'all' ? 'All' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#DFDAD5] dark:bg-[#201D1D] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-[#6B5C5C]/15 dark:border-[#C4B0B0]/15 bg-[#E4DFDA] dark:bg-[#1A1818] text-[11px] font-mono uppercase tracking-wider text-[#6B5C5C] dark:text-[#A89898]">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Operator</th>
              <th className="p-3.5">Module</th>
              <th className="p-3.5">Action</th>
              <th className="p-3.5">Log Details</th>
              <th className="p-3.5">Terminal IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#6B5C5C]/10 dark:divide-[#C4B0B0]/10 text-xs font-mono">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="p-3.5 text-[11px] text-[#8F7E7E] dark:text-[#7A6E6E] whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="p-3.5 font-bold text-[#2E2828] dark:text-[#E8E4E0] whitespace-nowrap">
                  <div className="flex items-center gap-1.5 font-sans font-medium">
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {log.operator}
                  </div>
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-[10px] bg-[#E4DFDA] dark:bg-[#252222] text-[#6B5C5C] dark:text-[#A89898] border border-[#6B5C5C]/10 dark:border-[#C4B0B0]/10">
                    {log.module}
                  </span>
                </td>
                <td className="p-3.5 font-semibold text-[#2E2828] dark:text-[#E8E4E0] whitespace-nowrap">
                  {log.action}
                </td>
                <td className="p-3.5 font-sans text-xs text-[#6B5C5C] dark:text-[#A89898] max-w-xs truncate">
                  {log.details}
                </td>
                <td className="p-3.5 text-[11px] text-[#8F7E7E] dark:text-[#7A6E6E] whitespace-nowrap">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-[#6B5C5C] dark:text-[#A89898]">
            No activity logs match your criteria.
          </div>
        )}
      </div>
    </div>
  );
};
