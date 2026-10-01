import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Sun,
  Moon,
  Check,
  RotateCcw,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Droplets,
  Wind,
  Flame,
  CheckCircle2,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { RoutineData } from '../../storage/lifestyleStorage';

interface RoutinesTimelineSectionProps {
  routines: { morning: RoutineData; evening: RoutineData };
  onToggleStep: (type: 'morning' | 'evening', stepId: string) => void;
  onResetRoutine: (type: 'morning' | 'evening') => void;
}

export default function RoutinesTimelineSection({
  routines,
  onToggleStep,
  onResetRoutine,
}: RoutinesTimelineSectionProps) {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  const currentRoutine = routines[activeTab];
  const completedCount = currentRoutine.steps.filter((s) => s.completed).length;
  const totalCount = currentRoutine.steps.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const toggleExpand = (id: string) => {
    setExpandedStepId((prev) => (prev === id ? null : id));
  };

  // Scientific rationales for each step to provide deep value without clutter
  const getStepScience = (stepId: string): string => {
    switch (stepId) {
      case 'm-1':
        return 'Waking within the same 30m window locks the suprachiasmatic nucleus circadian clock.';
      case 'm-2':
        return 'Replaces 400-600ml of nocturnal respiration water loss and primes cellular osmotic pressure.';
      case 'm-3':
        return 'Direct morning lux triggers retinal melanopsin cells to trigger cortisol rise & time nighttime melatonin.';
      case 'm-4':
        return 'Mobilizes synovial fluid in spinal facet joints and downregulates early-morning stiffness.';
      case 'e-1':
        return 'Prevents late-night insulin spikes that blunt growth hormone and disrupt stage-3 deep sleep.';
      case 'e-2':
        return 'Blue photons suppress melatonin secretion by up to 85%. Shifting to amber light protects sleep architecture.';
      case 'e-3':
        return '4-7-8 breathing activates the vagus nerve, reducing heart rate and increasing heart rate variability.';
      case 'e-4':
        return 'Peripheral vasodilation drops core body temperature by 0.5-1°C, the biological trigger for sleep initiation.';
      default:
        return 'Promotes cellular repair and circadian alignment.';
    }
  };

  const getStepIcon = (idx: number, type: 'morning' | 'evening') => {
    if (type === 'morning') {
      if (idx === 0) return <Sun size={13} color="#f59e0b" />;
      if (idx === 1) return <Droplets size={13} color="#0ea5e9" />;
      if (idx === 2) return <Sparkles size={13} color="#eab308" />;
      return <Flame size={13} color="#16a34a" />;
    } else {
      if (idx === 0) return <Clock size={13} color="#8b5cf6" />;
      if (idx === 1) return <Moon size={13} color="#6366f1" />;
      if (idx === 2) return <Wind size={13} color="#0ea5e9" />;
      return <Sparkles size={13} color="#ec4899" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header with Circadian Context & Progress Badge */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Routines</Text>
            <View
              style={[
                styles.completionPill,
                {
                  backgroundColor: progressPct === 100 ? '#dcfce7' : isDark ? theme.surfaceElevated : '#f1f5f9',
                  borderColor: progressPct === 100 ? '#86efac' : theme.borderSubtle,
                },
              ]}
            >
              <Text
                style={[
                  styles.completionPillText,
                  { color: progressPct === 100 ? '#15803d' : theme.accent },
                ]}
              >
                {completedCount}/{totalCount} Steps ({progressPct}%)
              </Text>
            </View>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Circadian synchronization & nervous system regulation
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
          onPress={() => onResetRoutine(activeTab)}
          activeOpacity={0.7}
        >
          <RotateCcw size={11} color={theme.textTertiary} />
          <Text style={[styles.resetBtnText, { color: theme.textSecondary }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Circadian Routine Segmented Tabs */}
      <View style={[styles.tabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'morning' && [
              styles.tabBtnActive,
              { backgroundColor: isDark ? theme.surfaceElevated : '#ffffff' },
            ],
          ]}
          onPress={() => setActiveTab('morning')}
          activeOpacity={0.8}
        >
          <View style={[styles.tabIconWrap, activeTab === 'morning' && { backgroundColor: '#fef3c7' }]}>
            <Sun size={14} color="#f59e0b" />
          </View>
          <View style={{ alignItems: 'flex-start' }}>
            <Text
              style={[
                styles.tabTitle,
                { color: theme.textSecondary },
                activeTab === 'morning' && { color: theme.textPrimary, fontWeight: '700' },
              ]}
            >
              Morning Awakening
            </Text>
            <Text style={[styles.tabWindow, { color: theme.textTertiary }]}>06:30 – 08:30 AM</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'evening' && [
              styles.tabBtnActive,
              { backgroundColor: isDark ? theme.surfaceElevated : '#ffffff' },
            ],
          ]}
          onPress={() => setActiveTab('evening')}
          activeOpacity={0.8}
        >
          <View style={[styles.tabIconWrap, activeTab === 'evening' && { backgroundColor: '#e0e7ff' }]}>
            <Moon size={14} color="#6366f1" />
          </View>
          <View style={{ alignItems: 'flex-start' }}>
            <Text
              style={[
                styles.tabTitle,
                { color: theme.textSecondary },
                activeTab === 'evening' && { color: theme.textPrimary, fontWeight: '700' },
              ]}
            >
              Evening Wind-Down
            </Text>
            <Text style={[styles.tabWindow, { color: theme.textTertiary }]}>20:30 – 23:00 PM</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Slim Timeline Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressPct}%`,
              backgroundColor: activeTab === 'morning' ? '#f59e0b' : '#6366f1',
            },
          ]}
        />
      </View>

      {/* 4. Advanced, Clean Timeline Cards */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.timelineList}>
          {currentRoutine.steps.map((step, idx) => {
            const isLast = idx === currentRoutine.steps.length - 1;
            const isExpanded = expandedStepId === step.id;
            const scienceRationale = getStepScience(step.id);

            return (
              <View key={step.id} style={styles.stepRow}>
                {/* Time & Vertical Circadian Guide Node */}
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, { color: theme.textSecondary }]}>{step.time}</Text>
                  <TouchableOpacity
                    style={[
                      styles.stepCircle,
                      {
                        borderColor: step.completed ? theme.accent : theme.borderSubtle,
                        backgroundColor: step.completed ? theme.accent : theme.surfaceElevated,
                      },
                    ]}
                    onPress={() => onToggleStep(activeTab, step.id)}
                    activeOpacity={0.8}
                  >
                    {step.completed ? (
                      <Check size={11} color="#ffffff" strokeWidth={3} />
                    ) : (
                      getStepIcon(idx, activeTab)
                    )}
                  </TouchableOpacity>
                  {!isLast && (
                    <View
                      style={[
                        styles.connectingLine,
                        {
                          backgroundColor: step.completed ? theme.accentGlow || '#86efac' : theme.borderSubtle,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Step Body Card */}
                <TouchableOpacity
                  style={[
                    styles.stepBody,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: step.completed ? theme.borderSubtle : theme.border,
                    },
                    step.completed && { opacity: 0.8 },
                  ]}
                  onPress={() => onToggleStep(activeTab, step.id)}
                  activeOpacity={0.85}
                >
                  <View style={styles.stepTopRow}>
                    <Text
                      style={[
                        styles.stepTitle,
                        { color: theme.textPrimary },
                        step.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                      ]}
                      numberOfLines={1}
                    >
                      {step.title}
                    </Text>

                    <TouchableOpacity
                      style={styles.scienceToggleBtn}
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleExpand(step.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.scienceToggleText, { color: theme.accent }]}>Science</Text>
                      {isExpanded ? (
                        <ChevronUp size={12} color={theme.accent} />
                      ) : (
                        <ChevronDown size={12} color={theme.accent} />
                      )}
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.stepDetail, { color: theme.textSecondary }]} numberOfLines={2}>
                    {step.detail}
                  </Text>

                  {/* Expandable Scientific Rationale (Keeps UI Uncrowded) */}
                  {isExpanded && (
                    <View
                      style={[
                        styles.scienceCard,
                        {
                          backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : '#f0fdf4',
                          borderColor: isDark ? theme.borderSubtle : '#bbf7d0',
                        },
                      ]}
                    >
                      <Sparkles size={12} color={theme.accent} style={{ marginTop: 2 }} />
                      <Text style={[styles.scienceCardText, { color: theme.textSecondary }]}>
                        {scienceRationale}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  completionPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  completionPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 2,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 10,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabWindow: {
    fontSize: 10.5,
    marginTop: 1,
  },
  progressBarTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  timelineList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeColumn: {
    alignItems: 'center',
    width: 48,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connectingLine: {
    width: 2,
    height: 44,
    marginTop: 2,
    borderRadius: 1,
  },
  stepBody: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  stepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  scienceToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  scienceToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  stepDetail: {
    fontSize: 11.5,
    lineHeight: 16.5,
  },
  scienceCard: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 0.8,
    marginTop: 8,
  },
  scienceCardText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
    fontStyle: 'italic',
  },
});
