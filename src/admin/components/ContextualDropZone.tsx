import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileCheck,
  Loader2,
  Trash2,
  RefreshCw,
  Link2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import {
  ContextualUploadConfig,
  formatUploadBytes,
  getFileFingerprint,
  isSafeAssetUrl,
  resolveUploadSpec,
  validateFilesBatch,
} from '../services/fileSecurityService';
import { UploadOptions } from '../services/storageService';
import { UploadRejectionModal, UploadRejectionDetails } from './UploadRejectionModal';

export interface ContextualDropZoneProps {
  label?: string;
  fieldId?: string;
  value: string;
  onChange: (url: string) => void;
  onRemove?: (prevUrl: string) => void;
  config: ContextualUploadConfig;
  onUploadFile: (
    file: File,
    options?: UploadOptions
  ) => Promise<{ success: boolean; url?: string; error?: string; fileSize?: string; aborted?: boolean }>;
  helperText?: string;
  emptyLabel?: string;
  aspectClass?: string;
  fitClass?: string;
  allowUrlInput?: boolean;
  disabled?: boolean;
  maxFiles?: number;
}

export const ContextualDropZone: React.FC<ContextualDropZoneProps> = ({
  label,
  fieldId,
  value,
  onChange,
  onRemove,
  config,
  onUploadFile,
  helperText,
  emptyLabel = 'No file uploaded yet',
  aspectClass = 'aspect-video',
  fitClass = 'object-cover',
  allowUrlInput = true,
  disabled = false,
  maxFiles = 1,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>('');
  const [uploadPercent, setUploadPercent] = useState<number | null>(null);
  const [zoneStatus, setZoneStatus] = useState<'idle' | 'accepted' | 'rejected' | 'failed'>('idle');
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);
  const [rejectionDetails, setRejectionDetails] = useState<UploadRejectionDetails | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    size: string;
    fingerprint: string;
  } | null>(null);
  const [failedFile, setFailedFile] = useState<File | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  const dragCounter = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadLockRef = useRef(false);

  const spec = resolveUploadSpec(config);
  const maxSizeText = config.customMaxText || spec.maxText;
  const allowedFormatsText = spec.allowedText;
  const effectiveMaxFiles = config.maxFiles ?? maxFiles;

  useEffect(() => {
    setZoneStatus('idle');
    setInlineFeedback(null);
    setFailedFile(null);
  }, [config.category, config.dynamicSubcategory]);

  const triggerRejection = (details: UploadRejectionDetails, inlineMsg?: string) => {
    setZoneStatus('rejected');
    setInlineFeedback(inlineMsg || details.reason);
    setRejectionDetails(details);
    setIsRejectionModalOpen(true);
  };

  const executeFileUpload = async (file: File) => {
    if (disabled || uploadLockRef.current) return;

    uploadLockRef.current = true;
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setUploading(true);
    setUploadPercent(null);
    setUploadStage('Uploading to secure storage…');
    setInlineFeedback(null);
    setFailedFile(null);

    try {
      const previousUrl = value;
      const res = await onUploadFile(file, {
        signal: controller.signal,
        deepConfig: config,
        onProgress: (pct) => {
          setUploadPercent(pct);
          setUploadStage(`Uploading… ${pct}%`);
        },
      });

      if (res.aborted) {
        setZoneStatus('idle');
        setInlineFeedback('Upload cancelled. No file was saved.');
        return;
      }

      if (!res.success || !res.url) {
        setZoneStatus('failed');
        setFailedFile(file);
        const errMsg =
          res.error ||
          "We couldn't upload this file right now. Check your connection or retry.";
        setInlineFeedback(errMsg);
        setRejectionDetails({
          fileName: file.name,
          reason: errMsg,
          allowedFormats: allowedFormatsText,
          maxSize: maxSizeText,
          fieldLabel: label,
        });
        setIsRejectionModalOpen(true);
        return;
      }

      const fp = getFileFingerprint(file);
      setSelectedFileMeta({
        name: file.name,
        size: res.fileSize || formatUploadBytes(file.size),
        fingerprint: fp,
      });
      setZoneStatus('accepted');
      setInlineFeedback(null);
      setFailedFile(null);

      if (previousUrl && previousUrl !== res.url) {
        onRemove?.(previousUrl);
      }

      onChange(res.url);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unexpected connection error during storage upload.';
      setZoneStatus('failed');
      setFailedFile(file);
      setInlineFeedback(msg);
      setRejectionDetails({
        fileName: file.name,
        reason: msg,
        allowedFormats: allowedFormatsText,
        maxSize: maxSizeText,
        fieldLabel: label,
      });
      setIsRejectionModalOpen(true);
    } finally {
      uploadLockRef.current = false;
      abortControllerRef.current = null;
      setUploading(false);
      setUploadPercent(null);
      setUploadStage('');
    }
  };

  const handleFilesSelected = async (fileList: FileList | File[] | null) => {
    if (disabled || uploadLockRef.current || !fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setIsDragOver(false);
    dragCounter.current = 0;

    setUploading(true);
    setUploadPercent(null);
    setUploadStage('Verifying file security & signature…');

    const existingFingerprints = new Set<string>();
    if (value && selectedFileMeta?.fingerprint) {
      existingFingerprints.add(selectedFileMeta.fingerprint);
    }

    const batchResult = await validateFilesBatch(files, config, {
      maxFiles: effectiveMaxFiles,
      existingFingerprints,
    });

    setUploading(false);
    setUploadStage('');

    // Reject if max count exceeded or any invalid file was detected
    if (batchResult.countExceededError || batchResult.rejectedFiles.length > 0) {
      const firstRejected = batchResult.rejectedFiles[0];
      const summaryName =
        files.length === 1
          ? files[0].name
          : `${files.length} files (${files.map((f) => f.name).join(', ')})`;

      const primaryReason =
        batchResult.countExceededError ||
        firstRejected?.reason ||
        'One or more selected files failed security validation.';

      triggerRejection(
        {
          fileName: summaryName,
          reason: primaryReason,
          allowedFormats: batchResult.allowedFormatsText,
          maxSize: batchResult.maxSizeText,
          fieldLabel: label,
          batchRejections: files.length > 1 ? batchResult.rejectedFiles : undefined,
        },
        primaryReason
      );
      return;
    }

    const accepted = batchResult.validFiles[0];
    if (!accepted) return;

    await executeFileUpload(accepted);
  };

  const handleCancelUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    abortControllerRef.current?.abort();
  };

  const handleRetryFailedUpload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (failedFile) {
      void executeFileUpload(failedFile);
    }
  };

  const handleClearFailedFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFailedFile(null);
    setZoneStatus('idle');
    setInlineFeedback(null);
  };

  // Drag events strictly confined to THIS dropZone element (no global listeners)
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    dragCounter.current += 1;
    if (e.dataTransfer.types?.includes('Files')) {
      setIsDragOver(true);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    dragCounter.current = 0;
    setIsDragOver(false);
    void handleFilesSelected(e.dataTransfer.files);
  };

  const handleZoneClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || uploading) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length > 0) {
      void handleFilesSelected(files);
    }
  };

  const acceptAttr = spec.mimeTypes.join(',');
  const isDocumentCategory =
    config.category === 'document' || config.dynamicSubcategory === 'document-template';
  const hasValue = Boolean(value && value.trim());
  const isSameOriginBlob =
    typeof window !== 'undefined' &&
    value.trim().startsWith(`blob:${window.location.origin}/`);
  const safePreviewSrc =
    hasValue && (isSafeAssetUrl(value) || isSameOriginBlob) ? value : '';

  const zoneId = fieldId || `dropzone-${(label || 'file').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <div className="space-y-2.5">
      {/* Label & Top Controls */}
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label htmlFor={`${zoneId}-input`} className="text-xs font-semibold text-[var(--st-tx)] tracking-tight">
            {label}
          </label>
        )}
        <div className="flex items-center gap-3">
          {allowUrlInput && (
            <button
              type="button"
              onClick={() => {
                setShowUrlInput((prev) => !prev);
                setUrlDraft(value || '');
                setUrlError(null);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-[#C9A96E] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A96E] rounded"
            >
              <Link2 className="w-3 h-3" />
              <span>{showUrlInput ? 'Hide URL' : 'Paste Link'}</span>
            </button>
          )}

          {hasValue && (
            <button
              type="button"
              onClick={() => {
                const prev = value;
                onChange('');
                setSelectedFileMeta(null);
                setZoneStatus('idle');
                setInlineFeedback(null);
                onRemove?.(prev);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-rose-500 dark:text-rose-400 hover:opacity-80 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 rounded"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>

      {/* Drop Zone Container */}
      <div
        ref={dropZoneRef}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={label ? `${label} upload area. Drag and drop or press Enter to browse files.` : 'File upload area'}
        aria-describedby={`${zoneId}-specs`}
        aria-busy={uploading}
        onClick={handleZoneClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-upload-zone={zoneId}
        data-drag-over={isDragOver ? 'true' : 'false'}
        data-upload-status={zoneStatus}
        className={`group relative rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isDragOver
            ? 'border-[#C9A96E] bg-[#C9A96E]/12 ring-4 ring-[#C9A96E]/20 scale-[1.005]'
            : zoneStatus === 'rejected' || zoneStatus === 'failed'
            ? 'border-dashed border-rose-500/70 bg-rose-500/5 hover:border-rose-500'
            : hasValue
            ? 'border-solid border-[var(--st-line)] studio-glass-soft hover:border-[#C9A96E]/55'
            : 'border-dashed border-[var(--st-line)] studio-glass-soft hover:border-[#C9A96E]/50 hover:bg-[#C9A96E]/5'
        }`}
      >
        <input
          id={`${zoneId}-input`}
          ref={fileInputRef}
          type="file"
          accept={acceptAttr}
          onChange={handleFileInputChange}
          disabled={disabled || uploading}
          className="hidden"
          tabIndex={-1}
        />

        {/* Active Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-[#101014]/85 backdrop-blur-sm p-5 text-center">
            <div className="w-10 h-10 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E]/40 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-[#C9A96E]" />
            </div>
            <div className="w-full max-w-[220px] space-y-1.5">
              <p className="text-xs font-semibold text-white tracking-wide">
                {uploadStage || 'Uploading…'}
              </p>
              {uploadPercent !== null && (
                <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="h-full bg-[#C9A96E] transition-all duration-150"
                    style={{ width: `${uploadPercent}%` }}
                  />
                </div>
              )}
            </div>
            {abortControllerRef.current && (
              <button
                type="button"
                onClick={handleCancelUpload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-[11px] font-medium text-white/90 hover:bg-white/10 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Cancel Upload</span>
              </button>
            )}
          </div>
        )}

        {/* Active Drag-Over Overlay */}
        {isDragOver && !uploading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#C9A96E]/15 backdrop-blur-[2px] p-4 text-center">
            <UploadCloud className="w-8 h-8 text-[#C9A96E]" />
            <p className="text-xs font-bold text-[var(--st-tx)] tracking-wide">
              Drop your files here
            </p>
            <p className="text-[11px] text-[var(--st-mut)]">
              {label ? `Uploading to ${label}` : 'Release to validate and upload'}
            </p>
          </div>
        )}

        {/* Existing Value Preview or Empty State */}
        {hasValue && !isDocumentCategory ? (
          <div className={`relative w-full ${aspectClass} flex items-center justify-center bg-black/5 dark:bg-black/25`}>
            {safePreviewSrc ? (
              <img
                src={safePreviewSrc}
                alt={label || 'Uploaded preview'}
                className={`w-full h-full ${fitClass}`}
              />
            ) : (
              <div className="p-4 text-center text-xs text-rose-500">
                Blocked unsafe preview URL
              </div>
            )}

            <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-4 text-center">
              <RefreshCw className="w-5 h-5 text-[#C9A96E]" />
              <span className="text-xs font-medium">Drag &amp; drop or browse to replace</span>
            </div>

            {selectedFileMeta && (
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-white/15 flex items-center justify-between gap-2 text-[11px] text-white">
                <span className="inline-flex items-center gap-1.5 truncate min-w-0 font-mono text-[10px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{selectedFileMeta.name}</span>
                </span>
                <span className="text-[#DFC492] font-semibold shrink-0">
                  {selectedFileMeta.size}
                </span>
              </div>
            )}
          </div>
        ) : hasValue && isDocumentCategory ? (
          <div className="p-5 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/15 border border-[#C9A96E]/35 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5 text-[#C9A96E]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--st-tx)] truncate">
                  {selectedFileMeta?.name || 'Uploaded Document'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{selectedFileMeta?.size || 'Verified'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[var(--st-mut)] mt-0.5 truncate font-mono">
                {value}
              </p>
              <span className="text-[10.5px] text-[#A47E3E] dark:text-[#C9A96E] mt-1 inline-block">
                Drop a new document or click to replace
              </span>
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl studio-glass-card border border-[var(--st-line)] group-hover:border-[#C9A96E]/55 flex items-center justify-center transition-all duration-200">
              <UploadCloud className="w-5 h-5 text-[#C9A96E] transition-transform duration-200 group-hover:-translate-y-0.5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--st-tx)]">
                Drag &amp; drop your files here
              </p>
              <p className="text-[11px] text-[var(--st-mut)]">
                or{' '}
                <span className="text-[#A47E3E] dark:text-[#DFC492] font-medium underline underline-offset-2">
                  browse files
                </span>
              </p>
            </div>
            {emptyLabel && (
              <p className="text-[11px] text-[var(--st-mut)] max-w-xs">{emptyLabel}</p>
            )}
          </div>
        )}
      </div>

      {/* Explicit Format & Max File Size Line Below Every Upload Area */}
      <div
        id={`${zoneId}-specs`}
        className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--st-mut)]"
      >
        <span>
          Allowed formats: <strong className="font-medium text-[var(--st-tx)]">{allowedFormatsText}</strong>
        </span>
        <span className="font-mono">Max size: {maxSizeText}</span>
      </div>

      {/* Inline Rejection / Retry / Cancelled Notice + Screen Reader Live Region */}
      <div aria-live="polite">
        {(zoneStatus === 'rejected' || zoneStatus === 'failed') && inlineFeedback && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2 text-rose-700 dark:text-rose-300 min-w-0">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400" />
              <span className="leading-relaxed">{inlineFeedback}</span>
            </div>
            {zoneStatus === 'failed' && failedFile && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRetryFailedUpload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-[11px] font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearFailedFile}
                  className="text-[11px] text-[var(--st-mut)] hover:text-[var(--st-tx)] cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}
        {zoneStatus === 'idle' && inlineFeedback && (
          <div className="p-2.5 rounded-xl studio-glass-soft border border-[var(--st-line)] flex items-center justify-between gap-2 text-[11px] text-[var(--st-mut)]">
            <span>{inlineFeedback}</span>
            <button
              type="button"
              onClick={() => setInlineFeedback(null)}
              className="text-[11px] text-[var(--st-tx)] hover:underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Direct URL Input Toggle Drawer */}
      {showUrlInput && (
        <div className="p-3 rounded-xl studio-glass-soft border border-[var(--st-line)] space-y-2">
          <label className="text-[11px] font-medium text-[var(--st-tx)] block">
            Direct Safe Asset URL (HTTPS or /assets/ path)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlDraft}
              onChange={(e) => {
                setUrlDraft(e.target.value);
                setUrlError(null);
              }}
              placeholder="https://... or /assets/aistudio/logo.svg"
              className="flex-1 px-3 py-2 rounded-xl studio-glass-input text-xs font-mono placeholder-[var(--st-mut)] outline-none focus:ring-1 focus:ring-[#C9A96E]"
            />
            <button
              type="button"
              onClick={() => {
                const candidate = urlDraft.trim();
                if (!candidate) return;
                if (!isSafeAssetUrl(candidate)) {
                  setUrlError('Only safe HTTPS URLs or verified relative paths are allowed.');
                  return;
                }
                onChange(candidate);
                setZoneStatus('idle');
                setInlineFeedback(null);
                setSelectedFileMeta(null);
                setShowUrlInput(false);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#C9A96E] hover:bg-[#DFC492] text-[#0A0A0E] text-xs font-semibold cursor-pointer"
            >
              Apply
            </button>
          </div>
          {urlError && (
            <p className="text-[11px] text-rose-500 dark:text-rose-400">{urlError}</p>
          )}
        </div>
      )}

      {helperText && (
        <p className="text-[11px] text-[var(--st-mut)] leading-relaxed">{helperText}</p>
      )}

      <UploadRejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => setIsRejectionModalOpen(false)}
        details={rejectionDetails}
      />
    </div>
  );
};
