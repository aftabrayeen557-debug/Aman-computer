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
      <section className="p-6 sm:p-8 rounded-2xl bg-[#111318] border border-[#C6A56B]/18">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#C6A56B]">
              <span>{navItem.groupTitle}</span>
              <span className="text-[#92949B]">·</span>
              <span className="text-[#92949B]">{navItem.routeSlug}</span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#191C22] border border-[#C6A56B]/30 flex items-center justify-center text-[#C6A56B] shrink-0">
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
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.1] bg-[#191C22] text-xs font-medium text-[#F5F2EC] hover:border-[#C6A56B]/40 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#C6A56B]" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* Reusable State Switcher Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#92949B]">
          Phase 1 Workspace Shell · State Component Check
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#111318] border border-white/[0.08]">
          {(
            [
              { id: 'foundation', label: 'Foundation' },
              { id: 'loading', label: 'Loading' },
              { id: 'empty', label: 'Empty' },
              { id: 'error', label: 'Error' },
            ] as Array<{ id: PreviewStateMode; label: string }>
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreviewState(mode.id)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                previewState === mode.id
                  ? 'bg-[#C6A56B] text-[#090A0C] font-semibold'
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
          title={`Loading ${navItem.label}`}
          subtitle="Demonstrating reusable studio loading state for Phase 2 asynchronous Supabase hydration."
        />
      ) : previewState === 'empty' ? (
        <StudioEmptyState
          title={`${navItem.label} Ready for Content`}
          description="No records are attached in the Phase 1 foundation shell. Phase 2 connects live CRUD forms and PostgreSQL tables here."
          action={{
            label: 'Return to Foundation View',
            onClick: () => setPreviewState('foundation'),
          }}
        />
      ) : previewState === 'error' ? (
        <StudioErrorState
          title={`Unable to Load ${navItem.label}`}
          description="Preview of the studio error recovery surface. Click retry to return cleanly to the workspace foundation."
          onRetry={() => setPreviewState('foundation')}
        />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
                  Phase 2 Architecture Target
                </div>
                <h2 className="font-editorial text-2xl text-[#F5F2EC] mt-0.5">
                  Planned Module Capabilities
                </h2>
              </div>
              <Layers className="w-5 h-5 text-[#C6A56B]" />
            </div>

            <div className="divide-y divide-white/[0.06]">
              {navItem.phase2Modules.map((capability) => (
                <div
                  key={capability}
                  className="py-3.5 flex items-start gap-3 text-sm text-[#F5F2EC]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C6A56B] shrink-0 mt-0.5" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl bg-[#191C22] border border-white/[0.07] space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#C6A56B]">
              Integration Posture
            </div>
            <h2 className="font-editorial text-2xl text-[#F5F2EC]">
              Backend &amp; Security Isolation
            </h2>
            <p className="text-xs text-[#92949B] leading-relaxed">
              This route is registered inside the single-admin authenticated control center.
              Existing Firebase Spark authentication, Supabase PostgreSQL schema, Storage buckets,
              and Row-Level Security policies remain intact and untouched while Phase 1 establishes
              the navigation and layout shell.
            </p>
            <div className="pt-3 border-t border-white/[0.06] space-y-2 text-xs font-mono text-[#92949B]">
              <div className="flex justify-between">
                <span>Route Key</span>
                <span className="text-[#F3EFE7]">{navItem.tab}</span>
              </div>
              <div className="flex justify-between">
                <span>Access Scope</span>
                <span className="text-[#C6A56B]">Sole Admin UID Only</span>
              </div>
              <div className="flex justify-between">
                <span>Phase Status</span>
                <span className="text-[#F3EFE7]">Foundation Ready</span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
