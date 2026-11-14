import { useState } from 'react';

interface PullCordProps {
  darkMode: boolean;
  onToggle: () => void;
}

export default function PullCord({ darkMode, onToggle }: PullCordProps) {
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = () => {
    setIsPulling(true);
    setTimeout(() => {
      onToggle();
    }, 150);
    setTimeout(() => {
      setIsPulling(false);
    }, 450);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Cord container */}
      <button
        onClick={handlePull}
        role="switch"
        aria-checked={darkMode}
        aria-label="Toggle dark mode (pull the cord)"
        title="Pull the cord for Dark / Light mode"
        className="group relative flex flex-col items-center cursor-pointer focus:outline-hidden"
      >
        {/* Cord line */}
        <div
          className="w-[1.5px] bg-neutral-400 dark:bg-neutral-600 transition-all duration-300 origin-top"
          style={{
            height: isPulling ? '48px' : '36px',
            transition: 'height 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Pull Knob / Weighted Bead */}
        <div
          className={`w-3 h-5 rounded-full border shadow-sm transition-transform duration-300 flex items-center justify-center ${
            darkMode
              ? 'bg-[#E8E4E0] border-neutral-300 text-[#1A1818]'
              : 'bg-[#1A1818] border-neutral-700 text-[#E8E4E0]'
          }`}
          style={{
            transform: isPulling ? 'translateY(12px) scale(0.95)' : 'translateY(0)',
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="w-1 h-2 rounded-full bg-neutral-400/50" />
        </div>
      </button>
    </div>
  );
}
