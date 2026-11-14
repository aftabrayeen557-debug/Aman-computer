# Aman Computer — Backend Deployment & Single-Admin Provisioning Runbook

This runbook covers the remaining manual deployment steps for the single-administrator architecture:
- **Firebase Plan:** Spark (Free) only — Email/Password Authentication, no Blaze/Cloud Functions/Identity Platform.
- **Sole Authorized Admin:** `Yr0Wr7PuuAdOIMaqohmqaINNbNC2` (`shariqueaman77@gmail.com` / `Sharique Aman` / `Proprietor / Super Admin`).

---

## 1. Supabase SQL Editor Execution (Database, RLS & Seed)

Open **Supabase Dashboard -> SQL Editor -> New Query** and run these two scripts in exact order:

1. **Apply Schema, RLS, Triggers & Storage Buckets:**
   - Open `supabase/migrations/20261112000000_aman_computer_schema.sql`, copy the entire file, paste into the SQL Editor, and click **Run**.
   - Expected result: Transaction commits cleanly (`COMMIT`) creating/updating all 18 RLS-protected tables, `public.is_admin()`, rate-limit trigger, and 4 storage buckets (`gallery-images`, `update-posters`, `media-library`, private `customer-documents`).
   - *Safety note:* If any conflicting/legacy row exists in `public.admin_users`, the script aborts automatically (`RAISE EXCEPTION`) and rolls back without deleting or overwriting existing records.

2. **Seed the Sole Authorized Administrator:**
   - Open `supabase/seed_single_admin.sql`, copy the entire file, paste into a new SQL Editor query, and click **Run**.
   - Expected notice: `Single authorized administrator seeded successfully into public.admin_users.` (or idempotent notice if already present).

3. **Verify Database Readiness (Read-Only Check):**
   ```sql
   SELECT firebase_uid, email, name, role, is_active
   FROM public.admin_users;
   ```
   Confirm exactly **1 row** with `is_active = true`.

4. **Confirm Firebase Third-Party Auth in Supabase Dashboard:**
   - Go to **Supabase Dashboard -> Authentication -> Sign In / Providers (or Third-Party Auth)** -> ensure **Firebase** is enabled and configured with your **Firebase Project ID** (`VITE_FIREBASE_PROJECT_ID`).

---

## 2. Supabase Edge Function (`verify-admin`) Deployment

Run from your project root (or workstation with Supabase CLI installed):

```bash
# 1. Authenticate and link to your Supabase project
supabase login
supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>

# 2. Set required Edge Function server secrets (never commit or expose these values)
supabase secrets set \
  FIREBASE_WEB_API_KEY="<YOUR_FIREBASE_WEB_API_KEY>" \
  SUPABASE_URL="https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<YOUR_SUPABASE_SERVICE_ROLE_KEY>"

# 3. Deploy verify-admin using supabase/config.toml (verify_jwt = false)
supabase functions deploy verify-admin --no-verify-jwt
```

*Note:* `--no-verify-jwt` (matching `[functions.verify-admin] verify_jwt = false` in `supabase/config.toml`) is required so Supabase Gateway forwards Firebase RS256 ID tokens into `verify-admin`, which independently verifies the token via Google Identity Toolkit and checks `public.admin_users`.

---

## 3. Android Termux Firebase Custom-Claim Provisioning (`role: "authenticated"`)

Run these commands inside **Termux** on Android using the Firebase Service Account JSON downloaded from **Firebase Console -> Project Settings -> Service accounts -> Generate new private key** (keep the JSON strictly outside the repository):

```bash
# 1. Install Node.js & git/npm (if not already installed)
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts git

# 2. Clone or navigate into the project directory and install dependencies
cd ~/aman-computer
npm install

# 3. Store your Firebase Service Account JSON securely outside the repo
mkdir -p ~/.secrets
chmod 700 ~/.secrets
# Move your downloaded key file into ~/.secrets/firebase-adminsdk.json, e.g.:
# cp ~/storage/downloads/<service-account-file>.json ~/.secrets/firebase-adminsdk.json
chmod 600 ~/.secrets/firebase-adminsdk.json

# 4. Export credential path in current Termux session
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.secrets/firebase-adminsdk.json"

# 5. Provision role="authenticated" exclusively for the sole authorized admin
node scripts/set-firebase-role-claim.mjs \
  --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" \
  --email "shariqueaman77@gmail.com"

# 6. Verify claims (outputs safe boolean report only — no tokens or PII)
node scripts/set-firebase-role-claim.mjs \
  --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" \
  --verify
```

**Expected verification output:**
```json
{
  "ok": true,
  "mode": "verify",
  "isAuthorizedSingleAdmin": true,
  "hasRoleAuthenticated": true,
  "hasNoAdminClaim": true,
  "unrelatedClaimCount": 0,
  "emailVerified": true,
  "disabled": false,
  "refreshTokensRevoked": false
}
```

**Final step:** After provisioning `role: "authenticated"`, **sign out** (if signed in) and **sign in again** at `/admin` with `shariqueaman77@gmail.com` so Firebase issues a fresh ID token containing `role: "authenticated"`.
