import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Target, Timer, Ban, Moon, LineChart } from 'lucide-react-native';

interface QuickActionsBarProps {
  onSelectAction?: (actionId: string) => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({ onSelectAction }) => {
  const { theme } = useTheme();

  const actions = [
    { id: 'focus', label: 'Focus Mode', icon: Target, color: theme.accent },
    { id: 'limit', label: 'Set Limit', icon: Timer, color: theme.warning },
    { id: 'block', label: 'Block App', icon: Ban, color: theme.error },
    { id: 'sleep', label: 'Sleep Mode', icon: Moon, color: theme.info },
    { id: 'insights', label: 'Insights', icon: LineChart, color: theme.accentSecondary },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {actions.map((action) => (
          <TouchableOpacity 
            key={action.id} 
            style={styles.actionButton}
            onPress={() => onSelectAction?.(action.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <action.icon size={24} color={action.color} />
            </View>
            <Text style={[styles.label, { color: theme.textSecondary }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  scrollContent: {
    gap: 16,
    paddingHorizontal: 4,
  },
  actionButton: {
    alignItems: 'center',
    width: 72,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
