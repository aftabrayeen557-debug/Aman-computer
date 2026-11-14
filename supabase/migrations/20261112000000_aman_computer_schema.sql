-- =============================================================================
-- AMAN COMPUTER CYBER CAFE & DIGITAL CENTER
-- PRODUCTION POSTGRESQL SCHEMA, ZERO-TRUST RLS POLICIES & STORAGE BUCKETS
-- Compatible with Firebase Auth (Third-Party Auth) -> Supabase PostgREST RLS
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. FIREBASE JWT & ADMIN AUTHORIZATION HELPER FUNCTIONS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.firebase_uid()
RETURNS TEXT
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT NULLIF(auth.jwt() ->> 'sub', '')::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.firebase_email()
RETURNS TEXT
LANGUAGE SQL
STABLE
SET search_path = public
AS $$
  SELECT NULLIF(LOWER(auth.jwt() ->> 'email'), '')::TEXT;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_claims JSONB;
  uid_val TEXT;
  email_val TEXT;
  jwt_role TEXT;
  is_disabled_claim BOOLEAN;
  authorized_uid CONSTANT TEXT := 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
  authorized_email CONSTANT TEXT := 'shariqueaman77@gmail.com';
BEGIN
  jwt_claims := auth.jwt();
  IF jwt_claims IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Reject anonymous or unauthenticated roles even if partial claims exist
  IF auth.role() = 'anon' THEN
    RETURN FALSE;
  END IF;

  jwt_role := NULLIF(LOWER(jwt_claims ->> 'role'), '');
  IF jwt_role IS NULL OR jwt_role <> 'authenticated' THEN
    RETURN FALSE;
  END IF;

  uid_val := NULLIF(jwt_claims ->> 'sub', '');
  IF uid_val IS NULL OR uid_val <> authorized_uid THEN
    RETURN FALSE;
  END IF;

  email_val := NULLIF(LOWER(trim(COALESCE(jwt_claims ->> 'email', ''))), '');
  IF email_val IS NULL OR email_val <> authorized_email THEN
    RETURN FALSE;
  END IF;

  -- Safely parse boolean JWT claims without throwing on malformed claim types
  is_disabled_claim := CASE
    WHEN jsonb_typeof(jwt_claims -> 'disabled') = 'boolean' THEN (jwt_claims ->> 'disabled')::BOOLEAN
    WHEN LOWER(COALESCE(jwt_claims ->> 'disabled', '')) = 'true' THEN TRUE
    ELSE FALSE
  END;

  IF is_disabled_claim = TRUE THEN
    RETURN FALSE;
  END IF;

  -- Strict single-admin verification: exact UID + exact email + active database record
  -- Note: role='authenticated' or custom admin claims alone never grant admin privileges
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.is_active = TRUE
      AND au.firebase_uid = authorized_uid
      AND au.firebase_uid = uid_val
      AND LOWER(au.email) = authorized_email
      AND LOWER(au.email) = email_val
      AND jsonb_typeof(jwt_claims -> 'email_verified') = 'boolean'
      AND (jwt_claims ->> 'email_verified')::boolean IS TRUE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.firebase_uid() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.firebase_uid() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.firebase_email() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.firebase_email() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 1. ADMIN AUTHORIZATION & SINGLE-ADMIN LOCKDOWN
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL CHECK (email = LOWER(trim(email))),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Proprietor / Super Admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure pre-existing admin_users definitions receive updated default & constraint
ALTER TABLE public.admin_users
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

UPDATE public.admin_users
SET email = LOWER(trim(email))
WHERE email <> LOWER(trim(email));

DO $$
DECLARE
  conflict_count INTEGER := 0;
  total_count INTEGER := 0;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.admin_users;
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.admin_users
  WHERE firebase_uid <> 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'
     OR LOWER(email) <> 'shariqueaman77@gmail.com'
     OR name <> 'Sharique Aman'
     OR role <> 'Proprietor / Super Admin';

  IF conflict_count > 0 OR total_count > 1 THEN
    RAISE EXCEPTION
      'Single-admin lockdown check failed: found % total and % conflicting record(s) in public.admin_users. Resolve conflicts manually before applying sole-admin constraints.',
      total_count,
      conflict_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_email_lowercase_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_email_lowercase_check
      CHECK (email = LOWER(trim(email)));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_sole_uid_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_sole_uid_check
      CHECK (firebase_uid = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_sole_email_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_sole_email_check
      CHECK (email = 'shariqueaman77@gmail.com');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_sole_name_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_sole_name_check
      CHECK (name = 'Sharique Aman');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'admin_users_sole_role_check'
      AND conrelid = 'public.admin_users'::regclass
  ) THEN
    ALTER TABLE public.admin_users
      ADD CONSTRAINT admin_users_sole_role_check
      CHECK (role = 'Proprietor / Super Admin');
  END IF;
END $$;

-- Database-level singleton guarantee: at most one row can ever exist in public.admin_users
CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_users_singleton
  ON public.admin_users ((true));

CREATE OR REPLACE FUNCTION public.enforce_single_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.firebase_uid <> 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2' THEN
    RAISE EXCEPTION 'Unauthorized admin firebase_uid. Only the sole authorized administrator may be registered.';
  END IF;

  NEW.email := LOWER(trim(NEW.email));
  IF NEW.email <> 'shariqueaman77@gmail.com' THEN
    RAISE EXCEPTION 'Unauthorized admin email. Only the sole authorized administrator email is permitted.';
  END IF;

  IF NEW.name <> 'Sharique Aman' THEN
    RAISE EXCEPTION 'Unauthorized admin display name. Only the sole authorized administrator name is permitted.';
  END IF;

  IF NEW.role <> 'Proprietor / Super Admin' THEN
    RAISE EXCEPTION 'Unauthorized admin role. Only Proprietor / Super Admin is permitted.';
  END IF;

  IF TG_OP = 'INSERT' AND EXISTS (SELECT 1 FROM public.admin_users) THEN
    RAISE EXCEPTION 'Single-admin restriction: a second administrator cannot be inserted into public.admin_users.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_single_admin_user ON public.admin_users;
CREATE TRIGGER trg_enforce_single_admin_user
  BEFORE INSERT OR UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_single_admin_user();

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM anon;
REVOKE SELECT ON public.admin_users FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.admin_users FROM authenticated;
GRANT SELECT ON public.admin_users TO authenticated;

-- Only the sole authorized administrator may read their own admin record
DROP POLICY IF EXISTS "Admins can view own or managed admin profiles" ON public.admin_users;
CREATE POLICY "Admins can view own or managed admin profiles"
  ON public.admin_users
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.firebase_uid() = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'
    AND public.firebase_email() = 'shariqueaman77@gmail.com'
    AND firebase_uid = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2'
    AND LOWER(email) = 'shariqueaman77@gmail.com'
  );

-- Prevent inserting, modifying, or deleting administrator records through PostgREST API requests
DROP POLICY IF EXISTS "Only active admins can insert admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny all API inserts on admin_users" ON public.admin_users;
CREATE POLICY "Deny all API inserts on admin_users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "Only active admins can update admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny all API updates on admin_users" ON public.admin_users;
CREATE POLICY "Deny all API updates on admin_users"
  ON public.admin_users
  FOR UPDATE
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS "Only active admins can delete admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Deny all API deletes on admin_users" ON public.admin_users;
CREATE POLICY "Deny all API deletes on admin_users"
  ON public.admin_users
  FOR DELETE
  USING (false);

-- -----------------------------------------------------------------------------
-- 2. CUSTOMERS (Strictly Private - Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1),
  phone TEXT NOT NULL CHECK (char_length(trim(phone)) >= 6),
  email TEXT,
  address TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Regular Citizen',
  total_visits INTEGER NOT NULL DEFAULT 1 CHECK (total_visits >= 0),
  total_spent NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_spent >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_visit_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customers FROM anon;

DROP POLICY IF EXISTS "Admins only access to customers" ON public.customers;
CREATE POLICY "Admins only access to customers"
  ON public.customers
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 3. CUSTOMER ENQUIRIES (Validated Public Insert, Admin-Only Read/Write/Delete)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_enquiries (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) BETWEEN 2 AND 100),
  phone_number TEXT NOT NULL CHECK (char_length(trim(phone_number)) BETWEEN 8 AND 20),
  service_id TEXT NOT NULL CHECK (char_length(trim(service_id)) BETWEEN 1 AND 64),
  service_name TEXT NOT NULL CHECK (char_length(trim(service_name)) BETWEEN 2 AND 120),
  customer_message TEXT DEFAULT '' CHECK (char_length(COALESCE(customer_message, '')) <= 1000),
  urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'pending', 'in-progress', 'completed')),
  admin_notes TEXT DEFAULT '',
  estimated_cost TEXT,
  assigned_operator TEXT,
  source TEXT DEFAULT 'walk-in',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.customer_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_phone_created ON public.customer_enquiries(phone_number, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_normalized_phone_created ON public.customer_enquiries((regexp_replace(phone_number, '\D', '', 'g')), created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_source_created ON public.customer_enquiries(source, created_at DESC);
ALTER TABLE public.customer_enquiries ENABLE ROW LEVEL SECURITY;
REVOKE SELECT, UPDATE, DELETE ON public.customer_enquiries FROM anon;
GRANT INSERT ON public.customer_enquiries TO anon, authenticated;

-- Server-side rate limiting & spam throttle for public website enquiry submissions
CREATE OR REPLACE FUNCTION public.enforce_public_enquiry_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized_phone TEXT;
  recent_phone_count INTEGER;
  daily_phone_count INTEGER;
  global_burst_count INTEGER;
BEGIN
  -- Verified admin operators adding counter/walk-in enquiries bypass public rate limit
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Override client-supplied timestamps, source, and status with authoritative server values
  NEW.created_at := now();
  NEW.updated_at := NEW.created_at;
  NEW.source := 'website';
  NEW.status := 'new';

  normalized_phone := regexp_replace(COALESCE(NEW.phone_number, ''), '\D', '', 'g');
  IF char_length(normalized_phone) < 10 OR char_length(normalized_phone) > 15 THEN
    RAISE EXCEPTION 'Invalid phone number format.' USING ERRCODE = '22023';
  END IF;

  -- Serialize concurrent non-admin enquiry rate-limit checks cleanly per transaction
  -- Fixed lock order (global namespace 20261112, then per-phone namespace 20261113) prevents deadlocks.
  PERFORM pg_advisory_xact_lock(20261112, 1);
  PERFORM pg_advisory_xact_lock(20261113, hashtext(normalized_phone));

  -- Max 3 enquiries per phone within 10 minutes
  SELECT COUNT(*) INTO recent_phone_count
  FROM public.customer_enquiries ce
  WHERE regexp_replace(ce.phone_number, '\D', '', 'g') = normalized_phone
    AND ce.created_at > now() - INTERVAL '10 minutes';

  IF recent_phone_count >= 3 THEN
    RAISE EXCEPTION 'Too many enquiries submitted for this phone number. Please wait 10 minutes.' USING ERRCODE = 'P0001';
  END IF;

  -- Max 8 enquiries per phone within 24 hours
  SELECT COUNT(*) INTO daily_phone_count
  FROM public.customer_enquiries ce
  WHERE regexp_replace(ce.phone_number, '\D', '', 'g') = normalized_phone
    AND ce.created_at > now() - INTERVAL '24 hours';

  IF daily_phone_count >= 8 THEN
    RAISE EXCEPTION 'Daily enquiry submission limit reached for this phone number.' USING ERRCODE = 'P0001';
  END IF;

  -- Global website burst cap: max 30 website submissions per minute
  SELECT COUNT(*) INTO global_burst_count
  FROM public.customer_enquiries ce
  WHERE ce.source = 'website'
    AND ce.created_at > now() - INTERVAL '1 minute';

  IF global_burst_count >= 30 THEN
    RAISE EXCEPTION 'Public enquiry terminal is experiencing high traffic. Please try again in a minute.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_public_enquiry_rate_limit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_public_enquiry_rate_limit ON public.customer_enquiries;
CREATE TRIGGER trg_public_enquiry_rate_limit
  BEFORE INSERT ON public.customer_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_public_enquiry_rate_limit();

-- Public website visitors may submit strictly validated new website enquiries only
DROP POLICY IF EXISTS "Validated public enquiry submission" ON public.customer_enquiries;
CREATE POLICY "Validated public enquiry submission"
  ON public.customer_enquiries
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    OR (
      char_length(trim(customer_name)) BETWEEN 2 AND 100
      AND regexp_replace(phone_number, '\D', '', 'g') ~ '^[0-9]{10,15}$'
      AND char_length(trim(service_name)) BETWEEN 2 AND 120
      AND char_length(COALESCE(customer_message, '')) <= 1000
      AND status = 'new'
      AND source = 'website'
      AND COALESCE(admin_notes, '') = ''
      AND estimated_cost IS NULL
      AND assigned_operator IS NULL
    )
  );

-- Only verified admins can view, update, or delete customer enquiries
DROP POLICY IF EXISTS "Admins only select enquiries" ON public.customer_enquiries;
CREATE POLICY "Admins only select enquiries"
  ON public.customer_enquiries
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins only update enquiries" ON public.customer_enquiries;
CREATE POLICY "Admins only update enquiries"
  ON public.customer_enquiries
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete enquiries" ON public.customer_enquiries;
CREATE POLICY "Admins only delete enquiries"
  ON public.customer_enquiries
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. SERVICES & RATES (Public Visible Read, Admin Full Access)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  icon_name TEXT NOT NULL DEFAULT 'FileText',
  image TEXT NOT NULL DEFAULT '',
  price_starting_at TEXT NOT NULL DEFAULT '₹50',
  tat TEXT NOT NULL DEFAULT 'Same Day',
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  whatsapp_message_template TEXT NOT NULL DEFAULT '',
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible services" ON public.services;
CREATE POLICY "Public can read visible services"
  ON public.services
  FOR SELECT
  USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only write services" ON public.services;
CREATE POLICY "Admins only write services"
  ON public.services
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update services" ON public.services;
CREATE POLICY "Admins only update services"
  ON public.services
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete services" ON public.services;
CREATE POLICY "Admins only delete services"
  ON public.services
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 5. LATEST UPDATES (Door 0: Public Published Read, Admin Full Access)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.latest_updates (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  published_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  short_description TEXT NOT NULL DEFAULT '',
  important_dates JSONB NOT NULL DEFAULT '{}'::jsonb,
  eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  application_fee TEXT NOT NULL DEFAULT '',
  official_link TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Active', 'Closing Soon', 'Closed')),
  source_website TEXT NOT NULL DEFAULT '',
  poster_image TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_updates_published ON public.latest_updates(published, category);
ALTER TABLE public.latest_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published updates" ON public.latest_updates;
CREATE POLICY "Public can view published updates"
  ON public.latest_updates
  FOR SELECT
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert latest_updates" ON public.latest_updates;
CREATE POLICY "Admins only insert latest_updates"
  ON public.latest_updates
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update latest_updates" ON public.latest_updates;
CREATE POLICY "Admins only update latest_updates"
  ON public.latest_updates
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete latest_updates" ON public.latest_updates;
CREATE POLICY "Admins only delete latest_updates"
  ON public.latest_updates
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 6. DOCUMENT REQUIREMENTS (Door 1: Public Published Read, Admin Full Access)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.document_requirements (
  id TEXT PRIMARY KEY,
  service_title TEXT NOT NULL,
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  important_note TEXT,
  category TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published document requirements" ON public.document_requirements;
CREATE POLICY "Public can read published document requirements"
  ON public.document_requirements
  FOR SELECT
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert document_requirements" ON public.document_requirements;
CREATE POLICY "Admins only insert document_requirements"
  ON public.document_requirements
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update document_requirements" ON public.document_requirements;
CREATE POLICY "Admins only update document_requirements"
  ON public.document_requirements
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete document_requirements" ON public.document_requirements;
CREATE POLICY "Admins only delete document_requirements"
  ON public.document_requirements
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. CENTER GALLERY (Door 4: Public Visible Read, Admin Full Access)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view visible gallery items" ON public.gallery_items;
CREATE POLICY "Public can view visible gallery items"
  ON public.gallery_items
  FOR SELECT
  USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert gallery_items" ON public.gallery_items;
CREATE POLICY "Admins only insert gallery_items"
  ON public.gallery_items
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update gallery_items" ON public.gallery_items;
CREATE POLICY "Admins only update gallery_items"
  ON public.gallery_items
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete gallery_items" ON public.gallery_items;
CREATE POLICY "Admins only delete gallery_items"
  ON public.gallery_items
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 8. OUR JOURNEY (Timeline Milestones: Public Published Read, Admin Full Access)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journey_milestones (
  id TEXT PRIMARY KEY,
  year TEXT NOT NULL,
  month TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  bullets JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_journey_published ON public.journey_milestones(published, display_order);
ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published journey milestones" ON public.journey_milestones;
CREATE POLICY "Public can view published journey milestones"
  ON public.journey_milestones
  FOR SELECT
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert journey_milestones" ON public.journey_milestones;
CREATE POLICY "Admins only insert journey_milestones"
  ON public.journey_milestones
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update journey_milestones" ON public.journey_milestones;
CREATE POLICY "Admins only update journey_milestones"
  ON public.journey_milestones
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete journey_milestones" ON public.journey_milestones;
CREATE POLICY "Admins only delete journey_milestones"
  ON public.journey_milestones
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 9. BUSINESS PROFILE & CONTACT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_profile (
  id TEXT PRIMARY KEY DEFAULT 'main_profile',
  business_name TEXT NOT NULL DEFAULT 'Aman Computer',
  tagline TEXT NOT NULL DEFAULT 'Your Trusted Cyber Cafe & Online Seva Kendra',
  proprietor_name TEXT NOT NULL DEFAULT 'Aman Sharma',
  trade_license_no TEXT NOT NULL DEFAULT 'UP-VNS-CYBER-2024-889',
  address_line TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  google_maps_embed_url TEXT NOT NULL DEFAULT '',
  google_maps_direct_link TEXT NOT NULL DEFAULT '',
  primary_phone TEXT NOT NULL DEFAULT '+91 85955 15718',
  whatsapp_number TEXT NOT NULL DEFAULT '+91 85955 15718',
  secondary_phone TEXT,
  email TEXT NOT NULL DEFAULT 'aman@amancomputervns.com',
  telegram_channel TEXT,
  opening_hours TEXT NOT NULL DEFAULT '08:30 AM – 09:00 PM',
  working_days TEXT NOT NULL DEFAULT 'Monday – Saturday',
  upi_id TEXT NOT NULL DEFAULT '',
  upi_qr_image TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read business profile" ON public.business_profile;
CREATE POLICY "Public can read business profile"
  ON public.business_profile
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins only insert business_profile" ON public.business_profile;
CREATE POLICY "Admins only insert business_profile"
  ON public.business_profile
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update business_profile" ON public.business_profile;
CREATE POLICY "Admins only update business_profile"
  ON public.business_profile
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete business_profile" ON public.business_profile;
CREATE POLICY "Admins only delete business_profile"
  ON public.business_profile
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 10. WEBSITE CONTENT
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_content (
  id TEXT PRIMARY KEY DEFAULT 'global_content',
  section_key TEXT NOT NULL DEFAULT 'global',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read website content" ON public.website_content;
CREATE POLICY "Public can read website content"
  ON public.website_content
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins only insert website_content" ON public.website_content;
CREATE POLICY "Admins only insert website_content"
  ON public.website_content
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update website_content" ON public.website_content;
CREATE POLICY "Admins only update website_content"
  ON public.website_content
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete website_content" ON public.website_content;
CREATE POLICY "Admins only delete website_content"
  ON public.website_content
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 11. FAQS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  display_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible faqs" ON public.faqs;
CREATE POLICY "Public can read visible faqs"
  ON public.faqs
  FOR SELECT
  USING (visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert faqs" ON public.faqs;
CREATE POLICY "Admins only insert faqs"
  ON public.faqs
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update faqs" ON public.faqs;
CREATE POLICY "Admins only update faqs"
  ON public.faqs
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete faqs" ON public.faqs;
CREATE POLICY "Admins only delete faqs"
  ON public.faqs
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 12. TESTIMONIALS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  location TEXT DEFAULT '',
  service_name TEXT DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  date TEXT DEFAULT '',
  verified BOOLEAN NOT NULL DEFAULT true,
  approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved testimonials" ON public.testimonials;
CREATE POLICY "Public can read approved testimonials"
  ON public.testimonials
  FOR SELECT
  USING (approved = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert testimonials" ON public.testimonials;
CREATE POLICY "Admins only insert testimonials"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update testimonials" ON public.testimonials;
CREATE POLICY "Admins only update testimonials"
  ON public.testimonials
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete testimonials" ON public.testimonials;
CREATE POLICY "Admins only delete testimonials"
  ON public.testimonials
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 13. RECEIPTS & TOKENS (Protected Accounting - Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipts (
  id TEXT PRIMARY KEY,
  token_number INTEGER NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_category TEXT NOT NULL DEFAULT 'General Service',
  application_ref_no TEXT,
  govt_challan_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (govt_challan_fee >= 0),
  operator_service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (operator_service_fee >= 0),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  payment_mode TEXT NOT NULL DEFAULT 'Cash',
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  status TEXT NOT NULL DEFAULT 'Pending Processing',
  expected_delivery_date TIMESTAMPTZ,
  operator_name TEXT NOT NULL DEFAULT 'Aman Sharma',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_receipts_token ON public.receipts(token_number);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.receipts FROM anon;

DROP POLICY IF EXISTS "Admins only access to receipts" ON public.receipts;
CREATE POLICY "Admins only access to receipts"
  ON public.receipts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 14. MEDIA ASSETS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media_assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'image' CHECK (file_type IN ('image', 'pdf', 'doc')),
  file_size TEXT NOT NULL DEFAULT '0 KB',
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'banner',
  uploaded_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view public media assets" ON public.media_assets;
CREATE POLICY "Public can view public media assets"
  ON public.media_assets
  FOR SELECT
  USING (category IN ('banner', 'logo', 'gallery', 'document-template') OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert media_assets" ON public.media_assets;
CREATE POLICY "Admins only insert media_assets"
  ON public.media_assets
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update media_assets" ON public.media_assets;
CREATE POLICY "Admins only update media_assets"
  ON public.media_assets
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete media_assets" ON public.media_assets;
CREATE POLICY "Admins only delete media_assets"
  ON public.media_assets
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 15. STAFF & OPERATORS (Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  workstation_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  shift TEXT NOT NULL DEFAULT 'Full Day (8:30 AM – 8:30 PM)',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar_url TEXT,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.staff_members FROM anon;

DROP POLICY IF EXISTS "Admins only access to staff_members" ON public.staff_members;
CREATE POLICY "Admins only access to staff_members"
  ON public.staff_members
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 16. NOTIFICATIONS (Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  timestamp TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warning', 'alert', 'success')),
  link_to_tab TEXT
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.notifications FROM anon;

DROP POLICY IF EXISTS "Admins only access to notifications" ON public.notifications;
CREATE POLICY "Admins only access to notifications"
  ON public.notifications
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 17. ACTIVITY LOGS (Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  operator TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.activity_logs FROM anon;

DROP POLICY IF EXISTS "Admins only access to activity_logs" ON public.activity_logs;
CREATE POLICY "Admins only access to activity_logs"
  ON public.activity_logs
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 18. TERMINAL SETTINGS (Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.terminal_settings (
  id TEXT PRIMARY KEY DEFAULT 'default_settings',
  theme TEXT NOT NULL DEFAULT 'dark',
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  audio_chimes BOOLEAN NOT NULL DEFAULT true,
  default_service_fee NUMERIC(10, 2) NOT NULL DEFAULT 50,
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  receipt_header_note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.terminal_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.terminal_settings FROM anon;

DROP POLICY IF EXISTS "Admins only access to terminal_settings" ON public.terminal_settings;
CREATE POLICY "Admins only access to terminal_settings"
  ON public.terminal_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 19. STORAGE BUCKETS & ZERO-TRUST STORAGE RLS POLICIES
-- -----------------------------------------------------------------------------
-- Public showcase buckets serve /object/public/* directly without public SELECT policies
-- on storage.objects, preventing anonymous bucket directory listing.
-- Unsanitized image/svg+xml is intentionally excluded from allowed_mime_types.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'gallery-images',
    'gallery-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'update-posters',
    'update-posters',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'media-library',
    'media-library',
    true,
    10485760,
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'customer-documents',
    'customer-documents',
    false,
    10485760,
    ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  )
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove legacy public storage.objects SELECT policies that allowed anonymous bucket listing
DROP POLICY IF EXISTS "Public can view gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view update posters" ON storage.objects;
DROP POLICY IF EXISTS "Public can view media library" ON storage.objects;

-- Admins only can list/select objects across managed showcase buckets
DROP POLICY IF EXISTS "Admins only can view managed showcase objects" ON storage.objects;
CREATE POLICY "Admins only can view managed showcase objects"
  ON storage.objects
  FOR SELECT
  USING (
    public.is_admin()
    AND bucket_id IN ('gallery-images', 'update-posters', 'media-library')
  );

-- Private customer-documents bucket is strictly Admin Only (private bucket + admin RLS)
DROP POLICY IF EXISTS "Admins only can view customer documents" ON storage.objects;
CREATE POLICY "Admins only can view customer documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'customer-documents' AND public.is_admin());

-- All uploads, updates, and deletions require verified admin authorization and bucket scoping
DROP POLICY IF EXISTS "Admins only can upload storage objects" ON storage.objects;
CREATE POLICY "Admins only can upload storage objects"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    public.is_admin()
    AND bucket_id IN ('gallery-images', 'update-posters', 'media-library', 'customer-documents')
  );

DROP POLICY IF EXISTS "Admins only can update storage objects" ON storage.objects;
CREATE POLICY "Admins only can update storage objects"
  ON storage.objects
  FOR UPDATE
  USING (
    public.is_admin()
    AND bucket_id IN ('gallery-images', 'update-posters', 'media-library', 'customer-documents')
  )
  WITH CHECK (
    public.is_admin()
    AND bucket_id IN ('gallery-images', 'update-posters', 'media-library', 'customer-documents')
  );

DROP POLICY IF EXISTS "Admins only can delete storage objects" ON storage.objects;
CREATE POLICY "Admins only can delete storage objects"
  ON storage.objects
  FOR DELETE
  USING (
    public.is_admin()
    AND bucket_id IN ('gallery-images', 'update-posters', 'media-library', 'customer-documents')
  );

COMMIT;
