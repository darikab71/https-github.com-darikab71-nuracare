import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../src/context/ProfileContext';
import { useWellnessStore } from '../../src/store';
import { useRemoteConfigStore } from '../../src/store/remoteConfigStore';
import FloatingNatureBackground from '../../src/components/ambient/FloatingNatureBackground';
import { 
  User, 
  MessageCircle, 
  PhoneCall, 
  Sparkles, 
  ChevronRight, 
  CalendarCheck, 
  Pill, 
  Heart, 
  Users, 
  ShieldCheck, 
  Watch, 
  ClipboardList, 
  Download,
  Flame,
  Activity,
  Moon,
  Compass
} from 'lucide-react-native';
import { getDigitalUsage } from '../../src/storage/digitalWellnessStorage';
import { evaluateBurnoutAndRecovery } from '../../src/lib/burnoutRecoveryEngine';
import { computeDigitalBalanceScore } from '../../src/lib/digitalWellnessEngine';
import { checkForAppUpdates } from '../../src/services/versionCheck';

/**
 * Compact circular info teller component for Wellness & Burnout
 */
function CircleInfoTeller({
  label,
  value,
  subtext,
  color,
  bgColor,
}: {
  label: string;
  value: string | number;
  subtext: string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={styles.circleTellerWrap}>
      <View style={[styles.circleRing, { borderColor: color, backgroundColor: bgColor }]}>
        <Text style={[styles.circleVal, { color }]}>{value}</Text>
        <Text style={styles.circleSub}>{subtext}</Text>
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
    </View>
  );
}

export default function AdaptiveHomeScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { checkIns } = useWellnessStore();
  
  const { 
    initialize, 
    syncRemoteConfig 
  } = useRemoteConfigStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initialize();
    syncRemoteConfig();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncRemoteConfig();
    setRefreshing(false);
  };

  // Determine current Time of Day deterministically
  const timeOfDay = useMemo((): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }, []);

  const greeting = useMemo(() => {
    switch (timeOfDay) {
      case 'morning': return 'Good Morning';
      case 'afternoon': return 'Good Afternoon';
      case 'evening': return 'Good Evening';
      case 'night': return 'Rest Well';
    }
  }, [timeOfDay]);

  // Derive active biometrics from local records & store
  const biometrics = useMemo(() => {
    const recentCheckin = checkIns.length > 0 ? checkIns[0] : null;
    return {
      recoveryScore: recentCheckin?.energy ? Math.min(100, recentCheckin.energy * 10 + 15) : 84,
      steps: 6240,
      hydrationLiters: 1.4,
      sleepDuration: '7h 42m'
    };
  }, [checkIns]);

  const digitalUsage = useMemo(() => {
    return getDigitalUsage();
  }, []);

  const digitalScore = useMemo(() => {
    return computeDigitalBalanceScore(digitalUsage);
  }, [digitalUsage]);

  const burnoutAssessment = useMemo(() => {
    const recentCheckin = checkIns.length > 0 ? checkIns[0] : null;
    return evaluateBurnoutAndRecovery({
      dailyCheckin: recentCheckin ? {
        sleep: recentCheckin.sleep || 7,
        stress: recentCheckin.stress || 5,
        energy: recentCheckin.energy || 6,
        mood: recentCheckin.mood || 6,
      } : undefined,
      digitalUsage: {
        totalScreenMinutes: digitalUsage.totalScreenMinutes,
        socialMediaMinutes: digitalUsage.socialMediaMinutes,
        lateNightMinutes: digitalUsage.lateNightMinutes,
      }
    });
  }, [checkIns, digitalUsage]);

  // Today's Insight text based on profile & biometric state
  const todayInsight = useMemo(() => {
    if (burnoutAssessment.state === 'Balanced') {
      return {
        title: "Optimal Equilibrium",
        desc: "Your recovery reserve and digital workload are well-aligned today. Great window for cognitive focus or physical training.",
        tag: "In Flow",
        badgeColor: "#16a34a"
      };
    } else if (burnoutAssessment.state === 'Early Strain') {
      return {
        title: "Early Restorative Cue",
        desc: "Elevated cognitive load noted. A short 10-minute pause or herbal tea will sustain your energy through the afternoon.",
        tag: "Active Care",
        badgeColor: "#f59e0b"
      };
    } else {
      return {
        title: "Nervous System Recovery",
        desc: "High demand detected. Protect your wind-down time tonight and take gentle recovery pacing today.",
        tag: "Restorative Priority",
        badgeColor: "#ef4444"
      };
    }
  }, [burnoutAssessment]);

  // Horizontal Quick Actions List
  const quickActions = [
    { label: 'Checkup', desc: 'Daily vitals', icon: <CalendarCheck size={20} color="#16a34a" />, route: '/(tabs)/checkups' },
    { label: 'Medication', desc: 'Dose schedule', icon: <Pill size={20} color="#0284c7" />, route: '/(tabs)/medication' },
    { label: 'Lifestyle', desc: 'Nutrition & rest', icon: <Heart size={20} color="#e11d48" />, route: '/(tabs)/lifestyle' },
    { label: 'Community', desc: 'Health circle', icon: <Users size={20} color="#7c3aed" />, route: '/(tabs)/community' },
    { label: 'Devices', desc: 'Sync vitals', icon: <Watch size={20} color="#d97706" />, route: '/devices' },
    { label: 'Records', desc: 'Labs & history', icon: <ClipboardList size={20} color="#0d9488" />, route: '/records' },
    { label: 'Privacy Hub', desc: 'Safe storage', icon: <ShieldCheck size={20} color="#475569" />, route: '/privacy-center' },
  ];

  const handleCallNura = () => {
    Alert.alert(
      "Call Nura Voice Companion",
      "Would you like to initiate a real-time conversational voice session with Nura?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start Voice", onPress: () => router.push('/chat') }
      ]
    );
  };

  return (
    <FloatingNatureBackground showSoundToggle={true}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#16a34a']} 
            tintColor="#16a34a"
          />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>
              {greeting}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.subtitleText}>Your holistic health & vitality</Text>
          </View>

          <TouchableOpacity 
            style={styles.profileBtn} 
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
            accessibilityLabel="Open Profile"
          >
            <View style={styles.avatarCircle}>
              {profile?.name ? (
                <Text style={styles.avatarText}>{profile.name[0].toUpperCase()}</Text>
              ) : (
                <User size={20} color="#ffffff" />
              )}
            </View>
            <Text style={styles.profileBtnLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        {/* 1. TOP: Today's Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightTopRow}>
            <View style={styles.insightPill}>
              <Sparkles size={13} color="#16a34a" />
              <Text style={styles.insightPillText}>TODAY'S INSIGHT</Text>
            </View>
            <View style={[styles.stateTag, { backgroundColor: `${todayInsight.badgeColor}15` }]}>
              <View style={[styles.stateDot, { backgroundColor: todayInsight.badgeColor }]} />
              <Text style={[styles.stateTagText, { color: todayInsight.badgeColor }]}>{todayInsight.tag}</Text>
            </View>
          </View>
          <Text style={styles.insightTitle}>{todayInsight.title}</Text>
          <Text style={styles.insightDesc}>{todayInsight.desc}</Text>
        </View>

        {/* 2. 3D ANIMATION RESERVED SPACE + CIRCLE INFO TELLERS (Wellness & Burnout) */}
        <View style={styles.stage3DContainer}>
          {/* Reserved Canvas backdrop for upcoming 3D visual */}
          <View style={styles.canvas3DPlaceholder}>
            <View style={styles.canvasGlow} />
            <Compass size={28} color="rgba(34, 197, 94, 0.35)" />
            <Text style={styles.canvasNote}>Living 3D Balance Space</Text>
          </View>

          {/* Circle Info Tellers overlaying in compact circular method */}
          <View style={styles.circlesRow}>
            <CircleInfoTeller
              label="Wellness Score"
              value={biometrics.recoveryScore}
              subtext="/ 100"
              color="#16a34a"
              bgColor="#f0fdf4"
            />
            <CircleInfoTeller
              label="Burnout State"
              value={burnoutAssessment.state.split(' ')[0]}
              subtext={burnoutAssessment.state.split(' ')[1] || 'State'}
              color={burnoutAssessment.stateColor}
              bgColor={`${burnoutAssessment.stateColor}15`}
            />
            <CircleInfoTeller
              label="Digital Health"
              value={digitalScore.score}
              subtext="/ 100"
              color="#4f46e5"
              bgColor="#eef2ff"
            />
          </View>
        </View>

        {/* 3. UNDER THE ANIMATION: CHAT WITH NURA OR CALL HER */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.chatNuraBtn}
            onPress={() => router.push('/chat')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconWrap}>
              <MessageCircle size={18} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.chatNuraTitle}>Chat with Nura</Text>
              <Text style={styles.chatNuraSub}>Ask anything about your health</Text>
            </View>
            <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.callNuraBtn}
            onPress={handleCallNura}
            activeOpacity={0.85}
          >
            <View style={styles.callIconWrap}>
              <PhoneCall size={18} color="#16a34a" />
            </View>
            <Text style={styles.callNuraText}>Call Nura</Text>
          </TouchableOpacity>
        </View>

        {/* 4. QUICK ACTION CARDS: HORIZONTAL DISPLAY WITH SHIFT SCROLL */}
        <View style={styles.quickSection}>
          <View style={styles.quickHeader}>
            <Text style={styles.quickSectionTitle}>Quick Actions</Text>
            <Text style={styles.quickSectionHint}>Swipe to explore</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            decelerationRate="fast"
            snapToInterval={148}
          >
            {quickActions.map((act, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCardShift}
                onPress={() => router.push(act.route as any)}
                activeOpacity={0.75}
              >
                <View style={styles.actionCardIconWrap}>{act.icon}</View>
                <Text style={styles.actionCardTitle}>{act.label}</Text>
                <Text style={styles.actionCardDesc}>{act.desc}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Check for App Updates */}
        <TouchableOpacity 
          style={styles.updateCheckBtn}
          onPress={() => checkForAppUpdates(true)}
          activeOpacity={0.8}
        >
          <Download size={15} color="#15803d" />
          <Text style={styles.updateCheckBtnText}>Check for Updates</Text>
        </TouchableOpacity>
      </ScrollView>
    </FloatingNatureBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  greetingText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  subtitleText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  profileBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold'
  },
  profileBtnLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 3
  },

  // 1. Today's Insight
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1.5
  },
  insightTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  insightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  insightPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.5
  },
  stateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  stateDot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  stateTagText: {
    fontSize: 11,
    fontWeight: '700'
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4
  },
  insightDesc: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18
  },

  // 2. 3D Space + Circle Info Tellers
  stage3DContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1
  },
  canvas3DPlaceholder: {
    width: '100%',
    height: 110,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 14
  },
  canvasGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  canvasNote: {
    fontSize: 11.5,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 6
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8
  },
  circleTellerWrap: {
    alignItems: 'center'
  },
  circleRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  circleVal: {
    fontSize: 14,
    fontWeight: '900'
  },
  circleSub: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: '600'
  },
  circleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },

  // 3. Action Row: Chat with Nura or Call Her
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  chatNuraBtn: {
    flex: 1.7,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#16a34a',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  actionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatNuraTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800'
  },
  chatNuraSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11
  },
  callNuraBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  callIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  callNuraText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '800'
  },

  // 4. Quick Actions Horizontal Display
  quickSection: {
    marginBottom: 16
  },
  quickHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  quickSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  quickSectionHint: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600'
  },
  horizontalScrollContent: {
    paddingRight: 16,
    gap: 10
  },
  actionCardShift: {
    width: 136,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1
  },
  actionCardIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  actionCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2
  },
  actionCardDesc: {
    fontSize: 11,
    color: '#64748b'
  },

  // Updates Button
  updateCheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    paddingVertical: 10,
    marginTop: 6,
    marginBottom: 14
  },
  updateCheckBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d'
  }
});

