import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Utensils,
  Activity,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Wind,
  Users,
  ChevronRight,
  Moon,
  Droplets,
  Flame,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CategoryOverviewData, LifestyleCategoryKey } from '../../storage/lifestyleStorage';

interface LifestyleCategoriesGridProps {
  categories: CategoryOverviewData[];
  onSelectCategory: (key: LifestyleCategoryKey) => void;
}

export default function LifestyleCategoriesGrid({
  categories,
  onSelectCategory,
}: LifestyleCategoriesGridProps) {
  const { theme, isDark } = useTheme();

  // Find category helpers
  const getCat = (key: LifestyleCategoryKey) => categories.find((c) => c.key === key);
  const nutritionCat = getCat('nutrition');
  const fitnessCat = getCat('fitness');
  const digitalCat = getCat('digital');
  const mentalCat = getCat('mental');
  const socialCat = getCat('social');
  const habitsCat = getCat('habits');
  const sleepCat = getCat('sleep');
  const hydrationCat = getCat('hydration');

  const wellbeingScore = Math.round(
    ((digitalCat?.progressPct || 65) + (mentalCat?.progressPct || 80) + (socialCat?.progressPct || 68)) / 3
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lifestyle Pillars</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Your daily nutrition, training, holistic wellbeing & habits
        </Text>
      </View>

      <View style={styles.cardsList}>
        {/* 1. NUTRITION HORIZONTAL CARD */}
        <TouchableOpacity
          style={[styles.horizontalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectCategory('nutrition')}
          activeOpacity={0.84}
        >
          <View style={styles.cardMainRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(22, 163, 74, 0.14)' }]}>
              <Utensils size={20} color="#16a34a" />
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Nutrition</Text>
                <View style={[styles.metricChip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.metricChipText, { color: '#16a34a' }]}>
                    {nutritionCat ? nutritionCat.primaryMetric : '3/3 Meals'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Metabolic fuel, eating patterns & athletic superfoods
              </Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusHighlight, { color: theme.textSecondary }]}>
                  {nutritionCat ? nutritionCat.statusLabel : '95g Protein'} • {nutritionCat ? nutritionCat.progressPct : 82}% Consistency
                </Text>
                <ChevronRight size={15} color={theme.textTertiary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. FITNESS & GYM HORIZONTAL CARD */}
        <TouchableOpacity
          style={[styles.horizontalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectCategory('fitness')}
          activeOpacity={0.84}
        >
          <View style={styles.cardMainRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(234, 88, 12, 0.14)' }]}>
              <Activity size={20} color="#ea580c" />
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Fitness & Gym</Text>
                <View style={[styles.metricChip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.metricChipText, { color: '#ea580c' }]}>
                    {fitnessCat ? fitnessCat.primaryMetric : '6,482 Steps'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Daily movement, training sessions & thoracic mobility
              </Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusHighlight, { color: theme.textSecondary }]}>
                  {fitnessCat ? fitnessCat.statusLabel : '4/5 Workouts'} • {fitnessCat ? fitnessCat.progressPct : 72}% of Goal
                </Text>
                <ChevronRight size={15} color={theme.textTertiary} />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. WELLBEING HORIZONTAL CARD (Grouping Digital, Mental & Social Wellbeing) */}
        <View style={[styles.wellbeingCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.wellbeingHeaderRow}>
            <View style={styles.wellbeingTitleWrap}>
              <View style={[styles.iconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.14)' }]}>
                <Sparkles size={20} color="#6366f1" />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Wellbeing</Text>
                <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                  Mind, digital balance & intentional social connection
                </Text>
              </View>
            </View>

            <View style={[styles.metricChip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <Text style={[styles.metricChipText, { color: '#6366f1' }]}>{wellbeingScore}% Balanced</Text>
            </View>
          </View>

          {/* Sub-Grid Pills for Digital, Mental & Social Wellbeing */}
          <View style={styles.subGridContainer}>
            {/* Digital Wellbeing Sub-Card */}
            <TouchableOpacity
              style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => onSelectCategory('digital')}
              activeOpacity={0.78}
            >
              <View style={styles.subCardTop}>
                <View style={[styles.subIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.15)' }]}>
                  <Smartphone size={15} color="#0284c7" />
                </View>
                <ChevronRight size={13} color={theme.textTertiary} />
              </View>
              <Text style={[styles.subTitle, { color: theme.textPrimary }]}>Digital Wellbeing</Text>
              <Text style={[styles.subMetric, { color: '#0284c7' }]}>
                {digitalCat ? digitalCat.primaryMetric : '4h 12m'}
              </Text>
              <Text style={[styles.subDetail, { color: theme.textSecondary }]}>
                {digitalCat ? digitalCat.statusLabel : '3 Breaks Taken'}
              </Text>
            </TouchableOpacity>

            {/* Mental Wellbeing Sub-Card */}
            <TouchableOpacity
              style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => onSelectCategory('mental')}
              activeOpacity={0.78}
            >
              <View style={styles.subCardTop}>
                <View style={[styles.subIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Wind size={15} color="#f59e0b" />
                </View>
                <ChevronRight size={13} color={theme.textTertiary} />
              </View>
              <Text style={[styles.subTitle, { color: theme.textPrimary }]}>Mental Wellbeing</Text>
              <Text style={[styles.subMetric, { color: '#f59e0b' }]}>
                {mentalCat ? mentalCat.primaryMetric : 'Good Mood'}
              </Text>
              <Text style={[styles.subDetail, { color: theme.textSecondary }]}>
                {mentalCat ? mentalCat.statusLabel : 'Low Stress • Reset'}
              </Text>
            </TouchableOpacity>

            {/* Social Wellbeing Sub-Card */}
            <TouchableOpacity
              style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
              onPress={() => onSelectCategory('social')}
              activeOpacity={0.78}
            >
              <View style={styles.subCardTop}>
                <View style={[styles.subIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
                  <Users size={15} color="#ec4899" />
                </View>
                <ChevronRight size={13} color={theme.textTertiary} />
              </View>
              <Text style={[styles.subTitle, { color: theme.textPrimary }]}>Social Wellbeing</Text>
              <Text style={[styles.subMetric, { color: '#ec4899' }]}>
                {socialCat ? socialCat.primaryMetric : '2/3 Goals'}
              </Text>
              <Text style={[styles.subDetail, { color: theme.textSecondary }]}>
                {socialCat ? socialCat.statusLabel : 'Intentional'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. HABITS & ROUTINES HORIZONTAL CARD */}
        <TouchableOpacity
          style={[styles.horizontalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => onSelectCategory('habits')}
          activeOpacity={0.84}
        >
          <View style={styles.cardMainRow}>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
              <CheckCircle2 size={20} color="#10b981" />
            </View>

            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Habits & Routines</Text>
                <View style={[styles.metricChip, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.metricChipText, { color: '#10b981' }]}>
                    {habitsCat ? habitsCat.primaryMetric : '4/5 Done'}
                  </Text>
                </View>
              </View>

              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>
                Circadian awakening, wind-down timelines & sleep anchors
              </Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusHighlight, { color: theme.textSecondary }]}>
                  {habitsCat ? habitsCat.statusLabel : '5-Day Streak'} • {sleepCat ? sleepCat.primaryMetric : '7.4h Sleep'} • {hydrationCat ? hydrationCat.primaryMetric : '1.8L'}
                </Text>
                <ChevronRight size={15} color={theme.textTertiary} />
              </View>
            </View>
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
  headerRow: {
    marginBottom: 12,
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
  cardsList: {
    gap: 12,
  },
  horizontalCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cardInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  metricChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  metricChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  statusHighlight: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  wellbeingCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  wellbeingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wellbeingTitleWrap: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  subGridContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  subCard: {
    flex: 1,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  subCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginBottom: 3,
  },
  subMetric: {
    fontSize: 11.5,
    fontWeight: '800',
    marginBottom: 2,
  },
  subDetail: {
    fontSize: 9.5,
    lineHeight: 12,
  },
});
