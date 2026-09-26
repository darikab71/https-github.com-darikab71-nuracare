import { create } from 'zustand';
import { User, CheckIn, Message } from '../shared';
import { getCachedData, cacheData } from '../storage/mmkv';
import { useSyncStore } from './syncStore';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  loadUser: () => void;
}

const defaultGuestUser: User = {
  id: 'guest_nura',
  name: 'Nura Explorer',
  email: 'guest@nuracare.internal',
  fastingMode: 'Orthodox Christian (Tsom)',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => {
    set({ user });
    if (user && !String(user.id).startsWith('guest_')) {
      cacheData('auth_user', user);
    } else {
      cacheData('auth_user', null);
    }
  },
  loadUser: () => {
    const cachedUser = getCachedData<User>('auth_user');
    if (cachedUser && cachedUser.id && !String(cachedUser.id).startsWith('guest_')) {
      set({ user: cachedUser });
    } else {
      set({ user: null });
    }
  }
}));

interface WellnessState {
  score: number;
  checkIns: CheckIn[];
  setScore: (score: number) => void;
  addCheckIn: (checkIn: CheckIn) => void;
  loadWellnessData: () => void;
}

export const useWellnessStore = create<WellnessState>((set) => ({
  score: 100,
  checkIns: [],
  setScore: (score) => {
    set({ score });
    cacheData('wellness_score', score);
  },
  addCheckIn: (checkIn) => {
    set((state) => {
      const newCheckIns = [checkIn, ...state.checkIns];
      cacheData('wellness_checkins', newCheckIns);
      // Automatically queue for sync
      useSyncStore.getState().addToQueue('checkIn', checkIn.id);
      return { checkIns: newCheckIns };
    });
  },
  loadWellnessData: () => {
    const cachedScore = getCachedData<number>('wellness_score') ?? 100;
    const cachedCheckIns = getCachedData<CheckIn[]>('wellness_checkins') ?? [];
    set({ score: cachedScore, checkIns: cachedCheckIns });
  }
}));

interface ChatState {
  messages: Message[];
  addMessage: (message: Message) => void;
  loadMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages, message];
      cacheData('chat_messages', newMessages);
      // Automatically queue for sync
      useSyncStore.getState().addToQueue('message', message.id);
      return { messages: newMessages };
    });
  },
  loadMessages: () => {
    const cachedMessages = getCachedData<Message[]>('chat_messages') ?? [];
    set({ messages: cachedMessages });
  }
}));
