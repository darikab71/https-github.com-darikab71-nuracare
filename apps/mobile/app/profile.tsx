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
} from 'lucide-react-native';
import { TSOM_TYPES } from '../src/lib/ethiopianCalendar';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { setScore } = useWellnessStore();
  const { profile, setProfile, clearProfile } = useProfile();
  
  // Safe active profile with fallback to ensure screen NEVER renders blank
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
      const current = activeProfile.conditions || [];
      if (!current.includes(newCondition.trim())) {
        await setProfile({ conditions: [...current, newCondition.trim()] });
      }
      setNewCondition('');
      setShowAddCondition(false);
    }
  };

  const removeCondition = async (cond: string) => {
    const current = activeProfile.conditions || [];
    const updated = current.filter((c: string) => c !== cond);
    await setProfile({ conditions: updated });
  };

  const setFastingMode = async (mode: string) => {
    await setProfile({ fastingMode: mode });
  };

  const medsList = Array.isArray(activeProfile.medications)
    ? activeProfile.medications
    : (activeProfile.medications || '').split(',').map((s: string) => s.trim()).filter(Boolean);

  const conditionsList = activeProfile.conditions || [];

  const displayName = activeProfile.name || user?.name || 'Nura Explorer';
  const displayAge = activeProfile.age ? `${activeProfile.age} yrs old` : 'Active Member';
  const initialLetter = (displayName[0] || 'N').toUpperCase();

  return (
    <View style={styles.outer}>
      {/* Top Bar Header */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.topNavTitle}>My Health Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Hero Card */}
        <View style={styles.profileHeroCard}>
          <View style={styles.heroRow}>
            <View style={styles.avatarWrap}>
              <Text style={styles.avatarText}>{initialLetter}</Text>
            </View>
            <View style={styles.heroInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userName}>{displayName}</Text>
                <View style={styles.verifiedBadge}>
                  <ShieldCheck size={13} color="#16a34a" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={styles.userSubtitle}>{displayAge} • Confidential Health Vault</Text>
            </View>
          </View>
        </View>

        {/* Health Conditions Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Activity size={18} color="#16a34a" />
              <Text style={styles.sectionTitle}>Focus Conditions</Text>
            </View>
            <TouchableOpacity 
              style={styles.addSmallBtn} 
              onPress={() => setShowAddCondition(!showAddCondition)}
              activeOpacity={0.7}
            >
              <Plus size={14} color="#16a34a" />
              <Text style={styles.addSmallBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {showAddCondition && (
            <View style={styles.inputInlineRow}>
              <TextInput
                style={styles.inlineInput}
                placeholder="e.g. Asthma, High Cholesterol..."
                placeholderTextColor="#94a3b8"
                value={newCondition}
                onChangeText={setNewCondition}
              />
              <TouchableOpacity style={styles.inlineActionBtn} onPress={addCondition}>
                <Text style={styles.inlineActionBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.tagsContainer}>
            {conditionsList.length > 0 ? (
              conditionsList.map((cond: string) => (
                <View key={cond} style={styles.conditionTag}>
                  <Text style={styles.conditionTagText}>{cond}</Text>
                  <TouchableOpacity onPress={() => removeCondition(cond)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={13} color="#15803d" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No specific conditions reported.</Text>
            )}
          </View>
        </View>

        {/* Health Records Vault Link */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleWithIcon}>
            <ClipboardList size={18} color="#16a34a" />
            <Text style={styles.sectionTitle}>Health Records</Text>
          </View>
          <TouchableOpacity 
            style={styles.clickableCardRow} 
            onPress={() => router.push('/records')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconBox}>
              <FileText size={20} color="#16a34a" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowTitle}>Your Historical Vault</Text>
              <Text style={styles.cardRowSub}>Access clinical uploads, labs, and symptom logs</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Medications Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithIcon}>
              <Heart size={18} color="#16a34a" />
              <Text style={styles.sectionTitle}>Active Medications & Supplements</Text>
            </View>
          </View>

          <View style={styles.inputInlineRow}>
            <TextInput
              style={styles.inlineInput}
              placeholder="e.g. Metformin 500mg, Omega-3..."
              placeholderTextColor="#94a3b8"
              value={newMed}
              onChangeText={setNewMed}
            />
            <TouchableOpacity style={styles.inlineActionBtn} onPress={addMed} activeOpacity={0.8}>
              <Plus size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {medsList.length > 0 ? (
              medsList.map((m: string) => (
                <View key={m} style={styles.medicationTag}>
                  <Text style={styles.medicationTagText}>{m}</Text>
                  <TouchableOpacity onPress={() => removeMed(m)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyStateText}>No active medications added.</Text>
            )}
          </View>
        </View>

        {/* Connected Wearables & Health Apps */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleWithIcon}>
            <Watch size={18} color="#16a34a" />
            <Text style={styles.sectionTitle}>Connected Devices</Text>
          </View>
          <TouchableOpacity 
            style={styles.clickableCardRow} 
            onPress={() => router.push('/devices')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIconBox}>
              <Watch size={20} color="#16a34a" />
            </View>
            <View style={styles.cardRowContent}>
              <Text style={styles.cardRowTitle}>Wearables & Sensor Sync</Text>
              <Text style={styles.cardRowSub}>Sync Apple Health, Google Fit, Fitbit, Garmin</Text>
            </View>
            <ChevronRight size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Dietary & Fasting Preferences */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleWithIcon}>
            <Calendar size={18} color="#16a34a" />
            <Text style={styles.sectionTitle}>Diet & Fasting Rhythm</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Nura adjusts personalized nutrition and activity tracking to respect your physiological fasting windows.
          </Text>

          <View style={styles.radioList}>
            <TouchableOpacity
              style={[
                styles.radioItem,
                activeProfile.fastingMode === TSOM_TYPES.NONE && styles.radioItemActive,
              ]}
              onPress={() => setFastingMode(TSOM_TYPES.NONE)}
              activeOpacity={0.75}
            >
              {activeProfile.fastingMode === TSOM_TYPES.NONE ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <Circle size={20} color="#cbd5e1" />
              )}
              <View style={styles.radioTextWrap}>
                <Text style={styles.radioTitle}>Standard Diet</Text>
                <Text style={styles.radioSub}>Regular daily meal schedule without fasting cycle</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioItem,
                activeProfile.fastingMode === TSOM_TYPES.ORTHODOX && styles.radioItemActive,
              ]}
              onPress={() => setFastingMode(TSOM_TYPES.ORTHODOX)}
              activeOpacity={0.75}
            >
              {activeProfile.fastingMode === TSOM_TYPES.ORTHODOX ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <Circle size={20} color="#cbd5e1" />
              )}
              <View style={styles.radioTextWrap}>
                <Text style={styles.radioTitle}>Ethiopian Orthodox Fasting (Tsom)</Text>
                <Text style={styles.radioSub}>Wednesday/Friday & seasonal fasts (pure plant-based)</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioItem,
                activeProfile.fastingMode === TSOM_TYPES.ISLAMIC && styles.radioItemActive,
              ]}
              onPress={() => setFastingMode(TSOM_TYPES.ISLAMIC)}
              activeOpacity={0.75}
            >
              {activeProfile.fastingMode === TSOM_TYPES.ISLAMIC ? (
                <CheckCircle2 size={20} color="#16a34a" />
              ) : (
                <Circle size={20} color="#cbd5e1" />
              )}
              <View style={styles.radioTextWrap}>
                <Text style={styles.radioTitle}>Islamic Fasting (Ramadan / Sunnah)</Text>
                <Text style={styles.radioSub}>Dawn-to-dusk intermittent hydration & meal windows</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Clinical Notes & AI Context */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleWithIcon}>
            <Sparkles size={18} color="#16a34a" />
            <Text style={styles.sectionTitle}>Clinical & AI Context</Text>
          </View>
          <View style={styles.notesBox}>
            <Text style={styles.notesText}>
              {activeProfile.medicalNotes ||
                'No additional medical documents attached. Upload PDFs or lab summaries via the web portal or records vault.'}
            </Text>
          </View>
        </View>

        {/* Sovereign Privacy Vault Info */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconWrap}>
            <Lock size={18} color="#16a34a" />
          </View>
          <View style={styles.privacyTextWrap}>
            <Text style={styles.privacyTitle}>Sovereign Data Protection</Text>
            <Text style={styles.privacyDesc}>
              Your health telemetry is locally encrypted and never shared with third-party advertisers or insurers.
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutBtnText}>Sign Out of NuraCare</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 42,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topNavTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  userSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },

  // Inline Inputs
  inputInlineRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inlineInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0f172a',
  },
  inlineActionBtn: {
    backgroundColor: '#16a34a',
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
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  conditionTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  medicationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  medicationTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },

  // Clickable Navigation Rows
  clickableCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
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
    color: '#0f172a',
  },
  cardRowSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  // Radios
  radioList: {
    gap: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  radioItemActive: {
    borderColor: '#86efac',
    backgroundColor: 'rgba(240, 253, 244, 0.65)',
  },
  radioTextWrap: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  radioSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },

  // Notes Box
  notesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notesText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },

  // Privacy Info Card
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
  },
  privacyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTextWrap: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803d',
  },
  privacyDesc: {
    fontSize: 11.5,
    color: '#166534',
    marginTop: 2,
    lineHeight: 16,
  },

  // Logout Button
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#fecaca',
  },
  logoutBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ef4444',
  },
});
