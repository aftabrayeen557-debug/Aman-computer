import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Layers,
  MessageSquare,
  Phone,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdmin } from '../context/AdminContext';
import {
  AnalyticsDatePreset,
  CustomDateRange,
  buildEnquiryAnalytics,
  buildEnquiryTrendSeries,
  filterEnquiriesByDateRange,
  formatDurationHuman,
  getDateRangeBounds,
} from '../services/enquiryAnalyticsService';

const DATE_PRESETS: Array<{ id: AnalyticsDatePreset; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'this-month', label: 'This Month' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom Range' },
];

export const EnquiryAnalyticsPanel: React.FC<{
  onOpenFollowUps?: () => void;
  onFilterByStatus?: (status: 'new' | 'contacted' | 'pending' | 'in-progress' | 'completed') => void;
}> = ({ onOpenFollowUps, onFilterByStatus }) => {
  const { enquiries, enquiryFollowUps, darkMode, dbSyncStatus } = useAdmin();

  const [datePreset, setDatePreset] = useState<AnalyticsDatePreset>('30d');
  const [customRange, setCustomRange] = useState<CustomDateRange>(() => {
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    return { startDate: start, endDate: today };
  });
  const [trendGranularity, setTrendGranularity] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const filteredEnquiries = useMemo(
    () => filterEnquiriesByDateRange(enquiries, datePreset, customRange),
    [enquiries, datePreset, customRange]
  );

  const rangeBounds = useMemo(
    () => getDateRangeBounds(datePreset, customRange),
    [datePreset, customRange]
  );

  const summary = useMemo(
    () => buildEnquiryAnalytics(filteredEnquiries, enquiryFollowUps),
    [filteredEnquiries, enquiryFollowUps]
  );

  const trendSeries = useMemo(
    () => buildEnquiryTrendSeries(filteredEnquiries, trendGranularity),
    [filteredEnquiries, trendGranularity]
  );

  const hasTrendVolume = trendSeries.some((p) => p.total > 0);
  const isSyncing = dbSyncStatus === 'syncing' && enquiries.length === 0;

  const chartPrimary = darkMode ? '#f1e7d6' : '#8c5d23';
  const chartSecondary = '#34d399';
  const chartAxis = darkMode ? 'rgba(241,231,214,0.58)' : 'rgba(46,30,15,0.68)';
  const chartGrid = darkMode ? 'rgba(255,232,200,0.08)' : 'rgba(116,76,34,0.12)';

  const kpiCards = [
    { label: 'Total Enquiries', value: summary.total, hint: rangeBounds.label, tone: 'text-[var(--st-tx)]' },
    { label: 'New / Unread', value: summary.newCount, hint: 'Awaiting first touch', tone: 'text-sky-600 dark:text-sky-300', clickStatus: 'new' as const },
    { label: 'Contacted', value: summary.contactedCount, hint: 'Initial outreach done', tone: 'text-indigo-600 dark:text-indigo-300', clickStatus: 'contacted' as const },
    { label: 'Pending Docs', value: summary.pendingCount, hint: 'Waiting on applicant', tone: 'text-[#8c5d23] dark:text-[#DFC492]', clickStatus: 'pending' as const },
    { label: 'In Progress', value: summary.inProgressCount, hint: 'Active processing', tone: 'text-violet-600 dark:text-violet-300', clickStatus: 'in-progress' as const },
    { label: 'Completed', value: summary.completedCount, hint: 'Resolved & delivered', tone: 'text-emerald-600 dark:text-emerald-300', clickStatus: 'completed' as const },
    {
      label: 'Cancelled / Lost',
      value: summary.cancelledCount + summary.notInterestedCount,
      hint: `${summary.cancelledCount} cancelled · ${summary.notInterestedCount} not interested`,
      tone: 'text-rose-600 dark:text-rose-300',
    },
    {
      label: 'Conversion Rate',
      value: `${summary.conversionRate}%`,
      hint: summary.conversionFormulaLabel,
      tone: 'text-[#94652a] dark:text-[#C9A96E]',
    },
  ];

  if (isSyncing) {
    return (
      <div className="space-y-4 animate-pulse" aria-label="Loading enquiry analytics">
        <div className="h-14 rounded-2xl studio-glass-soft" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl studio-glass-soft" />
          ))}
        </div>
        <div className="h-72 rounded-2xl studio-glass-card" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Date Filter Bar */}
      <div className="rounded-[18px] studio-glass-card p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E] mr-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Period</span>
          </span>
          {DATE_PRESETS.map((preset) => {
            const active = datePreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setDatePreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#C9A96E] dark:text-[#1c1208] font-semibold'
                    : 'bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--st-line)] text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <label className="text-[var(--st-mut)] font-mono">From</label>
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="px-2.5 py-1.5 rounded-xl studio-glass-input text-xs font-mono outline-none"
            />
            <label className="text-[var(--st-mut)] font-mono">To</label>
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="px-2.5 py-1.5 rounded-xl studio-glass-input text-xs font-mono outline-none"
            />
          </div>
        )}
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            onClick={() => card.clickStatus && onFilterByStatus?.(card.clickStatus)}
            className={`p-4 rounded-[18px] studio-glass-soft transition-colors ${
              card.clickStatus ? 'hover:border-[#C9A96E]/55 cursor-pointer' : ''
            }`}
          >
            <div className="text-[11px] font-medium text-[var(--st-mut)]">{card.label}</div>
            <div
              className={`mt-2 font-editorial text-3xl font-semibold tabular-nums tracking-tight ${card.tone}`}
            >
              {card.value}
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--st-line)] text-[10px] font-mono text-[var(--st-mut)] truncate" title={card.hint}>
              {card.hint}
            </div>
          </div>
        ))}
      </div>

      {/* Response & Follow-up Timing Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[18px] studio-glass-card flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Avg First Response
            </div>
            <div className="mt-1.5 font-editorial text-2xl font-semibold text-[var(--st-tx)] tabular-nums">
              {formatDurationHuman(summary.responseMetrics.averageFirstResponseMinutes)}
            </div>
            <div className="text-[11px] text-[var(--st-mut)] mt-1">
              {summary.responseMetrics.firstResponseSampleCount > 0
                ? `Based on ${summary.responseMetrics.firstResponseSampleCount} timestamped enquiries`
                : 'No recorded responses yet'}
            </div>
          </div>
          <Clock className="w-4 h-4 text-[#C9A96E] shrink-0 mt-1" />
        </div>

        <div className="p-4 rounded-[18px] studio-glass-card flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Avg Resolution Time
            </div>
            <div className="mt-1.5 font-editorial text-2xl font-semibold text-[var(--st-tx)] tabular-nums">
              {formatDurationHuman(summary.responseMetrics.averageResolutionMinutes)}
            </div>
            <div className="text-[11px] text-[var(--st-mut)] mt-1">
              {summary.responseMetrics.resolutionSampleCount > 0
                ? `Based on ${summary.responseMetrics.resolutionSampleCount} completed cases`
                : 'No completed cases with completion time yet'}
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
        </div>

        <div className="p-4 rounded-[18px] studio-glass-card flex items-start justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Unanswered Enquiries
            </div>
            <div className="mt-1.5 font-editorial text-2xl font-semibold text-[var(--st-tx)] tabular-nums">
              {summary.responseMetrics.unansweredCount}
            </div>
            <div className="text-[11px] text-[var(--st-mut)] mt-1">
              Open enquiries awaiting outreach
            </div>
          </div>
          <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-1" />
        </div>

        <button
          type="button"
          onClick={onOpenFollowUps}
          className="text-left p-4 rounded-[18px] studio-glass-card hover:border-[#C9A96E]/55 transition-colors flex items-start justify-between gap-3 cursor-pointer"
        >
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Overdue Follow-ups
            </div>
            <div
              className={`mt-1.5 font-editorial text-2xl font-semibold tabular-nums ${
                summary.responseMetrics.overdueFollowUpsCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-[var(--st-tx)]'
              }`}
            >
              {summary.responseMetrics.overdueFollowUpsCount}
            </div>
            <div className="text-[11px] text-[var(--st-mut)] mt-1">
              {summary.responseMetrics.dueTodayFollowUpsCount} scheduled for today
            </div>
          </div>
          <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0 mt-1" />
        </button>
      </div>

      {/* Trends Chart */}
      <div className="p-5 sm:p-6 rounded-[20px] studio-glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-[0.16em] text-[#C9A96E]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Enquiry Trends</span>
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl text-[var(--st-tx)] mt-0.5">
              Intake &amp; Conversion Volume
            </h3>
          </div>

          <div className="inline-flex items-center rounded-xl bg-black/[0.05] dark:bg-black/35 border border-[var(--st-line)] p-1 self-start">
            {(['daily', 'weekly', 'monthly'] as const).map((gran) => (
              <button
                key={gran}
                type="button"
                onClick={() => setTrendGranularity(gran)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-colors cursor-pointer ${
                  trendGranularity === gran
                    ? 'bg-[#20150b] text-[#f6ecdc] dark:bg-[#f1e8da] dark:text-[#20150b] font-semibold'
                    : 'text-[var(--st-mut)] hover:text-[var(--st-tx)]'
                }`}
              >
                {gran}
              </button>
            ))}
          </div>
        </div>

        {!hasTrendVolume ? (
          <div className="h-[230px] rounded-xl border border-dashed border-[var(--st-line)] flex flex-col items-center justify-center text-center px-6">
            <BarChart3 className="w-7 h-7 text-[var(--st-mut)] mb-2 opacity-60" />
            <p className="text-xs font-medium text-[var(--st-tx)]">
              No enquiries recorded in this time window
            </p>
            <p className="text-[11px] text-[var(--st-mut)] mt-1">
              Charts reflect live records only — try switching the date filter above to All Time.
            </p>
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {trendGranularity === 'monthly' ? (
                <BarChart data={trendSeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="label" stroke={chartAxis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke={chartAxis} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(20, 13, 8, 0.94)' : 'rgba(255, 250, 242, 0.94)',
                      borderColor: 'rgba(148, 100, 42, 0.35)',
                      borderRadius: '12px',
                      color: darkMode ? '#f1e7d6' : '#24180d',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" name="Enquiries" fill={chartPrimary} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill={chartSecondary} radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={trendSeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="enqAnalyticsGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartPrimary} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={chartPrimary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="enqAnalyticsEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartSecondary} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={chartSecondary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartGrid} strokeDasharray="3 5" vertical={false} />
                  <XAxis dataKey="label" stroke={chartAxis} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} stroke={chartAxis} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? 'rgba(20, 13, 8, 0.94)' : 'rgba(255, 250, 242, 0.94)',
                      borderColor: 'rgba(148, 100, 42, 0.35)',
                      borderRadius: '12px',
                      color: darkMode ? '#f1e7d6' : '#24180d',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="total" name="Enquiries" stroke={chartPrimary} strokeWidth={2.2} fill="url(#enqAnalyticsGold)" />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke={chartSecondary} strokeWidth={1.8} fill="url(#enqAnalyticsEmerald)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Distributions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Service-wise Distribution */}
        <div className="p-5 rounded-[20px] studio-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                Demand Breakdown
              </div>
              <h3 className="font-editorial text-xl text-[var(--st-tx)] mt-0.5">
                By Service
              </h3>
            </div>
            <Layers className="w-4 h-4 text-[#C9A96E]" />
          </div>

          {summary.serviceDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--st-mut)]">
              No service distribution data in this period.
            </div>
          ) : (
            <div className="space-y-3">
              {summary.serviceDistribution.slice(0, 6).map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[var(--st-tx)] font-medium truncate" title={item.label}>
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--st-mut)] tabular-nums shrink-0">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.07] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(4, item.percentage)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Method Distribution */}
        <div className="p-5 rounded-[20px] studio-glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                Channel Preference
              </div>
              <h3 className="font-editorial text-xl text-[var(--st-tx)] mt-0.5">
                Contact Method
              </h3>
            </div>
            <Phone className="w-4 h-4 text-[#C9A96E]" />
          </div>

          {summary.total === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--st-mut)]">
              No enquiries recorded for this period.
            </div>
          ) : (
            <div className="space-y-3">
              {summary.contactMethodDistribution.map((item) => (
                <div key={item.key} className="p-3 rounded-xl studio-glass-soft space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--st-tx)]">{item.label}</span>
                    <span className="font-mono tabular-nums text-[var(--st-tx)]">
                      {item.count} · {item.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-[var(--st-mut)] tabular-nums">
                    {item.completedCount} converted to completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status & Priority Distribution */}
        <div className="p-5 rounded-[20px] studio-glass-card space-y-4">
          <div>
            <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Pipeline &amp; Triage
            </div>
            <h3 className="font-editorial text-xl text-[var(--st-tx)] mt-0.5">
              Status &amp; Priority
            </h3>
          </div>

          <div className="space-y-2">
            {summary.statusDistribution.map((item) => (
              <div key={item.key} className="flex items-center justify-between text-xs py-1">
                <span className="inline-flex items-center gap-2 text-[var(--st-tx)]">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--st-mut)] tabular-nums">
                  {item.count} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[var(--st-line)] grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="text-[10px] font-mono text-rose-600 dark:text-rose-300">HIGH</div>
              <div className="text-base font-editorial font-semibold text-[var(--st-tx)] tabular-nums">
                {summary.priorityCounts.high}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#C9A96E]/12 border border-[#C9A96E]/30">
              <div className="text-[10px] font-mono text-[#8c5d23] dark:text-[#DFC492]">MEDIUM</div>
              <div className="text-base font-editorial font-semibold text-[var(--st-tx)] tabular-nums">
                {summary.priorityCounts.medium}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-[var(--st-line)]">
              <div className="text-[10px] font-mono text-[var(--st-mut)]">LOW</div>
              <div className="text-base font-editorial font-semibold text-[var(--st-tx)] tabular-nums">
                {summary.priorityCounts.low}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
