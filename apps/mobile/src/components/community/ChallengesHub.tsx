import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Trophy,
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Target,
  ChevronRight,
  X,
  Droplets,
  Moon,
  Sparkles,
  Wallet,
  ShieldCheck,
} from 'lucide-react-native';
import {
  CommunityChallenge,
  ChallengeCategory,
  ChallengeDifficulty,
} from '../../types/communityTypes';
import CommunityMascot from './CommunityMascot';
import WalletRewardsModal from './WalletRewardsModal';
import { useTheme } from '../../context/ThemeContext';

interface ChallengesHubProps {
  challenges: CommunityChallenge[];
  onToggleJoin: (challengeId: string) => void;
  onCompleteDay: (challengeId: string) => void;
  onCreateChallenge: (newChallenge: Partial<CommunityChallenge>) => void;
}

type ChallengeFilter = 'Featured' | 'Active Now' | 'My Challenges' | 'Upcoming' | 'Completed';

export default function ChallengesHub({
  challenges,
  onToggleJoin,
  onCompleteDay,
  onCreateChallenge,
}: ChallengesHubProps) {
  const { theme, isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<ChallengeFilter>('Featured');
  const [selectedChallenge, setSelectedChallenge] = useState<CommunityChallenge | null>(null);

  // Create Challenge Modal Wizard state
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ChallengeCategory>('Fitness');
  const [newDuration, setNewDuration] = useState('7');
  const [newDailyGoal, setNewDailyGoal] = useState('');
  const [newRule1, setNewRule1] = useState('');
  const [newRule2, setNewRule2] = useState('');
  const [newPrivacy, setNewPrivacy] = useState<'Public' | 'Private'>('Public');

  // Nura AI Challenge Architect state
  const [showWallet, setShowWallet] = useState(false);
  const [showNuraAiModal, setShowNuraAiModal] = useState<boolean>(false);
  const scrollViewRef = useRef<any>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: 'nura' | 'user'; text: string; isBlueprint?: boolean; blueprintData?: any }>>([
    {
      id: '1',
      sender: 'nura',
      text: 'Hey! I am Nura. What kind of habit challenge do you want to build today? You can just say "Make me a 30-day coding challenge" and I will design it!'
    }
  ]);
  const [nuraPrompt, setNuraPrompt] = useState<string>('');
  const [isNuraGenerating, setIsNuraGenerating] = useState<boolean>(false);

  // Milestone Celebration Toast state
  const [celebrationToast, setCelebrationToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const filterTabs: ChallengeFilter[] = [
    'Featured',
    'Active Now',
    'My Challenges',
    'Upcoming',
    'Completed',
  ];

  const getFilteredChallenges = () => {
    switch (activeFilter) {
      case 'My Challenges':
        return challenges.filter((c) => c.isJoined && !c.isCompleted);
      case 'Active Now':
        return challenges.filter((c) => c.isJoined || c.currentDay > 1);
      case 'Upcoming':
        return challenges.filter((c) => c.startDate.includes('Tomorrow') || c.startDate.includes('Next'));
      case 'Completed':
        return challenges.filter((c) => c.isCompleted);
      case 'Featured':
      default:
        return challenges;
    }
  };

  const filteredChallenges = getFilteredChallenges();

  const handleCompleteCurrentDay = (challengeId: string) => {
    onCompleteDay(challengeId);
    setCelebrationToast({
      visible: true,
      title: 'Nice work!',
      message: 'Day check-in completed. Your wellness streak is updated.',
    });
    setTimeout(() => {
      setCelebrationToast({ visible: false, title: '', message: '' });
    }, 2800);

    // Update selected modal challenge state
    if (selectedChallenge && selectedChallenge.id === challengeId) {
      const isAlreadyCompletedToday = selectedChallenge.completedDays.includes(
        selectedChallenge.currentDay
      );
      if (!isAlreadyCompletedToday) {
        setSelectedChallenge({
          ...selectedChallenge,
          completedDays: [...selectedChallenge.completedDays, selectedChallenge.currentDay],
          streak: selectedChallenge.streak + 1,
        });
      }
    }
  };

  const handlePublishChallenge = () => {
    if (!newTitle.trim()) {
      Alert.alert('Required', 'Please enter a challenge title.');
      return;
    }
    const days = parseInt(newDuration, 10) || 7;
    onCreateChallenge({
      title: newTitle.trim(),
      description: newDesc.trim() || 'A positive habit-building challenge.',
      category: newCategory,
      durationDays: days,
      difficulty: 'Easy',
      dailyGoal: newDailyGoal.trim() || 'Daily wellness check-in',
      rules: [
        newRule1.trim() || 'Stay consistent and listen to your body.',
        newRule2.trim() || 'Share honest daily reflections.',
      ],
      creator: 'You',
      creatorBadge: 'Member',
      participantsCount: 1,
      currentDay: 1,
      streak: 1,
      isJoined: true,
      isCompleted: false,
      completedDays: [1],
      coverColor: '#16a34a',
      iconName: 'Flame',
    });

    setShowCreateWizard(false);
    setWizardStep(1);
    setNewTitle('');
    setNewDesc('');
    setNewDailyGoal('');
    setNewRule1('');
    setNewRule2('');

    Alert.alert('Challenge Created', 'Your challenge is live! Invited peers can now join.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header with Create Action & Wallet */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBadge}>
            <Trophy size={13} color="#16a34a" />
            <Text style={styles.headerBadgeText}>Action & Progress</Text>
          </View>
          <Text style={styles.title}>Challenges</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Small steps. Shared progress.</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowWallet(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 }}
          activeOpacity={0.8}
        >
          <Wallet size={16} color={theme.accent} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.textPrimary }}>4,250 ETB</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Nura AI Banner */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: `${theme.accent}15`, borderRadius: 16, marginBottom: 20 }}
        onPress={() => setShowCreateWizard(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `${theme.accent}20`, alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color={theme.accent} />
          </View>
          <View>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.textPrimary, marginBottom: 2 }}>Create with Nura AI Architect</Text>
            <Text style={{ fontSize: 12, color: theme.textSecondary }}>Automated anti-cheat habit design</Text>
          </View>
        </View>
        <ChevronRight size={20} color={theme.accent} />
      </TouchableOpacity>

      {/* 2. Sub-Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsRow}
      >
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterPill, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }, isActive && { backgroundColor: theme.accentDeep, borderColor: theme.accent }]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isActive && styles.filterPillTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 3. Celebration Notification Banner */}
      {celebrationToast.visible && (
        <View style={styles.celebrationBanner}>
          <CheckCircle2 size={18} color="#16a34a" />
          <View style={{ flex: 1 }}>
            <Text style={styles.celebrationTitle}>{celebrationToast.title}</Text>
            <Text style={styles.celebrationMessage}>{celebrationToast.message}</Text>
          </View>
        </View>
      )}

      {/* 4. Challenges List */}
      <View style={[styles.challengesList, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 }]}>
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((ch) => {
            const progressRatio = ch.durationDays > 0 ? ch.currentDay / ch.durationDays : 0;
            const progressPercent = Math.min(100, Math.round(progressRatio * 100));

            return (
              <TouchableOpacity
                key={ch.id}
            style={[styles.challengeCard, { overflow: 'hidden', width: '48%', marginBottom: 16 }]}
                onPress={() => setSelectedChallenge(ch)}
                activeOpacity={0.9}
              >

            {/* Picture Hero Header */}
            <View style={{ width: '100%', height: 120, backgroundColor: '#f1f5f9' }}>
               <Image
                 source={{ uri: ch.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80' }}
                 style={{ width: '100%', height: '100%' }}
                 resizeMode="cover"
               />
               <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
                  <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Users size={12} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{ch.participantsCount}</Text>
                  </View>
               </View>
            </View>
                <View style={{ padding: 12 }}>
                {/* Card Top Row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.categoryBadge, { backgroundColor: `${ch.coverColor}15` }]}>
                    <Text style={[styles.categoryBadgeText, { color: ch.coverColor }]}>
                      {ch.category}
                    </Text>
                  </View>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{ch.difficulty}</Text>
                  </View>
                </View>

                {/* Challenge Title & Desc */}
                <Text style={styles.challengeTitle}>{ch.title}</Text>
                <Text style={styles.challengeDesc} numberOfLines={1}>
                  {ch.description}
                </Text>

                {/* Meta details */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Users size={13} color="#64748b" />
                    <Text style={styles.metaItemText}>
                      {ch.participantsCount} joined
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={13} color="#64748b" />
                    <Text style={styles.metaItemText}>{ch.durationDays} Days</Text>
                  </View>
                  {ch.isJoined && ch.streak > 0 && (
                    <View style={styles.streakBadge}>
                      <Flame size={12} color="#ea580c" />
                      <Text style={styles.streakBadgeText}>{ch.streak}d streak</Text>
                    </View>
                  )}
                </View>

                {/* Financial details if monetary */}
                {ch.isMonetary && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 4, marginBottom: 8 }}>
                     <View>
                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Entry Stake</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: theme.textPrimary }}>{ch.entryFee} {ch.currency || 'ETB'}</Text>
                     </View>
                     <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 11, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Prize Pool</Text>
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#16a34a' }}>{ch.prizePool?.toLocaleString()} {ch.currency || 'ETB'}</Text>
                     </View>
                  </View>
                )}

                {/* Progress bar if joined */}
                {ch.isJoined && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressHeaderText}>
                        Day {ch.currentDay} of {ch.durationDays}
                      </Text>
                      <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                    </View>
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${progressPercent}%`,
                            backgroundColor: ch.coverColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Card Footer CTA */}
                <View style={styles.cardFooter}>
                  <Text style={styles.creatorText}>By {ch.creator}</Text>
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={[
                        styles.joinBtn,
                        ch.isJoined && styles.joinBtnActive,
                      ]}
                      onPress={(e) => {
                        e.stopPropagation();
                        onToggleJoin(ch.id);
                      }}
                    >
                      <Text
                        style={[
                          styles.joinBtnText,
                          ch.isJoined && styles.joinBtnTextActive,
                        ]}
                      >
                        {ch.isJoined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <CommunityMascot
            mood="curious"
            message={`No ${activeFilter.toLowerCase()} challenges yet`}
            subtext="Check other tabs or tap '+ Create' to launch a new habit challenge."
          />
        )}
      </View>

      {/* ======================================================== */}
      {/* 5. CHALLENGE DETAILS MODAL                               */}
      {/* ======================================================== */}
      {selectedChallenge && (
        <Modal
          visible={!!selectedChallenge}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedChallenge(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              {/* Header */}
              <View style={styles.sheetHeader}>
                <View style={[styles.sheetIconWrap, { backgroundColor: `${selectedChallenge.coverColor}18` }]}>
                  <Trophy size={20} color={selectedChallenge.coverColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>{selectedChallenge.title}</Text>
                  <Text style={styles.sheetSubtitle}>
                    {selectedChallenge.category} • {selectedChallenge.durationDays} Days • By {selectedChallenge.creator}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedChallenge(null)}
                  style={styles.sheetCloseBtn}
                >
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.sheetBody}>
                {/* Description */}
                <Text style={styles.sheetDescText}>{selectedChallenge.description}</Text>

                {/* Daily Goal Box */}
                <View style={styles.goalBox}>
                  <Target size={16} color="#16a34a" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalBoxTitle}>Today's Target</Text>
                    <Text style={styles.goalBoxDesc}>{selectedChallenge.dailyGoal}</Text>
                  </View>
                </View>

                {/* Timeline / Daily Progress Checklist */}
                <View style={styles.timelineSection}>
                  <Text style={styles.sectionHeading}>Daily Timeline Progress</Text>
                  <View style={styles.daysGrid}>
                    {Array.from({ length: selectedChallenge.durationDays }).map((_, idx) => {
                      const dayNumber = idx + 1;
                      const isCompleted = selectedChallenge.completedDays.includes(dayNumber);
                      const isCurrent = dayNumber === selectedChallenge.currentDay;

                      return (
                        <View
                          key={dayNumber}
                          style={[
                            styles.dayPill,
                            isCompleted && styles.dayPillCompleted,
                            isCurrent && styles.dayPillCurrent,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayPillNumber,
                              isCompleted && styles.dayPillNumberCompleted,
                              isCurrent && styles.dayPillNumberCurrent,
                            ]}
                          >
                            D{dayNumber}
                          </Text>
                          {isCompleted ? (
                            <CheckCircle2 size={13} color="#16a34a" />
                          ) : (
                            <View style={styles.dayDotEmpty} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Rules List */}
                <View style={styles.rulesSection}>
                  <Text style={styles.sectionHeading}>Challenge Guidelines</Text>
                  {selectedChallenge.rules.map((rule, i) => (
                    <View key={i} style={styles.ruleRow}>
                      <View style={styles.ruleBullet} />
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Sheet Action Footer */}
              <View style={styles.sheetFooter}>
                {selectedChallenge.isJoined ? (
                  <TouchableOpacity
                    style={[
                      styles.completeTodayBtn,
                      selectedChallenge.completedDays.includes(selectedChallenge.currentDay) &&
                        styles.completeTodayBtnDone,
                    ]}
                    onPress={() => handleCompleteCurrentDay(selectedChallenge.id)}
                    activeOpacity={0.88}
                  >
                    <CheckCircle2 size={18} color="#ffffff" />
                    <Text style={styles.completeTodayBtnText}>
                      {selectedChallenge.completedDays.includes(selectedChallenge.currentDay)
                        ? 'Completed for Today ✓'
                        : 'Complete Today'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.joinPrimaryBtn}
                    onPress={() => {
                      onToggleJoin(selectedChallenge.id);
                      setSelectedChallenge({
                        ...selectedChallenge,
                        isJoined: true,
                        participantsCount: selectedChallenge.participantsCount + 1,
                      });
                    }}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.joinPrimaryBtnText}>Join This Challenge</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 6. CREATE CHALLENGE WIZARD MODAL                         */}
      {/* ======================================================== */}
      <Modal
        visible={showCreateWizard}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateWizard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Create Challenge</Text>
                <Text style={styles.sheetSubtitle}>Step {wizardStep} of 4</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateWizard(false)}
                style={styles.sheetCloseBtn}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetBody}>
              {wizardStep === 1 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Basic Information</Text>
                  <Text style={styles.stepDesc}>
                    Give your challenge an engaging wellness title and clear purpose.
                  </Text>

                  <Text style={styles.inputLabel}>Challenge Title</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 7-Day Morning Movement & Sunlight"
                    placeholderTextColor="#94a3b8"
                    value={newTitle}
                    onChangeText={setNewTitle}
                  />

                  <Text style={styles.inputLabel}>Short Description</Text>
                  <TextInput
                    style={[styles.textInput, { minHeight: 64 }]}
                    placeholder="What will members accomplish together?"
                    placeholderTextColor="#94a3b8"
                    value={newDesc}
                    onChangeText={setNewDesc}
                    multiline
                  />

                  <Text style={styles.inputLabel}>Wellness Category</Text>
                  <View style={styles.categoryPickerRow}>
                    {(['Fitness', 'Sleep', 'Hydration', 'Nutrition', 'Mindfulness'] as ChallengeCategory[]).map(
                      (cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryChoice,
                            newCategory === cat && styles.categoryChoiceActive,
                          ]}
                          onPress={() => setNewCategory(cat)}
                        >
                          <Text
                            style={[
                              styles.categoryChoiceText,
                              newCategory === cat && styles.categoryChoiceTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                </View>
              )}

              {wizardStep === 2 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Challenge Structure</Text>
                  <Text style={styles.stepDesc}>
                    Define duration and daily targets to keep participants accountable.
                  </Text>

                  <Text style={styles.inputLabel}>Duration (Days)</Text>
                  <View style={styles.durationRow}>
                    {['5', '7', '14', '21', '30'].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[
                          styles.durationBtn,
                          newDuration === d && styles.durationBtnActive,
                        ]}
                        onPress={() => setNewDuration(d)}
                      >
                        <Text
                          style={[
                            styles.durationBtnText,
                            newDuration === d && styles.durationBtnTextActive,
                          ]}
                        >
                          {d}d
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Daily Goal / Action</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Drink 2.5L water or complete 10k steps"
                    placeholderTextColor="#94a3b8"
                    value={newDailyGoal}
                    onChangeText={setNewDailyGoal}
                  />

                  <Text style={styles.inputLabel}>Rule 1</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Log activity before 9:00 PM"
                    placeholderTextColor="#94a3b8"
                    value={newRule1}
                    onChangeText={setNewRule1}
                  />

                  <Text style={styles.inputLabel}>Rule 2</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Support 1 peer check-in daily"
                    placeholderTextColor="#94a3b8"
                    value={newRule2}
                    onChangeText={setNewRule2}
                  />
                </View>
              )}

              {wizardStep === 3 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Privacy Settings</Text>
                  <Text style={styles.stepDesc}>Choose who can view and join your challenge.</Text>

                  <TouchableOpacity
                    style={[
                      styles.privacyCard,
                      newPrivacy === 'Public' && styles.privacyCardActive,
                    ]}
                    onPress={() => setNewPrivacy('Public')}
                  >
                    <Text style={styles.privacyCardTitle}>Public</Text>
                    <Text style={styles.privacyCardSub}>
                      Any community member can discover and join this challenge.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.privacyCard,
                      newPrivacy === 'Private' && styles.privacyCardActive,
                    ]}
                    onPress={() => setNewPrivacy('Private')}
                  >
                    <Text style={styles.privacyCardTitle}>Private (Invite Only)</Text>
                    <Text style={styles.privacyCardSub}>
                      Only members you share the challenge link with can participate.
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {wizardStep === 4 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Preview & Publish</Text>
                  <Text style={styles.stepDesc}>Review how your challenge will appear to peers.</Text>

                  <View style={styles.previewCard}>
                    <Text style={styles.previewCategory}>{newCategory}</Text>
                    <Text style={styles.previewTitle}>{newTitle || 'Untitled Challenge'}</Text>
                    <Text style={styles.previewDesc}>
                      {newDesc || 'Join peers in building a positive daily wellness habit.'}
                    </Text>
                    <View style={styles.previewMeta}>
                      <Text style={styles.previewMetaText}>{newDuration} Days</Text>
                      <Text style={styles.previewMetaText}>•</Text>
                      <Text style={styles.previewMetaText}>{newPrivacy}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Wizard Navigation Footer */}
                        <View style={[styles.wizardFooter, { borderTopColor: theme.borderSubtle, backgroundColor: isDark ? '#1e293b' : '#ffffff', flexDirection: 'column', gap: 12 }]}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {wizardStep > 1 && (
                  <TouchableOpacity
                    style={[styles.wizardBackBtn, { borderColor: theme.borderSubtle, backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
                    onPress={() => setWizardStep((prev) => (prev - 1) as any)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.wizardBackBtnText, { color: theme.textPrimary }]}>Back</Text>
                  </TouchableOpacity>
                )}
                {wizardStep < 4 ? (
                  <TouchableOpacity
                    style={styles.wizardNextBtn}
                    onPress={() => setWizardStep((prev) => (prev + 1) as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.wizardNextBtnText}>Next Step</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.wizardPublishBtn}
                    onPress={handlePublishChallenge}
                    activeOpacity={0.85}
                  >
                     <Text style={styles.wizardPublishBtnText}>Launch Challenge</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: `${theme.accent}15`, borderRadius: 12 }}
                onPress={() => {
                  setShowCreateWizard(false);
                  setTimeout(() => setShowNuraAiModal(true), 300);
                }}
              >
                <Sparkles size={16} color={theme.accent} />
                <Text style={{ color: theme.accent, fontWeight: '700', fontSize: 14 }}>Create with Nura AI Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
            </Modal>

      {/* ======================================================== */}
      {/* 9.5. NURA AI CHALLENGE ARCHITECT MODAL                    */}
      {/* ======================================================== */}
      <Modal
        visible={showNuraAiModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNuraAiModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.wizardModalSheet, { backgroundColor: theme.surfaceElevated }]}>
            <View style={[styles.sheetHeader, { borderBottomColor: theme.borderSubtle }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.sheetIconWrap, { backgroundColor: `${theme.accent}20` }]}>
                  <Sparkles size={20} color={theme.accent} />
                </View>
                <View>
                  <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Nura AI Challenge Architect</Text>
                  <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
                    Automated Anti-Cheat Habit Design
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowNuraAiModal(false)}
                style={styles.sheetCloseBtn}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={{ flex: 1, paddingHorizontal: 16 }} 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 20, paddingTop: 16 }}
              ref={scrollViewRef}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {chatMessages.map((msg) => (
                <View key={msg.id} style={{ marginBottom: 16, flexDirection: msg.sender === 'nura' ? 'row' : 'row-reverse', gap: 12 }}>
                  {msg.sender === 'nura' && (
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={16} color="#fff" />
                    </View>
                  )}
                  <View style={{ 
                    maxWidth: '85%', 
                    backgroundColor: msg.sender === 'nura' ? (isDark ? '#1e293b' : '#f1f5f9') : theme.accent, 
                    padding: 14, 
                    borderRadius: 18, 
                    borderTopLeftRadius: msg.sender === 'nura' ? 4 : 18,
                    borderTopRightRadius: msg.sender === 'nura' ? 18 : 4
                  }}>
                    <Text style={{ color: msg.sender === 'nura' ? theme.textPrimary : '#fff', fontSize: 15, lineHeight: 22 }}>
                      {msg.text}
                    </Text>
                    
                    {msg.isBlueprint && msg.blueprintData && (
                      <View style={[styles.previewCard, { backgroundColor: theme.surfaceElevated, borderColor: '#16a34a', marginHorizontal: 0, marginTop: 12, width: '100%' }]}>
                        <View style={styles.previewCardInner}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Target size={14} color="#16a34a" />
                              <Text style={styles.previewCategory}>{msg.blueprintData.category}</Text>
                            </View>
                            <View style={styles.previewDurationBadge}>
                              <Text style={styles.previewDurationText}>{msg.blueprintData.durationDays} Days</Text>
                            </View>
                          </View>
                          
                          <Text style={[styles.previewTitle, { color: theme.textPrimary }]}>{msg.blueprintData.title}</Text>
                          <Text style={[styles.previewDesc, { color: theme.textSecondary }]}>{msg.blueprintData.description}</Text>
                          
                          <View style={[styles.previewVerificationBox, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}>
                            <CheckCircle2 size={16} color="#64748b" />
                            <Text style={[styles.previewVerificationText, { color: theme.textSecondary }]}>
                              Requires Daily Check-in
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))}
              
              {isNuraGenerating && (
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.accent, alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} color="#fff" />
                  </View>
                  <View style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9', padding: 14, borderRadius: 18, borderTopLeftRadius: 4 }}>
                    <Text style={{ color: theme.textPrimary, fontSize: 15, fontStyle: 'italic' }}>Nura is thinking...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={[styles.wizardFooter, { borderTopColor: theme.borderSubtle, backgroundColor: isDark ? '#1e293b' : '#ffffff', flexDirection: 'column', gap: 12, paddingBottom: 16 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' }}>
                <TextInput
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderWidth: 1,
                    borderColor: theme.borderSubtle,
                    borderRadius: 24,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 15,
                    color: theme.textPrimary,
                  }}
                  placeholder="Describe your challenge..."
                  placeholderTextColor={theme.textSecondary}
                  value={nuraPrompt}
                  onChangeText={setNuraPrompt}
                  onSubmitEditing={() => {
                    if (!nuraPrompt.trim()) return;
                    
                    const userMsg = { id: Date.now().toString(), sender: 'user', text: nuraPrompt.trim() };
                    setChatMessages(prev => [...prev, userMsg]);
                    setNuraPrompt('');
                    setIsNuraGenerating(true);
                    
                    setTimeout(() => {
                      setIsNuraGenerating(false);
                      const aiMsg = { 
                        id: (Date.now() + 1).toString(), 
                        sender: 'nura', 
                        text: "I've drafted a challenge based on your idea! Here is the blueprint. You can launch it now or tell me what to change.",
                        isBlueprint: true,
                        blueprintData: {
                          title: "100 Deep Squats Morning War",
                          description: "Build leg strength and morning discipline. Must be completed before 9 AM.",
                          category: "Fitness",
                          durationDays: 30,
                          dailyGoal: "100 Squats",
                        }
                      };
                      setChatMessages(prev => [...prev, aiMsg]);
                    }, 1500);
                  }}
                />
                <TouchableOpacity
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: theme.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: nuraPrompt.trim() ? 1 : 0.5
                  }}
                  disabled={!nuraPrompt.trim() || isNuraGenerating}
                  onPress={() => {
                    if (!nuraPrompt.trim()) return;
                    
                    const userMsg = { id: Date.now().toString(), sender: 'user', text: nuraPrompt.trim() };
                    setChatMessages(prev => [...prev, userMsg]);
                    setNuraPrompt('');
                    setIsNuraGenerating(true);
                    
                    setTimeout(() => {
                      setIsNuraGenerating(false);
                      const aiMsg = { 
                        id: (Date.now() + 1).toString(), 
                        sender: 'nura', 
                        text: "I've drafted a challenge based on your idea! Here is the blueprint. You can launch it now or tell me what to change.",
                        isBlueprint: true,
                        blueprintData: {
                          title: "100 Deep Squats Morning War",
                          description: "Build leg strength and morning discipline. Must be completed before 9 AM.",
                          category: "Fitness",
                          durationDays: 30,
                          dailyGoal: "100 Squats",
                        }
                      };
                      setChatMessages(prev => [...prev, aiMsg]);
                    }, 1500);
                  }}
                >
                  <ChevronRight size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <WalletRewardsModal visible={showWallet} onClose={() => setShowWallet(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 8,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  createChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createChallengeBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillsRow: {
    gap: 8,
    paddingBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
  },
  celebrationMessage: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  challengesList: {
    gap: 14,
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 0,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  difficultyBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  challengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    lineHeight: 18,
  },
  challengeDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  streakBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ea580c',
  },
  progressContainer: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  creatorText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinBtnActive: {
    backgroundColor: '#f1f5f9',
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  joinBtnTextActive: {
    color: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sheetIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sheetBody: {
    padding: 20,
  },
  sheetDescText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginBottom: 16,
  },
  goalBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  goalBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
  },
  goalBoxDesc: {
    fontSize: 13,
    color: '#15803d',
    marginTop: 2,
    lineHeight: 18,
  },
  timelineSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
    minWidth: 44,
  },
  dayPillCompleted: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  dayPillCurrent: {
    borderColor: '#16a34a',
    borderWidth: 1.5,
  },
  dayPillNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  dayPillNumberCompleted: {
    color: '#16a34a',
  },
  dayPillNumberCurrent: {
    color: '#0f172a',
  },
  dayDotEmpty: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cbd5e1',
  },
  rulesSection: {
    marginBottom: 20,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  ruleBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16a34a',
    marginTop: 7,
  },
  ruleText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    flex: 1,
  },
  sheetFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  completeTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  completeTodayBtnDone: {
    backgroundColor: '#059669',
  },
  completeTodayBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  joinPrimaryBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  joinPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  wizardStepWrap: {
    gap: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChoice: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChoiceActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryChoiceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChoiceTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  durationBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  durationBtnTextActive: {
    color: '#ffffff',
  },
  privacyCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  privacyCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  privacyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  privacyCardSub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  previewCard: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  previewCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  previewDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  previewMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  previewMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
  },
  wizardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  wizardBackBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  wizardBackBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  wizardNextBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  wizardNextBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  wizardPublishBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  wizardPublishBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
