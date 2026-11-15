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
  title = 'Loading your information...',
  subtitle = 'Please wait while your workspace loads.',
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22]/75 border border-orange-500/20 rounded-2xl shadow-[0_0_32px_-16px_rgba(249,115,22,0.35)]">
    <div className="w-9 h-9 rounded-full border-2 border-orange-500/20 border-t-orange-400 animate-spin mb-4" />
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
  </div>
);

export const StudioEmptyState: React.FC<{
  title?: string;
  description?: string;
  action?: StateAction;
}> = ({
  title = 'No Content Available Yet',
  description = 'No content available yet. Add your first item to get started.',
  action,
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22]/70 border border-white/[0.07] rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-[#111318] border border-orange-500/25 flex items-center justify-center text-orange-400 mb-4 shadow-[0_0_20px_-6px_rgba(249,115,22,0.45)]">
      <Inbox className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-[#090A0C] text-xs font-semibold hover:brightness-110 transition-all shadow-[0_0_20px_-4px_rgba(249,115,22,0.5)] cursor-pointer"
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
  title = 'Unable to Load This Section',
  description = 'Something went wrong while loading this page. Your saved data is safe—please try again.',
  onRetry,
}) => (
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#191C22] border border-rose-500/30 rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-300 mb-4">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#F5F2EC] tracking-tight">{title}</div>
    <p className="text-xs text-[#92949B] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-500/35 bg-[#111318] text-orange-100 text-xs font-medium hover:border-orange-400/60 hover:bg-orange-500/10 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
        <span>Try Again</span>
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
    console.error('Workspace error boundary caught error:', error, info);
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
          title={this.props.fallbackTitle || 'Something Went Wrong'}
          onRetry={() => this.setState({ hasError: false })}
        />
      );
    }
    return this.props.children;
  }
}
