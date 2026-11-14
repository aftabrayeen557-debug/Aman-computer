import { useState, useEffect } from 'react';

const SKILL_WORDS = [
  { word: 'Online Job Forms & Exam Registration', num: '01' },
  { word: 'PAN Card Services', num: '02' },
  { word: 'Aadhaar Services', num: '03' },
  { word: 'Voter ID Services', num: '04' },
  { word: 'Driving Licence & RTO', num: '05' },
  { word: 'Passport & Visa Assistance', num: '06' },
  { word: 'Income, Caste & Domicile Certificates', num: '07' },
  { word: 'Printing & Photocopy', num: '08' },
  { word: 'Scanning & Lamination', num: '09' },
  { word: 'Passport Photography', num: '10' },
  { word: 'AEPS & Money Transfer', num: '11' },
  { word: 'Bill Payments & FASTag', num: '12' },
  { word: 'Government Schemes', num: '13' },
  { word: 'Train, Bus & Flight Booking', num: '14' },
  { word: 'Typing & Resume Making', num: '15' },
  { word: 'Document & Legal Drafting', num: '16' },
  { word: 'Latest Updates & Notifications', num: '17' },
  { word: 'Photo Gallery', num: '18' },
  { word: 'Contact & Location', num: '19' },
  { word: 'About Aman Computer', num: '20' },
];

export default function FlipCalendar() {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % SKILL_WORDS.length);
        setIsFlipping(false);
      }, 400);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  const currentItem = SKILL_WORDS[index];
  const nextItem = SKILL_WORDS[(index + 1) % SKILL_WORDS.length];

  return (
    <span className="inline-block align-middle my-1">
      {/* Desktop Calendar Container */}
      <span className="relative inline-flex items-center justify-between px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-[#252121] border border-[#D5CDCA] dark:border-[rgba(196,176,176,0.18)] shadow-md min-w-[200px] sm:min-w-[260px] h-12 sm:h-14 overflow-hidden select-none">
        {/* Spiral Binder Rings on Top */}
        <span className="absolute top-1 left-6 flex items-center gap-4 z-20 pointer-events-none">
          <span className="w-1.5 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 shadow-xs" />
          <span className="w-1.5 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 shadow-xs" />
          <span className="w-1.5 h-3 rounded-full bg-neutral-400 dark:bg-neutral-600 border border-neutral-300 dark:border-neutral-500 shadow-xs" />
        </span>

        {/* Word Text Display */}
        <span
          className={`font-display text-xl sm:text-2xl font-bold tracking-tight text-[#1A1818] dark:text-[#E8E4E0] transition-all duration-300 transform ${
            isFlipping ? '-translate-y-4 opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'
          }`}
        >
          {currentItem.word}
        </span>

        {/* Number Badge */}
        <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500 tabular-nums ml-3">
          {currentItem.num}
        </span>
      </span>
    </span>
  );
}
