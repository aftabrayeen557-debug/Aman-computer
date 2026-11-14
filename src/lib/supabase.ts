import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { firebaseAuth } from './firebase';

const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env
    ? (import.meta as { env: Record<string, string | undefined> }).env
    : {};

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Checks whether valid Supabase credentials have been configured in .env
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey &&
    supabaseAnonKey.length > 10
  );
};

/**
 * Returns a Firebase ID token for Supabase Third-Party Auth.
 * Automatically force-refreshes the token if the cached token is missing `role: 'authenticated'`.
 */
export interface FirebaseTokenUserLike {
  getIdTokenResult(forceRefresh?: boolean): Promise<{ token: string; claims: Record<string, unknown> }>;
}

export const getRefreshedSupabaseAccessToken = async (
  overrideUser?: FirebaseTokenUserLike | null
): Promise<string | null> => {
  const user = overrideUser ?? firebaseAuth?.currentUser;
  if (!user) return null;
  try {
    const current = await user.getIdTokenResult(false);
    if (current?.claims?.role !== 'authenticated') {
      const refreshed = await user.getIdTokenResult(true);
      return refreshed.token;
    }
    return current.token;
  } catch {
    return null;
  }
};

let client: SupabaseClient | null = null;

if (isSupabaseConfigured()) {
  try {
    /**
     * Official Supabase Third-Party Auth integration with Firebase Authentication.
     * Supabase natively validates asymmetrically signed Firebase ID Tokens (RS256)
     * and evaluates Row Level Security policies using auth.jwt().
     */
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      accessToken: getRefreshedSupabaseAccessToken,
    });
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

/**
 * Verifies live Supabase connectivity with a lightweight public query
 */
export const testSupabaseConnection = async (): Promise<{ ok: boolean; error?: string }> => {
  if (!isSupabaseConfigured() || !client) {
    return { ok: false, error: 'Supabase environment variables are not configured.' };
  }
  try {
    const { error } = await client.from('business_profile').select('id').limit(1);
    if (error && !error.message.includes('0 rows')) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network connectivity error' };
  }
};

export const supabase = client;
export { supabaseUrl, supabaseAnonKey };
