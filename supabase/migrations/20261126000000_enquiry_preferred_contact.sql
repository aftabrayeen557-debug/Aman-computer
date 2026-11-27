-- =============================================================================
-- AMAN COMPUTER — ADD PREFERRED CONTACT METHOD TO CUSTOMER ENQUIRIES
-- Safe, additive migration preserving existing customer_enquiries schema,
-- triggers, rate-limiting, and zero-trust RLS policies.
-- =============================================================================

ALTER TABLE public.customer_enquiries
  ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT NOT NULL DEFAULT 'either';

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
