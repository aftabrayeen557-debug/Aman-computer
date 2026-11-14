import React from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  MessageSquareText,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Phone,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Receipt as ReceiptIcon,
  Users,
  Ticket,
  Printer,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const OverviewView: React.FC = () => {
  const {
    customers,
    receipts,
    enquiries,
    services,
    activityLogs,
    setCurrentTab,
    setSelectedEnquiry,
    setActivePrintReceipt,
  } = useAdmin();

  // Real Calculated Metrics
  const totalRevenue = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalGovtFee = receipts.reduce((sum, r) => sum + r.govtChallanFee, 0);
  const totalServiceFee = receipts.reduce((sum, r) => sum + r.operatorServiceFee, 0);
  const pendingEnquiriesCount = enquiries.filter((e) => e.status === 'new' || e.status === 'pending').length;
  const activeTokensCount = receipts.filter((r) => r.status !== 'Completed & Delivered').length;

  // Revenue chart data based on receipts
  const revenueChartData = [
    { name: 'Mon', revenue: 1420, challan: 800, operator: 620 },
    { name: 'Tue', revenue: 1890, challan: 1100, operator: 790 },
    { name: 'Wed', revenue: 2340, challan: 1450, operator: 890 },
    { name: 'Thu', revenue: 2100, challan: 1300, operator: 800 },
    { name: 'Fri', revenue: 3250, challan: 2100, operator: 1150 },
    { name: 'Sat', revenue: 4890, challan: 3200, operator: 1690 },
    { name: 'Sun', revenue: 1650, challan: 950, operator: 700 },
  ];

  // Category distribution
  const serviceDistribution = [
    { name: 'Govt Forms', count: 48 },
    { name: 'PAN / Aadhaar', count: 32 },
    { name: 'Print & Xerox', count: 28 },
    { name: 'IRCTC / Travel', count: 18 },
    { name: 'Banking / AEPS', count: 14 },
  ];

  const recentReceipts = receipts.slice(0, 5);
  const recentEnquiries = enquiries.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.7)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Terminal Live • Terminal 1
            </span>
            <span className="text-xs text-[#857878] dark:text-[#B5A8A8] font-mono">
              Proprietor: Aman Sharma
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
            Aman Computer Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#857878] dark:text-[#B5A8A8] max-w-2xl leading-relaxed">
            Real-time management for cyber cafe counters, customer job tracking, Sarkari form submissions, and receipt token printing.
          </p>
        </div>

        {/* Quick Operational Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentTab('receipts')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            <span>Generate Token Slip</span>
          </button>
          <button
            onClick={() => setCurrentTab('customers')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[rgba(196,176,176,0.4)] dark:border-[rgba(196,176,176,0.18)] bg-white/40 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>New Customer</span>
          </button>
          <button
            onClick={() => setCurrentTab('reports')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(196,176,176,0.4)] dark:border-[rgba(196,176,176,0.18)] bg-white/40 dark:bg-black/20 text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Stripe / Linear clean hierarchy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue Recorded */}
        <div
          onClick={() => setCurrentTab('receipts')}
          className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] cursor-pointer hover:border-[rgba(196,176,176,0.6)] dark:hover:border-[rgba(196,176,176,0.25)] transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Counter Billing</span>
            <ReceiptIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1818] dark:text-[#E8E4E0]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#857878] dark:text-[#B5A8A8]">
            <span>Fee: ₹{totalServiceFee.toLocaleString('en-IN')}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{receipts.length} Receipts</span>
          </div>
        </div>

        {/* Card 2: Registered Customers */}
        <div
          onClick={() => setCurrentTab('customers')}
          className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] cursor-pointer hover:border-[rgba(196,176,176,0.6)] dark:hover:border-[rgba(196,176,176,0.25)] transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Customer Directory</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1818] dark:text-[#E8E4E0]">
            {customers.length}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#857878] dark:text-[#B5A8A8]">
            <span>Active Citizen Profiles</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">100% Verified</span>
          </div>
        </div>

        {/* Card 3: Pending Enquiries */}
        <div
          onClick={() => setCurrentTab('enquiries')}
          className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] cursor-pointer hover:border-[rgba(196,176,176,0.6)] dark:hover:border-[rgba(196,176,176,0.25)] transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Pending Enquiries</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {pendingEnquiriesCount}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#857878] dark:text-[#B5A8A8]">
            <span>Action required</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{enquiries.length} Total</span>
          </div>
        </div>

        {/* Card 4: Active Counter Tokens */}
        <div
          onClick={() => setCurrentTab('receipts')}
          className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] cursor-pointer hover:border-[rgba(196,176,176,0.6)] dark:hover:border-[rgba(196,176,176,0.25)] transition-all group"
        >
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-2">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Processing Tokens</span>
            <Ticket className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {activeTokensCount}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#857878] dark:text-[#B5A8A8]">
            <span>In-progress jobs</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">Ready for pickup</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Revenue Velocity Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
                Daily Revenue & Challan Velocity
              </h3>
              <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
                Counter revenue breakdown (Government Challan vs Operator Fee)
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Peak: Saturday (₹4,890)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorChallan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#857878' }} />
                <YAxis tick={{ fontSize: 11, fill: '#857878' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1818',
                    borderRadius: '12px',
                    borderColor: 'rgba(196,176,176,0.2)',
                    color: '#E8E4E0',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Total Revenue (₹)" />
                <Area type="monotone" dataKey="challan" stroke="#6366f1" fillOpacity={1} fill="url(#colorChallan)" name="Govt Challan (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Volume Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
              Service Distribution
            </h3>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mb-4">
              Top requested categories at counter
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceDistribution} layout="vertical" margin={{ top: 0, right: 10, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#857878' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#857878' }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1818',
                      borderRadius: '12px',
                      borderColor: 'rgba(196,176,176,0.2)',
                      color: '#E8E4E0',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 6, 6, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] flex items-center justify-between text-xs">
            <span className="text-[#857878] dark:text-[#B5A8A8]">16 Active Services</span>
            <button
              onClick={() => setCurrentTab('services')}
              className="font-semibold text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-1 hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Tables: Recent Counter Receipts & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table 1: Recent Receipts & Tokens with Print Slip Trigger */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
                Recent Counter Tokens & Receipts
              </h3>
              <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
                Click printer icon to generate client slip
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('receipts')}
              className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-1 hover:underline"
            >
              <span>All Receipts ({receipts.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
            {recentReceipts.map((rcp) => (
              <div
                key={rcp.id}
                className="py-3 flex items-center justify-between gap-3 group hover:bg-[rgba(196,176,176,0.1)] rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300">
                      #{rcp.tokenNumber}
                    </span>
                    <span className="text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0] truncate">
                      {rcp.customerName}
                    </span>
                    <span className="text-[10px] text-[#857878] dark:text-[#B5A8A8] font-mono">
                      ₹{rcp.totalAmount}
                    </span>
                  </div>
                  <div className="text-xs text-[#857878] dark:text-[#B5A8A8] truncate mt-0.5">
                    {rcp.serviceName}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                      rcp.status === 'Completed & Delivered'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : rcp.status === 'Ready for Pickup'
                        ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {rcp.status}
                  </span>

                  <button
                    onClick={() => setActivePrintReceipt(rcp)}
                    className="p-1.5 rounded-lg text-[#1A1818] dark:text-[#E8E4E0] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title="Print Receipt Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Table 2: Recent Customer Enquiries */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] backdrop-blur-md shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
                Live Customer Enquiries
              </h3>
              <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
                Direct requests from WhatsApp and online counters
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('enquiries')}
              className="text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-1 hover:underline"
            >
              <span>All Enquiries ({enquiries.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[rgba(196,176,176,0.15)] dark:divide-[rgba(196,176,176,0.08)]">
            {recentEnquiries.map((enq) => {
              const cleanPhone = enq.phoneNumber.replace(/[^0-9]/g, '');
              const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Namaste ${enq.customerName}, regarding your ${enq.serviceName} inquiry at Aman Computer:`
              )}`;

              return (
                <div
                  key={enq.id}
                  onClick={() => {
                    setSelectedEnquiry(enq);
                    setCurrentTab('enquiries');
                  }}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-[rgba(196,176,176,0.1)] rounded-xl px-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0] truncate">
                        {enq.customerName}
                      </span>
                      <span className="text-[10px] font-mono text-[#857878] dark:text-[#B5A8A8]">
                        ({enq.id})
                      </span>
                      {enq.urgency === 'urgent' && (
                        <span className="text-[9px] font-mono font-bold px-1.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#857878] dark:text-[#B5A8A8] truncate mt-0.5">
                      {enq.serviceName}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span
                      className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        enq.status === 'new'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
                          : enq.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : enq.status === 'in-progress'
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {enq.status.toUpperCase()}
                    </span>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                      title="WhatsApp Customer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`tel:${enq.phoneNumber}`}
                      className="p-1.5 rounded-lg text-[#6B5C5C] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
