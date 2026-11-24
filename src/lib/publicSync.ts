import { supabase, isSupabaseConfigured } from './supabase';
import {
  mapServiceRow,
  mapUpdateRow,
  mapDocRequirementRow,
  mapGalleryRow,
  mapJourneyRow,
  mapGovernmentSchemeRow,
} from '../admin/services/supabaseService';
import {
  BRAND_LOGO_SVG,
  normalizeBrandLogoUrl,
  normalizeFaviconUrl,
  normalizeOgImageUrl,
  sanitizeWebsiteBrandAndSeo,
} from './brandAssets';

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

const emitPublicEvent = (name: string, detail: unknown) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
};

/**
 * Applies live SEO, Favicon, Brand & Maintenance settings to static HTML shells when loaded.
 * Also self-heals stale legacy brand/favicon URLs cached in localStorage.
 */
export const applyPublicWebsiteMetadata = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  try {
    const rawContent = window.localStorage.getItem('aman_website_content');
    if (!rawContent) return;
    const parsed = JSON.parse(rawContent);
    const content = sanitizeWebsiteBrandAndSeo(parsed);
    if (safeCachePublicJson('aman_website_content', content)) {
      emitPublicEvent('aman_website_content_changed', content);
    }

    const seo = content?.seoSettings;
    const brand = content?.brandSettings;
    const path = window.location.pathname || '/';
    const isHomePage = path === '/' || path === '/home/' || path === '/home/index.html';

    if (isHomePage && seo?.pageTitle) {
      document.title = seo.pageTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) ogTitle.setAttribute('content', seo.pageTitle);
      if (twTitle) twTitle.setAttribute('content', seo.pageTitle);
    }

    if (isHomePage && seo?.metaDescription) {
      const desc = document.querySelector('meta[name="description"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (desc) desc.setAttribute('content', seo.metaDescription);
      if (ogDesc) ogDesc.setAttribute('content', seo.metaDescription);
      if (twDesc) twDesc.setAttribute('content', seo.metaDescription);
    }

    if (seo?.keywords) {
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement('meta');
        kw.setAttribute('name', 'keywords');
        document.head.appendChild(kw);
      }
      kw.setAttribute('content', seo.keywords);
    }

    const ogImgVal = normalizeOgImageUrl(seo?.ogImageUrl);
    if (ogImgVal) {
      const resolvedOg = ogImgVal.startsWith('/')
        ? `${window.location.origin}${ogImgVal}`
        : ogImgVal;
      const ogImg = document.querySelector('meta[property="og:image"]');
      const ogImgSec = document.querySelector('meta[property="og:image:secure_url"]');
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (ogImg) ogImg.setAttribute('content', resolvedOg);
      if (ogImgSec) ogImgSec.setAttribute('content', resolvedOg);
      if (twImg) twImg.setAttribute('content', resolvedOg);
    }

    const normalizedBrandLogo = normalizeBrandLogoUrl(brand?.logoUrl);
    if (normalizedBrandLogo) {
      document
        .querySelectorAll<HTMLImageElement>(
          '#hdrBrandLogo, #drawerBrandLogo, .sf__biz-logo, .rn__brand img, .rn__plbl img, .sf__brand img'
        )
        .forEach((img) => {
          if (img.getAttribute('src') !== normalizedBrandLogo) {
            img.setAttribute('src', normalizedBrandLogo);
          }
        });
    }

    const normalizedFavicon = normalizeFaviconUrl(brand?.faviconUrl);
    if (normalizedFavicon) {
      const svgIconLinks = document.querySelectorAll('link[rel="icon"][type="image/svg+xml"]');
      if (normalizedFavicon === BRAND_LOGO_SVG || normalizedFavicon.endsWith('.svg')) {
        svgIconLinks.forEach((link) => link.setAttribute('href', normalizedFavicon));
      } else {
        const icoLinks = document.querySelectorAll('link[rel="icon"][href*="favicon.ico"], link[rel="shortcut icon"]');
        icoLinks.forEach((link) => link.setAttribute('href', normalizedFavicon));
      }
    }

    if (brand?.shopName) {
      const siteName = document.querySelector('meta[property="og:site_name"]');
      if (siteName) siteName.setAttribute('content', brand.shopName);
    }
  } catch (err) {
    console.warn('Skipped dynamic SEO application:', err);
  }
};

/**
 * Safely clears any legacy Service Workers or CacheStorage caches that could serve stale logos.
 */
export const clearStaleBrandCaches = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    if ('serviceWorker' in navigator && typeof navigator.serviceWorker.getRegistrations === 'function') {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
    }
    if ('caches' in window && typeof window.caches.keys === 'function') {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map(async (name) => {
          if (/aman|brand|logo|workbox|precache|vite-pwa/i.test(name)) {
            await window.caches.delete(name).catch(() => false);
            return;
          }
          try {
            const cache = await window.caches.open(name);
            const requests = await cache.keys();
            await Promise.all(
              requests
                .filter((req) =>
                  /aman-logo|aman_computer_logo|22258|favicon|icon-192|icon-512|logo\.svg/i.test(req.url)
                )
                .map((req) => cache.delete(req))
            );
          } catch {
            // Ignore per-cache access errors
          }
        })
      );
    }
  } catch {
    // Cache cleanup is best-effort only
  }
};

/**
 * Fetches only public-safe, published records from Supabase
 * and synchronizes door/timeline/schemes caches without touching private business tables.
 */
export const syncPublicWebsiteFromSupabase = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    applyPublicWebsiteMetadata();
  }
  if (!isSupabaseConfigured() || !supabase || typeof window === 'undefined') return;

  try {
    const [
      srvRes,
      updRes,
      docRes,
      galRes,
      jrnRes,
      schRes,
      profRes,
      webRes,
      faqRes,
    ] = await Promise.all([
      supabase.from('services').select('*').eq('visible', true).order('display_order', { ascending: true }),
      supabase.from('latest_updates').select('*').eq('published', true).order('published_date', { ascending: false }),
      supabase.from('document_requirements').select('*').eq('published', true).order('display_order', { ascending: true }),
      supabase.from('gallery_items').select('*').eq('visible', true).order('display_order', { ascending: true }),
      supabase.from('journey_milestones').select('*').eq('published', true).order('display_order', { ascending: true }),
      supabase.from('government_schemes').select('*').eq('published', true).order('display_order', { ascending: true }),
      supabase.from('business_profile').select('*').eq('id', 'main_profile').maybeSingle(),
      supabase.from('website_content').select('*').eq('id', 'global_content').maybeSingle(),
      supabase.from('faqs').select('*').eq('visible', true).order('display_order', { ascending: true }),
    ]);

    syncPublicCollectionResult('aman_services', 'aman_services_changed', srvRes, mapServiceRow);
    syncPublicCollectionResult('aman_latest_updates', 'aman_updates_changed', updRes, mapUpdateRow);
    syncPublicCollectionResult('aman_doc_requirements', 'aman_docs_changed', docRes, mapDocRequirementRow);
    syncPublicCollectionResult('aman_gallery', 'aman_gallery_changed', galRes, mapGalleryRow);
    syncPublicCollectionResult('aman_journey', 'aman_journey_changed', jrnRes, mapJourneyRow);

    if (!schRes.error && Array.isArray(schRes.data)) {
      syncPublicCollectionResult('aman_government_schemes', 'aman_schemes_changed', schRes, mapGovernmentSchemeRow);
    } else if (!webRes.error && Array.isArray(webRes.data?.content?.governmentSchemesFallback)) {
      const publishedFallback = webRes.data.content.governmentSchemesFallback.filter(
        (s: any) => s && s.published !== false
      );
      if (safeCachePublicJson('aman_government_schemes', publishedFallback)) {
        emitPublicEvent('aman_schemes_changed', publishedFallback);
      }
    }

    if (!profRes.error && profRes.data) {
      const profileObj = {
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
      };
      if (safeCachePublicJson('aman_business_profile', profileObj)) {
        emitPublicEvent('aman_business_profile_changed', profileObj);
      }
    }

    if (!webRes.error && webRes.data?.content) {
      const sanitizedWebContent = sanitizeWebsiteBrandAndSeo(webRes.data.content);
      if (safeCachePublicJson('aman_website_content', sanitizedWebContent)) {
        emitPublicEvent('aman_website_content_changed', sanitizedWebContent);
        applyPublicWebsiteMetadata();
      }
    }

    if (!faqRes.error && Array.isArray(faqRes.data)) {
      syncPublicCollectionResult('aman_faqs', 'aman_faqs_changed', faqRes, (r) => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        category: r.category,
        displayOrder: Number(r.display_order || 0),
        visible: Boolean(r.visible ?? true),
      }));
    }
  } catch (err) {
    console.warn('Public website Supabase sync skipped:', err);
  }
};

/**
 * Validates and rate-limits public customer enquiry input before submitting to Supabase.
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
 * Validated public customer enquiry insert
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
  void clearStaleBrandCaches();
  void syncPublicWebsiteFromSupabase();
}
