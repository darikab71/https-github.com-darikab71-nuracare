import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Check, Plus, X, Sparkles, Moon, Activity, Droplets, Wind, Leaf } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LifestyleGoal } from '../../storage/lifestyleStorage';

interface TodaysGoalsSectionProps {
  goals: LifestyleGoal[];
  onToggleGoal: (goalId: string) => void;
  onAddGoal: (title: string, category: LifestyleGoal['category'], target?: string) => void;
}

export default function TodaysGoalsSection({
  goals,
  onToggleGoal,
  onAddGoal,
}: TodaysGoalsSectionProps) {
  const { theme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedCat, setSelectedCat] = useState<LifestyleGoal['category']>('movement');

  const completedCount = goals.filter((g) => g.completed).length;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    onAddGoal(newTitle.trim(), selectedCat);
    setNewTitle('');
    setModalVisible(false);
  };

  const getCatIcon = (cat: LifestyleGoal['category']) => {
    switch (cat) {
      case 'sleep': return <Moon size={14} color="#6366f1" />;
      case 'movement': return <Activity size={14} color="#10b981" />;
      case 'hydration': return <Droplets size={14} color="#0ea5e9" />;
      case 'mindfulness': return <Wind size={14} color="#f59e0b" />;
      case 'nutrition': return <Leaf size={14} color="#16a34a" />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Goals</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            {completedCount} of {goals.length} completed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Plus size={14} color={theme.accent} />
          <Text style={[styles.addBtnText, { color: theme.accent }]}>Add Goal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {goals.map((goal) => {
          return (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalItem,
                { backgroundColor: theme.surface, borderColor: theme.border },
                goal.completed && { opacity: 0.75 },
              ]}
              onPress={() => onToggleGoal(goal.id)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.borderSubtle, backgroundColor: theme.surfaceElevated },
                  goal.completed && { backgroundColor: theme.accent, borderColor: theme.accent },
                ]}
              >
                {goal.completed && <Check size={13} color="#ffffff" />}
              </View>

              <View style={styles.goalContent}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.goalTitle,
                      { color: theme.textPrimary },
                      goal.completed && { textDecorationLine: 'line-through', color: theme.textTertiary },
                    ]}
                  >
                    {goal.title}
                  </Text>
                </View>
                {goal.target && (
                  <View style={styles.metaRow}>
                    {getCatIcon(goal.category)}
                    <Text style={[styles.targetText, { color: theme.textSecondary }]}>{goal.target}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Add Goal Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Create Daily Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="e.g. 20 min morning stretching"
              placeholderTextColor={theme.placeholderText}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />

            <Text style={[styles.catLabel, { color: theme.textSecondary }]}>Category</Text>
            <View style={styles.catRow}>
              {(['movement', 'hydration', 'sleep', 'mindfulness', 'nutrition'] as const).map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                    selectedCat === c && { backgroundColor: theme.accentDeep, borderColor: theme.accent },
                  ]}
                  onPress={() => setSelectedCat(c)}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: theme.textSecondary },
                      selectedCat === c && { color: theme.accent, fontWeight: '700' },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={handleCreate}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: 12,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  targetText: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 16,
  },
  catLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 11.5,
    textTransform: 'capitalize',
  },
  saveBtn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
