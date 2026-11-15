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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#141419] border border-[#C9A96E]/20 rounded-2xl">
    <div className="w-9 h-9 rounded-full border-2 border-[#C9A96E]/20 border-t-[#C9A96E] animate-spin mb-4" />
    <div className="font-editorial text-xl text-[#E8E5DF] tracking-tight">{title}</div>
    <p className="text-xs text-[#85838A] mt-1.5 max-w-sm leading-relaxed">{subtitle}</p>
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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#141419] border border-white/[0.07] rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-[#101014] border border-[#C9A96E]/30 flex items-center justify-center text-[#C9A96E] mb-4">
      <Inbox className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#E8E5DF] tracking-tight">{title}</div>
    <p className="text-xs text-[#85838A] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {action && (
      <button
        type="button"
        onClick={action.onClick}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A96E] text-[#0A0A0E] text-xs font-semibold hover:bg-[#DFC492] transition-colors cursor-pointer"
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
  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center bg-[#141419] border border-rose-500/30 rounded-2xl">
    <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-300 mb-4">
      <AlertTriangle className="w-5 h-5" />
    </div>
    <div className="font-editorial text-xl text-[#E8E5DF] tracking-tight">{title}</div>
    <p className="text-xs text-[#85838A] mt-1.5 max-w-md leading-relaxed">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C9A96E]/35 bg-[#101014] text-[#E8E5DF] text-xs font-medium hover:border-[#C9A96E]/60 hover:bg-[#211B16] transition-colors cursor-pointer"
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
