import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, TrendingDown, Calendar, Flame, Smartphone, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { deviceWellbeingProvider } from '../../services/digital/deviceAwareness';

export function ScreenTimeAnalyticsPanel() {
  const { theme } = useTheme();
  const [selectedRange, setSelectedRange] = useState<'today' | 'week' | 'month'>('today');
  const currentActivity = deviceWellbeingProvider.getCurrentActivity();

  // Hourly distribution for today (6 AM - 11 PM)
  const hourlyData = [
    { hour: '6am', mins: 12 },
    { hour: '8am', mins: 28 },
    { hour: '10am', mins: 42 },
    { hour: '12pm', mins: 35 },
    { hour: '2pm', mins: 18 },
    { hour: '4pm', mins: 46 },
    { hour: '6pm', mins: 24 },
    { hour: '8pm', mins: 52 },
    { hour: '10pm', mins: 38 },
  ];

  // 7-Day Comparison Heatmap data
  const weekHeatmap = [
    { day: 'Mon', hours: 4.2, density: 4 },
    { day: 'Tue', hours: 3.8, density: 3 },
    { day: 'Wed', hours: 5.1, density: 5 },
    { day: 'Thu', hours: 3.5, density: 3 },
    { day: 'Fri', hours: 4.8, density: 4 },
    { day: 'Sat', hours: 6.2, density: 5 },
    { day: 'Sun', hours: 3.7, density: 2 },
  ];

  const maxMins = Math.max(...hourlyData.map(h => h.mins));

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* 1. Live Current Activity Card (Real Device Awareness) */}
      <View style={[styles.liveCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.liveCardHeader}>
          <View style={styles.liveIndicator}>
            <View style={[styles.pulsingDot, { backgroundColor: theme.accent }]} />
            <Text style={[styles.liveBadgeText, { color: theme.accent }]}>CURRENT ACTIVITY</Text>
          </View>
          <Text style={[styles.liveCategory, { color: theme.textSecondary }]}>{currentActivity.category}</Text>
        </View>

        <View style={styles.liveBodyRow}>
          <View style={styles.liveAppIcon}>
            <Smartphone size={24} color={theme.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.liveAppName, { color: theme.textPrimary }]}>{currentActivity.appName}</Text>
            <Text style={[styles.liveSessionMeta, { color: theme.textSecondary }]}>
              Session: {Math.floor(currentActivity.sessionDurationSeconds / 60)}m {currentActivity.sessionDurationSeconds % 60}s • Today: {currentActivity.todayDurationMinutes}m
            </Text>
          </View>
          <View style={[
            styles.statusPill,
            { backgroundColor: currentActivity.status === 'warning' ? theme.warningBackground : theme.successBackground }
          ]}>
            <Text style={[
              styles.statusPillText,
              { color: currentActivity.status === 'warning' ? theme.warning : theme.success }
            ]}>
              {currentActivity.remainingMinutes}m left
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Range Selector */}
      <View style={[styles.rangeTabsWrap, { backgroundColor: theme.surfaceElevated }]}>
        {(['today', 'week', 'month'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.rangeTab, selectedRange === tab && { backgroundColor: theme.accent }]}
            onPress={() => setSelectedRange(tab)}
          >
            <Text style={[
              styles.rangeTabText,
              { color: selectedRange === tab ? '#ffffff' : theme.textSecondary }
            ]}>
              {tab === 'today' ? 'Today (Hourly)' : tab === 'week' ? '7-Day Trend' : 'Monthly'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Hourly Bar Graph */}
      {selectedRange === 'today' && (
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>Hourly Distribution</Text>
            <Text style={[styles.peakBadge, { color: theme.accent }]}>Peak: 8:00 PM (52m)</Text>
          </View>

          <View style={styles.barGraphRow}>
            {hourlyData.map(item => {
              const heightPct = Math.round((item.mins / maxMins) * 100);
              const isPeak = item.mins === maxMins;
              return (
                <View key={item.hour} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View style={[
                      styles.barFill,
                      { height: `${heightPct}%`, backgroundColor: isPeak ? theme.accent : theme.borderElevated }
                    ]} />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.textTertiary }]}>{item.hour}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* 4. Weekly Heatmap & Trend */}
      {selectedRange === 'week' && (
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>7-Day Daily Heatmap</Text>
            <Text style={[styles.peakBadge, { color: theme.success }]}>↓ 24m vs last week</Text>
          </View>

          <View style={styles.heatmapList}>
            {weekHeatmap.map(d => (
              <View key={d.day} style={styles.heatmapRow}>
                <Text style={[styles.heatmapDay, { color: theme.textSecondary }]}>{d.day}</Text>
                <View style={styles.densityPillsRow}>
                  {[1, 2, 3, 4, 5].map(step => (
                    <View
                      key={step}
                      style={[
                        styles.densityBlock,
                        {
                          backgroundColor: step <= d.density
                            ? (step >= 5 ? theme.warning : theme.accent)
                            : theme.borderSubtle
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.heatmapHours, { color: theme.textPrimary }]}>{d.hours}h</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 5. Key Digital Metrics Grid */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Clock size={18} color={theme.accent} />
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Average Session</Text>
          <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>4m 12s</Text>
          <Text style={[styles.summarySub, { color: theme.success }]}>↓ 18s from avg</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Smartphone size={18} color={theme.info} />
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Pickups</Text>
          <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>48 pickups</Text>
          <Text style={[styles.summarySub, { color: theme.textTertiary }]}>First: 7:15 AM</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  liveCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  liveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  liveCategory: {
    fontSize: 11,
    fontWeight: '600',
  },
  liveBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveAppIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(84, 200, 120, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveAppName: {
    fontSize: 16,
    fontWeight: '800',
  },
  liveSessionMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rangeTabsWrap: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  rangeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  rangeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  peakBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  barGraphRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 90,
    justifyContent: 'flex-end',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 9.5,
    marginTop: 6,
    fontWeight: '600',
  },
  heatmapList: {
    gap: 8,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heatmapDay: {
    width: 32,
    fontSize: 12,
    fontWeight: '700',
  },
  densityPillsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: 12,
  },
  densityBlock: {
    flex: 1,
    height: 12,
    borderRadius: 4,
  },
  heatmapHours: {
    fontSize: 12.5,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 4,
  },
  summarySub: {
    fontSize: 10.5,
    fontWeight: '600',
  },
});
