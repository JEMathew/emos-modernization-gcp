import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
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
import firebaseConfig from '../../firebase-applet-config.json';
import type { Interaction, UserProfile, EnterpriseWorkload, ProgramAlignment } from '../types';
import { redactSecrets } from './guardrails';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId according to Firebase integration instructions
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In error:", redactSecrets(error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
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
    await setDoc(doc(db, userPath), sanitizeForFirestore(profile), { merge: true });
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
