import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, ShieldCheck, Sparkles, Heart } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LifestyleSnapshot } from '../../storage/lifestyleStorage';

interface LifestyleOverviewCardProps {
  snapshot: LifestyleSnapshot;
}

export default function LifestyleOverviewCard({ snapshot }: LifestyleOverviewCardProps) {
  const { theme, isDark } = useTheme();

  const score = snapshot.balanceScore;
  const statusColor = score >= 80 ? theme.accent : score >= 60 ? theme.warning : theme.error;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]}>
          <Sparkles size={13} color={theme.accent} />
          <Text style={[styles.badgeText, { color: theme.accent }]}>TODAY'S LIFESTYLE STATUS</Text>
        </View>

        <View style={styles.trendRow}>
          <TrendingUp size={14} color={theme.accent} />
          <Text style={[styles.trendText, { color: theme.accent }]}>↑ 6% this week</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreLeft}>
          <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>{score}%</Text>
          <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Lifestyle Balance</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.messageWrap}>
          <Text style={[styles.messageHeading, { color: theme.textPrimary }]}>
            {score >= 80
              ? "You're building a balanced day."
              : score >= 60
              ? "Steady routines in progress."
              : "Time for a restorative reset."}
          </Text>
          <Text style={[styles.messageSub, { color: theme.textTertiary }]}>
            Calculated from your tracked sleep, mobility, hydration, and mindful routines.
          </Text>
        </View>
      </View>

      {/* Visual Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
        <View style={[styles.progressBar, { width: `${score}%`, backgroundColor: statusColor }]} />
      </View>

      {/* Component Pillars Breakdown Mini-Chips */}
      <View style={styles.chipsRow}>
        <View style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>Sleep</Text>
          <Text style={[styles.chipValue, { color: theme.textPrimary }]}>{snapshot.sleepHours}h</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>Steps</Text>
          <Text style={[styles.chipValue, { color: theme.textPrimary }]}>{snapshot.steps.toLocaleString()}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>Water</Text>
          <Text style={[styles.chipValue, { color: theme.textPrimary }]}>{(snapshot.waterMl / 1000).toFixed(1)}L</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>Reset</Text>
          <Text style={[styles.chipValue, { color: theme.textPrimary }]}>{snapshot.mindfulnessMins}m</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  scoreLeft: {
    alignItems: 'center',
    minWidth: 80,
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 44,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    marginHorizontal: 14,
  },
  messageWrap: {
    flex: 1,
  },
  messageHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: 3,
  },
  messageSub: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
});
