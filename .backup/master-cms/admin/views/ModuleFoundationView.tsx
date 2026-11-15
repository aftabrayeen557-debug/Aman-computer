import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { StudioNavItem } from '../config/navigation';
import {
  StudioEmptyState,
  StudioErrorState,
  StudioLoadingState,
} from '../components/StateViews';

interface ModuleFoundationViewProps {
  navItem: StudioNavItem;
}

type PreviewStateMode = 'foundation' | 'loading' | 'empty' | 'error';

export const ModuleFoundationView: React.FC<ModuleFoundationViewProps> = ({
  navItem,
}) => {
  const { setCurrentTab } = useAdmin();
  const [previewState, setPreviewState] =
    useState<PreviewStateMode>('foundation');

  const Icon = navItem.icon;

  return (
    <div className="space-y-8">
      {/* Module Header */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-[#111318] border border-orange-500/20 shadow-[0_0_40px_-20px_rgba(249,115,22,0.35)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.12),transparent_60%)]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-orange-400">
              <span>{navItem.groupTitle}</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-[#92949B]">{navItem.label}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#191C22] border border-orange-500/35 flex items-center justify-center text-orange-400 shrink-0 shadow-[0_0_20px_-6px_rgba(249,115,22,0.5)]">
                <Icon className="w-5 h-5" />
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-normal tracking-tight text-[#F5F2EC]">
                {navItem.label}
              </h1>
            </div>

            <p className="text-sm text-[#92949B] max-w-2xl leading-relaxed">
              {navItem.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentTab('overview')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] bg-[#191C22] text-xs font-medium text-[#F5F2EC] hover:border-orange-500/45 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Reusable State Switcher Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#92949B]">
          Section View
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#111318] border border-white/[0.08]">
          {(
            [
              { id: 'foundation', label: 'Overview' },
              { id: 'loading', label: 'Loading' },
              { id: 'empty', label: 'Empty' },
              { id: 'error', label: 'Error' },
            ] as Array<{ id: PreviewStateMode; label: string }>
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreviewState(mode.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                previewState === mode.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-[#090A0C] font-semibold'
                  : 'text-[#92949B] hover:text-[#F5F2EC]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </section>

      {/* Active Workspace Body */}
      {previewState === 'loading' ? (
        <StudioLoadingState
          title={`Loading ${navItem.label}...`}
          subtitle="Loading your information..."
        />
      ) : previewState === 'empty' ? (
        <StudioEmptyState
          title={`${navItem.label}`}
          description="No content available yet. Add your first item to get started."
          action={{
            label: 'Back to Overview',
            onClick: () => setPreviewState('foundation'),
          }}
        />
      ) : previewState === 'error' ? (
        <StudioErrorState
          title={`Unable to Load ${navItem.label}`}
          description="Something went wrong while loading this section. Please try again."
          onRetry={() => setPreviewState('foundation')}
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
                  Upcoming Tools
                </div>
                <h2 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                  Included Capabilities
                </h2>
              </div>
              <Layers className="w-5 h-5 text-orange-400" />
            </div>

            <div className="divide-y divide-white/[0.06]">
              {navItem.phase2Modules.map((capability) => (
                <div
                  key={capability}
                  className="py-3.5 flex items-start gap-3 text-sm text-[#F5F2EC]"
                >
                  <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-orange-400">
              Account &amp; Service Health
            </div>
            <h2 className="font-editorial text-2xl text-[#F5F2EC]">
              Business Services &amp; Protection
            </h2>
            <p className="text-xs text-[#92949B] leading-relaxed">
              Your account is protected. Business records, uploaded media, and public website
              information remain safely synced while management tools for this section are prepared.
            </p>
            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono text-[#92949B]">
              <div className="flex justify-between">
                <span>Section</span>
                <span className="text-[#F5F2EC]">{navItem.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Protection</span>
                <span className="text-orange-400">Owner Only</span>
              </div>
              <div className="flex justify-between">
                <span>Availability</span>
                <span className="text-[#F5F2EC]">Coming Soon</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
