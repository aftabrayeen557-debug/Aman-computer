import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
 * Uploads a validated file directly to Supabase Storage.
 * Requires valid Supabase configuration and authenticated admin session.
 */
export const uploadFileToStorage = async (
  bucket: StorageBucketName,
  file: File,
  folderPath: string = '',
  expectedCategory: 'image' | 'document' | 'any' = 'any'
): Promise<UploadResult> => {
  const validation = validateUploadFile(file, expectedCategory);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error:
        'Media storage is currently unavailable. Please enter an image URL instead.',
    };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const filePath = folderPath
    ? `${folderPath}/${timestamp}_${cleanFileName}`
    : `${timestamp}_${cleanFileName}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Media storage upload rejected:', error);
      return {
        success: false,
        error: "We couldn't upload your file right now. Please try again or use a different image.",
      };
    }

    if (bucket === 'customer-documents') {
      const { data: signedData, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24 * 7);

      if (signErr || !signedData) {
        return {
          success: true,
          path: data.path,
          url: data.path,
          fileSize: formatFileSize(file.size),
        };
      }

      return {
        success: true,
        path: data.path,
        url: signedData.signedUrl,
        fileSize: formatFileSize(file.size),
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      url: publicUrlData.publicUrl,
      fileSize: formatFileSize(file.size),
    };
  } catch (err: any) {
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
  } catch (err: any) {
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
