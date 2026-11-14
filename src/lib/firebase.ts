import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  Auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  getIdToken,
} from 'firebase/auth';

/**
 * Firebase Client Configuration
 * Uses Vite environment variables prefixed with VITE_
 */
const env: Record<string, string | undefined> =
  typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, string | undefined> }).env
    ? (import.meta as { env: Record<string, string | undefined> }).env
    : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
};

/**
 * Checks whether valid Firebase credentials have been configured in .env
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.length > 5 &&
    firebaseConfig.projectId &&
    firebaseConfig.authDomain
  );
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Enforce long-lived local session persistence across browser reloads
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Firebase setPersistence warning:', err);
    });
  } catch (err) {
    console.error('Failed to initialize Firebase App:', err);
  }
}

export { app as firebaseApp, auth as firebaseAuth };
export type { User as FirebaseUser };
