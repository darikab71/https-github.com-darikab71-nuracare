import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { Search, SlidersHorizontal, Smartphone, Ban, ShieldCheck, CheckCircle2, Clock, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getAppLimits, updateAppLimit, AppLimitItem } from '../../storage/digitalWellbeingStorage';

export function AppUsageTrackingPanel() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'most_used' | 'least_used' | 'remaining'>('most_used');
  const [limits, setLimits] = useState<AppLimitItem[]>(getAppLimits());

  // Comprehensive StayFree-level app dataset
  const appsData = [
    {
      id: 'app-instagram',
      name: 'Instagram',
      packageName: 'com.instagram.android',
      category: 'Social Media',
      todayMins: 46,
      weeklyMins: 312,
      sessions: 14,
      avgSession: '3m 17s',
      trend: '+12%',
      isIgnored: false,
    },
    {
      id: 'app-youtube',
      name: 'YouTube',
      packageName: 'com.google.android.youtube',
      category: 'Video & Entertainment',
      todayMins: 58,
      weeklyMins: 410,
      sessions: 7,
      avgSession: '8m 17s',
      trend: '-8%',
      isIgnored: false,
    },
    {
      id: 'app-tiktok',
      name: 'TikTok',
      packageName: 'com.zhiliaoapp.musically',
      category: 'Social Media',
      todayMins: 39,
      weeklyMins: 245,
      sessions: 18,
      avgSession: '2m 10s',
      trend: '+24%',
      isIgnored: false,
    },
    {
      id: 'app-chrome',
      name: 'Chrome',
      packageName: 'com.android.chrome',
      category: 'Browser',
      todayMins: 31,
      weeklyMins: 195,
      sessions: 12,
      avgSession: '2m 35s',
      trend: '-5%',
      isIgnored: false,
    },
    {
      id: 'app-telegram',
      name: 'Telegram',
      packageName: 'org.telegram.messenger',
      category: 'Messaging',
      todayMins: 28,
      weeklyMins: 180,
      sessions: 22,
      avgSession: '1m 16s',
      trend: '+2%',
      isIgnored: false,
    },
    {
      id: 'app-docs',
      name: 'Google Docs',
      packageName: 'com.google.android.apps.docs.editors.docs',
      category: 'Work & Productivity',
      todayMins: 55,
      weeklyMins: 340,
      sessions: 5,
      avgSession: '11m 00s',
      trend: '0%',
      isIgnored: true, // Work application ignored from distractions
    },
  ];

  const handleToggleLimit = (appName: string, currentEnabled: boolean) => {
    const existing = limits.find(l => l.name.toLowerCase() === appName.toLowerCase());
    if (existing) {
      const updated = { ...existing, isEnabled: !currentEnabled };
      updateAppLimit(updated);
      setLimits(getAppLimits());
    } else {
      const newLimit: AppLimitItem = {
        id: `limit-${Date.now()}`,
        name: appName,
        packageName: '',
        category: 'Other',
        dailyLimitMinutes: 45,
        usedMinutesToday: 0,
        isEnabled: true,
        pauseBeforeOpen: true,
      };
      updateAppLimit(newLimit);
      setLimits(getAppLimits());
    }
  };

  const filteredApps = appsData
    .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'most_used') return b.todayMins - a.todayMins;
      if (sortBy === 'least_used') return a.todayMins - b.todayMins;
      return a.name.localeCompare(b.name);
    });

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* 1. Search & Filter Bar */}
      <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search size={18} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search apps or categories..."
          placeholderTextColor={theme.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 2. Sort Chips */}
      <View style={styles.sortRow}>
        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'most_used' && { backgroundColor: theme.accent }]}
          onPress={() => setSortBy('most_used')}
        >
          <Text style={[styles.sortChipText, { color: sortBy === 'most_used' ? '#ffffff' : theme.textSecondary }]}>
            Most Used
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sortChip, sortBy === 'least_used' && { backgroundColor: theme.accent }]}
          onPress={() => setSortBy('least_used')}
        >
          <Text style={[styles.sortChipText, { color: sortBy === 'least_used' ? '#ffffff' : theme.textSecondary }]}>
            Least Used
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. App Cards List */}
      <View style={styles.appList}>
        {filteredApps.map(app => {
          const limitItem = limits.find(l => l.name.toLowerCase() === app.name.toLowerCase());
          const hasLimit = limitItem?.isEnabled;
          const limitMins = limitItem?.dailyLimitMinutes || 50;
          const remainingMins = Math.max(0, limitMins - app.todayMins);
          const progressPct = Math.min(100, Math.round((app.todayMins / limitMins) * 100));

          return (
            <View key={app.id} style={[styles.appCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.appCardHeader}>
                <View style={styles.iconWrap}>
                  <Smartphone size={22} color={theme.accent} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.appName, { color: theme.textPrimary }]}>{app.name}</Text>
                    {app.isIgnored && (
                      <View style={[styles.ignoredBadge, { backgroundColor: theme.borderSubtle }]}>
                        <EyeOff size={11} color={theme.textTertiary} />
                        <Text style={[styles.ignoredText, { color: theme.textTertiary }]}>Ignored</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.appCategory, { color: theme.textSecondary }]}>{app.category}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.todayUsage, { color: theme.textPrimary }]}>{app.todayMins}m</Text>
                  <Text style={[styles.usageTrend, { color: app.trend.startsWith('-') ? theme.success : theme.warning }]}>
                    {app.trend} this week
                  </Text>
                </View>
              </View>

              {/* Progress to limit */}
              {hasLimit && (
                <View style={styles.limitProgressWrap}>
                  <View style={styles.limitLabelsRow}>
                    <Text style={[styles.limitSub, { color: theme.textSecondary }]}>Daily Limit: {limitMins}m</Text>
                    <Text style={[styles.limitSub, { color: remainingMins === 0 ? theme.error : theme.accent }]}>
                      {remainingMins === 0 ? 'Limit reached' : `${remainingMins}m remaining`}
                    </Text>
                  </View>
                  <View style={[styles.trackBar, { backgroundColor: theme.borderSubtle }]}>
                    <View style={[
                      styles.fillBar,
                      {
                        width: `${progressPct}%`,
                        backgroundColor: progressPct >= 100 ? theme.error : theme.accent
                      }
                    ]} />
                  </View>
                </View>
              )}

              {/* Stats Footer */}
              <View style={[styles.appStatsFooter, { borderTopColor: theme.borderSubtle }]}>
                <View style={styles.statCol}>
                  <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>Sessions</Text>
                  <Text style={[styles.footerVal, { color: theme.textPrimary }]}>{app.sessions}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>Avg Session</Text>
                  <Text style={[styles.footerVal, { color: theme.textPrimary }]}>{app.avgSession}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.footerLabel, { color: theme.textTertiary }]}>7-Day Total</Text>
                  <Text style={[styles.footerVal, { color: theme.textPrimary }]}>{Math.round(app.weeklyMins / 60)}h {app.weeklyMins % 60}m</Text>
                </View>

                <TouchableOpacity
                  style={[styles.limitActionBtn, { backgroundColor: hasLimit ? theme.accentGlow : theme.surfaceElevated }]}
                  onPress={() => handleToggleLimit(app.name, !!hasLimit)}
                >
                  <Text style={[styles.limitActionText, { color: hasLimit ? theme.accent : theme.textSecondary }]}>
                    {hasLimit ? 'Edit Limit' : 'Set Limit'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  sortChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  appList: {
    gap: 12,
    paddingBottom: 40,
  },
  appCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  appCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(84, 200, 120, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
  },
  appCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  ignoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ignoredText: {
    fontSize: 10,
    fontWeight: '600',
  },
  todayUsage: {
    fontSize: 16,
    fontWeight: '800',
  },
  usageTrend: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  limitProgressWrap: {
    marginTop: 12,
  },
  limitLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  limitSub: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  trackBar: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fillBar: {
    height: '100%',
    borderRadius: 3,
  },
  appStatsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  statCol: {
    alignItems: 'flex-start',
  },
  footerLabel: {
    fontSize: 9.5,
    fontWeight: '600',
  },
  footerVal: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  limitActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  limitActionText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
