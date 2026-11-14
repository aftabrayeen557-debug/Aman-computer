import { useState, useMemo } from 'react';
import { Calculator, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export default function InteractiveTaxCalculator() {
  const [assetType, setAssetType] = useState<'equity' | 'crypto' | 'property'>('equity');
  const [buyPrice, setBuyPrice] = useState<number>(50000);
  const [sellPrice, setSellPrice] = useState<number>(85000);
  const [holdingMonths, setHoldingMonths] = useState<number>(14);

  const calculations = useMemo(() => {
    const rawGain = sellPrice - buyPrice;
    const isGain = rawGain > 0;

    let isLTCG = false;
    let taxRate = 0;
    let rule = '';
    let taxableAmount = 0;
    let taxAmount = 0;

    if (assetType === 'equity') {
      // Equity: >12 months is LTCG
      isLTCG = holdingMonths >= 12;
      if (isGain) {
        if (isLTCG) {
          taxRate = 12.5; // Budget 2024 revised rate (12.5% on gains exceeding ₹1.25 Lakh)
          rule = 'Section 112A: LTCG (>12 months holding). Exemption up to ₹1.25 Lakh applicable across aggregate fiscal gains.';
          // For simulation, apply basic calculation
          taxableAmount = Math.max(0, rawGain - (rawGain > 125000 ? 125000 : 0));
          taxAmount = (taxableAmount * taxRate) / 100;
        } else {
          taxRate = 20; // Budget 2024 STCG 20% (Sec 111A)
          rule = 'Section 111A: STCG (<12 months holding). Flat 20% on short-term gains.';
          taxableAmount = rawGain;
          taxAmount = (taxableAmount * taxRate) / 100;
        }
      }
    } else if (assetType === 'crypto') {
      // Crypto / VDA: flat 30% without indexation or deduction
      isLTCG = false;
      taxRate = 30;
      rule = 'Section 115BBH: Flat 30% tax on Virtual Digital Assets (VDA) regardless of holding duration. No set-off against other losses.';
      taxableAmount = isGain ? rawGain : 0;
      taxAmount = (taxableAmount * taxRate) / 100;
    } else {
      // Property / Real Estate: >24 months is LTCG
      isLTCG = holdingMonths >= 24;
      if (isGain) {
        taxRate = isLTCG ? 12.5 : 30;
        rule = isLTCG
          ? 'Section 112: LTCG (>24 months). 12.5% tax without indexation benefit.'
          : 'STCG (<24 months). Taxed according to applicable individual income tax slab rates (assumed 30%).';
        taxableAmount = rawGain;
        taxAmount = (taxableAmount * taxRate) / 100;
      }
    }

    return {
      rawGain,
      isGain,
      isLTCG,
      taxRate,
      rule,
      taxableAmount,
      taxAmount,
      postTaxReturn: isGain ? sellPrice - taxAmount : sellPrice,
    };
  }, [assetType, buyPrice, sellPrice, holdingMonths]);

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Simulator · Quicko</span>
          </div>
          <h4 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50">
            Capital Gains Tax Calculator
          </h4>
        </div>
        <button
          onClick={() => {
            setBuyPrice(50000);
            setSellPrice(85000);
            setHoldingMonths(14);
          }}
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample</span>
        </button>
      </div>

      {/* Asset Switcher */}
      <div className="pt-6 grid grid-cols-3 gap-2 mb-6">
        {[
          { id: 'equity', label: 'Equity / Shares' },
          { id: 'crypto', label: 'Crypto (VDA)' },
          { id: 'property', label: 'Real Estate' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAssetType(tab.id as any)}
            className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              assetType === tab.id
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            Purchase Price (₹)
          </label>
          <input
            type="number"
            value={buyPrice}
            onChange={(e) => setBuyPrice(Number(e.target.value) || 0)}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            Sale Price (₹)
          </label>
          <input
            type="number"
            value={sellPrice}
            onChange={(e) => setSellPrice(Number(e.target.value) || 0)}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            Holding Period (Months)
          </label>
          <input
            type="number"
            value={holdingMonths}
            onChange={(e) => setHoldingMonths(Number(e.target.value) || 0)}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white"
          />
        </div>
      </div>

      {/* Results Dashboard */}
      <div className="p-6 rounded-2xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Total Profit / Loss</div>
            <div className={`text-xl font-bold font-mono tabular-nums ${calculations.rawGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ₹{calculations.rawGain.toLocaleString('en-IN')}
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Classification</div>
            <div className="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {assetType === 'crypto' ? 'VDA Flat 30%' : calculations.isLTCG ? 'LTCG (Long Term)' : 'STCG (Short Term)'}
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Tax Rate</div>
            <div className="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-100">
              {calculations.taxRate}%
            </div>
          </div>

          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">Estimated Tax</div>
            <div className="text-xl font-bold font-mono text-neutral-950 dark:text-neutral-50">
              ₹{Math.round(calculations.taxAmount).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="pt-4 text-xs text-neutral-600 dark:text-neutral-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <span>{calculations.rule}</span>
        </div>
      </div>
    </div>
  );
}
