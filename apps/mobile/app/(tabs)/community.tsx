import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  MessageSquare,
  Heart,
  X,
  Send,
  Share2,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react-native';

import {
  CommunityPrimaryTab,
  CommunityGroup,
  CommunityChallenge,
  CommunityDiscussion,
  SuggestedPerson,
  DirectThread,
  DirectMessage,
} from '../../src/types/communityTypes';

import {
  INITIAL_COMMUNITY_GROUPS,
  INITIAL_COMMUNITY_CHALLENGES,
  INITIAL_COMMUNITY_DISCUSSIONS,
  INITIAL_SUGGESTED_PEOPLE,
  INITIAL_DIRECT_THREADS,
} from '../../src/data/communityData';

import CommunityNavBar from '../../src/components/community/CommunityNavBar';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useAuthStore } from '../../src/store';
import { useCommunityRealtime } from '../../src/hooks/useCommunityRealtime';
import DiscoveryHub from '../../src/components/community/DiscoveryHub';
import ChallengesHub from '../../src/components/community/ChallengesHub';
import CommunityGroupsHub from '../../src/components/community/CommunityGroupsHub';
import InboxHub from '../../src/components/community/InboxHub';
import ReportModal from '../../src/components/community/ReportModal';

export default function CommunityCenterScreen() {
  const { theme, isDark } = useTheme();
  const { user: authUser } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = authUser || storeUser;

  // Supabase Realtime Community Synchronization
  const {
    discussions,
    createPost: realtimeCreatePost,
    toggleSupport: realtimeToggleSupport,
    isRealtimeActive,
  } = useCommunityRealtime(currentUser);

  // 1. Root Tab State (Discovery | Challenges | Community | Inbox)
  const [activeTab, setActiveTab] = useState<CommunityPrimaryTab>('discovery');

  // 2. Main Community State
  const [groups, setGroups] = useState<CommunityGroup[]>(INITIAL_COMMUNITY_GROUPS);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(INITIAL_COMMUNITY_CHALLENGES);
  const [people, setPeople] = useState<SuggestedPerson[]>(INITIAL_SUGGESTED_PEOPLE);
  const [threads, setThreads] = useState<DirectThread[]>(INITIAL_DIRECT_THREADS);

  // 3. Selection & Modal States
  const [selectedDiscussion, setSelectedDiscussion] = useState<CommunityDiscussion | null>(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [messagingPrivacy, setMessagingPrivacy] = useState<'Everyone' | 'Group Members' | 'Nobody'>('Group Members');
  const [activityPrivacy, setActivityPrivacy] = useState(true);

  // 4. Report Modal State
  const [reportConfig, setReportConfig] = useState<{
    visible: boolean;
    type: 'post' | 'group' | 'discussion' | 'user';
    title: string;
  }>({
    visible: false,
    type: 'discussion',
    title: '',
  });

  // Calculate unread message count for bottom nav badge
  const totalUnreadCount = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);
  const hasActiveChallenges = challenges.some((c) => c.isJoined && !c.isCompleted);

  // Toggle Group Membership
  const handleToggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const isNowJoined = !g.joined;
          return {
            ...g,
            joined: isNowJoined,
            role: isNowJoined ? 'Member' : undefined,
          };
        }
        return g;
      })
    );
  };

  // Toggle Challenge Membership
  const handleToggleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const isNowJoined = !c.isJoined;
          return {
            ...c,
            isJoined: isNowJoined,
            participantsCount: isNowJoined
              ? c.participantsCount + 1
              : Math.max(0, c.participantsCount - 1),
          };
        }
        return c;
      })
    );
  };

  // Complete Day for Challenge
  const handleCompleteDay = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === challengeId) {
          const isAlreadyCompletedToday = c.completedDays.includes(c.currentDay);
          if (isAlreadyCompletedToday) return c;

          const updatedDays = [...c.completedDays, c.currentDay];
          const nextDay = Math.min(c.durationDays, c.currentDay + 1);
          const isCompleted = updatedDays.length >= c.durationDays;

          return {
            ...c,
            completedDays: updatedDays,
            currentDay: isCompleted ? c.currentDay : nextDay,
            streak: c.streak + 1,
            isCompleted,
          };
        }
        return c;
      })
    );
  };

  // Create Challenge
  const handleCreateChallenge = (newChallengeData: Partial<CommunityChallenge>) => {
    const newChallenge: CommunityChallenge = {
      id: 'ch_' + Date.now(),
      title: newChallengeData.title || 'Untitled Challenge',
      category: newChallengeData.category || 'Fitness',
      description: newChallengeData.description || '',
      creator: 'You',
      creatorBadge: 'Member',
      participantsCount: 1,
      durationDays: newChallengeData.durationDays || 7,
      difficulty: newChallengeData.difficulty || 'Easy',
      startDate: 'Today',
      endDate: `${newChallengeData.durationDays || 7} Days`,
      rules: newChallengeData.rules || ['Stay consistent and listen to your body.'],
      dailyGoal: newChallengeData.dailyGoal || 'Daily wellness check-in',
      currentDay: 1,
      streak: 1,
      isJoined: true,
      isCompleted: false,
      completedDays: [1],
      coverColor: '#16a34a',
      iconName: 'Flame',
    };
    setChallenges([newChallenge, ...challenges]);
  };

  // Create Discussion / Post with Media
  const handleCreateDiscussion = (newDiscussionData: Partial<CommunityDiscussion>) => {
    const mediaItem = newDiscussionData.media && newDiscussionData.media.length > 0 ? newDiscussionData.media[0] : undefined;
    realtimeCreatePost(
      newDiscussionData.content || '',
      newDiscussionData.groupName || 'Community',
      mediaItem ? { url: mediaItem.url, type: mediaItem.type } : undefined
    );
    Alert.alert('Post Published', 'Your story and media has been shared with the NuraCare Community!');
  };

  // Create Group
  const handleCreateGroup = (newGroupData: Partial<CommunityGroup>) => {
    const newGroup: CommunityGroup = {
      id: 'grp_' + Date.now(),
      name: newGroupData.name || 'New Community',
      category: newGroupData.category || 'General Wellness',
      description: newGroupData.description || '',
      iconName: 'Users',
      membersCount: '1',
      privacy: newGroupData.privacy || 'Public',
      joined: true,
      role: 'Owner',
      coverGradient: ['#16a34a', '#14532d'],
      activeChallengesCount: 0,
      recentDiscussionsCount: 0,
      rules: newGroupData.rules || ['Be respectful and support positive wellness habits.'],
    };
    setGroups([newGroup, ...groups]);
  };

  // Toggle Discussion Support (Reaction)
  const handleToggleSupportDiscussion = (discussionId: string) => {
    realtimeToggleSupport(discussionId);

    if (selectedDiscussion && selectedDiscussion.id === discussionId) {
      const supported = !selectedDiscussion.userSupported;
      setSelectedDiscussion({
        ...selectedDiscussion,
        userSupported: supported,
        supportCount: supported
          ? selectedDiscussion.supportCount + 1
          : Math.max(0, selectedDiscussion.supportCount - 1),
      });
    }
  };

  // Post new discussion in group
  const handlePostDiscussion = (groupId: string, title: string, content: string) => {
    const targetGroup = groups.find((g) => g.id === groupId);
    const newDiscussion: CommunityDiscussion = {
      id: 'disc_' + Date.now(),
      groupId,
      groupName: targetGroup ? targetGroup.name : 'Community',
      author: 'You',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      title,
      content,
      supportCount: 0,
      userSupported: false,
      commentCount: 0,
      replies: [],
    };
    setDiscussions([newDiscussion, ...discussions]);
  };

  // Add reply to discussion
  const handleAddReply = () => {
    if (!replyInputText.trim() || !selectedDiscussion) return;
    const newReply = {
      id: 'rep_' + Date.now(),
      author: 'You',
      authorRole: 'Member',
      avatarColor: '#16a34a',
      content: replyInputText.trim(),
      timestamp: 'Just now',
      supportCount: 0,
      userSupported: false,
    };

    const updatedDiscussion = {
      ...selectedDiscussion,
      commentCount: selectedDiscussion.commentCount + 1,
      replies: [...selectedDiscussion.replies, newReply],
    };

    setSelectedDiscussion(updatedDiscussion);
    setDiscussions((prev) =>
      prev.map((d) => (d.id === selectedDiscussion.id ? updatedDiscussion : d))
    );
    setReplyInputText('');
  };

  // Direct Message Send
  const handleSendMessage = (threadId: string, text: string) => {
    const newMsg: DirectMessage = {
      id: 'msg_' + Date.now(),
      sender: 'me',
      text,
      time: 'Just now',
      status: 'sent',
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            lastMessage: text,
            timeAgo: 'Just now',
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );
  };

  // Message Requests: Accept & Ignore
  const handleAcceptRequest = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isRequest: false } : t))
    );
    Alert.alert('Request Accepted', 'You can now message directly.');
  };

  const handleIgnoreRequest = (threadId: string) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    Alert.alert('Request Ignored', 'Message request removed.');
  };

  // Reporting Trigger
  const handleOpenReport = (type: 'post' | 'group' | 'discussion' | 'user', title: string) => {
    setReportConfig({
      visible: true,
      type,
      title,
    });
  };

  return (
    <View style={[styles.screenContainer, { backgroundColor: theme.background }]}>
      {/* Top Header Bar with Privacy Action */}
      <View style={[styles.topAppBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.brandTitleRow}>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>NuraCare Community</Text>
        </View>

        <TouchableOpacity
          style={[styles.privacyButton, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]}
          onPress={() => setShowPrivacyModal(true)}
          activeOpacity={0.8}
          accessibilityLabel="Privacy and Safety Settings"
        >
          <Lock size={14} color={theme.accent} />
          <Text style={[styles.privacyButtonText, { color: theme.accent }]}>Privacy</Text>
        </TouchableOpacity>
      </View>

      {/* Top 4-Tab Navigation Bar (Discovery | Challenges | Community | Inbox) */}
      <CommunityNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unreadCount={totalUnreadCount}
        hasActiveChallenge={hasActiveChallenges}
      />

      {/* Main Hub Content Area */}
      <View style={styles.hubContent}>
        {activeTab === 'discovery' && (
          <DiscoveryHub
            groups={groups}
            challenges={challenges}
            discussions={discussions}
            people={people}
            onSelectGroup={(grp) => {
              setActiveTab('community');
            }}
            onSelectChallenge={(ch) => {
              setActiveTab('challenges');
            }}
            onSelectDiscussion={(disc) => setSelectedDiscussion(disc)}
            onToggleJoinGroup={handleToggleJoinGroup}
            onToggleJoinChallenge={handleToggleJoinChallenge}
            onToggleSupportDiscussion={handleToggleSupportDiscussion}
            onReportItem={handleOpenReport}
            onCreateDiscussion={handleCreateDiscussion}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesHub
            challenges={challenges}
            onToggleJoin={handleToggleJoinChallenge}
            onCompleteDay={handleCompleteDay}
            onCreateChallenge={handleCreateChallenge}
          />
        )}

        {activeTab === 'community' && (
          <CommunityGroupsHub
            groups={groups}
            discussions={discussions}
            challenges={challenges}
            onToggleJoinGroup={handleToggleJoinGroup}
            onSelectDiscussion={(disc) => setSelectedDiscussion(disc)}
            onToggleSupportDiscussion={handleToggleSupportDiscussion}
            onCreateGroup={handleCreateGroup}
            onPostDiscussion={handlePostDiscussion}
            onReportItem={handleOpenReport}
            onCreateDiscussion={handleCreateDiscussion}
          />
        )}

        {activeTab === 'inbox' && (
          <InboxHub
            threads={threads}
            onSendMessage={handleSendMessage}
            onAcceptRequest={handleAcceptRequest}
            onIgnoreRequest={handleIgnoreRequest}
            onReportUser={(name) => handleOpenReport('user', name)}
          />
        )}
      </View>

      {/* ======================================================== */}
      {/* DISCUSSION THREAD MODAL                                  */}
      {/* ======================================================== */}
      {selectedDiscussion && (
        <Modal
          visible={!!selectedDiscussion}
          animationType="slide"
          onRequestClose={() => setSelectedDiscussion(null)}
        >
          <View style={[styles.discussionModalContainer, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
            <View style={[styles.discussionModalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
              <TouchableOpacity
                onPress={() => setSelectedDiscussion(null)}
                style={styles.discBackBtn}
              >
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.discModalHeaderTitle, { color: theme.textPrimary }]}>Discussion</Text>
              <TouchableOpacity
                onPress={() =>
                  handleOpenReport('discussion', selectedDiscussion.title)
                }
              >
                <ShieldAlert size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.discussionModalBody} contentContainerStyle={{ padding: 18 }}>
              {/* Topic Author Header */}
              <View style={styles.discAuthorRow}>
                <View style={[styles.avatarCircle, { backgroundColor: selectedDiscussion.avatarColor }]}>
                  <Text style={styles.avatarInitial}>{selectedDiscussion.author[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.discAuthorName, { color: theme.textPrimary }]}>{selectedDiscussion.author}</Text>
                  <Text style={[styles.discAuthorSub, { color: theme.textSecondary }]}>
                    in {selectedDiscussion.groupName || 'General Community'} • {selectedDiscussion.timeAgo}
                  </Text>
                </View>
              </View>

              {/* Topic Content */}
              <Text style={[styles.discFullTitle, { color: theme.textPrimary }]}>{selectedDiscussion.title}</Text>
              <Text style={[styles.discFullContent, { color: theme.textSecondary }]}>{selectedDiscussion.content}</Text>

              {/* Topic Support Reaction */}
              <View style={styles.discActionRow}>
                <TouchableOpacity
                  style={[
                    styles.discSupportBtn,
                    selectedDiscussion.userSupported && styles.discSupportBtnActive,
                  ]}
                  onPress={() => handleToggleSupportDiscussion(selectedDiscussion.id)}
                >
                  <Heart
                    size={16}
                    color={selectedDiscussion.userSupported ? '#dc2626' : '#64748b'}
                    fill={selectedDiscussion.userSupported ? '#dc2626' : 'none'}
                  />
                  <Text
                    style={[
                      styles.discSupportBtnText,
                      selectedDiscussion.userSupported && styles.discSupportBtnTextActive,
                    ]}
                  >
                    {selectedDiscussion.supportCount} Support
                  </Text>
                </TouchableOpacity>

                <View style={styles.discCommentCount}>
                  <MessageSquare size={15} color="#64748b" />
                  <Text style={styles.discCommentCountText}>
                    {selectedDiscussion.commentCount} Replies
                  </Text>
                </View>
              </View>

              {/* Replies Section */}
              <View style={styles.repliesList}>
                <Text style={[styles.repliesHeading, { color: theme.textPrimary }]}>Community Replies</Text>
                {selectedDiscussion.replies.length > 0 ? (
                  selectedDiscussion.replies.map((rep) => (
                    <View key={rep.id} style={[styles.replyCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                      <View style={styles.replyHeader}>
                        <View style={[styles.avatarCircleSmall, { backgroundColor: rep.avatarColor }]}>
                          <Text style={styles.avatarInitialSmall}>{rep.author[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.replyAuthor, { color: theme.textPrimary }]}>{rep.author}</Text>
                          <Text style={styles.replyTime}>{rep.timestamp}</Text>
                        </View>
                      </View>
                      <Text style={[styles.replyContent, { color: theme.textSecondary }]}>{rep.content}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noRepliesText}>
                    No replies yet. Be the first to share your thoughts below.
                  </Text>
                )}
              </View>
            </ScrollView>

            {/* Reply Input Bar */}
            <View style={[styles.replyComposerBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
              <TextInput
                style={[styles.replyInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
                placeholder="Write a supportive reply..."
                placeholderTextColor={theme.placeholderText}
                value={replyInputText}
                onChangeText={setReplyInputText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.replySendBtn,
                  !replyInputText.trim() && styles.replySendBtnDisabled,
                ]}
                onPress={handleAddReply}
                disabled={!replyInputText.trim()}
              >
                <Send size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* PRIVACY & SAFETY MODAL                                   */}
      {/* ======================================================== */}
      <Modal
        visible={showPrivacyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.privacyModalCard, { backgroundColor: theme.surfaceModal, borderColor: theme.border, borderWidth: 1 }]}>
            <View style={styles.privacyHeader}>
              <ShieldCheck size={20} color="#16a34a" />
              <Text style={[styles.privacyTitle, { color: theme.textPrimary }]}>Community Privacy & Safety</Text>
              <TouchableOpacity onPress={() => setShowPrivacyModal(false)}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.privacySectionHeading, { color: theme.textPrimary }]}>Who Can Message You</Text>
            {(['Everyone', 'Group Members', 'Nobody'] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.privacyOption,
                  messagingPrivacy === opt && styles.privacyOptionSelected,
                ]}
                onPress={() => setMessagingPrivacy(opt)}
              >
                <Text
                  style={[
                    styles.privacyOptionText,
                    messagingPrivacy === opt && styles.privacyOptionTextSelected,
                  ]}
                >
                  {opt}
                </Text>
                {messagingPrivacy === opt && <CheckCircle2 size={16} color="#16a34a" />}
              </TouchableOpacity>
            ))}

            <Text style={[styles.privacySectionHeading, { marginTop: 16 }]}>
              Health Data Protection
            </Text>
            <TouchableOpacity
              style={styles.privacyToggleRow}
              onPress={() => setActivityPrivacy(!activityPrivacy)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleRowTitle}>Share Challenge Progress</Text>
                <Text style={styles.toggleRowSub}>
                  Allows peers in joined challenges to celebrate your daily streaks. Sensitive biometrics are never shared.
                </Text>
              </View>
              <View
                style={[
                  styles.toggleSwitch,
                  activityPrivacy && styles.toggleSwitchActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    activityPrivacy && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.donePrivacyBtn}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.donePrivacyBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety & Moderation Report Modal */}
      <ReportModal
        visible={reportConfig.visible}
        onClose={() => setReportConfig({ ...reportConfig, visible: false })}
        targetType={reportConfig.type}
        targetTitle={reportConfig.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topAppBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  privacyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  privacyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
  },
  hubContent: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  privacyModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    marginLeft: 8,
  },
  privacySectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  privacyOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  privacyOptionText: {
    fontSize: 13,
    color: '#334155',
  },
  privacyOptionTextSelected: {
    fontWeight: '700',
    color: '#16a34a',
  },
  privacyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  toggleRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  toggleRowSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 15,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#16a34a',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  donePrivacyBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  donePrivacyBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  discussionModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  discussionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  discBackBtn: {
    padding: 6,
  },
  discModalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  discussionModalBody: {
    flex: 1,
  },
  discAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  discAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  discAuthorSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  discFullTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    lineHeight: 24,
  },
  discFullContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 16,
  },
  discActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  discSupportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discSupportBtnActive: {
    backgroundColor: '#fef2f2',
  },
  discSupportBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  discSupportBtnTextActive: {
    color: '#dc2626',
    fontWeight: '700',
  },
  discCommentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discCommentCountText: {
    fontSize: 13,
    color: '#64748b',
  },
  repliesList: {
    gap: 12,
  },
  repliesHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  replyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialSmall: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  replyTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  replyContent: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  noRepliesText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  replyComposerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    maxHeight: 80,
  },
  replySendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  replySendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});
