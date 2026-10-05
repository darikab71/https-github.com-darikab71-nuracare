export * from './digitalWellnessStorage';
export type { AppLimitItem, WebsiteLimitItem, DigitalUsageSnapshot, DigitalWellnessSettings } from '../lib/digitalWellnessEngine';
import { storage } from './mmkv';

export interface SleepModeConfig {
  id: string;
  name: string;
  isEnabled: boolean;
  startTime: string; // '22:30'
  endTime: string; // '06:30'
  daysOfWeek: number[]; // [0-6]
  restrictedCategories: string[];
  allowedApps: string[];
}

export interface DigitalWellbeingGoal {
  id: string;
  title: string;
  type: 'reduce_social' | 'reduce_screen' | 'increase_focus' | 'sleep_earlier' | 'take_breaks' | 'reduce_gaming' | 'reduce_video';
  targetMinutes?: number;
  isActive: boolean;
  createdAt: string;
}

export interface DigitalWellbeingRule {
  id: string;
  name: string;
  isEnabled: boolean;
  trigger: {
    type: 'app_usage' | 'category_usage' | 'time_of_day' | 'session_duration' | 'total_screen_time';
    appName?: string;
    category?: string;
    thresholdMinutes?: number;
    timeOfDay?: string;
  };
  actions: {
    type: 'show_warning' | 'block_app' | 'start_focus' | 'start_sleep' | 'show_nura_pause';
    message?: string;
  }[];
  until?: string; // 'tomorrow' | 'end_of_day' | 'manual'
}

export interface SessionLimit {
  id: string;
  appName: string;
  limitMinutes: number;
  startedAt: string;
  isActive: boolean;
}

export interface FocusSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  blockedApps: string[];
  allowedApps: string[];
  isEnabled: boolean;
}

export interface DigitalStreak {
  type: string;
  currentDays: number;
  bestDays: number;
  lastDate: string;
}

export interface NuraIntervention {
  id: string;
  type: 'limit_reached' | 'overuse_warning' | 'smart_recommendation' | 'sleep_reminder' | 'focus_suggestion';
  appName?: string;
  message: string;
  actions: { label: string; actionType: string }[];
  timestamp: string;
  dismissed: boolean;
}

export type AutomationLevel = 'gentle' | 'balanced' | 'strict';

const KEYS = {
  SLEEP_MODE_CONFIG: 'digital_wellbeing_sleep_mode',
  GOALS: 'digital_wellbeing_goals',
  RULES: 'digital_wellbeing_rules',
  SESSION_LIMITS: 'digital_wellbeing_session_limits',
  FOCUS_SCHEDULES: 'digital_wellbeing_focus_schedules',
  STREAKS: 'digital_wellbeing_streaks',
  INTERVENTIONS: 'digital_wellbeing_interventions',
  AUTOMATION_LEVEL: 'digital_wellbeing_automation_level',
};

// Helper for parsing JSON from storage safely
const getStoredObject = <T>(key: string, defaultValue: T): T => {
  try {
    const data = storage.getString(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setStoredObject = <T>(key: string, value: T): void => {
  storage.set(key, JSON.stringify(value));
};

export const getSleepModeConfigs = (): SleepModeConfig[] => getStoredObject<SleepModeConfig[]>(KEYS.SLEEP_MODE_CONFIG, []);
export const saveSleepModeConfig = (config: SleepModeConfig): void => {
  const configs = getSleepModeConfigs();
  const index = configs.findIndex(c => c.id === config.id);
  if (index >= 0) {
    configs[index] = config;
  } else {
    configs.push(config);
  }
  setStoredObject(KEYS.SLEEP_MODE_CONFIG, configs);
};

export const getDigitalGoals = (): DigitalWellbeingGoal[] => getStoredObject<DigitalWellbeingGoal[]>(KEYS.GOALS, []);
export const saveDigitalGoal = (goal: DigitalWellbeingGoal): void => {
  const goals = getDigitalGoals();
  const index = goals.findIndex(g => g.id === goal.id);
  if (index >= 0) {
    goals[index] = goal;
  } else {
    goals.push(goal);
  }
  setStoredObject(KEYS.GOALS, goals);
};

export const getRules = (): DigitalWellbeingRule[] => getStoredObject<DigitalWellbeingRule[]>(KEYS.RULES, []);
export const saveRule = (rule: DigitalWellbeingRule): void => {
  const rules = getRules();
  const index = rules.findIndex(r => r.id === rule.id);
  if (index >= 0) {
    rules[index] = rule;
  } else {
    rules.push(rule);
  }
  setStoredObject(KEYS.RULES, rules);
};

export const deleteRule = (id: string): void => {
  const rules = getRules().filter(r => r.id !== id);
  setStoredObject(KEYS.RULES, rules);
};

export const getSessionLimits = (): SessionLimit[] => getStoredObject<SessionLimit[]>(KEYS.SESSION_LIMITS, []);
export const saveSessionLimit = (limit: SessionLimit): void => {
  const limits = getSessionLimits();
  const index = limits.findIndex(l => l.id === limit.id);
  if (index >= 0) {
    limits[index] = limit;
  } else {
    limits.push(limit);
  }
  setStoredObject(KEYS.SESSION_LIMITS, limits);
};

export const getFocusSchedules = (): FocusSchedule[] => getStoredObject<FocusSchedule[]>(KEYS.FOCUS_SCHEDULES, []);
export const saveFocusSchedule = (schedule: FocusSchedule): void => {
  const schedules = getFocusSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);
  if (index >= 0) {
    schedules[index] = schedule;
  } else {
    schedules.push(schedule);
  }
  setStoredObject(KEYS.FOCUS_SCHEDULES, schedules);
};

export const getStreaks = (): DigitalStreak[] => getStoredObject<DigitalStreak[]>(KEYS.STREAKS, []);
export const updateStreak = (type: string): void => {
  const streaks = getStreaks();
  const index = streaks.findIndex(s => s.type === type);
  const today = new Date().toISOString().split('T')[0];
  
  if (index >= 0) {
    const streak = streaks[index];
    if (streak.lastDate !== today) {
      // Basic check for consecutive days could be improved here.
      const lastDate = new Date(streak.lastDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        streak.currentDays += 1;
      } else {
        streak.currentDays = 1;
      }
      
      if (streak.currentDays > streak.bestDays) {
        streak.bestDays = streak.currentDays;
      }
      streak.lastDate = today;
      streaks[index] = streak;
    }
  } else {
    streaks.push({ type, currentDays: 1, bestDays: 1, lastDate: today });
  }
  setStoredObject(KEYS.STREAKS, streaks);
};

export const getNuraInterventions = (): NuraIntervention[] => getStoredObject<NuraIntervention[]>(KEYS.INTERVENTIONS, []);
export const addNuraIntervention = (intervention: NuraIntervention): void => {
  const interventions = getNuraInterventions();
  interventions.push(intervention);
  setStoredObject(KEYS.INTERVENTIONS, interventions);
};
export const dismissNuraIntervention = (id: string): void => {
  const interventions = getNuraInterventions().map(i => i.id === id ? { ...i, dismissed: true } : i);
  setStoredObject(KEYS.INTERVENTIONS, interventions);
};

export const getAutomationLevel = (): AutomationLevel => {
  const level = storage.getString(KEYS.AUTOMATION_LEVEL) as AutomationLevel;
  return level || 'balanced';
};
export const setAutomationLevel = (level: AutomationLevel): void => {
  storage.set(KEYS.AUTOMATION_LEVEL, level);
};
