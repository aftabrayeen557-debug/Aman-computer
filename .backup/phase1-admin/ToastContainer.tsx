import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl bg-[#F0ECE9]/95 dark:bg-[#1A1818]/95 border border-[rgba(196,176,176,0.35)] dark:border-[rgba(196,176,176,0.2)] shadow-xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right-4 duration-300"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-xs font-bold text-[#1A1818] dark:text-[#E8E4E0] tracking-tight">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-xs text-[#857878] dark:text-[#B5A8A8] mt-0.5 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#857878] hover:text-[#1A1818] dark:hover:text-[#E8E4E0] p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
