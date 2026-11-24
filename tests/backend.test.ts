import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

import { isFirebaseConfigured } from '../src/lib/firebase.ts';
import { isSupabaseConfigured, testSupabaseConnection, getRefreshedSupabaseAccessToken } from '../src/lib/supabase.ts';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';
import {
  AUTHORIZED_ADMIN_UID,
  AUTHORIZED_ADMIN_EMAIL,
  clearPrivateAdminStorage,
  evaluateSingleAdminAuthorization,
  evaluateTokenClaimDiagnostics,
  mapFirebaseAuthError,
  PRIVATE_ADMIN_STORAGE_KEYS,
  PUBLIC_WEBSITE_STORAGE_KEYS,
  signInAdmin,
  verifyAdminAuthorizationDetailed,
} from '../src/admin/services/authService.ts';
import {
  mergeAuthenticatedRoleClaims,
  removeAuthenticatedRoleClaims,
  buildSafeClaimVerificationReport,
  validateProvisioningTarget,
  parseCliArgs,
} from '../scripts/set-firebase-role-claim.mjs';
import {
  validateUploadFile,
  formatFileSize,
  extractStorageLocationFromUrl,
  MAX_IMAGE_SIZE,
  MAX_DOC_SIZE,
} from '../src/admin/services/storageService.ts';
import {
  validateFileDeep,
  validateFilesBatch,
  inspectFilenameSecurity,
  detectMagicBytes,
  buildSafeStorageObjectPath,
  isSafeAssetUrl,
} from '../src/admin/services/fileSecurityService.ts';
import {
  toIsoTimestamp,
  mapCustomerRow,
  mapServiceRow,
  mapUpdateRow,
  mapDocRequirementRow,
  mapGalleryRow,
  mapJourneyRow,
  mapGovernmentSchemeRow,
  validateWebsiteContentBeforeSave,
  dbSaveWebsiteContent,
} from '../src/admin/services/supabaseService.ts';
import {
  HERO_CONTENT_LIMITS,
  HERO_MOBILE_LINE_LIMITS,
  HERO_DEFAULT_COPY,
  normalizeHeroText,
  validateHeroContent,
  isLegacyOversizedHero,
} from '../src/admin/services/heroValidationService.ts';
import {
  STUDIO_NAV_GROUPS,
  ALL_STUDIO_NAV_ITEMS,
  resolveStudioTab,
} from '../src/admin/config/navigation.ts';
import type { AdminTab } from '../src/admin/types/index.ts';
import { INITIAL_WEBSITE_CONTENT } from '../src/admin/data/initialData.ts';
import {
  syncPublicCollectionResult,
  validatePublicEnquiryPayload,
  submitPublicEnquiry,
  resetPublicEnquiryCooldownForTest,
} from '../src/lib/publicSync.ts';
import {
  DEFAULT_OWNER_PROFILE,
  validateHttpUrl,
  normalizeOwnerProfile,
  validateOwnerProfileDraft,
  calculateOwnerProfileCompletion,
  getOwnerProfileInitials,
  getOwnerProfileChanges,
} from '../src/admin/services/ownerProfileService.ts';

const ROOT_DIR = process.cwd();

function createMockStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
    dump: () => Object.fromEntries(map.entries()),
  };
}

test('Configuration & fail-closed guards when .env is missing', async () => {
  const hasFbEnv = Boolean(process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_PROJECT_ID);
  const hasSbEnv = Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if (!hasFbEnv) {
    assert.equal(isFirebaseConfigured(), false, 'Firebase must report unconfigured when env vars are missing');
    const authRes = await signInAdmin('admin@amancomputer.in', 'TestPass123!');
    assert.equal(authRes.success, false, 'signInAdmin must fail closed without Firebase configuration');
    assert.ok(authRes.error && authRes.error.length > 0);
  }

  if (!hasSbEnv) {
    assert.equal(isSupabaseConfigured(), false, 'Supabase must report unconfigured when env vars are missing');
    const conn = await testSupabaseConnection();
    assert.equal(conn.ok, false, 'testSupabaseConnection must fail cleanly without Supabase credentials');
  }
});

test('Logout storage cleanup removes private records while preserving public website content', () => {
  const seed: Record<string, string> = {};
  for (const k of PRIVATE_ADMIN_STORAGE_KEYS) {
    seed[k] = JSON.stringify([{ id: 'secret-1', name: 'Private Customer' }]);
  }
  for (const k of PUBLIC_WEBSITE_STORAGE_KEYS) {
    seed[k] = JSON.stringify([{ id: 'pub-1', title: 'Public Record' }]);
  }

  const storage = createMockStorage(seed);
  clearPrivateAdminStorage(storage);

  for (const k of PRIVATE_ADMIN_STORAGE_KEYS) {
    assert.equal(storage.getItem(k), null, `Private key ${k} must be deleted on logout`);
  }
  for (const k of PUBLIC_WEBSITE_STORAGE_KEYS) {
    assert.ok(storage.getItem(k) !== null, `Public key ${k} must be preserved on logout`);
  }
});

test('Public sync handles empty lists cleanly, prevents duplicate reload events, and preserves cache on errors', () => {
  const storage = createMockStorage({
    aman_latest_updates: JSON.stringify([{ id: 'upd-1', title: 'Old Update', published: true }]),
  });

  const events: Array<{ name: string; detail: unknown[] }> = [];
  const dispatch = (name: string, detail: unknown[]) => events.push({ name, detail });

  // 1. Network error must preserve stale cache and emit no events
  const errResult = syncPublicCollectionResult(
    'aman_latest_updates',
    'aman_updates_changed',
    { data: null, error: { message: 'Failed to fetch' } },
    mapUpdateRow,
    storage,
    dispatch
  );
  assert.equal(errResult.preservedOnError, true);
  assert.equal(errResult.updated, false);
  assert.equal(events.length, 0);
  assert.ok(storage.getItem('aman_latest_updates')?.includes('Old Update'));

  // 2. Valid empty array from server must clear stale localStorage to [] and emit once
  const emptyResult = syncPublicCollectionResult(
    'aman_latest_updates',
    'aman_updates_changed',
    { data: [], error: null },
    mapUpdateRow,
    storage,
    dispatch
  );
  assert.equal(emptyResult.preservedOnError, false);
  assert.equal(emptyResult.updated, true);
  assert.equal(emptyResult.count, 0);
  assert.equal(storage.getItem('aman_latest_updates'), '[]');
  assert.equal(events.length, 1);

  // 3. Re-syncing identical [] must NOT dispatch duplicate change events (prevents reload loops)
  const repeatResult = syncPublicCollectionResult(
    'aman_latest_updates',
    'aman_updates_changed',
    { data: [], error: null },
    mapUpdateRow,
    storage,
    dispatch
  );
  assert.equal(repeatResult.updated, false);
  assert.equal(events.length, 1);
});

test('Every standalone public door page and /home/ loads publicSync for direct navigation & refresh', () => {
  const publicPages = [
    'index.html',
    'public/web-developer/index.html',
    'public/app-developer/index.html',
    'public/ui-ux-designer/index.html',
    'public/graphic-designer/index.html',
    'public/home/index.html',
  ];

  for (const relPath of publicPages) {
    const html = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.ok(
      html.includes('<script type="module" src="/src/lib/publicSync.ts"></script>'),
      `Expected ${relPath} to load /src/lib/publicSync.ts`
    );
  }

  const viteCfg = fs.readFileSync(path.join(ROOT_DIR, 'vite.config.ts'), 'utf8');
  assert.ok(viteCfg.includes('publicSync'), 'vite.config.ts must bundle publicSync for production doors');
  assert.ok(viteCfg.includes('/assets/public-sync.js'), 'vite.config.ts must rewrite door scripts in dist build');
});

test('Firebase Auth error mapper returns safe descriptive messages', () => {
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/invalid-credential' }),
    'Invalid admin email address or password.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/user-disabled' }),
    'This administrator account has been disabled.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/too-many-requests' }),
    'Too many failed login attempts. Terminal access temporarily locked.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/network-request-failed' }),
    'Network failure. Unable to reach authentication servers.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/invalid-email' }),
    'Please enter a valid admin email address.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/operation-not-allowed' }),
    'Email/Password sign-in is not enabled in Firebase Authentication settings.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/unauthorized-domain' }),
    'This application domain is not authorized in Firebase Authentication settings.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/invalid-api-key' }),
    'Firebase client configuration does not match an authorized Firebase project.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/user-token-expired' }),
    'Firebase session expired. Please sign in again.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/internal-error' }),
    'Firebase Authentication encountered an internal error. Please try again.'
  );
  assert.equal(
    mapFirebaseAuthError({ code: 'auth/unknown-internal-code' }),
    'Authentication failed. Please check your credentials and connection.'
  );
});

test('Public enquiry payload validator rejects invalid, oversized, or malformed submissions', async () => {
  resetPublicEnquiryCooldownForTest();

  assert.equal(
    validatePublicEnquiryPayload({
      customerName: 'A',
      phoneNumber: '9876543210',
      serviceId: 'srv-1',
      serviceName: 'PAN Card',
    }).valid,
    false
  );

  assert.equal(
    validatePublicEnquiryPayload({
      customerName: 'Ravi Kumar',
      phoneNumber: '12345',
      serviceId: 'srv-1',
      serviceName: 'PAN Card',
    }).valid,
    false
  );

  assert.equal(
    validatePublicEnquiryPayload({
      customerName: 'Ravi Kumar',
      phoneNumber: '9876543210',
      serviceId: 'srv-1',
      serviceName: 'PAN Card',
      customerMessage: 'x'.repeat(1001),
    }).valid,
    false
  );

  assert.equal(
    validatePublicEnquiryPayload({
      customerName: 'Ravi Kumar',
      phoneNumber: '+91 98765-43210',
      serviceId: 'srv-1',
      serviceName: 'PAN Card',
      customerMessage: 'Need urgent PAN correction.',
    }).valid,
    true
  );

  // Without live Supabase env, submitPublicEnquiry must still fail cleanly
  if (!isSupabaseConfigured()) {
    const res = await submitPublicEnquiry({
      customerName: 'Ravi Kumar',
      phoneNumber: '9876543210',
      serviceId: 'srv-1',
      serviceName: 'PAN Card',
    });
    assert.equal(res.ok, false);
  }
});

test('Storage upload validator enforces MIME allowlists and byte limits', () => {
  assert.equal(
    validateUploadFile({ name: 'shop.jpg', type: 'image/jpeg', size: 1024 * 500 }, 'image').valid,
    true
  );
  assert.equal(
    validateUploadFile({ name: 'poster.png', type: 'image/png', size: 1024 * 1024 }, 'image').valid,
    true
  );
  assert.equal(
    validateUploadFile({ name: 'banner.webp', type: 'image/webp', size: 2048 }, 'image').valid,
    true
  );
  assert.equal(
    validateUploadFile({ name: 'logo.svg', type: 'image/svg+xml', size: 4096 }, 'image').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'logo.svg', type: 'image/svg+xml', size: 4096 }, 'any').valid,
    false
  );

  assert.equal(
    validateUploadFile({ name: 'form.pdf', type: 'application/pdf', size: 1024 * 1024 * 2 }, 'document').valid,
    true
  );
  assert.equal(
    validateUploadFile({ name: 'notice.doc', type: 'application/msword', size: 50000 }, 'document').valid,
    true
  );
  assert.equal(
    validateUploadFile(
      {
        name: 'guide.docx',
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 80000,
      },
      'document'
    ).valid,
    true
  );

  assert.equal(
    validateUploadFile({ name: 'payload.html', type: 'text/html', size: 1024 }, 'any').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'virus.exe', type: 'application/x-msdownload', size: 1024 }, 'any').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'fake.pdf', type: 'application/pdf', size: 1024 }, 'image').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'pic.png', type: 'image/png', size: 1024 }, 'document').valid,
    false
  );

  assert.equal(
    validateUploadFile({ name: 'empty.jpg', type: 'image/jpeg', size: 0 }, 'image').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'huge.jpg', type: 'image/jpeg', size: MAX_IMAGE_SIZE + 1 }, 'image').valid,
    false
  );
  assert.equal(
    validateUploadFile({ name: 'huge.pdf', type: 'application/pdf', size: MAX_DOC_SIZE + 1 }, 'document').valid,
    false
  );

  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(1536), '1.5 KB');
  assert.equal(formatFileSize(2 * 1024 * 1024), '2.0 MB');
});

test('Timestamp normalization handles legacy DD/MM/YYYY and ISO strings', () => {
  const isoInput = '2026-11-12T10:30:00.000Z';
  assert.equal(toIsoTimestamp(isoInput), isoInput);

  const legacyDate = toIsoTimestamp('05/11/2026 08:55 AM');
  assert.ok(!Number.isNaN(Date.parse(legacyDate)), 'DD/MM/YYYY AM/PM must convert to valid ISO');
  assert.ok(legacyDate.startsWith('2026-11-05'), `Expected 2026-11-05 prefix, got ${legacyDate}`);

  const plainDate = toIsoTimestamp('2026-11-05');
  assert.ok(plainDate.startsWith('2026-11-05'));

  const fallback = toIsoTimestamp(null);
  assert.ok(!Number.isNaN(Date.parse(fallback)));
});

test('Supabase row mappers normalize snake_case PostgreSQL records to camelCase models', () => {
  const customer = mapCustomerRow({
    id: 'cust_1',
    name: 'Ravi Kumar',
    phone: '9876543210',
    address: 'Begusarai',
    category: 'Student / Exam Applicant',
    total_visits: 3,
    total_spent: '450.50',
    created_at: '2026-11-01T00:00:00Z',
    last_visit_date: '2026-11-10T00:00:00Z',
  });
  assert.equal(customer.totalVisits, 3);
  assert.equal(customer.totalSpent, 450.5);
  assert.equal(customer.lastVisitDate, '2026-11-10T00:00:00Z');

  const service = mapServiceRow({
    id: 'srv_1',
    title: 'PAN Card',
    category: 'Documentation',
    price_starting_at: '₹150',
    featured: true,
    display_order: 2,
    visible: true,
    requirements: ['Aadhaar Card', '2 Photos'],
  });
  assert.equal(service.priceStartingAt, '₹150');
  assert.deepEqual(service.requirements, ['Aadhaar Card', '2 Photos']);

  const update = mapUpdateRow({
    id: 'upd_1',
    title: 'SSC GD 2026',
    category: 'Govt Jobs',
    published_date: '2026-11-08T00:00:00Z',
    important_dates: { lastDate: '2026-12-01' },
    eligibility: { minAge: '18' },
    application_fee: '₹100',
    official_link: 'https://ssc.gov.in',
    status: 'active',
    published: true,
  });
  assert.equal(update.applicationFee, '₹100');
  assert.equal(update.published, true);

  const doc = mapDocRequirementRow({
    id: 'doc_1',
    service_title: 'Cast Certificate',
    required_documents: ['Aadhaar', 'Rashan Card'],
    important_note: 'Original needed',
    display_order: 1,
    published: true,
    updated_at: '2026-11-08T00:00:00Z',
  });
  assert.equal(doc.serviceTitle, 'Cast Certificate');
  assert.equal(doc.requiredDocuments.length, 2);

  const gallery = mapGalleryRow({
    id: 'gal_1',
    title: 'Shop Front',
    category: 'Center Interior',
    image_url: 'https://example.supabase.co/storage/v1/object/public/gallery-images/front.jpg',
    display_order: 1,
    visible: true,
    uploaded_at: '2026-11-08T00:00:00Z',
  });
  assert.ok(gallery.imageUrl.startsWith('https://'));

  const journey = mapJourneyRow({
    id: 'jrn_1',
    year: '2024',
    month: 'January',
    title: 'Digital Expansion',
    bullets: ['Added Color Laser Printer'],
    published: true,
    display_order: 4,
  });
  assert.deepEqual(journey.bullets, ['Added Color Laser Printer']);
});

test('SQL schema enforces RLS, admin role security, and public enquiry spam/rate-limit protection', () => {
  const schemaPath = path.join(ROOT_DIR, 'supabase/migrations/20261112000000_aman_computer_schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const expectedTables = [
    'admin_users',
    'customers',
    'customer_enquiries',
    'services',
    'latest_updates',
    'document_requirements',
    'gallery_items',
    'journey_milestones',
    'business_profile',
    'website_content',
    'faqs',
    'testimonials',
    'receipts',
    'media_assets',
    'notifications',
    'staff_members',
    'activity_logs',
    'terminal_settings',
  ];

  for (const tbl of expectedTables) {
    assert.ok(
      sql.includes(`ALTER TABLE public.${tbl} ENABLE ROW LEVEL SECURITY`),
      `Expected RLS enabled on public.${tbl}`
    );
  }

  // Ensure transaction boundary and uuid_generate_v4() removal
  assert.match(sql, /^\s*BEGIN;/m, 'Migration must start with BEGIN; transaction boundary');
  assert.match(sql, /^\s*COMMIT;\s*$/m, 'Migration must end with COMMIT; transaction boundary');
  assert.equal(sql.includes('uuid_generate_v4'), false, 'Migration must use built-in gen_random_uuid() instead of uuid_generate_v4()');
  assert.ok(sql.includes('DEFAULT gen_random_uuid()'), 'admin_users must default id to gen_random_uuid()');
  assert.ok(sql.includes('ALTER TABLE public.admin_users'), 'Migration must alter existing admin_users definition');
  assert.ok(sql.includes('admin_users_email_lowercase_check'), 'admin_users must enforce lowercase email constraint');

  // Harden admin authorization checks & helper search_path
  assert.ok(sql.includes("IF auth.role() = 'anon' THEN"), 'is_admin() must explicitly reject anon role');
  assert.ok(sql.includes("jwt_role <> 'authenticated'"), 'is_admin() must reject non-authenticated roles');
  assert.ok(sql.includes("authorized_uid CONSTANT TEXT := 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'"), 'is_admin() must pin exact authorized UID');
  assert.ok(sql.includes("authorized_email CONSTANT TEXT := 'shariqueaman77@gmail.com'"), 'is_admin() must pin exact authorized email');
  assert.ok(sql.includes('REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon'), 'admin_users must deny anon writes');
  assert.ok(sql.includes('REVOKE SELECT ON public.admin_users FROM anon'), 'admin_users must deny anon reads');
  assert.ok(sql.includes('REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM authenticated'), 'admin_users must deny authenticated API mutations');
  assert.ok(sql.includes('admin_users_sole_uid_check'), 'admin_users must enforce sole UID constraint');
  assert.ok(sql.includes('admin_users_sole_email_check'), 'admin_users must enforce sole email constraint');
  assert.ok(sql.includes('admin_users_sole_name_check'), 'admin_users must enforce sole display name constraint');
  assert.ok(sql.includes('admin_users_sole_role_check'), 'admin_users must enforce sole role constraint');
  assert.ok(sql.includes('idx_admin_users_singleton'), 'admin_users must enforce singleton unique index');
  assert.ok(sql.includes('enforce_single_admin_user'), 'admin_users must enforce BEFORE INSERT/UPDATE single-admin trigger');
  assert.ok(sql.includes('CREATE POLICY "Deny all API inserts on admin_users"'), 'admin_users must block all PostgREST inserts');
  assert.equal(sql.includes('user_metadata'), false, 'is_admin() must never trust client-mutable user_metadata');
  assert.equal(
    /COALESCE\(\([^)]*->>\s*'[^']+'\)::BOOLEAN/i.test(sql),
    false,
    'Migration must not perform unguarded ::BOOLEAN casts on JWT claims'
  );
  assert.ok(sql.includes("jsonb_typeof(jwt_claims -> 'disabled') = 'boolean'"), 'is_admin() must safely check boolean type');
  assert.ok(
    sql.includes("AND jsonb_typeof(jwt_claims -> 'email_verified') = 'boolean'"),
    'is_admin() must strictly require email_verified JWT claim to have JSON boolean type'
  );
  assert.ok(
    sql.includes("AND (jwt_claims ->> 'email_verified')::boolean IS TRUE"),
    'is_admin() must strictly require (jwt_claims ->> email_verified)::boolean IS TRUE'
  );
  assert.equal(
    /jsonb_typeof\(jwt_claims\s*->\s*'email_verified'\)[^;]*'null'/i.test(sql),
    false,
    'is_admin() must not permit null or missing email_verified claims'
  );
  assert.equal(
    /jwt_claims\s*->>\s*'admin'/.test(sql),
    false,
    'Custom admin JWT claims must not bypass public.admin_users allowlist'
  );
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.firebase_uid\(\)[\s\S]*?SET search_path = public/);
  assert.match(sql, /CREATE OR REPLACE FUNCTION public\.firebase_email\(\)[\s\S]*?SET search_path = public/);

  // Harden public enquiry abuse protection & concurrency safety
  assert.ok(sql.includes('enforce_public_enquiry_rate_limit'), 'Schema must enforce server-side enquiry rate limiting');
  assert.ok(sql.includes('NEW.created_at := now();'), 'Trigger must override client-supplied created_at with now()');
  assert.ok(sql.includes('NEW.updated_at := NEW.created_at;'), 'Trigger must override client-supplied updated_at');
  assert.ok(sql.includes("NEW.source := 'website';"), 'Trigger must force source = website for non-admin inserts');
  assert.ok(sql.includes("NEW.status := 'new';"), 'Trigger must force status = new for non-admin inserts');
  assert.ok(sql.includes('pg_advisory_xact_lock('), 'Trigger must use transaction-level advisory locks against concurrent bursts');
  assert.ok(sql.includes('idx_enquiries_normalized_phone_created'), 'Enquiries table must index normalized phone digits');
  assert.ok(sql.includes("source = 'website'"), 'Public enquiry insert policy must enforce source = website');
  assert.ok(sql.includes("status = 'new'"), 'Public enquiry insert policy must enforce status = new');

  // Verify every CREATE POLICY has a matching DROP POLICY IF EXISTS for idempotent retries
  const createPolicies = [...sql.matchAll(/CREATE POLICY\s+"([^"]+)"\s+ON\s+([a-zA-Z0-9_.]+)/g)];
  assert.ok(createPolicies.length >= 50, `Expected >= 50 policies, found ${createPolicies.length}`);
  for (const match of createPolicies) {
    const [, policyName, tableName] = match;
    const escapedName = policyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedTable = tableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const dropRegex = new RegExp(`DROP POLICY IF EXISTS\\s+"${escapedName}"\\s+ON\\s+${escapedTable};`);
    assert.ok(
      dropRegex.test(sql),
      `Policy "${policyName}" on ${tableName} must be preceded by DROP POLICY IF EXISTS for idempotency`
    );
  }

  // Verify Storage hardening: MIME/size limits, no SVG, no public directory listing, customer-documents privacy
  assert.ok(sql.includes('file_size_limit'), 'Storage buckets must enforce server-side file_size_limit');
  assert.ok(sql.includes('allowed_mime_types'), 'Storage buckets must enforce server-side allowed_mime_types');
  assert.equal(sql.includes("'image/svg+xml'"), false, 'Storage buckets must exclude unsanitized SVG uploads');
  assert.match(sql, /\(\s*'customer-documents',\s*'customer-documents',\s*false,/, 'customer-documents bucket must remain private');
  assert.ok(sql.includes('DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;'));
  assert.ok(sql.includes('DROP POLICY IF EXISTS "Public can view update posters" ON storage.objects;'));
  assert.ok(sql.includes('DROP POLICY IF EXISTS "Public can view media library" ON storage.objects;'));
  assert.ok(
    /CREATE POLICY "Admins only can view customer documents"[\s\S]*?bucket_id = 'customer-documents' AND public\.is_admin\(\)/.test(sql),
    'customer-documents SELECT policy must remain strictly admin-only'
  );

  // Ensure no INSERT/UPDATE/DELETE policies use permissive (true) bypasses
  const forbiddenPatterns = [
    /FOR INSERT[\s\S]{0,120}WITH CHECK\s*\(\s*true\s*\)/i,
    /FOR UPDATE[\s\S]{0,120}USING\s*\(\s*true\s*\)/i,
    /FOR DELETE[\s\S]{0,120}USING\s*\(\s*true\s*\)/i,
    /FOR ALL[\s\S]{0,120}USING\s*\(\s*true\s*\)/i,
  ];
  for (const pattern of forbiddenPatterns) {
    assert.equal(pattern.test(sql), false, `Unsafe permissive write policy detected matching ${pattern}`);
  }
});

test('Edge Function verify-admin and config.toml enforce single-admin allowlist & active DB record', () => {
  const fnPath = path.join(ROOT_DIR, 'supabase/functions/verify-admin/index.ts');
  const fnCode = fs.readFileSync(fnPath, 'utf8');
  const configToml = fs.readFileSync(path.join(ROOT_DIR, 'supabase/config.toml'), 'utf8');

  assert.equal(fnCode.includes('.or('), false, 'verify-admin should use separate parameterized eq queries');
  assert.ok(fnCode.includes("const AUTHORIZED_ADMIN_UID = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'"));
  assert.ok(fnCode.includes("const AUTHORIZED_ADMIN_EMAIL = 'shariqueaman77@gmail.com'"));
  assert.ok(fnCode.includes('userUid !== AUTHORIZED_ADMIN_UID || userEmail !== AUTHORIZED_ADMIN_EMAIL'));
  assert.ok(fnCode.includes('403'), 'verify-admin must return 403 for unauthorized accounts');
  assert.ok(fnCode.includes('fbUser.emailVerified !== true'), 'verify-admin must enforce strict boolean emailVerified === true');
  assert.ok(
    fnCode.indexOf('fbUser.emailVerified !== true') < fnCode.indexOf('userUid !== AUTHORIZED_ADMIN_UID'),
    'emailVerified check must execute before UID/email allowlist and DB lookup'
  );
  assert.equal(/Access-Control-Allow-Origin['"]?\s*:\s*['"]\*/.test(fnCode), false, 'Wildcard CORS origin must be removed');
  assert.equal(/\bALLOWED_ORIGINS\b/.test(fnCode), false, 'Unverified ALLOWED_ORIGINS env list must be removed');
  assert.equal(fnCode.includes('asia-southeast1.run.app'), false, 'Cloud Run URLs must not be hardcoded in verify-admin');
  assert.ok(fnCode.includes('parsed.username || parsed.password'), 'APP_URL validation must reject embedded credentials');
  assert.equal(fnCode.includes('err?.message'), false, 'Client HTTP 500 response must never expose raw exception messages');
  assert.equal(fnCode.includes('byEmailRes'), false, 'verify-admin must not permit email-only fallback');
  assert.equal(fnCode.includes('.update({ firebase_uid'), false, 'verify-admin must not rebind UIDs dynamically');
  assert.ok(fnCode.includes('!firebaseApiKey || !supabaseUrl || !supabaseServiceRoleKey'), 'verify-admin must fail closed without secrets');
  assert.equal(fnCode.includes('hasAdminClaim'), false, 'verify-admin must not allow custom claims to bypass admin_users.is_active');
  assert.match(configToml, /\[functions\.verify-admin\]\s+verify_jwt\s*=\s*false/, 'supabase/config.toml must disable Supabase JWT verification for verify-admin');
});

test('Firebase Spark-only single-admin provisioning script enforces exact UID & email allowlist, supports verify/revoke, and excludes paid Firebase services', () => {
  // 1. Ensure no paid Firebase Cloud Functions / Identity Platform artifacts remain (Hosting-only firebase.json is Spark-free)
  const firebaseJsonPath = path.join(ROOT_DIR, 'firebase.json');
  if (fs.existsSync(firebaseJsonPath)) {
    const firebaseCfg = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    assert.equal('functions' in firebaseCfg, false, 'firebase.json must not configure Cloud Functions in Spark-only architecture');
    assert.ok('hosting' in firebaseCfg, 'firebase.json must only configure static Hosting rewrites');
  }
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'functions')), false, 'functions/ directory must not exist in Spark-only architecture');

  // 2. Adds role='authenticated' cleanly on fresh claims without setting admin: true
  const freshClaims = mergeAuthenticatedRoleClaims(undefined);
  assert.deepEqual(freshClaims, { role: 'authenticated' });
  assert.equal('admin' in freshClaims, false);

  // 3. Preserves unrelated existing custom claims while ensuring role='authenticated' and stripping reserved OIDC & admin keys
  const merged = mergeAuthenticatedRoleClaims({
    workstation: 'Terminal-2',
    tier: 'counter',
    role: 'legacy',
    admin: true,
    sub: 'should-be-stripped-reserved',
    email: 'should-be-stripped',
  });
  assert.deepEqual(merged, {
    workstation: 'Terminal-2',
    tier: 'counter',
    role: 'authenticated',
  });
  assert.equal('admin' in merged, false);

  // 4. Role removal strips role cleanly while preserving unrelated claims
  const revoked = removeAuthenticatedRoleClaims(merged);
  assert.deepEqual(revoked, {
    workstation: 'Terminal-2',
    tier: 'counter',
  });
  assert.equal('role' in revoked, false);

  // 5. Single-admin provisioning target validation: permits ONLY exact UID + matching email
  assert.equal(
    validateProvisioningTarget(
      { uid: AUTHORIZED_ADMIN_UID, email: AUTHORIZED_ADMIN_EMAIL },
      { uid: AUTHORIZED_ADMIN_UID, email: AUTHORIZED_ADMIN_EMAIL, disabled: false }
    ).allowed,
    true
  );
  assert.equal(
    validateProvisioningTarget(
      { uid: 'DifferentUid1234567890', email: AUTHORIZED_ADMIN_EMAIL },
      { uid: 'DifferentUid1234567890', email: AUTHORIZED_ADMIN_EMAIL, disabled: false }
    ).allowed,
    false
  );
  assert.equal(
    validateProvisioningTarget(
      { uid: AUTHORIZED_ADMIN_UID, email: 'other@example.com' },
      { uid: AUTHORIZED_ADMIN_UID, email: AUTHORIZED_ADMIN_EMAIL, disabled: false }
    ).allowed,
    false
  );
  assert.equal(
    validateProvisioningTarget(
      { uid: AUTHORIZED_ADMIN_UID, email: AUTHORIZED_ADMIN_EMAIL },
      { uid: AUTHORIZED_ADMIN_UID, email: AUTHORIZED_ADMIN_EMAIL, disabled: true }
    ).allowed,
    false
  );

  // 6. Safe claim verification report returns strictly boolean/count fields without PII/tokens
  const verifyReport = buildSafeClaimVerificationReport(
    {
      uid: AUTHORIZED_ADMIN_UID,
      email: AUTHORIZED_ADMIN_EMAIL,
      emailVerified: true,
      disabled: false,
      customClaims: { role: 'authenticated', workstation: 'Terminal-2' },
    },
    'verify',
    false
  );
  assert.deepEqual(verifyReport, {
    ok: true,
    mode: 'verify',
    isAuthorizedSingleAdmin: true,
    hasRoleAuthenticated: true,
    hasNoAdminClaim: true,
    unrelatedClaimCount: 1,
    emailVerified: true,
    disabled: false,
    refreshTokensRevoked: false,
  });
  const serializedReport = JSON.stringify(verifyReport);
  assert.equal(serializedReport.includes(AUTHORIZED_ADMIN_UID), false);
  assert.equal(serializedReport.includes(AUTHORIZED_ADMIN_EMAIL), false);

  // 7. CLI parser supports uid, email, verify, revoke-role, revoke-tokens
  assert.deepEqual(parseCliArgs(['--email', AUTHORIZED_ADMIN_EMAIL, '--verify']), {
    uid: '',
    email: AUTHORIZED_ADMIN_EMAIL,
    verify: true,
    revokeRole: false,
    revokeTokens: false,
  });
  assert.deepEqual(parseCliArgs(['--uid', AUTHORIZED_ADMIN_UID, '--revoke-role']), {
    uid: AUTHORIZED_ADMIN_UID,
    email: '',
    verify: false,
    revokeRole: true,
    revokeTokens: false,
  });

  // 8. Verify Spark provisioning script enforces GOOGLE_APPLICATION_CREDENTIALS and disabled check without secrets
  const stripComments = (src: string) =>
    src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const sparkScript = fs.readFileSync(path.join(ROOT_DIR, 'scripts/set-firebase-role-claim.mjs'), 'utf8');
  assert.ok(sparkScript.includes('GOOGLE_APPLICATION_CREDENTIALS'));
  assert.ok(sparkScript.includes("role: 'authenticated'"));
  assert.ok(sparkScript.includes('validateProvisioningTarget'));
  assert.ok(sparkScript.includes('--verify'));
  assert.ok(sparkScript.includes('--revoke-role'));
  assert.ok(sparkScript.includes('revokeRefreshTokens'));
  assert.equal(/\badmin\s*:\s*true\b/.test(stripComments(sparkScript)), false);
  assert.equal(sparkScript.includes('-----BEGIN PRIVATE KEY-----'), false);
});

test('Token claim diagnostics, force-refresh token delivery to Supabase, and admin vs non-admin RLS isolation hold', async () => {
  const now = 1_800_000_000;
  const validNonAdmin = evaluateTokenClaimDiagnostics(
    {
      sub: 'uid_secret_123',
      email: 'visitor@example.com',
      role: 'authenticated',
      email_verified: true,
      exp: now + 3600,
    },
    now
  );

  assert.deepEqual(validNonAdmin, {
    hasSub: true,
    hasRoleAuthenticated: true,
    emailVerified: true,
    hasNoAdminClaim: true,
    notDisabledClaim: true,
    tokenValidWindow: true,
  });

  // Diagnostics must contain strictly boolean values (no JWTs, UIDs, or emails)
  for (const val of Object.values(validNonAdmin)) {
    assert.equal(typeof val, 'boolean');
  }

  const missingRoleDiag = evaluateTokenClaimDiagnostics(
    {
      sub: 'uid_secret_123',
      email_verified: true,
      exp: now + 3600,
    },
    now
  );
  assert.equal(missingRoleDiag.hasRoleAuthenticated, false);

  const disabledDiag = evaluateTokenClaimDiagnostics(
    {
      sub: 'uid_secret_123',
      role: 'authenticated',
      disabled: true,
      exp: now + 3600,
    },
    now
  );
  assert.equal(disabledDiag.notDisabledClaim, false);

  // Verify getRefreshedSupabaseAccessToken uses cached token when role='authenticated' is present
  const cachedCalls: boolean[] = [];
  const tokenWithRole = await getRefreshedSupabaseAccessToken({
    async getIdTokenResult(forceRefresh = false) {
      cachedCalls.push(forceRefresh);
      return {
        token: 'cached-jwt-with-role',
        claims: { role: 'authenticated' },
      };
    },
  });
  assert.equal(tokenWithRole, 'cached-jwt-with-role');
  assert.deepEqual(cachedCalls, [false]);

  // Verify getRefreshedSupabaseAccessToken force-refreshes when cached token is missing role='authenticated'
  const refreshCalls: boolean[] = [];
  const refreshedToken = await getRefreshedSupabaseAccessToken({
    async getIdTokenResult(forceRefresh = false) {
      refreshCalls.push(forceRefresh);
      if (!forceRefresh) {
        return {
          token: 'stale-jwt-missing-role',
          claims: {},
        };
      }
      return {
        token: 'refreshed-jwt-with-role',
        claims: { role: 'authenticated' },
      };
    },
  });
  assert.equal(refreshedToken, 'refreshed-jwt-with-role');
  assert.deepEqual(refreshCalls, [false, true]);

  // Returns null cleanly for unauthenticated/null user
  assert.equal(await getRefreshedSupabaseAccessToken(null), null);

  // Verify authService enforces getIdTokenResult(user, true) + role check and supabase.ts uses refreshed token callback
  const authSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/services/authService.ts'), 'utf8');
  const sbSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/supabase.ts'), 'utf8');
  assert.ok(authSrc.includes('getIdTokenResult(user, true)'));
  assert.ok(authSrc.includes('!diagnostics.hasRoleAuthenticated'));
  assert.ok(sbSrc.includes('accessToken: getRefreshedSupabaseAccessToken'));

  // Verify verify-admin stays on Supabase Edge Functions
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'supabase/functions/verify-admin/index.ts')), true);

  // Verify non-admin with role='authenticated' cannot read private tables or customer-documents
  const sql = fs.readFileSync(path.join(ROOT_DIR, 'supabase/migrations/20261112000000_aman_computer_schema.sql'), 'utf8');
  for (const privateTable of ['customers', 'receipts', 'staff_members', 'notifications', 'activity_logs', 'terminal_settings']) {
    const policyRegex = new RegExp(`CREATE POLICY[^;]+ON\\s+public\\.${privateTable}[\\s\\S]*?USING\\s*\\(public\\.is_admin\\(\\)\\)`, 'i');
    assert.match(sql, policyRegex, `Private table ${privateTable} must require public.is_admin() even when role=authenticated`);
  }
  assert.match(
    sql,
    /CREATE POLICY "Admins only select enquiries"\s+ON public\.customer_enquiries\s+FOR SELECT\s+USING \(public\.is_admin\(\)\)/,
    'Non-admin authenticated users must not read customer_enquiries'
  );
  assert.match(
    sql,
    /CREATE POLICY "Admins only can view customer documents"\s+ON storage\.objects\s+FOR SELECT\s+USING \(bucket_id = 'customer-documents' AND public\.is_admin\(\)\)/,
    'Non-admin authenticated users must not read customer-documents'
  );
});

test('Single-admin security matrix: authorized vs wrong UID/email, inactive record, second-admin insert, role-only, and anon denial', () => {
  const now = 1_800_000_000;
  const activeAdminRecord = {
    firebase_uid: AUTHORIZED_ADMIN_UID,
    email: AUTHORIZED_ADMIN_EMAIL,
    name: 'Sharique Aman',
    role: 'Proprietor / Super Admin',
    is_active: true,
  };

  // 1. Authorized UID + correct email + role=authenticated + active record = PASS
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: AUTHORIZED_ADMIN_UID,
      email: AUTHORIZED_ADMIN_EMAIL,
      claims: { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', exp: now + 3600 },
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    true
  );

  // 2. Different UID = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: 'OtherFirebaseUid999',
      email: 'other@example.com',
      claims: { sub: 'OtherFirebaseUid999', role: 'authenticated', admin: true, exp: now + 3600 },
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    false
  );

  // 3. Correct email but different UID = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: 'SpoofedUidWithSameEmail',
      email: AUTHORIZED_ADMIN_EMAIL,
      claims: { sub: 'SpoofedUidWithSameEmail', role: 'authenticated', email_verified: true, exp: now + 3600 },
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    false
  );

  // 4. Correct UID but wrong email = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: AUTHORIZED_ADMIN_UID,
      email: 'wrong.email@example.com',
      claims: { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', exp: now + 3600 },
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    false
  );

  // 5. Inactive admin record = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: AUTHORIZED_ADMIN_UID,
      email: AUTHORIZED_ADMIN_EMAIL,
      claims: { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', exp: now + 3600 },
      adminRecord: { ...activeAdminRecord, is_active: false },
      nowSeconds: now,
    }).authorized,
    false
  );

  // 6. Non-admin Firebase user with role='authenticated' (and missing/mismatched DB record) = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: 'RegularVisitorUid',
      email: 'visitor@example.com',
      claims: { sub: 'RegularVisitorUid', role: 'authenticated', admin: true, exp: now + 3600 },
      adminRecord: {
        firebase_uid: 'RegularVisitorUid',
        email: 'visitor@example.com',
        is_active: true,
      },
      nowSeconds: now,
    }).authorized,
    false
  );

  // 7. Authorized UID missing role='authenticated' claim = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: AUTHORIZED_ADMIN_UID,
      email: AUTHORIZED_ADMIN_EMAIL,
      claims: { sub: AUTHORIZED_ADMIN_UID, exp: now + 3600 },
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    false
  );

  // 8. Anonymous user = DENIED
  assert.equal(
    evaluateSingleAdminAuthorization({
      uid: null,
      email: null,
      claims: null,
      adminRecord: activeAdminRecord,
      nowSeconds: now,
    }).authorized,
    false
  );

  // 9. Second administrator insertion denied & initial seed SQL idempotency + conflict detection
  const seedSql = fs.readFileSync(path.join(ROOT_DIR, 'supabase/seed_single_admin.sql'), 'utf8');
  assert.ok(seedSql.includes("'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'"));
  assert.ok(seedSql.includes("'shariqueaman77@gmail.com'"));
  assert.ok(seedSql.includes("'Sharique Aman'"));
  assert.ok(seedSql.includes("'Proprietor / Super Admin'"));
  assert.ok(seedSql.includes('v_conflict_count > 0'), 'Seed SQL must detect conflicting admin records');
  assert.ok(seedSql.includes('RAISE EXCEPTION'), 'Seed SQL must report conflicts instead of overwriting/deleting');
  assert.equal(/\bDELETE\s+FROM\s+public\.admin_users\b/i.test(seedSql), false, 'Seed SQL must not silently delete rows');
  assert.equal(/\bUPDATE\s+public\.admin_users\b/i.test(seedSql), false, 'Seed SQL must not silently overwrite existing rows');

  // 10. Public website files and auth-free modules never expose the authorized admin UID
  const publicFiles = [
    'index.html',
    'public/home/index.html',
    'public/web-developer/index.html',
    'public/app-developer/index.html',
    'public/ui-ux-designer/index.html',
    'public/graphic-designer/index.html',
    'src/lib/firebase.ts',
    'src/lib/supabase.ts',
    'src/lib/publicSync.ts',
  ];
  for (const relPath of publicFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.equal(content.includes(AUTHORIZED_ADMIN_UID), false, `Public/shared file ${relPath} must not expose authorized admin UID`);
    assert.equal(content.includes(AUTHORIZED_ADMIN_EMAIL), false, `Public/shared file ${relPath} must not expose authorized admin email`);
  }

  // 11. Zero registration/sign-up/OAuth/staff-login flows exist in src/
  const authSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/services/authService.ts'), 'utf8');
  const firebaseSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/firebase.ts'), 'utf8');
  for (const forbiddenAuth of ['createUserWithEmailAndPassword', 'signInWithPopup', 'signInWithRedirect', 'sendSignInLinkToEmail']) {
    assert.equal(authSrc.includes(forbiddenAuth), false);
    assert.equal(firebaseSrc.includes(forbiddenAuth), false);
  }
});

test('Frontend source code exposes zero private keys, service_role tokens, or hardcoded credentials', () => {
  const srcDir = path.join(ROOT_DIR, 'src');
  const walkFiles = (dir: string): string[] => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries.flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
    });
  };

  const files = walkFiles(srcDir).filter((f) => /\.(ts|tsx|js|jsx)$/.test(f));
  assert.ok(files.length > 0, 'Expected frontend source files in src/');

  const forbiddenSecrets = [
    /SUPABASE_SERVICE_ROLE_KEY/,
    /service_role/i,
    /-----BEGIN PRIVATE KEY-----/,
    /anna@example\.com/i,
    /marble123/i,
  ];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const secretRegex of forbiddenSecrets) {
      assert.equal(
        secretRegex.test(content),
        false,
        `Forbidden secret or demo credential (${secretRegex}) found in ${path.relative(ROOT_DIR, file)}`
      );
    }
  }
});

test('is_admin() SQL and token diagnostics enforce strict boolean true email_verified claim', () => {
  const now = 1_800_000_000;
  const sql = fs.readFileSync(path.join(ROOT_DIR, 'supabase/migrations/20261112000000_aman_computer_schema.sql'), 'utf8');
  const isAdminMatch = sql.match(/CREATE OR REPLACE FUNCTION public\.is_admin\(\)[\s\S]*?\$\$;/);
  assert.ok(isAdminMatch, 'Migration must define public.is_admin()');
  const isAdminSql = isAdminMatch[0];

  assert.ok(
    isAdminSql.includes("AND jsonb_typeof(jwt_claims -> 'email_verified') = 'boolean'\n      AND (jwt_claims ->> 'email_verified')::boolean IS TRUE"),
    'public.is_admin() must require strict boolean TRUE email_verified claim'
  );
  assert.equal(
    isAdminSql.includes("COALESCE(jsonb_typeof(jwt_claims -> 'email_verified'), 'null')"),
    false,
    'public.is_admin() must not coalesce missing email_verified claims to permitted null'
  );

  // Mirror the SQL predicate:
  //   jsonb_typeof(jwt_claims -> 'email_verified') = 'boolean'
  //   AND (jwt_claims ->> 'email_verified')::boolean IS TRUE
  const passesSqlEmailVerified = (claims: Record<string, unknown>): boolean => {
    if (!Object.prototype.hasOwnProperty.call(claims, 'email_verified')) {
      return false;
    }
    const raw = claims.email_verified;
    if (typeof raw !== 'boolean') {
      return false;
    }
    return raw === true;
  };

  // True boolean claim -> allowed
  assert.equal(passesSqlEmailVerified({ email_verified: true }), true);
  assert.equal(
    evaluateTokenClaimDiagnostics(
      { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', email_verified: true, exp: now + 3600 },
      now
    ).emailVerified,
    true
  );

  // False boolean claim -> denied
  assert.equal(passesSqlEmailVerified({ email_verified: false }), false);
  assert.equal(
    evaluateTokenClaimDiagnostics(
      { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', email_verified: false, exp: now + 3600 },
      now
    ).emailVerified,
    false
  );

  // Missing claim -> denied
  assert.equal(passesSqlEmailVerified({}), false);
  assert.equal(
    evaluateTokenClaimDiagnostics(
      { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', exp: now + 3600 },
      now
    ).emailVerified,
    false
  );

  // Malformed / non-boolean claims -> denied
  for (const malformed of [null, 'true', 'false', 'TRUE', 1, 0, {}, ['true']]) {
    assert.equal(
      passesSqlEmailVerified({ email_verified: malformed }),
      false,
      `Malformed email_verified=${JSON.stringify(malformed)} must be rejected`
    );
    assert.equal(
      evaluateTokenClaimDiagnostics(
        { sub: AUTHORIZED_ADMIN_UID, role: 'authenticated', email_verified: malformed, exp: now + 3600 },
        now
      ).emailVerified,
      false,
      `Diagnostics must reject malformed email_verified=${JSON.stringify(malformed)}`
    );
  }
});

test('Hardening migration 20261114102000 sets empty search_path on SECURITY DEFINER functions while preserving logic and grants', () => {
  const migrationsDir = path.join(ROOT_DIR, 'supabase/migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  assert.ok(
    migrationFiles.includes('20261112000000_aman_computer_schema.sql'),
    'Base migration must remain present'
  );
  assert.ok(
    migrationFiles.includes('20261114102000_harden_security_definer_search_path.sql'),
    'New hardening migration must exist with a later timestamp'
  );
  assert.ok(
    migrationFiles.indexOf('20261114102000_harden_security_definer_search_path.sql') >
      migrationFiles.indexOf('20261112000000_aman_computer_schema.sql'),
    'Hardening migration timestamp must sort strictly after the applied base migration'
  );

  const baseSql = fs.readFileSync(path.join(migrationsDir, '20261112000000_aman_computer_schema.sql'), 'utf8');
  const hardenSql = fs.readFileSync(
    path.join(migrationsDir, '20261114102000_harden_security_definer_search_path.sql'),
    'utf8'
  );

  assert.match(hardenSql, /^\s*BEGIN;/m, 'Hardening migration must start with BEGIN;');
  assert.match(hardenSql, /^\s*COMMIT;\s*$/m, 'Hardening migration must end with COMMIT;');

  const extractFn = (source: string, fnName: string): string => {
    const regex = new RegExp(
      `CREATE OR REPLACE FUNCTION ${fnName.replace('.', '\\.')}\\(\\)([\\s\\S]*?)\\$\\$;`
    );
    const match = source.match(regex);
    assert.ok(match, `Expected function ${fnName}() definition`);
    return match[0];
  };

  // 1. Both SECURITY DEFINER functions set empty search_path = ''
  const baseIsAdmin = extractFn(baseSql, 'public.is_admin');
  const hardenIsAdmin = extractFn(hardenSql, 'public.is_admin');
  assert.match(hardenIsAdmin, /RETURNS BOOLEAN[\s\S]*LANGUAGE plpgsql[\s\S]*STABLE[\s\S]*SECURITY DEFINER[\s\S]*SET search_path = ''/);
  assert.equal(
    hardenIsAdmin.replace("SET search_path = ''", 'SET search_path = public'),
    baseIsAdmin,
    'public.is_admin() signature and body must remain identical apart from SET search_path = \'\''
  );

  const baseRateLimit = extractFn(baseSql, 'public.enforce_public_enquiry_rate_limit');
  const hardenRateLimit = extractFn(hardenSql, 'public.enforce_public_enquiry_rate_limit');
  assert.match(
    hardenRateLimit,
    /RETURNS TRIGGER[\s\S]*LANGUAGE plpgsql[\s\S]*SECURITY DEFINER[\s\S]*SET search_path = ''/
  );
  assert.equal(
    hardenRateLimit.replace("SET search_path = ''", 'SET search_path = public'),
    baseRateLimit,
    'public.enforce_public_enquiry_rate_limit() signature and body must remain identical apart from SET search_path = \'\''
  );

  // 2. Every table, schema, and non-pg_catalog function reference is explicitly schema-qualified
  assert.ok(hardenIsAdmin.includes('auth.jwt()'));
  assert.ok(hardenIsAdmin.includes('auth.role()'));
  assert.ok(hardenIsAdmin.includes('FROM public.admin_users au'));
  assert.equal(/(^|[^.])\badmin_users\b/.test(hardenIsAdmin), false, 'admin_users must be schema-qualified');
  assert.equal(/(^|[^.])\bjwt\(\)/.test(hardenIsAdmin), false, 'auth.jwt() must be schema-qualified');
  assert.equal(/(^|[^.])\brole\(\)/.test(hardenIsAdmin), false, 'auth.role() must be schema-qualified');

  assert.ok(hardenRateLimit.includes('IF public.is_admin() THEN'));
  assert.ok(hardenRateLimit.includes('FROM public.customer_enquiries ce'));
  assert.equal(/(^|[^.])\bis_admin\(\)/.test(hardenRateLimit), false, 'public.is_admin() must be schema-qualified');
  assert.equal(
    /(^|[^.])\bcustomer_enquiries\b/.test(hardenRateLimit),
    false,
    'public.customer_enquiries must be schema-qualified'
  );

  // 3. Preserve admin authorization requirements in hardened is_admin()
  assert.ok(hardenIsAdmin.includes("authorized_uid CONSTANT TEXT := 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';"));
  assert.ok(hardenIsAdmin.includes("authorized_email CONSTANT TEXT := 'shariqueaman77@gmail.com';"));
  assert.ok(hardenIsAdmin.includes('WHERE au.is_active = TRUE'));
  assert.ok(hardenIsAdmin.includes("AND jsonb_typeof(jwt_claims -> 'email_verified') = 'boolean'"));
  assert.ok(hardenIsAdmin.includes("AND (jwt_claims ->> 'email_verified')::boolean IS TRUE"));

  // 4. Preserve rate limits & error codes/messages in hardened enforce_public_enquiry_rate_limit()
  assert.ok(hardenRateLimit.includes("INTERVAL '10 minutes'"));
  assert.ok(hardenRateLimit.includes('IF recent_phone_count >= 3 THEN'));
  assert.ok(hardenRateLimit.includes("INTERVAL '24 hours'"));
  assert.ok(hardenRateLimit.includes('IF daily_phone_count >= 8 THEN'));
  assert.ok(hardenRateLimit.includes("INTERVAL '1 minute'"));
  assert.ok(hardenRateLimit.includes('IF global_burst_count >= 30 THEN'));
  assert.ok(hardenRateLimit.includes("ERRCODE = '22023'"));
  assert.ok(hardenRateLimit.includes("ERRCODE = 'P0001'"));

  // 5. Preserve existing ownership & EXECUTE grants (do not drop/re-grant/broaden permissions)
  const hardenSqlStatements = hardenSql.replace(/--.*$/gm, '');
  for (const forbidden of [
    /\bDROP\s+FUNCTION\b/i,
    /\bOWNER\s+TO\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /enforce_single_admin_user/i,
    /\bCREATE\s+TABLE\b/i,
    /\bALTER\s+TABLE\b/i,
    /\bCREATE\s+TRIGGER\b/i,
    /\bCREATE\s+POLICY\b/i,
    /storage\.buckets/i,
    /storage\.objects/i,
  ]) {
    assert.equal(
      forbidden.test(hardenSqlStatements),
      false,
      `Hardening migration must not contain out-of-scope statement matching ${forbidden}`
    );
  }

  // Base migration retains restrictive grants and keeps enforce_single_admin_user() SECURITY INVOKER
  assert.ok(baseSql.includes('REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;'));
  assert.ok(baseSql.includes('GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;'));
  assert.ok(
    baseSql.includes('REVOKE ALL ON FUNCTION public.enforce_public_enquiry_rate_limit() FROM PUBLIC, anon, authenticated;')
  );
  const singleAdminFn = extractFn(baseSql, 'public.enforce_single_admin_user');
  assert.equal(/SECURITY\s+DEFINER/i.test(singleAdminFn), false, 'enforce_single_admin_user() must stay SECURITY INVOKER');
});

test('Edge Function verify-admin enforces emailVerified, strict CORS origins, disabled/allowlist checks, and fail-closed error handling', async () => {
  const fnEntry = path.join(ROOT_DIR, 'supabase/functions/verify-admin/index.ts');
  const bundled = await esbuild.build({
    entryPoints: [fnEntry],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    plugins: [
      {
        name: 'deno-url-stubs',
        setup(build) {
          build.onResolve({ filter: /^https:\/\// }, (args) => ({
            path: args.path,
            namespace: 'deno-stub',
          }));
          build.onLoad({ filter: /.*/, namespace: 'deno-stub' }, (args) => {
            if (args.path.includes('std@')) {
              return { contents: 'export const serve = () => {};', loader: 'js' };
            }
            return { contents: 'export const createClient = () => { throw new Error("stub"); };', loader: 'js' };
          });
        },
      },
    ],
  });

  const code = bundled.outputFiles[0]?.text || '';
  assert.ok(code.length > 0, 'Expected compiled verify-admin bundle');
  const modUrl = `data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`;
  const mod = (await import(modUrl)) as {
    createVerifyAdminHandler: (deps: {
      getEnv: (key: string) => string | undefined;
      fetchFn: typeof fetch;
      createSupabaseClient: (...args: unknown[]) => unknown;
      logError: (...args: unknown[]) => void;
    }) => (req: Request) => Promise<Response>;
  };

  const validAppOrigin = 'https://aman-computer-hosted.example';
  const baseEnv: Record<string, string | undefined> = {
    FIREBASE_WEB_API_KEY: 'test-firebase-api-key',
    SUPABASE_URL: 'https://test-project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    APP_URL: validAppOrigin,
  };

  const makeMockSupabase = (record: Record<string, unknown> | null, onQuery?: () => void) => {
    return () => ({
      from: (table: string) => {
        assert.equal(table, 'admin_users');
        if (onQuery) onQuery();
        const chain = {
          select: () => chain,
          eq: () => chain,
          maybeSingle: async () => ({ data: record, error: null }),
        };
        return chain;
      },
    });
  };

  const localDevOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ];

  // 1. Valid verified admin with valid APP_URL and local dev/preview origins + OPTIONS preflight -> 200 / 204
  for (const origin of [validAppOrigin, ...localDevOrigins]) {
    let dbCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            users: [
              {
                localId: AUTHORIZED_ADMIN_UID,
                email: AUTHORIZED_ADMIN_EMAIL,
                emailVerified: true,
                disabled: false,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as typeof fetch,
      createSupabaseClient: makeMockSupabase(
        {
          id: 'row-1',
          firebase_uid: AUTHORIZED_ADMIN_UID,
          email: AUTHORIZED_ADMIN_EMAIL,
          name: 'Sharique Aman',
          role: 'Proprietor / Super Admin',
          is_active: true,
        },
        () => {
          dbCalled = true;
        }
      ),
      logError: () => {},
    });

    const preflightRes = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'OPTIONS',
        headers: { Origin: origin },
      })
    );
    assert.equal(preflightRes.status, 204);
    assert.equal(preflightRes.headers.get('Access-Control-Allow-Origin'), origin);
    assert.equal(preflightRes.headers.get('Access-Control-Allow-Methods'), 'POST, OPTIONS');
    assert.equal(preflightRes.headers.get('Vary'), 'Origin');

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: origin, Authorization: 'Bearer valid-firebase-token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(dbCalled, true);
    assert.equal(body.authenticated, true);
    assert.equal(body.isAuthorizedAdmin, true);
    assert.equal(body.uid, AUTHORIZED_ADMIN_UID);
    assert.equal(body.email, AUTHORIZED_ADMIN_EMAIL);
    assert.equal(body.name, 'Sharique Aman');
    assert.equal(body.role, 'Proprietor / Super Admin');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), origin);
    assert.equal(res.headers.get('Vary'), 'Origin');
  }

  // 2. Unverified admin (false and non-boolean values) -> 403 rejected before UID/email/DB lookup
  for (const badVerified of [false, 'true', 'false', 1, 0, null, {}]) {
    let dbCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            users: [
              {
                localId: AUTHORIZED_ADMIN_UID,
                email: AUTHORIZED_ADMIN_EMAIL,
                emailVerified: badVerified,
                disabled: false,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null, () => {
        dbCalled = true;
      }),
      logError: () => {},
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.isAuthorizedAdmin, false);
    assert.equal(dbCalled, false, `DB lookup must not run for emailVerified=${JSON.stringify(badVerified)}`);
  }

  // 3. Missing emailVerified -> 403 rejected before DB lookup
  {
    let dbCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            users: [
              {
                localId: AUTHORIZED_ADMIN_UID,
                email: AUTHORIZED_ADMIN_EMAIL,
                disabled: false,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null, () => {
        dbCalled = true;
      }),
      logError: () => {},
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.isAuthorizedAdmin, false);
    assert.equal(dbCalled, false);
  }

  // 4. Disabled account (even with emailVerified: true) -> 403 rejected before DB lookup
  {
    let dbCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () =>
        new Response(
          JSON.stringify({
            users: [
              {
                localId: AUTHORIZED_ADMIN_UID,
                email: AUTHORIZED_ADMIN_EMAIL,
                emailVerified: true,
                disabled: true,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        )) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null, () => {
        dbCalled = true;
      }),
      logError: () => {},
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.authenticated, false);
    assert.equal(body.isAuthorizedAdmin, false);
    assert.equal(dbCalled, false);
  }

  // 5. Wrong UID or wrong email (even with emailVerified: true) -> 403 rejected before DB lookup
  for (const wrongUser of [
    { localId: 'WrongUid123', email: AUTHORIZED_ADMIN_EMAIL, emailVerified: true, disabled: false },
    { localId: AUTHORIZED_ADMIN_UID, email: 'attacker@example.com', emailVerified: true, disabled: false },
  ]) {
    let dbCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () =>
        new Response(JSON.stringify({ users: [wrongUser] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null, () => {
        dbCalled = true;
      }),
      logError: () => {},
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 403);
    assert.equal(body.isAuthorizedAdmin, false);
    assert.equal(dbCalled, false);
  }

  // 6. Missing secrets -> fail closed with generic 500 (never exposes env var names) + logs server-side
  for (const missingKey of ['FIREBASE_WEB_API_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']) {
    const logged: unknown[][] = [];
    const incompleteEnv = { ...baseEnv, [missingKey]: undefined };
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => incompleteEnv[k],
      fetchFn: (() => {
        throw new Error('fetch should not run when secrets are missing');
      }) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null),
      logError: (...args) => logged.push(args),
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 500);
    assert.equal(body.isAuthorizedAdmin, false);
    assert.equal(body.error, 'Internal server error');
    assert.equal(JSON.stringify(body).includes(missingKey), false);
    assert.ok(logged.length > 0, 'Configuration failure must be logged server-side');
  }

  // 7. Invalid APP_URL formats -> rejected / ignored, warning logged, origin not allowed
  for (const badAppUrl of [
    '*',
    'null',
    'https://user:pass@evil.example',
    'https://user@evil.example',
    'https://evil.example/subpath',
    'https://evil.example/',
    'https://evil.example?foo=bar',
    'https://evil.example#hash',
    'ftp://evil.example',
    'https://*.evil.example',
    'not-a-valid-url',
  ]) {
    const logged: unknown[][] = [];
    let fetchCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => ({ ...baseEnv, APP_URL: badAppUrl })[k],
      fetchFn: (async () => {
        fetchCalled = true;
        return new Response('{}', { status: 200 });
      }) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null),
      logError: (...args) => logged.push(args),
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: badAppUrl, Authorization: 'Bearer token' },
      })
    );
    assert.equal(res.status, 403, `Invalid APP_URL ${badAppUrl} must not be trusted as an allowed origin`);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(res.headers.get('Vary'), 'Origin');
    assert.equal(fetchCalled, false);
    assert.ok(logged.length > 0, `Invalid APP_URL ${badAppUrl} must log server-side warning`);
  }

  // 8. Unauthorized origins (including previously suggested Cloud Run URLs when APP_URL is unset) -> 403, no CORS header
  for (const badOrigin of [
    'https://ais-dev-vqm5iytctz2anyqw5ngl25-374408797024.asia-southeast1.run.app',
    'https://evil.example',
    'https://amancomputer.fake',
    'null',
  ]) {
    let fetchCalled = false;
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => ({ ...baseEnv, APP_URL: undefined })[k],
      fetchFn: (async () => {
        fetchCalled = true;
        return new Response('{}', { status: 200 });
      }) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null),
      logError: () => {},
    });

    for (const method of ['OPTIONS', 'POST'] as const) {
      const res = await handler(
        new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
          method,
          headers: { Origin: badOrigin, Authorization: 'Bearer token' },
        })
      );
      assert.equal(res.status, 403);
      assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
      assert.equal(res.headers.get('Vary'), 'Origin');
      assert.equal(fetchCalled, false, `Unauthorized origin ${badOrigin} must be blocked before external lookup`);
    }
  }

  // 9. Missing Origin server-to-server requests: OPTIONS rejected; POST still requires full Firebase + DB auth
  {
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async (_url, init) => {
        const parsed = JSON.parse(String(init?.body || '{}'));
        if (parsed.idToken === 'valid-admin-token') {
          return new Response(
            JSON.stringify({
              users: [
                {
                  localId: AUTHORIZED_ADMIN_UID,
                  email: AUTHORIZED_ADMIN_EMAIL,
                  emailVerified: true,
                  disabled: false,
                },
              ],
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({
            users: [
              {
                localId: AUTHORIZED_ADMIN_UID,
                email: AUTHORIZED_ADMIN_EMAIL,
                emailVerified: false,
                disabled: false,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }) as typeof fetch,
      createSupabaseClient: makeMockSupabase({
        id: 'row-1',
        firebase_uid: AUTHORIZED_ADMIN_UID,
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Sharique Aman',
        role: 'Proprietor / Super Admin',
        is_active: true,
      }),
      logError: () => {},
    });

    const optNoOrigin = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', { method: 'OPTIONS' })
    );
    assert.equal(optNoOrigin.status, 403);
    assert.equal(optNoOrigin.headers.get('Access-Control-Allow-Origin'), null);

    const noTokenRes = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', { method: 'POST' })
    );
    assert.equal(noTokenRes.status, 401);
    assert.equal(noTokenRes.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(noTokenRes.headers.get('Vary'), 'Origin');

    const unverifiedNoOriginRes = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Authorization: 'Bearer unverified-token' },
      })
    );
    assert.equal(unverifiedNoOriginRes.status, 403);
    assert.equal(unverifiedNoOriginRes.headers.get('Access-Control-Allow-Origin'), null);

    const validNoOriginRes = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Authorization: 'Bearer valid-admin-token' },
      })
    );
    const validBody = await validNoOriginRes.json();
    assert.equal(validNoOriginRes.status, 200);
    assert.equal(validBody.authenticated, true);
    assert.equal(validBody.isAuthorizedAdmin, true);
    assert.equal(validNoOriginRes.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(validNoOriginRes.headers.get('Vary'), 'Origin');
  }

  // 10. Unexpected exception -> generic HTTP 500 without leaking internal error message
  {
    const logged: unknown[][] = [];
    const handler = mod.createVerifyAdminHandler({
      getEnv: (k) => baseEnv[k],
      fetchFn: (async () => {
        throw new Error('SENSITIVE_INTERNAL_NETWORK_DETAIL');
      }) as typeof fetch,
      createSupabaseClient: makeMockSupabase(null),
      logError: (...args) => logged.push(args),
    });

    const res = await handler(
      new Request('https://test-project.supabase.co/functions/v1/verify-admin', {
        method: 'POST',
        headers: { Origin: validAppOrigin, Authorization: 'Bearer token' },
      })
    );
    const body = await res.json();
    assert.equal(res.status, 500);
    assert.equal(body.error, 'Internal server error');
    assert.equal(JSON.stringify(body).includes('SENSITIVE_INTERNAL_NETWORK_DETAIL'), false);
    assert.ok(logged.length > 0, 'Unexpected exception must be logged server-side');
  }
});

test('Admin login uses user.getIdToken(), supabase.functions.invoke("verify-admin"), and returns accurate safe diagnostics', async () => {
  const authSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/services/authService.ts'), 'utf8');
  assert.ok(
    authSrc.includes(".functions.invoke('verify-admin'"),
    'authService.ts must invoke verify-admin via supabase.functions.invoke'
  );
  assert.ok(
    authSrc.includes('user.getIdToken()'),
    'authService.ts must obtain the Firebase ID token via user.getIdToken()'
  );
  assert.equal(
    authSrc.includes('/functions/v1/verify-admin'),
    false,
    'authService.ts must not use raw fetch to /functions/v1/verify-admin'
  );

  const now = Math.floor(Date.now() / 1000);
  const validDiagnostics = {
    hasSub: true,
    hasRoleAuthenticated: true,
    emailVerified: true,
    hasNoAdminClaim: true,
    notDisabledClaim: true,
    tokenValidWindow: true,
  };

  const makeFakeUser = (overrides: Record<string, unknown> = {}) => {
    let getIdTokenCalls = 0;
    return {
      user: {
        uid: AUTHORIZED_ADMIN_UID,
        email: AUTHORIZED_ADMIN_EMAIL,
        emailVerified: true,
        async getIdToken() {
          getIdTokenCalls += 1;
          return 'fresh-firebase-id-token';
        },
        ...overrides,
      } as unknown as Parameters<typeof verifyAdminAuthorizationDetailed>[0],
      getIdTokenCalls: () => getIdTokenCalls,
    };
  };

  const makeFakeSupabase = (
    invokeImpl: (
      fnName: string,
      opts?: { method?: string; headers?: Record<string, string> }
    ) => Promise<{ data: unknown; error: unknown }>,
    rlsRecord: Record<string, unknown> | null = null,
    rlsError: { code?: string; message?: string } | null = null
  ) => {
    const invocations: Array<{ fnName: string; opts?: { method?: string; headers?: Record<string, string> } }> = [];
    let rlsQueried = false;
    return {
      invocations,
      wasRlsQueried: () => rlsQueried,
      client: {
        functions: {
          invoke: async (
            fnName: string,
            opts?: { method?: string; headers?: Record<string, string> }
          ) => {
            invocations.push({ fnName, opts });
            return invokeImpl(fnName, opts);
          },
        },
        from: (table: string) => {
          assert.equal(table, 'admin_users');
          rlsQueried = true;
          const chain = {
            select: () => chain,
            eq: () => chain,
            maybeSingle: async () => ({ data: rlsRecord, error: rlsError }),
          };
          return chain;
        },
      } as unknown as NonNullable<Parameters<typeof verifyAdminAuthorizationDetailed>[1]>['supabaseClient'],
    };
  };

  // 1. Happy path: signInAdmin trims/lowercases email, obtains user.getIdToken(), calls supabase.functions.invoke('verify-admin')
  {
    const { user, getIdTokenCalls } = makeFakeUser();
    const sb = makeFakeSupabase(async () => ({
      data: {
        authenticated: true,
        isAuthorizedAdmin: true,
        uid: AUTHORIZED_ADMIN_UID,
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Sharique Aman',
        role: 'Proprietor / Super Admin',
      },
      error: null,
    }));

    let signedInEmail = '';
    let signedOutCount = 0;
    const res = await signInAdmin(`  ${AUTHORIZED_ADMIN_EMAIL.toUpperCase()}  `, 'correct-pass', {
      firebaseConfigured: true,
      supabaseConfigured: true,
      auth: {} as never,
      supabaseClient: sb.client,
      checkRoleClaimFn: async () => ({ token: 'claim-token', diagnostics: validDiagnostics }),
      signInFn: (async (_auth, e) => {
        signedInEmail = e;
        return { user } as never;
      }) as typeof import('firebase/auth').signInWithEmailAndPassword,
      signOutFn: (async () => {
        signedOutCount += 1;
      }) as typeof import('firebase/auth').signOut,
    });

    assert.equal(signedInEmail, AUTHORIZED_ADMIN_EMAIL);
    assert.equal(getIdTokenCalls(), 1);
    assert.equal(sb.invocations.length, 1);
    assert.equal(sb.invocations[0].fnName, 'verify-admin');
    assert.equal(sb.invocations[0].opts?.method, 'POST');
    assert.equal(sb.invocations[0].opts?.headers?.Authorization, 'Bearer fresh-firebase-id-token');
    assert.equal(signedOutCount, 0);
    assert.equal(res.success, true);
    assert.equal(res.isAuthorizedAdmin, true);
    assert.equal(res.profile?.uid, AUTHORIZED_ADMIN_UID);
    assert.equal(res.profile?.email, AUTHORIZED_ADMIN_EMAIL);
    assert.equal(res.profile?.name, 'Sharique Aman');
    assert.equal(res.profile?.role, 'Proprietor / Super Admin');
  }

  // 2. Missing role='authenticated' claim fails closed with clear diagnostic & signs out before calling verify-admin
  {
    const { user } = makeFakeUser();
    const sb = makeFakeSupabase(async () => ({ data: null, error: null }));
    let signedOutCount = 0;

    const res = await signInAdmin(AUTHORIZED_ADMIN_EMAIL, 'pass', {
      firebaseConfigured: true,
      supabaseConfigured: true,
      auth: {} as never,
      supabaseClient: sb.client,
      checkRoleClaimFn: async () => ({
        token: 'token-no-role',
        diagnostics: { ...validDiagnostics, hasRoleAuthenticated: false },
      }),
      signInFn: (async () => ({ user } as never)) as typeof import('firebase/auth').signInWithEmailAndPassword,
      signOutFn: (async () => {
        signedOutCount += 1;
      }) as typeof import('firebase/auth').signOut,
    });

    assert.equal(res.success, false);
    assert.equal(res.isAuthorizedAdmin, false);
    assert.equal(signedOutCount, 1);
    assert.equal(sb.invocations.length, 0);
    assert.match(res.error || '', /authenticated/i);
    assert.equal(res.error?.includes('not the authorized Aman Computer administrator'), false);
  }

  // 3. Edge Function 403 errors (CORS Origin not allowed, inactive DB record, unverified email) never fall back to RLS
  for (const caseItem of [
    { serverMsg: 'Origin not allowed', expectedMatch: /CORS/i },
    { serverMsg: 'Access denied: Administrator record is missing or inactive.', expectedMatch: /missing or inactive/i },
    { serverMsg: 'Access denied: Administrator email address must be verified.', expectedMatch: /must be verified/i },
  ]) {
    const { user } = makeFakeUser();
    const sb = makeFakeSupabase(
      async () => ({
        data: null,
        error: new FunctionsHttpError(
          new Response(
            JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: caseItem.serverMsg }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        ),
      }),
      {
        firebase_uid: AUTHORIZED_ADMIN_UID,
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Sharique Aman',
        role: 'Proprietor / Super Admin',
        is_active: true,
      }
    );

    let signedOutCount = 0;
    const res = await signInAdmin(AUTHORIZED_ADMIN_EMAIL, 'pass', {
      firebaseConfigured: true,
      supabaseConfigured: true,
      auth: {} as never,
      supabaseClient: sb.client,
      checkRoleClaimFn: async () => ({ token: 'claim-token', diagnostics: validDiagnostics }),
      signInFn: (async () => ({ user } as never)) as typeof import('firebase/auth').signInWithEmailAndPassword,
      signOutFn: (async () => {
        signedOutCount += 1;
      }) as typeof import('firebase/auth').signOut,
    });

    assert.equal(res.success, false);
    assert.equal(signedOutCount, 1);
    assert.equal(sb.wasRlsQueried(), false, 'HTTP 403 from verify-admin must fail closed without RLS fallback');
    assert.match(res.error || '', caseItem.expectedMatch);
  }

  // 4. Edge Function 401 token rejection fails closed without RLS fallback
  {
    const { user } = makeFakeUser();
    const sb = makeFakeSupabase(async () => ({
      data: null,
      error: new FunctionsHttpError(
        new Response(JSON.stringify({ error: 'Invalid or expired Firebase ID token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      ),
    }));

    const res = await verifyAdminAuthorizationDetailed(user, {
      supabaseConfigured: true,
      supabaseClient: sb.client,
      checkRoleClaimFn: async () => ({ token: 'claim-token', diagnostics: validDiagnostics }),
    });

    assert.equal(res.authorized, false);
    assert.equal(res.reason, 'invalid-token');
    assert.equal(sb.wasRlsQueried(), false);
    assert.match(res.error || '', /token/i);
  }

  // 5. Network/Fetch error falls back to RLS and preserves accurate network/CORS diagnostic if RLS also errors
  {
    const { user } = makeFakeUser();
    const sbFail = makeFakeSupabase(
      async () => ({
        data: null,
        error: new FunctionsFetchError(new TypeError('Failed to fetch')),
      }),
      null,
      { code: '42501', message: 'permission denied' }
    );

    const failRes = await verifyAdminAuthorizationDetailed(user, {
      supabaseConfigured: true,
      supabaseClient: sbFail.client,
      checkRoleClaimFn: async () => ({ token: 'claim-token', diagnostics: validDiagnostics }),
    });

    assert.equal(failRes.authorized, false);
    assert.equal(sbFail.wasRlsQueried(), true);
    assert.equal(failRes.reason, 'network-error');
    assert.match(failRes.error || '', /verify-admin/i);

    const sbRelayRecover = makeFakeSupabase(
      async () => ({
        data: null,
        error: new FunctionsRelayError(new Response('Relay error', { status: 502 })),
      }),
      {
        firebase_uid: AUTHORIZED_ADMIN_UID,
        email: AUTHORIZED_ADMIN_EMAIL,
        name: 'Sharique Aman',
        role: 'Proprietor / Super Admin',
        is_active: true,
      }
    );

    const okRes = await verifyAdminAuthorizationDetailed(user, {
      supabaseConfigured: true,
      supabaseClient: sbRelayRecover.client,
      checkRoleClaimFn: async () => ({
        token: 'claim-token',
        diagnostics: {
          ...validDiagnostics,
          tokenValidWindow: now > 0,
        },
      }),
    });

    assert.equal(okRes.authorized, true);
    assert.equal(okRes.profile?.isAuthorized, true);
  }
});

test('Owner Profile service validates safe URLs, calculates completion, diffs changes, and strips oversized data URIs', () => {
  // 1. URL validation & XSS/unsafe protocol rejection
  assert.deepEqual(validateHttpUrl('   ', 'Website'), { valid: true, normalized: '' });
  assert.deepEqual(validateHttpUrl('https://amancomputer.in/about', 'Website'), {
    valid: true,
    normalized: 'https://amancomputer.in/about',
  });
  assert.deepEqual(validateHttpUrl('amancomputer.in', 'Website'), {
    valid: true,
    normalized: 'https://amancomputer.in/',
  });
  assert.equal(validateHttpUrl('javascript:alert(1)', 'Website').valid, false);
  assert.equal(validateHttpUrl('data:text/html,<script>alert(1)</script>', 'Website').valid, false);
  assert.equal(validateHttpUrl('https://user:secret@example.com', 'Website').valid, false);
  assert.equal(validateHttpUrl('https://bad domain.com', 'Website').valid, false);
  assert.equal(validateHttpUrl('/assets/owner.jpg', 'Website').valid, false);
  assert.deepEqual(
    validateHttpUrl('/assets/owner.jpg', 'Profile Image', { allowRelativeAsset: true }),
    { valid: true, normalized: '/assets/owner.jpg' }
  );
  assert.equal(
    validateHttpUrl('//evil.example.com/pic.jpg', 'Profile Image', { allowRelativeAsset: true }).valid,
    false
  );
  assert.equal(
    validateHttpUrl('/../secret.jpg', 'Profile Image', { allowRelativeAsset: true }).valid,
    false
  );

  // 2. Normalization strips oversized data:image URIs and provides safe fallbacks
  const hugeDataUri = 'data:image/png;base64,' + 'A'.repeat(20000);
  const normalizedFromHuge = normalizeOwnerProfile({
    fullName: '  Sharique Aman  ',
    profileImage: hugeDataUri,
    socialLinks: {
      website: 'https://amancomputer.in',
      other: [{ id: 'yt-1', label: 'YouTube', url: 'https://youtube.com/@amancomputer' }],
    },
  });
  assert.equal(normalizedFromHuge.fullName, 'Sharique Aman');
  assert.equal(normalizedFromHuge.profileImage, '');
  assert.equal(normalizedFromHuge.socialLinks.other.length, 1);

  // 3. Draft validation rejects invalid fields and permits empty optional fields
  const validDraftResult = validateOwnerProfileDraft({
    ...DEFAULT_OWNER_PROFILE,
    bio: '',
    email: '',
    phone: '',
    profileImage: '',
    socialLinks: {
      website: 'amancomputer.in',
      linkedin: '',
      instagram: '',
      facebook: '',
      other: [{ id: 'o-1', label: '', url: '' }], // blank custom rows are ignored cleanly
    },
  });
  assert.equal(validDraftResult.valid, true);
  assert.equal(validDraftResult.sanitized.socialLinks.website, 'https://amancomputer.in/');
  assert.equal(validDraftResult.sanitized.socialLinks.other.length, 0);

  const invalidDraftResult = validateOwnerProfileDraft({
    ...DEFAULT_OWNER_PROFILE,
    fullName: 'A',
    email: 'not-an-email',
    phone: '1234',
    bio: 'x'.repeat(801),
    socialLinks: {
      website: 'javascript:alert(1)',
      linkedin: '',
      instagram: '',
      facebook: '',
      other: [{ id: 'bad-1', label: 'YouTube', url: '' }],
    },
  });
  assert.equal(invalidDraftResult.valid, false);
  assert.ok(invalidDraftResult.errors.fullName);
  assert.ok(invalidDraftResult.errors.email);
  assert.ok(invalidDraftResult.errors.phone);
  assert.ok(invalidDraftResult.errors.bio);
  assert.ok(invalidDraftResult.errors.website);
  assert.ok(invalidDraftResult.errors['other.bad-1']);

  // 4. Completion score calculation & missing-field pointers
  const fullCompletion = calculateOwnerProfileCompletion({
    ...DEFAULT_OWNER_PROFILE,
    profileImage: 'https://example.supabase.co/storage/v1/object/public/media-library/owner.webp',
    socialLinks: {
      ...DEFAULT_OWNER_PROFILE.socialLinks,
      website: 'https://amancomputer.in',
    },
  });
  assert.equal(fullCompletion.percentage, 100);
  assert.equal(fullCompletion.missingFields.length, 0);

  const partialCompletion = calculateOwnerProfileCompletion({
    ...DEFAULT_OWNER_PROFILE,
    bio: 'Too short',
    profileImage: '',
    socialLinks: {
      website: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      other: [],
    },
  });
  assert.equal(partialCompletion.completedCount, 5);
  assert.equal(partialCompletion.totalCount, 8);
  assert.equal(partialCompletion.percentage, 63);
  assert.deepEqual(
    partialCompletion.missingFields.map((m) => m.key),
    ['profileImage', 'bio', 'socialLinks']
  );

  // 5. Initials & field-by-field preview diffing
  assert.equal(getOwnerProfileInitials('Sharique Aman'), 'SA');
  assert.equal(getOwnerProfileInitials('Aman'), 'A');
  assert.equal(
    getOwnerProfileChanges(DEFAULT_OWNER_PROFILE, { ...DEFAULT_OWNER_PROFILE }).length,
    0
  );
  const diff = getOwnerProfileChanges(DEFAULT_OWNER_PROFILE, {
    ...DEFAULT_OWNER_PROFILE,
    designation: 'Director & Lead Architect',
    socialLinks: {
      ...DEFAULT_OWNER_PROFILE.socialLinks,
      instagram: 'https://instagram.com/amancomputer',
    },
  });
  assert.deepEqual(
    diff.map((d) => d.field),
    ['Designation', 'Instagram Link']
  );
});

test('Luxury Editorial dashboard shell uses warm gold (#C9A96E) and matte obsidian (#101014 / #0A0A0E) with zero #C6A56B or champagne leakage', () => {
  const studioShellFiles = [
    'admin.html',
    'src/index.css',
    'src/admin/App.tsx',
    'src/admin/components/Sidebar.tsx',
    'src/admin/components/TopBar.tsx',
    'src/admin/components/GlobalSearchModal.tsx',
    'src/admin/components/StateViews.tsx',
    'src/admin/components/ToastContainer.tsx',
    'src/admin/components/CmsPrimitives.tsx',
    'src/admin/components/ServiceModal.tsx',
    'src/admin/components/EnquiryDetailDrawer.tsx',
    'src/admin/components/three/StudioCanvasWrapper.tsx',
    'src/admin/components/three/StudioAmbientCanvas.tsx',
    'src/admin/views/OverviewView.tsx',
    'src/admin/views/OwnerProfileView.tsx',
    'src/admin/views/HeroManagerView.tsx',
    'src/admin/views/BrandSettingsView.tsx',
    'src/admin/views/GovernmentSchemesView.tsx',
    'src/admin/views/WebsiteSettingsView.tsx',
    'src/admin/views/SeoManagerView.tsx',
    'src/admin/views/LatestUpdatesView.tsx',
    'src/admin/views/DocumentRequirementsView.tsx',
    'src/admin/views/ServicesView.tsx',
    'src/admin/views/GalleryView.tsx',
    'src/admin/views/JourneyManagementView.tsx',
    'src/admin/views/WebsiteContentView.tsx',
    'src/admin/views/FaqView.tsx',
    'src/admin/views/BusinessProfileView.tsx',
    'src/admin/views/EnquiriesView.tsx',
    'src/admin/views/CustomersView.tsx',
    'src/admin/views/MediaLibraryView.tsx',
    'src/admin/views/ActivityLogsView.tsx',
  ];

  for (const relPath of studioShellFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.equal(
      /#C6A56B/i.test(content) || /\bchampagne\b/i.test(content),
      false,
      `Studio file ${relPath} must not retain #C6A56B or champagne palette tokens`
    );
  }

  const sidebarSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/components/Sidebar.tsx'), 'utf8');
  assert.ok(sidebarSrc.includes('#101014'));
  assert.ok(sidebarSrc.includes('#C9A96E'));
  assert.ok(sidebarSrc.includes('#211B16'));

  const appSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/App.tsx'), 'utf8');
  assert.ok(appSrc.includes("case 'owner-profile':"));
  assert.ok(appSrc.includes('<OwnerProfileView />'));
  assert.ok(appSrc.includes('<GovernmentSchemesView />'));
  assert.ok(appSrc.includes('<HeroManagerView'));

  const ownerViewSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/views/OwnerProfileView.tsx'), 'utf8');
  assert.ok(ownerViewSrc.includes("uploadFileToStorage('media-library', file, 'owner-profile', 'image')"));
  assert.equal(ownerViewSrc.includes('admin_users'), false, 'OwnerProfileView must not issue direct mutations to admin_users');
});

test('Phase 2.5 clean copy guard ensures all owner-facing dashboard UI excludes backend/developer jargon and exposes no UIDs', () => {
  const uiFiles = [
    'admin.html',
    'src/admin/App.tsx',
    'src/admin/components/Sidebar.tsx',
    'src/admin/components/TopBar.tsx',
    'src/admin/components/GlobalSearchModal.tsx',
    'src/admin/components/StateViews.tsx',
    'src/admin/components/ToastContainer.tsx',
    'src/admin/components/CmsPrimitives.tsx',
    'src/admin/components/ServiceModal.tsx',
    'src/admin/components/EnquiryDetailDrawer.tsx',
    'src/admin/views/OverviewView.tsx',
    'src/admin/views/OwnerProfileView.tsx',
    'src/admin/views/HeroManagerView.tsx',
    'src/admin/views/BrandSettingsView.tsx',
    'src/admin/views/GovernmentSchemesView.tsx',
    'src/admin/views/WebsiteSettingsView.tsx',
    'src/admin/views/SeoManagerView.tsx',
    'src/admin/views/LatestUpdatesView.tsx',
    'src/admin/views/DocumentRequirementsView.tsx',
    'src/admin/views/ServicesView.tsx',
    'src/admin/views/GalleryView.tsx',
    'src/admin/views/JourneyManagementView.tsx',
    'src/admin/views/WebsiteContentView.tsx',
    'src/admin/views/FaqView.tsx',
    'src/admin/views/BusinessProfileView.tsx',
    'src/admin/views/EnquiriesView.tsx',
    'src/admin/views/CustomersView.tsx',
    'src/admin/views/MediaLibraryView.tsx',
    'src/admin/views/ActivityLogsView.tsx',
    'src/admin/config/navigation.ts',
    'src/admin/data/phase1MockPreview.ts',
  ];

  const bannedUiCopyPatterns = [
    /Firebase Spark/i,
    /PostgreSQL/i,
    /\bRLS\b/,
    /\bCRUD\b/,
    /\bJSONB\b/,
    /Storage bucket/i,
    /Single-Admin Session/i,
    /Single-Admin Security Lock/i,
    /UID Lock/i,
    /Sole Admin UID/i,
    /Yr0Wr7PuuAdOIMaqohmqaINNbNC2/,
    /VITE_SUPABASE_/,
  ];

  for (const relPath of uiFiles) {
    const raw = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    const content = raw.replace(/\/\/.*$/gm, '');
    for (const pattern of bannedUiCopyPatterns) {
      assert.equal(
        pattern.test(content),
        false,
        `Banned technical UI copy (${pattern}) detected in ${relPath}`
      );
    }
  }

  const ownerViewSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/views/OwnerProfileView.tsx'), 'utf8');
  assert.ok(ownerViewSrc.includes('Owner Account Protection'));
  assert.ok(ownerViewSrc.includes('Online Sync Status'));
  assert.ok(ownerViewSrc.includes('Profile Completeness'));
  assert.ok(ownerViewSrc.includes('Public Contact Information'));
  assert.ok(ownerViewSrc.includes('Online Presence'));
  assert.ok(ownerViewSrc.includes('Image URL (Optional)'));
});

test('Master CMS navigation hierarchy has 23 unique leaf routes, excludes legacy modules, and deduplicates Gallery & Latest Updates', () => {
  assert.equal(ALL_STUDIO_NAV_ITEMS.length, 23);

  const ids = ALL_STUDIO_NAV_ITEMS.map((item) => item.id);
  assert.equal(new Set(ids).size, 23);

  // Gallery and Latest Updates must exist ONLY inside Doors Management
  const doorsItem = STUDIO_NAV_GROUPS
    .flatMap((g) => g.items)
    .find((i) => i.id === 'doors-management');
  assert.ok(doorsItem && Array.isArray(doorsItem.children));
  const doorChildIds = doorsItem.children.map((c) => c.id);
  assert.deepEqual(doorChildIds, ['latest-updates', 'doc-requirements', 'services', 'gallery']);
  assert.equal(ids.filter((id) => id === 'gallery').length, 1);
  assert.equal(ids.filter((id) => id === 'latest-updates').length, 1);

  // Excluded legacy routes resolve cleanly to safe destinations
  const excludedTabs: AdminTab[] = ['reports', 'settings', 'backup-restore', 'receipts', 'staff', 'testimonials'];
  for (const legacyTab of excludedTabs) {
    assert.equal(resolveStudioTab(legacyTab), 'overview');
  }
  assert.equal(resolveStudioTab('hero-section'), 'hero-headline');
  assert.equal(resolveStudioTab('four-doors'), 'services');
  assert.equal(resolveStudioTab('website-content'), 'content-about');
});

test('Master CMS storage extraction, scheme/journey mappers, WebsiteContent defaults, and SQL migration schema', () => {
  const pubLoc = extractStorageLocationFromUrl(
    'https://demo.supabase.co/storage/v1/object/public/gallery-images/hero-portrait/1700000000-photo.webp'
  );
  assert.deepEqual(pubLoc, {
    bucket: 'gallery-images',
    path: 'hero-portrait/1700000000-photo.webp',
  });

  const signedLoc = extractStorageLocationFromUrl(
    'https://demo.supabase.co/storage/v1/object/sign/media-library/journey/m1.png?token=abc'
  );
  assert.deepEqual(signedLoc, {
    bucket: 'media-library',
    path: 'journey/m1.png',
  });

  assert.equal(extractStorageLocationFromUrl('https://example.com/other.jpg'), null);
  assert.equal(extractStorageLocationFromUrl('data:image/png;base64,AAA'), null);

  const scheme = mapGovernmentSchemeRow({
    id: 'sch-1',
    title: 'PM Vishwakarma Yojana',
    category: 'Central Scheme',
    department: 'Ministry of MSME',
    short_description: 'Artisan support scheme',
    eligibility: 'Registered artisans',
    benefits: 'Skill training + collateral-free credit',
    required_documents: ['Aadhaar', 'Bank Passbook'],
    application_mode: 'CSC / Aman Computer',
    last_date: 'Open Year-Round',
    official_link: 'https://pmvishwakarma.gov.in',
    poster_image: '',
    status: 'Active',
    featured: true,
    published: true,
    display_order: 1,
  });
  assert.equal(scheme.id, 'sch-1');
  assert.equal(scheme.requiredDocuments.length, 2);
  assert.equal(scheme.published, true);
  assert.equal(scheme.featured, true);

  const journey = mapJourneyRow({
    id: 'j-1',
    year: '2026',
    month: 'November',
    date: 'Nov 2026',
    title: 'New Portal Desk',
    image_url: 'https://demo.supabase.co/storage/v1/object/public/gallery-images/journey/j1.webp',
    bullets: ['Fast forms'],
    published: true,
    display_order: 2,
  });
  assert.equal(
    journey.imageUrl,
    'https://demo.supabase.co/storage/v1/object/public/gallery-images/journey/j1.webp'
  );
  assert.equal(journey.displayOrder, 2);

  assert.equal(INITIAL_WEBSITE_CONTENT.ownerPortrait?.visible, false);
  assert.equal(INITIAL_WEBSITE_CONTENT.ownerPortrait?.imageUrl, '');
  assert.equal(INITIAL_WEBSITE_CONTENT.doorsConfig?.door3.title, 'Gallery');
  assert.equal(INITIAL_WEBSITE_CONTENT.websiteSettings?.maintenanceMode, false);

  const migrationSql = fs.readFileSync(
    path.join(ROOT_DIR, 'supabase/migrations/20261115120000_master_cms_extensions.sql'),
    'utf8'
  );
  assert.ok(migrationSql.includes('CREATE TABLE IF NOT EXISTS public.government_schemes'));
  assert.ok(migrationSql.includes('ADD COLUMN IF NOT EXISTS image_url TEXT'));
  assert.ok(migrationSql.includes('public.is_admin()'));
});

test('Public storefront and door subpages contain no Rishi Thakor branding, dead portrait embeds, or Photographer leak', () => {
  const publicHtmlFiles = [
    'index.html',
    'public/home/index.html',
    'public/web-developer/index.html',
    'public/app-developer/index.html',
    'public/ui-ux-designer/index.html',
    'public/graphic-designer/index.html',
  ];

  for (const relPath of publicHtmlFiles) {
    const html = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf8');
    assert.equal(/therishithakor/i.test(html), false, `${relPath} must not reference therishithakor`);
    assert.equal(/G-12PNLHKGHK/.test(html), false, `${relPath} must not contain Rishi GA tracking ID`);
    assert.equal(/rishithakor218@gmail\.com/i.test(html), false, `${relPath} must not contain Rishi email`);
  }

  const homeHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.equal(homeHtml.includes('id="figBase"'), false);
  assert.equal(homeHtml.includes('id="holo"'), false);
  assert.equal(homeHtml.includes('data-door="4"'), false);
  assert.ok(homeHtml.includes('data-door="3"'));
  assert.ok(homeHtml.includes('id="schemes"'));
  assert.ok(homeHtml.includes('id="amanMaintenance"'));
  assert.ok(homeHtml.includes('id="amanAnnouncement"'));
  assert.ok(homeHtml.includes('id="fig" hidden'));
});

test('Live Supabase connectivity check (conditional on environment credentials)', async (t) => {
  if (!isSupabaseConfigured()) {
    t.skip('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY not configured in current environment');
    return;
  }

  const conn = await testSupabaseConnection();
  assert.equal(conn.ok, true, `Supabase connection failed: ${conn.error}`);
});

test('Hero content limits, exact copy defaults, whitespace trimming without silent truncation, and strict boundary validation', async () => {
  assert.deepEqual(HERO_CONTENT_LIMITS, {
    headline: 45,
    subheadline: 65,
    description: 180,
  });
  assert.deepEqual(HERO_MOBILE_LINE_LIMITS, {
    headline: 3,
    subheadline: 2,
    description: 4,
  });

  // Refined official copy matches defaults and stays safely within character limits
  assert.equal(HERO_DEFAULT_COPY.headline, 'Your Trusted Digital Partner');
  assert.equal(HERO_DEFAULT_COPY.subheadline, 'Fast, Reliable & Professional Digital Services.');
  assert.equal(
    HERO_DEFAULT_COPY.description,
    'From online applications and PAN services to Aadhaar assistance, photo studio and printing — all your digital needs, under one roof.'
  );
  assert.equal(INITIAL_WEBSITE_CONTENT.hero.headline, HERO_DEFAULT_COPY.headline);
  assert.equal(INITIAL_WEBSITE_CONTENT.hero.subheadline, HERO_DEFAULT_COPY.subheadline);
  assert.equal(INITIAL_WEBSITE_CONTENT.hero.description, HERO_DEFAULT_COPY.description);

  assert.equal(normalizeHeroText('  Your \n\t  Trusted   Partner  '), 'Your Trusted Partner');

  const defaultCheck = validateHeroContent(INITIAL_WEBSITE_CONTENT.hero);
  assert.equal(defaultCheck.valid, true);
  assert.deepEqual(defaultCheck.errors, {});
  assert.equal(isLegacyOversizedHero(INITIAL_WEBSITE_CONTENT.hero), false);

  // Exact upper boundaries (45, 65, 180) must pass
  const exactMaxResult = validateHeroContent({
    headline: 'A'.repeat(45),
    subheadline: 'B'.repeat(65),
    description: 'C'.repeat(180),
  });
  assert.equal(exactMaxResult.valid, true);
  assert.equal(exactMaxResult.sanitized.headline.length, 45);
  assert.equal(exactMaxResult.sanitized.subheadline.length, 65);
  assert.equal(exactMaxResult.sanitized.description?.length, 180);

  // Leading/trailing and repeated spaces collapse cleanly without silent truncation
  const paddedWithinLimit = validateHeroContent({
    headline: '   Your   Trusted   Digital   Partner  ',
    subheadline: '  Fast, Reliable &   Professional Digital Services. ',
    description: '  Fast   help   for   PAN,   Aadhaar   and   printing.  ',
  });
  assert.equal(paddedWithinLimit.valid, true);
  assert.equal(paddedWithinLimit.sanitized.headline, 'Your Trusted Digital Partner');
  assert.equal(paddedWithinLimit.sanitized.subheadline, 'Fast, Reliable & Professional Digital Services.');
  assert.equal(paddedWithinLimit.sanitized.description, 'Fast help for PAN, Aadhaar and printing.');

  // Exceeding bounds (46, 66, 181) MUST fail validation and NEVER silently truncate
  const overHead = 'X'.repeat(46);
  const overSub = 'Y'.repeat(66);
  const overDesc = 'Z'.repeat(181);
  const overResult = validateHeroContent({
    headline: overHead,
    subheadline: overSub,
    description: overDesc,
  });
  assert.equal(overResult.valid, false);
  assert.ok(overResult.errors.headline?.includes('45'));
  assert.ok(overResult.errors.subheadline?.includes('65'));
  assert.ok(overResult.errors.description?.includes('180'));
  assert.equal(overResult.sanitized.headline.length, 46, 'Must not silently truncate headline');
  assert.equal(overResult.sanitized.subheadline.length, 66, 'Must not silently truncate subheadline');
  assert.equal(overResult.sanitized.description?.length, 181, 'Must not silently truncate description');

  // Whitespace-only / empty values must fail required validation
  const emptyResult = validateHeroContent({
    headline: '    ',
    subheadline: '\n\t',
    description: '',
  });
  assert.equal(emptyResult.valid, false);
  assert.ok(emptyResult.errors.headline);
  assert.ok(emptyResult.errors.subheadline);
  assert.ok(emptyResult.errors.description);

  // Legacy oversized copy detection
  assert.equal(
    isLegacyOversizedHero({
      headline: 'Welcome to Aman Computer.',
      subheadline: 'Your one-stop center for CSC, PAN, Aadhaar & Studio.',
      description: 'Aman Computer is your local neighborhood digital partner.',
    }),
    true
  );

  // Backend save pre-check & dbSaveWebsiteContent rejection + unrelated section preservation
  const invalidPayload = {
    ...INITIAL_WEBSITE_CONTENT,
    hero: {
      ...INITIAL_WEBSITE_CONTENT.hero,
      headline: 'H'.repeat(46),
    },
  };
  const preFail = validateWebsiteContentBeforeSave(invalidPayload);
  assert.equal(preFail.ok, false);
  assert.ok(preFail.error?.includes('45'));

  const dbSaveRejected = await dbSaveWebsiteContent(invalidPayload);
  assert.equal(dbSaveRejected.ok, false);
  assert.ok(dbSaveRejected.error?.includes('45'));

  // Saving unrelated sections with skipHeroValidation preserves existing data cleanly
  const unrelatedSaveCheck = validateWebsiteContentBeforeSave(invalidPayload, { skipHeroValidation: true });
  assert.equal(unrelatedSaveCheck.ok, true);
  assert.equal(unrelatedSaveCheck.sanitizedContent.about.heading, INITIAL_WEBSITE_CONTENT.about.heading);
  assert.equal(unrelatedSaveCheck.sanitizedContent.brandSettings?.shopName, INITIAL_WEBSITE_CONTENT.brandSettings?.shopName);
  assert.equal(unrelatedSaveCheck.sanitizedContent.seoSettings?.pageTitle, INITIAL_WEBSITE_CONTENT.seoSettings?.pageTitle);
});

test('Public hero HTML, synced home mirror, Admin HeroManagerView, and SQL trigger meet responsive typography & limits', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const homeHtml = fs.readFileSync(path.join(ROOT_DIR, 'public/home/index.html'), 'utf8');
  assert.equal(indexHtml, homeHtml, 'index.html and public/home/index.html must remain byte-for-byte synchronized');

  // Refined copy and semantic structure in public HTML
  assert.ok(indexHtml.includes('id="heroHeadline"'));
  assert.ok(indexHtml.includes('id="heroSubheadline"'));
  assert.ok(indexHtml.includes('id="heroDescription"'));
  assert.ok(indexHtml.includes('Your Trusted Digital Partner'));
  assert.ok(indexHtml.includes('Fast, Reliable &amp; Professional Digital Services.') || indexHtml.includes('Fast, Reliable & Professional Digital Services.'));
  assert.ok(indexHtml.includes('From online applications and PAN services to Aadhaar assistance, photo studio and printing'));

  // Responsive clamp() tokens and breakpoints
  assert.ok(indexHtml.includes('--hero-fs-main'));
  assert.ok(indexHtml.includes('--hero-fs-sub'));
  assert.ok(indexHtml.includes('--hero-fs-desc'));
  assert.ok(indexHtml.includes('clamp('));
  assert.ok(indexHtml.includes('hero--no-fig'));

  // No oversized legacy headline stub left in index.html markup
  assert.equal(indexHtml.includes('Your Trust, Our Service — Fast, Honest & 100% Reliable Digital Services.'), false);

  // Admin HeroManagerView includes character limits, preview viewport switcher, and line warnings
  const heroAdminSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/views/HeroManagerView.tsx'), 'utf8');
  assert.ok(heroAdminSrc.includes('HERO_CONTENT_LIMITS'));
  assert.ok(heroAdminSrc.includes('HERO_MOBILE_LINE_LIMITS'));
  assert.ok(heroAdminSrc.includes('validateHeroContent'));
  assert.ok(heroAdminSrc.includes('Mobile (390px)') || heroAdminSrc.includes('390px'));
  assert.ok(heroAdminSrc.includes('Tablet (768px)') || heroAdminSrc.includes('768px'));
  assert.ok(heroAdminSrc.includes('Desktop'));

  // SQL backend trigger migration preserves existing schema & RLS and enforces exact 45/65/180 limits
  const heroTriggerSql = fs.readFileSync(
    path.join(ROOT_DIR, 'supabase/migrations/20261117000000_validate_hero_content_limits.sql'),
    'utf8'
  );
  assert.ok(heroTriggerSql.includes('CREATE OR REPLACE FUNCTION public.validate_website_content_hero()'));
  assert.ok(heroTriggerSql.includes('char_length(v_headline) = 0 OR char_length(v_headline) > 45'));
  assert.ok(heroTriggerSql.includes('char_length(v_subheadline) = 0 OR char_length(v_subheadline) > 65'));
  assert.ok(heroTriggerSql.includes('char_length(v_description) = 0 OR char_length(v_description) > 180'));
  assert.equal(/DROP TABLE/i.test(heroTriggerSql), false);
  assert.equal(/DROP POLICY/i.test(heroTriggerSql), false);
});

test('Aman Computer repository consolidation: zero Rishi portfolio remnants, clean routes/SEO/docs, XSS URL hardening & truthful persistence', () => {
  // Removed portfolio directories & orphan entrypoints must not exist
  const removedPaths = [
    'index.react.html',
    'src/main.tsx',
    'src/App.tsx',
    'src/components',
    'src/data',
    'src/types',
    'src/assets',
    'public/photographer',
    'public/ability-card',
    'public/card',
    'public/assets',
  ];
  for (const rel of removedPaths) {
    assert.equal(fs.existsSync(path.join(ROOT_DIR, rel)), false, `${rel} should be removed`);
  }

  // Required consolidated files & metadata
  const metadata = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'metadata.json'), 'utf8'));
  assert.match(metadata.name, /Aman Computer/i);
  assert.equal(/Rishi Thakor/i.test(JSON.stringify(metadata)), false);

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
  assert.equal(pkg.name, 'aman-computer-portal');
  assert.equal(Boolean(pkg.dependencies?.express), false);
  assert.equal(Boolean(pkg.dependencies?.dotenv), false);
  assert.equal(Boolean(pkg.dependencies?.['@google/genai']), false);

  const licensesTxt = fs.readFileSync(path.join(ROOT_DIR, 'public/legal/licenses.txt'), 'utf8');
  assert.match(licensesTxt, /\(c\) Aman Computer/i);
  assert.equal(/Rishi Thakor/i.test(licensesTxt), false);
  assert.equal(/ThreeUI/i.test(licensesTxt), false);
  assert.match(licensesTxt, /three\.js/i);
  assert.match(licensesTxt, /Lenis/i);
  assert.match(licensesTxt, /Onest/i);

  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'public/404.html')), true);
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'README.md')), true);
  const sitemapXml = fs.readFileSync(path.join(ROOT_DIR, 'public/sitemap.xml'), 'utf8');
  assert.match(sitemapXml, /<loc>https:\/\//);
  assert.equal(/photographer|ability-card/i.test(sitemapXml), false);
  const robotsTxt = fs.readFileSync(path.join(ROOT_DIR, 'public/robots.txt'), 'utf8');
  assert.match(robotsTxt, /Disallow:\s*\/admin/);

  // Zero legacy rishi-mode / rt_dark_mode keys in HTML pages
  const htmlFilesToCheck = [
    'index.html',
    'public/home/index.html',
    'public/web-developer/index.html',
    'public/app-developer/index.html',
    'public/ui-ux-designer/index.html',
    'public/graphic-designer/index.html',
    'public/legal/index.html',
    'public/privacy-policy/index.html',
    'public/terms-and-conditions/index.html',
  ];
  for (const rel of htmlFilesToCheck) {
    const html = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(html.includes('rishi-mode'), false, `${rel} must not contain rishi-mode`);
    assert.equal(html.includes('rt_dark_mode'), false, `${rel} must not contain rt_dark_mode`);
  }

  // XSS URL validation & storefront enquiry wiring
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('safeHttpUrl('));
  assert.ok(indexHtml.includes('id="publicEnquiryForm"'));
  assert.ok(indexHtml.includes('window.__submitAmanEnquiry'));

  const door0Html = fs.readFileSync(path.join(ROOT_DIR, 'public/web-developer/index.html'), 'utf8');
  const door3Html = fs.readFileSync(path.join(ROOT_DIR, 'public/graphic-designer/index.html'), 'utf8');
  assert.ok(door0Html.includes('safeHttpUrl('));
  assert.ok(door3Html.includes('safeHttpUrl('));

  // Public sync & AdminContext truthful persistence checks
  const publicSyncTs = fs.readFileSync(path.join(ROOT_DIR, 'src/lib/publicSync.ts'), 'utf8');
  assert.ok(publicSyncTs.includes('sanitizePublicUrl'));
  assert.ok(publicSyncTs.includes('__submitAmanEnquiry'));

  const adminCtxTs = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/context/AdminContext.tsx'), 'utf8');
  assert.ok(adminCtxTs.includes('dbSaveWebsiteContent(nextContent, { skipHeroValidation: true })'));
  assert.ok(adminCtxTs.includes('Promise<boolean>'));
});

test('Contextual drag-and-drop deep security validation rejects spoofed MIME types, executables, double extensions, and enforces per-field rules', async () => {
  const validJpgBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const validWebpBytes = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  ]);
  const validPdfBytes = new TextEncoder().encode('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF');
  const mzExeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00]);

  const makeTestFile = (bytes: Uint8Array, name: string, type: string, sizeOverride?: number): File => {
    const ab: ArrayBuffer = bytes.slice().buffer;
    const file = new File([ab], name, { type });
    if (typeof sizeOverride === 'number') {
      Object.defineProperty(file, 'size', { value: sizeOverride });
    }
    return file;
  };

  // 1-4: Valid JPG, JPEG, PNG, WebP
  assert.equal((await validateFileDeep(makeTestFile(validJpgBytes, 'photo.jpg', 'image/jpeg'), { category: 'image' })).valid, true);
  assert.equal((await validateFileDeep(makeTestFile(validJpgBytes, 'photo.jpeg', 'image/jpeg'), { category: 'image' })).valid, true);
  assert.equal((await validateFileDeep(makeTestFile(validPngBytes, 'logo.png', 'image/png'), { category: 'brand-logo' })).valid, true);
  assert.equal((await validateFileDeep(makeTestFile(validWebpBytes, 'banner.webp', 'image/webp'), { category: 'image' })).valid, true);

  // 5: Valid PDF in document fields
  assert.equal((await validateFileDeep(makeTestFile(validPdfBytes, 'form49a.pdf', 'application/pdf'), { category: 'document' })).valid, true);
  assert.equal(
    (
      await validateFileDeep(makeTestFile(validPdfBytes, 'affidavit.pdf', 'application/pdf'), {
        category: 'media-library-dynamic',
        dynamicSubcategory: 'document-template',
      })
    ).valid,
    true
  );

  // 6: Invalid PDF dropped into image / logo field
  const pdfInImage = await validateFileDeep(makeTestFile(validPdfBytes, 'doc.pdf', 'application/pdf'), { category: 'image' });
  assert.equal(pdfInImage.valid, false);
  assert.match(pdfInImage.rejectionReason || '', /PDF files are not supported/i);

  // 7: Invalid JPG dropped into PDF/document-only field
  const jpgInDoc = await validateFileDeep(makeTestFile(validJpgBytes, 'scan.jpg', 'image/jpeg'), {
    category: 'media-library-dynamic',
    dynamicSubcategory: 'document-template',
  });
  assert.equal(jpgInDoc.valid, false);
  assert.match(jpgInDoc.rejectionReason || '', /image files are not supported/i);

  // 8: EXE, APK, JS, HTML, PHP rejected
  for (const [name, mime, payload] of [
    ['installer.exe', 'application/x-msdownload', mzExeBytes],
    ['app.apk', 'application/vnd.android.package-archive', new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00])],
    ['payload.js', 'application/javascript', new TextEncoder().encode('alert(1)')],
    ['evil.html', 'text/html', new TextEncoder().encode('<html><script>alert(1)</script></html>')],
    ['shell.php', 'application/x-httpd-php', new TextEncoder().encode('<?php system($_GET["c"]); ?>')],
  ] as const) {
    const res = await validateFileDeep(makeTestFile(payload, name, mime), { category: 'document' });
    assert.equal(res.valid, false, `${name} must be rejected`);
    assert.match(res.rejectionReason || '', /prohibited|not supported/i);
  }

  // 9: Oversized files rejected (favicon max 2 MB, image max 5 MB, doc max 10 MB)
  const hugeFavicon = await validateFileDeep(
    makeTestFile(validPngBytes, 'fav.png', 'image/png', 2 * 1024 * 1024 + 1),
    { category: 'favicon' }
  );
  assert.equal(hugeFavicon.valid, false);
  assert.match(hugeFavicon.rejectionReason || '', /2 MB/i);

  const hugeImage = await validateFileDeep(
    makeTestFile(validPngBytes, 'big.png', 'image/png', 5 * 1024 * 1024 + 1),
    { category: 'image' }
  );
  assert.equal(hugeImage.valid, false);
  assert.match(hugeImage.rejectionReason || '', /5 MB/i);

  // 10: Spoofed MIME & signature mismatch (e.g. EXE or PDF renamed to fake.jpg with image/jpeg MIME)
  const spoofedExeAsJpg = await validateFileDeep(makeTestFile(mzExeBytes, 'avatar.jpg', 'image/jpeg'), { category: 'image' });
  assert.equal(spoofedExeAsJpg.valid, false);
  assert.match(spoofedExeAsJpg.rejectionReason || '', /executable binary header/i);

  const spoofedPdfAsJpg = await validateFileDeep(makeTestFile(validPdfBytes, 'fake.jpg', 'image/jpeg'), { category: 'image' });
  assert.equal(spoofedPdfAsJpg.valid, false);
  assert.match(spoofedPdfAsJpg.rejectionReason || '', /PDF files are not supported/i);

  const spoofedHtmlAsPng = await validateFileDeep(
    makeTestFile(new TextEncoder().encode('<!doctype html><script>alert(1)</script>'), 'trick.png', 'image/png'),
    { category: 'image' }
  );
  assert.equal(spoofedHtmlAsPng.valid, false);
  assert.match(spoofedHtmlAsPng.rejectionReason || '', /active HTML|signature|declared/i);

  // 11: Empty / corrupted 0-byte and truncated PDF
  assert.equal((await validateFileDeep(makeTestFile(new Uint8Array(0), 'empty.png', 'image/png'), { category: 'image' })).valid, false);
  assert.equal((await validateFileDeep(makeTestFile(new TextEncoder().encode('%PDF-1.4'), 'short.pdf', 'application/pdf'), { category: 'document' })).valid, false);

  // Double extension & path traversal security checks
  assert.equal(inspectFilenameSecurity('invoice.exe.pdf').safe, false);
  assert.equal(inspectFilenameSecurity('photo.php.png').safe, false);
  assert.equal(inspectFilenameSecurity('../../etc/passwd.png').safe, false);
  assert.equal(detectMagicBytes(mzExeBytes).type, 'exe');

  // 12: Multi-file batch validation (mixed valid + invalid, duplicates, max count)
  const batch = await validateFilesBatch(
    [
      makeTestFile(validJpgBytes, 'good1.jpg', 'image/jpeg'),
      makeTestFile(validPdfBytes, 'bad1.pdf', 'application/pdf'),
      makeTestFile(validJpgBytes, 'good1.jpg', 'image/jpeg'),
      makeTestFile(validPngBytes, 'good2.png', 'image/png'),
    ],
    { category: 'image' },
    { maxFiles: 2 }
  );
  assert.equal(batch.validFiles.length, 2);
  assert.equal(batch.rejectedFiles.length, 2);
  assert.ok(batch.countExceededError);
  assert.match(batch.rejectedFiles[0].reason, /PDF/i);
  assert.match(batch.rejectedFiles[1].reason, /Duplicate/i);

  // Safe storage object keys & safe URL preview guards
  const objPath = buildSafeStorageObjectPath('../../../evil file name?.png', 'gallery');
  assert.equal(objPath.includes('..'), false);
  assert.ok(objPath.startsWith('gallery/'));
  assert.equal(isSafeAssetUrl('javascript:alert(1)'), false);
  assert.equal(isSafeAssetUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(isSafeAssetUrl('data:image/svg+xml,<svg onload=alert(1)/>'), false);
  assert.equal(isSafeAssetUrl('/assets/aistudio/logo.svg'), true);
  assert.equal(isSafeAssetUrl('https://demo.supabase.co/storage/v1/object/public/gallery-images/p.webp'), true);

  // Strict drop-zone boundary guard: ContextualDropZone must NOT register window/document drag/drop listeners
  const dropZoneSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/components/ContextualDropZone.tsx'), 'utf8');
  assert.equal(dropZoneSrc.includes('window.addEventListener'), false, 'Must not register global window upload handlers');
  assert.equal(dropZoneSrc.includes('document.addEventListener'), false, 'Must not register global document upload handlers');
  assert.ok(dropZoneSrc.includes('data-upload-zone='));

  // BrandSettingsView, MediaLibraryView, and OwnerProfileView contextual configurations
  const brandSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/views/BrandSettingsView.tsx'), 'utf8');
  assert.ok(brandSrc.includes('category="brand-logo"'));
  assert.ok(brandSrc.includes('category="favicon"'));

  const mediaSrc = fs.readFileSync(path.join(ROOT_DIR, 'src/admin/views/MediaLibraryView.tsx'), 'utf8');
  assert.ok(mediaSrc.includes('<ContextualDropZone'));
  assert.ok(mediaSrc.includes("category: 'media-library-dynamic'"));
});


