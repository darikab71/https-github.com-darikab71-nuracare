import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

interface DigitalBalanceCardProps {
  score: number;
  breakdown: {
    focus: number;
    healthy: number;
    breaks: number;
    sleep: number;
    distraction: number;
  };
}

export const DigitalBalanceCard: React.FC<DigitalBalanceCardProps> = ({ score, breakdown }) => {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 80) return theme.success;
    if (val >= 60) return theme.warning;
    return theme.error;
  };

  const ringColor = getScoreColor(score);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>Digital Balance</Text>
          <Text style={[styles.subtitle, { color: theme.textTertiary }]}>Your overall wellness score</Text>
        </View>
        <View style={[styles.ring, { borderColor: ringColor }]}>
          <Text style={[styles.score, { color: ringColor }]}>{score}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.expandButton} 
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={[styles.expandText, { color: theme.accent }]}>How is this calculated?</Text>
        {expanded ? 
          <ChevronUp size={16} color={theme.accent} /> : 
          <ChevronDown size={16} color={theme.accent} />
        }
      </TouchableOpacity>

      {expanded && (
        <View style={[styles.breakdown, { borderTopColor: theme.borderSubtle }]}>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>Focus Time</Text>
            <Text style={[styles.breakdownValue, { color: theme.success }]}>+{breakdown.focus}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>Healthy App Use</Text>
            <Text style={[styles.breakdownValue, { color: theme.success }]}>+{breakdown.healthy}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>Taking Breaks</Text>
            <Text style={[styles.breakdownValue, { color: theme.success }]}>+{breakdown.breaks}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>Sleep Quality</Text>
            <Text style={[styles.breakdownValue, { color: theme.success }]}>+{breakdown.sleep}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textPrimary }]}>Distraction</Text>
            <Text style={[styles.breakdownValue, { color: theme.error }]}>{breakdown.distraction}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  score: {
    fontSize: 20,
    fontWeight: '800',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 4,
  },
  breakdown: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
