import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ScreenTimeCardProps {
  totalMinutes: number;
  trendMinutes: number;
  dailyTargetMinutes: number;
}

export const ScreenTimeCard: React.FC<ScreenTimeCardProps> = ({
  totalMinutes,
  trendMinutes,
  dailyTargetMinutes,
}) => {
  const { theme } = useTheme();

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const trendIsDown = trendMinutes <= 0;
  const trendColor = trendIsDown ? theme.success : theme.error;
  const trendIcon = trendIsDown ? '↓' : '↑';

  const progress = Math.min((totalMinutes / dailyTargetMinutes) * 100, 100);

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.textSecondary }]}>Screen Time</Text>
      
      <View style={styles.row}>
        <Text style={[styles.time, { color: theme.textPrimary }]}>
          {hours > 0 ? `${hours}h ` : ''}{minutes}m
        </Text>
        <View style={[styles.trendBadge, { backgroundColor: trendIsDown ? theme.successBackground : theme.errorBackground }]}>
          <Text style={[styles.trendText, { color: trendColor }]}>
            {trendIcon} {Math.abs(trendMinutes)}m
          </Text>
        </View>
      </View>

      <View style={[styles.progressContainer, { backgroundColor: theme.borderSubtle }]}>
        <View 
          style={[
            styles.progressBar, 
            { backgroundColor: progress >= 100 ? theme.error : theme.accent, width: `${progress}%` }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: theme.textTertiary }]}>
        {Math.round(progress)}% of daily target
      </Text>
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
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  time: {
    fontSize: 28,
    fontWeight: '800',
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
});
