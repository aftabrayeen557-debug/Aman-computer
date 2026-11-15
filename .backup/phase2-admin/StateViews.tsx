import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Inbox, RefreshCw, ArrowLeft } from 'lucide-react';

interface StateAction {
  label: string;
  onClick: () => void;
}

export const StudioLoadingState: React.FC<{
  title?: string;
  subtitle?: string;
}> = ({
  title = 'Loading Studio Workspace',
  subtitle = 'Preparing authenticated modules and control surfaces.',
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22]/70 border border-[#C6A56B]/14 rounded-2xl">
    <div className="w-9 h-9 rounded-full border border-[#C6A56B]/25 border-t-[#C6A56B] animate-spin mb-4" />
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
  </div>
);

export const StudioEmptyState: React.FC<{
  title?: string;
  description?: string;
  action?: StateAction;
}> = ({
  title = 'No Records Staged Yet',
  description = 'This workspace is clear. Live entries and editorial items will appear here once Phase 2 data editors are connected.',
  action,
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22]/70 border border-white/[0.07] rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-[#111318] border border-[#C6A56B]/20 flex items-center justify-center text-[#C6A56B] mb-4">
      <Inbox className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C6A56B] text-[#090A0C] text-xs font-semibold hover:bg-[#F3EFE7] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{action.label}</span>
      </button>
    )}
  </div>
);

export const StudioErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({
  title = 'Workspace Unavailable',
  description = 'An unexpected UI error interrupted rendering. You can safely retry without affecting backend records.',
  onRetry,
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22] border border-rose-500/25 rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-300 mb-4">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C6A56B]/30 bg-[#111318] text-[#F3EFE7] text-xs font-medium hover:border-[#C6A56B]/60 transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#C6A56B]" />
        <span>Retry Workspace</span>
      </button>
    )}
  </div>
);

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class StudioErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Admin workspace boundary caught error:', error, info);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <StudioErrorState
          title={this.props.fallbackTitle || 'Module Render Interrupted'}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
