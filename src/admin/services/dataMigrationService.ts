import { isSupabaseConfigured } from '../../lib/supabase';
import {
  dbUpsertCustomer,
  dbUpsertEnquiry,
  dbUpsertService,
  dbUpsertLatestUpdate,
  dbUpsertDocRequirement,
  dbUpsertGalleryItem,
  dbUpsertJourneyMilestone,
  dbSaveBusinessProfile,
  dbSaveWebsiteContent,
  dbUpsertFaq,
  dbUpsertTestimonial,
  dbUpsertReceipt,
  dbUpsertMediaAsset,
  dbUpsertStaffMember,
  dbUpsertNotification,
  dbSaveTerminalSettings,
} from './supabaseService';

export interface MigrationSummary {
  customers: number;
  enquiries: number;
  services: number;
  latestUpdates: number;
  docRequirements: number;
  gallery: number;
  journey: number;
  faqs: number;
  testimonials: number;
  receipts: number;
  media: number;
  staff: number;
  notifications: number;
  businessProfile: boolean;
  websiteContent: boolean;
  terminalSettings: boolean;
  errors: string[];
}

export const AMAN_LOCAL_STORAGE_KEYS = [
  'aman_customers',
  'aman_enquiries',
  'aman_services',
  'aman_latest_updates',
  'aman_doc_requirements',
  'aman_gallery',
  'aman_journey',
  'aman_website_content',
  'aman_faqs',
  'aman_testimonials',
  'aman_business_profile',
  'aman_receipts',
  'aman_media',
  'aman_notifications',
  'aman_staff',
  'aman_activity_logs',
  'aman_terminal_settings',
] as const;

/**
 * Creates a downloadable JSON snapshot of all existing localStorage keys before migration or reset.
 */
export const exportLocalVaultBackup = (): string => {
  const backupData: Record<string, unknown> = {
    _exportDate: new Date().toISOString(),
    _version: '3.0.0',
    _source: 'Aman Computer Terminal Vault Pre-Migration Snapshot',
  };

  AMAN_LOCAL_STORAGE_KEYS.forEach((k) => {
    try {
      const val = localStorage.getItem(k);
      if (val) {
        backupData[k] = JSON.parse(val);
      }
    } catch (e) {
      console.warn(`Could not serialize key ${k}`, e);
    }
  });

  return JSON.stringify(backupData, null, 2);
};

/**
 * Safely migrates existing localStorage records into Supabase PostgreSQL via upsert (deduplicated by ID).
 * Preserves published/unpublished states, categories, displayOrder, and all business content.
 * Never deletes localStorage records after migration.
 */
export const migrateLocalDataToSupabase = async (): Promise<MigrationSummary> => {
  const summary: MigrationSummary = {
    customers: 0,
    enquiries: 0,
    services: 0,
    latestUpdates: 0,
    docRequirements: 0,
    gallery: 0,
    journey: 0,
    faqs: 0,
    testimonials: 0,
    receipts: 0,
    media: 0,
    staff: 0,
    notifications: 0,
    businessProfile: false,
    websiteContent: false,
    terminalSettings: false,
    errors: [],
  };

  if (!isSupabaseConfigured()) {
    summary.errors.push(
      'Supabase is not configured. Supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.'
    );
    return summary;
  }

  const read = <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  };

  const trackError = (label: string, res: { ok: boolean; error?: string }) => {
    if (!res.ok && summary.errors.length < 15) {
      summary.errors.push(`${label}: ${res.error || 'Unknown error'}`);
    }
    return res.ok;
  };

  const services = read<any[]>('aman_services');
  if (Array.isArray(services)) {
    for (const s of services) {
      const res = await dbUpsertService(s);
      if (trackError(`Service ${s.id}`, res)) summary.services++;
    }
  }

  const customers = read<any[]>('aman_customers');
  if (Array.isArray(customers)) {
    for (const c of customers) {
      const res = await dbUpsertCustomer(c);
      if (trackError(`Customer ${c.id}`, res)) summary.customers++;
    }
  }

  const enquiries = read<any[]>('aman_enquiries');
  if (Array.isArray(enquiries)) {
    for (const e of enquiries) {
      const res = await dbUpsertEnquiry(e);
      if (trackError(`Enquiry ${e.id}`, res)) summary.enquiries++;
    }
  }

  const updates = read<any[]>('aman_latest_updates');
  if (Array.isArray(updates)) {
    for (const u of updates) {
      const res = await dbUpsertLatestUpdate(u);
      if (trackError(`Update ${u.id}`, res)) summary.latestUpdates++;
    }
  }

  const docs = read<any[]>('aman_doc_requirements');
  if (Array.isArray(docs)) {
    for (const d of docs) {
      const res = await dbUpsertDocRequirement(d);
      if (trackError(`DocRequirement ${d.id}`, res)) summary.docRequirements++;
    }
  }

  const gallery = read<any[]>('aman_gallery');
  if (Array.isArray(gallery)) {
    for (const g of gallery) {
      const res = await dbUpsertGalleryItem(g);
      if (trackError(`Gallery ${g.id}`, res)) summary.gallery++;
    }
  }

  const journey = read<any[]>('aman_journey');
  if (Array.isArray(journey)) {
    for (const j of journey) {
      const res = await dbUpsertJourneyMilestone(j);
      if (trackError(`Journey ${j.id}`, res)) summary.journey++;
    }
  }

  const faqs = read<any[]>('aman_faqs');
  if (Array.isArray(faqs)) {
    for (const f of faqs) {
      const res = await dbUpsertFaq(f);
      if (trackError(`FAQ ${f.id}`, res)) summary.faqs++;
    }
  }

  const testimonials = read<any[]>('aman_testimonials');
  if (Array.isArray(testimonials)) {
    for (const t of testimonials) {
      const res = await dbUpsertTestimonial(t);
      if (trackError(`Testimonial ${t.id}`, res)) summary.testimonials++;
    }
  }

  const receipts = read<any[]>('aman_receipts');
  if (Array.isArray(receipts)) {
    for (const r of receipts) {
      const res = await dbUpsertReceipt(r);
      if (trackError(`Receipt ${r.id}`, res)) summary.receipts++;
    }
  }

  const media = read<any[]>('aman_media');
  if (Array.isArray(media)) {
    for (const m of media) {
      const res = await dbUpsertMediaAsset(m);
      if (trackError(`Media ${m.id}`, res)) summary.media++;
    }
  }

  const staff = read<any[]>('aman_staff');
  if (Array.isArray(staff)) {
    for (const st of staff) {
      const res = await dbUpsertStaffMember(st);
      if (trackError(`Staff ${st.id}`, res)) summary.staff++;
    }
  }

  const notifications = read<any[]>('aman_notifications');
  if (Array.isArray(notifications)) {
    for (const n of notifications) {
      const res = await dbUpsertNotification(n);
      if (trackError(`Notification ${n.id}`, res)) summary.notifications++;
    }
  }

  const profile = read<any>('aman_business_profile');
  if (profile) {
    const res = await dbSaveBusinessProfile(profile);
    summary.businessProfile = trackError('BusinessProfile', res);
  }

  const content = read<any>('aman_website_content');
  if (content) {
    const res = await dbSaveWebsiteContent(content);
    summary.websiteContent = trackError('WebsiteContent', res);
  }

  const settings = read<any>('aman_terminal_settings');
  if (settings) {
    const res = await dbSaveTerminalSettings(settings);
    summary.terminalSettings = trackError('TerminalSettings', res);
  }

  return summary;
};
