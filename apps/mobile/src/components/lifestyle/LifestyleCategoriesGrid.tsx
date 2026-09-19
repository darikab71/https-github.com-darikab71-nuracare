import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Utensils,
  Activity,
  Moon,
  Smartphone,
  Wind,
  Droplets,
  CheckCircle2,
  Users,
  ChevronRight,
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

  const getIcon = (name: string, color: string) => {
    switch (name) {
      case 'Utensils': return <Utensils size={18} color={color} />;
      case 'Activity': return <Activity size={18} color={color} />;
      case 'Moon': return <Moon size={18} color={color} />;
      case 'Smartphone': return <Smartphone size={18} color={color} />;
      case 'Wind': return <Wind size={18} color={color} />;
      case 'Droplets': return <Droplets size={18} color={color} />;
      case 'CheckCircle2': return <CheckCircle2 size={18} color={color} />;
      case 'Users': return <Users size={18} color={color} />;
      default: return <Activity size={18} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lifestyle Areas</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Explore and improve each dimension of your everyday life
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {categories.map((cat) => {
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => onSelectCategory(cat.key)}
              activeOpacity={0.82}
            >
              <View style={styles.tileHeader}>
                <View style={[styles.iconWrap, { backgroundColor: `${cat.color}16` }]}>
                  {getIcon(cat.iconName, cat.color)}
                </View>

                <View style={[styles.statusBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Text style={[styles.statusBadgeText, { color: cat.color }]}>
                    {cat.progressPct}%
                  </Text>
                </View>
              </View>

              <Text style={[styles.tileName, { color: theme.textPrimary }]}>{cat.name}</Text>
              <Text style={[styles.tileDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {cat.shortDesc}
              </Text>

              <View style={[styles.tileFooter, { borderTopColor: theme.borderSubtle }]}>
                <Text style={[styles.footerMetric, { color: theme.textPrimary }]} numberOfLines={1}>
                  {cat.primaryMetric}
                </Text>
                <ChevronRight size={14} color={theme.textTertiary} />
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48.5%',
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    justifyContent: 'space-between',
    minHeight: 148,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  tileName: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 3,
  },
  tileDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerMetric: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 4,
  },
});
