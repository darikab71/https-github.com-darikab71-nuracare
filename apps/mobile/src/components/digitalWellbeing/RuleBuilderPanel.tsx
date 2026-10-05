import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { Plus, Zap, ArrowDown, Shield, Bell, Moon, Clock, CheckCircle2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getRules, saveRule, deleteRule, DigitalWellbeingRule } from '../../storage/digitalWellbeingStorage';

export function RuleBuilderPanel() {
  const { theme } = useTheme();
  const [rules, setRules] = useState<DigitalWellbeingRule[]>(getRules());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Rule State
  const [newRuleName, setNewRuleName] = useState('Social Media Curfew');
  const [targetApp, setTargetApp] = useState('Instagram');
  const [thresholdMins, setThresholdMins] = useState('45');
  const [selectedAction, setSelectedAction] = useState<'block_app' | 'show_warning' | 'start_focus'>('block_app');

  const defaultTemplates: DigitalWellbeingRule[] = [
    {
      id: 'rule-tmpl-1',
      name: 'Evening Instagram Boundary',
      isEnabled: true,
      trigger: {
        type: 'app_usage',
        appName: 'Instagram',
        thresholdMinutes: 45,
      },
      actions: [
        { type: 'show_warning', message: 'You have used Instagram for 45 minutes today.' },
        { type: 'block_app' }
      ],
      until: 'tomorrow'
    },
    {
      id: 'rule-tmpl-2',
      name: 'Sleep Sanctuary Activation',
      isEnabled: true,
      trigger: {
        type: 'time_of_day',
        timeOfDay: '22:30'
      },
      actions: [
        { type: 'start_sleep', message: 'Restorative Sleep Mode activated.' }
      ],
      until: '06:30'
    },
    {
      id: 'rule-tmpl-3',
      name: 'TikTok Infinite Scroll Pause',
      isEnabled: false,
      trigger: {
        type: 'session_duration',
        appName: 'TikTok',
        thresholdMinutes: 15
      },
      actions: [
        { type: 'show_nura_pause', message: '15-minute session reached. Take a mindful breath.' }
      ],
      until: 'session_end'
    }
  ];

  const activeRulesList = rules.length > 0 ? rules : defaultTemplates;

  const handleToggleRule = (rule: DigitalWellbeingRule) => {
    const updated = { ...rule, isEnabled: !rule.isEnabled };
    saveRule(updated);
    setRules(getRules().length > 0 ? getRules() : activeRulesList.map(r => r.id === rule.id ? updated : r));
  };

  const handleCreateRule = () => {
    const created: DigitalWellbeingRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      isEnabled: true,
      trigger: {
        type: 'app_usage',
        appName: targetApp,
        thresholdMinutes: parseInt(thresholdMins) || 30
      },
      actions: [
        { type: 'show_warning' },
        { type: selectedAction }
      ],
      until: 'tomorrow'
    };

    saveRule(created);
    setRules(getRules());
    setShowCreateModal(false);
    Alert.alert('Rule Activated', `"${newRuleName}" is now active and enforced locally.`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* 1. Header Banner */}
      <View style={[styles.bannerCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
        <View style={styles.bannerHeader}>
          <Zap size={20} color={theme.accent} />
          <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Deterministic Rule Engine</Text>
        </View>
        <Text style={[styles.bannerDesc, { color: theme.textSecondary }]}>
          Rules execute deterministically on your device without relying on continuous cloud access.
        </Text>
      </View>

      {/* 2. Visual Rule Flow Preview (WHEN -> THEN -> UNTIL) */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Active Rules Architecture</Text>

      {activeRulesList.map(rule => (
        <View key={rule.id} style={[styles.ruleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.ruleCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ruleTitle, { color: theme.textPrimary }]}>{rule.name}</Text>
              <Text style={[styles.ruleMeta, { color: theme.textTertiary }]}>
                {rule.trigger.type === 'app_usage' && `When ${rule.trigger.appName} reaches ${rule.trigger.thresholdMinutes}m`}
                {rule.trigger.type === 'time_of_day' && `When time reaches ${rule.trigger.timeOfDay}`}
                {rule.trigger.type === 'session_duration' && `When session exceeds ${rule.trigger.thresholdMinutes}m`}
              </Text>
            </View>
            <Switch
              value={rule.isEnabled}
              onValueChange={() => handleToggleRule(rule)}
              trackColor={{ false: theme.border, true: theme.accentSoft }}
              thumbColor={rule.isEnabled ? theme.accent : '#f8fafc'}
            />
          </View>

          {/* Flow Stepper */}
          <View style={styles.visualFlowWrap}>
            <View style={styles.flowStep}>
              <View style={[styles.stepDot, { backgroundColor: theme.accent }]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                WHEN <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{rule.trigger.appName || 'Time'}</Text> threshold reached
              </Text>
            </View>

            <View style={styles.flowArrow}>
              <ArrowDown size={14} color={theme.textTertiary} />
            </View>

            <View style={styles.flowStep}>
              <View style={[styles.stepDot, { backgroundColor: theme.warning }]}>
                <Text style={styles.stepDotText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                THEN <Text style={{ fontWeight: '800', color: theme.textPrimary }}>Trigger Nura alert & apply restriction</Text>
              </Text>
            </View>

            <View style={styles.flowArrow}>
              <ArrowDown size={14} color={theme.textTertiary} />
            </View>

            <View style={styles.flowStep}>
              <View style={[styles.stepDot, { backgroundColor: theme.info }]}>
                <Text style={styles.stepDotText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: theme.textSecondary }]}>
                UNTIL <Text style={{ fontWeight: '800', color: theme.textPrimary }}>{rule.until === 'tomorrow' ? 'Tomorrow 00:00' : 'End of period'}</Text>
              </Text>
            </View>
          </View>
        </View>
      ))}

      {/* 3. Create Custom Rule Button */}
      <TouchableOpacity
        style={[styles.createBtn, { backgroundColor: theme.accent }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Plus size={18} color="#ffffff" />
        <Text style={styles.createBtnText}>Create New Rule</Text>
      </TouchableOpacity>

      {/* Create Rule Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
            <Text style={[styles.modalHeading, { color: theme.textPrimary }]}>Build New Rule</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Configure deterministic local boundary</Text>

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>RULE NAME</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.textPrimary, borderColor: theme.inputBorder }]}
              value={newRuleName}
              onChangeText={setNewRuleName}
              placeholder="e.g., Evening Social Pause"
              placeholderTextColor={theme.placeholderText}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>APP TO MONITOR</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.textPrimary, borderColor: theme.inputBorder }]}
              value={targetApp}
              onChangeText={setTargetApp}
              placeholder="e.g., Instagram, YouTube, TikTok"
              placeholderTextColor={theme.placeholderText}
            />

            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>DAILY THRESHOLD (MINUTES)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, color: theme.textPrimary, borderColor: theme.inputBorder }]}
              value={thresholdMins}
              onChangeText={setThresholdMins}
              keyboardType="number-pad"
              placeholder="45"
              placeholderTextColor={theme.placeholderText}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: theme.surfaceElevated }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: theme.accent }]}
                onPress={handleCreateRule}
              >
                <Text style={styles.confirmBtnText}>Save Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  bannerCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  bannerDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  ruleCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  ruleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  ruleTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  ruleMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  visualFlowWrap: {
    paddingLeft: 6,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(84, 200, 120, 0.2)',
    marginLeft: 8,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  stepText: {
    fontSize: 11.5,
  },
  flowArrow: {
    paddingLeft: 4,
    marginVertical: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 40,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    fontSize: 13,
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
});
