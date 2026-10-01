import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Sun, Droplets, Activity, Leaf, Wind } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LifestyleHabit } from '../../storage/lifestyleStorage';

interface HabitTrackerGridProps {
  habits: LifestyleHabit[];
  onToggleHabit: (habitId: string, dateStr: string) => void;
}

export default function HabitTrackerGrid({ habits, onToggleHabit }: HabitTrackerGridProps) {
  const { theme, isDark } = useTheme();

  // Generate 7 days ending today
  const last7Days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      list.push({
        iso,
        letter: dayNames[d.getDay()],
        isToday: i === 0,
      });
    }
    return list;
  }, []);

  const getHabitIcon = (name: string) => {
    switch (name) {
      case 'Sun': return <Sun size={14} color="#f59e0b" />;
      case 'Droplets': return <Droplets size={14} color="#0ea5e9" />;
      case 'Activity': return <Activity size={14} color="#10b981" />;
      case 'Leaf': return <Leaf size={14} color="#16a34a" />;
      case 'Wind': return <Wind size={14} color="#6366f1" />;
      default: return <Activity size={14} color={theme.accent} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Weekly Habit Consistency</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>7-day record</Text>
      </View>

      <View style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Days Header */}
        <View style={styles.rowHeader}>
          <Text style={[styles.habitColHeader, { color: theme.textSecondary }]}>HABIT</Text>
          <View style={styles.daysColHeader}>
            {last7Days.map((d) => (
              <Text
                key={d.iso}
                style={[
                  styles.dayLetter,
                  { color: theme.textSecondary },
                  d.isToday && { color: theme.accent, fontWeight: '800' },
                ]}
              >
                {d.letter}
              </Text>
            ))}
          </View>
        </View>

        {/* Habit Rows */}
        {habits.map((h) => {
          return (
            <View key={h.id} style={[styles.habitRow, { borderTopColor: theme.borderSubtle }]}>
              <View style={styles.habitMeta}>
                <View style={styles.habitIcon}>{getHabitIcon(h.iconName)}</View>
                <Text style={[styles.habitName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {h.label}
                </Text>
              </View>

              <View style={styles.checksWrap}>
                {last7Days.map((d) => {
                  const isDone = h.completedDates.includes(d.iso);
                  return (
                    <TouchableOpacity
                      key={d.iso}
                      style={[
                        styles.checkBubble,
                        { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                        isDone && { backgroundColor: theme.accent, borderColor: theme.accent },
                      ]}
                      onPress={() => onToggleHabit(h.id, d.iso)}
                      activeOpacity={0.7}
                    >
                      {isDone && <Check size={11} color="#ffffff" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
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
  },
  gridCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  habitColHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  daysColHeader: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  dayLetter: {
    width: 22,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  habitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 10,
  },
  habitIcon: {
    width: 22,
    alignItems: 'center',
  },
  habitName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  checksWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  checkBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
