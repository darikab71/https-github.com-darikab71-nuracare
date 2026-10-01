export type CommunityPrimaryTab = 'discovery' | 'challenges' | 'community' | 'inbox';

export type ChallengeCategory =
  | 'Fitness'
  | 'Sleep'
  | 'Hydration'
  | 'Nutrition'
  | 'Mindfulness'
  | 'Stress'
  | 'Productivity'
  | 'Digital'
  | 'Habits';

export type ChallengeDifficulty = 'Easy' | 'Moderate' | 'Challenging';

export interface CommunityChallenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  description: string;
  creator: string;
  creatorBadge?: string;
  participantsCount: number;
  durationDays: number;
  difficulty: ChallengeDifficulty;
  startDate: string;
  endDate: string;
  rules: string[];
  dailyGoal: string;
  currentDay: number;
  streak: number;
  isJoined: boolean;
  isCompleted: boolean;
  completedDays: number[];
  coverColor: string;
  iconName: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  category: string;
  iconName: string;
  membersCount: string;
  description: string;
  privacy: 'Public' | 'Private' | 'Hidden';
  joined: boolean;
  rules: string[];
  role?: 'Owner' | 'Moderator' | 'Member';
  coverGradient: [string, string];
  activeChallengesCount: number;
  recentDiscussionsCount: number;
}

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  duration?: string; // e.g. '0:45'
  caption?: string;
}

export interface DiscussionReply {
  id: string;
  author: string;
  authorRole?: string;
  avatarColor: string;
  content: string;
  timestamp: string;
  supportCount: number;
  userSupported?: boolean;
}

export interface CommunityDiscussion {
  id: string;
  groupId?: string;
  groupName?: string;
  author: string;
  authorBadge?: string;
  avatarColor: string;
  timeAgo: string;
  title: string;
  content: string;
  supportCount: number;
  userSupported?: boolean;
  commentCount: number;
  replies: DiscussionReply[];
  tags?: string[];
  pinned?: boolean;
  media?: MediaItem[];
}

export interface SuggestedPerson {
  id: string;
  name: string;
  role: string;
  badge: string;
  avatarColor: string;
  initials: string;
  mutualGroupsCount: number;
  bio: string;
  isFollowing?: boolean;
}

export interface DirectMessage {
  id: string;
  sender: 'them' | 'me';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface DirectThread {
  id: string;
  senderName: string;
  roleSubtitle?: string;
  avatarText: string;
  avatarBg: string;
  lastMessage: string;
  timeAgo: string;
  unreadCount: number;
  isOnline: boolean;
  isRequest?: boolean;
  messages: DirectMessage[];
}

export type ReportReason =
  | 'Harassment'
  | 'Spam'
  | 'Hate or abuse'
  | 'Dangerous content'
  | 'Medical misinformation'
  | 'Other';
