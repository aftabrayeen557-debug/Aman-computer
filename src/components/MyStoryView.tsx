import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, MapPin } from 'lucide-react';
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

interface MyStoryViewProps {
  onBack: () => void;
  onContactClick: () => void;
}

export default function MyStoryView({ onBack, onContactClick }: MyStoryViewProps) {
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

  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem('aman_journey');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const valid = sortChronological(parsed.filter((item: any) => item && item.published));
            setJourneyItems(valid);
            return;
          }
        }
        setJourneyItems(sortChronological(INITIAL_JOURNEY.filter((item) => item.published)));
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

  return (
    <div className="pt-28 pb-32 animate-in fade-in duration-300">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back breadcrumb */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>← Back to the doors.</span>
        </button>

        {/* Header */}
        <div className="mb-14">
          <div className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
            Our Journey
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-neutral-950 dark:text-neutral-50 tracking-tight mb-4">
            The Journey of Aman Computer
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
            The evolution, continuous expansion, and service milestones of Aman Computer Cyber Cafe & Digital Center — providing dependable government documentation, online applications, and citizen services.
          </p>
        </div>

        {/* Journey Timeline */}
        {journeyItems.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center shadow-xs mb-16">
            <Calendar className="w-12 h-12 mx-auto text-neutral-400 dark:text-neutral-500 mb-4" />
            <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              No Journey Information Available
            </div>
          </div>
        ) : (
          <div className="relative border-l-2 border-neutral-200 dark:border-neutral-800 ml-4 space-y-12 mb-16">
            {journeyItems.map((item, idx) => (
              <div key={item.id || idx} className="relative pl-8">
                {/* Timeline node */}
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-neutral-950 border-2 border-neutral-900 dark:border-neutral-100" />

                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-neutral-950 dark:text-neutral-100 px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800">
                    {item.date || item.year}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    Milestone 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-bold text-neutral-950 dark:text-neutral-50 mt-2">
                  {item.title}
                </h3>

                {item.subtitle && (
                  <div className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                    {item.subtitle}
                  </div>
                )}

                {item.description && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                )}

                {item.bullets && item.bullets.length > 0 && (
                  <div className="space-y-2">
                    {item.bullets.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="p-8 rounded-3xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-center">
          <h3 className="text-xl font-display font-bold text-neutral-950 dark:text-neutral-50 mb-2">
            Need Online Assistance or Document Services?
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
            Visit Aman Computer or connect directly on WhatsApp for prompt assistance.
          </p>
          <button
            onClick={onContactClick}
            className="px-6 py-3 text-xs font-semibold text-white bg-neutral-950 dark:bg-white dark:text-neutral-950 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
          >
            Contact Aman Computer
          </button>
        </div>
      </div>
    </div>
  );
}
