import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  getIdToken,
  getIdTokenResult,
} from 'firebase/auth';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
  SupabaseClient,
} from '@supabase/supabase-js';
import { firebaseAuth, isFirebaseConfigured } from '../../lib/firebase';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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

export type AdminVerificationFailureReason =
  | 'unauthenticated'
  | 'supabase-not-configured'
  | 'unauthorized'
  | 'disabled'
  | 'unverified-email'
  | 'missing-role-claim'
  | 'invalid-token'
  | 'token-error'
  | 'cors-blocked'
  | 'inactive-admin-record'
  | 'edge-function-error'
  | 'network-error';

export interface AdminVerificationResult {
  authorized: boolean;
  profile: AdminProfile | null;
  reason?: AdminVerificationFailureReason;
  error?: string;
}

export interface VerifyAdminAuthDeps {
  supabaseClient?: Pick<SupabaseClient, 'functions' | 'from'> | null;
  supabaseConfigured?: boolean;
  checkRoleClaimFn?: (
    user: User
  ) => Promise<{ token: string; diagnostics: FirebaseTokenClaimDiagnostics } | null>;
}

export interface SignInAdminDeps extends VerifyAdminAuthDeps {
  auth?: typeof firebaseAuth;
  firebaseConfigured?: boolean;
  signInFn?: typeof signInWithEmailAndPassword;
  signOutFn?: typeof firebaseSignOut;
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
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Authentication settings.';
    case 'auth/unauthorized-domain':
      return 'This application domain is not authorized in Firebase Authentication settings.';
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
      return 'Firebase client configuration does not match an authorized Firebase project.';
    case 'auth/user-token-expired':
    case 'auth/requires-recent-login':
      return 'Firebase session expired. Please sign in again.';
    case 'auth/internal-error':
      return 'Firebase Authentication encountered an internal error. Please try again.';
    default:
      return 'Authentication failed. Please check your credentials and connection.';
  }
};

export const PRIVATE_ADMIN_STORAGE_KEYS = [
  'aman_customers',
  'aman_receipts',
  'aman_enquiries',
  'aman_enquiry_follow_ups',
  'aman_enquiry_audit_logs',
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

const extractEdgeFunctionHttpErrorDetails = async (
  err: unknown
): Promise<{ status: number | null; serverError: string }> => {
  const errObj = err as { context?: unknown } | null;
  const ctx = errObj?.context as { status?: number; json?: () => Promise<unknown>; clone?: () => Response } | undefined;
  const status = typeof ctx?.status === 'number' ? ctx.status : null;
  let serverError = '';

  if (ctx) {
    try {
      const target = typeof ctx.clone === 'function' ? ctx.clone() : ctx;
      if (typeof target.json === 'function') {
        const body = (await target.json()) as { error?: unknown } | null;
        if (typeof body?.error === 'string') {
          serverError = body.error.trim();
        }
      }
    } catch {
      // Non-JSON or already consumed response body
    }
  }

  return { status, serverError };
};

const mapVerifiedEdgeError = (
  status: number | null,
  serverError: string
): { reason: AdminVerificationFailureReason; error: string } => {
  if (status === 401) {
    return {
      reason: 'invalid-token',
      error: 'Firebase session token was rejected or expired. Please sign in again.',
    };
  }

  if (status === 403) {
    switch (serverError) {
      case 'Origin not allowed':
        return {
          reason: 'cors-blocked',
          error:
            'Admin verification blocked by Edge Function CORS policy for this origin. Ensure APP_URL matches the site origin and redeploy verify-admin.',
        };
      case 'Account is disabled':
        return {
          reason: 'disabled',
          error: 'This administrator account has been disabled.',
        };
      case 'Access denied: Administrator email address must be verified.':
        return {
          reason: 'unverified-email',
          error: 'Access denied: Administrator email address must be verified.',
        };
      case 'Access denied: Administrator record is missing or inactive.':
        return {
          reason: 'inactive-admin-record',
          error: 'Access denied: Administrator record is missing or inactive in Supabase.',
        };
      case 'Access denied: Authenticated account is not the authorized Aman Computer administrator.':
        return {
          reason: 'unauthorized',
          error: 'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
        };
      default:
        return {
          reason: 'unauthorized',
          error: 'Access denied during server administrator verification (HTTP 403).',
        };
    }
  }

  if (status !== null && status >= 500) {
    return {
      reason: 'edge-function-error',
      error:
        'Admin verification service returned a server error (HTTP 500). Check Supabase Edge Function secrets and database connectivity.',
    };
  }

  return {
    reason: 'edge-function-error',
    error: 'Admin verification service rejected the request unexpectedly.',
  };
};

// Coordinates concurrent verification calls (e.g. signInAdmin + Firebase onAuthStateChanged)
let interactiveSignInPromise: Promise<void> | null = null;
const inFlightVerifications = new Map<string, Promise<AdminVerificationResult>>();

const runSingleAdminVerification = async (
  user: User,
  deps: VerifyAdminAuthDeps = {}
): Promise<AdminVerificationResult> => {
  if (!user || !user.uid || !user.email) {
    return {
      authorized: false,
      profile: null,
      reason: 'unauthenticated',
      error: 'Authenticated Firebase user details are incomplete.',
    };
  }

  const supabaseReady = deps.supabaseConfigured ?? isSupabaseConfigured();
  const supabaseClient = deps.supabaseClient !== undefined ? deps.supabaseClient : supabase;
  if (!supabaseReady || !supabaseClient) {
    return {
      authorized: false,
      profile: null,
      reason: 'supabase-not-configured',
      error:
        'Supabase backend is not configured to verify administrator privileges. Configure VITE_SUPABASE_* environment variables.',
    };
  }

  const normalizedEmail = user.email.toLowerCase().trim();
  if (user.uid !== AUTHORIZED_ADMIN_UID || normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return {
      authorized: false,
      profile: null,
      reason: 'unauthorized',
      error: 'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
    };
  }

  const claimChecker = deps.checkRoleClaimFn ?? checkFirebaseRoleClaim;
  const refreshed = await claimChecker(user);
  if (!refreshed) {
    return {
      authorized: false,
      profile: null,
      reason: 'token-error',
      error: 'Unable to retrieve Firebase ID token claims. Check your network connection and sign in again.',
    };
  }

  let idToken = refreshed.token;
  if (typeof (user as { getIdToken?: (forceRefresh?: boolean) => Promise<string> }).getIdToken === 'function') {
    try {
      idToken = await user.getIdToken();
    } catch {
      return {
        authorized: false,
        profile: null,
        reason: 'token-error',
        error: 'Unable to obtain Firebase ID token for server verification. Please sign in again.',
      };
    }
  }

  if (!idToken || typeof idToken !== 'string' || !idToken.trim()) {
    return {
      authorized: false,
      profile: null,
      reason: 'token-error',
      error: 'Firebase returned an empty session token. Please sign in again.',
    };
  }

  const { diagnostics } = refreshed;
  if (!diagnostics.notDisabledClaim) {
    return {
      authorized: false,
      profile: null,
      reason: 'disabled',
      error: 'This administrator account has been disabled.',
    };
  }

  if (!diagnostics.hasSub || !diagnostics.tokenValidWindow) {
    return {
      authorized: false,
      profile: null,
      reason: 'invalid-token',
      error: 'Firebase session token is invalid or expired. Please sign in again.',
    };
  }

  if (user.emailVerified === false || !diagnostics.emailVerified) {
    return {
      authorized: false,
      profile: null,
      reason: 'unverified-email',
      error: 'Access denied: Administrator email address must be verified.',
    };
  }

  if (!diagnostics.hasRoleAuthenticated) {
    console.warn('Firebase JWT claim check failed:', diagnostics);
    return {
      authorized: false,
      profile: null,
      reason: 'missing-role-claim',
      error:
        'Access denied: Account is missing the required "authenticated" role claim for database access. Provision the Firebase custom claim and sign in again.',
    };
  }

  let fallbackDiagnostic: { reason: AdminVerificationFailureReason; error: string } | null = null;

  // 1. Verify server-side via Supabase Edge Function `verify-admin`
  try {
    const { data, error } = await supabaseClient.functions.invoke('verify-admin', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });

    if (!error) {
      let payload: Record<string, unknown> | null = null;
      if (typeof data === 'string') {
        try {
          payload = JSON.parse(data) as Record<string, unknown>;
        } catch {
          payload = null;
        }
      } else if (data && typeof data === 'object') {
        payload = data as Record<string, unknown>;
      }

      const payloadUid = String(payload?.uid || '').trim();
      const payloadEmail = String(payload?.email || '').toLowerCase().trim();
      if (
        payload?.authenticated === true &&
        payload?.isAuthorizedAdmin === true &&
        payloadUid === AUTHORIZED_ADMIN_UID &&
        payloadEmail === AUTHORIZED_ADMIN_EMAIL
      ) {
        return {
          authorized: true,
          profile: {
            uid: AUTHORIZED_ADMIN_UID,
            email: AUTHORIZED_ADMIN_EMAIL,
            name: String(payload.name || AUTHORIZED_ADMIN_NAME),
            role: String(payload.role || AUTHORIZED_ADMIN_ROLE),
            isAuthorized: true,
          },
        };
      }

      const rejectedMsg =
        typeof payload?.error === 'string' && payload.error.trim()
          ? payload.error.trim()
          : 'Access denied: Server verification rejected administrator authorization.';
      return {
        authorized: false,
        profile: null,
        reason: 'unauthorized',
        error: rejectedMsg,
      };
    }

    const isHttpError =
      error instanceof FunctionsHttpError ||
      (error as { name?: string })?.name === 'FunctionsHttpError' ||
      typeof (error as { context?: { status?: unknown } })?.context?.status === 'number';

    if (isHttpError) {
      const { status, serverError } = await extractEdgeFunctionHttpErrorDetails(error);
      const mapped = mapVerifiedEdgeError(status, serverError);

      // Fail closed immediately on explicit 401/403 authorization/CORS denials; never bypass via fallback
      if (status === 401 || status === 403) {
        return {
          authorized: false,
          profile: null,
          reason: mapped.reason,
          error: mapped.error,
        };
      }

      fallbackDiagnostic = mapped;
    } else if (
      error instanceof FunctionsRelayError ||
      (error as { name?: string })?.name === 'FunctionsRelayError'
    ) {
      fallbackDiagnostic = {
        reason: 'edge-function-error',
        error: 'Supabase Edge Function relay error while contacting verify-admin.',
      };
    } else if (
      error instanceof FunctionsFetchError ||
      (error as { name?: string })?.name === 'FunctionsFetchError'
    ) {
      fallbackDiagnostic = {
        reason: 'network-error',
        error:
          'Unable to reach verify-admin Edge Function (network or CORS origin error). Ensure verify-admin is deployed and APP_URL matches this site origin.',
      };
    } else {
      fallbackDiagnostic = {
        reason: 'edge-function-error',
        error: 'Unable to complete server verification via verify-admin Edge Function.',
      };
    }
  } catch {
    fallbackDiagnostic = {
      reason: 'network-error',
      error:
        'Unable to reach verify-admin Edge Function (network or CORS origin error). Ensure verify-admin is deployed and APP_URL matches this site origin.',
    };
  }

  // 2. Fallback strictly when verify-admin is unreachable or returned 5xx:
  // Verify directly against RLS-protected `public.admin_users` using exact UID + email + is_active.
  try {
    const byUid = await supabaseClient
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
        authorized: true,
        profile: {
          uid: AUTHORIZED_ADMIN_UID,
          email: AUTHORIZED_ADMIN_EMAIL,
          name: byUid.data.name || AUTHORIZED_ADMIN_NAME,
          role: byUid.data.role || AUTHORIZED_ADMIN_ROLE,
          isAuthorized: true,
        },
      };
    }

    if (byUid.error) {
      console.warn('Database single-admin verification rejected:', byUid.error.code || 'rls-error');
      if (fallbackDiagnostic) {
        return {
          authorized: false,
          profile: null,
          reason: fallbackDiagnostic.reason,
          error: fallbackDiagnostic.error,
        };
      }
      return {
        authorized: false,
        profile: null,
        reason: 'unauthorized',
        error:
          'Database administrator verification rejected the session. Check Supabase Third-Party Auth and public.is_admin() rules.',
      };
    }

    return {
      authorized: false,
      profile: null,
      reason: 'inactive-admin-record',
      error: 'Access denied: Administrator record is missing or inactive in Supabase.',
    };
  } catch {
    console.warn('Database single-admin verification rejected.');
    return {
      authorized: false,
      profile: null,
      reason: fallbackDiagnostic?.reason ?? 'network-error',
      error:
        fallbackDiagnostic?.error ??
        'Unable to verify administrator privileges against Supabase. Check network connection.',
    };
  }
};

/**
 * Server-verified Single-Admin Authorization check with detailed safe diagnostics (Deny by default).
 * 1. Enforces exact sole Firebase UID & email allowlist before trusting any session.
 * 2. Obtains Firebase ID token via user.getIdToken() and validates required claims.
 * 3. Verifies Firebase ID token via Supabase Edge Function (`verify-admin`) using supabase.functions.invoke().
 * 4. Falls back only on network/5xx errors to RLS-protected query on `public.admin_users`.
 */
export const verifyAdminAuthorizationDetailed = async (
  user: User,
  deps?: VerifyAdminAuthDeps
): Promise<AdminVerificationResult> => {
  // Skip coalescing when custom test deps are provided so isolated unit tests stay independent
  if (deps) {
    return runSingleAdminVerification(user, deps);
  }

  const cacheKey = user?.uid || '__anonymous__';
  const existing = inFlightVerifications.get(cacheKey);
  if (existing) {
    return existing;
  }

  const verificationPromise = runSingleAdminVerification(user).finally(() => {
    inFlightVerifications.delete(cacheKey);
  });
  inFlightVerifications.set(cacheKey, verificationPromise);
  return verificationPromise;
};

/**
 * Boolean/profile wrapper preserved for compatibility.
 */
export const verifyAdminAuthorization = async (user: User): Promise<AdminProfile | null> => {
  const result = await verifyAdminAuthorizationDetailed(user);
  return result.authorized ? result.profile : null;
};

/**
 * Sign in using real Firebase Email/Password Authentication + server-verified Single-Admin check
 */
export const signInAdmin = async (
  email: string,
  pass: string,
  deps: SignInAdminDeps = {}
): Promise<AdminAuthResult> => {
  const fbReady = deps.firebaseConfigured ?? isFirebaseConfigured();
  const activeAuth = deps.auth !== undefined ? deps.auth : firebaseAuth;
  if (!fbReady || !activeAuth) {
    return {
      success: false,
      error: 'Firebase Authentication is not configured. Add VITE_FIREBASE_* environment variables.',
    };
  }

  const sbReady = deps.supabaseConfigured ?? isSupabaseConfigured();
  if (!sbReady) {
    return {
      success: false,
      error:
        'Supabase backend is not configured to verify administrator privileges. Configure VITE_SUPABASE_* environment variables.',
    };
  }

  const signInFn = deps.signInFn ?? signInWithEmailAndPassword;
  const signOutFn = deps.signOutFn ?? firebaseSignOut;
  const useSharedSignInLock = !deps.signInFn;

  let resolveLock: () => void = () => {};
  if (useSharedSignInLock) {
    interactiveSignInPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
  }

  try {
    const userCredential = await signInFn(
      activeAuth,
      email.trim().toLowerCase(),
      pass
    );
    const user = userCredential.user;

    const verifyDeps: VerifyAdminAuthDeps | undefined =
      deps.supabaseClient !== undefined ||
      deps.supabaseConfigured !== undefined ||
      deps.checkRoleClaimFn !== undefined
        ? {
            supabaseClient: deps.supabaseClient,
            supabaseConfigured: deps.supabaseConfigured,
            checkRoleClaimFn: deps.checkRoleClaimFn,
          }
        : undefined;

    const verification = await verifyAdminAuthorizationDetailed(user, verifyDeps);
    if (!verification.authorized || !verification.profile || !verification.profile.isAuthorized) {
      await signOutFn(activeAuth);
      clearPrivateAdminStorage();
      return {
        success: false,
        error:
          verification.error ||
          'Access denied: Authenticated account is not the authorized Aman Computer administrator.',
        isAuthorizedAdmin: false,
      };
    }

    return {
      success: true,
      user,
      profile: verification.profile,
      isAuthorizedAdmin: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: mapFirebaseAuthError(err),
    };
  } finally {
    if (useSharedSignInLock) {
      interactiveSignInPromise = null;
      resolveLock();
    }
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
  callback: (
    user: User | null,
    profile: AdminProfile | null,
    reason?: 'unauthenticated' | 'unauthorized',
    errorMessage?: string
  ) => void
): (() => void) => {
  const activeAuth = firebaseAuth;
  if (!activeAuth) {
    callback(null, null, 'unauthenticated');
    return () => {};
  }

  return onAuthStateChanged(activeAuth, async (user) => {
    if (interactiveSignInPromise) {
      await interactiveSignInPromise;
      user = activeAuth.currentUser;
    }

    if (!user) {
      callback(null, null, 'unauthenticated');
      return;
    }

    const verification = await verifyAdminAuthorizationDetailed(user);
    if (!verification.authorized || !verification.profile || !verification.profile.isAuthorized) {
      await firebaseSignOut(activeAuth);
      clearPrivateAdminStorage();
      callback(null, null, 'unauthorized', verification.error);
    } else {
      callback(user, verification.profile);
    }
  });
};
