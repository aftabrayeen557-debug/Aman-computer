import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';
import { StorageBucketName, uploadFileToStorage, UploadOptions } from '../services/storageService';
import { ContextualDropZone } from './ContextualDropZone';
import { useAdmin } from '../context/AdminContext';
import { get3dIconForTab } from '../config/navigation';

export const CmsPageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  icon3d?: string;
}> = ({ eyebrow, title, description, actions, icon3d }) => {
  const { currentTab } = useAdmin();
  const resolvedIcon3d = icon3d || get3dIconForTab(currentTab);

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[var(--st-line)]">
      <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
        {resolvedIcon3d && (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/45 dark:bg-white/[0.06] border border-[var(--st-line)] p-1.5 shrink-0 shadow-xs flex items-center justify-center">
            <img
              src={resolvedIcon3d}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
            />
          </div>
        )}
        <div className="space-y-1.5 min-w-0">
          <div className="text-[10.5px] font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
            {eyebrow}
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-[var(--st-tx)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--st-mut)] max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
};

export const CmsSurfaceCard: React.FC<{
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, headerRight, children, className = '' }) => (
  <section
    className={`rounded-[20px] studio-glass-card p-5 sm:p-6 transition-colors ${className}`}
  >
    {(title || headerRight) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[var(--st-line)]">
        <div>
          {title && (
            <h2 className="font-editorial text-xl text-[var(--st-tx)] tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--st-mut)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {headerRight && <div className="shrink-0">{headerRight}</div>}
      </div>
    )}
    {children}
  </section>
);

export const CmsToggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="w-full flex items-center justify-between gap-4 p-3.5 rounded-xl studio-glass-soft hover:border-[#C9A96E]/45 transition-colors text-left cursor-pointer"
  >
    <div className="min-w-0">
      <div className="text-xs font-medium text-[var(--st-tx)]">{label}</div>
      {description && (
        <div className="text-[11px] text-[var(--st-mut)] mt-0.5 leading-relaxed">
          {description}
        </div>
      )}
    </div>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked
          ? 'bg-[#C9A96E] border-[#C9A96E]'
          : 'bg-black/15 dark:bg-white/10 border-[var(--st-line)]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-[#1c1208] dark:bg-[#0e0805] shadow-xs transform transition-transform mt-[1px] ${
          checked ? 'translate-x-4' : 'translate-x-0.5'
        }`}
      />
    </span>
  </button>
);

export const CmsMediaField: React.FC<{
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  onRemove?: (previousUrl: string) => void;
  bucket?: StorageBucketName;
  folder?: string;
  category?: 'image' | 'brand-logo' | 'favicon' | 'document';
  helperText?: string;
  emptyLabel?: string;
  aspectClass?: string;
  fitClass?: string;
  onError?: (message: string) => void;
}> = ({
  label,
  value,
  onChange,
  onRemove,
  bucket = 'media-library',
  folder = 'cms-assets',
  category,
  helperText,
  emptyLabel = 'No file uploaded yet',
  aspectClass = 'aspect-video',
  fitClass = 'object-cover',
  onError,
}) => {
  const resolvedCategory =
    category ||
    (label.toLowerCase().includes('favicon')
      ? 'favicon'
      : label.toLowerCase().includes('logo')
      ? 'brand-logo'
      : bucket === 'customer-documents'
      ? 'document'
      : 'image');

  const handleUploadFile = async (file: File, options?: UploadOptions) => {
    try {
      const storageCategory = resolvedCategory === 'document' ? 'document' : 'image';
      const result = await uploadFileToStorage(bucket, file, folder, storageCategory, {
        ...options,
        deepConfig: { category: resolvedCategory },
      });
      if (!result.success || !result.url) {
        onError?.(result.error || 'Unable to upload file.');
      }
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to upload file.';
      onError?.(msg);
      return { success: false, error: msg };
    }
  };

  return (
    <ContextualDropZone
      label={label}
      value={value}
      onChange={onChange}
      onRemove={onRemove}
      config={{
        category: resolvedCategory,
      }}
      onUploadFile={handleUploadFile}
      helperText={helperText}
      emptyLabel={emptyLabel}
      aspectClass={aspectClass}
      fitClass={fitClass}
      allowUrlInput={true}
    />
  );
};


export const CmsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}> = ({ open, onClose, title, subtitle, children, maxWidthClass = 'max-w-2xl' }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24160a]/30 dark:bg-black/60 backdrop-blur-[5px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] rounded-[22px] studio-glass-popover flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[var(--st-line)] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h3 className="font-editorial text-xl text-[var(--st-tx)] truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[var(--st-mut)] mt-0.5 truncate">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--st-mut)] hover:text-[var(--st-tx)] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto admin-studio-scroll">{children}</div>
      </div>
    </div>
  );
};
