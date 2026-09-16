import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';
const memoryStore = new Map<string, string>();

let mmkvInstance: any = null;
if (!isWeb) {
  try {
    const { MMKV } = require('react-native-mmkv');
    mmkvInstance = new MMKV({ id: 'nuracare-mobile-storage' });
    // Test that native read/write actually works without throwing JNI/Nitro errors
    mmkvInstance.set('__test_probe__', '1');
    mmkvInstance.getString('__test_probe__');
    mmkvInstance.delete('__test_probe__');
  } catch (err) {
    console.warn('MMKV initialization failed, using in-memory fallback:', err);
    mmkvInstance = null;
  }
}

export const storage = {
  set: (k: string, v: string) => {
    if (isWeb) {
      try { localStorage.setItem(k, v); return; } catch (e) {}
    }
    if (mmkvInstance) {
      try {
        mmkvInstance.set(k, v);
        return;
      } catch (e) {
        console.warn('MMKV.set runtime error, falling back to memory store:', e);
        mmkvInstance = null;
      }
    }
    memoryStore.set(k, v);
  },
  getString: (k: string): string | null => {
    if (isWeb) {
      try { return localStorage.getItem(k); } catch (e) { return null; }
    }
    if (mmkvInstance) {
      try {
        return mmkvInstance.getString(k) ?? null;
      } catch (e) {
        console.warn('MMKV.getString runtime error, falling back to memory store:', e);
        mmkvInstance = null;
      }
    }
    return memoryStore.get(k) ?? null;
  },
  delete: (k: string) => {
    if (isWeb) {
      try { localStorage.removeItem(k); return; } catch (e) {}
    }
    if (mmkvInstance) {
      try {
        mmkvInstance.delete(k);
        return;
      } catch (e) {
        mmkvInstance = null;
      }
    }
    memoryStore.delete(k);
  },
  clearAll: () => {
    if (isWeb) {
      try { localStorage.clear(); return; } catch (e) {}
    }
    if (mmkvInstance) {
      try {
        mmkvInstance.clearAll();
        return;
      } catch (e) {
        mmkvInstance = null;
      }
    }
    memoryStore.clear();
  },
  contains: (k: string): boolean => {
    if (isWeb) {
      try { return localStorage.getItem(k) !== null; } catch (e) { return false; }
    }
    if (mmkvInstance) {
      try {
        return mmkvInstance.contains(k);
      } catch (e) {
        mmkvInstance = null;
      }
    }
    return memoryStore.has(k);
  },
  getAllKeys: (): string[] => {
    if (mmkvInstance) {
      try {
        return mmkvInstance.getAllKeys();
      } catch (e) {
        mmkvInstance = null;
      }
    }
    return Array.from(memoryStore.keys());
  },
  getBoolean: (k: string): boolean => {
    const val = storage.getString(k);
    return val === 'true';
  },
  getNumber: (k: string): number => {
    const val = storage.getString(k);
    return Number(val) || 0;
  }
};

export function cacheData(key: string, data: any) {
  try {
    storage.set(key, JSON.stringify(data));
  } catch (e) {}
}

export function getCachedData<T>(key: string): T | null {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

