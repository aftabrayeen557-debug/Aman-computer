// Supabase Edge Function: verify-admin
// Server-side verification of Firebase ID Tokens + PostgreSQL admin_users verification.
// Fails closed if required server-side secrets or tokens are missing/invalid.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AUTHORIZED_ADMIN_UID = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
const AUTHORIZED_ADMIN_EMAIL = 'shariqueaman77@gmail.com';
const AUTHORIZED_ADMIN_NAME = 'Sharique Aman';
const AUTHORIZED_ADMIN_ROLE = 'Proprietor / Super Admin';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const idToken = authHeader.replace('Bearer ', '').trim();
    if (!idToken) {
      return new Response(
        JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: 'Empty token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firebaseApiKey = Deno.env.get('FIREBASE_WEB_API_KEY') || Deno.env.get('FIREBASE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Fail closed if server secrets are missing
    if (!firebaseApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({
          authenticated: false,
          isAuthorizedAdmin: false,
          error: 'Edge Function server secrets (FIREBASE_WEB_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) are not configured.',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Verify Firebase ID Token directly via Google Identity Toolkit
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );

    const verifyData = await verifyRes.json();
    if (!verifyRes.ok || !Array.isArray(verifyData.users) || verifyData.users.length === 0) {
      return new Response(
        JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: 'Invalid or expired Firebase ID token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fbUser = verifyData.users[0];
    if (fbUser.disabled === true) {
      return new Response(
        JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: 'Account is disabled' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userUid = String(fbUser.localId || '');
    const userEmail = String(fbUser.email || '').toLowerCase().trim();

    // 2. Enforce strict single-administrator UID and email allowlist before DB lookup
    // Custom claims (e.g. admin=true) never grant admin authorization.
    if (userUid !== AUTHORIZED_ADMIN_UID || userEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return new Response(
        JSON.stringify({
          authenticated: true,
          isAuthorizedAdmin: false,
          error: 'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Query authoritative PostgreSQL admin_users using server-side service_role key
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
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
      return new Response(
        JSON.stringify({ authenticated: true, isAuthorizedAdmin: false, error: 'Failed to verify admin privileges' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      return new Response(
        JSON.stringify({
          authenticated: true,
          isAuthorizedAdmin: false,
          error: 'Access denied: Administrator record is missing or inactive.',
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        authenticated: true,
        isAuthorizedAdmin: true,
        uid: adminRecord.firebase_uid,
        email: adminRecord.email,
        name: adminRecord.name || AUTHORIZED_ADMIN_NAME,
        role: adminRecord.role || AUTHORIZED_ADMIN_ROLE,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ authenticated: false, isAuthorizedAdmin: false, error: err?.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
