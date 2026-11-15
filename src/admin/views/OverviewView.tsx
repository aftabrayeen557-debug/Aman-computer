import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Layers,
  MessageSquareText,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAdmin } from '../context/AdminContext';
import { StudioCanvasWrapper } from '../components/three/StudioCanvasWrapper';
import { ADMIN_QUICK_SHORTCUTS } from '../data/phase1MockPreview';
import { AdminTab, Enquiry } from '../types';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function parseEnquiryDate(raw: string): Date | null {
  if (!raw) return null;
  const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) {
    const dt = new Date(`${isoMatch[1]}T00:00:00`);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildTrendBuckets(
  enquiries: Enquiry[],
  days: 7 | 30
): Array<{ period: string; enquiries: number; resolved: number }> {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (days === 7) {
    const buckets: Array<{ key: string; period: string; enquiries: number; resolved: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const period = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      buckets.push({ key, period, enquiries: 0, resolved: 0 });
    }
    for (const enq of enquiries) {
      const dt = parseEnquiryDate(enq.createdAt);
      if (!dt) continue;
      const key = dt.toISOString().slice(0, 10);
      const match = buckets.find((b) => b.key === key);
      if (match) {
        match.enquiries += 1;
        if (enq.status === 'completed') match.resolved += 1;
      }
    }
    return buckets.map(({ period, enquiries: count, resolved }) => ({
      period,
      enquiries: count,
      resolved,
    }));
  }

  // 30 days grouped into 6 five-day windows
  const windows: Array<{
    startMs: number;
    endMs: number;
    period: string;
    enquiries: number;
    resolved: number;
  }> = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 5);
    const start = new Date(end);
    start.setDate(end.getDate() - 4);
    const period = `${start.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`;
    windows.push({
      startMs: start.getTime(),
      endMs: end.getTime() + 86400000 - 1,
      period,
      enquiries: 0,
      resolved: 0,
    });
  }
  for (const enq of enquiries) {
    const dt = parseEnquiryDate(enq.createdAt);
    if (!dt) continue;
    const ms = dt.getTime();
    const match = windows.find((w) => ms >= w.startMs && ms <= w.endMs);
    if (match) {
      match.enquiries += 1;
      if (enq.status === 'completed') match.resolved += 1;
    }
  }
  return windows.map(({ period, enquiries: count, resolved }) => ({
    period,
    enquiries: count,
    resolved,
  }));
}

export const OverviewView: React.FC = () => {
  const {
    currentUser,
    ownerProfile,
    setCurrentTab,
    isFirebaseActive,
    isSupabaseActive,
    enquiries,
    setSelectedEnquiry,
    customers,
    services,
    latestUpdates,
    governmentSchemes,
    gallery,
    websiteContent,
    activityLogs,
  } = useAdmin();
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const ownerName = ownerProfile.fullName || currentUser?.name || 'Sharique Aman';
  const greeting = useMemo(() => getTimeGreeting(), []);

  const pendingEnquiriesCount = useMemo(
    () =>
      enquiries.filter(
        (e) => e.status === 'new' || e.status === 'pending' || e.status === 'in-progress'
      ).length,
    [enquiries]
  );

  const urgentEnquiriesCount = useMemo(
    () =>
      enquiries.filter((e) => e.status !== 'completed' && e.urgency === 'urgent')
        .length,
    [enquiries]
  );

  const publishedContentCount = useMemo(() => {
    const pubServices = services.filter((s) => s.visible).length;
    const pubUpdates = latestUpdates.filter((u) => u.published).length;
    const pubSchemes = governmentSchemes.filter((s) => s.published).length;
    const pubGallery = gallery.filter((g) => g.visible).length;
    return pubServices + pubUpdates + pubSchemes + pubGallery;
  }, [services, latestUpdates, governmentSchemes, gallery]);

  const kpis = useMemo<
    Array<{
      id: string;
      label: string;
      value: string;
      delta: string;
      detail: string;
      targetTab: AdminTab;
      icon: React.ElementType;
    }>
  >(
    () => [
      {
        id: 'total-enquiries',
        label: 'Total Enquiries',
        value: String(enquiries.length),
        delta: `${enquiries.filter((e) => e.status === 'completed').length} resolved`,
        detail: 'All recorded customer requests',
        targetTab: 'enquiries',
        icon: MessageSquareText,
      },
      {
        id: 'pending-enquiries',
        label: 'Pending / Active',
        value: String(pendingEnquiriesCount),
        delta: urgentEnquiriesCount > 0 ? `${urgentEnquiriesCount} urgent` : 'On track',
        detail: 'Open walk-in & online inquiries',
        targetTab: 'enquiries',
        icon: Clock,
      },
      {
        id: 'total-customers',
        label: 'Registered Customers',
        value: String(customers.length),
        delta: 'Directory',
        detail: 'Saved citizen & applicant profiles',
        targetTab: 'customers',
        icon: Users,
      },
      {
        id: 'published-content',
        label: 'Published Content',
        value: String(publishedContentCount),
        delta: `${governmentSchemes.filter((s) => s.published).length} schemes`,
        detail: 'Live services, schemes, updates & photos',
        targetTab: 'government-schemes',
        icon: Layers,
      },
    ],
    [
      enquiries,
      pendingEnquiriesCount,
      urgentEnquiriesCount,
      customers.length,
      publishedContentCount,
      governmentSchemes,
    ]
  );

  const chartData = useMemo(
    () => buildTrendBuckets(enquiries, chartRange === '7d' ? 7 : 30),
    [enquiries, chartRange]
  );

  const recentEnquiries = useMemo(() => enquiries.slice(0, 6), [enquiries]);
  const recentLogs = useMemo(() => activityLogs.slice(0, 6), [activityLogs]);
  const isMaintenance = Boolean(websiteContent.websiteSettings?.maintenanceMode);

  return (
    <div className="space-y-8">
      {/* Editorial Hero Section */}
      <section className="relative rounded-2xl bg-[#141419] border border-[#C9A96E]/25 overflow-hidden shadow-[0_0_50px_-24px_rgba(201,169,110,0.28)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(201,169,110,0.12),transparent_58%)]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8 lg:p-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#C9A96E]">
              <span>Aman Computer</span>
              <span className="text-[#85838A]">·</span>
              <span className="text-[#85838A]">Owner Control Center</span>
              <span className="text-[#85838A]">·</span>
              <span className="text-[#DFC492]">
                {isMaintenance ? 'Maintenance Screen On' : 'Live'}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#E8E5DF] leading-[1.12]">
              {greeting}, {ownerName}.
            </h1>

            <p className="text-sm text-[#85838A] max-w-2xl leading-relaxed">
              Manage{' '}
              <span className="text-[#E8E5DF]">
                {ownerProfile.businessIdentity ||
                  'Aman Computer — Cyber Cafe & Digital Center'}
              </span>
              . Track citizen enquiries, publish verified government schemes, update the four homepage doors, and maintain full control of your brand identity.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab('enquiries')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer"
              >
                <span>Open Customer Enquiries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('government-schemes')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C9A96E]/35 bg-[#211B16] text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/65 transition-colors cursor-pointer"
              >
                <span>Manage Govt Schemes</span>
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#85838A] hover:text-[#DFC492] transition-colors"
              >
                <span>Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 h-[210px] sm:h-[230px] rounded-xl bg-[#0A0A0E]/75 border border-white/[0.06] overflow-hidden relative">
            <StudioCanvasWrapper />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A] pointer-events-none">
              <span>Aman Computer</span>
              <span className="text-[#C9A96E]">Account Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Business KPIs */}
      <section aria-label="Business Overview Key Metrics" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-editorial text-2xl text-[#E8E5DF] tracking-tight">
            Business Overview
          </h2>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
            Live Workspace Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon || Activity;
            return (
              <button
                key={kpi.id}
                type="button"
                onClick={() => setCurrentTab(kpi.targetTab)}
                className="text-left p-5 rounded-2xl bg-[#141419] border border-white/[0.07] hover:border-[#C9A96E]/45 transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#85838A] group-hover:text-[#E8E5DF] transition-colors">
                    {kpi.label}
                  </span>
                  <Icon className="w-4 h-4 text-[#C9A96E]" />
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-editorial text-4xl font-normal text-[#E8E5DF] tabular-nums tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-xs font-mono text-[#C9A96E] tabular-nums">
                    {kpi.delta}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-[#85838A] truncate">{kpi.detail}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#85838A] group-hover:text-[#DFC492] shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Analytics & Status Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#141419] border border-white/[0.07] flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Enquiry Volume</span>
              </div>
              <h3 className="font-editorial text-2xl text-[#E8E5DF] mt-1 tracking-tight">
                Customer Requests &amp; Resolution Pace
              </h3>
            </div>

            <div className="inline-flex items-center rounded-xl bg-[#101014] border border-white/[0.08] p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartRange('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  chartRange === '7d'
                    ? 'bg-[#C9A96E] text-[#0A0A0E] font-semibold'
                    : 'text-[#85838A] hover:text-[#E8E5DF]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  chartRange === '30d'
                    ? 'bg-[#C9A96E] text-[#0A0A0E] font-semibold'
                    : 'text-[#85838A] hover:text-[#E8E5DF]'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="studioGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="studioLightGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DFC492" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#DFC492" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="#85838A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#85838A"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101014',
                    borderColor: 'rgba(201,169,110,0.4)',
                    borderRadius: '10px',
                    color: '#E8E5DF',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#E8E5DF' }}
                  labelStyle={{ color: '#C9A96E', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#C9A96E"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#studioGoldFill)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#DFC492"
                  strokeWidth={1.6}
                  strokeDasharray="4 3"
                  fillOpacity={1}
                  fill="url(#studioLightGoldFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#85838A]">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#C9A96E]" />
                <span>Total Enquiries</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#DFC492]" />
                <span>Completed Cases</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#85838A]">
              Calculated from recorded enquiries
            </span>
          </div>
        </div>

        {/* Website Status & Quick Navigation */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                  Storefront Status
                </div>
                <h3 className="font-editorial text-xl text-[#E8E5DF] mt-0.5">
                  Website &amp; Account Health
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#C9A96E]" />
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Public Website</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#E8E5DF]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isMaintenance ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  />
                  {isMaintenance ? 'Maintenance Mode' : 'Online'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Account Protection</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#E8E5DF]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isFirebaseActive ? 'Protected' : 'Standby'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#85838A]">Online Data Sync</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#E8E5DF]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isSupabaseActive ? 'Services Operational' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
              Quick Shortcuts
            </div>
            <div className="divide-y divide-white/[0.06]">
              {ADMIN_QUICK_SHORTCUTS.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setCurrentTab(item.tab)}
                  className="w-full py-2.5 flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#E8E5DF] group-hover:text-[#DFC492] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#85838A] truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#85838A] group-hover:text-[#C9A96E] shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Operational Split: Live Recent Enquiries + Live Activity Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                Customer Queue
              </div>
              <h3 className="font-editorial text-2xl text-[#E8E5DF] mt-0.5">
                Recent Customer Enquiries
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('enquiries')}
              className="text-xs font-medium text-[#C9A96E] hover:text-[#DFC492] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="rounded-xl bg-[#0A0A0E] border border-dashed border-white/[0.08] py-10 px-6 text-center text-xs text-[#85838A]">
              No customer enquiries recorded yet. Incoming public enquiries will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.14em] text-[#85838A]">
                    <th className="py-2.5 pr-4 font-normal">Ref</th>
                    <th className="py-2.5 pr-4 font-normal">Applicant &amp; Service</th>
                    <th className="py-2.5 pr-4 font-normal">Status</th>
                    <th className="py-2.5 font-normal text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-xs">
                  {recentEnquiries.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => {
                        setSelectedEnquiry(row);
                        setCurrentTab('enquiries');
                      }}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#C9A96E] tabular-nums whitespace-nowrap">
                        {row.id}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-[#E8E5DF]">
                          {row.customerName}
                        </div>
                        <div className="text-[11px] text-[#85838A] mt-0.5 truncate max-w-[240px]">
                          {row.serviceName}
                        </div>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-[#E8E5DF] capitalize">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              row.status === 'new'
                                ? 'bg-[#C9A96E]'
                                : row.status === 'completed'
                                ? 'bg-emerald-400'
                                : 'bg-amber-400'
                            }`}
                          />
                          {row.status}
                          {row.urgency === 'urgent' ? ' · Urgent' : ''}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-[11px] text-[#85838A] tabular-nums whitespace-nowrap">
                        {row.createdAt.slice(0, 16)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Activity Timeline */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#141419] border border-white/[0.07] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C9A96E]">
                Audit Stream
              </div>
              <h3 className="font-editorial text-2xl text-[#E8E5DF] mt-0.5">
                Owner Activity History
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('activity-logs')}
              className="text-xs font-medium text-[#C9A96E] hover:text-[#DFC492] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open Security &amp; Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="rounded-xl bg-[#0A0A0E] border border-dashed border-white/[0.08] py-10 px-6 text-center text-xs text-[#85838A]">
              No recent workspace actions recorded in this session yet.
            </div>
          ) : (
            <div className="relative pl-4 space-y-5 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
              {recentLogs.map((entry) => (
                <div key={entry.id} className="relative">
                  <span className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-[#C9A96E] ring-4 ring-[#141419]" />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-[#E8E5DF]">
                      {entry.action}
                      <span className="text-[#85838A] font-normal">
                        {' '}
                        · {entry.module}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono text-[#85838A] tabular-nums shrink-0">
                      {entry.timestamp.slice(0, 10)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#85838A] mt-1 leading-relaxed line-clamp-2">
                    {entry.details}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
