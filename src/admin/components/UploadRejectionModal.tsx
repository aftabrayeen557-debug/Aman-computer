import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, FileWarning, X } from 'lucide-react';
import { BatchFileRejection } from '../services/fileSecurityService';

export interface UploadRejectionDetails {
  fileName: string;
  reason: string;
  allowedFormats: string;
  maxSize: string;
  fieldLabel?: string;
  batchRejections?: BatchFileRejection[];
}

interface UploadRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: UploadRejectionDetails | null;
}

export const UploadRejectionModal: React.FC<UploadRejectionModalProps> = ({
  isOpen,
  onClose,
  details,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !details) return null;

  const hasBatchItems = Boolean(details.batchRejections && details.batchRejections.length > 0);
  const portalTarget =
    typeof document !== 'undefined'
      ? document.querySelector('.admin-studio-theme') || document.body
      : null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#24160a]/35 dark:bg-black/70 backdrop-blur-[6px]"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="upload-rejected-title"
      aria-describedby="upload-rejected-desc"
    >
      <div
        className="w-full max-w-md max-h-[90vh] rounded-[22px] studio-glass-popover text-[var(--st-tx)] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-[var(--st-line)] flex items-start gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <h3
              id="upload-rejected-title"
              className="font-editorial text-lg text-[var(--st-tx)] tracking-tight"
            >
              File Upload Rejected
            </h3>
            <p className="text-xs text-[var(--st-mut)] mt-0.5 truncate">
              {details.fieldLabel
                ? `Upload field: ${details.fieldLabel}`
                : 'File security and format verification failed.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--st-mut)] hover:text-[var(--st-tx)] p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
            aria-label="Close rejection popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs overflow-y-auto admin-studio-scroll">
          {/* Exact Filename */}
          <div>
            <span className="text-[11px] font-medium text-[var(--st-mut)] block mb-1.5">
              Selected File{hasBatchItems ? 's' : ''}
            </span>
            <div className="px-3.5 py-2.5 rounded-xl studio-glass-soft border border-[var(--st-line)] font-mono text-xs text-[var(--st-tx)] break-all select-all">
              {details.fileName}
            </div>
          </div>

          {/* Primary Rejection Reason */}
          <div
            id="upload-rejected-desc"
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-700 dark:text-rose-300"
          >
            <FileWarning className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
            <div className="leading-relaxed font-medium">{details.reason}</div>
          </div>

          {/* Per-file batch rejection breakdown if multiple files were evaluated */}
          {hasBatchItems && (
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-[var(--st-mut)] block">
                Individual File Breakdown
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 admin-studio-scroll">
                {details.batchRejections!.map((item, idx) => (
                  <div
                    key={`${item.fileName}-${idx}`}
                    className="p-2.5 rounded-xl studio-glass-soft border border-[var(--st-line)] space-y-0.5"
                  >
                    <div className="flex items-center justify-between gap-2 font-mono text-[11px] text-[var(--st-tx)]">
                      <span className="truncate">{item.fileName}</span>
                      <span className="text-[var(--st-mut)] shrink-0">{item.fileSizeText}</span>
                    </div>
                    <p className="text-[11px] text-rose-600 dark:text-rose-300 leading-snug">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Formats & Max Size Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl studio-glass-soft border border-[var(--st-line)]">
              <span className="text-[11px] text-[var(--st-mut)] block mb-1">
                Accepted File Formats
              </span>
              <span className="text-xs font-semibold text-[#A47E3E] dark:text-[#DFC492] block leading-snug">
                {details.allowedFormats}
              </span>
            </div>

            <div className="p-3 rounded-xl studio-glass-soft border border-[var(--st-line)]">
              <span className="text-[11px] text-[var(--st-mut)] block mb-1">
                Maximum Allowed Size
              </span>
              <span className="text-xs font-semibold text-[#A47E3E] dark:text-[#DFC492] block leading-snug">
                {details.maxSize}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--st-line)] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="px-5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(modalContent, portalTarget) : modalContent;
};
