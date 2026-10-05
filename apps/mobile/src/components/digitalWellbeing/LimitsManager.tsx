import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Shield, Smartphone, Plus, Clock, Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export function LimitsManager() {
  const { theme } = useTheme();
  const [strictMode, setStrictMode] = useState(false);
  const [automationLevel, setAutomationLevel] = useState('Balanced');
  const [limits] = useState([
    { id: '1', app: 'Instagram', limit: 60, used: 45, pauseBeforeOpen: true },
    { id: '2', app: 'TikTok', limit: 30, used: 30, pauseBeforeOpen: false },
  ]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.strictCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={styles.strictIcon}>
            <Lock size={20} color={theme.accent} />
          </View>
          <View style={styles.strictContent}>
            <Text style={[styles.strictTitle, { color: theme.textPrimary }]}>Strict Mode</Text>
            <Text style={[styles.strictDesc, { color: theme.textSecondary }]}>Require PIN to change or bypass limits</Text>
          </View>
          <Switch 
            value={strictMode} 
            onValueChange={setStrictMode}
            trackColor={{ true: theme.accent }}
          />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Automation Level</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {['Gentle', 'Balanced', 'Strict'].map((level) => (
          <TouchableOpacity key={level} style={styles.radioRow} onPress={() => setAutomationLevel(level)}>
            <View style={styles.radioOuter}>
              {automationLevel === level && <View style={[styles.radioInner, { backgroundColor: theme.accent }]} />}
            </View>
            <Text style={[styles.radioText, { color: theme.textPrimary }]}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>App Limits</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={16} color={theme.accent} />
          <Text style={[styles.addText, { color: theme.accent }]}>Add Limit</Text>
        </TouchableOpacity>
      </View>

      {limits.map((limit) => (
        <View key={limit.id} style={[styles.appCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.appHeader}>
            <View style={styles.appInfo}>
              <Smartphone size={20} color={theme.textPrimary} />
              <Text style={[styles.appName, { color: theme.textPrimary }]}>{limit.app}</Text>
            </View>
            <Switch value={true} trackColor={{ true: theme.accent }} />
          </View>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.borderSubtle }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: limit.used >= limit.limit ? theme.error : theme.accent,
                    width: `${Math.min((limit.used / limit.limit) * 100, 100)}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {limit.used}m / {limit.limit}m used today
            </Text>
          </View>

          <View style={styles.appOptions}>
            <View style={styles.row}>
              <Text style={[styles.optionText, { color: theme.textSecondary }]}>Pause before opening</Text>
              <Switch value={limit.pauseBeforeOpen} trackColor={{ true: theme.accent }} />
            </View>
          </View>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Category Limits</Text>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.row}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Social Media</Text>
          <Text style={[styles.rowValue, { color: theme.textSecondary }]}>1h limit</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />
        <View style={styles.row}>
          <Text style={[styles.rowTitle, { color: theme.textPrimary }]}>Entertainment</Text>
          <Text style={[styles.rowValue, { color: theme.textSecondary }]}>No limit</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  strictCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  strictIcon: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', marginRight: 12 },
  strictContent: { flex: 1 },
  strictTitle: { fontSize: 16, fontWeight: '700' },
  strictDesc: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioText: { fontSize: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addText: { fontSize: 14, fontWeight: '600' },
  appCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  appHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appName: { fontSize: 16, fontWeight: '600' },
  progressContainer: { marginBottom: 16 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%' },
  progressText: { fontSize: 12 },
  appOptions: { paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  optionText: { fontSize: 14 },
  rowTitle: { fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  divider: { height: 1, marginVertical: 12 },
});
