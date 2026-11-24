/**
 * Comprehensive File Security Validation Service for Aman Computer Admin Dashboard.
 *
 * Enforces:
 * 1. Contextual file extension & MIME type allowlists per upload field.
 * 2. Magic byte / binary file signature verification (rejects spoofed MIME/extensions).
 * 3. Double-extension and executable payload defense (.exe, .apk, .bat, .cmd, .js, .html, .php, etc.).
 * 4. Maximum byte size limits (5 MB images/logos, 2 MB favicons, 10 MB documents).
 * 5. Empty (0-byte) & corrupted file rejection (including browser raster image decode check).
 * 6. Path traversal and suspicious filename defense.
 * 7. Multi-file batch validation (max file count, individual per-file reasons, duplicate detection).
 * 8. Safe preview URL validation (blocks javascript:, data:text/html, and untrusted inline SVG).
 */

export type UploadFieldCategory =
  | 'image'
  | 'brand-logo'
  | 'favicon'
  | 'document'
  | 'media-library-dynamic';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  rejectionTitle?: string;
  rejectionReason?: string;
  allowedFormatsText: string;
  maxSizeBytes: number;
  maxSizeText: string;
  detectedType?: string;
  resolvedMimeType?: string;
}

export interface ContextualUploadConfig {
  category: UploadFieldCategory;
  dynamicSubcategory?: 'banner' | 'logo' | 'gallery' | 'document-template' | 'all';
  customMaxSizeBytes?: number;
  customMaxText?: string;
  maxFiles?: number;
}

export interface BatchFileRejection {
  fileName: string;
  fileSizeText: string;
  reason: string;
}

export interface BatchValidationResult {
  validFiles: File[];
  rejectedFiles: BatchFileRejection[];
  countExceededError?: string;
  allowedFormatsText: string;
  maxSizeText: string;
}

export const EXECUTABLE_EXTENSIONS = new Set([
  'exe', 'apk', 'bat', 'cmd', 'sh', 'bash', 'zsh', 'ps1', 'psm1',
  'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx',
  'html', 'htm', 'xhtml', 'shtml', 'svg',
  'php', 'phtml', 'php3', 'php4', 'php5', 'phps',
  'asp', 'aspx', 'jsp', 'jspx', 'cgi', 'pl', 'py', 'rb',
  'vbs', 'vbe', 'msi', 'msp', 'dll', 'sys', 'scr', 'cpl',
  'jar', 'war', 'com', 'pif', 'vb', 'wsf', 'wsh', 'reg',
  'action', 'bin', 'deb', 'rpm', 'app', 'dmg', 'pkg', 'hta',
]);

// Extensions strictly blocked for executables/scripts (SVG is handled contextually with a clearer message)
const STRICTLY_MALICIOUS_EXTENSIONS = new Set(
  [...EXECUTABLE_EXTENSIONS].filter((e) => e !== 'svg')
);

const EXTENSION_MIME_MAP: Record<string, string[]> = {
  jpg: ['image/jpeg', 'image/jpg', 'image/pjpeg'],
  jpeg: ['image/jpeg', 'image/jpg', 'image/pjpeg'],
  png: ['image/png'],
  webp: ['image/webp'],
  pdf: ['application/pdf'],
  doc: ['application/msword'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const CANONICAL_MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export interface UploadCategorySpec {
  extensions: string[];
  mimeTypes: string[];
  maxBytes: number;
  maxText: string;
  allowedText: string;
}

export const CATEGORY_SPECS: Record<Exclude<UploadFieldCategory, 'media-library-dynamic'>, UploadCategorySpec> = {
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'webp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    maxText: '5 MB',
    allowedText: 'JPG, JPEG, PNG and WebP',
  },
  'brand-logo': {
    extensions: ['png', 'jpg', 'jpeg', 'webp'],
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    maxText: '5 MB',
    allowedText: 'PNG, JPG, JPEG and WebP',
  },
  favicon: {
    extensions: ['png', 'jpg', 'jpeg', 'webp'],
    mimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    maxBytes: 2 * 1024 * 1024,
    maxText: '2 MB',
    allowedText: 'PNG, JPG, JPEG and WebP',
  },
  document: {
    extensions: ['pdf', 'doc', 'docx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxBytes: 10 * 1024 * 1024,
    maxText: '10 MB',
    allowedText: 'PDF, DOC and DOCX',
  },
};

/**
 * Formats byte count to human-readable string.
 */
export function formatUploadBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Resolves effective specs for a contextual upload config.
 */
export function resolveUploadSpec(config: ContextualUploadConfig): UploadCategorySpec {
  if (config.category === 'media-library-dynamic') {
    if (config.dynamicSubcategory === 'document-template') {
      return CATEGORY_SPECS.document;
    }
    if (config.dynamicSubcategory === 'logo') {
      return CATEGORY_SPECS['brand-logo'];
    }
    return CATEGORY_SPECS.image;
  }
  return CATEGORY_SPECS[config.category] || CATEGORY_SPECS.image;
}

/**
 * Extracts normalized lowercase extension from filename.
 */
export function getFileExtension(filename: string): string {
  const clean = filename.split('?')[0].split('#')[0].trim();
  const idx = clean.lastIndexOf('.');
  if (idx < 0 || idx === clean.length - 1) return '';
  return clean.slice(idx + 1).toLowerCase();
}

/**
 * Checks for suspicious filenames, path traversal, null bytes, and double extensions.
 */
export function inspectFilenameSecurity(filename: string): {
  safe: boolean;
  reason?: string;
} {
  if (!filename || typeof filename !== 'string' || !filename.trim()) {
    return { safe: false, reason: 'Filename is missing or empty.' };
  }

  // Null bytes or ASCII control characters
  if (/[\x00-\x1f\x7f]/.test(filename)) {
    return {
      safe: false,
      reason: 'Filename contains invalid control characters. Upload rejected for security reasons.',
    };
  }

  // Path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return {
      safe: false,
      reason: 'Filename contains disallowed path characters. Upload rejected for security reasons.',
    };
  }

  const parts = filename.toLowerCase().split('.').filter(Boolean);
  if (parts.length > 2) {
    for (let i = 0; i < parts.length - 1; i++) {
      if (EXECUTABLE_EXTENSIONS.has(parts[i])) {
        return {
          safe: false,
          reason: `Suspicious double file extension (.${parts[i]}) detected in "${filename}". Upload rejected for security reasons.`,
        };
      }
    }
  }

  return { safe: true };
}

/**
 * Sanitizes a filename for safe storage key construction.
 */
export function sanitizeStorageFileName(rawName: string): string {
  const trimmed = String(rawName || '').trim();
  const base = trimmed.split(/[/\\]/).pop() || 'upload';
  const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  const stripped = clean.replace(/^\.+/, '');
  return stripped || 'upload_file';
}

/**
 * Generates a unique storage key using sanitized filename, timestamp, and random entropy.
 */
export function buildSafeStorageObjectPath(rawName: string, folderPath = ''): string {
  const cleanBaseName = sanitizeStorageFileName(rawName);
  const timestamp = Date.now();
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
      ? Array.from(crypto.getRandomValues(new Uint8Array(4)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      : Math.random().toString(36).slice(2, 10);

  const uniqueName = `${timestamp}_${rand}_${cleanBaseName}`;
  const cleanFolder = folderPath.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/+$/g, '');
  return cleanFolder ? `${cleanFolder}/${uniqueName}` : uniqueName;
}

/**
 * Inspects binary magic bytes from an ArrayBuffer slice.
 */
export function detectMagicBytes(bytes: Uint8Array): {
  type: 'jpeg' | 'png' | 'webp' | 'pdf' | 'doc' | 'docx' | 'ico' | 'exe' | 'elf' | 'html' | 'unknown';
} {
  if (bytes.length < 2) return { type: 'unknown' };

  // Windows / DOS PE executable: 'MZ' (0x4D 0x5A)
  if (bytes[0] === 0x4D && bytes[1] === 0x5A) {
    return { type: 'exe' };
  }

  // Linux ELF executable: 0x7F 'E' 'L' 'F'
  if (bytes.length >= 4 && bytes[0] === 0x7F && bytes[1] === 0x45 && bytes[2] === 0x4C && bytes[3] === 0x46) {
    return { type: 'elf' };
  }

  // Android APK / ZIP signature: PK\x03\x04
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04) {
    return { type: 'docx' };
  }

  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return { type: 'jpeg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4E &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0D &&
    bytes[5] === 0x0A &&
    bytes[6] === 0x1A &&
    bytes[7] === 0x0A
  ) {
    return { type: 'png' };
  }

  // PDF: %PDF- (25 50 44 46 2D)
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2D
  ) {
    return { type: 'pdf' };
  }

  // WebP: RIFF .... WEBP
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { type: 'webp' };
  }

  // ICO: 00 00 01 00
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0x01 &&
    bytes[3] === 0x00
  ) {
    return { type: 'ico' };
  }

  // DOC (MS Compound File Binary): D0 CF 11 E0 A1 B1 1A E1
  if (
    bytes.length >= 8 &&
    bytes[0] === 0xD0 &&
    bytes[1] === 0xCF &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xE0 &&
    bytes[4] === 0xA1 &&
    bytes[5] === 0xB1 &&
    bytes[6] === 0x1A &&
    bytes[7] === 0xE1
  ) {
    return { type: 'doc' };
  }

  // Quick check for ASCII HTML/script payloads disguised as images/docs
  const asciiHead = String.fromCharCode(...bytes.slice(0, Math.min(bytes.length, 64))).trim().toLowerCase();
  if (asciiHead.startsWith('<!doctype html') || asciiHead.startsWith('<html') || asciiHead.startsWith('<script') || asciiHead.startsWith('<?php')) {
    return { type: 'html' };
  }

  return { type: 'unknown' };
}

/**
 * Verifies raster image decodability in the browser to reject corrupted image payloads.
 * Gracefully skips when running inside a headless Node.js unit test environment without DOM Image.
 */
async function verifyBrowserImageIntegrity(file: File): Promise<{ valid: boolean; reason?: string }> {
  if (
    typeof window === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function'
  ) {
    return { valid: true };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(objectUrl);
    };

    const timer = window.setTimeout(() => {
      cleanup();
      resolve({
        valid: false,
        reason: 'The selected image file timed out while decoding and may be corrupted.',
      });
    }, 4000);

    img.onload = () => {
      window.clearTimeout(timer);
      const validDimensions = img.naturalWidth > 0 && img.naturalHeight > 0;
      cleanup();
      if (!validDimensions) {
        resolve({
          valid: false,
          reason: 'The selected image has invalid dimensions (0x0) or appears corrupted.',
        });
      } else {
        resolve({ valid: true });
      }
    };

    img.onerror = () => {
      window.clearTimeout(timer);
      cleanup();
      resolve({
        valid: false,
        reason: 'The selected image file is corrupted or malformed and cannot be rendered.',
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Builds contextual rejection message for unsupported extension.
 */
function buildUnsupportedExtensionMessage(
  ext: string,
  config: ContextualUploadConfig,
  allowedFormatsText: string
): string {
  const upper = ext ? `.${ext.toUpperCase()}` : 'unknown';

  if (ext === 'svg') {
    return `Direct SVG uploads are blocked by storage security policy. Allowed upload formats: ${allowedFormatsText} (or paste a verified static SVG path via 'Paste Link').`;
  }

  if (ext === 'pdf' && config.category !== 'document' && config.dynamicSubcategory !== 'document-template') {
    return `PDF files are not supported in this image upload field. Allowed formats: ${allowedFormatsText}.`;
  }

  if (
    ['jpg', 'jpeg', 'png', 'webp'].includes(ext) &&
    (config.category === 'document' || config.dynamicSubcategory === 'document-template')
  ) {
    return `${ext.toUpperCase()} image files are not supported in this document upload field. Allowed formats: ${allowedFormatsText}.`;
  }

  if (config.category === 'media-library-dynamic' && config.dynamicSubcategory !== 'document-template' && ['doc', 'docx', 'pdf'].includes(ext)) {
    return `${upper} document files are not supported for "${config.dynamicSubcategory || 'image'}" uploads. Switch Category to "Document Template" or select: ${allowedFormatsText}.`;
  }

  return `This file format (${upper}) is not supported in this upload section. Allowed formats: ${allowedFormatsText}.`;
}

/**
 * Primary intelligent single-file validator.
 * Inspects size, filename security, extension, MIME type, magic bytes, and raster corruption.
 */
export async function validateFileDeep(
  file: File,
  config: ContextualUploadConfig
): Promise<FileValidationResult> {
  const spec = resolveUploadSpec(config);
  const maxBytes = config.customMaxSizeBytes || spec.maxBytes;
  const maxSizeText = config.customMaxText || spec.maxText;
  const allowedFormatsText = spec.allowedText;

  const reject = (reason: string): FileValidationResult => ({
    valid: false,
    rejectionTitle: 'File Upload Rejected',
    rejectionReason: reason,
    allowedFormatsText,
    maxSizeBytes: maxBytes,
    maxSizeText,
    error: reason,
  });

  // 1. Empty / missing check
  if (!file || typeof file.size !== 'number' || file.size <= 0) {
    return reject('Selected file is empty (0 bytes) or unreadable.');
  }

  // 2. Maximum byte size check
  if (file.size > maxBytes) {
    return reject(
      `File exceeds the maximum allowed size (${maxSizeText}). Please select a smaller file.`
    );
  }

  // 3. Filename safety (path traversal, null bytes, double extensions)
  const nameAudit = inspectFilenameSecurity(file.name);
  if (!nameAudit.safe) {
    return reject(nameAudit.reason || 'Suspicious filename rejected for security reasons.');
  }

  // 4. Strictly prohibited executable / active-script extensions
  const ext = getFileExtension(file.name);
  if (!ext) {
    return reject(
      `File has no recognized extension. Allowed formats: ${allowedFormatsText}.`
    );
  }
  if (STRICTLY_MALICIOUS_EXTENSIONS.has(ext)) {
    return reject(
      `Executable and active script files (.${ext.toUpperCase()}) are strictly prohibited for security reasons.`
    );
  }

  // 5. Contextual extension allowlist
  if (!spec.extensions.includes(ext)) {
    return reject(buildUnsupportedExtensionMessage(ext, config, allowedFormatsText));
  }

  // 6. Browser-declared MIME consistency check (catches spoofed MIME types immediately)
  const declaredMime = String(file.type || '').trim().toLowerCase();
  const expectedMimesForExt = EXTENSION_MIME_MAP[ext] || [];
  if (declaredMime) {
    if (!expectedMimesForExt.includes(declaredMime)) {
      if (declaredMime === 'application/pdf') {
        return reject(
          `PDF files are not supported in this upload field. Allowed formats: ${allowedFormatsText}.`
        );
      }
      return reject(
        `The declared MIME type (${declaredMime}) does not match the .${ext.toUpperCase()} file extension. Upload rejected for security reasons.`
      );
    }
  }

  // 7. Magic-byte / binary signature verification
  try {
    const headerSlice = file.slice(0, Math.min(file.size, 512));
    const buffer = await headerSlice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const magic = detectMagicBytes(bytes);

    if (magic.type === 'exe' || magic.type === 'elf') {
      return reject(
        'The selected file contains an executable binary header. Upload rejected for security reasons.'
      );
    }

    if (magic.type === 'html') {
      return reject(
        'The selected file contains active HTML or script markup instead of a valid asset. Upload rejected for security reasons.'
      );
    }

    if ((ext === 'jpg' || ext === 'jpeg') && magic.type !== 'jpeg') {
      if (magic.type === 'pdf') {
        return reject(
          `PDF files are not supported in this image upload field. Allowed formats: ${allowedFormatsText}.`
        );
      }
      return reject(
        'The selected file content does not match its declared JPEG image type. Upload rejected for security reasons.'
      );
    }

    if (ext === 'png' && magic.type !== 'png') {
      return reject(
        'The selected file content does not match its declared PNG image type. Upload rejected for security reasons.'
      );
    }

    if (ext === 'webp' && magic.type !== 'webp') {
      return reject(
        'The selected file content does not match its declared WebP image type. Upload rejected for security reasons.'
      );
    }

    if (ext === 'pdf') {
      if (magic.type !== 'pdf') {
        return reject(
          'The selected file content does not match a valid PDF signature (%PDF-). Upload rejected for security reasons.'
        );
      }
      if (file.size < 16) {
        return reject('The selected PDF file appears truncated or corrupted.');
      }
    }

    if (ext === 'doc' && magic.type !== 'doc') {
      return reject(
        'The selected file content does not match a valid Word (.doc) binary signature. Upload rejected for security reasons.'
      );
    }

    if (ext === 'docx' && magic.type !== 'docx') {
      return reject(
        'The selected file content does not match a valid Word (.docx) archive signature. Upload rejected for security reasons.'
      );
    }

    // 8. Browser raster decode verification (rejects corrupted image files with valid headers)
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      const decodeResult = await verifyBrowserImageIntegrity(file);
      if (!decodeResult.valid) {
        return reject(
          decodeResult.reason || 'The selected image file is corrupted and cannot be opened.'
        );
      }
    }

    return {
      valid: true,
      allowedFormatsText,
      maxSizeBytes: maxBytes,
      maxSizeText,
      detectedType: magic.type,
      resolvedMimeType: CANONICAL_MIME_BY_EXT[ext] || declaredMime,
    };
  } catch {
    return reject('The selected file could not be read or appears corrupted.');
  }
}

/**
 * Generates a lightweight fingerprint to identify duplicate file selections.
 */
export function getFileFingerprint(file: Pick<File, 'name' | 'size' | 'lastModified'>): string {
  return `${file.name.toLowerCase()}::${file.size}::${file.lastModified || 0}`;
}

/**
 * Validates a batch of multiple files:
 * - Enforces maxFiles count.
 * - Accepts valid files while rejecting invalid ones individually with exact reasons.
 * - Detects duplicate files within the batch or against existing uploaded keys.
 */
export async function validateFilesBatch(
  files: File[],
  config: ContextualUploadConfig,
  options?: {
    maxFiles?: number;
    existingFingerprints?: Set<string>;
  }
): Promise<BatchValidationResult> {
  const spec = resolveUploadSpec(config);
  const maxBytes = config.customMaxSizeBytes || spec.maxBytes;
  const maxSizeText = config.customMaxText || spec.maxText;
  const maxFiles = options?.maxFiles ?? config.maxFiles ?? 1;
  const seen = new Set<string>(options?.existingFingerprints || []);

  const validFiles: File[] = [];
  const rejectedFiles: BatchFileRejection[] = [];
  let countExceededError: string | undefined;

  if (files.length > maxFiles) {
    countExceededError =
      maxFiles === 1
        ? `You selected ${files.length} files, but this upload field only accepts 1 file at a time.`
        : `You selected ${files.length} files, exceeding the maximum limit of ${maxFiles} files.`;
  }

  for (const file of files) {
    const fp = getFileFingerprint(file);
    if (seen.has(fp)) {
      rejectedFiles.push({
        fileName: file.name,
        fileSizeText: formatUploadBytes(file.size),
        reason: 'Duplicate file detected. This exact file was already selected or uploaded.',
      });
      continue;
    }

    const result = await validateFileDeep(file, config);
    if (!result.valid) {
      rejectedFiles.push({
        fileName: file.name,
        fileSizeText: formatUploadBytes(file.size),
        reason: result.rejectionReason || result.error || 'Invalid file.',
      });
      continue;
    }

    if (validFiles.length >= maxFiles) {
      rejectedFiles.push({
        fileName: file.name,
        fileSizeText: formatUploadBytes(file.size),
        reason: `Skipped because maximum file limit (${maxFiles}) was reached.`,
      });
      continue;
    }

    seen.add(fp);
    validFiles.push(file);
  }

  return {
    validFiles,
    rejectedFiles,
    countExceededError,
    allowedFormatsText: spec.allowedText,
    maxSizeText: config.customMaxText || spec.maxText,
  };
}

/**
 * Validates that a pasted or rendered asset URL is safe for preview (blocks XSS schemes & inline HTML/SVG).
 */
export function isSafeAssetUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }

  if (/^(javascript|vbscript|data):/i.test(trimmed)) {
    // Allow strictly safe raster data URIs if ever used, never SVG or HTML
    return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
