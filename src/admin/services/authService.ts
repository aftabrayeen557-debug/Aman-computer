import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  getIdToken,
  getIdTokenResult,
} from 'firebase/auth';
import { firebaseAuth, isFirebaseConfigured } from '../../lib/firebase';
import { supabase, isSupabaseConfigured, supabaseUrl, supabaseAnonKey } from '../../lib/supabase';

export const AUTHORIZED_ADMIN_UID = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
export const AUTHORIZED_ADMIN_EMAIL = 'shariqueaman77@gmail.com';
export const AUTHORIZED_ADMIN_NAME = 'Sharique Aman';
export const AUTHORIZED_ADMIN_ROLE = 'Proprietor / Super Admin';

export interface AdminAuthResult {
  success: boolean;
  user?: User;
  profile?: AdminProfile;
  error?: string;
  isAuthorizedAdmin?: boolean;
}

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  isAuthorized: boolean;
}

export interface FirebaseTokenClaimDiagnostics {
  hasSub: boolean;
  hasRoleAuthenticated: boolean;
  emailVerified: boolean;
  hasNoAdminClaim: boolean;
  notDisabledClaim: boolean;
  tokenValidWindow: boolean;
}

export interface SingleAdminRecordLike {
  firebase_uid?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string | null;
  is_active?: boolean | null;
}

/**
 * Evaluates Firebase JWT claims strictly as booleans without exposing raw JWTs, UIDs, or emails.
 */
export const evaluateTokenClaimDiagnostics = (
  claims: Record<string, unknown> | null | undefined,
  nowSeconds: number = Math.floor(Date.now() / 1000)
): FirebaseTokenClaimDiagnostics => {
  const safeClaims = claims && typeof claims === 'object' ? claims : {};
  const expValue = typeof safeClaims.exp === 'number' ? safeClaims.exp : Number(safeClaims.exp || 0);

  return {
    hasSub: typeof safeClaims.sub === 'string' && safeClaims.sub.trim().length > 0,
    hasRoleAuthenticated: safeClaims.role === 'authenticated',
    emailVerified: safeClaims.email_verified === true,
    hasNoAdminClaim: safeClaims.admin !== true,
    notDisabledClaim: safeClaims.disabled !== true,
    tokenValidWindow: Number.isFinite(expValue) && expValue > nowSeconds,
  };
};

/**
 * Pure single-admin policy evaluator combining Firebase UID, email, token claims,
 * and authoritative public.admin_users database record.
 * Never authorizes via custom `admin: true` claim or `role: "authenticated"` alone.
 */
export const evaluateSingleAdminAuthorization = (params: {
  uid?: string | null;
  email?: string | null;
  claims?: Record<string, unknown> | null;
  adminRecord?: SingleAdminRecordLike | null;
  nowSeconds?: number;
}): { authorized: boolean; reason: string } => {
  const uid = String(params.uid || '').trim();
  const email = String(params.email || '').toLowerCase().trim();

  if (!uid || uid !== AUTHORIZED_ADMIN_UID) {
    return { authorized: false, reason: 'uid-mismatch' };
  }

  if (!email || email !== AUTHORIZED_ADMIN_EMAIL) {
    return { authorized: false, reason: 'email-mismatch' };
  }

  const diag = evaluateTokenClaimDiagnostics(params.claims, params.nowSeconds);
  if (!diag.hasSub || !diag.hasRoleAuthenticated || !diag.notDisabledClaim || !diag.tokenValidWindow) {
    return { authorized: false, reason: 'invalid-token-claims' };
  }

  const record = params.adminRecord;
  if (!record || record.is_active !== true) {
    return { authorized: false, reason: 'inactive-or-missing-admin-record' };
  }

  if (String(record.firebase_uid || '').trim() !== AUTHORIZED_ADMIN_UID) {
    return { authorized: false, reason: 'admin-record-uid-mismatch' };
  }

  if (String(record.email || '').toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL) {
    return { authorized: false, reason: 'admin-record-email-mismatch' };
  }

  return { authorized: true, reason: 'authorized' };
};

/**
 * Force-refreshes the Firebase ID token and returns boolean-only claim diagnostics.
 */
export const checkFirebaseRoleClaim = async (
  user: User
): Promise<{ token: string; diagnostics: FirebaseTokenClaimDiagnostics } | null> => {
  if (!user) return null;
  try {
    const tokenResult = await getIdTokenResult(user, true);
    const diagnostics = evaluateTokenClaimDiagnostics(
      tokenResult.claims as Record<string, unknown>
    );
    return {
      token: tokenResult.token,
      diagnostics,
    };
  } catch {
    return null;
  }
};

/**
 * Maps Firebase Auth error codes to safe, descriptive user-facing error messages
 */
export const mapFirebaseAuthError = (err: { code?: string; message?: string } | null | undefined): string => {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid admin email address or password.';
    case 'auth/user-disabled':
      return 'This administrator account has been disabled.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Terminal access temporarily locked.';
    case 'auth/network-request-failed':
      return 'Network failure. Unable to reach authentication servers.';
    case 'auth/invalid-email':
      return 'Please enter a valid admin email address.';
    default:
      return 'Authentication failed. Please check your credentials and connection.';
  }
};

export const PRIVATE_ADMIN_STORAGE_KEYS = [
  'aman_customers',
  'aman_receipts',
  'aman_enquiries',
  'aman_staff',
  'aman_activity_logs',
  'aman_notifications',
] as const;

export const PUBLIC_WEBSITE_STORAGE_KEYS = [
  'aman_services',
  'aman_latest_updates',
  'aman_doc_requirements',
  'aman_gallery',
  'aman_journey',
  'aman_website_content',
  'aman_faqs',
  'aman_testimonials',
  'aman_business_profile',
  'aman_media',
] as const;

/**
 * Removes sensitive private business records from browser storage on logout or revocation.
 * Preserves public website content and owner-managed public showcase caches.
 */
export const clearPrivateAdminStorage = (
  storage: Pick<Storage, 'removeItem'> | null = typeof window !== 'undefined' ? window.localStorage : null
): void => {
  if (!storage) return;
  for (const key of PRIVATE_ADMIN_STORAGE_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      // Ignore storage access errors
    }
  }
};

/**
 * Server-verified Single-Admin Authorization check (Deny by default).
 * 1. Enforces exact sole Firebase UID & email allowlist before trusting any session.
 * 2. Verifies Firebase ID token via Supabase Edge Function (`verify-admin`).
 * 3. Falls back to RLS-protected query on `public.admin_users` using Supabase Third-Party Auth JWT claims.
 */
export const verifyAdminAuthorization = async (user: User): Promise<AdminProfile | null> => {
  if (!user || !user.uid || !user.email) return null;
  if (!isSupabaseConfigured()) return null;

  const normalizedEmail = user.email.toLowerCase().trim();
  if (user.uid !== AUTHORIZED_ADMIN_UID || normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return null;
  }

  const refreshed = await checkFirebaseRoleClaim(user);
  if (!refreshed) {
    return null;
  }

  const { token: idToken, diagnostics } = refreshed;
  if (
    !diagnostics.hasSub ||
    !diagnostics.notDisabledClaim ||
    !diagnostics.hasRoleAuthenticated ||
    !diagnostics.tokenValidWindow
  ) {
    console.warn('Firebase JWT claim check failed:', diagnostics);
    return null;
  }

  // 1. Verify server-side via Supabase Edge Function `verify-admin`
  try {
    const fnRes = await fetch(`${supabaseUrl}/functions/v1/verify-admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        apikey: supabaseAnonKey,
        'Content-Type': 'application/json',
      },
    });

    if (fnRes.ok) {
      const payload = await fnRes.json();
      const payloadUid = String(payload?.uid || '').trim();
      const payloadEmail = String(payload?.email || '').toLowerCase().trim();
      if (
        payload?.authenticated === true &&
        payload?.isAuthorizedAdmin === true &&
        payloadUid === AUTHORIZED_ADMIN_UID &&
        payloadEmail === AUTHORIZED_ADMIN_EMAIL
      ) {
        return {
          uid: AUTHORIZED_ADMIN_UID,
          email: AUTHORIZED_ADMIN_EMAIL,
          name: payload.name || AUTHORIZED_ADMIN_NAME,
          role: payload.role || AUTHORIZED_ADMIN_ROLE,
          isAuthorized: true,
        };
      }
      return null;
    } else if (fnRes.status === 401 || fnRes.status === 403) {
      return null;
    }
  } catch {
    // Edge Function may not be deployed yet; fall back cleanly to RLS-protected query below
  }

  // 2. Verify directly against RLS-protected `public.admin_users` using exact UID + email + is_active
  if (supabase) {
    try {
      const byUid = await supabase
        .from('admin_users')
        .select('firebase_uid, email, name, role, is_active')
        .eq('firebase_uid', AUTHORIZED_ADMIN_UID)
        .eq('email', AUTHORIZED_ADMIN_EMAIL)
        .eq('is_active', true)
        .maybeSingle();

      if (
        !byUid.error &&
        byUid.data &&
        byUid.data.is_active === true &&
        byUid.data.firebase_uid === AUTHORIZED_ADMIN_UID &&
        String(byUid.data.email || '').toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL
      ) {
        return {
          uid: AUTHORIZED_ADMIN_UID,
          email: AUTHORIZED_ADMIN_EMAIL,
          name: byUid.data.name || AUTHORIZED_ADMIN_NAME,
          role: byUid.data.role || AUTHORIZED_ADMIN_ROLE,
          isAuthorized: true,
        };
      }
    } catch {
      console.warn('Database single-admin verification rejected.');
    }
  }

  // Deny access by default
  return null;
};

/**
 * Sign in using real Firebase Email/Password Authentication + server-verified Single-Admin check
 */
export const signInAdmin = async (
  email: string,
  pass: string
): Promise<AdminAuthResult> => {
  if (!isFirebaseConfigured() || !firebaseAuth) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured. Add VITE_FIREBASE_* environment variables.',
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase backend is not configured to verify administrator privileges. Configure VITE_SUPABASE_* environment variables.',
    };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseAuth,
      email.trim().toLowerCase(),
      pass
    );
    const user = userCredential.user;

    const adminProfile = await verifyAdminAuthorization(user);
    if (!adminProfile || !adminProfile.isAuthorized) {
      await firebaseSignOut(firebaseAuth);
      clearPrivateAdminStorage();
      return {
        success: false,
        error: 'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
        isAuthorizedAdmin: false,
      };
    }

    return {
      success: true,
      user,
      profile: adminProfile,
      isAuthorizedAdmin: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: mapFirebaseAuthError(err),
    };
  }
};

/**
 * Sends a Firebase password reset email strictly for the sole authorized administrator email.
 */
export const sendAdminPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  if (!isFirebaseConfigured() || !firebaseAuth) {
    return {
      success: false,
      message: 'Firebase Authentication is not configured yet.',
    };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized !== AUTHORIZED_ADMIN_EMAIL) {
    return {
      success: false,
      message: 'Enter the authorized admin email address to request a password reset.',
    };
  }

  try {
    await sendPasswordResetEmail(firebaseAuth, AUTHORIZED_ADMIN_EMAIL);
    return {
      success: true,
      message: 'Password reset link sent to the authorized administrator email.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: mapFirebaseAuthError(err),
    };
  }
};

/**
 * Sign out of Firebase session cleanly and clear sensitive browser storage
 */
export const signOutAdmin = async (): Promise<void> => {
  clearPrivateAdminStorage();
  if (firebaseAuth) {
    await firebaseSignOut(firebaseAuth);
  }
};

/**
 * Retrieve fresh Firebase ID token for the current session
 */
export const getCurrentAdminToken = async (forceRefresh = false): Promise<string | null> => {
  if (!firebaseAuth || !firebaseAuth.currentUser) return null;
  try {
    return await getIdToken(firebaseAuth.currentUser, forceRefresh);
  } catch (e) {
    console.error('Failed to get Firebase ID token:', e);
    return null;
  }
};

/**
 * Subscribe to Firebase auth state changes with automatic server admin verification
 */
export const subscribeToAdminAuth = (
  callback: (user: User | null, profile: AdminProfile | null, reason?: 'unauthenticated' | 'unauthorized') => void
): (() => void) => {
  const activeAuth = firebaseAuth;
  if (!activeAuth) {
    callback(null, null, 'unauthenticated');
    return () => {};
  }

  return onAuthStateChanged(activeAuth, async (user) => {
    if (!user) {
      callback(null, null, 'unauthenticated');
      return;
    }

    const profile = await verifyAdminAuthorization(user);
    if (!profile || !profile.isAuthorized) {
      await firebaseSignOut(activeAuth);
      callback(null, null, 'unauthorized');
    } else {
      callback(user, profile);
    }
  });
};
