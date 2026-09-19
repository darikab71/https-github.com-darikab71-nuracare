import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Moon,
  Sun,
  Activity,
  Heart,
  Wind,
  Utensils,
  ShieldCheck,
  Droplets,
  Zap,
  Sparkles,
  Clock,
  Compass,
  PlayCircle,
  CheckCircle2,
  Leaf,
  ChevronRight,
  Bot,
  RotateCcw,
  Check,
} from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { useProfile } from '../../src/context/ProfileContext';
import { useTheme } from '../../src/context/ThemeContext';
import { TSOM_TYPES } from '../../src/lib/ethiopianCalendar';

// 4 Professional Lifestyle Pillars
const LIFESTYLE_PILLARS = [
  { id: 'recovery', label: 'Rest & Recovery', icon: Moon },
  { id: 'movement', label: 'Movement & Mobility', icon: Activity },
  { id: 'nourishment', label: 'Nourishment & Fasting', icon: Utensils },
  { id: 'mindfulness', label: 'Breathwork & Reset', icon: Wind },
];

export default function LifestyleScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { profile } = useProfile();
  const { wellnessScore } = useWellnessStore();

  const [activePillar, setActivePillar] = useState<'recovery' | 'movement' | 'nourishment' | 'mindfulness'>('recovery');

  // Interactive Breathwork State (4-7-8 Breathing Technique)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)' | 'Ready'>('Ready');
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(0);

  // Daily Habits Completed State
  const [completedHabits, setCompletedHabits] = useState<string[]>([
    'morning_sunlight',
    'hydration_start',
  ]);

  const toggleHabit = (id: string) => {
    if (completedHabits.includes(id)) {
      setCompletedHabits(completedHabits.filter((h) => h !== id));
    } else {
      setCompletedHabits([...completedHabits, id]);
    }
  };

  // Breathwork Timer Cycle
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
    if (phase === 'Inhale (4s)') return 7; // transitioning to hold
    if (phase === 'Hold (7s)') return 8; // transitioning to exhale
    return 4; // transitioning to inhale
  };

  const isFasting = profile?.fastingMode && profile.fastingMode !== TSOM_TYPES.NONE;

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.topHeaderContent}>
          <Text style={[styles.topHeaderTitle, { color: theme.textPrimary }]}>Lifestyle Medicine</Text>
          <Text style={[styles.topHeaderSubtitle, { color: theme.textSecondary }]}>Evidence-based protocols for daily vitality</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Pillar Selector Pills */}
        <View style={styles.pillarPillsRow}>
          {LIFESTYLE_PILLARS.map((p) => {
            const Icon = p.icon;
            const isSelected = activePillar === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.pillarPill,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                  isSelected && { backgroundColor: theme.accentDeep, borderColor: theme.accent },
                ]}
                onPress={() => setActivePillar(p.id as any)}
                activeOpacity={0.75}
              >
                <Icon size={16} color={isSelected ? theme.accent : theme.textSecondary} />
                <Text
                  style={[
                    styles.pillarPillText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* PILLAR 1: REST & RECOVERY */}
        {activePillar === 'recovery' && (
          <View style={styles.pillarContent}>
            {/* Overview Card */}
            <View style={[styles.heroOverviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.greenBadge}>
                  <Moon size={13} color="#16a34a" />
                  <Text style={styles.greenBadgeText}>Sleep Architecture</Text>
                </View>
                <Text style={styles.heroTargetText}>Target: 7.5 - 8.0 hrs</Text>
              </View>
              <Text style={[styles.heroCardHeading, { color: theme.textPrimary }]}>Circadian Synchronization</Text>
              <Text style={[styles.heroCardDescription, { color: theme.textSecondary }]}>
                Aligning your sleep schedule with natural dark-light cycles stabilizes heart rate variability (HRV) and optimizes deep stage cellular repair.
              </Text>
            </View>

            {/* Protocols List */}
            <Text style={[styles.subheading, { color: theme.textPrimary }]}>Daily Wind-Down Ritual</Text>
            
            <TouchableOpacity
              style={[styles.habitCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => toggleHabit('digital_sunset')}
              activeOpacity={0.8}
            >
              <View style={[styles.habitCheckbox, completedHabits.includes('digital_sunset') && [styles.habitCheckboxDone, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
                {completedHabits.includes('digital_sunset') && <Check size={14} color="#ffffff" />}
              </View>
              <View style={styles.habitTextWrap}>
                <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>Digital Sunset (60 min prior)</Text>
                <Text style={[styles.habitDetail, { color: theme.textSecondary }]}>Block blue-light photons to prompt natural melatonin synthesis.</Text>
              </View>
              <Clock size={16} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.habitCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => toggleHabit('thermal_cool')}
              activeOpacity={0.8}
            >
              <View style={[styles.habitCheckbox, completedHabits.includes('thermal_cool') && [styles.habitCheckboxDone, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
                {completedHabits.includes('thermal_cool') && <Check size={14} color="#ffffff" />}
              </View>
              <View style={styles.habitTextWrap}>
                <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>Cool Bedroom Temperature</Text>
                <Text style={[styles.habitDetail, { color: theme.textSecondary }]}>Maintain ambient room temperature between 18°C – 20°C for deep slow-wave sleep.</Text>
              </View>
              <ShieldCheck size={16} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.habitCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => toggleHabit('magnesium_intake')}
              activeOpacity={0.8}
            >
              <View style={[styles.habitCheckbox, completedHabits.includes('magnesium_intake') && [styles.habitCheckboxDone, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
                {completedHabits.includes('magnesium_intake') && <Check size={14} color="#ffffff" />}
              </View>
              <View style={styles.habitTextWrap}>
                <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>Magnesium & Chamomile Wind-Down</Text>
                <Text style={[styles.habitDetail, { color: theme.textSecondary }]}>Gentle nervous system relaxation without morning grogginess.</Text>
              </View>
              <Leaf size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        )}

        {/* PILLAR 2: MOVEMENT & MOBILITY */}
        {activePillar === 'movement' && (
          <View style={styles.pillarContent}>
            {/* Overview Card */}
            <View style={[styles.heroOverviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.greenBadge}>
                  <Activity size={13} color="#16a34a" />
                  <Text style={styles.greenBadgeText}>Metabolic Health</Text>
                </View>
                <Text style={styles.heroTargetText}>Daily: 8,500 Steps</Text>
              </View>
              <Text style={[styles.heroCardHeading, { color: theme.textPrimary }]}>Functional Daily Mobility</Text>
              <Text style={[styles.heroCardDescription, { color: theme.textSecondary }]}>
                Short, regular movement intervals reduce insulin spikes by 34% compared to prolonged sitting followed by intense evening workouts.
              </Text>
            </View>

            <Text style={[styles.subheading, { color: theme.textPrimary }]}>Targeted Mobility Protocols</Text>

            <View style={[styles.protocolCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.protocolIconWrap}>
                <Zap size={20} color="#16a34a" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Eskista Shoulder & Thoracic Reset</Text>
                <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                  Traditional rhythmic scapular release that relieves desk tension, improves posture, and stimulates lymphatic drainage.
                </Text>
                <View style={styles.protocolFooter}>
                  <Text style={styles.protocolMeta}>5 min • Gentle Mobility</Text>
                </View>
              </View>
            </View>

            <View style={[styles.protocolCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.protocolIconWrap}>
                <Compass size={20} color="#0284c7" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Post-Meal Glucose Walk</Text>
                <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                  A moderate 10-15 minute walk within 30 minutes of eating significantly flattens postprandial glucose curves.
                </Text>
                <View style={styles.protocolFooter}>
                  <Text style={styles.protocolMeta}>15 min • Low-Impact</Text>
                </View>
              </View>
            </View>

            <View style={[styles.protocolCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.protocolIconWrap}>
                <Heart size={20} color="#e11d48" />
              </View>
              <View style={styles.protocolTextWrap}>
                <Text style={[styles.protocolTitle, { color: theme.textPrimary }]}>Zone 2 Aerobic Foundation</Text>
                <Text style={[styles.protocolDesc, { color: theme.textSecondary }]}>
                  Steady conversational pace cycling or brisk walking to stimulate mitochondrial density and longevity enzymes.
                </Text>
                <View style={styles.protocolFooter}>
                  <Text style={styles.protocolMeta}>30 min • 3x Weekly</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* PILLAR 3: NOURISHMENT & FASTING */}
        {activePillar === 'nourishment' && (
          <View style={styles.pillarContent}>
            {/* Overview Card */}
            <View style={[styles.heroOverviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.heroBadgeRow}>
                <View style={styles.greenBadge}>
                  <Utensils size={13} color="#16a34a" />
                  <Text style={styles.greenBadgeText}>Nutrient Density</Text>
                </View>
                <Text style={styles.heroTargetText}>
                  {isFasting ? 'Fasting Active' : 'Standard Window'}
                </Text>
              </View>
              <Text style={[styles.heroCardHeading, { color: theme.textPrimary }]}>Integrative Nutrition</Text>
              <Text style={[styles.heroCardDescription, { color: theme.textSecondary }]}>
                Nourishing your microbiome with fermented prebiotic whole grains and polyphenol-dense botanicals supports sustained metabolic energy.
              </Text>
            </View>

            <Text style={[styles.subheading, { color: theme.textPrimary }]}>Superfood Focus</Text>

            <View style={[styles.nutritionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionBullet}>
                  <Leaf size={16} color="#16a34a" />
                </View>
                <View style={styles.nutritionInfo}>
                  <Text style={[styles.nutritionTitle, { color: theme.textPrimary }]}>100% Teff Injera (Prebiotic Grain)</Text>
                  <Text style={[styles.nutritionDetail, { color: theme.textSecondary }]}>
                    Fermented for 3 days; rich in iron, resistant starch, and low glycemic carbohydrates that feed beneficial Bifidobacteria.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.nutritionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionBullet}>
                  <Droplets size={16} color="#0284c7" />
                </View>
                <View style={styles.nutritionInfo}>
                  <Text style={[styles.nutritionTitle, { color: theme.textPrimary }]}>Telba (Flaxseed) Omega Infusion</Text>
                  <Text style={[styles.nutritionDetail, { color: theme.textSecondary }]}>
                    Toasted ground flaxseed steeped in lukewarm water. Rich in Alpha-Linolenic Acid (ALA) for vascular elasticity and gentle digestion.
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.nutritionCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.nutritionRow}>
                <View style={styles.nutritionBullet}>
                  <Sparkles size={16} color="#f59e0b" />
                </View>
                <View style={styles.nutritionInfo}>
                  <Text style={[styles.nutritionTitle, { color: theme.textPrimary }]}>Moringa (Shiferaw) Vitality Greens</Text>
                  <Text style={[styles.nutritionDetail, { color: theme.textSecondary }]}>
                    Micro-nutrient powerhouse packed with vitamin C, plant calcium, and bioactive quercetin to combat oxidative stress.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* PILLAR 4: MINDFULNESS & BREATHWORK */}
        {activePillar === 'mindfulness' && (
          <View style={styles.pillarContent}>
            {/* Interactive 4-7-8 Breathwork Module */}
            <View style={[styles.breathworkContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.breathBadge}>
                <Wind size={14} color="#16a34a" />
                <Text style={styles.breathBadgeText}>Parasympathetic Reset</Text>
              </View>
              <Text style={[styles.breathHeading, { color: theme.textPrimary }]}>4-7-8 Autonomic Breathwork</Text>
              <Text style={[styles.breathDescription, { color: theme.textSecondary }]}>
                Scientific pranayama technique proven to down-regulate sympathetic fight-or-flight within 2 minutes.
              </Text>

              {/* Pulsing Visual Circle */}
              <View style={styles.breathVisualRingWrap}>
                <View style={[styles.breathRingGlow, breathingActive && [styles.breathRingGlowActive, { backgroundColor: theme.accentGlow }]]} />
                <View style={[styles.breathCenterCircle, breathingActive && [styles.breathCenterCircleActive, { backgroundColor: theme.surfaceElevated, borderColor: theme.accent }]]}>
                  <Text style={[styles.breathPhaseText, { color: theme.accent }]}>{breathPhase}</Text>
                  {breathingActive && (
                    <Text style={[styles.breathCountdownText, { color: theme.textPrimary }]}>{breathSecondsLeft}s</Text>
                  )}
                </View>
              </View>

              {/* Controls */}
              <TouchableOpacity
                style={[styles.breathActionBtn, { backgroundColor: theme.accent }, breathingActive && [styles.breathActionBtnStop, { backgroundColor: theme.error }]]}
                onPress={() => setBreathingActive(!breathingActive)}
                activeOpacity={0.85}
              >
                {breathingActive ? (
                  <>
                    <RotateCcw size={18} color="#ffffff" />
                    <Text style={styles.breathActionBtnText}>End Session</Text>
                  </>
                ) : (
                  <>
                    <PlayCircle size={18} color="#ffffff" />
                    <Text style={styles.breathActionBtnText}>Begin 2-Min Reset</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Mental Clarity Habits */}
            <Text style={[styles.subheading, { color: theme.textPrimary }]}>Daily Mental Hygiene</Text>

            <TouchableOpacity
              style={[styles.habitCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => toggleHabit('morning_sunlight')}
              activeOpacity={0.8}
            >
              <View style={[styles.habitCheckbox, completedHabits.includes('morning_sunlight') && [styles.habitCheckboxDone, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
                {completedHabits.includes('morning_sunlight') && <Check size={14} color="#ffffff" />}
              </View>
              <View style={styles.habitTextWrap}>
                <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>Morning Sunlight (10-15 min)</Text>
                <Text style={[styles.habitDetail, { color: theme.textSecondary }]}>Anchor your suprachiasmatic nucleus within an hour of waking for elevated daytime focus.</Text>
              </View>
              <Sun size={16} color="#f59e0b" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.habitCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => toggleHabit('micro_pauses')}
              activeOpacity={0.8}
            >
              <View style={[styles.habitCheckbox, completedHabits.includes('micro_pauses') && [styles.habitCheckboxDone, { backgroundColor: theme.accent, borderColor: theme.accent }]]}>
                {completedHabits.includes('micro_pauses') && <Check size={14} color="#ffffff" />}
              </View>
              <View style={styles.habitTextWrap}>
                <Text style={[styles.habitTitle, { color: theme.textPrimary }]}>Hourly Micro-Pauses</Text>
                <Text style={[styles.habitDetail, { color: theme.textSecondary }]}>Look 20 feet away for 20 seconds to release ocular ciliary muscle strain.</Text>
              </View>
              <Compass size={16} color="#0284c7" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Universal Floating Chat FAB: Permanent on 4 tabs above bottom bar */}
      <TouchableOpacity
        style={styles.floatingChatFab}
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
    backgroundColor: '#f8fafc',
    position: 'relative',
  },
  topHeader: {
    paddingTop: Platform.OS === 'ios' ? 52 : 40,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  topHeaderContent: {
    alignItems: 'flex-start',
  },
  topHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  topHeaderSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90, // Leave room for bottom navigation tabs
  },

  // Pillar Selector Pills
  pillarPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pillarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: '#bbf7d0',
  },
  pillarPillActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  pillarPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803d',
  },
  pillarPillTextActive: {
    color: '#ffffff',
  },

  pillarContent: {
    gap: 12,
  },

  // Hero Overview Card
  heroOverviewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.2,
    borderColor: '#bbf7d0',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  greenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  greenBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  heroTargetText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
  },
  heroCardHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  heroCardDescription: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  subheading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 2,
    letterSpacing: -0.1,
  },

  // Habit Checklist Cards
  habitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  habitCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.8,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  habitCheckboxDone: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  habitTextWrap: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  habitDetail: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },

  // Protocol Cards (Movement)
  protocolCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  protocolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  protocolTextWrap: {
    flex: 1,
  },
  protocolTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  protocolDesc: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    lineHeight: 17,
  },
  protocolFooter: {
    marginTop: 8,
  },
  protocolMeta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },

  // Nutrition Cards
  nutritionCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nutritionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  nutritionBullet: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  nutritionInfo: {
    flex: 1,
  },
  nutritionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  nutritionDetail: {
    fontSize: 12,
    color: '#475569',
    marginTop: 3,
    lineHeight: 17,
  },

  // Interactive Breathwork Module
  breathworkContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: '#bbf7d0',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  breathBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 8,
  },
  breathBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  breathHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  breathDescription: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  breathVisualRingWrap: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  breathRingGlow: {
    position: 'absolute',
    width: 146,
    height: 146,
    borderRadius: 73,
    backgroundColor: 'rgba(34, 197, 94, 0.10)',
  },
  breathRingGlowActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.22)',
  },
  breathCenterCircle: {
    width: 114,
    height: 114,
    borderRadius: 57,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  breathCenterCircleActive: {
    borderColor: '#16a34a',
  },
  breathPhaseText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803d',
    textAlign: 'center',
  },
  breathCountdownText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  breathActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 18,
  },
  breathActionBtnStop: {
    backgroundColor: '#475569',
  },
  breathActionBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Permanent Floating Chat Button (Universal FAB on 4 tabs)
  floatingChatFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16a34a',
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
