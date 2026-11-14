import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Share2, Check, TrendingUp, Download } from 'lucide-react';

export default function InteractiveZerodhaPreview() {
  const [masked, setMasked] = useState(false);
  const [activeTab, setActiveTab] = useState<'realized' | 'charges' | 'share'>('realized');
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  const handleShare = () => {
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-neutral-800 bg-[#0d0f12] text-neutral-100 p-6 sm:p-8 shadow-2xl font-sans">
      {/* Terminal Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            Z
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white">pnl.page</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-neutral-800 text-neutral-400">
                Zerodha Kite Verified
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Client ID: {masked ? '•••••••' : 'RK7829'} · FY 2024-25 Equity & F&O
            </p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMasked(!masked)}
            className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {masked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{masked ? 'Show Values' : 'Privacy Mask'}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedShareLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedShareLink ? 'Link Copied!' : 'Share Verified P&L'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 py-4 border-b border-neutral-800/60 text-xs font-mono">
        <button
          onClick={() => setActiveTab('realized')}
          className={`px-3 py-1.5 rounded-md cursor-pointer ${
            activeTab === 'realized' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Realized P&L
        </button>
        <button
          onClick={() => setActiveTab('charges')}
          className={`px-3 py-1.5 rounded-md cursor-pointer ${
            activeTab === 'charges' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Taxes & Brokerage Breakdown
        </button>
        <button
          onClick={() => setActiveTab('share')}
          className={`px-3 py-1.5 rounded-md cursor-pointer ${
            activeTab === 'share' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Verified Trade Card (X/Twitter)
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="text-xs text-neutral-400 font-mono mb-1">Net Realized P&L</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
            {masked ? '₹••••••••' : '+₹1,84,320.50'}
          </div>
          <div className="text-xs text-emerald-500 font-mono mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.6% Returns on Capital</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="text-xs text-neutral-400 font-mono mb-1">Total Turnover (STCG/LTCG)</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-100 tabular-nums">
            {masked ? '₹••••••••' : '₹14,92,400.00'}
          </div>
          <div className="text-xs text-neutral-400 font-mono mt-1">
            42 Total Realized Trades
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
          <div className="text-xs text-neutral-400 font-mono mb-1">STT, GST & Exchange Fees</div>
          <div className="text-2xl sm:text-3xl font-mono font-bold text-neutral-300 tabular-nums">
            {masked ? '₹••••••••' : '₹3,412.80'}
          </div>
          <div className="text-xs text-neutral-400 font-mono mt-1">
            Tax-deductible charges audited
          </div>
        </div>
      </div>

      {/* Simulated Trade Performance Table */}
      <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900/50">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
            <tr>
              <th className="p-3">Symbol / Instrument</th>
              <th className="p-3">Quantity</th>
              <th className="p-3">Buy Avg</th>
              <th className="p-3">Sell Avg</th>
              <th className="p-3">Net P&L</th>
              <th className="p-3">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
            <tr>
              <td className="p-3 font-semibold text-white">RELIANCE (EQ)</td>
              <td className="p-3">120</td>
              <td className="p-3">₹2,840.00</td>
              <td className="p-3">₹3,025.00</td>
              <td className="p-3 text-emerald-400 font-semibold">{masked ? '₹•••••' : '+₹22,200.00'}</td>
              <td className="p-3 text-neutral-400">STCG (Sec 111A)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-white">TCS (EQ)</td>
              <td className="p-3">50</td>
              <td className="p-3">₹3,450.00</td>
              <td className="p-3">₹3,890.00</td>
              <td className="p-3 text-emerald-400 font-semibold">{masked ? '₹•••••' : '+₹22,000.00'}</td>
              <td className="p-3 text-neutral-400">LTCG (Sec 112A)</td>
            </tr>
            <tr>
              <td className="p-3 font-semibold text-white">HDFCBANK (EQ)</td>
              <td className="p-3">200</td>
              <td className="p-3">₹1,510.00</td>
              <td className="p-3">₹1,640.00</td>
              <td className="p-3 text-emerald-400 font-semibold">{masked ? '₹•••••' : '+₹26,000.00'}</td>
              <td className="p-3 text-neutral-400">STCG (Sec 111A)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Cryptographic verification watermark footer */}
      <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Hash: 9e4f2b8a...c317 (Verified via Kite Connect Token)</span>
        </div>
        <span>Exported from pnl.page by Rishi Thakor</span>
      </div>
    </div>
  );
}
