-- =============================================================================
-- AMAN COMPUTER — IDEMPOTENT SINGLE-ADMINISTRATOR SEED SQL
-- =============================================================================
-- Run manually in the Supabase SQL Editor AFTER applying:
--   supabase/migrations/20261112000000_aman_computer_schema.sql
--
-- Guarantees:
-- 1. Detects and reports any conflicting admin_users records without
--    silently overwriting or deleting them.
-- 2. Never creates a second administrator (enforced both here and by
--    idx_admin_users_singleton + trg_enforce_single_admin_user + CHECKs).
-- 3. Safe for repeated execution (idempotent no-op once seeded).
-- =============================================================================

BEGIN;

DO $$
DECLARE
  v_uid CONSTANT TEXT := 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
  v_email CONSTANT TEXT := 'shariqueaman77@gmail.com';
  v_name CONSTANT TEXT := 'Sharique Aman';
  v_role CONSTANT TEXT := 'Proprietor / Super Admin';

  v_total_count INTEGER := 0;
  v_conflict_count INTEGER := 0;
  v_conflict_ids TEXT := '';
  v_exact_is_active BOOLEAN;
BEGIN
  SELECT COUNT(*)
  INTO v_total_count
  FROM public.admin_users;

  SELECT
    COUNT(*),
    COALESCE(string_agg(id::text, ', '), '')
  INTO v_conflict_count, v_conflict_ids
  FROM public.admin_users
  WHERE firebase_uid <> v_uid
     OR LOWER(trim(email)) <> v_email
     OR name <> v_name
     OR role <> v_role;

  -- Detect & report conflicting records without silently overwriting or deleting
  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION
      'Single-admin seed aborted: found % conflicting record(s) in public.admin_users (row IDs: %). Resolve existing records manually; nothing was overwritten or deleted.',
      v_conflict_count,
      v_conflict_ids;
  END IF;

  IF v_total_count > 1 THEN
    RAISE EXCEPTION
      'Single-admin seed aborted: expected at most 1 row in public.admin_users, found % rows. Inspect manually; nothing was modified.',
      v_total_count;
  END IF;

  IF v_total_count = 1 THEN
    SELECT is_active
    INTO v_exact_is_active
    FROM public.admin_users
    WHERE firebase_uid = v_uid
      AND LOWER(trim(email)) = v_email
    LIMIT 1;

    IF v_exact_is_active = TRUE THEN
      RAISE NOTICE 'Idempotent check: sole authorized administrator record already exists and is active (is_active = true). No changes made.';
    ELSE
      RAISE NOTICE 'Idempotent check: sole authorized administrator record already exists with is_active = false. No changes made automatically.';
    END IF;
    RETURN;
  END IF;

  INSERT INTO public.admin_users (
    firebase_uid,
    email,
    name,
    role,
    is_active
  )
  VALUES (
    v_uid,
    v_email,
    v_name,
    v_role,
    true
  );

  RAISE NOTICE 'Single authorized administrator seeded successfully into public.admin_users.';
END $$;

COMMIT;
