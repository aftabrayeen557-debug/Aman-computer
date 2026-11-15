import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAdmin();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
          info: <Info className="w-4 h-4 text-[#DFC492] shrink-0 mt-0.5" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl bg-[#16161B]/95 border border-[#C9A96E]/30 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-start gap-3"
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-xs font-semibold text-[#E8E5DF] tracking-tight">
                {toast.title}
              </div>
              {toast.message && (
                <div className="text-xs text-[#85838A] mt-0.5 leading-relaxed">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[#85838A] hover:text-[#E8E5DF] p-1 rounded-md transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
