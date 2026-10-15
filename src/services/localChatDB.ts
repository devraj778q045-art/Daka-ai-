import { ChatMessage, ChatSession } from '../types/deka';

const DB_NAME = 'deka_assistant_offline_db';
const DB_VERSION = 1;

export interface StorageMetrics {
  sessionCount: number;
  messageCount: number;
  estimatedBytes: number;
  isIndexedDBSupported: boolean;
  lastSavedAt: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'upsert_session' | 'delete_session' | 'clear_all';
  sessionId?: string;
  payload?: any;
  timestamp: number;
  retryCount: number;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Check if IndexedDB is available in the browser context.
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Initializes and upgrades the IndexedDB database.
 */
export function initLocalChatDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbPromise) {
    return dbPromise;
  }

  if (!isIndexedDBAvailable()) {
    return Promise.reject(new Error('IndexedDB is not supported in this browser environment.'));
  }

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: sessions
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionsStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          sessionsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // Store 2: messages (individual message indexing for fast search & offline access)
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('sessionId', 'sessionId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          messagesStore.createIndex('role', 'role', { unique: false });
        }

        // Store 3: sync_queue (actions that occurred while offline to sync later to cloud)
        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store 4: kv (key-value storage for app metadata, metrics)
        if (!db.objectStoreNames.contains('kv')) {
          db.createObjectStore('kv', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event: Event) => {
        dbInstance = (event.target as IDBOpenDBRequest).result;
        dbInstance.onversionchange = () => {
          dbInstance?.close();
          dbInstance = null;
          dbPromise = null;
        };
        resolve(dbInstance);
      };

      request.onerror = (event: Event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        dbPromise = null;
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked by open connections in other tabs');
      };
    } catch (err) {
      dbPromise = null;
      reject(err);
    }
  });

  return dbPromise;
}

/**
 * Saves a single chat session and all its messages to IndexedDB (local-first).
 */
export async function saveLocalSession(session: ChatSession): Promise<void> {
  // Always update fallback localStorage for instant synchronous availability
  try {
    backupSingleSessionToLocalStorage(session);
  } catch {
    // ignore
  }

  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions', 'messages', 'kv'], 'readwrite');
    const sessionsStore = tx.objectStore('sessions');
    const messagesStore = tx.objectStore('messages');
    const kvStore = tx.objectStore('kv');

    // 1. Save session record (includes message copies for direct retrieval)
    sessionsStore.put(session);

    // 2. Index individual messages for structured retrieval
    for (const msg of session.messages) {
      messagesStore.put({
        ...msg,
        sessionId: session.id,
      });
    }

    // 3. Update last saved timestamp
    kvStore.put({ key: 'lastSavedAt', value: Date.now() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save session to IndexedDB:', err);
  }
}

/**
 * Saves all sessions in a single batch transaction.
 */
export async function saveAllLocalSessions(sessions: ChatSession[]): Promise<void> {
  try {
    localStorage.setItem('deka_chat_sessions', JSON.stringify(sessions));
  } catch {
    // ignore
  }

  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions', 'messages', 'kv'], 'readwrite');
    const sessionsStore = tx.objectStore('sessions');
    const messagesStore = tx.objectStore('messages');
    const kvStore = tx.objectStore('kv');

    // Clear existing sessions and messages in IndexedDB to keep state in sync
    sessionsStore.clear();
    messagesStore.clear();

    for (const session of sessions) {
      sessionsStore.put(session);
      for (const msg of session.messages) {
        messagesStore.put({
          ...msg,
          sessionId: session.id,
        });
      }
    }

    kvStore.put({ key: 'lastSavedAt', value: Date.now() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to batch save sessions to IndexedDB:', err);
  }
}

/**
 * Loads all chat sessions from IndexedDB.
 * If IndexedDB is empty, checks localStorage and migrates if data exists.
 */
export async function loadAllLocalSessions(): Promise<ChatSession[]> {
  // If IndexedDB is not available, fallback to localStorage
  if (!isIndexedDBAvailable()) {
    return loadFromLocalStorageFallback();
  }

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions'], 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.getAll();

    const storedSessions: ChatSession[] = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (storedSessions && storedSessions.length > 0) {
      // Sort sessions descending by updatedAt
      return storedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
    }

    // If IndexedDB has no sessions yet, check localStorage to migrate existing data
    const localData = loadFromLocalStorageFallback();
    if (localData.length > 0) {
      // Background migrate to IndexedDB
      saveAllLocalSessions(localData).catch(console.warn);
      return localData;
    }

    return [];
  } catch (err) {
    console.warn('Error reading from IndexedDB, falling back to localStorage:', err);
    return loadFromLocalStorageFallback();
  }
}

/**
 * Deletes a session and its associated messages from IndexedDB.
 */
export async function deleteLocalSession(sessionId: string): Promise<void> {
  // Remove from localStorage fallback
  try {
    const local = loadFromLocalStorageFallback();
    const filtered = local.filter((s) => s.id !== sessionId);
    localStorage.setItem('deka_chat_sessions', JSON.stringify(filtered));
  } catch {
    // ignore
  }

  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions', 'messages'], 'readwrite');
    const sessionsStore = tx.objectStore('sessions');
    const messagesStore = tx.objectStore('messages');

    sessionsStore.delete(sessionId);

    // Delete matching messages
    const index = messagesStore.index('sessionId');
    const request = index.getAllKeys(sessionId);

    request.onsuccess = () => {
      const keys = request.result;
      for (const k of keys) {
        messagesStore.delete(k);
      }
    };

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to delete session from IndexedDB:', err);
  }
}

/**
 * Clears all sessions, messages, and sync queue from IndexedDB.
 */
export async function clearAllLocalSessions(): Promise<void> {
  try {
    localStorage.removeItem('deka_chat_sessions');
  } catch {
    // ignore
  }

  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions', 'messages', 'sync_queue'], 'readwrite');
    tx.objectStore('sessions').clear();
    tx.objectStore('messages').clear();
    tx.objectStore('sync_queue').clear();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to clear IndexedDB:', err);
  }
}

/**
 * Records an operation in the offline sync queue.
 */
export async function queueOfflineSyncAction(
  type: 'upsert_session' | 'delete_session' | 'clear_all',
  sessionId?: string,
  payload?: any
): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sync_queue'], 'readwrite');
    const store = tx.objectStore('sync_queue');

    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      sessionId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    store.put(item);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to queue offline sync action:', err);
  }
}

/**
 * Retrieves all items waiting in the offline sync queue.
 */
export async function getOfflineSyncQueue(): Promise<SyncQueueItem[]> {
  if (!isIndexedDBAvailable()) return [];

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sync_queue'], 'readonly');
    const store = tx.objectStore('sync_queue');
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * Removes a completed item from the offline sync queue.
 */
export async function removeSyncQueueItem(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) return;

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sync_queue'], 'readwrite');
    tx.objectStore('sync_queue').delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

/**
 * Flushes all pending sync queue actions to Firestore once online.
 */
export async function flushOfflineSyncQueue(
  userId: string,
  syncSessionFn: (userId: string, session: ChatSession) => Promise<void>,
  removeSessionFn: (userId: string, sessionId: string) => Promise<void>,
  clearAllFn: (userId: string) => Promise<void>
): Promise<{ processed: number; errors: number }> {
  const queue = await getOfflineSyncQueue();
  if (queue.length === 0) return { processed: 0, errors: 0 };

  let processed = 0;
  let errors = 0;

  for (const item of queue) {
    try {
      if (item.type === 'upsert_session' && item.payload) {
        await syncSessionFn(userId, item.payload);
      } else if (item.type === 'delete_session' && item.sessionId) {
        await removeSessionFn(userId, item.sessionId);
      } else if (item.type === 'clear_all') {
        await clearAllFn(userId);
      }
      await removeSyncQueueItem(item.id);
      processed++;
    } catch (err) {
      console.warn('Error flushing sync item:', item, err);
      errors++;
    }
  }

  return { processed, errors };
}

/**
 * Obtains storage analytics: number of sessions, messages, and estimated bytes used.
 */
export async function getStorageMetrics(): Promise<StorageMetrics> {
  const supported = isIndexedDBAvailable();
  if (!supported) {
    const local = loadFromLocalStorageFallback();
    const messageCount = local.reduce((sum, s) => sum + s.messages.length, 0);
    const raw = localStorage.getItem('deka_chat_sessions') || '';
    return {
      sessionCount: local.length,
      messageCount,
      estimatedBytes: raw.length * 2,
      isIndexedDBSupported: false,
      lastSavedAt: Date.now(),
    };
  }

  try {
    const db = await initLocalChatDB();
    const tx = db.transaction(['sessions', 'messages', 'kv'], 'readonly');
    const sessionsStore = tx.objectStore('sessions');
    const messagesStore = tx.objectStore('messages');
    const kvStore = tx.objectStore('kv');

    const [sessionCount, messageCount, lastSavedRecord] = await Promise.all([
      new Promise<number>((res) => {
        const req = sessionsStore.count();
        req.onsuccess = () => res(req.result || 0);
        req.onerror = () => res(0);
      }),
      new Promise<number>((res) => {
        const req = messagesStore.count();
        req.onsuccess = () => res(req.result || 0);
        req.onerror = () => res(0);
      }),
      new Promise<{ key: string; value: number } | null>((res) => {
        const req = kvStore.get('lastSavedAt');
        req.onsuccess = () => res(req.result || null);
        req.onerror = () => res(null);
      }),
    ]);

    let estimatedBytes = 0;
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        estimatedBytes = est.usage || 0;
      } catch {
        // fallback
      }
    }

    if (estimatedBytes === 0) {
      // Rough estimation based on session objects
      estimatedBytes = (sessionCount * 512) + (messageCount * 256);
    }

    return {
      sessionCount,
      messageCount,
      estimatedBytes,
      isIndexedDBSupported: true,
      lastSavedAt: lastSavedRecord?.value || Date.now(),
    };
  } catch (err) {
    console.warn('Failed to get storage metrics:', err);
    return {
      sessionCount: 0,
      messageCount: 0,
      estimatedBytes: 0,
      isIndexedDBSupported: true,
      lastSavedAt: Date.now(),
    };
  }
}

/**
 * Exports all local chat history as a formatted JSON string for backup/transfer.
 */
export async function exportLocalChatBackup(): Promise<string> {
  const sessions = await loadAllLocalSessions();
  const backup = {
    app: 'DEKA AI Assistant',
    version: '1.0',
    exportTimestamp: Date.now(),
    exportDate: new Date().toISOString(),
    totalSessions: sessions.length,
    totalMessages: sessions.reduce((acc, s) => acc + s.messages.length, 0),
    sessions,
  };
  return JSON.stringify(backup, null, 2);
}

// Internal Helper Functions
function loadFromLocalStorageFallback(): ChatSession[] {
  try {
    const raw = localStorage.getItem('deka_chat_sessions');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

function backupSingleSessionToLocalStorage(session: ChatSession): void {
  try {
    const list = loadFromLocalStorageFallback();
    const existingIndex = list.findIndex((s) => s.id === session.id);
    if (existingIndex >= 0) {
      list[existingIndex] = session;
    } else {
      list.unshift(session);
    }
    localStorage.setItem('deka_chat_sessions', JSON.stringify(list));
  } catch {
    // ignore
  }
}
