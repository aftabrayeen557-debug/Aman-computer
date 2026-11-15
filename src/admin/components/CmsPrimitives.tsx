import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';
import { StorageBucketName, uploadFileToStorage } from '../services/storageService';

export const CmsPageHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-white/[0.07]">
    <div className="space-y-1.5 min-w-0">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
        {eyebrow}
      </div>
      <h1 className="font-editorial text-2xl sm:text-3xl text-[#E8E5DF] tracking-tight">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-[#85838A] max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>}
  </div>
);

export const CmsSurfaceCard: React.FC<{
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, headerRight, children, className = '' }) => (
  <section
    className={`rounded-2xl bg-[#141419] border border-white/[0.07] p-5 sm:p-6 ${className}`}
  >
    {(title || headerRight) && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
        <div>
          {title && (
            <h2 className="font-editorial text-xl text-[#E8E5DF] tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xs text-[#85838A] mt-0.5">{subtitle}</p>
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
    className="w-full flex items-center justify-between gap-4 p-3.5 rounded-xl bg-[#101014] border border-white/[0.07] hover:border-[#C9A96E]/35 transition-colors text-left cursor-pointer"
  >
    <div className="min-w-0">
      <div className="text-xs font-medium text-[#E8E5DF]">{label}</div>
      {description && (
        <div className="text-[11px] text-[#85838A] mt-0.5 leading-relaxed">
          {description}
        </div>
      )}
    </div>
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors ${
        checked
          ? 'bg-[#C9A96E] border-[#C9A96E]'
          : 'bg-[#16161B] border-white/[0.15]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-[#0A0A0E] shadow-xs transform transition-transform mt-[1px] ${
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
  helperText?: string;
  emptyLabel?: string;
  aspectClass?: string;
  onError?: (message: string) => void;
}> = ({
  label,
  value,
  onChange,
  onRemove,
  bucket = 'media-library',
  folder = 'cms-assets',
  helperText,
  emptyLabel = 'No image uploaded yet',
  aspectClass = 'aspect-video',
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const previousUrl = value;
      const result = await uploadFileToStorage(bucket, file, folder, 'image');
      if (!result.success || !result.url) {
        onError?.(result.error || 'Unable to upload file.');
        return;
      }
      if (previousUrl && previousUrl !== result.url) {
        onRemove?.(previousUrl);
      }
      onChange(result.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to upload file.';
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-[#E8E5DF]">{label}</label>
        {value && (
          <button
            type="button"
            onClick={() => {
              const prev = value;
              onChange('');
              onRemove?.(prev);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Remove</span>
          </button>
        )}
      </div>

      <div
        className={`relative rounded-xl border border-white/[0.08] bg-[#0A0A0E] overflow-hidden flex items-center justify-center ${aspectClass}`}
      >
        {value ? (
          <img
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-[#85838A]">
            <ImageIcon className="w-6 h-6 text-[#C9A96E]/60" />
            <span className="text-xs">{emptyLabel}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-[#211B16] border border-[#C9A96E]/35 text-xs font-medium text-[#E8E5DF] hover:border-[#C9A96E]/65 transition-colors cursor-pointer disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A96E]" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-[#C9A96E]" />
          )}
          <span>{uploading ? 'Uploading…' : value ? 'Replace Image' : 'Upload Image'}</span>
        </button>

        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste an image URL (https://...)"
          className="flex-1 px-3 py-2 rounded-xl bg-[#0A0A0E] border border-white/[0.08] text-xs font-mono text-[#E8E5DF] placeholder-[#85838A] outline-none focus:border-[#C9A96E]/60"
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-[#85838A] leading-relaxed">{helperText}</p>
      )}
    </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[90vh] rounded-2xl bg-[#141419] border border-[#C9A96E]/25 shadow-2xl flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between gap-4 shrink-0">
          <div className="min-w-0">
            <h3 className="font-editorial text-xl text-[#E8E5DF] truncate">{title}</h3>
            {subtitle && <p className="text-xs text-[#85838A] mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#85838A] hover:text-[#E8E5DF] hover:bg-white/[0.05] transition-colors cursor-pointer"
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
