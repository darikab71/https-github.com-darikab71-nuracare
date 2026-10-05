import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CategoryUsage {
  category: string;
  minutes: number;
  color: string;
}

interface CategoryBreakdownCardProps {
  data: CategoryUsage[];
  totalMinutes: number;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({ data, totalMinutes }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Category Usage</Text>
      
      <View style={styles.list}>
        {data.map((item, index) => {
          const percentage = Math.max((item.minutes / totalMinutes) * 100, 2);
          const hours = Math.floor(item.minutes / 60);
          const mins = item.minutes % 60;
          const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <View key={index} style={styles.row}>
              <Text style={[styles.categoryName, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.category}
              </Text>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { backgroundColor: item.color, width: `${percentage}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>{timeString}</Text>
            </View>
          );
        })}
      </View>
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
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    width: 80,
    fontSize: 13,
    fontWeight: '500',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  timeText: {
    width: 50,
    fontSize: 12,
    textAlign: 'right',
  },
});
