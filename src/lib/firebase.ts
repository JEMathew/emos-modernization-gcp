import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  type Unsubscribe
} from 'firebase/firestore';
import baseFirebaseConfig from '../../firebase-applet-config.json';
import type { Interaction, UserProfile, EnterpriseWorkload, ProgramAlignment } from '../types';
import { redactSecrets } from './guardrails';

// Resolve Auth Domain dynamically:
// - In production browser environments (or emos-modernization.ai.studio), use the same-origin domain
//   so Google OAuth callback and session storage stay on the same origin (preventing Android Chrome isolation errors).
// - For localhost development, preserve codev-0326.firebaseapp.com.
export function resolveAuthDomain(hostname?: string): string {
  const currentHost = hostname ?? (typeof window !== 'undefined' && window.location ? window.location.hostname : '');

  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return baseFirebaseConfig.authDomain;
  }
  if (currentHost === 'emos-modernization.ai.studio') {
    return 'emos-modernization.ai.studio';
  }

  // Safe environment check without assuming global process object in Vite browser bundles
  const isProd =
    (typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.PROD)) ||
    (typeof process !== 'undefined' && Boolean(process.env && process.env.NODE_ENV === 'production'));

  if (isProd && currentHost.includes('emos-modernization.ai.studio')) {
    return 'emos-modernization.ai.studio';
  }

  return baseFirebaseConfig.authDomain;
}

export const firebaseConfig = {
  ...baseFirebaseConfig,
  authDomain: resolveAuthDomain(),
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase integration instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Mobile platform detection for redirect-based authentication flow
export function isMobileBrowser(userAgent?: string): boolean {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

// Friendly error mapper for Firebase authentication exceptions
export function getFriendlyAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown error occurred during sign-in.';

  const code = typeof error.code === 'string' ? error.code : '';
  const message = typeof error.message === 'string' ? error.message : String(error);

  if (code === 'auth/popup-blocked') {
    return 'The sign-in popup was blocked by your browser. Please allow popups for EMOS or use a mobile browser.';
  }

  if (code === 'auth/popup-closed-by-user') {
    return 'The sign-in window was closed before completing authentication.';
  }

  if (code === 'auth/network-request-failed' || message.includes('network')) {
    return 'Network connection failure while contacting authentication servers. Please check your internet connection and try again.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for Google Sign-In in the Firebase project settings. Please contact the administrator.';
  }

  if (
    message.includes('missing initial state') ||
    message.includes('sessionStorage') ||
    code === 'auth/null-user'
  ) {
    return 'Unable to verify session state across browser tabs. Please ensure cookies and storage are enabled, or retry signing in.';
  }

  return redactSecrets(message || 'Failed to complete Google Sign-In.');
}

// Operation types for standard error handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authenticated: boolean;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: redactSecrets(error instanceof Error ? error.message : String(error)),
    authenticated: Boolean(auth.currentUser),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Strict undefined-stripping utility (Zero-Crash Payload Hygiene)
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (value === undefined) return null;
      return typeof value === 'string' ? redactSecrets(value) : value;
    })
  );
}

// Initial authenticated connection test against a path allowed by the rules.
export async function testConnection(userId: string): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'users', userId));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client reports offline. Check connectivity.");
    }
    return false;
  }
}

// Authentication Helpers
// Track redirect processing to prevent duplicate handling
let redirectProcessingPromise: Promise<User | null> | null = null;

export type PopupSignInExecutor = () => Promise<{ user: User }>;
export type RedirectSignInExecutor = () => Promise<void>;
export type RedirectResultExecutor = () => Promise<{ user: User } | null>;
export type ProfileSyncExecutor = (user: User) => Promise<void>;

let popupExecutorOverride: PopupSignInExecutor | null = null;
let redirectExecutorOverride: RedirectSignInExecutor | null = null;
let redirectResultExecutorOverride: RedirectResultExecutor | null = null;
let profileSyncExecutorOverride: ProfileSyncExecutor | null = null;

export function setAuthExecutorsForTesting(overrides: {
  popup?: PopupSignInExecutor | null;
  redirect?: RedirectSignInExecutor | null;
  redirectResult?: RedirectResultExecutor | null;
  profileSync?: ProfileSyncExecutor | null;
}) {
  if ('popup' in overrides) popupExecutorOverride = overrides.popup ?? null;
  if ('redirect' in overrides) redirectExecutorOverride = overrides.redirect ?? null;
  if ('redirectResult' in overrides) redirectResultExecutorOverride = overrides.redirectResult ?? null;
  if ('profileSync' in overrides) profileSyncExecutorOverride = overrides.profileSync ?? null;
  redirectProcessingPromise = null;
}

export async function processRedirectResult(): Promise<User | null> {
  if (redirectProcessingPromise) {
    return redirectProcessingPromise;
  }

  redirectProcessingPromise = (async () => {
    try {
      const result = redirectResultExecutorOverride
        ? await redirectResultExecutorOverride()
        : await getRedirectResult(auth);
      if (result && result.user) {
        if (profileSyncExecutorOverride) {
          await profileSyncExecutorOverride(result.user);
        } else {
          await syncUserProfile(result.user);
        }
        return result.user;
      }
      return null;
    } catch (error: any) {
      // In non-browser environments or when redirect auth isn't supported, return null gracefully
      if (error?.code === 'auth/operation-not-supported-in-this-environment') {
        return null;
      }
      console.error("Google Sign-In redirect result error:", redactSecrets(error instanceof Error ? error.message : String(error)));
      throw error;
    }
  })();

  return redirectProcessingPromise;
}

export async function signInWithGoogle(options?: { forceRedirect?: boolean; forcePopup?: boolean }): Promise<User | null> {
  const useRedirect = options?.forceRedirect ?? (!options?.forcePopup && isMobileBrowser());

  if (useRedirect) {
    try {
      if (redirectExecutorOverride) {
        await redirectExecutorOverride();
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
      return null;
    } catch (error: any) {
      console.error("Google Sign-In redirect error:", redactSecrets(error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  try {
    const result = popupExecutorOverride
      ? await popupExecutorOverride()
      : await signInWithPopup(auth, googleProvider);
    if (result.user) {
      if (profileSyncExecutorOverride) {
        await profileSyncExecutorOverride(result.user);
      } else {
        await syncUserProfile(result.user);
      }
    }
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In popup error:", redactSecrets(error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export type ProfileWriter = (userPath: string, profile: UserProfile) => Promise<void>;
let profileWriterOverride: ProfileWriter | null = null;

export function setProfileWriterForTesting(writer: ProfileWriter | null) {
  profileWriterOverride = writer;
}

// Database Helpers strictly user-isolated to /users/{userId}/interactions/{interactionId}
export async function syncUserProfile(user: User): Promise<void> {
  const userPath = `users/${user.uid}`;
  const now = new Date().toISOString();
  const profile: UserProfile = {
    userId: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    createdAt: user.metadata.creationTime || now,
    lastActiveAt: now,
  };

  try {
    if (profileWriterOverride) {
      await profileWriterOverride(userPath, profile);
    } else {
      await setDoc(doc(db, userPath), sanitizeForFirestore(profile), { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }
}

export async function saveInteraction(userId: string, interaction: Interaction): Promise<void> {
  const path = `users/${userId}/interactions/${interaction.id}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...interaction,
      userId,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, path), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateInteraction(userId: string, interactionId: string, updates: Partial<Interaction>): Promise<void> {
  const path = `users/${userId}/interactions/${interactionId}`;
  try {
    const sanitized = sanitizeForFirestore({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, path), sanitized);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInteraction(userId: string, interactionId: string): Promise<void> {
  const path = `users/${userId}/interactions/${interactionId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToUserInteractions(
  userId: string,
  onData: (interactions: Interaction[]) => void,
  onError: (error: any) => void
): Unsubscribe {
  const path = `users/${userId}/interactions`;
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Interaction[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as Interaction;
        items.push({
          ...data,
          id: docSnapshot.id,
        });
      });
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

// User-isolated Imported Workloads operations under /users/{userId}/importedWorkloads/{workloadId}
export async function saveImportedWorkloads(userId: string, workloads: EnterpriseWorkload[]): Promise<void> {
  for (const workload of workloads) {
    const path = `users/${userId}/importedWorkloads/${workload.id}`;
    try {
      const sanitized = sanitizeForFirestore({
        ...workload,
        userId,
        importedAt: workload.importedAt || new Date().toISOString(),
      });
      await setDoc(doc(db, path), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

export async function deleteImportedWorkload(userId: string, workloadId: string): Promise<void> {
  const path = `users/${userId}/importedWorkloads/${workloadId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllImportedWorkloads(userId: string, workloads: EnterpriseWorkload[]): Promise<void> {
  for (const workload of workloads) {
    const path = `users/${userId}/importedWorkloads/${workload.id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}

export function subscribeToUserImportedWorkloads(
  userId: string,
  onData: (workloads: EnterpriseWorkload[]) => void,
  onError: (error: any) => void
): Unsubscribe {
  const path = `users/${userId}/importedWorkloads`;
  const q = query(collection(db, path));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: EnterpriseWorkload[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as EnterpriseWorkload;
        items.push({
          ...data,
          id: docSnapshot.id,
        });
      });
      // Sort in-memory by importedAt or id
      items.sort((a, b) => (b.importedAt || '').localeCompare(a.importedAt || '') || a.id.localeCompare(b.id));
      onData(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

export async function saveProgramAlignment(userId: string, alignment: ProgramAlignment): Promise<void> {
  const path = `users/${userId}/programContext/alignment`;
  try {
    await setDoc(doc(db, path), sanitizeForFirestore({
      ...alignment,
      userId,
      updatedAt: new Date().toISOString(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeToProgramAlignment(
  userId: string,
  onData: (alignment: ProgramAlignment | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe {
  const path = `users/${userId}/programContext/alignment`;
  return onSnapshot(doc(db, path), (snapshot) => {
    onData(snapshot.exists() ? snapshot.data() as ProgramAlignment : null);
  }, onError);
}
