import React, { useRef, useState } from 'react';
import { ShieldCheck, Award, QrCode } from 'lucide-react';

export const HolographicBadgeCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      className="perspective-1000 w-full"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative w-full rounded-2xl p-5 overflow-hidden transition-transform duration-200 ease-out border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] shadow-xl cursor-pointer"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${isHovered ? 'scale(1.02)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
          background: 'linear-gradient(135deg, #1A1818 0%, #252121 45%, #302A2A 100%)',
          color: '#E8E4E0',
        }}
      >
        {/* Holographic Sheen Layer */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity"
          style={{
            opacity: isHovered ? 0.65 : 0.25,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,214,120,0.4) 0%, rgba(255,104,170,0.25) 25%, rgba(120,226,255,0.2) 50%, transparent 70%)`,
            mixBlendMode: 'color-dodge',
          }}
        />

        {/* Diagonal Light Foil Streak */}
        <div
          className="absolute -inset-full pointer-events-none opacity-30 transform -rotate-45 transition-transform duration-700"
          style={{
            transform: `translate3d(${rotateY * 4}%, ${rotateX * 4}%, 0) rotate(-35deg)`,
            background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.2) 48%, rgba(255,243,212,0.6) 52%, transparent 70%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C4B0B0] to-[#6B5C5C] flex items-center justify-center text-[#1A1818] font-bold text-xs shadow-inner">
              AC
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-white uppercase">Aman Computer</div>
              <div className="text-[10px] text-[#B5A8A8] tracking-widest font-mono">DIGITAL CENTER • EST. 2014</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            VERIFIED OPERATOR
          </div>
        </div>

        {/* Smart Chip Contact & Hologram Seal */}
        <div className="relative z-10 flex items-center justify-between mb-5">
          {/* Gold EMV Chip Graphic */}
          <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#E2B755] via-[#D1A03A] to-[#B88728] border border-[#F3DB8B]/60 shadow-xs relative overflow-hidden flex items-center justify-center">
            <div className="w-6 h-4 border border-[#8C6212]/40 rounded-xs grid grid-cols-2 gap-0.5 opacity-80">
              <div className="border-r border-[#8C6212]/40" />
              <div />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <Award className="w-4 h-4" />
            </div>
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-cyan-300 border border-white/20">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Operator Profile Details */}
        <div className="relative z-10 space-y-1">
          <div className="text-[9px] uppercase tracking-wider text-[#B5A8A8] font-mono">Primary Terminal Administrator</div>
          <div className="text-base font-bold text-white tracking-wide">Aman Sharma</div>
          <div className="text-xs font-mono text-[#D5CDCA] flex items-center justify-between pt-1">
            <span>ID: AC-VNS-001</span>
            <span className="text-[10px] text-amber-200">CSC / NSDL REG: 67094</span>
          </div>
        </div>

        {/* Card Footer Tagline */}
        <div className="relative z-10 mt-4 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-[#B5A8A8]">
          <span>Your Trust, Our Service.</span>
          <span className="font-mono text-white/60">Varanasi Kiosk #1</span>
        </div>
      </div>
    </div>
  );
};
