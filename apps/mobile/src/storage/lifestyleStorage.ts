import { storage } from './mmkv';

export interface LifestyleSnapshot {
  date: string;
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: 'Optimal' | 'Good' | 'Fair' | 'Restless';
  steps: number;
  stepsTarget: number;
  waterMl: number;
  waterTargetMl: number;
  mindfulnessMins: number;
  mindfulnessTargetMins: number;
  fastingWindowActive: boolean;
  fastingHoursElapsed: number;
  balanceScore: number;
}

export interface LifestyleGoal {
  id: string;
  title: string;
  category: 'sleep' | 'movement' | 'hydration' | 'mindfulness' | 'nutrition';
  completed: boolean;
  target?: string;
}

export interface LifestyleHabit {
  id: string;
  label: string;
  detail: string;
  category: 'sleep' | 'movement' | 'hydration' | 'mindfulness' | 'nutrition';
  iconName: string;
  completedDates: string[]; // ['2026-09-18', '2026-09-19', ...]
}

export interface RoutineStep {
  id: string;
  time: string;
  title: string;
  detail: string;
  completed: boolean;
}

export interface RoutineData {
  type: 'morning' | 'evening';
  title: string;
  subtitle: string;
  steps: RoutineStep[];
}

export interface DayTrendPoint {
  dayLabel: string; // 'Mon', 'Tue', ...
  dateStr: string;
  balanceScore: number;
  sleepHours: number;
  steps: number;
  waterLiters: number;
  habitCompletionPct: number;
}

const SNAPSHOT_KEY = 'nuracare_lifestyle_snapshot';
const GOALS_KEY = 'nuracare_lifestyle_goals';
const HABITS_KEY = 'nuracare_lifestyle_habits';
const ROUTINES_KEY = 'nuracare_lifestyle_routines';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_SNAPSHOT: LifestyleSnapshot = {
  date: getTodayStr(),
  sleepHours: 7.4,
  sleepTarget: 8.0,
  sleepQuality: 'Good',
  steps: 6482,
  stepsTarget: 9000,
  waterMl: 1800,
  waterTargetMl: 2500,
  mindfulnessMins: 12,
  mindfulnessTargetMins: 15,
  fastingWindowActive: true,
  fastingHoursElapsed: 14,
  balanceScore: 84,
};

const DEFAULT_GOALS: LifestyleGoal[] = [
  { id: 'goal-1', title: 'Complete Morning Sunlight & Mobility', category: 'movement', completed: true, target: '15 min' },
  { id: 'goal-2', title: 'Drink 2.5L Filtered Spring Water', category: 'hydration', completed: false, target: '2.5 L' },
  { id: 'goal-3', title: 'Post-Meal 15 Min Glucose Walk', category: 'movement', completed: true, target: '15 min' },
  { id: 'goal-4', title: '4-7-8 Parasympathetic Reset', category: 'mindfulness', completed: false, target: '1 session' },
  { id: 'goal-5', title: 'Digital Sunset (Screens off 60m prior)', category: 'sleep', completed: false, target: '10:00 PM' },
];

const DEFAULT_HABITS: LifestyleHabit[] = [
  {
    id: 'habit-sun',
    label: 'Morning Sunlight',
    detail: 'Suprachiasmatic reset within 1h of waking',
    category: 'mindfulness',
    iconName: 'Sun',
    completedDates: [],
  },
  {
    id: 'habit-water',
    label: 'Hydration Starter',
    detail: '500ml water before morning coffee or tea',
    category: 'hydration',
    iconName: 'Droplets',
    completedDates: [],
  },
  {
    id: 'habit-eskista',
    label: 'Thoracic Mobility Reset',
    detail: '5 min scapular release for desk posture',
    category: 'movement',
    iconName: 'Activity',
    completedDates: [],
  },
  {
    id: 'habit-teff',
    label: 'Prebiotic Teff Whole Grain',
    detail: 'Fermented resistant starch for gut microbiome',
    category: 'nutrition',
    iconName: 'Leaf',
    completedDates: [],
  },
  {
    id: 'habit-breath',
    label: '4-7-8 Nervous Reset',
    detail: 'Down-regulate evening sympathetic arousal',
    category: 'mindfulness',
    iconName: 'Wind',
    completedDates: [],
  },
];

const DEFAULT_ROUTINES: { morning: RoutineData; evening: RoutineData } = {
  morning: {
    type: 'morning',
    title: 'Circadian Awakening',
    subtitle: 'Cortisol synchronization & morning vigor',
    steps: [
      { id: 'm-1', time: '06:30', title: 'Natural Awakening', detail: 'Consistent wake window anchor', completed: true },
      { id: 'm-2', time: '06:35', title: 'Electrolyte Hydration', detail: '500ml water with pinch of sea salt', completed: true },
      { id: 'm-3', time: '06:45', title: 'Solar Exposure', detail: '10-15 mins direct morning sunlight', completed: true },
      { id: 'm-4', time: '07:05', title: 'Gentle Mobility Reset', detail: 'Thoracic rotations & deep joint flossing', completed: false },
    ],
  },
  evening: {
    type: 'evening',
    title: 'Restorative Wind-Down',
    subtitle: 'Melatonin synthesis & parasympathetic shift',
    steps: [
      { id: 'e-1', time: '21:15', title: 'Digital Sunset', detail: 'Dim harsh ambient lighting & blue screens', completed: false },
      { id: 'e-2', time: '21:40', title: 'Chamomile & Magnesium', detail: 'Warm herbal infusion for neuro-calm', completed: false },
      { id: 'e-3', time: '22:00', title: '4-7-8 Breathwork', detail: '3 cycles of deep nervous system deceleration', completed: false },
      { id: 'e-4', time: '22:30', title: 'Sleep Stage Anchor', detail: 'Cool bedroom (18°C) dark environment', completed: false },
    ],
  },
};

export function getLifestyleSnapshot(): LifestyleSnapshot {
  try {
    const raw = storage.getString(SNAPSHOT_KEY);
    if (!raw) return DEFAULT_SNAPSHOT;
    const parsed = JSON.parse(raw);
    if (parsed.date !== getTodayStr()) {
      return { ...parsed, date: getTodayStr() };
    }
    return parsed;
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function saveLifestyleSnapshot(snapshot: LifestyleSnapshot): void {
  storage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

function calculateBalance(sleep: number, steps: number, water: number, mindful: number): number {
  const sleepRatio = Math.min(1, sleep / 8.0) * 30;
  const stepsRatio = Math.min(1, steps / 9000) * 30;
  const waterRatio = Math.min(1, water / 2500) * 20;
  const mindfulRatio = Math.min(1, mindful / 15) * 20;
  return Math.min(100, Math.round(sleepRatio + stepsRatio + waterRatio + mindfulRatio));
}

export function logWater(deltaMl: number): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextWater = Math.max(0, current.waterMl + deltaMl);
  const updated: LifestyleSnapshot = {
    ...current,
    waterMl: nextWater,
    balanceScore: calculateBalance(current.sleepHours, current.steps, nextWater, current.mindfulnessMins),
  };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logSteps(deltaSteps: number): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextSteps = Math.max(0, current.steps + deltaSteps);
  const updated: LifestyleSnapshot = {
    ...current,
    steps: nextSteps,
    balanceScore: calculateBalance(current.sleepHours, nextSteps, current.waterMl, current.mindfulnessMins),
  };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function getLifestyleGoals(): LifestyleGoal[] {
  try {
    const raw = storage.getString(GOALS_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_GOALS;
  } catch {
    return DEFAULT_GOALS;
  }
}

export function toggleLifestyleGoal(goalId: string): LifestyleGoal[] {
  const goals = getLifestyleGoals();
  const updated = goals.map((g) => (g.id === goalId ? { ...g, completed: !g.completed } : g));
  storage.set(GOALS_KEY, JSON.stringify(updated));
  return updated;
}

export function addLifestyleGoal(title: string, category: LifestyleGoal['category'], target?: string): LifestyleGoal[] {
  const goals = getLifestyleGoals();
  const newGoal: LifestyleGoal = {
    id: 'goal-' + Date.now(),
    title,
    category,
    completed: false,
    target: target || 'Daily',
  };
  const updated = [newGoal, ...goals];
  storage.set(GOALS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteLifestyleGoal(goalId: string): LifestyleGoal[] {
  const goals = getLifestyleGoals();
  const updated = goals.filter((g) => g.id !== goalId);
  storage.set(GOALS_KEY, JSON.stringify(updated));
  return updated;
}

export function getLifestyleHabits(): LifestyleHabit[] {
  try {
    const raw = storage.getString(HABITS_KEY);
    if (!raw) {
      const today = new Date();
      const habits = DEFAULT_HABITS.map((h, idx) => {
        const completed: string[] = [];
        for (let i = 1; i <= 6; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          if ((idx + i) % 2 === 0 || (idx + i) % 3 === 0) {
            completed.push(dateStr);
          }
        }
        return { ...h, completedDates: completed };
      });
      storage.set(HABITS_KEY, JSON.stringify(habits));
      return habits;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_HABITS;
  }
}

export function toggleLifestyleHabit(habitId: string, targetDateStr?: string): LifestyleHabit[] {
  const habits = getLifestyleHabits();
  const targetDate = targetDateStr || getTodayStr();

  const updated = habits.map((h) => {
    if (h.id !== habitId) return h;
    const exists = h.completedDates.includes(targetDate);
    const newDates = exists
      ? h.completedDates.filter((d) => d !== targetDate)
      : [...h.completedDates, targetDate];
    return { ...h, completedDates: newDates };
  });

  storage.set(HABITS_KEY, JSON.stringify(updated));
  return updated;
}

export function addCustomHabit(label: string, detail: string, category: LifestyleHabit['category']): LifestyleHabit[] {
  const habits = getLifestyleHabits();
  const newHabit: LifestyleHabit = {
    id: 'habit-' + Date.now(),
    label,
    detail,
    category,
    iconName: category === 'sleep' ? 'Moon' : category === 'movement' ? 'Activity' : category === 'hydration' ? 'Droplets' : 'Leaf',
    completedDates: [getTodayStr()],
  };
  const updated = [...habits, newHabit];
  storage.set(HABITS_KEY, JSON.stringify(updated));
  return updated;
}

export function getRoutines(): { morning: RoutineData; evening: RoutineData } {
  try {
    const raw = storage.getString(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ROUTINES;
  } catch {
    return DEFAULT_ROUTINES;
  }
}

export function toggleRoutineStep(routineType: 'morning' | 'evening', stepId: string): { morning: RoutineData; evening: RoutineData } {
  const routines = getRoutines();
  const target = routines[routineType];
  const updatedSteps = target.steps.map((s) => (s.id === stepId ? { ...s, completed: !s.completed } : s));

  const updated = {
    ...routines,
    [routineType]: {
      ...target,
      steps: updatedSteps,
    },
  };

  storage.set(ROUTINES_KEY, JSON.stringify(updated));
  return updated;
}

export function resetRoutine(routineType: 'morning' | 'evening'): { morning: RoutineData; evening: RoutineData } {
  const routines = getRoutines();
  const target = routines[routineType];
  const updatedSteps = target.steps.map((s) => ({ ...s, completed: false }));

  const updated = {
    ...routines,
    [routineType]: {
      ...target,
      steps: updatedSteps,
    },
  };

  storage.set(ROUTINES_KEY, JSON.stringify(updated));
  return updated;
}

export function getWeeklyTrendPoints(): DayTrendPoint[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const points: DayTrendPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay()];

    const scoreBase = 76 + ((i * 3 + 4) % 18);
    const sleepBase = 7.0 + ((i * 2 + 1) % 15) / 10;
    const stepsBase = 5800 + ((i * 700 + 350) % 3800);
    const waterBase = 1.6 + ((i * 3 + 2) % 10) / 10;
    const habitsPct = 60 + ((i * 7) % 35);

    points.push({
      dayLabel: dayName,
      dateStr,
      balanceScore: i === 0 ? 84 : scoreBase,
      sleepHours: i === 0 ? 7.4 : sleepBase,
      steps: i === 0 ? 6482 : stepsBase,
      waterLiters: i === 0 ? 1.8 : waterBase,
      habitCompletionPct: i === 0 ? 80 : habitsPct,
    });
  }

  return points;
}
