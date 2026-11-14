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
  const { currentUser, setCurrentTab, isFirebaseActive, isSupabaseActive } =
    useAdmin();
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');

  const ownerName = currentUser?.name || 'Sharique Aman';
  const greeting = useMemo(() => getTimeGreeting(), []);
  const chartData =
    chartRange === '7d' ? PHASE1_ANALYTICS_7D : PHASE1_ANALYTICS_30D;

  return (
    <div className="space-y-8">
      {/* Editorial Hero Section with Lazy 3D Ambient Stage */}
      <section className="relative rounded-2xl bg-[#111318] border border-[#C6A56B]/18 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(198,165,107,0.12),transparent_58%)]" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-6 p-6 sm:p-8 lg:p-10">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-[#C6A56B]">
              <span>Aman Computer</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-[#92949B]">Studio Control Center</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-[#F3EFE7]">Phase 1 Foundation</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#F5F2EC] leading-[1.12]">
              {greeting}, {ownerName}.
            </h1>

            <p className="text-sm text-[#92949B] max-w-2xl leading-relaxed">
              Your single-admin command studio for{' '}
              <span className="text-[#F3EFE7]">Aman Computer Cyber Cafe &amp; Digital Center</span>.
              Review enquiry momentum, monitor public storefront readiness, and navigate directly
              into upcoming modular workspaces.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentTab('enquiries')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C6A56B] text-[#090A0C] text-xs font-semibold hover:bg-[#F3EFE7] transition-colors"
              >
                <span>Open Customer Enquiries</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('owner-profile')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.12] bg-[#191C22] text-xs font-medium text-[#F5F2EC] hover:border-[#C6A56B]/45 transition-colors"
              >
                <span>Owner Profile</span>
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs text-[#92949B] hover:text-[#C6A56B] transition-colors"
              >
                <span>Public Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 h-[210px] sm:h-[230px] rounded-xl bg-[#090A0C]/65 border border-white/[0.06] overflow-hidden relative">
            <StudioCanvasWrapper />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.14em] text-[#92949B] pointer-events-none">
              <span>Atelier Ambient</span>
              <span className="text-[#C6A56B]">Single-Admin Lock</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Preview KPI Cards */}
      <section aria-label="Preview Key Performance Indicators" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-editorial text-2xl text-[#F5F2EC] tracking-tight">
            Operations Pulse
          </h2>
          <span className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#92949B]">
            Visual Preview · Illustrative Mock Metrics (Phase 2 connects live database)
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
                className="text-left p-5 rounded-xl bg-[#191C22] border border-white/[0.07] hover:border-[#C6A56B]/35 transition-colors group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#92949B] group-hover:text-[#F3EFE7] transition-colors">
                    {kpi.label}
                  </span>
                  <Icon className="w-4 h-4 text-[#C6A56B]" />
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="font-editorial text-4xl font-normal text-[#F5F2EC] tabular-nums tracking-tight">
                    {kpi.value}
                  </span>
                  <span className="text-xs font-mono text-[#C6A56B] tabular-nums">
                    {kpi.delta}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-[#92949B] truncate">{kpi.detail}</span>
                  <span className="font-mono uppercase tracking-wider text-[10px] text-[#92949B]/80 shrink-0">
                    Mock Preview
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
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Enquiry Analytics · Preview Mock</span>
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-1 tracking-tight">
                Inbound Requests &amp; Resolution Velocity
              </h3>
            </div>

            <div className="inline-flex items-center rounded-lg bg-[#111318] border border-white/[0.08] p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setChartRange('7d')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  chartRange === '7d'
                    ? 'bg-[#C6A56B] text-[#090A0C] font-semibold'
                    : 'text-[#92949B] hover:text-[#F5F2EC]'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setChartRange('30d')}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  chartRange === '30d'
                    ? 'bg-[#C6A56B] text-[#090A0C] font-semibold'
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
                  <linearGradient id="studioGoldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C6A56B" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#C6A56B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="studioIvoryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F3EFE7" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#F3EFE7" stopOpacity={0} />
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
                    borderColor: 'rgba(198,165,107,0.3)',
                    borderRadius: '10px',
                    color: '#F5F2EC',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#F5F2EC' }}
                  labelStyle={{ color: '#C6A56B', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  name="Enquiries"
                  stroke="#C6A56B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#studioGoldFill)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Resolved"
                  stroke="#F3EFE7"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  fillOpacity={1}
                  fill="url(#studioIvoryFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 text-xs text-[#92949B]">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#C6A56B]" />
                <span>Total Enquiries</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2.5 h-0.5 bg-[#F3EFE7]" />
                <span>Resolved Cases</span>
              </span>
            </div>
            <span className="font-mono text-[11px] text-[#92949B]">
              Illustrative preview series
            </span>
          </div>
        </div>

        {/* Website Status & Quick Navigation */}
        <div className="lg:col-span-4 space-y-6">
          {/* Website & Security Status Indicator */}
          <div className="p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
                  Environment
                </div>
                <h3 className="font-editorial text-xl text-[#F5F2EC] mt-0.5">
                  Website &amp; Security Status
                </h3>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#C6A56B]" />
            </div>

            <div className="divide-y divide-white/[0.06] text-xs">
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">Public Storefront</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F3EFE7]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Online
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">Single-Admin Auth</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F3EFE7]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isFirebaseActive ? 'Firebase Spark' : 'Standby'}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between gap-2">
                <span className="text-[#92949B]">PostgreSQL + RLS</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[#F3EFE7]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSupabaseActive ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                  />
                  {isSupabaseActive ? 'Configured' : 'Local Mode'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Navigation Shortcuts */}
          <div className="p-6 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-3">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
              Quick Navigation
            </div>
            <div className="divide-y divide-white/[0.06]">
              {PHASE1_QUICK_SHORTCUTS.map((item) => (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => setCurrentTab(item.tab)}
                  className="w-full py-2.5 flex items-center justify-between gap-3 text-left group"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#F5F2EC] group-hover:text-[#C6A56B] transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#92949B] truncate">
                      {item.subtitle}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#92949B] group-hover:text-[#C6A56B] shrink-0 transition-colors" />
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
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
                Recent Enquiries · Preview Mock
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                Incoming Citizen Requests
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('enquiries')}
              className="text-xs font-medium text-[#C6A56B] hover:text-[#F3EFE7] transition-colors inline-flex items-center gap-1"
            >
              <span>Open Workspace</span>
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
                    <td className="py-3 pr-4 font-mono text-[11px] text-[#C6A56B] tabular-nums whitespace-nowrap">
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
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-[#F3EFE7]">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'New'
                              ? 'bg-[#C6A56B]'
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
              <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
                Recent Activity · Preview Mock
              </div>
              <h3 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                Audit &amp; Studio Timeline
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('activity-logs')}
              className="text-xs font-medium text-[#C6A56B] hover:text-[#F3EFE7] transition-colors inline-flex items-center gap-1"
            >
              <span>Security Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative pl-4 space-y-5 before:content-[''] before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-white/[0.08]">
            {PHASE1_RECENT_ACTIVITY_PREVIEW.map((entry) => (
              <div key={entry.id} className="relative">
                <span className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-[#C6A56B] ring-4 ring-[#191C22]" />
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
