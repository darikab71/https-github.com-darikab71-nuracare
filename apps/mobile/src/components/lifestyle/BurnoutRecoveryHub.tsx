import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal
} from 'react-native';
import {
  ShieldAlert,
  Moon,
  Wind,
  Flame,
  MessageCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info,
  ChevronRight,
  X
} from 'lucide-react-native';
import {
  evaluateBurnoutAndRecovery,
  RECOVERY_INTERVENTIONS,
  THREE_DAY_RECOVERY_PLAN,
  RecoveryMicroIntervention
} from '../../lib/burnoutRecoveryEngine';
import { useWellnessStore } from '../../store';
import { getDigitalUsage } from '../../storage/digitalWellnessStorage';

export default function BurnoutRecoveryHub() {
  const { checkIns } = useWellnessStore();
  const latestCheckin = checkIns.length > 0 ? checkIns[0] : undefined;
  const digitalUsage = getDigitalUsage();

  const assessment = evaluateBurnoutAndRecovery({
    dailyCheckin: latestCheckin ? {
      sleep: latestCheckin.sleep || 6,
      stress: latestCheckin.stress || 5,
      energy: latestCheckin.energy || 6,
      mood: latestCheckin.mood || 6,
      drainLevel: 'moderate',
      manageability: 'manageable',
      disconnectAbility: 'somewhat'
    } : undefined,
    digitalUsage: {
      totalScreenMinutes: digitalUsage.totalScreenMinutes,
      socialMediaMinutes: digitalUsage.socialMediaMinutes,
      lateNightMinutes: digitalUsage.lateNightMinutes
    }
  });

  const [activeIntervention, setActiveIntervention] = useState<RecoveryMicroIntervention | null>(null);
  const [showThreeDayPlan, setShowThreeDayPlan] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleOpenIntervention = (key: string) => {
    const item = RECOVERY_INTERVENTIONS[key];
    if (item) {
      setActiveIntervention(item);
      setCompletedSteps([]);
    }
  };

  const toggleStep = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(prev => prev.filter(i => i !== idx));
    } else {
      setCompletedSteps(prev => [...prev, idx]);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Recovery State Card */}
      <View style={[styles.stateCard, { borderColor: assessment.stateColor }]}>
        <View style={styles.stateHeader}>
          <View style={styles.statePill}>
            <View style={[styles.stateDot, { backgroundColor: assessment.stateColor }]} />
            <Text style={[styles.statePillText, { color: assessment.stateColor }]}>
              {assessment.state.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.readinessNum}>{assessment.readinessScore} / 100</Text>
        </View>

        <Text style={styles.stateTitle}>Recovery Readiness</Text>
        <Text style={styles.stateDesc}>
          {assessment.state === 'Balanced'
            ? 'Your physiological reserve and digital load are in healthy equilibrium.'
            : assessment.state === 'Early Strain'
            ? 'Early signs of mental fatigue detected. A short restorative pause will keep you energized.'
            : assessment.state === 'High Strain'
            ? 'Elevated stress and late-night digital use detected. Let’s reduce your cognitive load today.'
            : 'Sustained exhaustion pattern. Prioritize non-sleep rest and protect tonight’s sleep window.'}
        </Text>

        {/* Quiet Mode Indicator */}
        {assessment.quietModeRecommended && (
          <View style={styles.quietBadge}>
            <Moon size={14} color="#6366f1" />
            <Text style={styles.quietText}>
              Quiet Mode Active: NuraCare automatically silences non-essential notifications when strain is high.
            </Text>
          </View>
        )}
      </View>

      {/* 2. Central Interaction: "What do you need right now?" */}
      <Text style={styles.sectionHeading}>What do you need right now?</Text>
      <Text style={styles.sectionSubtitle}>
        Choose the smallest useful reset. You don't need another productivity task.
      </Text>

      <View style={styles.needGrid}>
        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('rest')}>
          <Text style={styles.needEmoji}>😴</Text>
          <Text style={styles.needLabel}>Rest</Text>
          <Text style={styles.needTime}>15 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('clear_head')}>
          <Text style={styles.needEmoji}>🧠</Text>
          <Text style={styles.needLabel}>Clear Head</Text>
          <Text style={styles.needTime}>3 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('offline')}>
          <Text style={styles.needEmoji}>📵</Text>
          <Text style={styles.needLabel}>Off Phone</Text>
          <Text style={styles.needTime}>10 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('move')}>
          <Text style={styles.needEmoji}>💪</Text>
          <Text style={styles.needLabel}>Move Body</Text>
          <Text style={styles.needTime}>5 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('connect')}>
          <Text style={styles.needEmoji}>💬</Text>
          <Text style={styles.needLabel}>Connect</Text>
          <Text style={styles.needTime}>2 min</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.needBtn} onPress={() => handleOpenIntervention('wind_down')}>
          <Text style={styles.needEmoji}>🌙</Text>
          <Text style={styles.needLabel}>Wind Down</Text>
          <Text style={styles.needTime}>10 min</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Maslach-Leiter Workload vs Control Assessment */}
      <Text style={styles.sectionHeading}>Workload vs Control Balance</Text>
      <View style={styles.maslachCard}>
        <View style={styles.maslachRow}>
          <Text style={styles.maslachLabel}>Workload Demand</Text>
          <Text style={styles.maslachVal}>70% (High)</Text>
        </View>
        <View style={styles.barTrack}><View style={[styles.barFill, { width: '70%', backgroundColor: '#f97316' }]} /></View>

        <View style={styles.maslachRow}>
          <Text style={styles.maslachLabel}>Perceived Autonomy & Control</Text>
          <Text style={styles.maslachVal}>55% (Moderate)</Text>
        </View>
        <View style={styles.barTrack}><View style={[styles.barFill, { width: '55%', backgroundColor: '#10b981' }]} /></View>

        <View style={styles.maslachInsight}>
          <Info size={15} color="#15803d" />
          <Text style={styles.maslachInsightText}>
            Research indicates high workload combined with low perceived control is a primary driver of chronic strain. Consider renegotiating or deferring one non-essential commitment.
          </Text>
        </View>
      </View>

      {/* 4. 3-Day Recovery Plan Banner */}
      <TouchableOpacity style={styles.planBanner} onPress={() => setShowThreeDayPlan(true)}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Calendar size={18} color="#16a34a" />
            <Text style={styles.planBannerTitle}>3-Day Recovery Plan</Text>
          </View>
          <Text style={styles.planBannerSub}>
            Gentle de-escalation plan designed to restore natural energy without extra tasks.
          </Text>
        </View>
        <ChevronRight size={20} color="#16a34a" />
      </TouchableOpacity>

      {/* 5. Evidence-Informed Recovery Library */}
      <Text style={styles.sectionHeading}>Recovery Library</Text>
      {Object.values(RECOVERY_INTERVENTIONS).slice(0, 3).map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.libraryCard}
          onPress={() => {
            setActiveIntervention(item);
            setCompletedSteps([]);
          }}
        >
          <View style={styles.libraryIconWrap}>
            <Sparkles size={20} color="#16a34a" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.libraryTitle}>{item.title}</Text>
            <Text style={styles.libraryMeta}>{item.durationMin} min • {item.category}</Text>
            <Text style={styles.librarySub}>{item.subtitle}</Text>
          </View>
          <ChevronRight size={18} color="#94a3b8" />
        </TouchableOpacity>
      ))}

      {/* Intervention Detail Modal */}
      <Modal visible={!!activeIntervention} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>{activeIntervention?.title}</Text>
                <Text style={styles.sheetMeta}>{activeIntervention?.durationMin} Minutes • Evidence-Informed</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveIntervention(null)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.scienceBadge}>
              <Text style={styles.scienceText}>🔬 {activeIntervention?.scienceRationale}</Text>
            </View>

            <Text style={styles.stepsHeading}>Simple Steps (No pressure, just breathe):</Text>
            {activeIntervention?.steps.map((step, idx) => (
              <TouchableOpacity key={idx} style={styles.stepRow} onPress={() => toggleStep(idx)}>
                <View style={[styles.stepCheckbox, completedSteps.includes(idx) && styles.stepCheckboxDone]}>
                  {completedSteps.includes(idx) && <CheckCircle2 size={16} color="#ffffff" />}
                </View>
                <Text style={[styles.stepText, completedSteps.includes(idx) && styles.stepTextDone]}>
                  {step}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.sheetDoneBtn}
              onPress={() => {
                Alert.alert('Session Complete', 'Great job prioritizing your restoration.');
                setActiveIntervention(null);
              }}
            >
              <Text style={styles.sheetDoneText}>I feel a bit more relaxed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3-Day Plan Modal */}
      <Modal visible={showThreeDayPlan} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>3-Day Recovery Plan</Text>
                <Text style={styles.sheetMeta}>Evidence-based pacing to reset chronic overload</Text>
              </View>
              <TouchableOpacity onPress={() => setShowThreeDayPlan(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {THREE_DAY_RECOVERY_PLAN.map((day) => (
              <View key={day.day} style={styles.planDayBox}>
                <Text style={styles.planDayTitle}>{day.title}</Text>
                <Text style={styles.planDayObj}>{day.objective}</Text>
                {day.actions.map((act, i) => (
                  <View key={i} style={styles.planActRow}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <Text style={styles.planActText}>{act}</Text>
                  </View>
                ))}
              </View>
            ))}

            <TouchableOpacity
              style={styles.sheetDoneBtn}
              onPress={() => setShowThreeDayPlan(false)}
            >
              <Text style={styles.sheetDoneText}>Close Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 10 },
  stateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 10
  },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stateDot: { width: 7, height: 7, borderRadius: 3.5 },
  statePillText: { fontSize: 11.5, fontWeight: '800' },
  readinessNum: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  stateTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  stateDesc: { fontSize: 12, color: '#475569', lineHeight: 16 },
  quietBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eef2ff', padding: 8, borderRadius: 8, marginTop: 8 },
  quietText: { flex: 1, fontSize: 11, color: '#4338ca', lineHeight: 15, fontWeight: '500' },
  sectionHeading: { fontSize: 14.5, fontWeight: '800', color: '#0f172a', marginTop: 6, marginBottom: 3 },
  sectionSubtitle: { fontSize: 11.5, color: '#64748b', marginBottom: 8 },
  needGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  needBtn: { width: '31%', backgroundColor: '#ffffff', borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  needEmoji: { fontSize: 20, marginBottom: 2 },
  needLabel: { fontSize: 11, fontWeight: '700', color: '#0f172a' },
  needTime: { fontSize: 10, color: '#16a34a', marginTop: 1, fontWeight: '600' },
  maslachCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 11, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 10 },
  maslachRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  maslachLabel: { fontSize: 11.5, fontWeight: '600', color: '#334155' },
  maslachVal: { fontSize: 11.5, fontWeight: '700', color: '#64748b' },
  barTrack: { height: 4, backgroundColor: '#f1f5f9', borderRadius: 2, marginBottom: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  maslachInsight: { flexDirection: 'row', gap: 6, backgroundColor: '#f0fdf4', padding: 8, borderRadius: 8 },
  maslachInsightText: { flex: 1, fontSize: 11, color: '#166534', lineHeight: 15 },
  planBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 11, borderRadius: 12, borderWidth: 1.5, borderColor: '#bbf7d0', marginBottom: 10 },
  planBannerTitle: { fontSize: 13.5, fontWeight: '800', color: '#15803d' },
  planBannerSub: { fontSize: 11, color: '#64748b', marginTop: 1, lineHeight: 15 },
  libraryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', padding: 9, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 6 },
  libraryIconWrap: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  libraryTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  libraryMeta: { fontSize: 10.5, color: '#16a34a', fontWeight: '600', marginTop: 1 },
  librarySub: { fontSize: 11, color: '#64748b', marginTop: 1 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '85%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  sheetMeta: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  scienceBadge: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 10, marginBottom: 14 },
  scienceText: { fontSize: 11.5, color: '#475569', lineHeight: 16 },
  stepsHeading: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  stepCheckbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  stepCheckboxDone: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  stepText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 18 },
  stepTextDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  sheetDoneBtn: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 16 },
  sheetDoneText: { color: '#ffffff', fontWeight: '800', fontSize: 14 },
  planDayBox: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  planDayTitle: { fontSize: 13.5, fontWeight: '800', color: '#0f172a', marginBottom: 2 },
  planDayObj: { fontSize: 11.5, color: '#64748b', marginBottom: 8 },
  planActRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  planActText: { fontSize: 12, color: '#334155' }
});
