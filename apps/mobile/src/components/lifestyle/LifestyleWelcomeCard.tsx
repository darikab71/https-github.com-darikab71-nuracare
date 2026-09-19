import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Flame, Sparkles, Droplets, Wind, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface LifestyleWelcomeCardProps {
  balanceScore: number;
  streakDays?: number;
  onLogWater: () => void;
  onLogProtein: () => void;
  onOpenBreathwork: () => void;
  onOpenGymNutrition: () => void;
}

export default function LifestyleWelcomeCard({
  balanceScore,
  streakDays = 5,
  onLogWater,
  onLogProtein,
  onOpenBreathwork,
  onOpenGymNutrition,
}: LifestyleWelcomeCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80' }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        <View style={styles.topBadgeRow}>
          <View style={[styles.badge, { backgroundColor: 'rgba(11, 16, 15, 0.78)', borderColor: theme.borderSubtle }]}>
            <Flame size={12} color="#f97316" />
            <Text style={[styles.badgeText, { color: '#f97316' }]}>{streakDays}-Day Vitality Streak</Text>
          </View>

          <View style={[styles.scoreBadge, { backgroundColor: 'rgba(84, 200, 120, 0.22)', borderColor: theme.accent }]}>
            <Text style={[styles.scoreBadgeText, { color: theme.accent }]}>{balanceScore}% Balanced</Text>
          </View>
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.greetingTitle}>Welcome to Your Daily Rhythm</Text>
          <Text style={styles.greetingSubtitle}>
            Synchronize biological sleep, gym nutrition & parasympathetic resets.
          </Text>
        </View>
      </View>

      {/* Quick Actions Strip */}
      <View style={[styles.actionRow, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.actionPill, { borderColor: theme.borderSubtle, backgroundColor: theme.surface }]}
          onPress={onOpenGymNutrition}
          activeOpacity={0.75}
        >
          <Flame size={13} color="#ea580c" />
          <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>Gym Nutrition</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionPill, { borderColor: theme.borderSubtle, backgroundColor: theme.surface }]}
          onPress={onLogProtein}
          activeOpacity={0.75}
        >
          <Sparkles size={13} color={theme.accent} />
          <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>+25g Protein</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionPill, { borderColor: theme.borderSubtle, backgroundColor: theme.surface }]}
          onPress={onLogWater}
          activeOpacity={0.75}
        >
          <Droplets size={13} color="#0ea5e9" />
          <Text style={[styles.actionPillText, { color: theme.textPrimary }]}>+250ml Water</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: {
    height: 144,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.44)',
  },
  topBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
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
  },
  scoreBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textWrap: {
    zIndex: 2,
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  greetingSubtitle: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 2,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
});
