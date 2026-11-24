import {
  supabase,
  supabaseUrl,
  supabaseAnonKey,
  isSupabaseConfigured,
  getRefreshedSupabaseAccessToken,
} from '../../lib/supabase';
import {
  buildSafeStorageObjectPath,
  ContextualUploadConfig,
  formatUploadBytes,
  validateFileDeep,
} from './fileSecurityService';

export type StorageBucketName =
  | 'gallery-images'
  | 'update-posters'
  | 'media-library'
  | 'customer-documents';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  fileSize?: string;
  aborted?: boolean;
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
  deepConfig?: ContextualUploadConfig;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validates a file against strict MIME type and byte size constraints.
 * Rejects executable, HTML, SVG, or oversized files.
 */
export const validateUploadFile = (
  file: Pick<File, 'type' | 'size' | 'name'>,
  expectedCategory: 'image' | 'document' | 'any' = 'any'
): { valid: boolean; error?: string } => {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isDoc = ALLOWED_DOCUMENT_TYPES.includes(file.type);

  if (expectedCategory === 'image' && !isImage) {
    return {
      valid: false,
      error: 'Invalid image format. Allowed formats: JPG, PNG, WEBP.',
    };
  }

  if (expectedCategory === 'document' && !isDoc) {
    return {
      valid: false,
      error: 'Invalid document format. Allowed formats: PDF, DOC, DOCX.',
    };
  }

  if (expectedCategory === 'any' && !isImage && !isDoc) {
    return {
      valid: false,
      error: 'Unsupported file type. Allowed: JPG, PNG, WEBP, PDF, DOC, DOCX.',
    };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'Selected file is empty.' };
  }

  const maxSize = isDoc ? MAX_DOC_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxMb = isDoc ? '10 MB' : '5 MB';
    return {
      valid: false,
      error: `File size exceeds maximum limit (${maxMb}).`,
    };
  }

  return { valid: true };
};

/**
 * Format bytes to human-readable string (e.g. 2.4 MB)
 */
export const formatFileSize = (bytes: number): string => {
  return formatUploadBytes(bytes);
};

const KNOWN_BUCKETS: StorageBucketName[] = [
  'gallery-images',
  'update-posters',
  'media-library',
  'customer-documents',
];

/**
 * Extracts bucket name and object path from a Supabase Storage public or signed URL.
 * Returns null if the URL is external or not a managed media storage object.
 */
export const extractStorageLocationFromUrl = (
  url?: string | null
): { bucket: StorageBucketName; path: string } | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const markerMatch =
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/?#]+)\/([^?#]+)/.exec(
      trimmed
    );
  if (!markerMatch) return null;

  const bucketCandidate = decodeURIComponent(markerMatch[1]) as StorageBucketName;
  if (!KNOWN_BUCKETS.includes(bucketCandidate)) return null;

  const objectPath = decodeURIComponent(markerMatch[2]);
  if (!objectPath) return null;

  return { bucket: bucketCandidate, path: objectPath };
};

/**
 * Performs a real XHR multipart/raw upload to Supabase Storage with genuine upload progress
 * and AbortSignal cancellation support.
 */
const uploadViaXhrWithProgress = (params: {
  bucket: StorageBucketName;
  filePath: string;
  file: File;
  contentType: string;
  accessToken: string;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<{ ok: boolean; path?: string; status?: number; aborted?: boolean; error?: string }> => {
  const { bucket, filePath, file, contentType, accessToken, onProgress, signal } = params;
  const encodedPath = filePath
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
  const endpoint = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/${encodeURIComponent(
    bucket
  )}/${encodedPath}`;

  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve({ ok: false, aborted: true, error: 'Upload cancelled by user.' });
      return;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('cache-control', '3600');
    xhr.setRequestHeader('Content-Type', contentType);

    const onAbortSignal = () => {
      try {
        xhr.abort();
      } catch {
        // Ignore abort cleanup
      }
    };

    if (signal) {
      signal.addEventListener('abort', onAbortSignal, { once: true });
    }

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && evt.total > 0) {
        const pct = Math.min(100, Math.round((evt.loaded / evt.total) * 100));
        onProgress?.(pct);
      }
    };

    xhr.onload = () => {
      if (signal) signal.removeEventListener('abort', onAbortSignal);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve({ ok: true, path: filePath, status: xhr.status });
      } else {
        let serverMsg = "We couldn't upload your file right now. Please try again.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.message && /mime|size|policy|unauthorized/i.test(parsed.message)) {
            serverMsg = parsed.message;
          }
        } catch {
          // Keep friendly default message
        }
        resolve({ ok: false, status: xhr.status, error: serverMsg });
      }
    };

    xhr.onerror = () => {
      if (signal) signal.removeEventListener('abort', onAbortSignal);
      resolve({
        ok: false,
        error: 'Unable to upload file due to a connection issue. Please check your internet and retry.',
      });
    };

    xhr.onabort = () => {
      if (signal) signal.removeEventListener('abort', onAbortSignal);
      resolve({ ok: false, aborted: true, error: 'Upload cancelled.' });
    };

    xhr.send(file);
  });
};

/**
 * Uploads a validated file directly to Supabase Storage.
 * Requires valid Supabase configuration and authenticated admin session.
 */
export const uploadFileToStorage = async (
  bucket: StorageBucketName,
  file: File,
  folderPath: string = '',
  expectedCategory: 'image' | 'document' | 'any' = 'any',
  options?: UploadOptions
): Promise<UploadResult> => {
  // 1. Deep security validation (magic bytes, double-extensions, MIME, size)
  const inferredDeepConfig: ContextualUploadConfig =
    options?.deepConfig || {
      category: expectedCategory === 'document' ? 'document' : 'image',
    };

  let resolvedContentType = file.type;

  if (typeof (file as File).slice === 'function' && typeof (file as File).arrayBuffer === 'function') {
    if (expectedCategory === 'any' && !options?.deepConfig) {
      const isDocExt = /\.(pdf|doc|docx)$/i.test(file.name);
      inferredDeepConfig.category = isDocExt ? 'document' : 'image';
    }
    const deepCheck = await validateFileDeep(file, inferredDeepConfig);
    if (!deepCheck.valid) {
      return {
        success: false,
        error: deepCheck.rejectionReason || deepCheck.error || 'File failed security validation.',
      };
    }
    if (deepCheck.resolvedMimeType) {
      resolvedContentType = deepCheck.resolvedMimeType;
    }
  } else {
    const basicCheck = validateUploadFile(file, expectedCategory);
    if (!basicCheck.valid) {
      return { success: false, error: basicCheck.error };
    }
  }

  // 2. Verify Supabase availability & authenticated admin token
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error:
        'Media storage is currently unavailable. Please verify connection or paste a direct image URL.',
    };
  }

  const accessToken = await getRefreshedSupabaseAccessToken();
  if (!accessToken) {
    return {
      success: false,
      error: 'Admin authentication is required before uploading files to secure storage.',
    };
  }

  if (options?.signal?.aborted) {
    return { success: false, aborted: true, error: 'Upload cancelled.' };
  }

  // 3. Generate safe, randomized, traversal-proof storage object key
  const filePath = buildSafeStorageObjectPath(file.name, folderPath);
  const uploadMime = resolvedContentType || file.type || 'application/octet-stream';

  try {
    let uploadedPath: string | null = null;

    if (
      (options?.onProgress || options?.signal) &&
      typeof XMLHttpRequest !== 'undefined' &&
      supabaseUrl &&
      supabaseAnonKey
    ) {
      const xhrRes = await uploadViaXhrWithProgress({
        bucket,
        filePath,
        file,
        contentType: uploadMime,
        accessToken,
        onProgress: options.onProgress,
        signal: options.signal,
      });
      if (!xhrRes.ok) {
        return {
          success: false,
          aborted: xhrRes.aborted,
          error: xhrRes.error,
        };
      }
      uploadedPath = xhrRes.path || filePath;
    } else {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: uploadMime,
        });

      if (error || !data) {
        console.error('Media storage upload rejected:', error);
        return {
          success: false,
          error: "We couldn't upload your file right now. Please try again or use a different file.",
        };
      }
      uploadedPath = data.path;
    }

    if (bucket === 'customer-documents') {
      const { data: signedData, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(uploadedPath, 60 * 60 * 24 * 7);

      if (signErr || !signedData) {
        return {
          success: true,
          path: uploadedPath,
          url: uploadedPath,
          fileSize: formatFileSize(file.size),
        };
      }

      return {
        success: true,
        path: uploadedPath,
        url: signedData.signedUrl,
        fileSize: formatFileSize(file.size),
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadedPath);

    return {
      success: true,
      path: uploadedPath,
      url: publicUrlData.publicUrl,
      fileSize: formatFileSize(file.size),
    };
  } catch (err) {
    console.error('Media upload failure:', err);
    return {
      success: false,
      error: 'Unable to upload file due to a connection issue. Please try again.',
    };
  }
};

/**
 * Deletes an object from Supabase Storage
 */
export const deleteFileFromStorage = async (
  bucket: StorageBucketName,
  path: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Media storage is currently unavailable.' };
  }
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error('Media deletion error:', error);
      return { success: false, error: 'Unable to remove this file right now.' };
    }
    return { success: true };
  } catch (err) {
    console.error('Media deletion exception:', err);
    return { success: false, error: 'Unable to remove this file right now.' };
  }
};

/**
 * Safely deletes a file referenced by its public/signed URL if hosted in our managed storage.
 * Ignores external URLs or unconfigured environments cleanly.
 */
export const deleteStorageFileByUrl = async (
  url?: string | null
): Promise<{ deleted: boolean; error?: string }> => {
  const loc = extractStorageLocationFromUrl(url);
  if (!loc) return { deleted: false };
  const res = await deleteFileFromStorage(loc.bucket, loc.path);
  return { deleted: res.success, error: res.error };
};
