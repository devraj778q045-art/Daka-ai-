import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ChatMessage, ChatSession, LanguageMode, ThemeMode } from '../types/deka';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Operation types for strict Firestore error handling
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
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on app boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unavailable.');
    }
    return false;
  }
}

// User Profile Data structure
export interface UserPreferences {
  language: LanguageMode;
  theme: ThemeMode;
  ttsEnabled: boolean;
  speechRate: number;
  batterySaver?: boolean;
}

export interface StoredUserProfile extends UserPreferences {
  userId: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

// Authentication Service Functions
export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string,
  phoneNumber?: string
): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;

  if (displayName) {
    await updateProfile(user, { displayName });
  }

  // Create initial user profile in Firestore
  await saveUserProfile(user.uid, {
    userId: user.uid,
    email: user.email || email,
    displayName: displayName || user.displayName || '',
    phoneNumber: phoneNumber || '',
    language: 'auto',
    theme: 'futuristic-dark',
    ttsEnabled: true,
    speechRate: 1.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return user;
}

export async function loginWithEmail(email: string, pass: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const user = credential.user;

  // Check or initialize profile
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    await saveUserProfile(user.uid, {
      userId: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      language: 'auto',
      theme: 'futuristic-dark',
      ttsEnabled: true,
      speechRate: 1.0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return user;
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Firestore Profile Functions
export async function saveUserProfile(
  userId: string,
  profile: Partial<StoredUserProfile>
): Promise<void> {
  const path = `users/${userId}`;
  try {
    await setDoc(
      doc(db, 'users', userId),
      {
        ...profile,
        userId,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<StoredUserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as StoredUserProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// Firestore Chat Sessions Synchronization
export async function syncChatSession(userId: string, session: ChatSession): Promise<void> {
  const path = `users/${userId}/sessions/${session.id}`;
  try {
    const sessionDocRef = doc(db, 'users', userId, 'sessions', session.id);
    await setDoc(
      sessionDocRef,
      {
        id: session.id,
        userId,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      { merge: true }
    );

    // Sync latest messages for this session
    const messagesCollection = collection(db, 'users', userId, 'sessions', session.id, 'messages');
    for (const msg of session.messages) {
      await setDoc(
        doc(messagesCollection, msg.id),
        {
          id: msg.id,
          sessionId: session.id,
          userId,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          detectedIntent: msg.detectedIntent || null,
        },
        { merge: true }
      );
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function loadUserChatSessions(userId: string): Promise<ChatSession[]> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const q = query(sessionsCol, orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);

    const sessions: ChatSession[] = [];
    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const messagesCol = collection(db, 'users', userId, 'sessions', docSnap.id, 'messages');
      const messagesQuery = query(messagesCol, orderBy('timestamp', 'asc'));
      const messagesSnap = await getDocs(messagesQuery);

      const messages: ChatMessage[] = messagesSnap.docs.map((m) => {
        const mData = m.data();
        return {
          id: mData.id,
          role: mData.role,
          content: mData.content,
          timestamp: mData.timestamp,
          detectedIntent: mData.detectedIntent || undefined,
        };
      });

      sessions.push({
        id: data.id,
        title: data.title,
        messages,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    }

    return sessions;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function removeChatSession(userId: string, sessionId: string): Promise<void> {
  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'sessions', sessionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function clearAllChatSessions(userId: string): Promise<void> {
  const path = `users/${userId}/sessions`;
  try {
    const sessionsCol = collection(db, 'users', userId, 'sessions');
    const snap = await getDocs(sessionsCol);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
