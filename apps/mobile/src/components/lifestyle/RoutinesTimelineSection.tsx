import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sun, Moon, Check, RotateCcw, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { RoutineData } from '../../storage/lifestyleStorage';

interface RoutinesTimelineSectionProps {
  routines: { morning: RoutineData; evening: RoutineData };
  onToggleStep: (type: 'morning' | 'evening', stepId: string) => void;
  onResetRoutine: (type: 'morning' | 'evening') => void;
}

export default function RoutinesTimelineSection({
  routines,
  onToggleStep,
  onResetRoutine,
}: RoutinesTimelineSectionProps) {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'morning' | 'evening'>('morning');

  const currentRoutine = routines[activeTab];
  const completedCount = currentRoutine.steps.filter((s) => s.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Daily Routines</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {completedCount} of {currentRoutine.steps.length} steps completed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.resetBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => onResetRoutine(activeTab)}
          activeOpacity={0.7}
        >
          <RotateCcw size={12} color={theme.textTertiary} />
          <Text style={[styles.resetBtnText, { color: theme.textTertiary }]}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Routine Tabs */}
      <View style={[styles.tabRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'morning' && [styles.tabBtnActive, { backgroundColor: theme.surfaceElevated }],
          ]}
          onPress={() => setActiveTab('morning')}
          activeOpacity={0.75}
        >
          <Sun size={15} color={activeTab === 'morning' ? '#f59e0b' : theme.textTertiary} />
          <Text
            style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === 'morning' && { color: theme.textPrimary, fontWeight: '700' },
            ]}
          >
            Morning Awakening
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            activeTab === 'evening' && [styles.tabBtnActive, { backgroundColor: theme.surfaceElevated }],
          ]}
          onPress={() => setActiveTab('evening')}
          activeOpacity={0.75}
        >
          <Moon size={15} color={activeTab === 'evening' ? '#6366f1' : theme.textTertiary} />
          <Text
            style={[
              styles.tabText,
              { color: theme.textSecondary },
              activeTab === 'evening' && { color: theme.textPrimary, fontWeight: '700' },
            ]}
          >
            Evening Wind-Down
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline Steps Card */}
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.timelineList}>
          {currentRoutine.steps.map((step, idx) => {
            const isLast = idx === currentRoutine.steps.length - 1;
            return (
              <View key={step.id} style={styles.stepRow}>
                {/* Time & Vertical Connector */}
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, { color: theme.textSecondary }]}>{step.time}</Text>
                  <View
                    style={[
                      styles.stepCircle,
                      { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceElevated },
                      step.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
                    ]}
                  >
                    {step.completed && <Check size={11} color="#ffffff" />}
                  </View>
                  {!isLast && <View style={[styles.connectingLine, { backgroundColor: theme.borderSubtle }]} />}
                </View>

                {/* Step Content */}
                <TouchableOpacity
                  style={[
                    styles.stepBody,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                    step.completed && { opacity: 0.7 },
                  ]}
                  onPress={() => onToggleStep(activeTab, step.id)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.stepTitle,
                      { color: theme.textPrimary },
                      step.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={[styles.stepDetail, { color: theme.textSecondary }]}>{step.detail}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  tabBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  timelineList: {
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeColumn: {
    alignItems: 'center',
    width: 44,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  connectingLine: {
    width: 1.5,
    height: 38,
    marginTop: 2,
  },
  stepBody: {
    flex: 1,
    padding: 11,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDetail: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
