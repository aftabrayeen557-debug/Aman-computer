-- =============================================================================
-- AMAN COMPUTER CYBER CAFE & DIGITAL CENTER
-- MASTER CMS SCHEMA EXTENSIONS (GOVERNMENT SCHEMES & JOURNEY MEDIA)
-- Safe additive migration preserving existing tables, RLS, and SECURITY DEFINER hardening
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. GOVERNMENT SCHEMES (Public Published Read, Admin-Only Write/Delete)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.government_schemes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 2),
  category TEXT NOT NULL DEFAULT 'Central Welfare',
  department TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  eligibility TEXT NOT NULL DEFAULT '',
  benefits TEXT NOT NULL DEFAULT '',
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  application_mode TEXT NOT NULL DEFAULT 'Online & Counter Assistance',
  last_date TEXT NOT NULL DEFAULT '',
  official_link TEXT NOT NULL DEFAULT '',
  poster_image TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('New', 'Active', 'Closing Soon', 'Closed')),
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_government_schemes_published
  ON public.government_schemes(published, display_order);

ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.government_schemes FROM anon, authenticated;
GRANT SELECT ON public.government_schemes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.government_schemes TO authenticated;

DROP POLICY IF EXISTS "Public can read published government schemes" ON public.government_schemes;
CREATE POLICY "Public can read published government schemes"
  ON public.government_schemes
  FOR SELECT
  USING (published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins only insert government_schemes" ON public.government_schemes;
CREATE POLICY "Admins only insert government_schemes"
  ON public.government_schemes
  FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only update government_schemes" ON public.government_schemes;
CREATE POLICY "Admins only update government_schemes"
  ON public.government_schemes
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins only delete government_schemes" ON public.government_schemes;
CREATE POLICY "Admins only delete government_schemes"
  ON public.government_schemes
  FOR DELETE
  USING (public.is_admin());

-- -----------------------------------------------------------------------------
-- 2. JOURNEY MILESTONES IMAGE SUPPORT
-- -----------------------------------------------------------------------------
ALTER TABLE public.journey_milestones
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

COMMIT;
