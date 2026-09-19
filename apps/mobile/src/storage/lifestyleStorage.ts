import { storage } from './mmkv';

export type LifestyleCategoryKey =
  | 'nutrition'
  | 'fitness'
  | 'sleep'
  | 'digital'
  | 'mental'
  | 'hydration'
  | 'habits'
  | 'social';

export interface CategoryOverviewData {
  key: LifestyleCategoryKey;
  name: string;
  shortDesc: string;
  iconName: string;
  color: string;
  primaryMetric: string;
  statusLabel: string;
  progressPct: number;
}

export interface LifestyleSnapshot {
  date: string;
  balanceScore: number;

  // 1. Nutrition
  mealsLogged: number;
  mealsTarget: number;
  nutritionConsistencyPct: number;
  proteinGrams: number;
  proteinTargetGrams: number;
  fastingWindowActive: boolean;

  // 2. Fitness & Gym
  steps: number;
  stepsTarget: number;
  activeMinutes: number;
  activeMinutesTarget: number;
  workoutsThisWeek: number;
  workoutsWeeklyTarget: number;

  // 3. Sleep & Recovery
  sleepHours: number;
  sleepTarget: number;
  sleepQuality: 'Optimal' | 'Good' | 'Fair' | 'Restless';
  sleepConsistencyPct: number;
  bedtimeAnchor: string;

  // 4. Digital Wellbeing
  screenMinutes: number;
  screenLimitMinutes: number;
  digitalBreaksCount: number;
  focusMinutes: number;

  // 5. Mental Wellbeing
  currentMood: 'Great' | 'Good' | 'Okay' | 'Low' | 'Difficult';
  stressLevel: 'Low' | 'Moderate' | 'Elevated';
  mindfulnessMins: number;
  mindfulnessTargetMins: number;

  // 6. Hydration
  waterMl: number;
  waterTargetMl: number;

  // 7. Habits & Routines
  completedHabitsCount: number;
  totalHabitsCount: number;
  habitStreakDays: number;

  // 8. Social Wellbeing
  connectionsThisWeek: number;
  connectionWeeklyTarget: number;
  lastSocialCheckIn: string;
}

export interface LifestyleGoal {
  id: string;
  title: string;
  category: LifestyleCategoryKey;
  completed: boolean;
  target?: string;
}

export interface LifestyleHabit {
  id: string;
  label: string;
  detail: string;
  category: LifestyleCategoryKey;
  iconName: string;
  completedDates: string[];
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
  dayLabel: string;
  dateStr: string;
  balanceScore: number;
  sleepHours: number;
  steps: number;
  waterLiters: number;
  proteinGrams: number;
  screenMinutes: number;
  habitCompletionPct: number;
}

const SNAPSHOT_KEY = 'nuracare_lifestyle_hub_snapshot';
const GOALS_KEY = 'nuracare_lifestyle_goals';
const HABITS_KEY = 'nuracare_lifestyle_habits';
const ROUTINES_KEY = 'nuracare_lifestyle_routines';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_SNAPSHOT: LifestyleSnapshot = {
  date: getTodayStr(),
  balanceScore: 84,

  // 1. Nutrition
  mealsLogged: 3,
  mealsTarget: 3,
  nutritionConsistencyPct: 82,
  proteinGrams: 95,
  proteinTargetGrams: 130,
  fastingWindowActive: true,

  // 2. Fitness & Gym
  steps: 6482,
  stepsTarget: 9000,
  activeMinutes: 42,
  activeMinutesTarget: 45,
  workoutsThisWeek: 4,
  workoutsWeeklyTarget: 5,

  // 3. Sleep & Recovery
  sleepHours: 7.4,
  sleepTarget: 8.0,
  sleepQuality: 'Good',
  sleepConsistencyPct: 84,
  bedtimeAnchor: '23:15',

  // 4. Digital Wellbeing
  screenMinutes: 252, // 4h 12m
  screenLimitMinutes: 300, // 5h 00m
  digitalBreaksCount: 3,
  focusMinutes: 100, // 1h 40m

  // 5. Mental Wellbeing
  currentMood: 'Good',
  stressLevel: 'Low',
  mindfulnessMins: 12,
  mindfulnessTargetMins: 15,

  // 6. Hydration
  waterMl: 1800,
  waterTargetMl: 2500,

  // 7. Habits & Routines
  completedHabitsCount: 4,
  totalHabitsCount: 5,
  habitStreakDays: 5,

  // 8. Social Wellbeing
  connectionsThisWeek: 2,
  connectionWeeklyTarget: 3,
  lastSocialCheckIn: 'Family call (Yesterday)',
};

const DEFAULT_GOALS: LifestyleGoal[] = [
  { id: 'g-nutr', title: 'Consume 30g Post-Workout Teff Protein', category: 'nutrition', completed: true, target: '30g protein' },
  { id: 'g-fit', title: 'Reach 8,500 Steps with Post-Meal Walk', category: 'fitness', completed: false, target: '8,500 steps' },
  { id: 'g-sleep', title: 'Digital Sunset 60 Minutes Before Bed', category: 'sleep', completed: false, target: '22:15' },
  { id: 'g-dig', title: 'Take 3 Hourly Screen-Free Breaks', category: 'digital', completed: true, target: '3 breaks' },
  { id: 'g-ment', title: 'Evening 4-7-8 Breathwork Session', category: 'mental', completed: false, target: '2 min' },
  { id: 'g-hydr', title: 'Drink 2.5L Filtered Mineral Water', category: 'hydration', completed: false, target: '2.5 L' },
  { id: 'g-hab', title: 'Complete Morning Awakening Routine', category: 'habits', completed: true, target: 'Morning' },
  { id: 'g-soc', title: 'Call a Friend or Family Member', category: 'social', completed: false, target: 'Weekly' },
];

const DEFAULT_HABITS: LifestyleHabit[] = [
  { id: 'h-1', label: 'Morning Sunlight', detail: '10-15m natural light anchor', category: 'sleep', iconName: 'Sun', completedDates: [] },
  { id: 'h-2', label: 'Hydration Starter', detail: '500ml water upon waking', category: 'hydration', iconName: 'Droplets', completedDates: [] },
  { id: 'h-3', label: 'Gym & Mobility Reset', detail: 'Eskista scapular release or lifting', category: 'fitness', iconName: 'Flame', completedDates: [] },
  { id: 'h-4', label: 'Prebiotic Teff Grain', detail: 'Fermented resistant gut starch', category: 'nutrition', iconName: 'Leaf', completedDates: [] },
  { id: 'h-5', label: 'Digital Sunset', detail: 'Blue light filters off at night', category: 'digital', iconName: 'Moon', completedDates: [] },
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
      { id: 'm-4', time: '07:05', title: 'Gentle Mobility Reset', detail: 'Thoracic rotations & joint flossing', completed: false },
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
    return { ...DEFAULT_SNAPSHOT, ...parsed };
  } catch {
    return DEFAULT_SNAPSHOT;
  }
}

export function saveLifestyleSnapshot(snapshot: LifestyleSnapshot): void {
  storage.set(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function getCategoriesOverview(snapshot: LifestyleSnapshot): CategoryOverviewData[] {
  return [
    {
      key: 'nutrition',
      name: 'Nutrition',
      shortDesc: 'Understand eating patterns & metabolic fuel',
      iconName: 'Utensils',
      color: '#16a34a',
      primaryMetric: `${snapshot.mealsLogged}/${snapshot.mealsTarget} Meals`,
      statusLabel: `${snapshot.proteinGrams}g Protein`,
      progressPct: snapshot.nutritionConsistencyPct,
    },
    {
      key: 'fitness',
      name: 'Fitness & Gym',
      shortDesc: 'Track movement, training & active vigor',
      iconName: 'Activity',
      color: '#ea580c',
      primaryMetric: `${snapshot.steps.toLocaleString()} Steps`,
      statusLabel: `${snapshot.workoutsThisWeek}/${snapshot.workoutsWeeklyTarget} Workouts`,
      progressPct: Math.min(100, Math.round((snapshot.steps / snapshot.stepsTarget) * 100)),
    },
    {
      key: 'sleep',
      name: 'Sleep & Recovery',
      shortDesc: 'Build restorative sleep & circadian rhythm',
      iconName: 'Moon',
      color: '#6366f1',
      primaryMetric: `${snapshot.sleepHours}h Sleep`,
      statusLabel: `${snapshot.sleepQuality} Quality`,
      progressPct: Math.min(100, Math.round((snapshot.sleepHours / snapshot.sleepTarget) * 100)),
    },
    {
      key: 'digital',
      name: 'Digital Wellbeing',
      shortDesc: 'Create intentional screen & focus habits',
      iconName: 'Smartphone',
      color: '#0284c7',
      primaryMetric: `${Math.floor(snapshot.screenMinutes / 60)}h ${snapshot.screenMinutes % 60}m`,
      statusLabel: `${snapshot.digitalBreaksCount} Breaks Taken`,
      progressPct: Math.min(100, Math.round((snapshot.screenMinutes / snapshot.screenLimitMinutes) * 100)),
    },
    {
      key: 'mental',
      name: 'Mental Wellbeing',
      shortDesc: 'Reflect, reset & balance autonomic tone',
      iconName: 'Wind',
      color: '#f59e0b',
      primaryMetric: `${snapshot.currentMood} Mood`,
      statusLabel: `${snapshot.stressLevel} Stress`,
      progressPct: Math.min(100, Math.round((snapshot.mindfulnessMins / snapshot.mindfulnessTargetMins) * 100)),
    },
    {
      key: 'hydration',
      name: 'Hydration',
      shortDesc: 'Stay steady with cellular hydration',
      iconName: 'Droplets',
      color: '#0ea5e9',
      primaryMetric: `${(snapshot.waterMl / 1000).toFixed(1)} L`,
      statusLabel: `${Math.round((snapshot.waterMl / snapshot.waterTargetMl) * 100)}% of 2.5L`,
      progressPct: Math.min(100, Math.round((snapshot.waterMl / snapshot.waterTargetMl) * 100)),
    },
    {
      key: 'habits',
      name: 'Habits & Routines',
      shortDesc: 'Build grounding daily consistency that lasts',
      iconName: 'CheckCircle2',
      color: '#10b981',
      primaryMetric: `${snapshot.completedHabitsCount}/${snapshot.totalHabitsCount} Done`,
      statusLabel: `${snapshot.habitStreakDays}-Day Streak`,
      progressPct: Math.min(100, Math.round((snapshot.completedHabitsCount / snapshot.totalHabitsCount) * 100)),
    },
    {
      key: 'social',
      name: 'Social Wellbeing',
      shortDesc: 'Make space for intentional human connection',
      iconName: 'Users',
      color: '#ec4899',
      primaryMetric: `${snapshot.connectionsThisWeek}/${snapshot.connectionWeeklyTarget} Weekly`,
      statusLabel: 'Intentional',
      progressPct: Math.min(100, Math.round((snapshot.connectionsThisWeek / snapshot.connectionWeeklyTarget) * 100)),
    },
  ];
}

export function logWater(deltaMl: number): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextWater = Math.max(0, current.waterMl + deltaMl);
  const updated: LifestyleSnapshot = { ...current, waterMl: nextWater };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logSteps(deltaSteps: number): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextSteps = Math.max(0, current.steps + deltaSteps);
  const updated: LifestyleSnapshot = { ...current, steps: nextSteps };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logProtein(deltaGrams: number): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextProtein = Math.max(0, current.proteinGrams + deltaGrams);
  const updated: LifestyleSnapshot = { ...current, proteinGrams: nextProtein };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logMeal(): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const nextMeals = Math.min(current.mealsTarget, current.mealsLogged + 1);
  const updated: LifestyleSnapshot = { ...current, mealsLogged: nextMeals };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logWorkout(durationMinutes = 40): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const updated: LifestyleSnapshot = {
    ...current,
    activeMinutes: current.activeMinutes + durationMinutes,
    workoutsThisWeek: Math.min(current.workoutsWeeklyTarget, current.workoutsThisWeek + 1),
  };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logDigitalBreak(): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const updated: LifestyleSnapshot = {
    ...current,
    digitalBreaksCount: current.digitalBreaksCount + 1,
  };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logMoodCheckIn(mood: LifestyleSnapshot['currentMood']): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const updated: LifestyleSnapshot = { ...current, currentMood: mood };
  saveLifestyleSnapshot(updated);
  return updated;
}

export function logSocialConnection(): LifestyleSnapshot {
  const current = getLifestyleSnapshot();
  const updated: LifestyleSnapshot = {
    ...current,
    connectionsThisWeek: Math.min(current.connectionWeeklyTarget, current.connectionsThisWeek + 1),
    lastSocialCheckIn: 'Logged today',
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

export function addLifestyleGoal(title: string, category: LifestyleCategoryKey, target?: string): LifestyleGoal[] {
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

    const scoreBase = 78 + ((i * 3 + 4) % 16);
    const sleepBase = 7.0 + ((i * 2 + 1) % 15) / 10;
    const stepsBase = 5800 + ((i * 700 + 350) % 3800);
    const waterBase = 1.6 + ((i * 3 + 2) % 10) / 10;
    const proteinBase = 85 + ((i * 8 + 5) % 45);
    const screenBase = 220 + ((i * 18 + 10) % 70);
    const habitsPct = 60 + ((i * 7) % 35);

    points.push({
      dayLabel: dayName,
      dateStr,
      balanceScore: i === 0 ? 84 : scoreBase,
      sleepHours: i === 0 ? 7.4 : sleepBase,
      steps: i === 0 ? 6482 : stepsBase,
      waterLiters: i === 0 ? 1.8 : waterBase,
      proteinGrams: i === 0 ? 95 : proteinBase,
      screenMinutes: i === 0 ? 252 : screenBase,
      habitCompletionPct: i === 0 ? 80 : habitsPct,
    });
  }

  return points;
}
