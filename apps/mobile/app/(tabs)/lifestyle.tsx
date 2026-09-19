import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Moon,
  Activity,
  Utensils,
  Wind,
  Sparkles,
  PlayCircle,
  RotateCcw,
  Bot,
  ChevronRight,
  ShieldCheck,
  Zap,
  Leaf,
  Droplets,
  Heart,
  Compass,
  Flame,
  Smartphone,
  CheckCircle2,
  Users,
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useProfile } from '../../src/context/ProfileContext';
import { TSOM_TYPES } from '../../src/lib/ethiopianCalendar';

// Storage Engine
import {
  getLifestyleSnapshot,
  getCategoriesOverview,
  logWater,
  logSteps,
  logProtein,
  logMeal,
  logWorkout,
  logDigitalBreak,
  logMoodCheckIn,
  logSocialConnection,
  getLifestyleGoals,
  toggleLifestyleGoal,
  addLifestyleGoal,
  getLifestyleHabits,
  toggleLifestyleHabit,
  getRoutines,
  toggleRoutineStep,
  resetRoutine,
  getWeeklyTrendPoints,
  LifestyleSnapshot,
  LifestyleGoal,
  LifestyleHabit,
  RoutineData,
  DayTrendPoint,
  LifestyleCategoryKey,
} from '../../src/storage/lifestyleStorage';

// Lifestyle Components
import LifestyleHeader from '../../src/components/lifestyle/LifestyleHeader';
import LifestyleWelcomeCard from '../../src/components/lifestyle/LifestyleWelcomeCard';
import LifestyleOverviewCard from '../../src/components/lifestyle/LifestyleOverviewCard';
import LifestyleCategoriesGrid from '../../src/components/lifestyle/LifestyleCategoriesGrid';
import TodaysPrioritiesSection from '../../src/components/lifestyle/TodaysPrioritiesSection';
import WeeklySummaryRadar from '../../src/components/lifestyle/WeeklySummaryRadar';
import TodaysGoalsSection from '../../src/components/lifestyle/TodaysGoalsSection';
import WeeklyTrendsSection from '../../src/components/lifestyle/WeeklyTrendsSection';
import RoutinesTimelineSection from '../../src/components/lifestyle/RoutinesTimelineSection';
import HabitTrackerGrid from '../../src/components/lifestyle/HabitTrackerGrid';

// Detail View
import CategoryDetailView from '../../src/components/lifestyle/detail/CategoryDetailView';

export default function LifestyleScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { profile } = useProfile();

  // Active Category View state: null = Lifestyle Home, string = Category Detail
  const [activeCategory, setActiveCategory] = useState<LifestyleCategoryKey | null>(null);

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Data states
  const [snapshot, setSnapshot] = useState<LifestyleSnapshot>(getLifestyleSnapshot());
  const [goals, setGoals] = useState<LifestyleGoal[]>(getLifestyleGoals());
  const [habits, setHabits] = useState<LifestyleHabit[]>(getLifestyleHabits());
  const [routines, setRoutines] = useState<{ morning: RoutineData; evening: RoutineData }>(getRoutines());
  const [trendPoints, setTrendPoints] = useState<DayTrendPoint[]>(getWeeklyTrendPoints());

  // Interactive 4-7-8 Breathwork
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Ready' | 'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Ready');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(0);

  // Reload data
  const refreshData = useCallback(() => {
    setSnapshot(getLifestyleSnapshot());
    setGoals(getLifestyleGoals());
    setHabits(getLifestyleHabits());
    setRoutines(getRoutines());
    setTrendPoints(getWeeklyTrendPoints());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Breathwork timer cycle
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathingActive) {
      if (breathPhase === 'Ready' || breathPhase === 'Exhale (8s)') {
        setBreathPhase('Inhale (4s)');
        setBreathSecondsLeft(4);
      }

      timer = setInterval(() => {
        setBreathSecondsLeft((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === 'Inhale (4s)') return 'Hold (7s)';
              if (current === 'Hold (7s)') return 'Exhale (8s)';
              return 'Inhale (4s)';
            });
            return currentPhaseDuration(breathPhase);
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathPhase('Ready');
      setBreathSecondsLeft(0);
    }
    return () => clearInterval(timer);
  }, [breathingActive, breathPhase]);

  const currentPhaseDuration = (phase: string) => {
    if (phase === 'Inhale (4s)') return 7;
    if (phase === 'Hold (7s)') return 8;
    return 4;
  };

  // Action handlers
  const handleLogWater = () => {
    const updated = logWater(250);
    setSnapshot(updated);
  };

  const handleLogSteps = () => {
    const updated = logSteps(500);
    setSnapshot(updated);
  };

  const handleLogProtein = () => {
    const updated = logProtein(25);
    setSnapshot(updated);
  };

  const handleLogMeal = () => {
    const updated = logMeal();
    setSnapshot(updated);
  };

  const handleLogWorkout = () => {
    const updated = logWorkout(40);
    setSnapshot(updated);
  };

  const handleLogDigitalBreak = () => {
    const updated = logDigitalBreak();
    setSnapshot(updated);
  };

  const handleLogMood = (mood: any) => {
    const updated = logMoodCheckIn(mood);
    setSnapshot(updated);
  };

  const handleLogSocial = () => {
    const updated = logSocialConnection();
    setSnapshot(updated);
  };

  const handleToggleGoal = (id: string) => {
    const updated = toggleLifestyleGoal(id);
    setGoals(updated);
  };

  const handleAddGoal = (title: string, category: LifestyleCategoryKey, target?: string) => {
    const updated = addLifestyleGoal(title, category, target);
    setGoals(updated);
  };

  const handleToggleHabit = (id: string, dateStr: string) => {
    const updated = toggleLifestyleHabit(id, dateStr);
    setHabits(updated);
  };

  const handleToggleRoutineStep = (type: 'morning' | 'evening', stepId: string) => {
    const updated = toggleRoutineStep(type, stepId);
    setRoutines(updated);
  };

  const handleResetRoutine = (type: 'morning' | 'evening') => {
    const updated = resetRoutine(type);
    setRoutines(updated);
  };

  // IF CATEGORY DETAIL IS SELECTED, RENDER DETAIL EXPERIENCE
  if (activeCategory) {
    return (
      <CategoryDetailView
        categoryKey={activeCategory}
        snapshot={snapshot}
        goals={goals}
        trendPoints={trendPoints}
        onBack={() => setActiveCategory(null)}
        onLogMeal={handleLogMeal}
        onLogWorkout={handleLogWorkout}
        onLogWater={handleLogWater}
        onLogDigitalBreak={handleLogDigitalBreak}
        onLogMood={handleLogMood}
        onLogSocial={handleLogSocial}
        onToggleGoal={handleToggleGoal}
        onOpenBreathwork={() => {
          setActiveCategory(null);
          setBreathingActive(true);
        }}
      />
    );
  }

  // DEFAULT: LIFESTYLE HOME / HUB
  const categoriesList = getCategoriesOverview(snapshot);

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      {/* 1. Header with 7-Day Date Strip */}
      <LifestyleHeader
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onOpenQuickActions={handleLogWater}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Welcome Picture Hero Banner */}
        <LifestyleWelcomeCard
          balanceScore={snapshot.balanceScore}
          streakDays={snapshot.habitStreakDays}
          onLogWater={handleLogWater}
          onLogProtein={handleLogProtein}
          onOpenBreathwork={() => setBreathingActive(true)}
          onOpenGymNutrition={() => setActiveCategory('fitness')}
        />

        {/* 3. Today's Lifestyle Overview Card */}
        <LifestyleOverviewCard snapshot={snapshot} />

        {/* 4. 8 Primary Lifestyle Categories Grid */}
        <LifestyleCategoriesGrid
          categories={categoriesList}
          onSelectCategory={(key) => setActiveCategory(key)}
        />

        {/* 5. Today's Priorities (2-4 high-impact actions) */}
        <TodaysPrioritiesSection
          onOpenBreathwork={() => setBreathingActive(true)}
          onLogWater={handleLogWater}
          onOpenCategory={(key) => setActiveCategory(key)}
        />

        {/* 6. Weekly Progress Summary across 8 categories */}
        <WeeklySummaryRadar snapshot={snapshot} />

        {/* 7. Today's Unified Active Goals */}
        <TodaysGoalsSection
          goals={goals}
          onToggleGoal={handleToggleGoal}
          onAddGoal={handleAddGoal}
        />

        {/* 8. Routines Timeline (Morning / Evening) */}
        <RoutinesTimelineSection
          routines={routines}
          onToggleStep={handleToggleRoutineStep}
          onResetRoutine={handleResetRoutine}
        />

        {/* 9. Weekly Habit Consistency Matrix */}
        <HabitTrackerGrid
          habits={habits}
          onToggleHabit={handleToggleHabit}
        />

        {/* 10. Interactive 4-7-8 Autonomic Breathwork Module */}
        <View style={[styles.breathworkContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.breathBadge, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]}>
            <Wind size={13} color={theme.accent} />
            <Text style={[styles.breathBadgeText, { color: theme.accent }]}>PARASYMPATHETIC RESET</Text>
          </View>
          <Text style={[styles.breathHeading, { color: theme.textPrimary }]}>4-7-8 Autonomic Breathwork</Text>
          <Text style={[styles.breathDescription, { color: theme.textSecondary }]}>
            Scientific pranayama technique proven to down-regulate sympathetic fight-or-flight within 2 minutes.
          </Text>

          {/* Pulsing Visual Circle */}
          <View style={styles.breathVisualRingWrap}>
            <View style={[styles.breathRingGlow, breathingActive && [styles.breathRingGlowActive, { backgroundColor: theme.accentGlow }]]} />
            <View
              style={[
                styles.breathCenterCircle,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                breathingActive && { borderColor: theme.accent },
              ]}
            >
              <Text style={[styles.breathPhaseText, { color: theme.accent }]}>{breathPhase}</Text>
              {breathingActive && (
                <Text style={[styles.breathCountdownText, { color: theme.textPrimary }]}>{breathSecondsLeft}s</Text>
              )}
            </View>
          </View>

          {/* Controls */}
          <TouchableOpacity
            style={[
              styles.breathActionBtn,
              { backgroundColor: theme.accent },
              breathingActive && { backgroundColor: theme.error },
            ]}
            onPress={() => setBreathingActive(!breathingActive)}
            activeOpacity={0.85}
          >
            {breathingActive ? (
              <>
                <RotateCcw size={17} color="#ffffff" />
                <Text style={styles.breathActionBtnText}>End Session</Text>
              </>
            ) : (
              <>
                <PlayCircle size={17} color="#ffffff" />
                <Text style={styles.breathActionBtnText}>Begin 2-Min Reset</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 11. Recommended for You (Contextual AI Insight) */}
        <View style={[styles.recCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <View style={[styles.recIconWrap, { backgroundColor: theme.accentGlow }]}>
            <Sparkles size={16} color={theme.accent} />
          </View>
          <View style={styles.recTextWrap}>
            <Text style={[styles.recTitle, { color: theme.textPrimary }]}>Grounded Lifestyle Recommendation</Text>
            <Text style={[styles.recBody, { color: theme.textSecondary }]}>
              Your morning routines and hydration have been consistent. Try setting a gentle 20-20-20 ocular pause during afternoon screen time to protect your evening melatonin synthesis.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Permanent Floating Chat FAB */}
      <TouchableOpacity
        style={[styles.floatingChatFab, { backgroundColor: theme.accent }]}
        onPress={() => router.push('/(tabs)/chat')}
        activeOpacity={0.85}
      >
        <Bot size={22} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 95,
  },
  breathworkContainer: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  breathBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  breathBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  breathHeading: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  breathDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  breathVisualRingWrap: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 8,
  },
  breathRingGlow: {
    position: 'absolute',
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor: 'rgba(84, 200, 120, 0.08)',
  },
  breathRingGlowActive: {
    backgroundColor: 'rgba(84, 200, 120, 0.22)',
  },
  breathCenterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathPhaseText: {
    fontSize: 12.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  breathCountdownText: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  breathActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 16,
  },
  breathActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  recIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  recTextWrap: {
    flex: 1,
  },
  recTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 3,
  },
  recBody: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  floatingChatFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 99,
  },
});
