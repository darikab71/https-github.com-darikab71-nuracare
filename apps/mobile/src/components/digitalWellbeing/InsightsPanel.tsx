import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart2, Flame, Moon, ArrowDown, ArrowUp, Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export function InsightsPanel() {
  const { theme } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Summary</Text>
      <View style={[styles.statsGrid]}>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Screen Time</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>4h 12m</Text>
            <View style={[styles.badge, { backgroundColor: theme.successBackground }]}>
              <ArrowDown size={12} color={theme.success} />
              <Text style={[styles.badgeText, { color: theme.success }]}>8%</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Social Media</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>1h 30m</Text>
            <View style={[styles.badge, { backgroundColor: theme.successBackground }]}>
              <ArrowDown size={12} color={theme.success} />
              <Text style={[styles.badgeText, { color: theme.success }]}>14%</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Focus Time</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>12h 45m</Text>
            <View style={[styles.badge, { backgroundColor: theme.infoBackground }]}>
              <ArrowUp size={12} color={theme.info} />
              <Text style={[styles.badgeText, { color: theme.info }]}>21%</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Late-night</Text>
          <View style={styles.statValueRow}>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>45m</Text>
            <View style={[styles.badge, { backgroundColor: theme.successBackground }]}>
              <ArrowDown size={12} color={theme.success} />
              <Text style={[styles.badgeText, { color: theme.success }]}>32%</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Streaks & Achievements</Text>
      <View style={styles.streaksContainer}>
        <View style={[styles.streakCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Flame size={28} color="#FF9800" />
          <Text style={[styles.streakValue, { color: theme.textPrimary }]}>7 Days</Text>
          <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Focus Streak</Text>
        </View>
        <View style={[styles.streakCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Moon size={28} color="#9C27B0" />
          <Text style={[styles.streakValue, { color: theme.textPrimary }]}>5 Nights</Text>
          <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>Bedtime Goal</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Nura Insights</Text>
      <View style={[styles.insightCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentSecondary }]}>
        <View style={styles.insightHeader}>
          <Lightbulb size={20} color={theme.accentDeep} />
          <Text style={[styles.insightTitle, { color: theme.accentDeep }]}>Observation</Text>
        </View>
        <Text style={[styles.insightText, { color: theme.textPrimary }]}>
          Your social media usage peaks between 10 PM and 12 AM. Consider moving your sleep schedule earlier or turning on Sleep Mode earlier to improve your sleep quality.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Experiments</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.experimentTitle, { color: theme.textPrimary }]}>No phone in bed</Text>
        <Text style={[styles.experimentDesc, { color: theme.textSecondary }]}>Leave your phone charging across the room for 5 nights.</Text>
        <View style={styles.progressRow}>
          <View style={[styles.progressBar, { backgroundColor: theme.borderSubtle }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: '60%' }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.textPrimary }]}>3 / 5</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  statLabel: { fontSize: 13, fontWeight: '500' },
  statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statValue: { fontSize: 18, fontWeight: '800' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12, gap: 2 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  streaksContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  streakCard: { flex: 1, padding: 20, borderRadius: 16, borderWidth: 1, alignItems: 'center', gap: 8 },
  streakValue: { fontSize: 18, fontWeight: '800' },
  streakLabel: { fontSize: 12, fontWeight: '500' },
  insightCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  insightTitle: { fontSize: 14, fontWeight: '700' },
  insightText: { fontSize: 14, lineHeight: 22 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 32 },
  experimentTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  experimentDesc: { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { fontSize: 13, fontWeight: '600' },
});
