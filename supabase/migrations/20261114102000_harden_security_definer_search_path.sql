-- =============================================================================
-- SECURITY HARDENING MIGRATION: EMPTY search_path ON SECURITY DEFINER FUNCTIONS
-- =============================================================================
-- Hardens public.is_admin() and public.enforce_public_enquiry_rate_limit()
-- by setting search_path = '' while preserving exact signatures, return types,
-- authorization logic, rate-limit thresholds, ownership, and EXECUTE grants.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
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

CREATE OR REPLACE FUNCTION public.enforce_public_enquiry_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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

COMMIT;
