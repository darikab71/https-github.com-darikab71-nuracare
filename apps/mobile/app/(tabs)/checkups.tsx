import React, { useState, useEffect } from 'react';
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
import {
  CalendarCheck,
  CheckCircle2,
  Smile,
  Activity,
  Moon,
  Flame,
  Droplets,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Award,
  Sun,
  Compass,
  CloudRain,
  Cloud,
  Zap,
  BatteryCharging,
  Battery,
  ShieldCheck,
  Shield,
  Leaf,
  Clock,
  Heart,
  AlertTriangle,
} from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { saveCheckin, getCheckins } from '../../src/storage/checkinStorage';
import { getCheckups, saveCheckup, deleteCheckup } from '../../src/storage/checkupsStorage';
import { useTheme } from '../../src/context/ThemeContext';

const MODERN_MOODS = [
  { id: 'radiant', label: 'Radiant', sub: 'High vitality', icon: Sun, val: 5, color: '#16a34a' },
  { id: 'joyful', label: 'Joyful', sub: 'Positive & light', icon: Smile, val: 4, color: '#22c55e' },
  { id: 'balanced', label: 'Balanced', sub: 'Calm & centered', icon: Compass, val: 3, color: '#0ea5e9' },
  { id: 'low', label: 'Low Energy', sub: 'Need warmth', icon: Moon, val: 2, color: '#f59e0b' },
  { id: 'strained', label: 'Strained', sub: 'Gentle pause', icon: CloudRain, val: 1, color: '#ef4444' },
];

const ENERGY_LEVELS = [
  { label: 'Recharge', pct: '25%', icon: Battery, val: 1 },
  { label: 'Steady', pct: '50%', icon: BatteryCharging, val: 2 },
  { label: 'Active', pct: '75%', icon: Zap, val: 3 },
  { label: 'Peak', pct: '100%', icon: Flame, val: 4 },
];

const SLEEP_CARDS = [
  { label: '< 5 hrs', icon: Cloud, desc: 'Short nap', hours: 4 },
  { label: '5-6 hrs', icon: Moon, desc: 'Light rest', hours: 6 },
  { label: '7-8 hrs', icon: Sparkles, desc: 'Optimal window', hours: 7.5 },
  { label: '8+ hrs', icon: Clock, desc: 'Deep recovery', hours: 9 },
];

const STRESS_ZONES = [
  { label: 'Zen State', desc: 'Restful nervous flow', icon: ShieldCheck, val: 2, color: '#16a34a' },
  { label: 'Gentle Flow', desc: 'Mild baseline', icon: Leaf, val: 4, color: '#0ea5e9' },
  { label: 'Active Load', desc: 'High mental demand', icon: Activity, val: 7, color: '#f59e0b' },
  { label: 'Elevated Strain', desc: 'Requires wind-down', icon: AlertCircle, val: 9, color: '#ef4444' },
];

const BODY_COMFORTS = [
  { label: 'Comfortable', sub: 'Feeling balanced', icon: Heart, val: 'None', color: '#16a34a' },
  { label: 'Mild Tension', sub: 'Neck or shoulders', icon: Activity, val: 'Mild', color: '#0284c7' },
  { label: 'Stiffness', sub: 'Joints or posture', icon: Shield, val: 'Moderate', color: '#f59e0b' },
  { label: 'Acute Discomfort', sub: 'Needs attention', icon: AlertTriangle, val: 'Severe', color: '#ef4444' },
];

export default function CheckupsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { checkIns, addCheckIn, loadWellnessData } = useWellnessStore();

  // Top Section: 'daily' vs 'clinical'
  const [section, setSection] = useState<'daily' | 'clinical'>('daily');

  // Form State
  const [mood, setMood] = useState(4);
  const [energy, setEnergy] = useState(3);
  const [sleepHours, setSleepHours] = useState(7.5);
  const [stress, setStress] = useState(3);
  const [pain, setPain] = useState('None');
  const [waterCups, setWaterCups] = useState(6);
  const [savedToday, setSavedToday] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  // Clinical Planner State
  const [clinicalCheckups, setClinicalCheckups] = useState<any[]>([]);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [visitName, setVisitName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  useEffect(() => {
    loadWellnessData();
    loadClinicalData();

    // Check if user logged today
    const today = new Date().toISOString().split('T')[0];
    const todayLog = getCheckins().find(c => c.date === today);
    if (todayLog) {
      setMood(todayLog.mood || 4);
      setEnergy(todayLog.energy || 3);
      setSleepHours(todayLog.sleep || 7.5);
      setStress(todayLog.stress || 3);
      setSavedToday(true);
    }
  }, []);

  const loadClinicalData = () => {
    setClinicalCheckups(getCheckups());
  };

  const handleSaveDailyCheckup = () => {
    const today = new Date().toISOString().split('T')[0];

    const checkinEntry: any = {
      id: 'chk_' + Date.now(),
      date: today,
      mood,
      energy,
      sleep: sleepHours,
      stress,
      tension: stress > 6 ? 'high' : stress > 3 ? 'medium' : 'low',
      urgency: stress > 7 || pain === 'Severe' ? 'high' : 'low',
      tags: [pain !== 'None' ? `Body: ${pain}` : '', `Hydration: ${waterCups} cups`].filter(Boolean),
    };

    saveCheckin(checkinEntry);
    addCheckIn(checkinEntry);
    setSavedToday(true);

    const affirmations = [
      "Daily check-in logged. +25 Vitality XP credited to your rhythm streak.",
      "Biological recovery baseline updated with your latest wellness signals.",
      "Self-care signals recorded. Restorative balance profile calibrated.",
    ];
    setCelebrationMessage(affirmations[Math.floor(Math.random() * affirmations.length)]);
  };

  const handleSaveClinicalVisit = () => {
    if (!visitName.trim()) {
      Alert.alert('Required Field', 'Please enter a visit or checkup title.');
      return;
    }
    const newVisit = {
      name: visitName.trim(),
      doctor: doctorName.trim(),
      date_logged: new Date().toISOString().split('T')[0],
      notes: visitNotes.trim(),
      next_visit: nextVisitDate.trim() || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      source: 'manual',
    };
    saveCheckup(newVisit);
    setShowAddVisit(false);
    setVisitName('');
    setDoctorName('');
    setVisitNotes('');
    setNextVisitDate('');
    loadClinicalData();
  };

  const handleDeleteClinical = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to remove this visit record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCheckup(id);
          loadClinicalData();
        },
      },
    ]);
  };

  // 7-day trend calculations
  const allLogs = getCheckins();
  const recentLogs = allLogs.slice(0, 7);
  const avgMood = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.mood || 0), 0) / recentLogs.length).toFixed(1) : '4.2';
  const avgEnergy = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.energy || 0), 0) / recentLogs.length).toFixed(1) : '3.4';
  const avgSleep = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.sleep || 0), 0) / recentLogs.length).toFixed(1) : '7.6';
  const avgStress = recentLogs.length > 0 ? (recentLogs.reduce((a, b) => a + (b.stress || 0), 0) / recentLogs.length).toFixed(1) : '2.8';

  const defaultPlannerItems = [
    { name: 'Annual Physical Exam', freq: 'Yearly', desc: 'Comprehensive metabolic panel & vitals check.' },
    { name: 'Dental Check & Cleaning', freq: 'Every 6 months', desc: 'Preventive oral health screening.' },
    { name: 'Vision & Eye Exam', freq: 'Every 1-2 years', desc: 'Acuity check and ocular health review.' },
    { name: 'Cardiovascular Review', freq: 'Yearly', desc: 'Resting ECG & lipid balance screening.' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Checkup</Text>
          <Text style={styles.subtitle}>Self-care signals & biological rhythm</Text>
        </View>
        <TouchableOpacity
          style={styles.aiHeaderBtn}
          onPress={() => router.push('/chat')}
          activeOpacity={0.8}
        >
          <Bot size={17} color="#16a34a" />
          <Text style={styles.aiHeaderBtnText}>Ask Nura</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Control */}
      <View style={[styles.segmentedControl, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.segmentBtn, section === 'daily' && [styles.segmentBtnActive, { backgroundColor: theme.surface }]]}
          onPress={() => setSection('daily')}
          activeOpacity={0.7}
        >
          <Smile size={16} color={section === 'daily' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, { color: theme.textSecondary }, section === 'daily' && { color: theme.accent, fontWeight: '700' }]}>
            Daily Self-Ritual
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, section === 'clinical' && [styles.segmentBtnActive, { backgroundColor: theme.surface }]]}
          onPress={() => setSection('clinical')}
          activeOpacity={0.7}
        >
          <CalendarCheck size={16} color={section === 'clinical' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.segmentText, { color: theme.textSecondary }, section === 'clinical' && { color: theme.accent, fontWeight: '700' }]}>
            Clinical Planner ({clinicalCheckups.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {section === 'daily' ? (
          <View>
            {/* Gamified Hero Card: Streak & XP (Pure Modern Icons) */}
            <View style={[styles.streakHeroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.streakTopRow}>
                <View style={styles.streakBadge}>
                  <Flame size={15} color="#ef4444" />
                  <Text style={styles.streakBadgeText}>5-DAY STREAK</Text>
                </View>
                <View style={styles.xpBadge}>
                  <Award size={14} color="#16a34a" />
                  <Text style={styles.xpBadgeText}>Level 3 Vitality</Text>
                </View>
              </View>
              <Text style={[styles.streakHeroTitle, { color: theme.textPrimary }]}>Natural Biological Rhythm</Text>
              <Text style={[styles.streakHeroSub, { color: theme.textSecondary }]}>
                Tune into your physiological cues today to earn +25 Vitality XP.
              </Text>
            </View>

            {/* Celebration Notice if logged */}
            {celebrationMessage && (
              <View style={styles.celebrationBanner}>
                <Sparkles size={17} color="#16a34a" />
                <Text style={styles.celebrationBannerText}>{celebrationMessage}</Text>
              </View>
            )}

            {/* 1. Modern Mood Avatars (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Smile size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Emotional & Mental State</Text>
                </View>
                <Text style={styles.hintBadge}>Select active state</Text>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.moodScrollRow}
              >
                {MODERN_MOODS.map((item) => {
                  const isSelected = mood === item.val;
                  const IconComp = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.moodAvatarCard,
                        isSelected && {
                          borderColor: item.color,
                          backgroundColor: `${item.color}14`,
                        },
                      ]}
                      onPress={() => setMood(item.val)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.moodIconWrap, { backgroundColor: `${item.color}18` }]}>
                        <IconComp size={24} color={item.color} />
                      </View>
                      <Text style={[styles.moodAvatarTitle, isSelected && { color: item.color, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={styles.moodAvatarSub}>{item.sub}</Text>
                      {isSelected && (
                        <View style={[styles.moodCheckDot, { backgroundColor: item.color }]}>
                          <CheckCircle2 size={10} color="#ffffff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 2. Visual Energy Battery (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Zap size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Physical Energy Capacity</Text>
                </View>
                <Text style={styles.selectedLevelText}>
                  {ENERGY_LEVELS.find(e => e.val === energy)?.pct} Capacity
                </Text>
              </View>

              <View style={styles.energyBatteryGrid}>
                {ENERGY_LEVELS.map((lvl) => {
                  const isSelected = energy === lvl.val;
                  const IconComp = lvl.icon;
                  return (
                    <TouchableOpacity
                      key={lvl.val}
                      style={[
                        styles.energyBtn,
                        isSelected && styles.energyBtnActive,
                      ]}
                      onPress={() => setEnergy(lvl.val)}
                      activeOpacity={0.8}
                    >
                      <IconComp size={20} color={isSelected ? '#16a34a' : '#64748b'} style={{ marginBottom: 4 }} />
                      <Text style={[styles.energyPctText, isSelected && styles.energyPctTextActive]}>
                        {lvl.pct}
                      </Text>
                      <Text style={[styles.energyLabelText, isSelected && styles.energyLabelTextActive]}>
                        {lvl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Sleep Journey (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Moon size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Sleep Duration & Rest</Text>
                </View>
              </View>

              <View style={styles.sleepCardsGrid}>
                {SLEEP_CARDS.map((opt) => {
                  const isSelected = sleepHours === opt.hours;
                  const IconComp = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.hours}
                      style={[
                        styles.sleepCard,
                        isSelected && styles.sleepCardActive,
                      ]}
                      onPress={() => setSleepHours(opt.hours)}
                      activeOpacity={0.8}
                    >
                      <IconComp size={19} color={isSelected ? '#16a34a' : '#64748b'} style={{ marginBottom: 4 }} />
                      <Text style={[styles.sleepHoursText, isSelected && styles.sleepHoursTextActive]}>
                        {opt.label}
                      </Text>
                      <Text style={styles.sleepDescText}>{opt.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 4. Interactive Stress Barometer (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Activity size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Nervous System Load</Text>
                </View>
              </View>

              <View style={styles.stressZonesGrid}>
                {STRESS_ZONES.map((zone) => {
                  const isSelected = (stress <= 3 && zone.val <= 2) ||
                                     (stress > 3 && stress <= 5 && zone.val === 4) ||
                                     (stress > 5 && stress <= 7 && zone.val === 7) ||
                                     (stress > 7 && zone.val === 9);
                  const IconComp = zone.icon;
                  return (
                    <TouchableOpacity
                      key={zone.label}
                      style={[
                        styles.stressZoneCard,
                        isSelected && {
                          borderColor: zone.color,
                          backgroundColor: `${zone.color}14`,
                        },
                      ]}
                      onPress={() => setStress(zone.val)}
                      activeOpacity={0.8}
                    >
                      <IconComp size={22} color={zone.color} style={{ marginBottom: 5 }} />
                      <Text style={[styles.stressZoneTitle, isSelected && { color: zone.color, fontWeight: '800' }]}>
                        {zone.label}
                      </Text>
                      <Text style={styles.stressZoneDesc}>{zone.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Hydration Water Tracker (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Droplets size={18} color="#0284c7" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Hydration Pace</Text>
                </View>
                <Text style={styles.waterCountBadge}>{waterCups} / 8 Glasses</Text>
              </View>

              <View style={styles.waterDropsRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => {
                  const filled = cup <= waterCups;
                  return (
                    <TouchableOpacity
                      key={cup}
                      style={[
                        styles.waterDropBtn,
                        filled && styles.waterDropBtnFilled,
                      ]}
                      onPress={() => setWaterCups(cup === waterCups ? cup - 1 : cup)}
                      activeOpacity={0.7}
                    >
                      <Droplets size={17} color={filled ? '#0284c7' : '#94a3b8'} />
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.waterTipText}>
                {waterCups >= 7 ? 'Optimal hydration level. Cognitive focus supported.' : 'Aim for 8 glasses throughout the day for kidney & energy balance.'}
              </Text>
            </View>

            {/* 6. Body Comfort (No Emojis) */}
            <View style={[styles.funCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <View style={styles.sectionIconBubble}>
                    <Heart size={18} color="#16a34a" />
                  </View>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Musculoskeletal Comfort</Text>
                </View>
              </View>

              <View style={styles.bodyComfortsGrid}>
                {BODY_COMFORTS.map((item) => {
                  const isSelected = pain === item.val;
                  const IconComp = item.icon;
                  return (
                    <TouchableOpacity
                      key={item.val}
                      style={[
                        styles.comfortCard,
                        isSelected && {
                          borderColor: item.color,
                          backgroundColor: `${item.color}14`,
                        },
                      ]}
                      onPress={() => setPain(item.val)}
                      activeOpacity={0.8}
                    >
                      <IconComp size={18} color={item.color} style={{ marginBottom: 4 }} />
                      <Text style={[styles.comfortCardTitle, isSelected && { color: item.color, fontWeight: '800' }]}>
                        {item.label}
                      </Text>
                      <Text style={styles.comfortCardSub}>{item.sub}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Submit Button (Pure Modern Icons) */}
            <TouchableOpacity
              style={styles.submitRitualBtn}
              onPress={handleSaveDailyCheckup}
              activeOpacity={0.88}
            >
              <Sparkles size={18} color="#ffffff" />
              <Text style={styles.submitRitualBtnText}>
                {savedToday ? 'Update Today’s Ritual (+25 XP)' : 'Log Daily Ritual (+25 XP)'}
              </Text>
            </TouchableOpacity>

            {/* 7-Day Trend Summary Strip */}
            <View style={styles.trendSummaryCard}>
              <Text style={styles.trendSummaryTitle}>7-DAY BIOMETRIC HARMONY</Text>
              <View style={styles.trendGrid}>
                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Mood</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgMood}</Text>
                    <TrendingUp size={15} color="#16a34a" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Energy</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgEnergy}</Text>
                    <TrendingUp size={15} color="#16a34a" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Sleep</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgSleep}h</Text>
                    <Minus size={15} color="#64748b" />
                  </View>
                </View>

                <View style={styles.trendItem}>
                  <Text style={styles.trendLabel}>Stress</Text>
                  <View style={styles.trendValRow}>
                    <Text style={styles.trendVal}>{avgStress}</Text>
                    <TrendingDown size={15} color="#16a34a" />
                  </View>
                </View>
              </View>
            </View>

            {/* AI Companion Insight */}
            <View style={styles.aiSynthesisCard}>
              <View style={styles.aiSynthesisHeader}>
                <Sparkles size={18} color="#16a34a" />
                <Text style={styles.aiSynthesisTitle}>Nura AI Daily Reflection</Text>
              </View>
              <Text style={styles.aiSynthesisText}>
                {stress > 6
                  ? 'Elevated stress patterns detected. A short 10-minute restorative pause and chamomile infusion will help reset autonomic balance.'
                  : sleepHours < 6
                  ? 'Sub-optimal sleep logged. Prioritize early wind-down tonight and stay hydrated during afternoon hours.'
                  : 'Physiological markers indicate resilient harmony. Optimal window for cognitive focus and aerobic training.'}
              </Text>
            </View>
          </View>
        ) : (
          <View>
            {/* Clinical Section */}
            <View style={styles.clinicalHeaderRow}>
              <Text style={styles.sectionHeading}>Preventive Health Schedule</Text>
              <TouchableOpacity
                style={styles.addVisitBtn}
                onPress={() => setShowAddVisit(true)}
              >
                <Plus size={16} color="#ffffff" />
                <Text style={styles.addVisitBtnText}>Log Visit</Text>
              </TouchableOpacity>
            </View>

            {/* Standard Preventive Protocols */}
            <Text style={styles.subHeading}>Recommended Clinical Screenings</Text>
            {defaultPlannerItems.map((item, i) => (
              <View key={i} style={styles.screeningCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.screeningTitle}>{item.name}</Text>
                  <Text style={styles.screeningDesc}>{item.desc}</Text>
                  <Text style={styles.screeningFreq}>Frequency: {item.freq}</Text>
                </View>
                <TouchableOpacity
                  style={styles.planBtn}
                  onPress={() => {
                    setVisitName(item.name);
                    setShowAddVisit(true);
                  }}
                >
                  <Text style={styles.planBtnText}>Record</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Logged Past Visits */}
            <Text style={[styles.subHeading, { marginTop: 20 }]}>
              Logged Visits & Records ({clinicalCheckups.length})
            </Text>

            {clinicalCheckups.length === 0 ? (
              <View style={styles.emptyClinical}>
                <CalendarCheck size={36} color="#cbd5e1" />
                <Text style={styles.emptyClinicalText}>No clinical records logged yet.</Text>
              </View>
            ) : (
              clinicalCheckups.map((c) => (
                <View key={c.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyTitle}>{c.name}</Text>
                    {c.doctor ? <Text style={styles.historyDoctor}>{c.doctor}</Text> : null}
                    <Text style={styles.historyDate}>Logged on: {c.date_logged}</Text>
                    {c.next_visit ? <Text style={styles.historyNext}>Next target: {c.next_visit}</Text> : null}
                    {c.notes ? <Text style={styles.historyNotes}>{c.notes}</Text> : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteVisitBtn}
                    onPress={() => handleDeleteClinical(c.id)}
                  >
                    <Trash2 size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Visit Modal */}
      {showAddVisit && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Clinical Visit</Text>
            <Text style={styles.inputLabel}>Checkup / Exam Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={visitName}
              onChangeText={setVisitName}
              placeholder="e.g. Annual Blood Work, Dentist"
            />
            <Text style={styles.inputLabel}>Doctor or Clinic</Text>
            <TextInput
              style={styles.modalInput}
              value={doctorName}
              onChangeText={setDoctorName}
              placeholder="e.g. Dr. Abebe, Bethel Clinic"
            />
            <Text style={styles.inputLabel}>Next Target Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.modalInput}
              value={nextVisitDate}
              onChangeText={setNextVisitDate}
              placeholder="2026-12-01"
            />
            <Text style={styles.inputLabel}>Doctor's Advice / Notes</Text>
            <TextInput
              style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]}
              value={visitNotes}
              onChangeText={setVisitNotes}
              multiline
              placeholder="Key notes, blood pressure reading, follow-ups"
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#f1f5f9' }]}
                onPress={() => setShowAddVisit(false)}
              >
                <Text style={{ color: '#64748b', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#16a34a', flex: 1 }]}
                onPress={handleSaveClinicalVisit}
              >
                <Text style={{ color: '#ffffff', fontWeight: '700' }}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: 'transparent' 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  aiHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.85)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    gap: 4,
  },
  aiHeaderBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  segmentBtnActive: { 
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.9)',
  },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  segmentTextActive: { color: '#16a34a', fontWeight: '800' },
  content: { 
    flex: 1, 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },

  // Gamified Hero Card
  streakHeroCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.82)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  streakTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(254, 242, 242, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ef4444',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.85)',
  },
  xpBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#16a34a',
  },
  streakHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 3,
  },
  streakHeroSub: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },

  // Celebration Banner
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#86efac',
    gap: 8,
    marginBottom: 16,
  },
  celebrationBannerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '700',
    color: '#166534',
  },

  // Generic Fun Section Card
  funCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.72)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.75)',
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.8)',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  hintBadge: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  selectedLevelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16a34a',
  },

  // Mood Avatars
  moodScrollRow: {
    gap: 10,
    paddingRight: 10,
  },
  moodAvatarCard: {
    width: 104,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.65)',
    position: 'relative',
  },
  moodIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moodAvatarTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
    textAlign: 'center',
  },
  moodAvatarSub: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  moodCheckDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Energy Battery
  energyBatteryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  energyBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.6)',
  },
  energyBtnActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  energyPctText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  energyPctTextActive: {
    color: '#16a34a',
  },
  energyLabelText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  energyLabelTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },

  // Sleep Cards
  sleepCardsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  sleepCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.6)',
  },
  sleepCardActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  sleepHoursText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  sleepHoursTextActive: {
    color: '#16a34a',
    fontWeight: '800',
  },
  sleepDescText: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
  },

  // Stress Barometer
  stressZonesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  stressZoneCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.6)',
  },
  stressZoneTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    textAlign: 'center',
  },
  stressZoneDesc: {
    fontSize: 9.5,
    color: '#64748b',
    textAlign: 'center',
  },

  // Hydration Tracker
  waterCountBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  waterDropsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  waterDropBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  waterDropBtnFilled: {
    backgroundColor: '#e0f2fe',
    borderColor: '#7dd3fc',
  },
  waterTipText: {
    fontSize: 11.5,
    color: '#0284c7',
    fontWeight: '500',
    marginTop: 10,
  },

  // Body Comfort (Grid format with clean cards)
  bodyComfortsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  comfortCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.7)',
  },
  comfortCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  comfortCardSub: {
    fontSize: 10,
    color: '#64748b',
  },

  // Submit Button
  submitRitualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 18,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 3,
  },
  submitRitualBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Trend Summary
  trendSummaryCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.72)',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.75)',
    marginBottom: 16,
  },
  trendSummaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  trendGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendItem: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '600',
  },
  trendValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0f172a',
  },

  // AI Synthesis
  aiSynthesisCard: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#bbf7d0',
    marginBottom: 24,
  },
  aiSynthesisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiSynthesisTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#166534',
  },
  aiSynthesisText: {
    fontSize: 12.5,
    color: '#14532d',
    lineHeight: 18,
  },

  // Clinical Section Styles
  clinicalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeading: { fontSize: 17, fontWeight: '800', color: '#0f172a' },
  addVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 4,
  },
  addVisitBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  subHeading: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 10 },
  screeningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.7)',
  },
  screeningTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  screeningDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  screeningFreq: { fontSize: 11, color: '#16a34a', fontWeight: '600', marginTop: 4 },
  planBtn: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planBtnText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  emptyClinical: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.7)',
  },
  emptyClinicalText: { fontSize: 13, color: '#94a3b8', marginTop: 8 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.7)',
    alignItems: 'center',
  },
  historyTitle: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  historyDoctor: { fontSize: 12, color: '#16a34a', fontWeight: '600', marginTop: 2 },
  historyDate: { fontSize: 11, color: '#64748b', marginTop: 2 },
  historyNext: { fontSize: 11, color: '#d97706', fontWeight: '600', marginTop: 2 },
  historyNotes: { fontSize: 11, color: '#475569', fontStyle: 'italic', marginTop: 4 },
  deleteVisitBtn: { padding: 8 },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', marginTop: 8, marginBottom: 4 },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
