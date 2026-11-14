#!/usr/bin/env node
/**
 * Firebase Spark (Free) Compatible Single-Admin Role Claim Provisioning Script
 *
 * Sets `role: "authenticated"` exclusively for the sole authorized Aman Computer
 * administrator (`AUTHORIZED_ADMIN_UID` / `AUTHORIZED_ADMIN_EMAIL`) using the
 * local Firebase Admin SDK without requiring Blaze billing, Identity Platform,
 * or Firebase Cloud Functions.
 *
 * Security guarantees:
 * - Single-admin allowlist: rejects provisioning for every other UID or email.
 * - Verifies supplied email matches the authorized Firebase UID record.
 * - Never embeds, commits, or prints service account credentials, tokens, UIDs, or emails.
 * - Preserves all unrelated existing custom claims on the Firebase user.
 * - NEVER sets `admin: true` (public.admin_users.is_active + UID allowlist remain authoritative).
 * - Retains safe read-only `--verify` and `--revoke-role` / `--revoke-tokens` support.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS="/secure/local/path/service-account.json"
 *   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --email "shariqueaman77@gmail.com"
 *   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --verify
 *   node scripts/set-firebase-role-claim.mjs --uid "Yr0Wr7PuuAdOIMaqohmqaINNbNC2" --revoke-role
 */

import { pathToFileURL } from 'node:url';

export const AUTHORIZED_ADMIN_UID = 'Yr0Wr7PuuAdOIMaqohmqaINNbNC2';
export const AUTHORIZED_ADMIN_EMAIL = 'shariqueaman77@gmail.com';

const RESERVED_OIDC_CLAIMS = new Set([
  'acr',
  'amr',
  'at_hash',
  'aud',
  'auth_time',
  'azp',
  'cnf',
  'c_hash',
  'email',
  'email_verified',
  'exp',
  'firebase',
  'iat',
  'iss',
  'jti',
  'nbf',
  'nonce',
  'phone_number',
  'sub',
  'user_id',
]);

export function sanitizeExistingClaims(existingClaims) {
  const safe = {};
  if (existingClaims && typeof existingClaims === 'object' && !Array.isArray(existingClaims)) {
    for (const [key, value] of Object.entries(existingClaims)) {
      if (
        !RESERVED_OIDC_CLAIMS.has(key) &&
        key !== 'admin' &&
        key !== '__proto__' &&
        key !== 'constructor' &&
        key !== 'prototype'
      ) {
        safe[key] = value;
      }
    }
  }
  return safe;
}

export function mergeAuthenticatedRoleClaims(existingClaims) {
  return {
    ...sanitizeExistingClaims(existingClaims),
    role: 'authenticated',
  };
}

export function removeAuthenticatedRoleClaims(existingClaims) {
  const next = sanitizeExistingClaims(existingClaims);
  delete next.role;
  return next;
}

/**
 * Pure single-admin target validator for provisioning.
 * Permits provisioning ONLY when CLI arguments (if provided) and fetched Firebase
 * user record exactly match the sole authorized UID and email.
 */
export function validateProvisioningTarget(args, user) {
  const argUid = String(args?.uid || '').trim();
  const argEmail = String(args?.email || '').toLowerCase().trim();

  if (argUid && argUid !== AUTHORIZED_ADMIN_UID) {
    return { allowed: false, reason: 'UID is not permitted by single-admin policy.' };
  }

  if (argEmail && argEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return { allowed: false, reason: 'Email is not permitted by single-admin policy.' };
  }

  if (!user) {
    return { allowed: false, reason: 'Target Firebase user record is required.' };
  }

  const recordUid = String(user.uid || '').trim();
  const recordEmail = String(user.email || '').toLowerCase().trim();

  if (recordUid !== AUTHORIZED_ADMIN_UID) {
    return { allowed: false, reason: 'Fetched user UID does not match sole authorized administrator.' };
  }

  if (recordEmail !== AUTHORIZED_ADMIN_EMAIL) {
    return { allowed: false, reason: 'Fetched user email does not match sole authorized administrator.' };
  }

  if (argEmail && argEmail !== recordEmail) {
    return { allowed: false, reason: 'Supplied email does not match the authorized UID record.' };
  }

  if (user.disabled === true) {
    return { allowed: false, reason: 'Account is disabled in Firebase Auth.' };
  }

  return { allowed: true, reason: 'authorized-single-admin' };
}

export function buildSafeClaimVerificationReport(user, mode = 'verify', refreshTokensRevoked = false) {
  const claims = user?.customClaims && typeof user.customClaims === 'object' ? user.customClaims : {};
  const unrelatedClaimCount = Object.keys(claims).filter((k) => k !== 'role' && k !== 'admin').length;
  const uidMatches = String(user?.uid || '').trim() === AUTHORIZED_ADMIN_UID;
  const emailMatches = String(user?.email || '').toLowerCase().trim() === AUTHORIZED_ADMIN_EMAIL;

  return {
    ok: true,
    mode,
    isAuthorizedSingleAdmin: uidMatches && emailMatches,
    hasRoleAuthenticated: claims.role === 'authenticated',
    hasNoAdminClaim: claims.admin !== true,
    unrelatedClaimCount,
    emailVerified: user?.emailVerified === true,
    disabled: user?.disabled === true,
    refreshTokensRevoked: Boolean(refreshTokensRevoked),
  };
}

export function parseCliArgs(argv) {
  const args = {
    uid: '',
    email: '',
    verify: false,
    revokeRole: false,
    revokeTokens: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--uid' && argv[i + 1]) args.uid = argv[++i].trim();
    else if (arg === '--email' && argv[i + 1]) args.email = argv[++i].trim();
    else if (arg === '--verify') args.verify = true;
    else if (arg === '--revoke-role') args.revokeRole = true;
    else if (arg === '--revoke-tokens') args.revokeTokens = true;
  }
  return args;
}

async function runCli() {
  const args = parseCliArgs(process.argv.slice(2));
  if ((!args.uid && !args.email) || (args.verify && args.revokeRole)) {
    console.error(
      'Usage: node scripts/set-firebase-role-claim.mjs (--uid <UID> | --email <EMAIL>) [--verify | --revoke-role] [--revoke-tokens]'
    );
    process.exit(1);
  }

  // Pre-validate single-admin restriction before touching Firebase when provisioning
  if (!args.verify && !args.revokeRole) {
    if (args.uid && args.uid !== AUTHORIZED_ADMIN_UID) {
      console.error(JSON.stringify({ ok: false, mode: 'provision', reason: 'UID is not permitted by single-admin policy.' }));
      process.exit(1);
    }
    if (args.email && args.email.toLowerCase().trim() !== AUTHORIZED_ADMIN_EMAIL) {
      console.error(JSON.stringify({ ok: false, mode: 'provision', reason: 'Email is not permitted by single-admin policy.' }));
      process.exit(1);
    }
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      'Error: GOOGLE_APPLICATION_CREDENTIALS must point to your local Firebase Service Account JSON file.'
    );
    process.exit(1);
  }

  const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');

  if (getApps().length === 0) {
    initializeApp({ credential: applicationDefault() });
  }

  const auth = getAuth();
  const user = args.uid ? await auth.getUser(args.uid) : await auth.getUserByEmail(args.email);

  if (args.verify) {
    console.log(JSON.stringify(buildSafeClaimVerificationReport(user, 'verify', false)));
    return;
  }

  if (args.revokeRole) {
    const nextClaims = removeAuthenticatedRoleClaims(user.customClaims);
    await auth.setCustomUserClaims(user.uid, Object.keys(nextClaims).length > 0 ? nextClaims : null);
    await auth.revokeRefreshTokens(user.uid);
    const updated = await auth.getUser(user.uid);
    console.log(JSON.stringify(buildSafeClaimVerificationReport(updated, 'revoke-role', true)));
    return;
  }

  const targetCheck = validateProvisioningTarget(args, user);
  if (!targetCheck.allowed) {
    console.error(
      JSON.stringify({
        ok: false,
        mode: 'provision',
        reason: targetCheck.reason,
      })
    );
    process.exit(1);
  }

  const nextClaims = mergeAuthenticatedRoleClaims(user.customClaims);
  await auth.setCustomUserClaims(user.uid, nextClaims);

  if (args.revokeTokens) {
    await auth.revokeRefreshTokens(user.uid);
  }

  const updated = await auth.getUser(user.uid);
  console.log(
    JSON.stringify({
      ...buildSafeClaimVerificationReport(updated, 'provision', args.revokeTokens),
      nextStep:
        'User must refresh ID token via getIdTokenResult(user, true) or sign out and sign back in.',
    })
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((err) => {
    console.error(
      JSON.stringify({
        ok: false,
        error: err?.message || 'Unexpected Firebase Admin SDK error',
      })
    );
    process.exit(1);
  });
}
