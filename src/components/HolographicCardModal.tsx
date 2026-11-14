import { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Shield, RotateCw } from 'lucide-react';
import { HERO_IMAGE } from '../data/portfolioData';

interface HolographicCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HolographicCardModal({ isOpen, onClose }: HolographicCardModalProps) {
  const [flipped, setFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 18;
    const rotY = ((x - centerX) / centerX) * 18;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative flex flex-col items-center max-w-sm sm:max-w-md w-full">
        {/* Close Button on Top Right */}
        <button
          onClick={onClose}
          aria-label="Close ability card"
          className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 3D Card Scene */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setFlipped(!flipped)}
          style={{ perspective: '1000px' }}
          className="w-[300px] sm:w-[340px] h-[480px] sm:h-[520px] cursor-pointer select-none group"
        >
          <div
            className="w-full h-full relative transition-transform duration-500 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (flipped ? 180 : 0)}deg)`,
            }}
          >
            {/* FRONT FACE */}
            <div
              className="absolute inset-0 rounded-3xl p-6 bg-gradient-to-b from-[#2A2626] to-[#141212] border-2 border-[#D5CDCA]/30 shadow-2xl flex flex-col justify-between overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
              }}
            >
              {/* Foil rainbow sheen simulation */}
              <div
                className="absolute inset-0 opacity-40 pointer-events-none mix-blend-color-dodge transition-opacity"
                style={{
                  background: `linear-gradient(${115 + rotateY * 2}deg, transparent 20%, rgba(255, 180, 200, 0.4) 40%, rgba(180, 220, 255, 0.4) 60%, transparent 80%)`,
                }}
              />

              {/* Card Header */}
              <div className="flex items-center justify-between text-xs text-white/70 pb-3 border-b border-white/10">
                <span className="font-mono font-bold tracking-wider uppercase text-[#E8E4E0]">
                  Rishi Thakor
                </span>
                <span className="font-mono px-2 py-0.5 rounded-sm bg-white/10 text-white text-[10px]">
                  RARITY: LEGENDARY
                </span>
              </div>

              {/* Portrait Picture Box */}
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-white/20 bg-neutral-900 my-2">
                <img
                  src={HERO_IMAGE}
                  alt="Rishi Thakor Card Portrait"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter contrast-105"
                />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white/90">
                  CREATIVE TECHNOLOGIST
                </div>
              </div>

              {/* Attributes / Stats */}
              <div className="space-y-2 py-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-white/80">Web Development</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[90%] h-full bg-emerald-400" />
                    </div>
                    <span className="text-emerald-400 font-bold tabular-nums">90</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">UI/UX Design</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[85%] h-full bg-violet-400" />
                    </div>
                    <span className="text-violet-400 font-bold tabular-nums">85</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Graphic Design</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[85%] h-full bg-amber-400" />
                    </div>
                    <span className="text-amber-400 font-bold tabular-nums">85</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">App Development</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[75%] h-full bg-blue-400" />
                    </div>
                    <span className="text-blue-400 font-bold tabular-nums">75</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80">Photography</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="w-[80%] h-full bg-rose-400" />
                    </div>
                    <span className="text-rose-400 font-bold tabular-nums">80</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/50">
                <span>EDITION #001 / 2026</span>
                <span className="flex items-center gap-1 text-white/80">
                  <RotateCw className="w-3 h-3" />
                  <span>Tap to flip</span>
                </span>
              </div>
            </div>

            {/* BACK FACE */}
            <div
              className="absolute inset-0 rounded-3xl p-6 bg-gradient-to-br from-[#1E1A1A] to-[#0A0909] border-2 border-[#D5CDCA]/30 shadow-2xl flex flex-col items-center justify-between overflow-hidden text-center"
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              {/* Card Back Logo */}
              <div className="w-full flex justify-between items-center text-[10px] font-mono text-white/40">
                <span>RISHITHAKOR.COM</span>
                <span>VERIFIED</span>
              </div>

              <div className="my-auto space-y-4">
                <div className="w-20 h-20 rounded-2xl mx-auto bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/20 flex items-center justify-center text-3xl font-display font-bold text-white shadow-inner">
                  RT
                </div>
                <h4 className="text-lg font-display font-bold text-white">
                  Special Passive Ability
                </h4>
                <p className="text-xs text-neutral-300 max-w-[240px] leading-relaxed">
                  <strong>Full-Stack Synthesis:</strong> Blends architectural software engineering with high-taste UI design. Immune to generic AI slop.
                </p>
                <div className="text-[11px] font-mono text-emerald-400">
                  +100% Speed & Precision
                </div>
              </div>

              <div className="w-full pt-3 border-t border-white/10 text-[10px] font-mono text-white/40">
                © 2026 Rishi Thakor · Built by Rishi
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Hint */}
        <p className="mt-4 text-xs font-mono text-neutral-400 text-center">
          Move across the card · Tilt or drag it · Tap to flip
        </p>
      </div>
    </div>
  );
}
