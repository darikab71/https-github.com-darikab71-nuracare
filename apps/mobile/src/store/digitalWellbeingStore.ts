import { create } from 'zustand';
import { getCachedData, cacheData } from '../storage/mmkv';
import { NuraIntervention, AutomationLevel } from '../storage/digitalWellbeingStorage';

export interface DigitalWellbeingState {
  focusActive: boolean;
  sleepModeActive: boolean;
  currentScreenTime: number; // in minutes
  activeInterventions: NuraIntervention[];
  automationLevel: AutomationLevel;

  // Actions
  startFocus: () => void;
  stopFocus: () => void;
  toggleSleepMode: (active: boolean) => void;
  addIntervention: (intervention: NuraIntervention) => void;
  dismissIntervention: (id: string) => void;
  refreshUsageData: (screenTimeMinutes: number) => void;
  setAutomationLevel: (level: AutomationLevel) => void;
  loadWellbeingData: () => void;
}

export const useDigitalWellbeingStore = create<DigitalWellbeingState>((set) => ({
  focusActive: false,
  sleepModeActive: false,
  currentScreenTime: 0,
  activeInterventions: [],
  automationLevel: 'balanced',

  startFocus: () => {
    set({ focusActive: true });
    cacheData('wellbeing_focus_active', true);
  },
  
  stopFocus: () => {
    set({ focusActive: false });
    cacheData('wellbeing_focus_active', false);
  },
  
  toggleSleepMode: (active: boolean) => {
    set({ sleepModeActive: active });
    cacheData('wellbeing_sleep_mode', active);
  },
  
  addIntervention: (intervention: NuraIntervention) => {
    set((state) => {
      const newInterventions = [...state.activeInterventions, intervention];
      cacheData('wellbeing_interventions', newInterventions);
      return { activeInterventions: newInterventions };
    });
  },
    
  dismissIntervention: (id: string) => {
    set((state) => {
      const newInterventions = state.activeInterventions.map((i) =>
        i.id === id ? { ...i, dismissed: true } : i
      );
      cacheData('wellbeing_interventions', newInterventions);
      return { activeInterventions: newInterventions };
    });
  },
    
  refreshUsageData: (screenTimeMinutes: number) => {
    set({ currentScreenTime: screenTimeMinutes });
    cacheData('wellbeing_screen_time', screenTimeMinutes);
  },
    
  setAutomationLevel: (level: AutomationLevel) => {
    set({ automationLevel: level });
    cacheData('wellbeing_automation_level', level);
  },
  
  loadWellbeingData: () => {
    const focusActive = getCachedData<boolean>('wellbeing_focus_active') ?? false;
    const sleepModeActive = getCachedData<boolean>('wellbeing_sleep_mode') ?? false;
    const currentScreenTime = getCachedData<number>('wellbeing_screen_time') ?? 0;
    const activeInterventions = getCachedData<NuraIntervention[]>('wellbeing_interventions') ?? [];
    const automationLevel = getCachedData<AutomationLevel>('wellbeing_automation_level') ?? 'balanced';
    
    set({
      focusActive,
      sleepModeActive,
      currentScreenTime,
      activeInterventions,
      automationLevel
    });
  }
}));
