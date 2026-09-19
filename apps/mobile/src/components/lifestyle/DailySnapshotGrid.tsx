import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Activity, Droplets, Wind, Plus, Utensils, Check } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LifestyleSnapshot } from '../../storage/lifestyleStorage';

interface DailySnapshotGridProps {
  snapshot: LifestyleSnapshot;
  onLogWater: () => void;
  onLogSteps: () => void;
  onOpenBreathwork: () => void;
  onOpenCategory: (category: 'recovery' | 'movement' | 'nourishment' | 'mindfulness') => void;
}

export default function DailySnapshotGrid({
  snapshot,
  onLogWater,
  onLogSteps,
  onOpenBreathwork,
  onOpenCategory,
}: DailySnapshotGridProps) {
  const { theme, isDark } = useTheme();

  const sleepPct = Math.min(100, Math.round((snapshot.sleepHours / snapshot.sleepTarget) * 100));
  const stepsPct = Math.min(100, Math.round((snapshot.steps / snapshot.stepsTarget) * 100));
  const waterPct = Math.min(100, Math.round((snapshot.waterMl / snapshot.waterTargetMl) * 100));
  const mindfulPct = Math.min(100, Math.round((snapshot.mindfulnessMins / snapshot.mindfulnessTargetMins) * 100));

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Snapshot</Text>

      <View style={styles.grid}>
        {/* SLEEP CARD */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onOpenCategory('recovery')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.12)' }]}>
              <Moon size={16} color="#6366f1" />
            </View>
            <Text style={[styles.statusBadge, { color: '#6366f1' }]}>{snapshot.sleepQuality}</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{snapshot.sleepHours}h</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Target: {snapshot.sleepTarget}h</Text>
          <View style={[styles.miniTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
            <View style={[styles.miniBar, { width: `${sleepPct}%`, backgroundColor: '#6366f1' }]} />
          </View>
        </TouchableOpacity>

        {/* MOVEMENT CARD */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onOpenCategory('movement')}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Activity size={16} color="#10b981" />
            </View>
            <TouchableOpacity
              style={[styles.quickPlusBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onLogSteps}
            >
              <Plus size={12} color={theme.accent} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{snapshot.steps.toLocaleString()}</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{stepsPct}% of 9k goal</Text>
          <View style={[styles.miniTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
            <View style={[styles.miniBar, { width: `${stepsPct}%`, backgroundColor: '#10b981' }]} />
          </View>
        </TouchableOpacity>

        {/* HYDRATION CARD */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onLogWater}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(14, 165, 233, 0.12)' }]}>
              <Droplets size={16} color="#0ea5e9" />
            </View>
            <View style={[styles.quickActionTag, { backgroundColor: theme.accentDeep }]}>
              <Text style={[styles.quickActionTagText, { color: theme.accent }]}>+250ml</Text>
            </View>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{(snapshot.waterMl / 1000).toFixed(1)} L</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>{waterPct}% of 2.5L</Text>
          <View style={[styles.miniTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
            <View style={[styles.miniBar, { width: `${waterPct}%`, backgroundColor: '#0ea5e9' }]} />
          </View>
        </TouchableOpacity>

        {/* MINDFULNESS / RESET CARD */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={onOpenBreathwork}
          activeOpacity={0.8}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Wind size={16} color="#f59e0b" />
            </View>
            <Text style={[styles.statusBadge, { color: '#f59e0b' }]}>4-7-8 Active</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.textPrimary }]}>{snapshot.mindfulnessMins}m</Text>
          <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Mindful Reset</Text>
          <View style={[styles.miniTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
            <View style={[styles.miniBar, { width: `${mindfulPct}%`, backgroundColor: '#f59e0b' }]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    flex: 1,
    minWidth: '47%',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  quickPlusBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  quickActionTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniBar: {
    height: '100%',
    borderRadius: 2,
  },
});
