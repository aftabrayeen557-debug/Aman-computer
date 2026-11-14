# Firebase Spark (Free) Single-Admin & Supabase Auth Architecture

Aman Computer runs strictly on the **Firebase Spark (Free) plan** with **zero paid Firebase services** and enforces a **single-administrator security lockdown**:

- **No** Blaze upgrade, billing account, or payment card required
- **No** Firebase Cloud Functions or Identity Platform
- **Email/Password sign-in only** (no registration, sign-up, customer login, staff login, or operator login)
- **Exactly one** authorized administrator account (`Proprietor / Super Admin`)

**Firebase responsibilities:** Email/Password authentication, ID token issuance, and identity verification.  
**Supabase responsibilities:** PostgreSQL + Row Level Security, Storage (`gallery-images`, `update-posters`, `media-library`, `customer-documents`), `verify-admin` Edge Function, single-row authoritative admin allowlist (`public.admin_users`), and all website/business data.

---

## Why `role: "authenticated"` Is Required (Without Granting Admin)

Under Supabase Third-Party Auth, PostgREST maps the Firebase ID token's `role` claim to `auth.role()`. Standard Firebase Email/Password ID tokens omit `role`, so PostgREST executes as `anon` unless `role: "authenticated"` is provisioned via the local Firebase Admin SDK.

Setting `role: "authenticated"` **never** grants admin privileges:
- `public.is_admin()` requires `auth.role() = 'authenticated'`, exact matching sole Firebase UID + normalized email, `!disabled`, AND an active matching row in `public.admin_users` (`is_active = TRUE`).
- `public.admin_users` enforces singleton table constraints (unique index `idx_admin_users_singleton`, `CHECK` constraints, and `BEFORE INSERT OR UPDATE` trigger `enforce_single_admin_user()`) plus API write denial so no second administrator can ever be inserted.
- `supabase/functions/verify-admin` independently validates the Firebase ID token, checks the exact single-admin UID and email allowlist, verifies `public.admin_users.is_active = TRUE`, and returns HTTP `403` for any other Firebase account.
- Non-admin Firebase accounts—even if they hold `role: "authenticated"` or a spoofed `admin: true` claim—cannot read or write `customers`, `receipts`, `staff_members`, `notifications`, `activity_logs`, `terminal_settings`, `customer_enquiries`, or private `customer-documents` Storage.

---

## Secure Local Firebase Admin SDK Setup (`GOOGLE_APPLICATION_CREDENTIALS`)

1. In **Firebase Console -> Project Settings -> Service accounts**, generate a private key JSON file and store it **strictly outside the repository** (e.g., `~/.secrets/aman-firebase-adminsdk.json` with `chmod 600`).
2. **Never** commit service account JSON files, add them to `.env` / `VITE_*`, place them in AI Studio Secrets, or paste them into chat. (`.gitignore` already excludes `*service-account*.json` and `*firebase-adminsdk*.json`.)
3. In a secure local terminal where `firebase-admin` is installed:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/secure/local/path/aman-firebase-adminsdk.json"
   ```

---

## Single-Admin Provisioning & Verification (`scripts/set-firebase-role-claim.mjs`)

The provisioning script strictly permits setting `role: "authenticated"` **only** for the sole authorized Firebase UID and matching email (rejecting all other UIDs/emails and disabled accounts, preserving unrelated custom claims, and never setting `admin: true`):

1. **Provision `role: "authenticated"` for the sole authorized administrator:**
   ```bash
   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --email "shariqueaman77@gmail.com"
   ```
2. **Verify claims safely (read-only boolean report; prints no tokens, UIDs, or emails):**
   ```bash
   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --verify
   ```
3. **Remove `role` claim and revoke refresh tokens immediately:**
   ```bash
   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --revoke-role
   ```

---

## Token Refresh & Database Seeding

* **Refreshing active sessions after provisioning:** Firebase ID tokens remain cached up to 1 hour. After provisioning `role: "authenticated"`, the administrator must either sign out and sign back in on `/login` / `/admin` or let `authService.ts` / `getRefreshedSupabaseAccessToken()` force-refresh via `getIdTokenResult(user, true)`.
* **Seeding the sole admin row:** After applying `supabase/migrations/20261112000000_aman_computer_schema.sql`, execute `supabase/seed_single_admin.sql` manually in the Supabase SQL Editor. It detects conflicting rows without overwriting/deleting them and cannot create a second administrator.
* **Immediate revocation:** Running `UPDATE public.admin_users SET is_active = false;` in Supabase SQL Editor immediately revokes admin access across RLS and `verify-admin`.
