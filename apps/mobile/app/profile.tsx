import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore, useWellnessStore } from '../src/store';
import { useProfile } from '../src/context/ProfileContext';
import { useTheme } from '../src/context/ThemeContext';
import {
  User,
  ClipboardList,
  Watch,
  LogOut,
  ChevronRight,
  X,
  Plus,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ShieldCheck,
  Heart,
  FileText,
  Activity,
  Sparkles,
  Calendar,
  Lock,
  Moon,
  Sun,
  Eye,
  Smartphone,
  Sliders,
} from 'lucide-react-native';
import { TSOM_TYPES } from '../src/lib/ethiopianCalendar';
import ThemeSelectorModal from '../src/components/theme/ThemeSelectorModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { setScore } = useWellnessStore();
  const { profile, setProfile, clearProfile } = useProfile();
  const { theme, isDark, themeMode, setThemeMode, activeTheme } = useTheme();
  
  const [showThemeModal, setShowThemeModal] = useState(false);

  // Safe active profile with fallback
  const activeProfile = profile || {
    name: user?.name || 'Nura Explorer',
    age: 28,
    conditions: ['Hypertension Prevention', 'Circadian Optimization'],
    medications: 'Magnesium Glycinate 400mg, Vitamin D3 2000IU',
    fastingMode: TSOM_TYPES.ORTHODOX,
    medicalNotes: 'Baseline wellness assessment completed. Priority: Sleep rhythm & cardiovascular longevity.',
  };

  // Medication form state
  const [newMed, setNewMed] = useState('');
  // Conditions form state
  const [newCondition, setNewCondition] = useState('');
  const [showAddCondition, setShowAddCondition] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of NuraCare?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          clearProfile();
          setUser(null);
          setScore(100);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const addMed = async () => {
    if (newMed.trim()) {
      const rawMeds = activeProfile.medications || '';
      const meds = Array.isArray(rawMeds)
        ? rawMeds
        : rawMeds.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      if (!meds.includes(newMed.trim())) {
        const updatedMeds = [...meds, newMed.trim()].join(', ');
        await setProfile({ medications: updatedMeds });
      }
      setNewMed('');
    }
  };

  const removeMed = async (med: string) => {
    const rawMeds = activeProfile.medications || '';
    const meds = Array.isArray(rawMeds)
      ? rawMeds
      : rawMeds.split(',').map((s: string) => s.trim()).filter(Boolean);
    
    const updatedMeds = meds.filter((m: string) => m !== med).join(', ');
    await setProfile({ medications: updatedMeds });
  };

  const addCondition = async () => {
    if (newCondition.trim()) {
      const conds = activeProfile.conditions || [];
      if (!conds.includes(newCondition.trim())) {
        await setProfile({ conditions: [...conds, newCondition.trim()] });
      }
      setNewCondition('');
      setShowAddCondition(false);
    }
  };

  const removeCondition = async (cond: string) => {
    const conds = activeProfile.conditions || [];
    await setProfile({ conditions: conds.filter((c: string) => c !== cond) });
  };

  const handleFastingChange = async (mode: string) => {
    await setProfile({ fastingMode: mode });
  };

  const rawMeds = activeProfile.medications || '';
  const medsList = Array.isArray(rawMeds)
    ? rawMeds
    : rawMeds.split(',').map((s: string) => s.trim()).filter(Boolean);

  const conditionsList = activeProfile.conditions || [];
  const displayName = activeProfile.name || user?.name || 'Nura Explorer';
  const displayAge = activeProfile.age ? `${activeProfile.age} yrs` : 'Adult';
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'N';

  const themePills = [
    { id: 'system', label: 'System', icon: Smartphone },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'night', label: 'Night Vision', icon: Eye },
    { id: 'deep_night', label: 'Deep Midnight', icon: Sparkles },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  return (
    <View style={[styles.outer, { backgroundColor: theme.background }]}>
      {/* Top Custom Navigation Header */}
      <View style={[styles.topNav, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.topNavTitle, { color: theme.textPrimary }]}>My Health Profile</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.surfaceElevated }]}
          onPress={() => setShowThemeModal(true)}
          activeOpacity={0.7}
        >
          <Sliders size={18} color={theme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <View style={[styles.profileHeroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.heroRow}>
            <View style={[styles.avatarWrap, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={[styles.userName, { color: theme.textPrimary }]}>{displayName}</Text>
                <View style={[styles.verifiedBadge, { backgroundColor: theme.accentGlow }]}>
                  <ShieldCheck size={13} color={theme.accent} />
                  <Text style={[styles.verifiedText, { color: theme.accent }]}>Verified</Text>
                </View>
              </View>
              <Text style={[styles.userSubtitle, { color: theme.textSecondary }]}>{displayAge} • Confidential Health Vault</Text>
            </View>
          </View>
        </View>

        {/* Appearance & Night Vision Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Moon size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Appearance & Night Vision</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addSmallBtn, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]}
              onPress={() => setShowThemeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.addSmallBtnText, { color: theme.accent }]}>Customize</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Circadian-friendly dark and night themes reduce blue emission and eye strain.
          </Text>

          {/* Theme Mode Quick Switcher Pills */}
          <View style={styles.pillsRow}>
            {themePills.map((opt) => {
              const active = themeMode === opt.id;
              const IconComp = opt.icon;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.themePill,
                    {
                      backgroundColor: active ? theme.accentDeep : theme.surfaceElevated,
                      borderColor: active ? theme.accent : theme.borderSubtle,
                    },
                  ]}
                  onPress={() => setThemeMode(opt.id as any)}
                  activeOpacity={0.8}
                >
                  <IconComp size={14} color={active ? theme.accent : theme.textSecondary} />
                  <Text
                    style={[
                      styles.themePillText,
                      {
                        color: active ? theme.accent : theme.textPrimary,
                        fontWeight: active ? '700' : '600',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Health Conditions Section */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Activity size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Focus Conditions</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addSmallBtn, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]} 
              onPress={() => setShowAddCondition(!showAddCondition)}
              activeOpacity={0.7}
            >
              <Plus size={14} color={theme.accent} />
              <Text style={[styles.addSmallBtnText, { color: theme.accent }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {showAddCondition && (
            <View style={styles.inputInlineRow}>
              <TextInput
                style={[
                  styles.inlineInput,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder,
                    color: theme.inputText,
                  },
                ]}
                placeholder="e.g. Asthma, High Cholesterol..."
                placeholderTextColor={theme.placeholderText}
                value={newCondition}
                onChangeText={setNewCondition}
              />
              <TouchableOpacity
                style={[styles.inlineActionBtn, { backgroundColor: theme.accent }]}
                onPress={addCondition}
              >
                <Text style={styles.inlineActionBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {conditionsList.length > 0 ? (
              conditionsList.map((cond: string) => (
                <View
                  key={cond}
                  style={[
                    styles.conditionTag,
                    {
                      backgroundColor: theme.accentDeep,
                      borderColor: theme.accentSecondary + '50',
                    },
                  ]}
                >
                  <Text style={[styles.conditionTagText, { color: theme.textPrimary }]}>{cond}</Text>
                  <TouchableOpacity onPress={() => removeCondition(cond)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={13} color={theme.accent} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>No specific conditions reported.</Text>
            )}
          </View>
        </View>

        {/* Health Records Vault Link */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionTitleWithIcon}>
            <ClipboardList size={18} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Health Records</Text>
          </View>
          <TouchableOpacity 
            style={[styles.clickableCardRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]} 
            onPress={() => router.push('/records')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIconBox, { backgroundColor: theme.accentGlow }]}>
              <FileText size={20} color={theme.accent} />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={[styles.cardRowTitle, { color: theme.textPrimary }]}>Your Historical Vault</Text>
              <Text style={[styles.cardRowSub, { color: theme.textSecondary }]}>Access clinical uploads, labs, and symptom logs</Text>
            </View>
            <ChevronRight size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Medications Management */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Heart size={18} color={theme.accent} />
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Medications & Supplements</Text>
            </View>
          </View>

          <View style={styles.inputInlineRow}>
            <TextInput
              style={[
                styles.inlineInput,
                {
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                  color: theme.inputText,
                },
              ]}
              placeholder="e.g. Metformin 500mg, Omega-3..."
              placeholderTextColor={theme.placeholderText}
              value={newMed}
              onChangeText={setNewMed}
            />
            <TouchableOpacity
              style={[styles.inlineActionBtn, { backgroundColor: theme.accent }]}
              onPress={addMed}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.medsList}>
            {medsList.length > 0 ? (
              medsList.map((med: string) => (
                <View
                  key={med}
                  style={[
                    styles.medItemRow,
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.borderSubtle,
                    },
                  ]}
                >
                  <View style={styles.medLeft}>
                    <View style={[styles.medDot, { backgroundColor: theme.accent }]} />
                    <Text style={[styles.medText, { color: theme.textPrimary }]}>{med}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeMed(med)} style={styles.medRemoveBtn}>
                    <X size={15} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyStateText, { color: theme.textTertiary }]}>No active medications tracked.</Text>
            )}
          </View>
        </View>

        {/* Circadian & Cultural Fasting Mode */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionTitleWithIcon}>
            <Calendar size={18} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cultural & Metabolic Fasting Mode</Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
            Aligns Nura's meal timing, hydration prompts, and nutritional suggestions with your tradition.
          </Text>

          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                {
                  backgroundColor: activeProfile.fastingMode === TSOM_TYPES.ORTHODOX ? theme.accentDeep : theme.surfaceElevated,
                  borderColor: activeProfile.fastingMode === TSOM_TYPES.ORTHODOX ? theme.accent : theme.borderSubtle,
                },
              ]}
              onPress={() => handleFastingChange(TSOM_TYPES.ORTHODOX)}
              activeOpacity={0.8}
            >
              {activeProfile.fastingMode === TSOM_TYPES.ORTHODOX ? (
                <CheckCircle2 size={20} color={theme.accent} />
              ) : (
                <Circle size={20} color={theme.textTertiary} />
              )}
              <View style={styles.radioTextWrap}>
                <Text style={[styles.radioTitle, { color: theme.textPrimary }]}>Orthodox Christian (Tsom)</Text>
                <Text style={[styles.radioSub, { color: theme.textSecondary }]}>Periodic plant-based periods & daytime fasting intervals</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                {
                  backgroundColor: activeProfile.fastingMode === TSOM_TYPES.ISLAMIC ? theme.accentDeep : theme.surfaceElevated,
                  borderColor: activeProfile.fastingMode === TSOM_TYPES.ISLAMIC ? theme.accent : theme.borderSubtle,
                },
              ]}
              onPress={() => handleFastingChange(TSOM_TYPES.ISLAMIC)}
              activeOpacity={0.8}
            >
              {activeProfile.fastingMode === TSOM_TYPES.ISLAMIC ? (
                <CheckCircle2 size={20} color={theme.accent} />
              ) : (
                <Circle size={20} color={theme.textTertiary} />
              )}
              <View style={styles.radioTextWrap}>
                <Text style={[styles.radioTitle, { color: theme.textPrimary }]}>Islamic Fasting (Ramadan / Sunnah)</Text>
                <Text style={[styles.radioSub, { color: theme.textSecondary }]}>Dawn-to-dusk intermittent hydration & meal windows</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clinical Notes & AI Context */}
        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.sectionTitleWithIcon}>
            <Sparkles size={18} color={theme.accent} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Clinical & AI Context</Text>
          </View>
          <View style={[styles.notesBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <Text style={[styles.notesText, { color: theme.textSecondary }]}>
              {activeProfile.medicalNotes ||
                'No additional medical documents attached. Upload PDFs or lab summaries via the web portal or records vault.'}
            </Text>
          </View>
        </View>

        {/* Sovereign Privacy Vault Info */}
        <View style={[styles.privacyCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
          <View style={[styles.privacyIconWrap, { backgroundColor: theme.accentGlow }]}>
            <Lock size={18} color={theme.accent} />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>Sovereign Data Protection</Text>
            <Text style={[styles.privacyDesc, { color: theme.textSecondary }]}>
              Your health telemetry is locally encrypted and never shared with third-party advertisers or insurers.
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.errorBackground, borderColor: theme.error + '40' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={theme.error} />
          <Text style={[styles.logoutBtnText, { color: theme.error }]}>Sign Out of NuraCare</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 50,
  },

  // Hero Card
  profileHeroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  userSubtitle: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: '500',
  },

  // Section Cards
  sectionCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  themePillText: {
    fontSize: 12,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Inline Inputs
  inputInlineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inlineInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
  },
  inlineActionBtn: {
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  conditionTagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyStateText: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 4,
  },

  // Vault Row
  clickableCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 6,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardRowContent: {
    flex: 1,
  },
  cardRowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  cardRowSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Meds
  medsList: {
    gap: 8,
  },
  medItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  medLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  medDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  medText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
  medRemoveBtn: {
    padding: 4,
  },

  // Fasting Radio
  radioGroup: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  radioTextWrap: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  radioSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Notes
  notesBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Privacy Card
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    marginBottom: 20,
  },
  privacyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTextWrap: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  privacyDesc: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 30,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
