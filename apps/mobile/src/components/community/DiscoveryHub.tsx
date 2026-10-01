import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {
  Search,
  X,
  Compass,
  Users,
  Trophy,
  MessageSquare,
  Sparkles,
  Heart,
  ChevronRight,
  ShieldCheck,
  Flame,
  Droplets,
  Moon,
  Clock,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Play,
} from 'lucide-react-native';
import {
  CommunityGroup,
  CommunityChallenge,
  CommunityDiscussion,
  SuggestedPerson,
} from '../../types/communityTypes';
import { useTheme } from '../../context/ThemeContext';
import CommunityWelcomeCard from './CommunityWelcomeCard';
import CreatePostModal from './CreatePostModal';
import { getSafeImageSource } from '../../assets/images';

interface DiscoveryHubProps {
  groups: CommunityGroup[];
  challenges: CommunityChallenge[];
  discussions: CommunityDiscussion[];
  people: SuggestedPerson[];
  onSelectGroup: (group: CommunityGroup) => void;
  onSelectChallenge: (challenge: CommunityChallenge) => void;
  onSelectDiscussion: (discussion: CommunityDiscussion) => void;
  onToggleJoinGroup: (groupId: string) => void;
  onToggleJoinChallenge: (challengeId: string) => void;
  onToggleSupportDiscussion: (discussionId: string) => void;
  onReportItem: (type: 'post' | 'group' | 'discussion' | 'user', title: string) => void;
  onCreateDiscussion?: (newDiscussion: Partial<CommunityDiscussion>) => void;
}

type SearchCategory = 'All' | 'Groups' | 'Challenges' | 'People' | 'Discussions';

export default function DiscoveryHub({
  groups,
  challenges,
  discussions,
  people,
  onSelectGroup,
  onSelectChallenge,
  onSelectDiscussion,
  onToggleJoinGroup,
  onToggleJoinChallenge,
  onToggleSupportDiscussion,
  onReportItem,
  onCreateDiscussion,
}: DiscoveryHubProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const { theme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('All');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    'usr-2': true,
  });

  const categories: SearchCategory[] = ['All', 'Groups', 'Challenges', 'People', 'Discussions'];

  const toggleFollow = (id: string) => {
    setFollowingMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getChallengeIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets size={16} color={color} />;
      case 'Flame':
        return <Flame size={16} color={color} />;
      case 'Moon':
        return <Moon size={16} color={color} />;
      default:
        return <Sparkles size={16} color={color} />;
    }
  };

  // Filtered search results
  const isSearching = searchQuery.trim().length > 0;
  const query = searchQuery.toLowerCase().trim();

  const filteredGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.name.toLowerCase().includes(query) ||
          g.description.toLowerCase().includes(query) ||
          g.category.toLowerCase().includes(query)
      ),
    [groups, query]
  );

  const filteredChallenges = useMemo(
    () =>
      challenges.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      ),
    [challenges, query]
  );

  const filteredDiscussions = useMemo(
    () =>
      discussions.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query) ||
          d.author.toLowerCase().includes(query)
      ),
    [discussions, query]
  );

  const filteredPeople = useMemo(
    () =>
      people.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.role.toLowerCase().includes(query) ||
          p.bio.toLowerCase().includes(query)
      ),
    [people, query]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. Header */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <Compass size={13} color="#16a34a" />
          <Text style={styles.headerBadgeText}>Exploration Hub</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Discover</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Explore communities, challenges, conversations, and people.
        </Text>
      </View>

      {/* 2. Global Search System */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={[styles.searchInput, { color: theme.inputText }]}
            placeholder="Search groups, challenges, topics..."
            placeholderTextColor={theme.placeholderText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={16} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                  isSelected && { backgroundColor: theme.accentDeep, borderColor: theme.accent },
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: theme.textSecondary },
                    isSelected && { color: theme.accent, fontWeight: '700' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Search Results Mode */}
      {isSearching ? (
        <View style={styles.searchResultsWrap}>
          <Text style={styles.sectionHeaderTitle}>
            Results for "{searchQuery}"
          </Text>

          {/* Groups Results */}
          {(selectedCategory === 'All' || selectedCategory === 'Groups') &&
            filteredGroups.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.subCategoryTitle}>Groups ({filteredGroups.length})</Text>
                {filteredGroups.map((grp) => (
                  <TouchableOpacity
                    key={grp.id}
                    style={styles.searchItemCard}
                    onPress={() => onSelectGroup(grp)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.searchItemIconWrap}>
                      <Users size={18} color="#16a34a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchItemTitle}>{grp.name}</Text>
                      <Text style={styles.searchItemMeta}>
                        {grp.membersCount} members • {grp.category}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {/* Challenges Results */}
          {(selectedCategory === 'All' || selectedCategory === 'Challenges') &&
            filteredChallenges.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.subCategoryTitle}>Challenges ({filteredChallenges.length})</Text>
                {filteredChallenges.map((ch) => (
                  <TouchableOpacity
                    key={ch.id}
                    style={styles.searchItemCard}
                    onPress={() => onSelectChallenge(ch)}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.searchItemIconWrap,
                        { backgroundColor: `${ch.coverColor}15` },
                      ]}
                    >
                      <Trophy size={18} color={ch.coverColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchItemTitle}>{ch.title}</Text>
                      <Text style={styles.searchItemMeta}>
                        {ch.durationDays} Days • {ch.participantsCount} participants
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {/* Discussions Results */}
          {(selectedCategory === 'All' || selectedCategory === 'Discussions') &&
            filteredDiscussions.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.subCategoryTitle}>Discussions ({filteredDiscussions.length})</Text>
                {filteredDiscussions.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={styles.searchItemCard}
                    onPress={() => onSelectDiscussion(d)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.searchItemIconWrap}>
                      <MessageSquare size={18} color="#0284c7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchItemTitle} numberOfLines={1}>
                        {d.title}
                      </Text>
                      <Text style={styles.searchItemMeta}>
                        By {d.author} • {d.commentCount} comments
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

          {/* People Results */}
          {(selectedCategory === 'All' || selectedCategory === 'People') &&
            filteredPeople.length > 0 && (
              <View style={styles.resultGroup}>
                <Text style={styles.subCategoryTitle}>People ({filteredPeople.length})</Text>
                {filteredPeople.map((p) => (
                  <View key={p.id} style={styles.searchItemCard}>
                    <View
                      style={[
                        styles.avatarCircleSmall,
                        { backgroundColor: p.avatarColor },
                      ]}
                    >
                      <Text style={styles.avatarInitialSmall}>{p.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.searchItemTitle}>{p.name}</Text>
                      <Text style={styles.searchItemMeta}>{p.role}</Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.followSmallBtn,
                        followingMap[p.id] && styles.followSmallBtnActive,
                      ]}
                      onPress={() => toggleFollow(p.id)}
                    >
                      <Text
                        style={[
                          styles.followSmallBtnText,
                          followingMap[p.id] && styles.followSmallBtnTextActive,
                        ]}
                      >
                        {followingMap[p.id] ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

          {filteredGroups.length === 0 &&
            filteredChallenges.length === 0 &&
            filteredDiscussions.length === 0 &&
            filteredPeople.length === 0 && (
              <View style={styles.emptySearchWrap}>
                <Text style={styles.emptySearchTitle}>No results found</Text>
                <Text style={styles.emptySearchSub}>
                  Try searching with different terms or reset your category filter.
                </Text>
              </View>
            )}
        </View>
      ) : (
        /* 4. Default Curated Sections */
        <View style={styles.sectionsContainer}>
          {/* Welcome Banner Card */}
          <CommunityWelcomeCard
            onOpenCreatePost={() => setShowCreateModal(true)}
            onExploreChallenges={() => {
              if (challenges.length > 0) onSelectChallenge(challenges[0]);
            }}
          />

          {/* Simplified Trending Communities (2 items default + See More) */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Trending Communities</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Active spaces where members connect and build healthy habits
                </Text>
              </View>
            </View>

            <View style={styles.groupsList}>
              {(showAllTrending ? groups : groups.slice(0, 2)).map((grp) => (
                <TouchableOpacity
                  key={grp.id}
                  style={styles.communityCard}
                  onPress={() => onSelectGroup(grp)}
                  activeOpacity={0.88}
                >
                  <View style={styles.communityCardHeader}>
                    <View style={styles.groupIconCircle}>
                      <Users size={20} color="#16a34a" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.groupNameText}>{grp.name}</Text>
                      <Text style={styles.groupCategoryText}>
                        {grp.membersCount} members • {grp.privacy}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.joinGroupBtn,
                        grp.joined && styles.joinGroupBtnJoined,
                      ]}
                      onPress={() => onToggleJoinGroup(grp.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.joinGroupBtnText,
                          grp.joined && styles.joinGroupBtnTextJoined,
                        ]}
                      >
                        {grp.joined ? 'Joined' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.groupDescText} numberOfLines={2}>
                    {grp.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {groups.length > 2 && (
              <TouchableOpacity
                style={[
                  styles.seeMoreTrendingBtn,
                  {
                    backgroundColor: isDark ? theme.surfaceElevated : '#f1f5f9',
                    borderColor: theme.borderSubtle,
                  },
                ]}
                onPress={() => setShowAllTrending(!showAllTrending)}
                activeOpacity={0.8}
              >
                <Text style={[styles.seeMoreTrendingText, { color: theme.accent }]}>
                  {showAllTrending ? 'Show Less ↑' : `See More Communities (${groups.length - 2} more) →`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Section C: Trending Discussions */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Trending Discussions</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Insightful conversations from community members
                </Text>
              </View>
            </View>

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
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.discussionAuthor}>{d.author}</Text>
                        {d.authorBadge && (
                          <View style={styles.badgePill}>
                            <Text style={styles.badgePillText}>{d.authorBadge}</Text>
                          </View>
                        )}
                      </View>
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
                  <Text style={styles.discussionSnippet} numberOfLines={3}>
                    {d.content}
                  </Text>

                  {/* Picture & Video Media Attachment */}
                  {d.media && d.media.length > 0 && (
                    <View style={styles.mediaContainer}>
                      {d.media.map((m, mIdx) => (
                        <View key={mIdx} style={styles.mediaItemWrap}>
                          {m.type === 'image' ? (
                            <Image
                              source={getSafeImageSource(m.url, 'hero')}
                              style={styles.mediaImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.videoWrap}>
                              <Image
                                source={getSafeImageSource(m.thumbnailUrl || m.url, 'beHealthy')}
                                style={styles.mediaImage}
                                resizeMode="cover"
                              />
                              <View style={styles.videoOverlay}>
                                <View style={styles.videoPlayCircle}>
                                  <Play size={18} color="#ffffff" fill="#ffffff" />
                                </View>
                                {m.duration && (
                                  <View style={styles.videoDurationPill}>
                                    <Text style={styles.videoDurationText}>▶ {m.duration}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          )}
                          {m.caption && (
                            <Text style={[styles.mediaCaption, { color: theme.textSecondary }]}>
                              {m.caption}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

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
                        size={15}
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
                      <MessageSquare size={14} color="#64748b" />
                      <Text style={styles.commentCountText}>
                        {d.commentCount} replies
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section D: Suggested People */}
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Suggested Contributors</Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Certified wellness guides and active community leaders
                </Text>
              </View>
            </View>

            <View style={styles.peopleList}>
              {people.map((p) => {
                const isFollowing = followingMap[p.id] || false;
                return (
                  <View key={p.id} style={styles.personCard}>
                    <View style={[styles.avatarCircleLarge, { backgroundColor: p.avatarColor }]}>
                      <Text style={styles.avatarInitialLarge}>{p.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.personName}>{p.name}</Text>
                        <ShieldCheck size={14} color="#16a34a" />
                      </View>
                      <Text style={styles.personRole}>{p.role}</Text>
                      <Text style={styles.personBio} numberOfLines={2}>
                        {p.bio}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.followBtn, isFollowing && styles.followBtnActive]}
                      onPress={() => toggleFollow(p.id)}
                      activeOpacity={0.8}
                    >
                      {isFollowing ? (
                        <UserCheck size={14} color="#16a34a" />
                      ) : (
                        <UserPlus size={14} color="#ffffff" />
                      )}
                      <Text
                        style={[
                          styles.followBtnText,
                          isFollowing && styles.followBtnTextActive,
                        ]}
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      )}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(post) => {
          if (onCreateDiscussion) onCreateDiscussion(post);
          setShowCreateModal(false);
        }}
      />
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
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0f172a',
  },
  categoriesRow: {
    paddingTop: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipSelected: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  categoryChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  sectionsContainer: {
    gap: 24,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  recommendedCard: {
    width: 220,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: 'space-between',
  },
  recCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  recCardBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  recCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 18,
  },
  recCardMeta: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  recCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  recCardDifficulty: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  recCardCta: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  groupsList: {
    gap: 12,
  },
  communityCard: {
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
  communityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  groupIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  groupNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  groupCategoryText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  joinGroupBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinGroupBtnJoined: {
    backgroundColor: '#f1f5f9',
  },
  joinGroupBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  joinGroupBtnTextJoined: {
    color: '#475569',
  },
  groupDescText: {
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
  badgePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    color: '#475569',
    fontWeight: '600',
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
  peopleList: {
    gap: 10,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  avatarCircleLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialLarge: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  personRole: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
    marginTop: 1,
  },
  personBio: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#16a34a',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  followBtnActive: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  followBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  followBtnTextActive: {
    color: '#16a34a',
  },
  searchResultsWrap: {
    gap: 16,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  resultGroup: {
    gap: 8,
  },
  subCategoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 10,
  },
  searchItemIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  searchItemMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialSmall: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  followSmallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#16a34a',
  },
  followSmallBtnActive: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  followSmallBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  followSmallBtnTextActive: {
    color: '#16a34a',
  },
  emptySearchWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  emptySearchSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 260,
  },
  mediaContainer: {
    marginTop: 10,
    marginBottom: 4,
    gap: 8,
  },
  mediaItemWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 165,
    borderRadius: 12,
  },
  videoWrap: {
    position: 'relative',
    height: 165,
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDurationPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  videoDurationText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  seeMoreTrendingBtn: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeMoreTrendingText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  mediaCaption: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
