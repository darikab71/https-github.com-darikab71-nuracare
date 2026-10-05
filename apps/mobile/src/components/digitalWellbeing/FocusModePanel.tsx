import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Target, Clock, Plus, Settings, Play, Square } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
// import { digitalWellnessService } from '../../services/digital/digitalWellnessService';

const FOCUS_PRESETS = [
  { id: 'deep_work', name: 'Deep Work', durationMinutes: 25 },
  { id: 'mental_reset', name: 'Mental Reset', durationMinutes: 15 },
  { id: 'bedtime', name: 'Bedtime Sanctuary', durationMinutes: 45 },
  { id: 'detox', name: 'Digital Detox', durationMinutes: 60 },
];

export function FocusModePanel() {
  const { theme } = useTheme();
  const [activeFocus, setActiveFocus] = useState<any>(null);
  const [socialMediaBlocked, setSocialMediaBlocked] = useState(true);
  const [gamesBlocked, setGamesBlocked] = useState(true);

  const startFocus = (preset: any) => {
    setActiveFocus({ ...preset, remaining: preset.durationMinutes * 60 });
    // digitalWellnessService.startFocusSession(preset);
  };

  const stopFocus = () => {
    setActiveFocus(null);
    // digitalWellnessService.stopFocusSession();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {activeFocus && (
        <View style={[styles.activeBanner, { backgroundColor: theme.accent, borderColor: theme.border }]}>
          <View>
            <Text style={[styles.bannerTitle, { color: theme.background }]}>Active: {activeFocus.name}</Text>
            <Text style={[styles.bannerTime, { color: theme.background }]}>
              {Math.floor(activeFocus.remaining / 60)}:{(activeFocus.remaining % 60).toString().padStart(2, '0')} remaining
            </Text>
          </View>
          <TouchableOpacity onPress={stopFocus} style={[styles.stopButton, { backgroundColor: theme.background }]}>
            <Square size={20} color={theme.accent} />
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Focus Presets</Text>
      <View style={styles.presetsGrid}>
        {FOCUS_PRESETS.map((preset) => (
          <TouchableOpacity 
            key={preset.id} 
            style={[styles.presetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => startFocus(preset)}
          >
            <Target size={24} color={theme.accent} />
            <Text style={[styles.presetName, { color: theme.textPrimary }]}>{preset.name}</Text>
            <Text style={[styles.presetDuration, { color: theme.textSecondary }]}>{preset.durationMinutes}m</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Custom & Scheduled</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Clock size={20} color={theme.textPrimary} />
            <Text style={[styles.rowText, { color: theme.textPrimary }]}>Custom Focus Duration</Text>
          </View>
          <Plus size={20} color={theme.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <TouchableOpacity style={styles.row}>
          <View style={styles.rowLeft}>
            <Settings size={20} color={theme.textPrimary} />
            <Text style={[styles.rowText, { color: theme.textPrimary }]}>Scheduled Focus Times</Text>
          </View>
          <Text style={{ color: theme.textSecondary }}>None set</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>App Restrictions during Focus</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: theme.textPrimary }]}>Block Social Media</Text>
          <Switch 
            value={socialMediaBlocked} 
            onValueChange={setSocialMediaBlocked}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={theme.background}
          />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <View style={styles.row}>
          <Text style={[styles.rowText, { color: theme.textPrimary }]}>Block Games</Text>
          <Switch 
            value={gamesBlocked} 
            onValueChange={setGamesBlocked}
            trackColor={{ false: theme.border, true: theme.accent }}
            thumbColor={theme.background}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  bannerTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  bannerTime: { fontSize: 24, fontWeight: '800' },
  stopButton: { padding: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  presetCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  presetName: { fontSize: 14, fontWeight: '600' },
  presetDuration: { fontSize: 12, fontWeight: '500' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, marginVertical: 8 },
});
