import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Flame, Droplets, Moon, Wind, Utensils } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface PriorityItem {
  id: string;
  category: string;
  color: string;
  title: string;
  detail: string;
  completed: boolean;
}

interface TodaysPrioritiesSectionProps {
  onOpenBreathwork: () => void;
  onLogWater: () => void;
  onOpenCategory: (key: any) => void;
}

export default function TodaysPrioritiesSection({
  onOpenBreathwork,
  onLogWater,
  onOpenCategory,
}: TodaysPrioritiesSectionProps) {
  const { theme, isDark } = useTheme();

  const [priorities, setPriorities] = useState<PriorityItem[]>([
    {
      id: 'p-1',
      category: 'Nutrition',
      color: '#16a34a',
      title: 'Post-Workout Teff Protein Window',
      detail: 'Deliver 30g bioavailable protein & glycogen within 45m',
      completed: true,
    },
    {
      id: 'p-2',
      category: 'Hydration',
      color: '#0ea5e9',
      title: 'Reach 2.5L Water Intake Target',
      detail: 'Keep cellular ATP & electrolyte balance steady',
      completed: false,
    },
    {
      id: 'p-3',
      category: 'Digital & Sleep',
      color: '#6366f1',
      title: 'Digital Sunset (60 min prior to bed)',
      detail: 'Dim blue lighting to stimulate natural melatonin',
      completed: false,
    },
    {
      id: 'p-4',
      category: 'Mental Wellbeing',
      color: '#f59e0b',
      title: '2-Minute 4-7-8 Parasympathetic Reset',
      detail: 'Shift autonomic nervous tone to deep calm',
      completed: false,
    },
  ]);

  const togglePriority = (id: string) => {
    setPriorities((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Priorities</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            High-impact actions to balance your day
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {priorities.map((p) => {
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.itemCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
                p.completed && { opacity: 0.72 },
              ]}
              onPress={() => togglePriority(p.id)}
              activeOpacity={0.78}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceElevated },
                  p.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
                ]}
              >
                {p.completed && <Check size={12} color="#ffffff" />}
              </View>

              <View style={styles.contentWrap}>
                <View style={styles.topMeta}>
                  <View style={[styles.badge, { backgroundColor: `${p.color}14` }]}>
                    <Text style={[styles.badgeText, { color: p.color }]}>{p.category}</Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.itemTitle,
                    { color: theme.textPrimary },
                    p.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                  ]}
                >
                  {p.title}
                </Text>
                <Text style={[styles.itemDetail, { color: theme.textSecondary }]}>{p.detail}</Text>
              </View>
            </TouchableOpacity>
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
  list: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  contentWrap: {
    flex: 1,
  },
  topMeta: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemDetail: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
