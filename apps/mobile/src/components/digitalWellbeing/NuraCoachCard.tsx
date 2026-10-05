import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Sparkles } from 'lucide-react-native';

interface NuraCoachCardProps {
  message: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const NuraCoachCard: React.FC<NuraCoachCardProps> = ({
  message,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.accentSoft, borderColor: theme.accent }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme.accent }]}>
          <Sparkles size={16} color={theme.surface} />
        </View>
        <Text style={[styles.title, { color: theme.accentDeep }]}>Nura Coach</Text>
      </View>

      <Text style={[styles.message, { color: theme.textPrimary }]}>{message}</Text>

      <View style={styles.actions}>
        {secondaryActionLabel && (
          <TouchableOpacity 
            style={[styles.secondaryButton, { borderColor: theme.accent }]}
            onPress={onSecondaryAction}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.accentDeep }]}>
              {secondaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
        {primaryActionLabel && (
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: theme.accent }]}
            onPress={onPrimaryAction}
          >
            <Text style={[styles.primaryButtonText, { color: theme.surface }]}>
              {primaryActionLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
