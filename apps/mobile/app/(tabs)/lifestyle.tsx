import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Utensils,
  Dumbbell,
  Moon,
  Droplets,
  Heart,
  Wind,
  Flame,
  Activity,
  PlayCircle,
  Plus,
  ShieldCheck,
  Bot,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  Calendar,
  Smartphone,
  Leaf,
} from 'lucide-react-native';
import { useWellnessStore } from '../../src/store';
import { getProfile } from '../../src/storage/profileStorage';
import { computeBurnoutRisk, compute5CoreWellness } from '../../src/lib/wellnessEngine';
import DigitalWellnessHub from '../../src/components/lifestyle/DigitalWellnessHub';
import BurnoutRecoveryHub from '../../src/components/lifestyle/BurnoutRecoveryHub';

const REMEDY_ITEMS = [
  {
    name: 'Damakesse',
    category: 'Respiratory & Relief',
    tag: 'Traditional',
    desc: 'Ancient Ethiopian household remedy for colds and head tension. Often crushed and inhaled with warm steam.',
  },
  {
    name: 'Tena Adam (Rue)',
    category: 'Digestive & Calming',
    tag: 'Digestive Aid',
    desc: 'Fragrant herb steeped with traditional Ethiopian tea and coffee to ease digestion and stomach cramps.',
  },
  {
    name: 'Moringa (Shiferaw)',
    category: 'Immune & Energy',
    tag: 'Superfood',
    desc: 'Mineral-dense superfood leaves providing iron, calcium, and essential amino acids for daily vitality.',
  },
  {
    name: 'Koso (Hagenia)',
    category: 'Botanical Cleanser',
    tag: 'Traditional',
    desc: 'Historical Ethiopian mountain botanical traditionally valued for gut cleansing and digestive balance.',
  },
  {
    name: 'Zingibil (Ginger Root)',
    category: 'Anti-Inflammatory',
    tag: 'Circulation',
    desc: 'Natural digestive stimulant that soothes nausea and relieves joint stiffness after prolonged sitting.',
  },
  {
    name: 'Nech Shinkurt (Garlic)',
    category: 'Cardiovascular',
    tag: 'Immune Ally',
    desc: 'Potent natural antimicrobial bulb supporting healthy arterial elasticity and baseline blood pressure.',
  },
];

const NUTRITION_ITEMS = [
  {
    name: 'Teff Injera',
    category: 'Whole Grain / Staple',
    cals: 165,
    tag: 'Iron & Prebiotic',
    desc: 'Ancient iron-rich staple grain, fermented and gluten-free. Provides sustained complex carbs.',
  },
  {
    name: 'Shiro Wot',
    category: 'Plant Protein',
    cals: 210,
    tag: 'High Fiber',
    desc: 'Spiced chickpea and broad bean stew. Cook with moderate olive or seed oil for optimal macros.',
  },
  {
    name: 'Gomen (Collard Greens)',
    category: 'Micronutrient',
    cals: 85,
    tag: 'Vitamins A, C, K',
    desc: 'Steamed greens sauteed with ginger and garlic. Essential for bone density and digestion.',
  },
  {
    name: 'Telba Drink (Flaxseed)',
    category: 'Superfood',
    cals: 140,
    tag: 'Omega-3 ALA',
    desc: 'Toasted ground flaxseed infusion. Natural anti-inflammatory drink for heart and gut wellness.',
  },
];

const WORKOUTS = [
  {
    title: 'Eskesta Cardio Dance',
    duration: '15 min',
    intensity: 'Cardio & Mobility',
    desc: 'Traditional Ethiopian rhythmic shoulder and neck dance for upper body mobility and aerobic endurance.',
    url: 'https://youtube.com/results?search_query=Eskesta+workout+cardio',
  },
  {
    title: 'Morning Core & Posture',
    duration: '12 min',
    intensity: 'Low-Impact',
    desc: 'Planks, bird-dogs, and pelvic tilts to reinforce spinal stability after waking up.',
    url: 'https://youtube.com/results?search_query=morning+core+and+posture+routine',
  },
  {
    title: 'Lower Body Strength',
    duration: '20 min',
    intensity: 'Moderate',
    desc: 'Bodyweight squats, lunges, and calf raises to support joint mobility and endurance.',
    url: 'https://youtube.com/results?search_query=20+min+bodyweight+leg+workout',
  },
  {
    title: 'Restorative Hip & Back Release',
    duration: '10 min',
    intensity: 'Recovery',
    desc: 'Gentle yoga stretches to decompress lower back after desk work.',
    url: 'https://youtube.com/results?search_query=hip+and+back+stretch+routine',
  },
];

export default function LifestyleScreen() {
  const router = useRouter();
  const profile = getProfile() || {};
  const { checkIns } = useWellnessStore();

  const [activeSubTab, setActiveSubTab] = useState<'nutrition' | 'movement' | 'recovery' | 'hydration' | 'mindfulness' | 'digital' | 'remedies'>('nutrition');

  // Hydration local tracker
  const [waterCups, setWaterCups] = useState(5);
  const targetCups = 8;

  // Breathwork state
  const [breathPhase, setBreathPhase] = useState<'Ready' | 'Inhale (4s)' | 'Hold (7s)' | 'Exhale (8s)'>('Ready');
  const [isBreathing, setIsBreathing] = useState(false);

  const latestCheckin = checkIns.length > 0 ? checkIns[0] : null;
  const burnout = computeBurnoutRisk(latestCheckin);
  const wellness = compute5CoreWellness(latestCheckin, profile);

  const handleOpenVideo = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Alert.alert('Browser', 'Unable to open workout video.');
    }
  };

  const handleAddWater = () => {
    setWaterCups(prev => Math.min(prev + 1, 16));
  };

  const handleResetWater = () => {
    setWaterCups(0);
  };

  const startBreathwork = () => {
    if (isBreathing) return;
    setIsBreathing(true);
    setBreathPhase('Inhale (4s)');

    setTimeout(() => {
      setBreathPhase('Hold (7s)');
      setTimeout(() => {
        setBreathPhase('Exhale (8s)');
        setTimeout(() => {
          setBreathPhase('Ready');
          setIsBreathing(false);
          Alert.alert('Session Complete', 'Wonderful job taking a mindful pause.');
        }, 8000);
      }, 7000);
    }, 4000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Lifestyle & Habits</Text>
          <Text style={styles.subtitle}>Nutrition, movement, recovery & mindfulness</Text>
        </View>
        <TouchableOpacity style={styles.aiHeaderBtn} onPress={() => router.push('/chat')}>
          <Bot size={18} color="#16a34a" />
          <Text style={styles.aiHeaderBtnText}>Ask Nura</Text>
        </TouchableOpacity>
      </View>

      {/* 5-Sub-Hub Segmented Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContent}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'nutrition' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('nutrition')}
        >
          <Utensils size={15} color={activeSubTab === 'nutrition' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'nutrition' && styles.subTabTextActive]}>Nutrition & Tsom</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'movement' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('movement')}
        >
          <Dumbbell size={15} color={activeSubTab === 'movement' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'movement' && styles.subTabTextActive]}>Movement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'recovery' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('recovery')}
        >
          <Moon size={15} color={activeSubTab === 'recovery' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'recovery' && styles.subTabTextActive]}>Recovery & 5-Core</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'digital' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('digital')}
        >
          <Smartphone size={15} color={activeSubTab === 'digital' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'digital' && styles.subTabTextActive]}>Digital Wellness</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'hydration' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('hydration')}
        >
          <Droplets size={15} color={activeSubTab === 'hydration' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'hydration' && styles.subTabTextActive]}>Hydration</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'mindfulness' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('mindfulness')}
        >
          <Wind size={15} color={activeSubTab === 'mindfulness' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'mindfulness' && styles.subTabTextActive]}>Mindfulness</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'remedies' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('remedies')}
        >
          <Leaf size={15} color={activeSubTab === 'remedies' ? '#16a34a' : '#64748b'} />
          <Text style={[styles.subTabText, activeSubTab === 'remedies' && styles.subTabTextActive]}>Herbs & Remedies</Text>
        </TouchableOpacity>
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* SUB-HUB 1: NUTRITION & FASTING */}
        {activeSubTab === 'nutrition' && (
          <View>
            {/* Fasting Calendar Card */}
            <View style={styles.fastingHero}>
              <View style={styles.fastingHeader}>
                <Clock size={20} color="#16a34a" />
                <Text style={styles.fastingTitle}>Ethiopian Fasting (Tsom) Guidance</Text>
              </View>
              <Text style={styles.fastingDesc}>
                {profile.fastingMode === 'Orthodox Christian (Tsom)'
                  ? 'Orthodox Christian fasting season active. Prioritize plant-based proteins like Misir (lentils), Shimbra (chickpeas), and Telba (flaxseed) to meet your protein target without animal products.'
                  : profile.fastingMode === 'Islamic (Ramadan)'
                  ? 'Islamic fasting guide: Prioritize hydration with electrolytes during Suhoor and break your fast with dates and water before entering Iftar.'
                  : 'Balanced traditional nutrition: Incorporating Wednesday and Friday vegan meals provides natural digestive reset and high dietary fiber.'}
              </Text>
            </View>

            <Text style={styles.sectionHeading}>Ethiopian Nutrient-Dense Foods</Text>
            {NUTRITION_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.nutritionCard}>
                <View style={styles.nutritionTopRow}>
                  <Text style={styles.nutritionName}>{item.name}</Text>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{item.tag}</Text>
                  </View>
                </View>
                <Text style={styles.nutritionCategory}>{item.category} • ~{item.cals} kcal</Text>
                <Text style={styles.nutritionDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* SUB-HUB 2: MOVEMENT */}
        {activeSubTab === 'movement' && (
          <View>
            {/* Eskesta Spotlight Card */}
            <View style={styles.spotlightCard}>
              <Sparkles size={24} color="#f59e0b" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.spotlightTitle}>Cultural Movement: Eskesta Cardio</Text>
                <Text style={styles.spotlightDesc}>
                  Ethiopian traditional shoulder dancing elevates heart rate, strengthens upper back posture, and burns up to 180 kcal in 15 minutes.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionHeading}>Workout & Mobility Library</Text>
            {WORKOUTS.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.workoutCard}
                onPress={() => handleOpenVideo(item.url)}
              >
                <View style={styles.workoutIconCol}>
                  <PlayCircle size={28} color="#16a34a" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.workoutTitle}>{item.title}</Text>
                  <Text style={styles.workoutMeta}>{item.duration} • {item.intensity}</Text>
                  <Text style={styles.workoutDesc}>{item.desc}</Text>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SUB-HUB 3: RECOVERY & BURNOUT INTELLIGENCE */}
        {activeSubTab === 'recovery' && (
          <BurnoutRecoveryHub />
        )}

        {/* SUB-HUB: DIGITAL WELLNESS */}
        {activeSubTab === 'digital' && (
          <DigitalWellnessHub />
        )}

        {/* SUB-HUB 4: HYDRATION */}
        {activeSubTab === 'hydration' && (
          <View>
            <View style={styles.hydrationHero}>
              <Droplets size={36} color="#0284c7" />
              <Text style={styles.hydrationHeroAmount}>{waterCups * 250} ml</Text>
              <Text style={styles.hydrationHeroSub}>
                Goal: {targetCups * 250} ml ({waterCups} of {targetCups} glasses logged)
              </Text>

              {/* Visual Cup Progress */}
              <View style={styles.cupRow}>
                {Array.from({ length: targetCups }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.cupPill,
                      i < waterCups ? styles.cupPillFilled : styles.cupPillEmpty,
                    ]}
                  />
                ))}
              </View>

              <View style={styles.hydrationBtnRow}>
                <TouchableOpacity style={styles.waterAddBtn} onPress={handleAddWater}>
                  <Plus size={18} color="#ffffff" />
                  <Text style={styles.waterAddBtnText}>+250 ml Glass</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.waterResetBtn} onPress={handleResetWater}>
                  <Text style={styles.waterResetBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.hydrationTipBox}>
              <Info size={18} color="#0284c7" />
              <Text style={styles.hydrationTipText}>
                Drinking water consistently during high-altitude activity in Addis Ababa and central Ethiopia prevents dehydration headaches and preserves cellular recovery.
              </Text>
            </View>
          </View>
        )}

        {/* SUB-HUB 5: MINDFULNESS */}
        {activeSubTab === 'mindfulness' && (
          <View>
            <View style={styles.breathCard}>
              <Wind size={40} color="#16a34a" />
              <Text style={styles.breathTitle}>4-7-8 Parasympathetic Reset</Text>
              <Text style={styles.breathSubtitle}>
                Calms central nervous tension and reduces sympathetic heart rate elevation.
              </Text>

              <View style={styles.breathCircle}>
                <Text style={styles.breathPhaseText}>{breathPhase}</Text>
              </View>

              <TouchableOpacity
                style={[styles.breathActionBtn, isBreathing && { backgroundColor: '#64748b' }]}
                onPress={startBreathwork}
                disabled={isBreathing}
              >
                <Text style={styles.breathActionBtnText}>
                  {isBreathing ? 'Session in Progress...' : 'Start 1-Cycle Reset'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SUB-HUB 6: HERBS & TRADITIONAL REMEDIES */}
        {activeSubTab === 'remedies' && (
          <View>
            <View style={styles.fastingHero}>
              <View style={styles.fastingHeader}>
                <Leaf size={16} color="#166534" />
                <Text style={styles.fastingTitle}>Ethiopian Natural Botanicals & Remedies</Text>
              </View>
              <Text style={styles.fastingDesc}>
                Evidence-informed holistic botanical traditions verified with modern botanical medicine standards.
              </Text>
            </View>

            {REMEDY_ITEMS.map((remedy, i) => (
              <View key={i} style={styles.nutritionCard}>
                <View style={styles.nutritionTopRow}>
                  <Text style={styles.nutritionName}>{remedy.name}</Text>
                  <View style={styles.tagPill}>
                    <Text style={styles.tagPillText}>{remedy.tag}</Text>
                  </View>
                </View>
                <Text style={styles.nutritionCategory}>{remedy.category}</Text>
                <Text style={styles.nutritionDesc}>{remedy.desc}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
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
    backgroundColor: '#f0fdf4',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 4,
  },
  aiHeaderBtnText: { color: '#16a34a', fontWeight: '700', fontSize: 12 },
  subTabsScroll: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  subTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  subTabBtnActive: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#16a34a' },
  subTabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  subTabTextActive: { color: '#16a34a', fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginVertical: 12 },
  fastingHero: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 12,
  },
  fastingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  fastingTitle: { fontSize: 15, fontWeight: '800', color: '#166534' },
  fastingDesc: { fontSize: 13, color: '#14532d', lineHeight: 19 },
  nutritionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  nutritionTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nutritionName: { fontSize: 13.5, fontWeight: '700', color: '#0f172a' },
  tagPill: { backgroundColor: '#f1f5f9', paddingVertical: 2, paddingHorizontal: 7, borderRadius: 5 },
  tagPillText: { fontSize: 10.5, fontWeight: '700', color: '#475569' },
  nutritionCategory: { fontSize: 11.5, color: '#16a34a', fontWeight: '600', marginTop: 1 },
  nutritionDesc: { fontSize: 11.5, color: '#64748b', marginTop: 3, lineHeight: 15 },
  spotlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fef3c7',
    marginBottom: 8,
  },
  spotlightTitle: { fontSize: 13, fontWeight: '800', color: '#92400e' },
  spotlightDesc: { fontSize: 11, color: '#b45309', marginTop: 2, lineHeight: 15 },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  workoutIconCol: { justifyContent: 'center', alignItems: 'center' },
  workoutTitle: { fontSize: 13.5, fontWeight: '700', color: '#0f172a' },
  workoutMeta: { fontSize: 11.5, color: '#16a34a', fontWeight: '600', marginTop: 1 },
  workoutDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  scoreRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  scoreCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  scoreCardLabel: { fontSize: 10.5, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  scoreCardVal: { fontSize: 24, fontWeight: '900', marginVertical: 2 },
  scoreCardStatus: { fontSize: 11, fontWeight: '700' },
  breakdownBox: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  breakdownLabel: { fontSize: 12, color: '#334155' },
  breakdownVal: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  sleepCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sleepTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  sleepDesc: { fontSize: 11.5, color: '#64748b', marginTop: 2, lineHeight: 16 },
  hydrationHero: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  hydrationHeroAmount: { fontSize: 26, fontWeight: '900', color: '#0284c7', marginTop: 4 },
  hydrationHeroSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  cupRow: { flexDirection: 'row', gap: 5, marginVertical: 10 },
  cupPill: { width: 20, height: 28, borderRadius: 5 },
  cupPillFilled: { backgroundColor: '#0284c7' },
  cupPillEmpty: { backgroundColor: '#e0f2fe' },
  hydrationBtnRow: { flexDirection: 'row', gap: 10 },
  waterAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    gap: 6,
  },
  waterAddBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  waterResetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  waterResetBtnText: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  hydrationTipBox: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
    gap: 6,
  },
  hydrationTipText: { flex: 1, fontSize: 11.5, color: '#0369a1', lineHeight: 16 },
  breathCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  breathTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a', marginTop: 6 },
  breathSubtitle: { fontSize: 11.5, color: '#64748b', textAlign: 'center', marginTop: 2, marginBottom: 12 },
  breathCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f0fdf4',
    borderWidth: 2.5,
    borderColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  breathPhaseText: { fontSize: 14, fontWeight: '800', color: '#16a34a' },
  breathActionBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 20,
    marginTop: 14,
  },
  breathActionBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
});
