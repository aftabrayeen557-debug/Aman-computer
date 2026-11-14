import { useState, useMemo } from 'react';
import { Layers, CheckCircle2, Sliders, ArrowUpRight } from 'lucide-react';

export default function InteractiveApiCostCalculator() {
  const [monthlyCalls, setMonthlyCalls] = useState<number>(25000);
  const [selectedApis, setSelectedApis] = useState<string[]>([
    'PAN Verification',
    'Bank Account KYC',
    'GSTIN Search',
  ]);

  const apiOptions = [
    { name: 'PAN Verification', baseCost: 1.20, category: 'KYC' },
    { name: 'Bank Account KYC', baseCost: 1.50, category: 'Banking' },
    { name: 'GSTIN Search', baseCost: 0.85, category: 'Tax' },
    { name: 'Form 26AS / AIS', baseCost: 3.50, category: 'Income Tax' },
    { name: 'Aadhaar Offline KYC', baseCost: 1.00, category: 'Identity' },
  ];

  const toggleApi = (name: string) => {
    if (selectedApis.includes(name)) {
      if (selectedApis.length > 1) {
        setSelectedApis(selectedApis.filter((n) => n !== name));
      }
    } else {
      setSelectedApis([...selectedApis, name]);
    }
  };

  const costData = useMemo(() => {
    // Volume discount tiers
    let discountPct = 0;
    if (monthlyCalls >= 100000) discountPct = 35;
    else if (monthlyCalls >= 50000) discountPct = 25;
    else if (monthlyCalls >= 20000) discountPct = 15;
    else if (monthlyCalls >= 10000) discountPct = 10;

    const basePerCallCost = selectedApis.reduce((acc, name) => {
      const match = apiOptions.find((a) => a.name === name);
      return acc + (match ? match.baseCost : 0);
    }, 0);

    const discountedPerCall = basePerCallCost * (1 - discountPct / 100);
    const totalMonthlyCost = discountedPerCall * monthlyCalls;

    return {
      discountPct,
      basePerCallCost,
      discountedPerCall,
      totalMonthlyCost,
    };
  }, [monthlyCalls, selectedApis]);

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-600 dark:text-blue-400 mb-1">
            <Layers className="w-4 h-4" />
            <span>Developer Tool · Sandbox by Quicko</span>
          </div>
          <h4 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50">
            Sandbox Tax API Cost Calculator
          </h4>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
          Tier: {monthlyCalls >= 50000 ? 'Scale' : monthlyCalls >= 20000 ? 'Growth' : 'Starter'}
        </span>
      </div>

      {/* Select APIs */}
      <div className="pt-6 mb-6">
        <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-3">
          Select API Modules to Bundle:
        </label>
        <div className="flex flex-wrap gap-2">
          {apiOptions.map((api) => {
            const isSelected = selectedApis.includes(api.name);
            return (
              <button
                key={api.name}
                onClick={() => toggleApi(api.name)}
                className={`px-3 py-2 text-xs font-medium rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>{api.name}</span>
                <span className="font-mono text-[11px] opacity-80">₹{api.baseCost.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Usage Volume Slider */}
      <div className="mb-8 p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Monthly API Call Volume</span>
          </span>
          <span className="text-base font-mono font-bold text-neutral-950 dark:text-neutral-100">
            {monthlyCalls.toLocaleString()} calls / mo
          </span>
        </div>

        <input
          type="range"
          min={1000}
          max={100000}
          step={1000}
          value={monthlyCalls}
          onChange={(e) => setMonthlyCalls(Number(e.target.value))}
          className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-2">
          <span>1,000 (Testing)</span>
          <span>25,000</span>
          <span>50,000</span>
          <span>100,000+ (Enterprise)</span>
        </div>
      </div>

      {/* Cost Summary Matrix */}
      <div className="p-6 rounded-2xl bg-neutral-950 dark:bg-black text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-neutral-400 font-mono">Volume Discount</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {costData.discountPct}% OFF
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Automatic tier discount</div>
          </div>

          <div>
            <div className="text-xs text-neutral-400 font-mono">Effective Rate / Call</div>
            <div className="text-2xl font-bold font-mono text-neutral-100 mt-1">
              ₹{costData.discountedPerCall.toFixed(2)}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Across {selectedApis.length} bundled APIs</div>
          </div>

          <div>
            <div className="text-xs text-neutral-400 font-mono">Total Estimated Monthly</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              ₹{Math.round(costData.totalMonthlyCost).toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Billed based on actual usage</div>
          </div>
        </div>
      </div>
    </div>
  );
}
