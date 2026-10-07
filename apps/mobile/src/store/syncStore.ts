import { create } from 'zustand';
import { getCachedData, cacheData } from '../storage/mmkv';

interface SyncState {
  isSyncing: boolean;
  lastSynced: string | null;
  pendingCheckIns: string[];
  pendingMessages: string[];
  pendingChallengeSessions: string[];
  addToQueue: (type: 'checkIn' | 'message' | 'challengeSession', id: string) => void;
  removeFromQueue: (type: 'checkIn' | 'message' | 'challengeSession', id: string) => void;
  setSyncing: (status: boolean) => void;
  setLastSynced: (date: string) => void;
  loadSyncState: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSynced: null,
  pendingCheckIns: [],
  pendingMessages: [],
  pendingChallengeSessions: [],
  
  addToQueue: (type, id) => set((state) => {
    const queueName = type === 'checkIn' ? 'pendingCheckIns' : type === 'message' ? 'pendingMessages' : 'pendingChallengeSessions';
    const newQueue = [...state[queueName], id];
    cacheData(queueName, newQueue);
    return { [queueName]: newQueue } as Partial<SyncState>;
  }),

  removeFromQueue: (type, id) => set((state) => {
    const queueName = type === 'checkIn' ? 'pendingCheckIns' : type === 'message' ? 'pendingMessages' : 'pendingChallengeSessions';
    const newQueue = state[queueName].filter(itemId => itemId !== id);
    cacheData(queueName, newQueue);
    return { [queueName]: newQueue } as Partial<SyncState>;
  }),

  setSyncing: (status) => set({ isSyncing: status }),
  
  setLastSynced: (date) => {
    cacheData('lastSynced', date);
    set({ lastSynced: date });
  },

  loadSyncState: () => {
    const pendingCheckIns = getCachedData<string[]>('pendingCheckIns') || [];
    const pendingMessages = getCachedData<string[]>('pendingMessages') || [];
    const pendingChallengeSessions = getCachedData<string[]>('pendingChallengeSessions') || [];
    const lastSynced = getCachedData<string>('lastSynced') || null;
    set({ pendingCheckIns, pendingMessages, pendingChallengeSessions, lastSynced });
  }
}));
