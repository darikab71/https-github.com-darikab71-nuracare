import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let storageInstance: any;

if (isWeb) {
  storageInstance = {
    set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch(e){} },
    getString: (k: string) => { try { return localStorage.getItem(k); } catch(e){ return null; } },
    delete: (k: string) => { try { localStorage.removeItem(k); } catch(e){} },
    clearAll: () => { try { localStorage.clear(); } catch(e){} },
    contains: (k: string) => { try { return localStorage.getItem(k) !== null; } catch(e){ return false; } },
    getAllKeys: () => [],
    getBoolean: (k: string) => { try { return localStorage.getItem(k) === 'true'; } catch(e) { return false; } },
    getNumber: (k: string) => { try { return Number(localStorage.getItem(k)) || 0; } catch(e) { return 0; } }
  };
} else {
  try {
    const { MMKV } = require('react-native-mmkv');
    storageInstance = new MMKV({ id: 'nuracare-mobile-storage' });
  } catch (err) {
    console.warn('MMKV initialization failed, using in-memory fallback', err);
    const memoryStore = new Map<string, string>();
    storageInstance = {
      set: (k: string, v: string) => memoryStore.set(k, v),
      getString: (k: string) => memoryStore.get(k) ?? null,
      delete: (k: string) => memoryStore.delete(k),
      clearAll: () => memoryStore.clear(),
      contains: (k: string) => memoryStore.has(k),
      getAllKeys: () => Array.from(memoryStore.keys()),
      getBoolean: (k: string) => memoryStore.get(k) === 'true',
      getNumber: (k: string) => Number(memoryStore.get(k)) || 0,
    };
  }
}

export const storage = storageInstance;

export function cacheData(key: string, data: any) {
  storage.set(key, JSON.stringify(data));
}

export function getCachedData<T>(key: string): T | null {
  const data = storage.getString(key);
  return data ? JSON.parse(data) : null;
}

