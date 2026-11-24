import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    variant: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose';
  };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  onClick,
}) => {
  const badgeColors = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl bg-[rgba(242,238,235,0.65)] dark:bg-[rgba(196,176,176,0.05)] border border-[rgba(196,176,176,0.3)] dark:border-[rgba(196,176,176,0.14)] backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[#857878] dark:text-[#B5A8A8] mb-1 font-mono">
            {title}
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight text-[#1A1818] dark:text-[#E8E4E0]">
            {value}
          </div>
        </div>

        <div className="w-10 h-10 rounded-xl bg-[rgba(107,92,92,0.12)] dark:bg-[rgba(196,176,176,0.1)] flex items-center justify-center text-[#6B5C5C] dark:text-[#C4B0B0] group-hover:scale-110 transition-transform">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[rgba(196,176,176,0.2)] dark:border-[rgba(196,176,176,0.08)] flex items-center justify-between text-xs">
        <span className="text-[#857878] dark:text-[#B5A8A8] text-[11px] truncate">
          {subtitle || 'Updated live from counter'}
        </span>
        {badge && (
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badgeColors[badge.variant]}`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
