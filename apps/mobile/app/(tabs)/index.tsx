import CompanionAvatar3D from '../../src/components/avatar/CompanionAvatar3D';
import AvatarLocomotionOverlay from '../../src/components/avatar/AvatarLocomotionOverlay';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  Modal,
  Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../src/context/ProfileContext';
import { useWellnessStore } from '../../src/store';
import { useRemoteConfigStore } from '../../src/store/remoteConfigStore';
import { DISCOVERY_ITEMS, DiscoveryItem } from '../../src/data/discoveryData';
import { 
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
  Compass,
  Flower2,
  Droplets,
  Coffee,
  Eye,
  X,
  BookOpen,
  Leaf
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
      </View>
      <Text style={styles.circleLabel}>{label}</Text>
      <Text style={styles.circleSub}>{subtext}</Text>
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
  const [discoveryTab, setDiscoveryTab] = useState<'all' | 'herbs' | 'foods' | 'tips'>('all');
  const [selectedDiscovery, setSelectedDiscovery] = useState<DiscoveryItem | null>(null);

  const filteredDiscovery = useMemo(() => {
    if (discoveryTab === 'all') return DISCOVERY_ITEMS;
    return DISCOVERY_ITEMS.filter(item => item.category === discoveryTab);
  }, [discoveryTab]);

  const renderDiscoveryIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Leaf': return <Leaf size={22} color={color} />;
      case 'Flower2': return <Flower2 size={22} color={color} />;
      case 'Flame': return <Flame size={22} color={color} />;
      case 'Droplets': return <Droplets size={22} color={color} />;
      case 'Coffee': return <Coffee size={22} color={color} />;
      case 'Heart': return <Heart size={22} color={color} />;
      case 'Activity': return <Activity size={22} color={color} />;
      case 'Users': return <Users size={22} color={color} />;
      case 'Eye': return <Eye size={22} color={color} />;
      default: return <Sparkles size={22} color={color} />;
    }
  };

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

  // Horizontal Quick Actions List with rich curated photography
  const quickActions = [
    { 
      label: 'Checkup', 
      desc: 'Daily vitals & mood', 
      icon: <CalendarCheck size={18} color="#ffffff" />, 
      route: '/(tabs)/checkups',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Medication', 
      desc: 'Dose schedule & botanicals', 
      icon: <Pill size={18} color="#ffffff" />, 
      route: '/(tabs)/medication',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Lifestyle', 
      desc: 'Nutrition & restorative rest', 
      icon: <Heart size={18} color="#ffffff" />, 
      route: '/(tabs)/lifestyle',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Community', 
      desc: 'Health circles & peers', 
      icon: <Users size={18} color="#ffffff" />, 
      route: '/(tabs)/community',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Devices', 
      desc: 'Sync vitals & wearables', 
      icon: <Watch size={18} color="#ffffff" />, 
      route: '/devices',
      image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Records', 
      desc: 'Secure labs & health history', 
      icon: <ClipboardList size={18} color="#ffffff" />, 
      route: '/records',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80'
    },
    { 
      label: 'Privacy Hub', 
      desc: 'Sovereign vault & control', 
      icon: <ShieldCheck size={18} color="#ffffff" />, 
      route: '/privacy-center',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    },
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
    <View style={styles.screenWrapper}>
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
        </View>

        {/* 1. TOP: 2-Line Today's Insight Banner */}
        <View style={styles.insightCardSlim}>
          <View style={styles.insightSlimLeft}>
            <View style={styles.insightSlimPill}>
              <Sparkles size={12} color="#16a34a" />
              <Text style={styles.insightSlimPillText}>INSIGHT</Text>
            </View>
            <Text style={styles.insightSlimTitle} numberOfLines={2}>
              {todayInsight.title}: <Text style={styles.insightSlimDesc}>{todayInsight.desc}</Text>
            </Text>
          </View>
          <View style={[styles.stateDotSlim, { backgroundColor: todayInsight.badgeColor }]} />
        </View>

        {/* 2. WIDE OPEN 3D ANIMATION BALANCE SPACE (No card, pure wide open canvas) */}
        <View style={styles.stage3DWideSpace}>
          <View style={styles.canvas3DOpenArea}>
            <CompanionAvatar3D />
          </View>

          {/* Compact Circle Info Tellers below wide 3D space */}
          <View style={styles.circlesRowCompact}>
            <CircleInfoTeller
              label="Wellness"
              value={biometrics.recoveryScore}
              subtext="Optimal"
              color="#16a34a"
              bgColor="#f0fdf4"
            />
            <CircleInfoTeller
              label="Burnout"
              value={burnoutAssessment.state.split(' ')[0]}
              subtext={burnoutAssessment.state.split(' ')[1] || 'State'}
              color={burnoutAssessment.stateColor}
              bgColor={`${burnoutAssessment.stateColor}15`}
            />
            <CircleInfoTeller
              label="Digital"
              value={digitalScore.score}
              subtext="Balanced"
              color="#4f46e5"
              bgColor="#eef2ff"
            />
          </View>
        </View>

        {/* 3. UNDER THE ANIMATION: CHAT WITH NURA OR CALL HER */}
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.chatNuraBtn}
            onPress={handleChatWithNura}
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

        {/* 4. QUICK ACTION CARDS: HORIZONTAL DISPLAY WITH IMAGE & HOVERING TEXT */}
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
            snapToInterval={222}
          >
            {quickActions.map((act, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCardShift}
                onPress={() => router.push(act.route as any)}
                activeOpacity={0.82}
              >
                {/* Background Image */}
                <Image 
                  source={{ uri: act.image }} 
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                {/* Semi-transparent Emerald Glass & Dark Overlay */}
                <View style={styles.actionCardImageOverlay} />

                {/* Text and Icon Hovering Cleanly Over Image */}
                <View style={styles.actionCardContentHover}>
                  <View style={styles.actionCardTopRowHover}>
                    <View style={styles.actionCardIconWrapHover}>
                      {act.icon}
                    </View>
                    <View style={styles.shiftBadgeHover}>
                      <Text style={styles.shiftBadgeTextHover}>0{index + 1}</Text>
                    </View>
                  </View>

                  <View style={styles.actionTextHoverWrap}>
                    <Text style={styles.actionCardTitleHover}>{act.label}</Text>
                    <Text style={styles.actionCardDescHover} numberOfLines={2}>{act.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. NATURAL DISCOVERY (Ported from Web with Quick Action Aesthetic) */}
        <View style={styles.discoverySection}>
          <View style={styles.discoveryHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#16a34a" />
              <Text style={styles.discoverySectionTitle}>Natural Discovery</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/discovery')} activeOpacity={0.7}>
              <Text style={styles.discoverySectionHint}>View All →</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterPillsRow}
          >
            {[
              { id: 'all', label: 'All Remedies' },
              { id: 'herbs', label: 'Ethiopian Herbs' },
              { id: 'foods', label: 'Superfoods' },
              { id: 'tips', label: 'Daily Habits' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterPill,
                  discoveryTab === tab.id && styles.filterPillActive,
                ]}
                onPress={() => setDiscoveryTab(tab.id as any)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    discoveryTab === tab.id && styles.filterPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Discovery Half-Cards (Like Quick Actions with Image Background & Hovering Text) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            decelerationRate="fast"
            snapToInterval={168}
          >
            {filteredDiscovery.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.discoveryHalfCard}
                onPress={() => setSelectedDiscovery(item)}
                activeOpacity={0.82}
              >
                {/* Background Image */}
                <Image 
                  source={{ uri: item.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pfefferminze_natur_peppermint.jpg/400px-Pfefferminze_natur_peppermint.jpg' }} 
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
                {/* Semi-transparent Emerald/Dark Glass Overlay */}
                <View style={styles.actionCardImageOverlay} />

                {/* Text Hovering over Image */}
                <View style={styles.discoveryHalfContentHover}>
                  <View style={styles.discoveryHalfBadge}>
                    <Text style={styles.discoveryHalfBadgeText}>{item.categoryLabel.toUpperCase()}</Text>
                  </View>

                  <View style={styles.discoveryHalfTextWrap}>
                    <Text style={styles.discoveryHalfTitleHover} numberOfLines={1}>
                      {item.name.split('(')[0].trim()}
                    </Text>
                    <Text style={styles.discoveryHalfDescHover} numberOfLines={2}>
                      {item.benefit}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Discover More Button */}
        <TouchableOpacity 
          style={styles.discoverMoreBtn}
          onPress={() => router.push('/discovery')}
          activeOpacity={0.8}
        >
          <View style={styles.discoverMoreIconCircle}>
            <Compass size={18} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.discoverMoreBtnTitle}>Discover More</Text>
            <Text style={styles.discoverMoreBtnSubtitle}>Explore Ethiopian remedies, superfoods & daily habits</Text>
          </View>
          <ChevronRight size={18} color="#16a34a" />
        </TouchableOpacity>
      </ScrollView>

      {/* Discovery Detail Modal */}
      {selectedDiscovery && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedDiscovery(null)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedDiscovery(null)}
          >
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconWrap, { backgroundColor: `${selectedDiscovery.badgeColor}15` }]}>
                  {renderDiscoveryIcon(selectedDiscovery.iconName, selectedDiscovery.badgeColor)}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.modalTitle}>{selectedDiscovery.name}</Text>
                  <Text style={[styles.modalCategory, { color: selectedDiscovery.badgeColor }]}>
                    {selectedDiscovery.categoryLabel}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDiscovery(null)} style={styles.modalCloseBtn}>
                  <X size={18} color="#64748b" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalBenefitText}>{selectedDiscovery.benefit}</Text>

              <View style={styles.modalTagsRow}>
                {selectedDiscovery.tags.map((tag) => (
                  <View key={tag} style={styles.modalTagChip}>
                    <Text style={styles.modalTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalChatBtn}
                onPress={() => {
                  const remedyName = selectedDiscovery.name;
                  setSelectedDiscovery(null);
                  router.push('/chat');
                }}
                activeOpacity={0.85}
              >
                <Sparkles size={16} color="#ffffff" />
                <Text style={styles.modalChatBtnText}>Ask Nura About {selectedDiscovery.name}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
          <AvatarLocomotionOverlay
        visible={locomotionActive}
        character="nura"
        onComplete={handleLocomotionComplete}
      />
    </View>
  );
}