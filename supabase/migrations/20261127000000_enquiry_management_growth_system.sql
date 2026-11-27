-- =============================================================================
-- AMAN COMPUTER CYBER CAFE & DIGITAL CENTER
-- CUSTOMER ENQUIRY MANAGEMENT & GROWTH SYSTEM MIGRATION
-- Safe, additive migration preserving existing schema, SECURITY DEFINER hardening,
-- public rate limiting, and zero-trust single-admin RLS protections.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. ENSURE PREFERRED CONTACT METHOD & EXTENDED ENQUIRY LIFECYCLE COLUMNS
-- -----------------------------------------------------------------------------
ALTER TABLE public.customer_enquiries
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT NOT NULL DEFAULT 'either',
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_follow_up_date DATE,
  ADD COLUMN IF NOT EXISTS next_follow_up_time TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS follow_up_notes TEXT DEFAULT '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_enquiries_preferred_contact_check'
      AND conrelid = 'public.customer_enquiries'::regclass
  ) THEN
    ALTER TABLE public.customer_enquiries
      ADD CONSTRAINT customer_enquiries_preferred_contact_check
      CHECK (preferred_contact_method IN ('whatsapp', 'phone', 'either'));
  END IF;
END $$;

-- Replace inline/legacy status CHECK constraint safely to support full CRM lifecycle
DO $$
DECLARE
  v_con RECORD;
BEGIN
  FOR v_con IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.customer_enquiries'::regclass
      AND contype = 'c'
      AND (
        conname = 'customer_enquiries_status_check'
        OR pg_get_constraintdef(oid) ~* '\mstatus\M'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.customer_enquiries DROP CONSTRAINT IF EXISTS %I', v_con.conname);
  END LOOP;

  ALTER TABLE public.customer_enquiries
    ADD CONSTRAINT customer_enquiries_status_check
    CHECK (status IN ('new', 'contacted', 'pending', 'in-progress', 'completed', 'cancelled', 'not-interested'));
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_enquiries_priority_check'
      AND conrelid = 'public.customer_enquiries'::regclass
  ) THEN
    ALTER TABLE public.customer_enquiries
      ADD CONSTRAINT customer_enquiries_priority_check
      CHECK (priority IN ('high', 'medium', 'low'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_enquiries_followup_notes_len_check'
      AND conrelid = 'public.customer_enquiries'::regclass
  ) THEN
    ALTER TABLE public.customer_enquiries
      ADD CONSTRAINT customer_enquiries_followup_notes_len_check
      CHECK (char_length(COALESCE(follow_up_notes, '')) <= 2000);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'customer_enquiries_followup_time_len_check'
      AND conrelid = 'public.customer_enquiries'::regclass
  ) THEN
    ALTER TABLE public.customer_enquiries
      ADD CONSTRAINT customer_enquiries_followup_time_len_check
      CHECK (char_length(COALESCE(next_follow_up_time, '')) <= 32);
  END IF;
END $$;

-- Align priority for pre-existing urgent records without overriding explicit choices
UPDATE public.customer_enquiries
SET priority = 'high'
WHERE urgency = 'urgent' AND priority = 'medium';

-- Composite indexes for analytics, priority queue, and follow-up scheduler
CREATE INDEX IF NOT EXISTS idx_enquiries_status_created
  ON public.customer_enquiries(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enquiries_priority_status
  ON public.customer_enquiries(priority, status);

CREATE INDEX IF NOT EXISTS idx_enquiries_followup_date_status
  ON public.customer_enquiries(next_follow_up_date, status)
  WHERE next_follow_up_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enquiries_completed_at
  ON public.customer_enquiries(completed_at DESC)
  WHERE completed_at IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 2. HARDEN PUBLIC ENQUIRY TRIGGER & INSERT RLS AGAINST CRM FIELD SPOOFING
-- -----------------------------------------------------------------------------
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
    IF NEW.priority IS NULL OR NEW.priority NOT IN ('high', 'medium', 'low') THEN
      NEW.priority := CASE WHEN NEW.urgency = 'urgent' THEN 'high' ELSE 'medium' END;
    END IF;
    RETURN NEW;
  END IF;

  -- Override client-supplied timestamps, source, status, and internal CRM fields
  NEW.created_at := now();
  NEW.updated_at := NEW.created_at;
  NEW.source := 'website';
  NEW.status := 'new';
  NEW.priority := CASE WHEN NEW.urgency = 'urgent' THEN 'high' ELSE 'medium' END;
  NEW.first_response_at := NULL;
  NEW.last_contacted_at := NULL;
  NEW.completed_at := NULL;
  NEW.next_follow_up_date := NULL;
  NEW.next_follow_up_time := '';
  NEW.follow_up_notes := '';

  normalized_phone := regexp_replace(COALESCE(NEW.phone_number, ''), '\D', '', 'g');
  IF char_length(normalized_phone) < 10 OR char_length(normalized_phone) > 15 THEN
    RAISE EXCEPTION 'Invalid phone number format.' USING ERRCODE = '22023';
  END IF;

  -- Fixed lock order (global 20261112 then per-phone 20261113) prevents deadlocks
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
      AND first_response_at IS NULL
      AND last_contacted_at IS NULL
      AND completed_at IS NULL
      AND next_follow_up_date IS NULL
      AND COALESCE(follow_up_notes, '') = ''
    )
  );

-- -----------------------------------------------------------------------------
-- 3. ENQUIRY FOLLOW-UPS TABLE (Admin Only)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiry_follow_ups (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES public.customer_enquiries(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL DEFAULT '' CHECK (char_length(scheduled_time) <= 32),
  notes TEXT NOT NULL DEFAULT '' CHECK (char_length(notes) <= 2000),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_notes TEXT NOT NULL DEFAULT '' CHECK (char_length(completed_notes) <= 2000),
  created_by TEXT NOT NULL DEFAULT 'Sharique Aman',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_enquiry
  ON public.enquiry_follow_ups(enquiry_id, scheduled_date ASC);

CREATE INDEX IF NOT EXISTS idx_follow_ups_status_date
  ON public.enquiry_follow_ups(status, scheduled_date ASC);

ALTER TABLE public.enquiry_follow_ups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.enquiry_follow_ups FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enquiry_follow_ups TO authenticated;

DROP POLICY IF EXISTS "Admins only access to enquiry_follow_ups" ON public.enquiry_follow_ups;
CREATE POLICY "Admins only access to enquiry_follow_ups"
  ON public.enquiry_follow_ups
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- -----------------------------------------------------------------------------
-- 4. ENQUIRY AUDIT LOGS TABLE & TRIGGER (Admin Read, Trigger + Admin Append)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.enquiry_audit_logs (
  id TEXT PRIMARY KEY,
  enquiry_id TEXT NOT NULL REFERENCES public.customer_enquiries(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (
    action_type IN (
      'created',
      'status_change',
      'priority_change',
      'follow_up_scheduled',
      'follow_up_completed',
      'notes_updated',
      'contacted',
      'record_updated'
    )
  ),
  old_value TEXT NOT NULL DEFAULT '',
  new_value TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  performed_by TEXT NOT NULL DEFAULT 'System',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_enquiry_audit_enquiry_created
  ON public.enquiry_audit_logs(enquiry_id, created_at DESC);

ALTER TABLE public.enquiry_audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.enquiry_audit_logs FROM anon;
GRANT SELECT, INSERT ON public.enquiry_audit_logs TO authenticated;

DROP POLICY IF EXISTS "Admins only read enquiry_audit_logs" ON public.enquiry_audit_logs;
CREATE POLICY "Admins only read enquiry_audit_logs"
  ON public.enquiry_audit_logs
  FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins only insert enquiry_audit_logs" ON public.enquiry_audit_logs;
CREATE POLICY "Admins only insert enquiry_audit_logs"
  ON public.enquiry_audit_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.log_customer_enquiry_audit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor TEXT;
BEGIN
  v_actor := COALESCE(NULLIF(public.firebase_email(), ''), 'Public Website');

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.enquiry_audit_logs (
      id, enquiry_id, action_type, old_value, new_value, details, performed_by, created_at
    ) VALUES (
      'aud-' || md5(random()::text || clock_timestamp()::text),
      NEW.id,
      'created',
      '',
      COALESCE(NEW.status, 'new'),
      'Enquiry logged via ' || COALESCE(NEW.source, 'website') || ' for ' || COALESCE(NEW.service_name, 'Service'),
      v_actor,
      COALESCE(NEW.created_at, now())
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.enquiry_audit_logs (
        id, enquiry_id, action_type, old_value, new_value, details, performed_by
      ) VALUES (
        'aud-' || md5(random()::text || clock_timestamp()::text || 'st'),
        NEW.id,
        'status_change',
        COALESCE(OLD.status, ''),
        COALESCE(NEW.status, ''),
        'Status updated from ' || COALESCE(OLD.status, 'new') || ' to ' || COALESCE(NEW.status, ''),
        v_actor
      );
    END IF;

    IF NEW.priority IS DISTINCT FROM OLD.priority THEN
      INSERT INTO public.enquiry_audit_logs (
        id, enquiry_id, action_type, old_value, new_value, details, performed_by
      ) VALUES (
        'aud-' || md5(random()::text || clock_timestamp()::text || 'pr'),
        NEW.id,
        'priority_change',
        COALESCE(OLD.priority, ''),
        COALESCE(NEW.priority, ''),
        'Priority updated from ' || COALESCE(OLD.priority, 'medium') || ' to ' || COALESCE(NEW.priority, ''),
        v_actor
      );
    END IF;

    IF NEW.next_follow_up_date IS DISTINCT FROM OLD.next_follow_up_date
       OR COALESCE(NEW.next_follow_up_time, '') IS DISTINCT FROM COALESCE(OLD.next_follow_up_time, '') THEN
      IF NEW.next_follow_up_date IS NOT NULL THEN
        INSERT INTO public.enquiry_audit_logs (
          id, enquiry_id, action_type, old_value, new_value, details, performed_by
        ) VALUES (
          'aud-' || md5(random()::text || clock_timestamp()::text || 'fu'),
          NEW.id,
          'follow_up_scheduled',
          COALESCE(OLD.next_follow_up_date::text, ''),
          NEW.next_follow_up_date::text || CASE WHEN COALESCE(NEW.next_follow_up_time, '') <> '' THEN ' ' || NEW.next_follow_up_time ELSE '' END,
          'Follow-up scheduled for ' || NEW.next_follow_up_date::text,
          v_actor
        );
      END IF;
    END IF;

    IF COALESCE(NEW.admin_notes, '') IS DISTINCT FROM COALESCE(OLD.admin_notes, '') THEN
      INSERT INTO public.enquiry_audit_logs (
        id, enquiry_id, action_type, old_value, new_value, details, performed_by
      ) VALUES (
        'aud-' || md5(random()::text || clock_timestamp()::text || 'nt'),
        NEW.id,
        'notes_updated',
        '',
        '',
        'Internal counter notes updated',
        v_actor
      );
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.log_customer_enquiry_audit() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_log_customer_enquiry_audit ON public.customer_enquiries;
CREATE TRIGGER trg_log_customer_enquiry_audit
  AFTER INSERT OR UPDATE ON public.customer_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.log_customer_enquiry_audit();

COMMIT;
