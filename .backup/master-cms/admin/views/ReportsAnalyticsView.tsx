import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  PieChart as PieIcon,
  ShieldCheck,
  ArrowUpRight,
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const ReportsAnalyticsView: React.FC = () => {
  const { receipts, customers, services } = useAdmin();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  const totalRevenue = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalChallan = receipts.reduce((sum, r) => sum + r.govtChallanFee, 0);
  const totalOperatorFee = receipts.reduce((sum, r) => sum + r.operatorServiceFee, 0);
  const avgOrderValue = receipts.length > 0 ? Math.round(totalRevenue / receipts.length) : 0;

  // Monthly Revenue Trend
  const monthlyData = [
    { month: 'Jun', total: 42500, fee: 18200 },
    { month: 'Jul', total: 48900, fee: 21400 },
    { month: 'Aug', total: 54200, fee: 24100 },
    { month: 'Sep', total: 61800, fee: 27900 },
    { month: 'Oct', total: 68400, fee: 31200 },
    { month: 'Nov', total: 72900, fee: 33800 },
  ];

  // Category Revenue Share
  const categoryData = [
    { name: 'Govt Job Forms', value: 42, color: '#3b82f6' },
    { name: 'PAN & Identity', value: 24, color: '#10b981' },
    { name: 'Print & Xerox', value: 16, color: '#f59e0b' },
    { name: 'IRCTC & Travel', value: 12, color: '#8b5cf6' },
    { name: 'Banking & AEPS', value: 6, color: '#ec4899' },
  ];

  // Payment Mode Breakdown
  const upiCount = receipts.filter((r) => r.paymentMode === 'UPI').length;
  const cashCount = receipts.filter((r) => r.paymentMode === 'Cash').length;
  const pendingCount = receipts.filter((r) => r.paymentMode === 'Pending').length;

  const paymentData = [
    { name: 'UPI / QR', count: upiCount || 1, color: '#10b981' },
    { name: 'Cash at Counter', count: cashCount || 1, color: '#3b82f6' },
    { name: 'Pending', count: pendingCount || 0, color: '#f59e0b' },
  ];

  const handleExportFullReport = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Gross Revenue (₹)', totalRevenue],
      ['Total Govt Challan (₹)', totalChallan],
      ['Total Operator Service Fee (₹)', totalOperatorFee],
      ['Total Token Slips Issued', receipts.length],
      ['Average Order Value (₹)', avgOrderValue],
      ['Active Customers on Record', customers.length],
      ['Active Services in Catalog', services.length],
      ['Report Generated Date', new Date().toISOString()],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `Aman_Computer_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.1)]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Reports & Financial Analytics</span>
          </h1>
          <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5">
            Audit cyber cafe counter earnings, government challan flows, payment modes, and service demand.
          </p>
        </div>

        <button
          onClick={handleExportFullReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1818] text-[#E8E4E0] dark:bg-[#E8E4E0] dark:text-[#1A1818] text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Financial Audit</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-1">
            <span className="font-semibold uppercase text-[10px]">Gross Counter Billing</span>
            <ReceiptIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1818] dark:text-[#E8E4E0]">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8] mt-1">
            {receipts.length} total receipts recorded
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-1">
            <span className="font-semibold uppercase text-[10px]">Govt Challan Remitted</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            ₹{totalChallan.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8] mt-1">
            Official portal exam/PAN fees
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-1">
            <span className="font-semibold uppercase text-[10px]">Operator Net Margin</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{totalOperatorFee.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8] mt-1">
            Center form filling & print profit
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)]">
          <div className="flex items-center justify-between text-xs text-[#857878] dark:text-[#B5A8A8] mb-1">
            <span className="font-semibold uppercase text-[10px]">Average Ticket Value</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1818] dark:text-[#E8E4E0]">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[#857878] dark:text-[#B5A8A8] mt-1">
            Per walk-in counter transaction
          </div>
        </div>
      </div>

      {/* Main Charts: 6-Month Trajectory & Demand Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                Monthly Revenue Trajectory (₹)
              </h3>
              <p className="text-xs text-[#857878] dark:text-[#B5A8A8]">
                Continuous revenue expansion through Sarkari exam cycles
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold">
              +14% Month-on-Month
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="feeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#857878' }} />
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
                <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#totalRevenueGrad)" name="Gross Billing (₹)" />
                <Area type="monotone" dataKey="fee" stroke="#6366f1" fillOpacity={1} fill="url(#feeGrad)" name="Operator Fee (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Category Share */}
        <div className="p-6 rounded-3xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.12)] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1A1818] dark:text-[#E8E4E0]">
              Revenue Share by Category
            </h3>
            <p className="text-xs text-[#857878] dark:text-[#B5A8A8] mb-4">
              Percentage of monthly gross billings
            </p>

            <div className="space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1A1818] dark:text-[#E8E4E0]">{cat.name}</span>
                    <span className="font-mono font-bold text-[#857878] dark:text-[#B5A8A8]">{cat.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 mt-4 text-[11px] text-[#857878] dark:text-[#B5A8A8] flex items-center justify-between">
            <span>Primary Driver:</span>
            <span className="font-bold text-[#1A1818] dark:text-[#E8E4E0]">SSC & Police Vacancies</span>
          </div>
        </div>
      </div>
    </div>
  );
};
