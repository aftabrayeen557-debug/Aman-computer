import React, { useState, useEffect } from 'react';

const MESSAGES = [
  'SSC & Police Form Filing Live',
  'Aadhaar Smart PVC Orders Ready',
  'Tatkal Railway Bookings Active',
  'Instant Photo Studio Operational',
  'Direct WhatsApp Submissions On',
];

export const FlipCalendarWidget: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateNum = now.getDate();
  const monthName = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % MESSAGES.length);
        setIsFlipping(false);
      }, 350);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-[rgba(242,238,235,0.6)] dark:bg-[rgba(196,176,176,0.06)] border border-[rgba(196,176,176,0.25)] dark:border-[rgba(196,176,176,0.14)] shadow-xs backdrop-blur-md">
      {/* Mechanical Desk Calendar Block */}
      <div className="relative w-14 h-16 rounded-xl bg-[#F0ECE9] dark:bg-[#221F1F] border border-[rgba(196,176,176,0.3)] shadow-sm flex flex-col overflow-hidden select-none">
        {/* Ring Binder Rings */}
        <div className="absolute top-0 inset-x-0 h-1.5 flex justify-around px-2 z-20">
          <div className="w-1.5 h-2.5 -top-1 relative rounded-full bg-[#6B5C5C] dark:bg-[#B5A8A8] shadow-xs" />
          <div className="w-1.5 h-2.5 -top-1 relative rounded-full bg-[#6B5C5C] dark:bg-[#B5A8A8] shadow-xs" />
        </div>

        {/* Calendar Top Header */}
        <div className="bg-[#1A1818] dark:bg-[#E8E4E0] text-[#E8E4E0] dark:text-[#1A1818] text-[9px] font-semibold tracking-widest text-center py-0.5 pt-1 uppercase">
          {monthName}
        </div>

        {/* Date Number with Middle Split Line */}
        <div className="relative flex-1 flex flex-col items-center justify-center font-semibold text-[#1A1818] dark:text-[#E8E4E0]">
          <span className="text-xl font-semibold tabular-nums leading-none tracking-tight">
            {dateNum < 10 ? `0${dateNum}` : dateNum}
          </span>
          <span className="text-[8px] font-semibold tracking-wider text-[#857878] dark:text-[#B5A8A8] uppercase">
            {dayName}
          </span>
          {/* Subtle mechanical fold hairline */}
          <div className="absolute inset-x-0 top-1/2 h-[0.5px] bg-[rgba(196,176,176,0.25)] pointer-events-none" />
        </div>
      </div>

      {/* Dynamic Digital Status Ticker */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8] font-semibold">
            Digital Center Status
          </span>
        </div>
        <div
          className={`text-xs font-semibold text-[#1A1818] dark:text-[#E8E4E0] truncate transition-all duration-300 ${
            isFlipping ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
          }`}
        >
          {MESSAGES[currentIdx]}
        </div>
        <div className="text-[10px] text-[#857878] dark:text-[#B5A8A8] mt-0.5 flex items-center gap-2">
          <span>Counter: 8 AM – 9 PM</span>
          <span className="opacity-40">•</span>
          <span>Dual Leased Line Active</span>
        </div>
      </div>
    </div>
  );
};
