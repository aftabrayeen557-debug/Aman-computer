import React, { useRef, useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';

export const PullCordToggle: React.FC = () => {
  const { darkMode, toggleDarkMode } = useAdmin();
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const cordRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPulling(true);
    startYRef.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPulling) return;
    const dy = Math.max(0, Math.min(50, e.clientY - startYRef.current));
    setPullY(dy);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPulling) return;
    setIsPulling(false);
    if (pullY > 24) {
      toggleDarkMode();
    }
    setPullY(0);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <div
      ref={cordRef}
      className="relative flex flex-col items-center select-none cursor-grab active:cursor-grabbing group pt-0"
      title="Pull cord to toggle Dark / Light mode"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Ceiling Anchor Point */}
      <div className="w-3 h-1.5 bg-[#857878] dark:bg-[#B5A8A8] rounded-b-sm shadow-xs" />

      {/* Cord Line (Spring stretched) */}
      <div
        className="w-[1.5px] bg-gradient-to-b from-[#857878] via-[#B5A8A8] to-[#6B5C5C] dark:from-[#B5A8A8] dark:to-[#E8E4E0] transition-all"
        style={{
          height: `${28 + pullY}px`,
          transition: isPulling ? 'none' : 'height 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* Acorn / Tassel Handle */}
      <div
        className="relative flex items-center justify-center -mt-0.5 transition-transform"
        style={{
          transform: `translateY(${pullY * 0.15}px) scale(${isPulling ? 1.08 : 1})`,
          transition: isPulling ? 'none' : 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="w-3 h-5 rounded-full bg-gradient-to-b from-[#D3CBC8] to-[#1A1818] dark:from-[#302A2A] dark:to-[#E8E4E0] border border-[rgba(196,176,176,0.35)] shadow-md flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-[#E8E4E0] dark:bg-[#1A1818] opacity-80" />
        </div>
      </div>
    </div>
  );
};
