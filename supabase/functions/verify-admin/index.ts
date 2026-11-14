// Supabase Edge Function: verify-admin
// Server-side verification of Firebase ID Tokens + PostgreSQL admin_users verification.
// Fails closed if required server-side secrets, verified email, or authorized origins are missing/invalid.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AUTHORIZED_ADMIN_UID = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
const AUTHORIZED_ADMIN_EMAIL = 'shariqueaman77@gmail.com';
const AUTHORIZED_ADMIN_NAME = 'Sharique Aman';
const AUTHORIZED_ADMIN_ROLE = 'Proprietor / Super Admin';

// Local development origins matching package.json ("dev": "vite --port=3000 --host=0.0.0.0")
// and local preview origins matching package.json ("preview": "vite preview", Vite default port 4173).
const LOCAL_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
] as const;

export const normalizeOrigin = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (
    !trimmed ||
    trimmed === '*' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.endsWith('/') ||
    trimmed.includes('?') ||
    trimmed.includes('#')
  ) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    if (parsed.pathname !== '/') return null;
    if (parsed.search || parsed.hash) return null;
    if (!parsed.hostname || parsed.hostname.includes('*')) return null;
    if (!parsed.origin || parsed.origin === 'null') return null;
    return parsed.origin;
  } catch {
    return null;
  }
};

export const buildAllowedOrigins = (
  getEnv: (key: string) => string | undefined,
  logError?: (...args: unknown[]) => void
): Set<string> => {
  const allowed = new Set<string>(LOCAL_ALLOWED_ORIGINS);
  const rawAppUrl = getEnv('APP_URL');
  if (rawAppUrl && rawAppUrl.trim().length > 0) {
    const appUrlOrigin = normalizeOrigin(rawAppUrl);
    if (appUrlOrigin) {
      allowed.add(appUrlOrigin);
    } else if (logError) {
      logError('verify-admin configuration warning: invalid APP_URL origin ignored');
    }
  }
  return allowed;
};

export const resolveCorsHeaders = (
  requestOrigin: string | null,
  allowedOrigins: Set<string>
): { allowed: boolean; headers: Record<string, string> } => {
  if (requestOrigin === null) {
    return { allowed: true, headers: { Vary: 'Origin' } };
  }

  const normalized = normalizeOrigin(requestOrigin);
  if (!normalized || !allowedOrigins.has(normalized)) {
    return { allowed: false, headers: { Vary: 'Origin' } };
  }

  return {
    allowed: true,
    headers: {
      'Access-Control-Allow-Origin': normalized,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      Vary: 'Origin',
    },
  };
};

export interface VerifyAdminDeps {
  getEnv?: (key: string) => string | undefined;
  fetchFn?: typeof fetch;
  createSupabaseClient?: typeof createClient;
  logError?: (...args: unknown[]) => void;
}

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string>
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

export const createVerifyAdminHandler = (deps: VerifyAdminDeps = {}) => {
  const getEnv = deps.getEnv ?? ((key: string) => Deno.env.get(key));
  const fetchFn = deps.fetchFn ?? fetch;
  const createSupabaseClient = deps.createSupabaseClient ?? createClient;
  const logError = deps.logError ?? ((...args: unknown[]) => console.error(...args));

  return async (req: Request): Promise<Response> => {
    const allowedOrigins = buildAllowedOrigins(getEnv, logError);
    const requestOrigin = req.headers.get('Origin');
    const cors = resolveCorsHeaders(requestOrigin, allowedOrigins);

    if (!cors.allowed) {
      return jsonResponse(
        { authenticated: false, isAuthorizedAdmin: false, error: 'Origin not allowed' },
        403,
        cors.headers
      );
    }

    if (req.method === 'OPTIONS') {
      if (!requestOrigin) {
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Origin not allowed' },
          403,
          cors.headers
        );
      }
      return new Response(null, { status: 204, headers: cors.headers });
    }

    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Missing Authorization header' },
          401,
          cors.headers
        );
      }

      const idToken = authHeader.replace('Bearer ', '').trim();
      if (!idToken) {
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Empty token' },
          401,
          cors.headers
        );
      }

      const firebaseApiKey = getEnv('FIREBASE_WEB_API_KEY') || getEnv('FIREBASE_API_KEY');
      const supabaseUrl = getEnv('SUPABASE_URL');
      const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

      // Fail closed if server secrets are missing
      if (!firebaseApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
        logError('verify-admin configuration error: missing required server environment variables');
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Internal server error' },
          500,
          cors.headers
        );
      }

      // 1. Verify Firebase ID Token directly via Google Identity Toolkit
      const verifyRes = await fetchFn(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      let verifyData: { users?: Array<Record<string, unknown>> } | null = null;
      try {
        verifyData = await verifyRes.json();
      } catch (parseErr) {
        logError(
          'verify-admin identity lookup JSON parse error:',
          parseErr instanceof Error ? parseErr.message : 'Unknown error'
        );
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Internal server error' },
          500,
          cors.headers
        );
      }

      if (verifyRes.status >= 500) {
        logError('verify-admin identity lookup upstream error:', { status: verifyRes.status });
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Internal server error' },
          500,
          cors.headers
        );
      }

      if (!verifyRes.ok || !verifyData || !Array.isArray(verifyData.users) || verifyData.users.length === 0) {
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Invalid or expired Firebase ID token' },
          401,
          cors.headers
        );
      }

      const fbUser = verifyData.users[0];
      if (fbUser.disabled === true) {
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Account is disabled' },
          403,
          cors.headers
        );
      }

      // Require strict boolean emailVerified === true before UID/email allowlist and DB lookup
      if (fbUser.emailVerified !== true) {
        return jsonResponse(
          {
            authenticated: true,
            isAuthorizedAdmin: false,
            error: 'Access denied: Administrator email address must be verified.',
          },
          403,
          cors.headers
        );
      }

      const userUid = String(fbUser.localId || '');
      const userEmail = String(fbUser.email || '').toLowerCase().trim();

      // 2. Enforce strict single-administrator UID and email allowlist before DB lookup
      // Custom claims (e.g. admin=true) never grant admin authorization.
      if (userUid !== AUTHORIZED_ADMIN_UID || userEmail !== AUTHORIZED_ADMIN_EMAIL) {
        return jsonResponse(
          {
            authenticated: true,
            isAuthorizedAdmin: false,
            error: 'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
          },
          403,
          cors.headers
        );
      }

      // 3. Query authoritative PostgreSQL admin_users using server-side service_role key
      const adminClient = createSupabaseClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const byUidRes = await adminClient
        .from('admin_users')
        .select('id, firebase_uid, email, name, role, is_active')
        .eq('firebase_uid', AUTHORIZED_ADMIN_UID)
        .eq('email', AUTHORIZED_ADMIN_EMAIL)
        .eq('is_active', true)
        .maybeSingle();

      if (byUidRes.error) {
        logError('verify-admin database verification error:', { code: byUidRes.error?.code || 'unknown' });
        return jsonResponse(
          { authenticated: false, isAuthorizedAdmin: false, error: 'Internal server error' },
          500,
          cors.headers
        );
      }

      const adminRecord = byUidRes.data as {
        id: string;
        firebase_uid: string;
        email: string;
        name: string;
        role: string;
        is_active: boolean;
      } | null;

      const isAuthorized = Boolean(
        adminRecord &&
          adminRecord.is_active === true &&
          adminRecord.firebase_uid === AUTHORIZED_ADMIN_UID &&
          String(adminRecord.email || '').toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL
      );

      if (!isAuthorized || !adminRecord) {
        return jsonResponse(
          {
            authenticated: true,
            isAuthorizedAdmin: false,
            error: 'Access denied: Administrator record is missing or inactive.',
          },
          403,
          cors.headers
        );
      }

      return jsonResponse(
        {
          authenticated: true,
          isAuthorizedAdmin: true,
          uid: adminRecord.firebase_uid,
          email: adminRecord.email,
          name: adminRecord.name || AUTHORIZED_ADMIN_NAME,
          role: adminRecord.role || AUTHORIZED_ADMIN_ROLE,
        },
        200,
        cors.headers
      );
    } catch (err) {
      logError('verify-admin unexpected error:', err instanceof Error ? err.message : 'Unknown error');
      return jsonResponse(
        { authenticated: false, isAuthorizedAdmin: false, error: 'Internal server error' },
        500,
        cors.headers
      );
    }
  };
};

serve(createVerifyAdminHandler());
