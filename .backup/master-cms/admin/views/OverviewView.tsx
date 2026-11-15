import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Globe,
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
import {
  PHASE1_ANALYTICS_30D,
  PHASE1_ANALYTICS_7D,
  PHASE1_PREVIEW_KPIS,
  PHASE1_QUICK_SHORTCUTS,
  PHASE1_RECENT_ACTIVITY_PREVIEW,
  PHASE1_RECENT_ENQUIRIES_PREVIEW,
} from '../data/phase1MockPreview';

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const KPI_ICONS: Record<string, React.ElementType> = {
  'total-enquiries': MessageSquareText,
  'pending-enquiries': Clock,
  'total-customers': Users,
  'website-visits': Globe,
};

export const OverviewView: React.FC = () => {
  const {
    currentUser,
    ownerProfile,
    setCurrentTab,
    isFirebaseActive,
    isSupabaseActive,
  } = useAdmin();
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const ownerName = ownerProfile.fullName || currentUser?.name || 'Sharique Aman';
  const greeting = useMemo(() => getTimeGreeting(), []);
  const chartData =
    chartRange === '7d' ? PHASE1_ANALYTICS_7D : PHASE1_ANALYTICS_30D;

  return (
    <div className="space-y-8">
      {/* Editorial Hero Section with Lazy 3D Ambient Stage */}
      <section className="relative rounded-2xl bg-[#111318] border border-orange-500/20 overflow-hidden shadow-[0_0_50px_-24px_rgba(249,115,22,0.35)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.14),transparent_58%)]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8 lg:p-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-orange-400">
              <span>Aman Computer</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-[#92949B]">Owner Workspace</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-orange-100">Active</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#F5F2EC] leading-[1.12]">
              {greeting}, {ownerName}.
            </h1>

            <p className="text-sm text-[#92949B] max-w-2xl leading-relaxed">
              Welcome to your business workspace for{' '}
              <span className="text-[#F5F2EC]">
                {ownerProfile.businessIdentity || 'Aman Computer — Cyber Cafe & Digital Center'}
              </span>.
              Review customer enquiries, keep your Owner Profile and online presence up to date,
              and manage every section of your business.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab('enquiries')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-[#090A0C] text-xs font-semibold hover:brightness-110 transition-all shadow-[0_0_24px_-6px_rgba(249,115,22,0.55)] cursor-pointer"
              >
                <span>Open Customer Enquiries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('owner-profile')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-orange-500/30 bg-[#191C22] text-xs font-medium text-[#F5F2EC] hover:border-orange-400/60 hover:bg-orange-500/10 transition-colors cursor-pointer"
              >
                <span>Manage Owner Profile</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#92949B] hover:text-orange-400 transition-colors"
              >
                <span>Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 h-[210px] sm:h-[230px] rounded-xl bg-[#090A0C]/65 border border-white/[0.06] overflow-hidden relative">
            <StudioCanvasWrapper />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-[#92949B] pointer-events-none">
              <span>Aman Computer</span>
              <span className="text-orange-400">Account Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Preview KPI Cards */}
      <section aria-label="Business Overview Key Metrics" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-editorial text-2xl text-[#F5F2EC] tracking-tight">
            Business Overview
          </h2>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#92949B]">
            Sample Preview Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {PHASE1_PREVIEW_KPIS.map((kpi) => {
            const Icon = KPI_ICONS[kpi.id] || Activity;
            return (
              <button
                key={kpi.id}
                type="button"
                onClick={() => setCurrentTab(kpi.targetTab)}
                className="text-left p-5 rounded-xl bg-[#191C22] border border-white/[0.07] hover:border-orange-500/40 hover:shadow-[0_0_28px_-14px_rgba(249,115,22,0.5)] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#92949B] group-hover:text-orange-100 transition-colors">
                    {kpi.label}
                  </span>
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-editorial text-4xl font-normal text-[#F5F2EC] tabular-nums tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-xs font-mono text-orange-400 tabular-nums">
                    {kpi.delta}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-[#92949B] truncate">{kpi.detail}</span>
                  <span className="font-mono uppercase tracking-wider text-[10px] text-[#92949B]/80 shrink-0">
                    Sample
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Analytics & Status Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enquiry Analytics Chart */}
        <div className="lg:col-span-8 p-6 rounded-xl bg-[#191C22] border border-white/[0.07] flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Enquiry Trends · Sample Preview</span>
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-1 tracking-tight">
                Customer Requests &amp; Resolution Pace
              </h3>
            </div>

            <div className="inline-flex items-center rounded-lg bg-[#111318] border border-white/[0.08] p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartRange('7d')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  chartRange === '7d'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-[#090A0C] font-semibold'
                    : 'text-[#92949B] hover:text-[#F5F2EC]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30d')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                  chartRange === '30d'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-[#090A0C] font-semibold'
                    : 'text-[#92949B] hover:text-[#F5F2EC]'
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
                  <linearGradient id="studioOrangeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.34} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="studioAmberFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="period"
                  stroke="#92949B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#92949B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111318',
                    borderColor: 'rgba(249,115,22,0.38)',
                    borderRadius: '10px',
                    color: '#F5F2EC',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F5F2EC' }}
                  labelStyle={{ color: '#FB923C', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#F97316"
                  strokeWidth={2.2}
                  fillOpacity={1}
                  fill="url(#studioOrangeFill)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#FBBF24"
                  strokeWidth={1.6}
                  strokeDasharray="4 3"
                  fillOpacity={1}
                  fill="url(#studioAmberFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#92949B]">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#F97316]" />
                <span>Total Enquiries</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#FBBF24]" />
                <span>Resolved Cases</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#92949B]">
              Sample overview trend
            </span>
          </div>
        </div>

        {/* Website Status & Quick Navigation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Website & Service Health Indicator */}
          <div className="p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
                  System Health
                </div>
                <h3 className="font-editorial text-xl text-[#F5F2EC] mt-0.5">
                  Website &amp; Account Status
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-orange-400" />
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">Public Website</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F5F2EC]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">Account Security</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F5F2EC]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isFirebaseActive ? 'Protected' : 'Standby'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">Online Data Sync</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F5F2EC]">
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

          {/* Quick Navigation Shortcuts */}
          <div className="p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
              Quick Navigation
            </div>
            <div className="divide-y divide-white/[0.06]">
              {PHASE1_QUICK_SHORTCUTS.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setCurrentTab(item.tab)}
                  className="w-full py-2.5 flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#F5F2EC] group-hover:text-orange-400 transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#92949B] truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#92949B] group-hover:text-orange-400 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Operational Split: Recent Enquiries Preview + Recent Activity Timeline */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Enquiries Preview */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
                Recent Enquiries · Sample Preview
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                Incoming Customer Requests
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('enquiries')}
              className="text-xs font-medium text-orange-400 hover:text-orange-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Open Enquiries</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] font-mono uppercase tracking-[0.14em] text-[#92949B]">
                  <th className="py-2.5 pr-4 font-normal">Ref</th>
                  <th className="py-2.5 pr-4 font-normal">Applicant &amp; Service</th>
                  <th className="py-2.5 pr-4 font-normal">Status</th>
                  <th className="py-2.5 font-normal text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {PHASE1_RECENT_ENQUIRIES_PREVIEW.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setCurrentTab('enquiries')}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="py-3 pr-4 font-mono text-[11px] text-orange-400 tabular-nums whitespace-nowrap">
                      {row.id}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="font-medium text-[#F5F2EC]">
                        {row.customerName}
                      </div>
                      <div className="text-[11px] text-[#92949B] mt-0.5">
                        {row.service}
                      </div>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#F5F2EC]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'New'
                              ? 'bg-orange-400'
                              : row.status === 'In Review'
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        {row.status}
                        {row.urgency === 'Urgent' ? ' · Urgent' : ''}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-[11px] text-[#92949B] tabular-nums whitespace-nowrap">
                      {row.submittedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
                Recent Activity · Sample Preview
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                Owner Activity History
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('activity-logs')}
              className="text-xs font-medium text-orange-400 hover:text-orange-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View History</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-4 space-y-5 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
            {PHASE1_RECENT_ACTIVITY_PREVIEW.map((entry) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-orange-400 ring-4 ring-[#191C22]" />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-medium text-[#F5F2EC]">
                    {entry.action}
                    <span className="text-[#92949B] font-normal">
                      {' '}
                      · {entry.module}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-[#92949B] tabular-nums shrink-0">
                    {entry.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-[#92949B] mt-1 leading-relaxed">
                  {entry.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
