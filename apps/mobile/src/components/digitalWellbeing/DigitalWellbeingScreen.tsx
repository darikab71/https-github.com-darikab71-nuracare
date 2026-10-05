import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { ScreenTimeCard } from './ScreenTimeCard';
import { DigitalBalanceCard } from './DigitalBalanceCard';
import { NuraCoachCard } from './NuraCoachCard';
import { QuickActionsBar } from './QuickActionsBar';
import { CategoryBreakdownCard } from './CategoryBreakdownCard';
import { FocusModePanel } from './FocusModePanel';
import { SleepModePanel } from './SleepModePanel';
import { LimitsManager } from './LimitsManager';
import { InsightsPanel } from './InsightsPanel';
import { ScreenTimeAnalyticsPanel } from './ScreenTimeAnalyticsPanel';
import { AppUsageTrackingPanel } from './AppUsageTrackingPanel';
import { RuleBuilderPanel } from './RuleBuilderPanel';
import { ConnectedDevicesPanel } from './ConnectedDevicesPanel';

interface DigitalWellbeingScreenProps {
  onBack: () => void;
}

const TABS = ['Overview', 'Screen Time', 'Apps', 'Limits', 'Focus', 'Sleep', 'Rules', 'Insights', 'Devices', 'Nura Coach'];

export const DigitalWellbeingScreen: React.FC<DigitalWellbeingScreenProps> = ({ onBack }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('Overview');

  // Mock data
  const greeting = "Good Afternoon";
  const balanceScore = 84;
  const breakdown = {
    focus: 24,
    healthy: 18,
    breaks: 16,
    sleep: 10,
    distraction: -12,
  };
  const categoryData = [
    { category: 'Social', minutes: 85, color: '#FF6B6B' },
    { category: 'Video', minutes: 62, color: '#9B51E0' },
    { category: 'Work', minutes: 45, color: '#2D9CDB' },
    { category: 'Education', minutes: 30, color: '#27AE60' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Digital Wellbeing</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.navBackground }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: theme.navActive }
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  { color: isActive ? theme.surface : theme.navInactive },
                  isActive && styles.tabTextActive
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {activeTab === 'Overview' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>{greeting}</Text>
          
          <DigitalBalanceCard score={balanceScore} breakdown={breakdown} />
          
          <ScreenTimeCard 
            totalMinutes={222}
            trendMinutes={-15}
            dailyTargetMinutes={240}
          />

          <View style={styles.row}>
            <View style={[styles.halfCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.halfCardTitle, { color: theme.textSecondary }]}>Focus Time</Text>
              <Text style={[styles.halfCardValue, { color: theme.textPrimary }]}>1h 35m</Text>
            </View>
            <View style={[styles.halfCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.halfCardTitle, { color: theme.textSecondary }]}>Top Distraction</Text>
              <Text style={[styles.halfCardValue, { color: theme.textPrimary }]} numberOfLines={1}>Instagram</Text>
            </View>
          </View>

          <NuraCoachCard 
            message="You've been on Social Media for 1h 25m. Taking a 10-minute break now could improve your focus later."
            primaryActionLabel="Start Focus Mode"
            secondaryActionLabel="Not Now"
            onPrimaryAction={() => setActiveTab('Focus')}
            onSecondaryAction={() => console.log('Dismissed')}
          />

          <QuickActionsBar onSelectAction={(id) => {
            if (id === 'focus') setActiveTab('Focus');
            else if (id === 'limit' || id === 'block') setActiveTab('Limits');
            else if (id === 'sleep') setActiveTab('Sleep');
            else if (id === 'insights') setActiveTab('Insights');
          }} />

          <CategoryBreakdownCard 
            data={categoryData} 
            totalMinutes={222} 
          />

          <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.statusTitle, { color: theme.textPrimary }]}>Current Status</Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Focus Mode</Text>
              <Text style={[styles.statusValue, { color: theme.textDisabled }]}>OFF</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Sleep Mode</Text>
              <Text style={[styles.statusValue, { color: theme.textDisabled }]}>OFF</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {activeTab === 'Screen Time' && <ScreenTimeAnalyticsPanel />}
      {activeTab === 'Apps' && <AppUsageTrackingPanel />}
      {activeTab === 'Limits' && <LimitsManager />}
      {activeTab === 'Focus' && <FocusModePanel />}
      {activeTab === 'Sleep' && <SleepModePanel />}
      {activeTab === 'Rules' && <RuleBuilderPanel />}
      {activeTab === 'Insights' && <InsightsPanel />}
      {activeTab === 'Devices' && <ConnectedDevicesPanel />}
      {activeTab === 'Nura Coach' && <InsightsPanel />}
    </SafeAreaView>
  );
};

export default DigitalWellbeingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabsContainer: {
    paddingVertical: 8,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  halfCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  halfCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  halfCardValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
