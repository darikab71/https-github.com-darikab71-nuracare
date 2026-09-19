import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Users,
  Plus,
  MessageSquare,
  Trophy,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Globe,
  EyeOff,
  ChevronRight,
  Heart,
  X,
  Share2,
  Sparkles,
  CheckCircle2,
  Send,
} from 'lucide-react-native';
import {
  CommunityGroup,
  CommunityDiscussion,
  CommunityChallenge,
} from '../../types/communityTypes';
import CommunityMascot from './CommunityMascot';

interface CommunityGroupsHubProps {
  groups: CommunityGroup[];
  discussions: CommunityDiscussion[];
  challenges: CommunityChallenge[];
  onToggleJoinGroup: (groupId: string) => void;
  onSelectDiscussion: (discussion: CommunityDiscussion) => void;
  onToggleSupportDiscussion: (discussionId: string) => void;
  onCreateGroup: (newGroup: Partial<CommunityGroup>) => void;
  onPostDiscussion: (groupId: string, title: string, content: string) => void;
  onReportItem: (type: 'post' | 'group' | 'discussion' | 'user', title: string) => void;
  initialSelectedGroup?: CommunityGroup | null;
}

type GroupDetailTab = 'Discussions' | 'Challenges' | 'Members' | 'About & Rules';

export default function CommunityGroupsHub({
  groups,
  discussions,
  challenges,
  onToggleJoinGroup,
  onSelectDiscussion,
  onToggleSupportDiscussion,
  onCreateGroup,
  onPostDiscussion,
  onReportItem,
  initialSelectedGroup = null,
}: CommunityGroupsHubProps) {
  const [selectedGroup, setSelectedGroup] = useState<CommunityGroup | null>(initialSelectedGroup);
  const [groupDetailTab, setGroupDetailTab] = useState<GroupDetailTab>('Discussions');

  // Create Group Wizard state
  const [showCreateGroupWizard, setShowCreateGroupWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCat, setNewGroupCat] = useState('Cardio & Athletics');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'Public' | 'Private' | 'Hidden'>('Public');
  const [newGroupRule1, setNewGroupRule1] = useState('Be respectful, constructive, and supportive.');
  const [newGroupRule2, setNewGroupRule2] = useState('Stay focused on personal wellness and positive habits.');
  const [newGroupRule3, setNewGroupRule3] = useState('No medical misinformation or unsolicited selling.');

  // New Discussion in Group modal
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [discTitle, setDiscTitle] = useState('');
  const [discContent, setDiscContent] = useState('');

  // Filtering groups
  const myGroups = groups.filter((g) => g.joined);
  const suggestedGroups = groups.filter((g) => !g.joined);

  const groupTabs: GroupDetailTab[] = ['Discussions', 'Challenges', 'Members', 'About & Rules'];

  const handlePublishGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert('Name required', 'Please enter a name for your community.');
      return;
    }
    onCreateGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'A supportive NuraCare wellness community.',
      category: newGroupCat,
      privacy: newGroupPrivacy,
      joined: true,
      role: 'Owner',
      membersCount: '1',
      activeChallengesCount: 0,
      recentDiscussionsCount: 0,
      coverGradient: ['#16a34a', '#14532d'],
      iconName: 'Users',
      rules: [newGroupRule1, newGroupRule2, newGroupRule3].filter((r) => r.trim().length > 0),
    });

    setShowCreateGroupWizard(false);
    setWizardStep(1);
    setNewGroupName('');
    setNewGroupDesc('');
    Alert.alert('Community Created', 'Your new community is ready for members!');
  };

  const handleCreateDiscussion = () => {
    if (!discTitle.trim() || !discContent.trim()) {
      Alert.alert('Required', 'Please enter both a title and topic details.');
      return;
    }
    if (selectedGroup) {
      onPostDiscussion(selectedGroup.id, discTitle.trim(), discContent.trim());
    }
    setShowNewDiscussionModal(false);
    setDiscTitle('');
    setDiscContent('');
    Alert.alert('Discussion Posted', 'Your topic is now active in the community.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header with Create Group */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerBadge}>
            <Users size={13} color="#16a34a" />
            <Text style={styles.headerBadgeText}>Belong & Participate</Text>
          </View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Find your people and grow together.</Text>
        </View>

        <TouchableOpacity
          style={styles.createGroupBtn}
          onPress={() => setShowCreateGroupWizard(true)}
          activeOpacity={0.85}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.createGroupBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* 2. My Communities Section */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>My Communities ({myGroups.length})</Text>
        {myGroups.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.myGroupsScroll}>
            {myGroups.map((grp) => (
              <TouchableOpacity
                key={grp.id}
                style={styles.myGroupCard}
                onPress={() => setSelectedGroup(grp)}
                activeOpacity={0.88}
              >
                <View style={styles.myGroupIcon}>
                  <Users size={20} color="#16a34a" />
                </View>
                <Text style={styles.myGroupName} numberOfLines={1}>
                  {grp.name}
                </Text>
                <Text style={styles.myGroupCategory}>{grp.category}</Text>
                <View style={styles.myGroupMetaRow}>
                  <Text style={styles.myGroupMetaText}>{grp.membersCount} members</Text>
                  {grp.role && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{grp.role}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <CommunityMascot
            mood="welcome"
            message="No joined communities yet"
            subtext="Browse suggested communities below and find peers who share your goals."
          />
        )}
      </View>

      {/* 3. Suggested & Active Communities */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Suggested For You</Text>
        <Text style={styles.sectionSub}>Active groups building sustainable wellness habits</Text>

        <View style={styles.suggestedList}>
          {suggestedGroups.map((grp) => (
            <TouchableOpacity
              key={grp.id}
              style={styles.groupCard}
              onPress={() => setSelectedGroup(grp)}
              activeOpacity={0.88}
            >
              <View style={styles.groupCardHeader}>
                <View style={styles.groupCardIcon}>
                  <Users size={20} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupCardName}>{grp.name}</Text>
                  <Text style={styles.groupCardMeta}>
                    {grp.membersCount} members • {grp.privacy}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleJoinGroup(grp.id);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.joinBtnText}>Join</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.groupCardDesc} numberOfLines={2}>
                {grp.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 4. Recent Discussions from Communities */}
      <View style={styles.sectionWrap}>
        <Text style={styles.sectionTitle}>Recent Discussions</Text>
        <Text style={styles.sectionSub}>Live questions and wellness reflections</Text>

        <View style={styles.discussionsList}>
          {discussions.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={styles.discussionCard}
              onPress={() => onSelectDiscussion(d)}
              activeOpacity={0.88}
            >
              <View style={styles.discussionHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: d.avatarColor }]}>
                  <Text style={styles.avatarInitial}>{d.author[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.discussionAuthor}>{d.author}</Text>
                  <Text style={styles.discussionMeta}>
                    in {d.groupName || 'Community'} • {d.timeAgo}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onReportItem('discussion', d.title)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <ShieldAlert size={14} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.discussionTitle}>{d.title}</Text>
              <Text style={styles.discussionSnippet} numberOfLines={2}>
                {d.content}
              </Text>

              <View style={styles.discussionFooter}>
                <TouchableOpacity
                  style={[
                    styles.supportBtn,
                    d.userSupported && styles.supportBtnActive,
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleSupportDiscussion(d.id);
                  }}
                >
                  <Heart
                    size={14}
                    color={d.userSupported ? '#dc2626' : '#64748b'}
                    fill={d.userSupported ? '#dc2626' : 'none'}
                  />
                  <Text
                    style={[
                      styles.supportBtnText,
                      d.userSupported && styles.supportBtnTextActive,
                    ]}
                  >
                    {d.supportCount} Support
                  </Text>
                </TouchableOpacity>

                <View style={styles.commentCountWrap}>
                  <MessageSquare size={13} color="#64748b" />
                  <Text style={styles.commentCountText}>{d.commentCount} replies</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ======================================================== */}
      {/* 5. GROUP DETAIL VIEW MODAL (NO "HOME" TAB AS REQUESTED)  */}
      {/* ======================================================== */}
      {selectedGroup && (
        <Modal
          visible={!!selectedGroup}
          animationType="slide"
          onRequestClose={() => setSelectedGroup(null)}
        >
          <View style={styles.groupModalContainer}>
            {/* Group Modal Header */}
            <View style={styles.groupModalHeader}>
              <TouchableOpacity
                style={styles.backModalBtn}
                onPress={() => setSelectedGroup(null)}
              >
                <X size={20} color="#0f172a" />
              </TouchableOpacity>
              <View style={styles.groupModalHeaderActions}>
                <TouchableOpacity
                  style={styles.shareBtn}
                  onPress={() => Alert.alert('Share Link', `Group link copied for ${selectedGroup.name}.`)}
                >
                  <Share2 size={16} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onReportItem('group', selectedGroup.name)}
                >
                  <ShieldAlert size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.groupModalBody}>
              {/* Group Hero Banner */}
              <View style={styles.groupHeroBanner}>
                <View style={styles.groupHeroIconCircle}>
                  <Users size={28} color="#16a34a" />
                </View>
                <Text style={styles.groupHeroTitle}>{selectedGroup.name}</Text>
                <Text style={styles.groupHeroCategory}>{selectedGroup.category}</Text>

                <View style={styles.groupHeroMetaRow}>
                  <View style={styles.heroMetaItem}>
                    <Users size={13} color="#64748b" />
                    <Text style={styles.heroMetaText}>{selectedGroup.membersCount} members</Text>
                  </View>
                  <View style={styles.heroMetaItem}>
                    <ShieldCheck size={13} color="#16a34a" />
                    <Text style={styles.heroMetaText}>{selectedGroup.privacy}</Text>
                  </View>
                </View>

                {/* Join / Joined Button */}
                <TouchableOpacity
                  style={[
                    styles.heroJoinBtn,
                    selectedGroup.joined && styles.heroJoinBtnJoined,
                  ]}
                  onPress={() => {
                    onToggleJoinGroup(selectedGroup.id);
                    setSelectedGroup({
                      ...selectedGroup,
                      joined: !selectedGroup.joined,
                    });
                  }}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.heroJoinBtnText,
                      selectedGroup.joined && styles.heroJoinBtnTextJoined,
                    ]}
                  >
                    {selectedGroup.joined ? 'Joined Community ✓' : '+ Join Community'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TABS: Discussions | Challenges | Members | About & Rules (NO HOME TAB) */}
              <View style={styles.groupTabsBar}>
                {groupTabs.map((tab) => {
                  const isActive = groupDetailTab === tab;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[styles.groupTabItem, isActive && styles.groupTabItemActive]}
                      onPress={() => setGroupDetailTab(tab)}
                    >
                      <Text
                        style={[
                          styles.groupTabItemText,
                          isActive && styles.groupTabItemTextActive,
                        ]}
                      >
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* TAB CONTENT: Discussions */}
              {groupDetailTab === 'Discussions' && (
                <View style={styles.tabContentSection}>
                  <View style={styles.tabContentHeader}>
                    <Text style={styles.tabContentHeading}>Group Conversations</Text>
                    <TouchableOpacity
                      style={styles.newDiscussionBtn}
                      onPress={() => setShowNewDiscussionModal(true)}
                    >
                      <Plus size={14} color="#ffffff" />
                      <Text style={styles.newDiscussionBtnText}>New Topic</Text>
                    </TouchableOpacity>
                  </View>

                  {discussions.filter((d) => d.groupId === selectedGroup.id).length > 0 ? (
                    discussions
                      .filter((d) => d.groupId === selectedGroup.id)
                      .map((d) => (
                        <TouchableOpacity
                          key={d.id}
                          style={styles.groupDiscussionCard}
                          onPress={() => onSelectDiscussion(d)}
                        >
                          <Text style={styles.groupDiscTitle}>{d.title}</Text>
                          <Text style={styles.groupDiscSnippet} numberOfLines={2}>
                            {d.content}
                          </Text>
                          <View style={styles.groupDiscFooter}>
                            <Text style={styles.groupDiscAuthor}>By {d.author}</Text>
                            <Text style={styles.groupDiscReplies}>{d.commentCount} replies</Text>
                          </View>
                        </TouchableOpacity>
                      ))
                  ) : (
                    <CommunityMascot
                      mood="curious"
                      message="No discussions yet"
                      subtext="Be the first to share a question or wellness reflection in this group."
                    />
                  )}
                </View>
              )}

              {/* TAB CONTENT: Challenges */}
              {groupDetailTab === 'Challenges' && (
                <View style={styles.tabContentSection}>
                  <Text style={styles.tabContentHeading}>Active Group Challenges</Text>
                  {challenges.slice(0, 2).map((ch) => (
                    <View key={ch.id} style={styles.groupChallengeCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.groupChallengeTitle}>{ch.title}</Text>
                        <Text style={styles.groupChallengeDesc} numberOfLines={2}>
                          {ch.description}
                        </Text>
                        <Text style={styles.groupChallengeMeta}>
                          {ch.durationDays} Days • {ch.participantsCount} participants
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* TAB CONTENT: Members */}
              {groupDetailTab === 'Members' && (
                <View style={styles.tabContentSection}>
                  <Text style={styles.tabContentHeading}>Community Members</Text>
                  <View style={styles.membersList}>
                    <View style={styles.memberRow}>
                      <View style={[styles.avatarCircle, { backgroundColor: '#16a34a' }]}>
                        <Text style={styles.avatarInitial}>DA</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>Dawit Alemu</Text>
                        <Text style={styles.memberRole}>Community Lead</Text>
                      </View>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>Owner</Text>
                      </View>
                    </View>
                    <View style={styles.memberRow}>
                      <View style={[styles.avatarCircle, { backgroundColor: '#4f46e5' }]}>
                        <Text style={styles.avatarInitial}>EB</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>Eleni Berhanu</Text>
                        <Text style={styles.memberRole}>Senior Member</Text>
                      </View>
                      <View style={[styles.roleBadge, { backgroundColor: '#eef2ff' }]}>
                        <Text style={[styles.roleBadgeText, { color: '#4f46e5' }]}>Moderator</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* TAB CONTENT: About & Rules */}
              {groupDetailTab === 'About & Rules' && (
                <View style={styles.tabContentSection}>
                  <Text style={styles.tabContentHeading}>About This Community</Text>
                  <Text style={styles.aboutDescText}>{selectedGroup.description}</Text>

                  <Text style={[styles.tabContentHeading, { marginTop: 20 }]}>
                    Community Rules
                  </Text>
                  <View style={styles.rulesList}>
                    {selectedGroup.rules.map((rule, idx) => (
                      <View key={idx} style={styles.ruleCard}>
                        <View style={styles.ruleNumberCircle}>
                          <Text style={styles.ruleNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.ruleContentText}>{rule}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* 6. CREATE GROUP WIZARD MODAL                             */}
      {/* ======================================================== */}
      <Modal
        visible={showCreateGroupWizard}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateGroupWizard(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Create Community</Text>
                <Text style={styles.sheetSubtitle}>Step {wizardStep} of 4</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowCreateGroupWizard(false)}
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
                    Give your community a clear, welcoming name and mission.
                  </Text>

                  <Text style={styles.inputLabel}>Community Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Addis Sunrise Runners"
                    placeholderTextColor="#94a3b8"
                    value={newGroupName}
                    onChangeText={setNewGroupName}
                  />

                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, { minHeight: 64 }]}
                    placeholder="Describe what members connect over..."
                    placeholderTextColor="#94a3b8"
                    value={newGroupDesc}
                    onChangeText={setNewGroupDesc}
                    multiline
                  />

                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Cardio & Athletics"
                    placeholderTextColor="#94a3b8"
                    value={newGroupCat}
                    onChangeText={setNewGroupCat}
                  />
                </View>
              )}

              {wizardStep === 2 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Privacy & Membership</Text>
                  <Text style={styles.stepDesc}>Decide who can discover and participate.</Text>

                  <TouchableOpacity
                    style={[
                      styles.privacyCard,
                      newGroupPrivacy === 'Public' && styles.privacyCardActive,
                    ]}
                    onPress={() => setNewGroupPrivacy('Public')}
                  >
                    <View style={styles.privacyCardHeader}>
                      <Globe size={18} color="#16a34a" />
                      <Text style={styles.privacyCardTitle}>Public</Text>
                    </View>
                    <Text style={styles.privacyCardSub}>
                      Anyone can discover and join this community immediately.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.privacyCard,
                      newGroupPrivacy === 'Private' && styles.privacyCardActive,
                    ]}
                    onPress={() => setNewGroupPrivacy('Private')}
                  >
                    <View style={styles.privacyCardHeader}>
                      <Lock size={18} color="#4f46e5" />
                      <Text style={styles.privacyCardTitle}>Private (Approval)</Text>
                    </View>
                    <Text style={styles.privacyCardSub}>
                      Discoverable, but new members require moderator approval.
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.privacyCard,
                      newGroupPrivacy === 'Hidden' && styles.privacyCardActive,
                    ]}
                    onPress={() => setNewGroupPrivacy('Hidden')}
                  >
                    <View style={styles.privacyCardHeader}>
                      <EyeOff size={18} color="#64748b" />
                      <Text style={styles.privacyCardTitle}>Hidden (Invite Only)</Text>
                    </View>
                    <Text style={styles.privacyCardSub}>
                      Only members with a direct link can view or join.
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {wizardStep === 3 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Community Rules</Text>
                  <Text style={styles.stepDesc}>
                    Set expectations to keep your space safe, encouraging, and focused.
                  </Text>

                  <Text style={styles.inputLabel}>Rule 1</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGroupRule1}
                    onChangeText={setNewGroupRule1}
                  />

                  <Text style={styles.inputLabel}>Rule 2</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGroupRule2}
                    onChangeText={setNewGroupRule2}
                  />

                  <Text style={styles.inputLabel}>Rule 3</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newGroupRule3}
                    onChangeText={setNewGroupRule3}
                  />
                </View>
              )}

              {wizardStep === 4 && (
                <View style={styles.wizardStepWrap}>
                  <Text style={styles.stepTitle}>Review & Create</Text>
                  <Text style={styles.stepDesc}>Preview your new community card.</Text>

                  <View style={styles.previewCard}>
                    <View style={styles.previewIcon}>
                      <Users size={22} color="#16a34a" />
                    </View>
                    <Text style={styles.previewTitle}>{newGroupName || 'New Community'}</Text>
                    <Text style={styles.previewCat}>{newGroupCat} • {newGroupPrivacy}</Text>
                    <Text style={styles.previewDesc}>
                      {newGroupDesc || 'A dedicated community for shared wellness progress.'}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.wizardFooter}>
              {wizardStep > 1 && (
                <TouchableOpacity
                  style={styles.wizardBackBtn}
                  onPress={() => setWizardStep((prev) => (prev - 1) as any)}
                >
                  <Text style={styles.wizardBackBtnText}>Back</Text>
                </TouchableOpacity>
              )}

              {wizardStep < 4 ? (
                <TouchableOpacity
                  style={styles.wizardNextBtn}
                  onPress={() => {
                    if (wizardStep === 1 && !newGroupName.trim()) {
                      Alert.alert('Name required', 'Please enter a name for your community.');
                      return;
                    }
                    setWizardStep((prev) => (prev + 1) as any);
                  }}
                >
                  <Text style={styles.wizardNextBtnText}>Next Step</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.wizardPublishBtn}
                  onPress={handlePublishGroup}
                >
                  <Text style={styles.wizardPublishBtnText}>Create Community</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* 7. NEW DISCUSSION COMPOSER MODAL                         */}
      {/* ======================================================== */}
      <Modal
        visible={showNewDiscussionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewDiscussionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Start a Discussion</Text>
              <TouchableOpacity
                onPress={() => setShowNewDiscussionModal(false)}
                style={styles.sheetCloseBtn}
              >
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20, gap: 12 }}>
              <Text style={styles.inputLabel}>Topic Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What question or reflection would you like to share?"
                placeholderTextColor="#94a3b8"
                value={discTitle}
                onChangeText={setDiscTitle}
              />

              <Text style={styles.inputLabel}>Details & Thoughts</Text>
              <TextInput
                style={[styles.textInput, { minHeight: 100 }]}
                placeholder="Share your experience or context..."
                placeholderTextColor="#94a3b8"
                value={discContent}
                onChangeText={setDiscContent}
                multiline
              />

              <TouchableOpacity
                style={styles.submitDiscBtn}
                onPress={handleCreateDiscussion}
              >
                <Send size={16} color="#ffffff" />
                <Text style={styles.submitDiscBtnText}>Post Discussion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
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
  createGroupBtn: {
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
  createGroupBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionWrap: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  myGroupsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  myGroupCard: {
    width: 170,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  myGroupIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  myGroupName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  myGroupCategory: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 10,
  },
  myGroupMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  myGroupMetaText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  roleBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  suggestedList: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  groupCardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  groupCardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  groupCardMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  groupCardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  discussionsList: {
    gap: 12,
  },
  discussionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  discussionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  discussionAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  discussionMeta: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  discussionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 19,
  },
  discussionSnippet: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  supportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  supportBtnActive: {
    backgroundColor: '#fef2f2',
  },
  supportBtnText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  supportBtnTextActive: {
    color: '#dc2626',
    fontWeight: '700',
  },
  commentCountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  commentCountText: {
    fontSize: 12,
    color: '#64748b',
  },
  groupModalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  groupModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backModalBtn: {
    padding: 6,
  },
  groupModalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shareBtn: {
    padding: 6,
  },
  groupModalBody: {
    flex: 1,
  },
  groupHeroBanner: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  groupHeroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
  },
  groupHeroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 4,
  },
  groupHeroCategory: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '600',
    marginBottom: 10,
  },
  groupHeroMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  heroJoinBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroJoinBtnJoined: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  heroJoinBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  heroJoinBtnTextJoined: {
    color: '#16a34a',
  },
  groupTabsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  groupTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  groupTabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#16a34a',
  },
  groupTabItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  groupTabItemTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  tabContentSection: {
    padding: 16,
  },
  tabContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  tabContentHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  newDiscussionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newDiscussionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  groupDiscussionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  groupDiscTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  groupDiscSnippet: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  groupDiscFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupDiscAuthor: {
    fontSize: 11,
    color: '#94a3b8',
  },
  groupDiscReplies: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  groupChallengeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
  },
  groupChallengeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  groupChallengeDesc: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  groupChallengeMeta: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  membersList: {
    gap: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  memberRole: {
    fontSize: 12,
    color: '#64748b',
  },
  aboutDescText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
    marginTop: 8,
  },
  rulesList: {
    gap: 10,
    marginTop: 10,
  },
  ruleCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  ruleNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  ruleContentText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    flex: 1,
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
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  privacyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  privacyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
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
    alignItems: 'center',
    gap: 6,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  previewCat: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  previewDesc: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
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
  submitDiscBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  submitDiscBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
