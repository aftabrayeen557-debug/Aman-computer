-- =============================================================================
-- AMAN COMPUTER CYBER CAFE & DIGITAL CENTER
-- BACKEND VALIDATION TRIGGER FOR HERO CONTENT CHARACTER LIMITS
-- Preserves existing website_content schema, columns, and RLS policies.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.validate_website_content_hero()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  hero_obj JSONB;
  old_hero JSONB;
  v_headline TEXT;
  v_subheadline TEXT;
  v_description TEXT;
BEGIN
  IF NEW.content IS NULL OR jsonb_typeof(NEW.content) <> 'object' THEN
    RETURN NEW;
  END IF;

  IF NOT (NEW.content ? 'hero') THEN
    RETURN NEW;
  END IF;

  hero_obj := NEW.content->'hero';
  IF hero_obj IS NULL OR jsonb_typeof(hero_obj) <> 'object' THEN
    RAISE EXCEPTION 'Invalid hero payload in website_content.';
  END IF;

  -- Allow unrelated section updates (e.g. brandSettings/seoSettings) when hero object is untouched
  IF TG_OP = 'UPDATE' THEN
    old_hero := COALESCE(OLD.content->'hero', '{}'::jsonb);
    IF old_hero IS NOT DISTINCT FROM hero_obj THEN
      RETURN NEW;
    END IF;
  END IF;

  v_headline := btrim(regexp_replace(COALESCE(hero_obj->>'headline', ''), '\s+', ' ', 'g'));
  v_subheadline := btrim(regexp_replace(COALESCE(hero_obj->>'subheadline', ''), '\s+', ' ', 'g'));
  v_description := btrim(regexp_replace(COALESCE(hero_obj->>'description', ''), '\s+', ' ', 'g'));

  IF char_length(v_headline) = 0 OR char_length(v_headline) > 45 THEN
    RAISE EXCEPTION 'Hero main headline must be between 1 and 45 characters.';
  END IF;

  IF char_length(v_subheadline) = 0 OR char_length(v_subheadline) > 65 THEN
    RAISE EXCEPTION 'Hero supporting headline must be between 1 and 65 characters.';
  END IF;

  IF char_length(v_description) = 0 OR char_length(v_description) > 180 THEN
    RAISE EXCEPTION 'Hero description must be between 1 and 180 characters.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_website_content_hero ON public.website_content;
CREATE TRIGGER trg_validate_website_content_hero
  BEFORE INSERT OR UPDATE ON public.website_content
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_website_content_hero();

COMMIT;
