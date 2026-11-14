import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

import { isFirebaseConfigured } from '../src/lib/firebase.ts';
import { isSupabaseConfigured, testSupabaseConnection, getRefreshedSupabaseAccessToken } from '../src/lib/supabase.ts';
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
  MAX_IMAGE_SIZE,
  MAX_DOC_SIZE,
} from '../src/admin/services/storageService.ts';
import {
  toIsoTimestamp,
  mapCustomerRow,
  mapServiceRow,
  mapUpdateRow,
  mapDocRequirementRow,
  mapGalleryRow,
  mapJourneyRow,
} from '../src/admin/services/supabaseService.ts';
import {
  syncPublicCollectionResult,
  validatePublicEnquiryPayload,
  submitPublicEnquiry,
  resetPublicEnquiryCooldownForTest,
} from '../src/lib/publicSync.ts';

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
  // 1. Ensure no paid Firebase Cloud Functions / Identity Platform artifacts remain
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'firebase.json')), false, 'firebase.json must not exist in Spark-only architecture');
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

test('Live Supabase connectivity check (conditional on environment credentials)', async (t) => {
  if (!isSupabaseConfigured()) {
    t.skip('VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY not configured in current environment');
    return;
  }

  const conn = await testSupabaseConnection();
  assert.equal(conn.ok, true, `Supabase connection failed: ${conn.error}`);
});
