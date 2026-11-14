import { supabase, isSupabaseConfigured } from './supabase';
import {
  mapServiceRow,
  mapUpdateRow,
  mapDocRequirementRow,
  mapGalleryRow,
  mapJourneyRow,
} from '../admin/services/supabaseService';

export interface PublicEnquiryPayload {
  customerName: string;
  phoneNumber: string;
  serviceId: string;
  serviceName: string;
  customerMessage?: string;
  urgency?: 'normal' | 'urgent';
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface CollectionSyncResponse<TRow = any> {
  data: TRow[] | null;
  error: unknown;
}

const ENQUIRY_COOLDOWN_MS = 30_000;
let lastPublicEnquirySubmittedAt = 0;

export const resetPublicEnquiryCooldownForTest = (): void => {
  lastPublicEnquirySubmittedAt = 0;
};

/**
 * Writes sanitized JSON to browser storage only when the serialized value changed.
 * Prevents unnecessary reload events when cached data already matches PostgreSQL.
 */
export const safeCachePublicJson = (
  key: string,
  value: unknown,
  storage: StorageAdapter | null = typeof window !== 'undefined' ? window.localStorage : null
): boolean => {
  if (!storage) return false;
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > 512 * 1024 || serialized.includes('data:image/')) {
      return false;
    }
    const previous = storage.getItem(key);
    if (previous === serialized) {
      return false;
    }
    storage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.warn(`Public cache write skipped for ${key}:`, err);
    return false;
  }
};

/**
 * Applies a backend collection response safely:
 * - Successful response (`!res.error && Array.isArray(res.data)`), including `[]`:
 *   updates storage & fires event if serialized content changed.
 * - Failed/error response (`res.error` truthy or `res.data` not an array):
 *   preserves existing cached storage intact and emits no change event.
 */
export const syncPublicCollectionResult = <TRow, TOut>(
  key: string,
  eventName: string | null,
  res: CollectionSyncResponse<TRow>,
  mapper: (row: TRow) => TOut,
  storage: StorageAdapter | null = typeof window !== 'undefined' ? window.localStorage : null,
  dispatchEvent?: (name: string, detail: TOut[]) => void
): { updated: boolean; preservedOnError: boolean; count?: number } => {
  if (res.error || !Array.isArray(res.data)) {
    return { updated: false, preservedOnError: true };
  }

  const mapped = res.data.map(mapper);
  const changed = safeCachePublicJson(key, mapped, storage);

  if (changed && eventName) {
    if (dispatchEvent) {
      dispatchEvent(eventName, mapped);
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(eventName, { detail: mapped }));
    }
  }

  return { updated: changed, preservedOnError: false, count: mapped.length };
};

/**
 * Fetches only public-safe, published records from Supabase PostgreSQL
 * and synchronizes door/timeline caches without touching private business tables.
 */
export const syncPublicWebsiteFromSupabase = async (): Promise<void> => {
  if (!isSupabaseConfigured() || !supabase || typeof window === 'undefined') return;

  try {
    const [
      srvRes,
      updRes,
      docRes,
      galRes,
      jrnRes,
      profRes,
      webRes,
      faqRes,
      tstRes,
    ] = await Promise.all([
      supabase.from('services').select('*').eq('visible', true).order('display_order', { ascending: true }),
      supabase.from('latest_updates').select('*').eq('published', true).order('published_date', { ascending: false }),
      supabase.from('document_requirements').select('*').eq('published', true).order('display_order', { ascending: true }),
      supabase.from('gallery_items').select('*').eq('visible', true).order('display_order', { ascending: true }),
      supabase.from('journey_milestones').select('*').eq('published', true).order('display_order', { ascending: true }),
      supabase.from('business_profile').select('*').eq('id', 'main_profile').maybeSingle(),
      supabase.from('website_content').select('*').eq('id', 'global_content').maybeSingle(),
      supabase.from('faqs').select('*').eq('visible', true).order('display_order', { ascending: true }),
      supabase.from('testimonials').select('*').eq('approved', true).order('created_at', { ascending: false }),
    ]);

    syncPublicCollectionResult('aman_services', 'aman_services_changed', srvRes, mapServiceRow);
    syncPublicCollectionResult('aman_latest_updates', 'aman_updates_changed', updRes, mapUpdateRow);
    syncPublicCollectionResult('aman_doc_requirements', 'aman_docs_changed', docRes, mapDocRequirementRow);
    syncPublicCollectionResult('aman_gallery', 'aman_gallery_changed', galRes, mapGalleryRow);
    syncPublicCollectionResult('aman_journey', 'aman_journey_changed', jrnRes, mapJourneyRow);

    if (!profRes.error && profRes.data) {
      safeCachePublicJson('aman_business_profile', {
        businessName: profRes.data.business_name,
        tagline: profRes.data.tagline,
        proprietorName: profRes.data.proprietor_name,
        tradeLicenseNo: profRes.data.trade_license_no,
        addressLine: profRes.data.address_line,
        city: profRes.data.city,
        state: profRes.data.state,
        pincode: profRes.data.pincode,
        googleMapsEmbedUrl: profRes.data.google_maps_embed_url || '',
        googleMapsDirectLink: profRes.data.google_maps_direct_link || '',
        primaryPhone: profRes.data.primary_phone,
        whatsappNumber: profRes.data.whatsapp_number,
        secondaryPhone: profRes.data.secondary_phone || undefined,
        email: profRes.data.email,
        telegramChannel: profRes.data.telegram_channel || undefined,
        openingHours: profRes.data.opening_hours,
        workingDays: profRes.data.working_days,
        upiId: profRes.data.upi_id,
        upiQrImage: profRes.data.upi_qr_image || undefined,
      });
    }

    if (!webRes.error && webRes.data?.content) {
      safeCachePublicJson('aman_website_content', webRes.data.content);
    }

    syncPublicCollectionResult('aman_faqs', null, faqRes, (r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
      displayOrder: Number(r.display_order || 0),
      visible: Boolean(r.visible ?? true),
    }));

    syncPublicCollectionResult('aman_testimonials', null, tstRes, (r) => ({
      id: r.id,
      customerName: r.customer_name,
      location: r.location || '',
      serviceName: r.service_name || '',
      rating: Number(r.rating || 5),
      comment: r.comment,
      date: r.date || r.created_at,
      verified: Boolean(r.verified ?? true),
      approved: Boolean(r.approved ?? true),
    }));
  } catch (err) {
    console.warn('Public website Supabase sync skipped:', err);
  }
};

/**
 * Validates and rate-limits public customer enquiry input before submitting to Supabase.
 * PostgreSQL RLS and server trigger enforce identical bounds & spam limits independently.
 */
export const validatePublicEnquiryPayload = (
  payload: PublicEnquiryPayload
): { valid: boolean; error?: string; normalizedPhone?: string } => {
  const name = (payload.customerName || '').trim();
  const phone = (payload.phoneNumber || '').trim();
  const digitsOnly = phone.replace(/\D/g, '');
  const message = (payload.customerMessage || '').trim();
  const serviceName = (payload.serviceName || 'General Service').trim();

  if (name.length < 2 || name.length > 100) {
    return { valid: false, error: 'Please enter a valid customer name (2 to 100 characters).' };
  }
  if (digitsOnly.length < 10 || digitsOnly.length > 15 || phone.length > 20) {
    return { valid: false, error: 'Please enter a valid 10 to 15 digit phone number.' };
  }
  if (serviceName.length < 2 || serviceName.length > 120) {
    return { valid: false, error: 'Please select a valid service name.' };
  }
  if (message.length > 1000) {
    return { valid: false, error: 'Enquiry message must be 1000 characters or fewer.' };
  }
  return { valid: true, normalizedPhone: digitsOnly };
};

/**
 * Validated public customer enquiry insert (status enforced to 'new' and source to 'website')
 */
export const submitPublicEnquiry = async (
  payload: PublicEnquiryPayload
): Promise<{ ok: boolean; error?: string }> => {
  const validation = validatePublicEnquiryPayload(payload);
  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const now = Date.now();
  if (lastPublicEnquirySubmittedAt > 0 && now - lastPublicEnquirySubmittedAt < ENQUIRY_COOLDOWN_MS) {
    return {
      ok: false,
      error: 'Please wait at least 30 seconds before submitting another enquiry.',
    };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { ok: false, error: 'Backend is not configured to accept online enquiries.' };
  }

  const { error } = await supabase.from('customer_enquiries').insert({
    id: 'ENQ-' + Date.now().toString(36).toUpperCase(),
    customer_name: payload.customerName.trim(),
    phone_number: payload.phoneNumber.trim(),
    service_id: (payload.serviceId || 'general').trim().slice(0, 64),
    service_name: (payload.serviceName || 'General Service').trim(),
    customer_message: (payload.customerMessage || '').trim(),
    urgency: payload.urgency === 'urgent' ? 'urgent' : 'normal',
    status: 'new',
    admin_notes: '',
    estimated_cost: null,
    assigned_operator: null,
    source: 'website',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  lastPublicEnquirySubmittedAt = Date.now();
  return { ok: true };
};

if (typeof window !== 'undefined') {
  void syncPublicWebsiteFromSupabase();
}
