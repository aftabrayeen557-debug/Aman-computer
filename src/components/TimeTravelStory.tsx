import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { JourneyItem } from '../admin/types';
import { INITIAL_JOURNEY } from '../admin/data/initialData';

const monthOrderMap: Record<string, number> = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3,
  april: 4, apr: 4, may: 5, june: 6, jun: 6, july: 7, jul: 7,
  august: 8, aug: 8, september: 9, sep: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12
};

const sortChronological = (items: JourneyItem[]): JourneyItem[] => {
  return [...items].sort((a, b) => {
    const ya = parseInt(a.year, 10) || 2024;
    const yb = parseInt(b.year, 10) || 2024;
    if (ya !== yb) return ya - yb;
    const ma = monthOrderMap[a.month?.toLowerCase() || ''] || monthOrderMap[a.date?.toLowerCase().slice(0, 3) || ''] || 1;
    const mb = monthOrderMap[b.month?.toLowerCase() || ''] || monthOrderMap[b.date?.toLowerCase().slice(0, 3) || ''] || 1;
    if (ma !== mb) return ma - mb;
    return (a.displayOrder || 0) - (b.displayOrder || 0);
  });
};

export default function TimeTravelStory() {
  const [journeyItems, setJourneyItems] = useState<JourneyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aman_journey');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return sortChronological(parsed.filter((item: any) => item && item.published));
          }
        }
      } catch (e) {
        console.error('Error reading aman_journey', e);
      }
    }
    return sortChronological(INITIAL_JOURNEY.filter((item) => item.published));
  });

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('aman_journey');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const valid = sortChronological(parsed.filter((item: any) => item && item.published));
            setJourneyItems(valid);
            setActiveStep((prev) => (valid.length > 0 ? Math.min(prev, valid.length - 1) : 0));
            return;
          }
        }
        setJourneyItems(sortChronological(INITIAL_JOURNEY.filter((item) => item.published)));
        setActiveStep(0);
      } catch (e) {
        console.error('Error syncing journey items', e);
      }
    };

    window.addEventListener('aman_journey_changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('aman_journey_changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const currentCh = journeyItems[activeStep];

  return (
    <section id="about" className="py-28 md:py-36 border-t border-[#D5CDCA] dark:border-[rgba(196,176,176,0.16)] bg-[#E8E4E0] dark:bg-[#1A1818] overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-6">
        {journeyItems.length === 0 ? (
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
              Our Journey
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight mb-8">
              The Journey of Aman Computer
            </h2>
            <div className="p-12 sm:p-16 rounded-3xl bg-[#DED8D4]/60 dark:bg-[#252121]/50 border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)] text-center shadow-xs">
              <Calendar className="w-12 h-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
              <div className="text-lg sm:text-xl font-bold text-[#1A1818] dark:text-[#E8E4E0]">
                No Journey Information Available
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Interactive Clock & Flip Year Counter */}
            <div className="lg:col-span-5 sticky top-28">
              <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
                Our Journey
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight mb-8">
                The Journey of Aman Computer
              </h2>

              {/* Giant Year Flip Odometer */}
              <div className="p-8 rounded-3xl bg-[#DED8D4] dark:bg-[#252121] border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.2)] shadow-inner mb-6">
                <div className="text-6xl sm:text-7xl font-display font-extrabold text-[#1A1818] dark:text-[#E8E4E0] tracking-tighter tabular-nums mb-2">
                  {currentCh?.year || '2024'}
                </div>
                <p className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
                  {currentCh?.date || currentCh?.year || 'Jan 2024'}
                </p>

                {/* Progress meter */}
                <div className="mt-6 flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold text-[#1A1818] dark:text-white">
                      {String(activeStep + 1).padStart(2, '0')}
                    </span>
                    <span>/ {String(journeyItems.length).padStart(2, '0')}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={activeStep === 0}
                      onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                      aria-label="Previous story chapter"
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={activeStep === journeyItems.length - 1}
                      onClick={() => setActiveStep((prev) => Math.min(journeyItems.length - 1, prev + 1))}
                      aria-label="Next story chapter"
                      className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bar */}
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#1A1818] dark:bg-[#E8E4E0] transition-all duration-300"
                    style={{ width: `${((activeStep + 1) / journeyItems.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Timeline Chapters list */}
            <div className="lg:col-span-7 space-y-6">
              {journeyItems.map((ch, idx) => {
                const isSelected = activeStep === idx;

                return (
                  <div
                    key={ch.id || idx}
                    onClick={() => setActiveStep(idx)}
                    className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-[#252121] border-[#1A1818] dark:border-white shadow-lg'
                        : 'bg-[#DED8D4]/60 dark:bg-[#252121]/50 border-transparent hover:border-[#D5CDCA] dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
                      <span>{ch.date || ch.year}</span>
                      <span className="font-bold">Milestone 0{idx + 1}</span>
                    </div>

                    <h3 className="text-2xl font-display font-bold text-[#1A1818] dark:text-[#E8E4E0] mb-1">
                      {ch.title}
                    </h3>

                    {ch.subtitle && (
                      <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                        {ch.subtitle}
                      </p>
                    )}

                    {ch.description && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4">
                        {ch.description}
                      </p>
                    )}

                    {ch.bullets && ch.bullets.length > 0 && (
                      <ul className="space-y-2">
                        {ch.bullets.map((bullet, bIdx) => (
                          <li
                            key={bIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
