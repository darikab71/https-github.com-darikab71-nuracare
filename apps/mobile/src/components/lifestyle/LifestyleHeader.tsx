import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface LifestyleHeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenQuickActions: () => void;
}

export default function LifestyleHeader({
  selectedDate,
  onSelectDate,
  onOpenQuickActions,
}: LifestyleHeaderProps) {
  const { theme, isDark } = useTheme();

  // Generate 7 days ending today
  const days = React.useMemo(() => {
    const list = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const isToday = i === 0;
      list.push({
        iso,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday,
      });
    }
    return list;
  }, []);

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Lifestyle</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Build healthier routines, one day at a time.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: theme.accentDeep, borderColor: theme.accent }]}
          onPress={onOpenQuickActions}
          activeOpacity={0.8}
        >
          <Sparkles size={14} color={theme.accent} />
          <Text style={[styles.quickActionBtnText, { color: theme.accent }]}>Quick Log</Text>
        </TouchableOpacity>
      </View>

      {/* 7-Day Date Selector Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateStrip}
      >
        {days.map((d) => {
          const isSelected = selectedDate === d.iso;
          return (
            <TouchableOpacity
              key={d.iso}
              style={[
                styles.datePill,
                { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                isSelected && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              onPress={() => onSelectDate(d.iso)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.datePillDay,
                  { color: theme.textTertiary },
                  isSelected && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                {d.isToday ? 'Today' : d.dayName}
              </Text>
              <Text
                style={[
                  styles.datePillNum,
                  { color: theme.textPrimary },
                  isSelected && { color: '#ffffff', fontWeight: '800' },
                ]}
              >
                {d.dayNum}
              </Text>
              {isSelected && <View style={styles.activeDot} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: '500',
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  datePill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 54,
  },
  datePillDay: {
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  datePillNum: {
    fontSize: 15,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
    marginTop: 3,
  },
});
