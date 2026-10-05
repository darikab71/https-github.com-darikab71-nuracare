import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Moon, Clock, Shield, Bell } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export function SleepModePanel() {
  const { theme } = useTheme();
  const [isSleepModeEnabled, setIsSleepModeEnabled] = useState(false);
  const [restrictSocial, setRestrictSocial] = useState(true);
  const [restrictVideo, setRestrictVideo] = useState(true);
  const [restrictGames, setRestrictGames] = useState(true);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {isSleepModeEnabled && (
        <View style={[styles.activeBanner, { backgroundColor: theme.accentDeep, borderColor: theme.border }]}>
          <Moon size={24} color={theme.background} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: theme.background }]}>Sleep Mode Active</Text>
            <Text style={[styles.bannerSubtitle, { color: theme.background }]}>Ends at 6:30 AM (6h 15m remaining)</Text>
          </View>
        </View>
      )}

      <View style={[styles.mainToggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.toggleHeader}>
          <Moon size={28} color={theme.accent} />
          <Switch 
            value={isSleepModeEnabled} 
            onValueChange={setIsSleepModeEnabled}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={theme.background}
          />
        </View>
        <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>Sleep Mode</Text>
        <Text style={[styles.toggleDesc, { color: theme.textSecondary }]}>
          Dim screen, silence non-essential notifications, and limit distracting apps before bed.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Schedule</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.row}>
          <Clock size={20} color={theme.textPrimary} />
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Time</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>10:30 PM - 6:30 AM</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <TouchableOpacity style={styles.row}>
          <Bell size={20} color={theme.textPrimary} />
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Days</Text>
            <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>Weekdays (Mon-Fri)</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Restricted Categories</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.switchRow}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Social Media</Text>
          <Switch value={restrictSocial} onValueChange={setRestrictSocial} trackColor={{ true: theme.accent }} />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <View style={styles.switchRow}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Video Streaming</Text>
          <Switch value={restrictVideo} onValueChange={setRestrictVideo} trackColor={{ true: theme.accent }} />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <View style={styles.switchRow}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Games</Text>
          <Switch value={restrictGames} onValueChange={setRestrictGames} trackColor={{ true: theme.accent }} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Always Allowed Apps</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={{ color: theme.textSecondary, lineHeight: 20 }}>
          Phone, Emergency Contacts, Alarms, and NuraCare are always allowed during Sleep Mode.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    gap: 16,
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: '700' },
  bannerSubtitle: { fontSize: 13, marginTop: 4 },
  mainToggleCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  toggleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  toggleTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  toggleDesc: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 8 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowSubtitle: { fontSize: 13, marginTop: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  divider: { height: 1, marginVertical: 8 },
});
