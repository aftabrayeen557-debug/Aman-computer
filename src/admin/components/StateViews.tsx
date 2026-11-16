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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center studio-glass-card rounded-[22px]">
    <div className="w-9 h-9 rounded-full border-2 border-[#C9A96E]/25 border-t-[#C9A96E] animate-spin mb-4" />
    <div className="font-editorial text-xl text-[var(--st-tx)] tracking-tight">{title}</div>
    <p className="text-xs text-[var(--st-mut)] mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center studio-glass-card rounded-[22px]">
    <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/12 border border-[#C9A96E]/35 flex items-center justify-center text-[#C9A96E] mb-4">
      <Inbox className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[var(--st-tx)] tracking-tight">{title}</div>
    <p className="text-xs text-[var(--st-mut)] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-5 studio-btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center studio-glass-card border-rose-500/35 rounded-[22px]">
    <div className="w-11 h-11 rounded-xl bg-rose-500/12 border border-rose-500/30 flex items-center justify-center text-rose-500 dark:text-rose-300 mb-4">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[var(--st-tx)] tracking-tight">{title}</div>
    <p className="text-xs text-[var(--st-mut)] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 studio-btn-secondary inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5 text-[#C9A96E]" />
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
