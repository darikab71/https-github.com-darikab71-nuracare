import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Check,
  Droplets,
  Wind,
  Utensils,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export interface PriorityItem {
  id: string;
  category: 'nutrition' | 'hydration' | 'digital' | 'mental' | 'fitness';
  categoryLabel: string;
  color: string;
  timeCue: string;
  duration: string;
  title: string;
  detail: string;
  actionLabel: string;
  completed: boolean;
}

interface TodaysPrioritiesSectionProps {
  onOpenBreathwork: () => void;
  onLogWater: () => void;
  onOpenCategory: (key: any) => void;
}

type FilterMode = 'all' | 'todo' | 'done';

export default function TodaysPrioritiesSection({
  onOpenBreathwork,
  onLogWater,
  onOpenCategory,
}: TodaysPrioritiesSectionProps) {
  const { theme, isDark } = useTheme();
  const [filter, setFilter] = useState<FilterMode>('all');

  const [priorities, setPriorities] = useState<PriorityItem[]>([
    {
      id: 'p-1',
      category: 'nutrition',
      categoryLabel: 'Nutrition',
      color: '#16a34a',
      timeCue: 'Post-Workout',
      duration: '45m window',
      title: 'Teff Protein & Glycogen Window',
      detail: 'Deliver 30g bioavailable plant protein to accelerate muscle protein synthesis.',
      actionLabel: 'Log Fuel',
      completed: true,
    },
    {
      id: 'p-2',
      category: 'hydration',
      categoryLabel: 'Hydration',
      color: '#0ea5e9',
      timeCue: 'Throughout Day',
      duration: 'Target 2.5L',
      title: 'Cellular ATP Hydration Target',
      detail: 'Paced mineral water intake to maintain blood viscosity & cognitive focus.',
      actionLabel: '+250ml Water',
      completed: false,
    },
    {
      id: 'p-3',
      category: 'mental',
      categoryLabel: 'Parasympathetic',
      color: '#f59e0b',
      timeCue: 'Afternoon Slump',
      duration: '2 minutes',
      title: '4-7-8 Autonomic Reset',
      detail: 'Down-regulate sympathetic nervous system tone and clear afternoon cortisol.',
      actionLabel: 'Start Reset',
      completed: false,
    },
    {
      id: 'p-4',
      category: 'digital',
      categoryLabel: 'Sleep & Digital',
      color: '#6366f1',
      timeCue: 'Evening 21:30',
      duration: '60 min',
      title: 'Digital Sunset & Blue Light Cutoff',
      detail: 'Protect pineal melatonin synthesis by shifting to low lux warm ambient lighting.',
      actionLabel: 'Focus Mode',
      completed: false,
    },
  ]);

  const completedCount = priorities.filter((p) => p.completed).length;
  const totalCount = priorities.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleActionClick = (p: PriorityItem) => {
    if (p.category === 'mental') {
      onOpenBreathwork();
    } else if (p.category === 'hydration') {
      onLogWater();
    } else {
      onOpenCategory(p.category);
    }
  };

  const displayedPriorities = priorities.filter((p) => {
    if (filter === 'todo') return !p.completed;
    if (filter === 'done') return p.completed;
    return true;
  });

  const getCategoryIcon = (category: string, color: string) => {
    switch (category) {
      case 'nutrition':
        return <Utensils size={14} color={color} />;
      case 'hydration':
        return <Droplets size={14} color={color} />;
      case 'mental':
        return <Wind size={14} color={color} />;
      case 'digital':
        return <Moon size={14} color={color} />;
      default:
        return <Zap size={14} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header & Live Metric Pill */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleWithBadge}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Priorities</Text>
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
                {completedCount}/{totalCount} Done ({progressPct}%)
              </Text>
            </View>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            High-impact circadian interventions tailored to your day
          </Text>
        </View>
      </View>

      {/* 2. Slim Progress Bar Track */}
      <View style={[styles.progressBarTrack, { backgroundColor: isDark ? theme.surfaceElevated : '#e2e8f0' }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${progressPct}%`,
              backgroundColor: progressPct === 100 ? '#16a34a' : theme.accent,
            },
          ]}
        />
      </View>

      {/* 3. Filter Pills (Clean, Simple, Uncrowded) */}
      <View style={styles.filterRow}>
        {(['all', 'todo', 'done'] as FilterMode[]).map((mode) => {
          const isSelected = filter === mode;
          const label =
            mode === 'all'
              ? `All (${totalCount})`
              : mode === 'todo'
              ? `Remaining (${totalCount - completedCount})`
              : `Done (${completedCount})`;

          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected
                    ? isDark
                      ? theme.accentDeep || 'rgba(84, 200, 120, 0.2)'
                      : '#ecfdf5'
                    : isDark
                    ? theme.surfaceElevated
                    : '#f8fafc',
                  borderColor: isSelected ? theme.accent : theme.borderSubtle,
                },
              ]}
              onPress={() => setFilter(mode)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? theme.accent : theme.textSecondary,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. Priority Cards List */}
      <View style={styles.list}>
        {displayedPriorities.map((p) => {
          return (
            <View
              key={p.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: p.completed ? theme.borderSubtle : theme.border,
                },
                p.completed && { opacity: 0.76 },
              ]}
            >
              {/* Checkbox Button */}
              <TouchableOpacity
                style={[
                  styles.checkbox,
                  {
                    borderColor: p.completed ? theme.accent : theme.borderSubtle,
                    backgroundColor: p.completed ? theme.accent : theme.surfaceElevated,
                  },
                ]}
                onPress={() => togglePriority(p.id)}
                activeOpacity={0.8}
              >
                {p.completed && <Check size={13} color="#ffffff" strokeWidth={3} />}
              </TouchableOpacity>

              {/* Main Content Area */}
              <View style={styles.contentWrap}>
                {/* Meta Row: Category Icon + Time Cue + Duration */}
                <View style={styles.topMeta}>
                  <View style={[styles.badge, { backgroundColor: `${p.color}15`, borderColor: `${p.color}30` }]}>
                    {getCategoryIcon(p.category, p.color)}
                    <Text style={[styles.badgeText, { color: p.color }]}>{p.categoryLabel}</Text>
                  </View>

                  <View style={styles.timeTag}>
                    <Clock size={11} color={theme.textTertiary} />
                    <Text style={[styles.timeTagText, { color: theme.textSecondary }]}>
                      {p.timeCue} • {p.duration}
                    </Text>
                  </View>
                </View>

                {/* Title & Detail */}
                <Text
                  style={[
                    styles.itemTitle,
                    { color: theme.textPrimary },
                    p.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                  ]}
                  numberOfLines={2}
                >
                  {p.title}
                </Text>
                <Text style={[styles.itemDetail, { color: theme.textSecondary }]} numberOfLines={2}>
                  {p.detail}
                </Text>

                {/* Bottom Action Footer */}
                <View style={styles.cardFooter}>
                  {p.completed ? (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={13} color="#16a34a" />
                      <Text style={styles.completedBadgeText}>Completed for today</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: `${p.color}14`,
                          borderColor: `${p.color}40`,
                        },
                      ]}
                      onPress={() => handleActionClick(p)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.actionButtonText, { color: p.color }]}>{p.actionLabel}</Text>
                      <ArrowRight size={12} color={p.color} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {displayedPriorities.length === 0 && (
          <View style={[styles.emptyBox, { borderColor: theme.borderSubtle }]}>
            <Sparkles size={20} color={theme.accent} />
            <Text style={[styles.emptyBoxText, { color: theme.textSecondary }]}>
              {filter === 'todo'
                ? 'All priorities completed! Outstanding balance today.'
                : 'No completed priorities yet. Check off an item above!'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    marginBottom: 8,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
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
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
  },
  completionPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 4.5,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11.5,
  },
  list: {
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  contentWrap: {
    flex: 1,
  },
  topMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 0.8,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  itemDetail: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  emptyBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyBoxText: {
    fontSize: 12.5,
    textAlign: 'center',
    fontWeight: '500',
  },
});
