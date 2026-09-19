import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Moon, Sun, Smartphone, Sparkles, Check, X, Shield, Eye } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../constants/theme';

interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ThemeOption {
  id: ThemeMode;
  label: string;
  subtitle: string;
  icon: any;
  colorPreview: {
    bg: string;
    surface: string;
    accent: string;
    text: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'system',
    label: 'Match System',
    subtitle: 'Automatically adapts to your device daylight / night schedule',
    icon: Smartphone,
    colorPreview: {
      bg: '#0B100F',
      surface: '#111817',
      accent: '#54C878',
      text: '#F3F7F5',
    },
  },
  {
    id: 'dark',
    label: 'Standard Dark',
    subtitle: 'Professional deep green-charcoal with crisp high-readability text',
    icon: Moon,
    colorPreview: {
      bg: '#0B100F',
      surface: '#111817',
      accent: '#54C878',
      text: '#F3F7F5',
    },
  },
  {
    id: 'night',
    label: 'Calm Night Vision',
    subtitle: 'Softer contrast and reduced brightness for restful late-night reading',
    icon: Eye,
    colorPreview: {
      bg: '#0E1413',
      surface: '#141C1A',
      accent: '#4BB86D',
      text: '#E8EFEB',
    },
  },
  {
    id: 'deep_night',
    label: 'Deep Midnight',
    subtitle: 'Ultra-low emission charcoal for pitch-dark bedrooms',
    icon: Sparkles,
    colorPreview: {
      bg: '#060908',
      surface: '#0B100F',
      accent: '#3DAE63',
      text: '#DDE6E2',
    },
  },
  {
    id: 'light',
    label: 'Botanical Light',
    subtitle: 'Vibrant daytime theme with natural emerald and mint tones',
    icon: Sun,
    colorPreview: {
      bg: '#f8fafc',
      surface: '#ffffff',
      accent: '#16a34a',
      text: '#0f172a',
    },
  },
];

export default function ThemeSelectorModal({ visible, onClose }: ThemeSelectorModalProps) {
  const { themeMode, setThemeMode, theme, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surfaceModal,
              borderColor: theme.border,
            },
          ]}
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconBadge, { backgroundColor: theme.accentGlow }]}>
                <Moon size={18} color={theme.accent} />
              </View>
              <View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>
                  Appearance & Night Vision
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Choose your circadian viewing comfort
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
            >
              <X size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Theme List */}
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {THEME_OPTIONS.map((opt) => {
              const isSelected = themeMode === opt.id;
              const IconComponent = opt.icon;

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor: isSelected
                        ? theme.accentDeep
                        : theme.surfaceElevated,
                      borderColor: isSelected ? theme.accent : theme.borderSubtle,
                    },
                  ]}
                  onPress={() => {
                    setThemeMode(opt.id);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.optionLeft}>
                    {/* Swatch preview */}
                    <View
                      style={[
                        styles.swatchWrap,
                        {
                          backgroundColor: opt.colorPreview.bg,
                          borderColor: opt.colorPreview.accent,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.swatchInner,
                          { backgroundColor: opt.colorPreview.surface },
                        ]}
                      >
                        <View
                          style={[
                            styles.swatchDot,
                            { backgroundColor: opt.colorPreview.accent },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.optionTextWrap}>
                      <View style={styles.optionTitleRow}>
                        <IconComponent
                          size={15}
                          color={isSelected ? theme.accent : theme.textSecondary}
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={[
                            styles.optionLabel,
                            {
                              color: isSelected ? theme.accent : theme.textPrimary,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionSubtitle,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {opt.subtitle}
                      </Text>
                    </View>
                  </View>

                  {/* Radio check */}
                  <View
                    style={[
                      styles.radioCircle,
                      {
                        borderColor: isSelected ? theme.accent : theme.border,
                        backgroundColor: isSelected ? theme.accent : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Night Vision Info Note */}
            <View
              style={[
                styles.infoNote,
                {
                  backgroundColor: theme.accentGlow,
                  borderColor: theme.accentSecondary + '40',
                },
              ]}
            >
              <Shield size={16} color={theme.accent} style={{ marginTop: 2 }} />
              <Text style={[styles.infoNoteText, { color: theme.textSecondary }]}>
                Night Vision palettes reduce harsh contrast and blue spectrum emission to support melatonin synthesis and natural sleep cycles.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.accent }]}
              onPress={onClose}
              activeOpacity={0.88}
            >
              <Text style={styles.doneBtnText}>Apply & Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 22,
    borderWidth: 1,
    maxHeight: '88%',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  swatchWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  swatchInner: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionTextWrap: {
    flex: 1,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 14,
  },
  optionSubtitle: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 3,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 8,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  doneBtn: {
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
