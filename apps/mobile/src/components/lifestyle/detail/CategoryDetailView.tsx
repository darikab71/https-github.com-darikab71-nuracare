import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Utensils,
  Activity,
  Moon,
  Smartphone,
  Wind,
  Droplets,
  CheckCircle2,
  Users,
  Check,
  Plus,
  PlayCircle,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import {
  LifestyleCategoryKey,
  LifestyleSnapshot,
  LifestyleGoal,
  DayTrendPoint,
} from '../../../storage/lifestyleStorage';

interface CategoryDetailViewProps {
  categoryKey: LifestyleCategoryKey;
  snapshot: LifestyleSnapshot;
  goals: LifestyleGoal[];
  trendPoints: DayTrendPoint[];
  onBack: () => void;
  onLogMeal: () => void;
  onLogWorkout: () => void;
  onLogWater: () => void;
  onLogDigitalBreak: () => void;
  onLogMood: (mood: any) => void;
  onLogSocial: () => void;
  onToggleGoal: (id: string) => void;
  onOpenBreathwork: () => void;
}

export default function CategoryDetailView({
  categoryKey,
  snapshot,
  goals,
  trendPoints,
  onBack,
  onLogMeal,
  onLogWorkout,
  onLogWater,
  onLogDigitalBreak,
  onLogMood,
  onLogSocial,
  onToggleGoal,
  onOpenBreathwork,
}: CategoryDetailViewProps) {
  const { theme, isDark } = useTheme();

  const getCategoryConfig = () => {
    switch (categoryKey) {
      case 'nutrition':
        return {
          name: 'Nutrition',
          subtitle: 'Understand your eating patterns & metabolic fuel',
          icon: Utensils,
          color: '#16a34a',
          actionLabel: 'Log Meal (Sprouted Teff)',
          actionHandler: () => {
            onLogMeal();
            Alert.alert('Meal Logged', 'Logged: Sprouted Teff & Roasted Chickpeas (35g protein)');
          },
          primaryTitle: "Today's Meals",
          primaryVal: `${snapshot.mealsLogged} / ${snapshot.mealsTarget} Meals`,
          primarySub: `${snapshot.proteinGrams}g Protein • 82% Consistency`,
          insight: 'Fermented teff injera provides slow-digesting complex carbs and prebiotic fiber that nourishes Bifidobacteria without postprandial glycemic spikes.',
          protocols: [
            { title: 'Prebiotic Teff Whole Grain', desc: 'Naturally fermented 3 days; low glycemic resistant starch that feeds beneficial gut microbiome.' },
            { title: 'Telba (Flaxseed) Omega Infusion', desc: 'Toasted ground flaxseed steeped in warm water delivers concentrated Alpha-Linolenic Acid (ALA).' },
            { title: 'Gym Protein Timing Window', desc: 'Consume 25-35g bioavailable protein within 45 minutes of training for rapid muscle recovery.' },
          ],
        };
      case 'fitness':
        return {
          name: 'Fitness & Gym',
          subtitle: 'Track movement, training & active vigor',
          icon: Activity,
          color: '#ea580c',
          actionLabel: 'Log Workout Session (+40m)',
          actionHandler: () => {
            onLogWorkout();
            Alert.alert('Workout Logged', 'Logged: Upper Body & Mobility Reset (+40 min)');
          },
          primaryTitle: "Today's Movement",
          primaryVal: `${snapshot.steps.toLocaleString()} Steps`,
          primarySub: `${snapshot.activeMinutes} Active Min • ${snapshot.workoutsThisWeek}/${snapshot.workoutsWeeklyTarget} Sessions`,
          insight: 'Taking a 10-15 minute walk within 30 minutes of eating stimulates muscular GLUT4 transporters, blunting blood glucose spikes by up to 34%.',
          protocols: [
            { title: 'Eskista Scapular Reset', desc: 'Rhythmic shoulder pulses relieve cervical strain and stimulate upper lymphatic drainage.' },
            { title: 'Post-Meal Glucose Walk', desc: 'Light conversational walking after meals helps metabolic clearance without stress.' },
            { title: 'Zone 2 Aerobic Base', desc: 'Steady conversational movement stimulates mitochondrial enzyme density and daily vitality.' },
          ],
        };
      case 'sleep':
        return {
          name: 'Sleep & Recovery',
          subtitle: 'Build better recovery habits & circadian rhythm',
          icon: Moon,
          color: '#6366f1',
          actionLabel: 'Log Restorative Sleep Entry',
          actionHandler: () => Alert.alert('Sleep Logged', 'Logged: 7h 40m restorative sleep'),
          primaryTitle: "Last Night's Sleep",
          primaryVal: `${snapshot.sleepHours} Hours`,
          primarySub: `Quality: ${snapshot.sleepQuality} • Bedtime: ${snapshot.bedtimeAnchor}`,
          insight: 'Viewing morning sunlight within 60 minutes of waking anchors the central circadian clock and schedules natural evening melatonin secretion.',
          protocols: [
            { title: 'Digital Sunset (60 min prior)', desc: 'Dim harsh ambient lighting and blue screens to prompt pineal melatonin synthesis.' },
            { title: 'Thermal Bedroom Regulation', desc: 'Maintain bedroom between 18°C – 20°C for uninterrupted deep slow-wave stage 3/4 sleep.' },
            { title: 'Chamomile & Magnesium', desc: 'Warm herbal infusion relaxes autonomic neuromuscular tension without morning grogginess.' },
          ],
        };
      case 'digital':
        return {
          name: 'Digital Wellbeing',
          subtitle: 'Create healthier screen boundaries & intentional focus',
          icon: Smartphone,
          color: '#0284c7',
          actionLabel: 'Take Digital Break (+1 Logged)',
          actionHandler: () => {
            onLogDigitalBreak();
            Alert.alert('Digital Break Logged', 'Great job stepping away from screens for a mindful reset.');
          },
          primaryTitle: "Today's Screen Time",
          primaryVal: `${Math.floor(snapshot.screenMinutes / 60)}h ${snapshot.screenMinutes % 60}m`,
          primarySub: `${snapshot.digitalBreaksCount} Breaks Taken • ${Math.floor(snapshot.focusMinutes / 60)}h ${snapshot.focusMinutes % 60}m Focus`,
          insight: 'Applying the 20-20-20 ocular rule (looking 20 feet away for 20 seconds every 20 minutes) releases ocular ciliary muscle tension and prevents cognitive fatigue.',
          protocols: [
            { title: '20-20-20 Ocular Micro-Pauses', desc: 'Rest eyes from computer screens regularly to protect ciliary optic relaxation.' },
            { title: 'Evening Blue Screen Curfew', desc: 'Switch devices to grayscale or dark night mode 90 minutes before sleep.' },
            { title: 'App Boundaries & Notification Batching', desc: 'Silence non-urgent notification buzzes to retain deep cognitive flow state.' },
          ],
        };
      case 'mental':
        return {
          name: 'Mental Wellbeing',
          subtitle: 'Reflect, reset, and build autonomic emotional habits',
          icon: Wind,
          color: '#f59e0b',
          actionLabel: 'Begin 4-7-8 Breathwork Reset',
          actionHandler: onOpenBreathwork,
          primaryTitle: 'Current Emotional Tone',
          primaryVal: `${snapshot.currentMood} Mood`,
          primarySub: `Stress Level: ${snapshot.stressLevel} • ${snapshot.mindfulnessMins}m Reset`,
          insight: 'The 4-7-8 breathing pattern extends exhalation to stimulate the vagus nerve, down-regulating heart rate variability within 120 seconds.',
          protocols: [
            { title: '4-7-8 Autonomic Pranayama', desc: 'Inhale 4s, hold 7s, slow exhale 8s to shift autonomic tone to parasympathetic repair.' },
            { title: 'Morning Gratitude Grounding', desc: 'Anchor 3 specific observations from yesterday to train positive neuro-attunement.' },
            { title: 'Walking Reflection Pause', desc: 'Disconnect from earphones for a 10-minute quiet sensory observation walk.' },
          ],
        };
      case 'hydration':
        return {
          name: 'Hydration',
          subtitle: 'Stay consistent with clean cellular hydration',
          icon: Droplets,
          color: '#0ea5e9',
          actionLabel: '+ Add 250ml Water',
          actionHandler: onLogWater,
          primaryTitle: "Today's Hydration",
          primaryVal: `${(snapshot.waterMl / 1000).toFixed(1)} Liters`,
          primarySub: `${Math.round((snapshot.waterMl / snapshot.waterTargetMl) * 100)}% of 2.5L Target`,
          insight: 'Drinking 500ml of mineral-rich water upon waking reactivates overnight dehydrated circulatory volume and sparks morning metabolic vigor.',
          protocols: [
            { title: 'Morning 500ml Starter', desc: 'Drink a glass of water before morning coffee or tea to replenish cellular fluids.' },
            { title: 'Electrolyte Mineral Balance', desc: 'Add a pinch of natural salt or lemon to optimize cellular sodium-potassium pumps.' },
            { title: 'Workout Hydration Buffer', desc: 'Sip 200ml every 20 minutes during intense gym training sessions.' },
          ],
        };
      case 'habits':
        return {
          name: 'Habits & Routines',
          subtitle: 'Build routines and daily consistency that last',
          icon: CheckCircle2,
          color: '#10b981',
          actionLabel: 'Complete Next Routine Step',
          actionHandler: () => Alert.alert('Habit Completed', 'Logged habit completion for today! Keep the streak alive.'),
          primaryTitle: 'Daily Habit Score',
          primaryVal: `${snapshot.completedHabitsCount} / ${snapshot.totalHabitsCount} Done`,
          primarySub: `${snapshot.habitStreakDays}-Day Active Streak`,
          insight: 'Habit stacking (coupling a new routine to an existing anchor, like drinking water while coffee brews) elevates 30-day adherence by over 40%.',
          protocols: [
            { title: 'Circadian Awakening Timeline', desc: 'Consistent wake window, solar light, and gentle joint flossing.' },
            { title: 'Restorative Wind-Down Timeline', desc: 'Digital sunset, warm herbal tea, and 4-7-8 breathing before sleep.' },
            { title: 'Habit Stacking Principle', desc: 'Anchor small micro-habits onto established daily rituals for effortless automaticity.' },
          ],
        };
      case 'social':
        return {
          name: 'Social Wellbeing',
          subtitle: 'Make time for meaningful connection & belonging',
          icon: Users,
          color: '#ec4899',
          actionLabel: 'Log Meaningful Connection',
          actionHandler: () => {
            onLogSocial();
            Alert.alert('Connection Logged', 'Logged meaningful connection with family or community friend.');
          },
          primaryTitle: 'Weekly Connection Goals',
          primaryVal: `${snapshot.connectionsThisWeek} / ${snapshot.connectionWeeklyTarget} Met`,
          primarySub: `Status: ${snapshot.lastSocialCheckIn}`,
          insight: 'Sharing a mindful meal or phone call with a trusted friend triggers oxytocin release, buffering sympathetic stress reactivity.',
          protocols: [
            { title: 'Weekly Intentional Reach-Out', desc: 'Schedule 15 minutes to call a family member or close friend each week.' },
            { title: 'Shared Wellness Activity', desc: 'Take an outdoor walk or complete a fitness session together with a peer.' },
            { title: 'Active Listening Practice', desc: 'Give undivided attention without checking phones during conversations.' },
          ],
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;
  const categoryGoals = goals.filter((g) => g.category === categoryKey);

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      {/* Detail Header */}
      <View style={[styles.headerBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
          <ArrowLeft size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Lifestyle Home</Text>
        </TouchableOpacity>

        <View style={[styles.headerIconWrap, { backgroundColor: `${config.color}16` }]}>
          <Icon size={18} color={config.color} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{config.name}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{config.subtitle}</Text>
        </View>

        {/* 1. Today's Primary Metric Card */}
        <View style={[styles.primaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.primaryLabel, { color: theme.textSecondary }]}>{config.primaryTitle}</Text>
          <Text style={[styles.primaryVal, { color: theme.textPrimary }]}>{config.primaryVal}</Text>
          <Text style={[styles.primarySub, { color: config.color }]}>{config.primarySub}</Text>
        </View>

        {/* 2. Dominant Quick Action Button */}
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: config.color }]}
          onPress={config.actionHandler}
          activeOpacity={0.85}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.quickActionText}>{config.actionLabel}</Text>
        </TouchableOpacity>

        {/* 3. 7-Day Trend Visualization */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>7-Day Consistency</Text>
          <View style={styles.barsRow}>
            {trendPoints.map((p, idx) => {
              const heightPct = 40 + ((idx * 11) % 55);
              const isToday = idx === trendPoints.length - 1;
              return (
                <View key={p.dateStr} style={styles.barCol}>
                  <View style={[styles.barTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPct}%`, backgroundColor: isToday ? config.color : (isDark ? '#23302c' : '#cbd5e1') },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barDay, { color: isToday ? config.color : theme.textSecondary }]}>
                    {p.dayLabel}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 4. Grounded Contextual Insight */}
        <View style={[styles.insightCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Sparkles size={16} color={config.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Evidence-Based Observation</Text>
            <Text style={[styles.insightBody, { color: theme.textSecondary }]}>{config.insight}</Text>
          </View>
        </View>

        {/* 5. Category-Specific Goals */}
        <View style={styles.goalsSection}>
          <Text style={[styles.cardHeading, { color: theme.textPrimary, marginBottom: 8 }]}>Active Goals</Text>
          {categoryGoals.length > 0 ? (
            categoryGoals.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => onToggleGoal(g.id)}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.goalCheckbox,
                    { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceElevated },
                    g.completed && { backgroundColor: config.color, borderColor: config.color },
                  ]}
                >
                  {g.completed && <Check size={11} color="#ffffff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.goalTitle,
                      { color: theme.textPrimary },
                      g.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                    ]}
                  >
                    {g.title}
                  </Text>
                  {g.target && <Text style={[styles.goalTarget, { color: theme.textSecondary }]}>{g.target}</Text>}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No active goals in {config.name}. Tap below to set one.
              </Text>
            </View>
          )}
        </View>

        {/* 6. Protocols & Guidelines */}
        <View style={styles.protocolsSection}>
          <Text style={[styles.cardHeading, { color: theme.textPrimary, marginBottom: 8 }]}>Recommended Protocols</Text>
          {config.protocols.map((proto, idx) => (
            <View
              key={idx}
              style={[styles.protoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.protoHeader}>
                <ShieldCheck size={15} color={config.color} />
                <Text style={[styles.protoTitle, { color: theme.textPrimary }]}>{proto.title}</Text>
              </View>
              <Text style={[styles.protoDesc, { color: theme.textSecondary }]}>{proto.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 95,
    gap: 14,
  },
  titleSection: {
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  primaryCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  primaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  primaryVal: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  primarySub: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 3,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 14,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  cardHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    marginBottom: 12,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 12,
    height: 70,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barDay: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  insightCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  insightTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  insightBody: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  goalsSection: {
    gap: 6,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  goalCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalTarget: {
    fontSize: 11,
    marginTop: 1,
  },
  emptyBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  protocolsSection: {
    gap: 8,
  },
  protoCard: {
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  protoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  protoTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  protoDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
