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
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useProfile } from '../../src/context/ProfileContext';
import { TSOM_TYPES } from '../../src/lib/ethiopianCalendar';

// Storage Engine
import {
  getLifestyleSnapshot,
  logWater,
  logSteps,
  logProtein,
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
} from '../../src/storage/lifestyleStorage';

// Lifestyle Components
import LifestyleHeader from '../../src/components/lifestyle/LifestyleHeader';
import LifestyleWelcomeCard from '../../src/components/lifestyle/LifestyleWelcomeCard';
import LifestyleOverviewCard from '../../src/components/lifestyle/LifestyleOverviewCard';
import DailySnapshotGrid from '../../src/components/lifestyle/DailySnapshotGrid';
import TodaysGoalsSection from '../../src/components/lifestyle/TodaysGoalsSection';
import WeeklyTrendsSection from '../../src/components/lifestyle/WeeklyTrendsSection';
import RoutinesTimelineSection from '../../src/components/lifestyle/RoutinesTimelineSection';
import HabitTrackerGrid from '../../src/components/lifestyle/HabitTrackerGrid';
import CategoryDetailModal from '../../src/components/lifestyle/CategoryDetailModal';

export default function LifestyleScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { profile } = useProfile();

  // Selected Date state
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Data states
  const [snapshot, setSnapshot] = useState<LifestyleSnapshot>(getLifestyleSnapshot());
  const [goals, setGoals] = useState<LifestyleGoal[]>(getLifestyleGoals());
  const [habits, setHabits] = useState<LifestyleHabit[]>(getLifestyleHabits());
  const [routines, setRoutines] = useState<{ morning: RoutineData; evening: RoutineData }>(getRoutines());
  const [trendPoints, setTrendPoints] = useState<DayTrendPoint[]>(getWeeklyTrendPoints());

  // Category Detail Modal
  const [activeCategoryModal, setActiveCategoryModal] = useState<'recovery' | 'movement' | 'nourishment' | 'mindfulness' | 'gymNutrition' | null>(null);

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

  const handleToggleGoal = (id: string) => {
    const updated = toggleLifestyleGoal(id);
    setGoals(updated);
  };

  const handleAddGoal = (title: string, category: LifestyleGoal['category'], target?: string) => {
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

  const isFasting = profile?.fastingMode && profile.fastingMode !== TSOM_TYPES.NONE;

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
          streakDays={5}
          onLogWater={handleLogWater}
          onLogProtein={handleLogProtein}
          onOpenBreathwork={() => setBreathingActive(true)}
          onOpenGymNutrition={() => setActiveCategoryModal('gymNutrition')}
        />

        {/* 3. Today's Lifestyle Overview Card */}
        <LifestyleOverviewCard snapshot={snapshot} />

        {/* 4. Daily Snapshot Grid (including Gym Nutrition & Protein) */}
        <DailySnapshotGrid
          snapshot={snapshot}
          onLogWater={handleLogWater}
          onLogSteps={handleLogSteps}
          onLogProtein={handleLogProtein}
          onOpenBreathwork={() => setBreathingActive(true)}
          onOpenCategory={(cat) => setActiveCategoryModal(cat)}
        />

        {/* 5. Today's Goals Section */}
        <TodaysGoalsSection
          goals={goals}
          onToggleGoal={handleToggleGoal}
          onAddGoal={handleAddGoal}
        />

        {/* 6. Weekly Trends ("Your Week") */}
        <WeeklyTrendsSection trendPoints={trendPoints} />

        {/* 7. Weekly Habit Consistency Matrix */}
        <HabitTrackerGrid
          habits={habits}
          onToggleHabit={handleToggleHabit}
        />

        {/* 8. Daily Routines Timeline (Morning / Evening) */}
        <RoutinesTimelineSection
          routines={routines}
          onToggleStep={handleToggleRoutineStep}
          onResetRoutine={handleResetRoutine}
        />

        {/* 9. Lifestyle Categories & Evidence Protocols */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lifestyle Protocols</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Evidence-based biological rhythms, gym nutrition & integrative medicine
          </Text>

          <View style={styles.protocolCardsList}>
            {/* Gym & Athletic Nutrition */}
            <TouchableOpacity
              style={[styles.protocolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setActiveCategoryModal('gymNutrition')}
              activeOpacity={0.8}
            >
              <View style={[styles.protocolIconWrap, { backgroundColor: 'rgba(234, 88, 12, 0.12)' }]}>
                <Flame size={18} color="#ea580c" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Gym Nutrition & Muscle Recovery</Text>
                <Text style={[styles.protocolSnippet, { color: theme.textSecondary }]}>
                  Pre-workout complex carbs, intra-set electrolytes & 30g post-workout teff protein timing.
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            {/* Rest & Recovery */}
            <TouchableOpacity
              style={[styles.protocolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setActiveCategoryModal('recovery')}
              activeOpacity={0.8}
            >
              <View style={[styles.protocolIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
                <Moon size={18} color="#6366f1" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Circadian Synchronization</Text>
                <Text style={[styles.protocolSnippet, { color: theme.textSecondary }]}>
                  Stabilize heart rate variability (HRV) and optimize slow-wave cellular repair.
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            {/* Movement & Mobility */}
            <TouchableOpacity
              style={[styles.protocolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setActiveCategoryModal('movement')}
              activeOpacity={0.8}
            >
              <View style={[styles.protocolIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Activity size={18} color="#10b981" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Eskista Scapular Reset</Text>
                <Text style={[styles.protocolSnippet, { color: theme.textSecondary }]}>
                  Traditional rhythmic thoracic pulses to release desk posture tension.
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>

            {/* Nourishment & Fasting */}
            <TouchableOpacity
              style={[styles.protocolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => setActiveCategoryModal('nourishment')}
              activeOpacity={0.8}
            >
              <View style={[styles.protocolIconWrap, { backgroundColor: 'rgba(22, 163, 74, 0.12)' }]}>
                <Utensils size={18} color="#16a34a" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>
                  Prebiotic Whole Teff & Telba {isFasting ? '(Fasting Active)' : ''}
                </Text>
                <Text style={[styles.protocolSnippet, { color: theme.textSecondary }]}>
                  Microbiome nourishment with resistant starch and anti-inflammatory flaxseed omega.
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

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
            <Text style={[styles.recTitle, { color: theme.textPrimary }]}>Gym Nutrition & Sleep Synergy</Text>
            <Text style={[styles.recBody, { color: theme.textSecondary }]}>
              Consuming your post-workout protein with toasted telba omega-3 accelerates muscle repair, allowing deeper slow-wave sleep recovery tonight.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Category Detail Modal */}
      <CategoryDetailModal
        visible={!!activeCategoryModal}
        category={activeCategoryModal}
        onClose={() => setActiveCategoryModal(null)}
      />

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
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
    marginBottom: 12,
  },
  protocolCardsList: {
    gap: 10,
  },
  protocolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  protocolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolTextWrap: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  protocolSnippet: {
    fontSize: 11.5,
    lineHeight: 16,
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
