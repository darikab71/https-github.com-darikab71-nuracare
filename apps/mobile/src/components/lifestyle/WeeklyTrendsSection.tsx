import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Sparkles, Info } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { DayTrendPoint } from '../../storage/lifestyleStorage';

interface WeeklyTrendsSectionProps {
  trendPoints: DayTrendPoint[];
}

type MetricMode = 'balance' | 'sleep' | 'steps' | 'water';

export default function WeeklyTrendsSection({ trendPoints }: WeeklyTrendsSectionProps) {
  const { theme, isDark } = useTheme();
  const [metricMode, setMetricMode] = useState<MetricMode>('balance');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(trendPoints.length - 1);

  const selectedPoint = trendPoints[selectedDayIndex] || trendPoints[trendPoints.length - 1];

  const getMetricDetails = () => {
    switch (metricMode) {
      case 'balance':
        return {
          title: 'Lifestyle Balance',
          valStr: `${selectedPoint.balanceScore}%`,
          maxVal: 100,
          getVal: (p: DayTrendPoint) => p.balanceScore,
          unit: '%',
          color: theme.accent,
        };
      case 'sleep':
        return {
          title: 'Sleep Duration',
          valStr: `${selectedPoint.sleepHours}h`,
          maxVal: 10,
          getVal: (p: DayTrendPoint) => p.sleepHours,
          unit: 'h',
          color: '#6366f1',
        };
      case 'steps':
        return {
          title: 'Daily Movement',
          valStr: `${selectedPoint.steps.toLocaleString()}`,
          maxVal: 10000,
          getVal: (p: DayTrendPoint) => p.steps,
          unit: ' steps',
          color: '#10b981',
        };
      case 'water':
        return {
          title: 'Hydration Volume',
          valStr: `${selectedPoint.waterLiters.toFixed(1)}L`,
          maxVal: 3.0,
          getVal: (p: DayTrendPoint) => p.waterLiters,
          unit: 'L',
          color: '#0ea5e9',
        };
    }
  };

  const currentMetric = getMetricDetails();

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Week</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            7-day pattern consistency
          </Text>
        </View>

        {/* Selected Day Inspect Bubble */}
        <View style={[styles.inspectBubble, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <Text style={[styles.inspectDay, { color: theme.textSecondary }]}>{selectedPoint.dayLabel}: </Text>
          <Text style={[styles.inspectVal, { color: currentMetric.color }]}>{currentMetric.valStr}</Text>
        </View>
      </View>

      {/* Metric Selector Pills */}
      <View style={styles.metricPillsRow}>
        {(['balance', 'sleep', 'steps', 'water'] as const).map((mode) => {
          const isSelected = metricMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.metricPill,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isSelected && { backgroundColor: theme.accentDeep, borderColor: theme.accent },
              ]}
              onPress={() => setMetricMode(mode)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.metricPillText,
                  { color: theme.textSecondary },
                  isSelected && { color: theme.accent, fontWeight: '700' },
                ]}
              >
                {mode === 'balance' ? 'Balance' : mode === 'sleep' ? 'Sleep' : mode === 'steps' ? 'Steps' : 'Water'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 7-Day Interactive Bar Chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.barsContainer}>
          {trendPoints.map((p, idx) => {
            const isSelected = idx === selectedDayIndex;
            const val = currentMetric.getVal(p);
            const heightPct = Math.min(100, Math.max(12, Math.round((val / currentMetric.maxVal) * 100)));

            return (
              <TouchableOpacity
                key={p.dateStr}
                style={styles.barColumn}
                onPress={() => setSelectedDayIndex(idx)}
                activeOpacity={0.8}
              >
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPct}%`,
                        backgroundColor: isSelected ? currentMetric.color : (isDark ? '#26332f' : '#cbd5e1'),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.barDayLabel,
                    { color: theme.textSecondary },
                    isSelected && { color: currentMetric.color, fontWeight: '800' },
                  ]}
                >
                  {p.dayLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Contextual Weekly Insight Card */}
      <View style={[styles.insightCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
        <View style={styles.insightIconWrap}>
          <Sparkles size={16} color={theme.accent} />
        </View>
        <View style={styles.insightTextWrap}>
          <Text style={[styles.insightTitle, { color: theme.textPrimary }]}>Weekly Pattern Insight</Text>
          <Text style={[styles.insightBody, { color: theme.textSecondary }]}>
            Your sleep consistency and morning sunlight routines improved by 14% this week. Maintaining this circadian anchor supports deeper slow-wave restorative sleep.
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
  inspectBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  inspectDay: {
    fontSize: 11,
    fontWeight: '600',
  },
  inspectVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  metricPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  metricPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  metricPillText: {
    fontSize: 11.5,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 110,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 84,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barDayLabel: {
    fontSize: 10.5,
    marginTop: 6,
    fontWeight: '600',
  },
  insightCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  insightIconWrap: {
    marginTop: 2,
  },
  insightTextWrap: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  insightBody: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
