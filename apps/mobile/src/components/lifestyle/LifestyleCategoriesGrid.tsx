import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import {
  Utensils,
  Activity,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Wind,
  Users,
  ChevronRight,
  Brain,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CategoryOverviewData, LifestyleCategoryKey } from '../../storage/lifestyleStorage';
import { LocalImages } from '../../assets/images';

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

  const wellbeingScore = Math.round(
    ((digitalCat?.progressPct || 65) + (mentalCat?.progressPct || 80) + (socialCat?.progressPct || 68)) / 3
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lifestyle Pillars</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Tap any pillar to open tracker & specialized guides
        </Text>
      </View>

      <View style={styles.cardsList}>
        {/* 1. NUTRITION QUICK ACTION CARD */}
        <TouchableOpacity
          style={styles.actionCardShift}
          onPress={() => onSelectCategory('nutrition')}
          activeOpacity={0.84}
        >
          <Image
            source={LocalImages.healthyLifestyle}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.actionCardImageOverlay} />

          <View style={styles.actionCardContentHover}>
            <View style={styles.actionCardTopRowHover}>
              <View style={[styles.actionCardIconWrapHover, { backgroundColor: 'rgba(22, 163, 74, 0.88)' }]}>
                <Utensils size={18} color="#ffffff" />
              </View>
              <View style={styles.topBadgesRow}>
                <View style={styles.shiftBadgeHover}>
                  <Text style={styles.shiftBadgeTextHover}>01</Text>
                </View>
                <View style={[styles.shiftBadgeHover, { backgroundColor: 'rgba(34, 197, 94, 0.35)', borderColor: 'rgba(134, 239, 172, 0.6)' }]}>
                  <Text style={styles.shiftBadgeTextHover}>
                    {nutritionCat ? nutritionCat.primaryMetric : '3/3 Meals'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionTextHoverWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.actionCardTitleHover}>Nutrition</Text>
                <ChevronRight size={16} color="#86efac" />
              </View>
              <Text style={styles.actionCardDescHover} numberOfLines={2}>
                Metabolic fuel, eating patterns, athletic macros & cultural superfoods
              </Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {nutritionCat ? nutritionCat.statusLabel : '95g Protein'}
                  </Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {nutritionCat ? `${nutritionCat.progressPct}% Adherence` : '82% Adherence'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 2. FITNESS & GYM QUICK ACTION CARD */}
        <TouchableOpacity
          style={[styles.actionCardShift, { borderColor: 'rgba(253, 186, 116, 0.85)' }]}
          onPress={() => onSelectCategory('fitness')}
          activeOpacity={0.84}
        >
          <Image
            source={LocalImages.beHealthy}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={[styles.actionCardImageOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.58)' }]} />

          <View style={styles.actionCardContentHover}>
            <View style={styles.actionCardTopRowHover}>
              <View style={[styles.actionCardIconWrapHover, { backgroundColor: 'rgba(234, 88, 12, 0.88)' }]}>
                <Activity size={18} color="#ffffff" />
              </View>
              <View style={styles.topBadgesRow}>
                <View style={styles.shiftBadgeHover}>
                  <Text style={styles.shiftBadgeTextHover}>02</Text>
                </View>
                <View style={[styles.shiftBadgeHover, { backgroundColor: 'rgba(234, 88, 12, 0.35)', borderColor: 'rgba(253, 186, 116, 0.6)' }]}>
                  <Text style={styles.shiftBadgeTextHover}>
                    {fitnessCat ? fitnessCat.primaryMetric : '6,482 Steps'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionTextHoverWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.actionCardTitleHover}>Fitness & Gym</Text>
                <ChevronRight size={16} color="#fed7aa" />
              </View>
              <Text style={styles.actionCardDescHover} numberOfLines={2}>
                Strength tracking, hypertrophy splits, daily movement & gym nutrition
              </Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {fitnessCat ? fitnessCat.statusLabel : '4/5 Workouts'}
                  </Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {fitnessCat ? `${fitnessCat.progressPct}% of Goal` : '72% of Goal'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. WELLBEING QUICK ACTION CARD (With Sub-Cards) */}
        <View style={[styles.actionCardShift, styles.wellbeingCardWrapper]}>
          <Image
            source={LocalImages.chamomile}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={[styles.actionCardImageOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.68)' }]} />

          <View style={styles.wellbeingCardContent}>
            {/* Top Row */}
            <View style={styles.actionCardTopRowHover}>
              <View style={[styles.actionCardIconWrapHover, { backgroundColor: 'rgba(99, 102, 241, 0.88)' }]}>
                <Sparkles size={18} color="#ffffff" />
              </View>
              <View style={styles.topBadgesRow}>
                <View style={styles.shiftBadgeHover}>
                  <Text style={styles.shiftBadgeTextHover}>03</Text>
                </View>
                <View style={[styles.shiftBadgeHover, { backgroundColor: 'rgba(99, 102, 241, 0.35)', borderColor: 'rgba(199, 210, 254, 0.6)' }]}>
                  <Text style={styles.shiftBadgeTextHover}>{wellbeingScore}% Balanced</Text>
                </View>
              </View>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={styles.actionCardTitleHover}>Wellbeing</Text>
              <Text style={styles.actionCardDescHover}>
                Mind, digital balance & intentional social connection
              </Text>
            </View>

            {/* Sub-Cards for Digital, Mental & Social */}
            <View style={styles.subGridContainer}>
              {/* Digital Wellbeing */}
              <TouchableOpacity
                style={styles.subCardGlass}
                onPress={() => onSelectCategory('digital')}
                activeOpacity={0.78}
              >
                <View style={styles.subCardTop}>
                  <View style={[styles.subIconWrap, { backgroundColor: 'rgba(2, 132, 199, 0.35)' }]}>
                    <Smartphone size={14} color="#7dd3fc" />
                  </View>
                  <ChevronRight size={13} color="#7dd3fc" />
                </View>
                <Text style={styles.subTitleLight}>Digital</Text>
                <Text style={styles.subMetricLight}>{digitalCat?.primaryMetric || '2h 15m'}</Text>
              </TouchableOpacity>

              {/* Mental Wellbeing */}
              <TouchableOpacity
                style={styles.subCardGlass}
                onPress={() => onSelectCategory('mental')}
                activeOpacity={0.78}
              >
                <View style={styles.subCardTop}>
                  <View style={[styles.subIconWrap, { backgroundColor: 'rgba(147, 51, 234, 0.35)' }]}>
                    <Brain size={14} color="#d8b4fe" />
                  </View>
                  <ChevronRight size={13} color="#d8b4fe" />
                </View>
                <Text style={styles.subTitleLight}>Mental</Text>
                <Text style={styles.subMetricLight}>{mentalCat?.primaryMetric || 'Calm'}</Text>
              </TouchableOpacity>

              {/* Social Wellbeing */}
              <TouchableOpacity
                style={styles.subCardGlass}
                onPress={() => onSelectCategory('social')}
                activeOpacity={0.78}
              >
                <View style={styles.subCardTop}>
                  <View style={[styles.subIconWrap, { backgroundColor: 'rgba(236, 72, 153, 0.35)' }]}>
                    <Users size={14} color="#fbcfe8" />
                  </View>
                  <ChevronRight size={13} color="#fbcfe8" />
                </View>
                <Text style={styles.subTitleLight}>Social</Text>
                <Text style={styles.subMetricLight}>{socialCat?.primaryMetric || '3 Conns'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 4. HABITS & ROUTINES QUICK ACTION CARD */}
        <TouchableOpacity
          style={[styles.actionCardShift, { borderColor: 'rgba(153, 246, 228, 0.85)' }]}
          onPress={() => onSelectCategory('habits')}
          activeOpacity={0.84}
        >
          <Image
            source={LocalImages.naturalRemedies}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={[styles.actionCardImageOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.58)' }]} />

          <View style={styles.actionCardContentHover}>
            <View style={styles.actionCardTopRowHover}>
              <View style={[styles.actionCardIconWrapHover, { backgroundColor: 'rgba(13, 148, 136, 0.88)' }]}>
                <CheckCircle2 size={18} color="#ffffff" />
              </View>
              <View style={styles.topBadgesRow}>
                <View style={styles.shiftBadgeHover}>
                  <Text style={styles.shiftBadgeTextHover}>04</Text>
                </View>
                <View style={[styles.shiftBadgeHover, { backgroundColor: 'rgba(13, 148, 136, 0.35)', borderColor: 'rgba(153, 246, 228, 0.6)' }]}>
                  <Text style={styles.shiftBadgeTextHover}>
                    {habitsCat ? habitsCat.primaryMetric : '5/6 Habits'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.actionTextHoverWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.actionCardTitleHover}>Habits & Routines</Text>
                <ChevronRight size={16} color="#99f6e4" />
              </View>
              <Text style={styles.actionCardDescHover} numberOfLines={2}>
                Morning circadian activation, hydration pacing & daily habit streaks
              </Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {habitsCat ? habitsCat.statusLabel : '🔥 12-day streak'}
                  </Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricPillText}>
                    {habitsCat ? `${habitsCat.progressPct}% consistency` : '83% consistency'}
                  </Text>
                </View>
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
    marginVertical: 14,
  },
  headerRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  cardsList: {
    gap: 14,
  },
  actionCardShift: {
    width: '100%',
    minHeight: 160,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  actionCardImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  actionCardContentHover: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 2,
  },
  actionCardTopRowHover: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardIconWrapHover: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  topBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shiftBadgeHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  shiftBadgeTextHover: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  actionTextHoverWrap: {
    marginTop: 'auto',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionCardTitleHover: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginBottom: 2,
  },
  actionCardDescHover: {
    fontSize: 12,
    color: 'rgba(240, 253, 244, 0.95)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  metricPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  wellbeingCardWrapper: {
    borderColor: 'rgba(199, 210, 254, 0.85)',
    minHeight: 210,
  },
  wellbeingCardContent: {
    padding: 16,
    zIndex: 2,
  },
  subGridContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  subCardGlass: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    padding: 10,
  },
  subCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  subIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitleLight: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  subMetricLight: {
    fontSize: 10.5,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
  },
});
