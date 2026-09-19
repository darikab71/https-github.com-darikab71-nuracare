import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LifestyleSnapshot } from '../../storage/lifestyleStorage';

interface WeeklySummaryRadarProps {
  snapshot: LifestyleSnapshot;
}

export default function WeeklySummaryRadar({ snapshot }: WeeklySummaryRadarProps) {
  const { theme, isDark } = useTheme();

  const areas = [
    { name: 'Habits & Routines', pct: 91, color: '#10b981' },
    { name: 'Sleep & Recovery', pct: 88, color: '#6366f1' },
    { name: 'Nutrition', pct: 82, color: '#16a34a' },
    { name: 'Mental Wellbeing', pct: 80, color: '#f59e0b' },
    { name: 'Fitness & Gym', pct: 76, color: '#ea580c' },
    { name: 'Hydration', pct: 72, color: '#0ea5e9' },
    { name: 'Social Wellbeing', pct: 68, color: '#ec4899' },
    { name: 'Digital Balance', pct: 64, color: '#0284c7' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Progress</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Consistency across your 8 lifestyle areas
          </Text>
        </View>

        <View style={[styles.scoreBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.scoreText, { color: theme.accent }]}>{snapshot.balanceScore}% Overall</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.barsList}>
          {areas.map((a) => (
            <View key={a.name} style={styles.barRow}>
              <View style={styles.labelRow}>
                <Text style={[styles.areaName, { color: theme.textPrimary }]}>{a.name}</Text>
                <Text style={[styles.areaPct, { color: a.color }]}>{a.pct}%</Text>
              </View>

              <View style={[styles.track, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
                <View style={[styles.fill, { width: `${a.pct}%`, backgroundColor: a.color }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.footerNote, { borderTopColor: theme.borderSubtle }]}>
          <Sparkles size={13} color={theme.accent} />
          <Text style={[styles.footerNoteText, { color: theme.textSecondary }]}>
            Calm, sustainable progress — not a competition.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  },
  scoreBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  barsList: {
    gap: 10,
  },
  barRow: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  areaName: {
    fontSize: 12,
    fontWeight: '600',
  },
  areaPct: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  track: {
    height: 5,
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2.5,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerNoteText: {
    fontSize: 11.5,
    fontStyle: 'italic',
  },
});
