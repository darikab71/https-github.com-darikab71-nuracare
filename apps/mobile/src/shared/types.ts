export interface User {
  id: string;
  name?: string;
  email?: string;
  age?: number;
  conditions?: string[];
  medications?: string[];
  fastingMode?: string;
  location?: {
    country?: string;
    code?: string;
    city?: string;
  };
  records?: CheckIn[];
}

export interface CheckIn {
  id: string;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  stress: number;
  tension: string;
  urgency: 'low' | 'mid' | 'high';
  tags: string[];
}

export interface WellnessScore {
  score: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface OuraData {
  readinessScore: number;
  sleepScore: number;
  activityScore: number;
  lastSync: string;
}

// ==========================================
// NURACARE CHALLENGES PLATFORM TYPES
// ==========================================

export type ChallengeCategory =
  | 'physical'
  | 'sleep'
  | 'digital_wellbeing'
  | 'hydration'
  | 'habits'
  | 'social'
  | 'nura_360'
  | 'Fitness'
  | 'Hydration'
  | 'Sleep'
  | 'Nutrition'
  | 'Mindfulness'
  | 'Digital Detox'
  | 'Community';

export type ChallengeMode =
  | 'solo'
  | '1v1'
  | 'friends'
  | 'group'
  | 'team'
  | 'race'
  | 'survival'
  | 'coop'
  | 'ladder'
  | 'streak_battle';

export type VerificationType =
  | 'device'
  | 'camera'
  | 'location'
  | 'mutual'
  | 'evidence'
  | 'self_reported';

export type VerificationStrength =
  | 'device'
  | 'camera'
  | 'location'
  | 'mutual'
  | 'evidence'
  | 'self_reported';

export interface ChallengeObjective {
  id: string;
  title: string;
  type: 'reps' | 'distance' | 'duration' | 'time_anchor' | 'screen_limit' | 'location_checkin' | 'habit_completion';
  target: number;
  unit: string; // 'reps', 'km', 'minutes', 'check-in', 'L'
  verificationType: VerificationType;
  verificationStrength: VerificationStrength;
  exerciseType?: 'squat' | 'push_up' | 'lunge' | 'plank' | 'jumping_jack' | 'bicep_curl';
  locationName?: string;
  timeWindow?: string;
}

export interface ChallengeRule {
  id: string;
  title: string;
  description: string;
}

export interface ChallengeStakeConfig {
  isMonetary: boolean;
  entryFee: number;
  currency: string;
  grossPool: number;
  platformFeePct: number;
  creatorRewardPct: number;
  prizePool: number;
  winnerRules: {
    type: 'split_all_verified_completers' | 'winner_take_all' | 'top_three_split';
    payoutDistribution?: number[];
  };
}

export interface LiveChallengeSession {
  id: string;
  challengeId: string;
  objectiveId: string;
  status: 'ready' | 'calibrating' | 'live' | 'paused' | 'completed' | 'verified' | 'needs_review' | 'failed';
  measurementValue: number;
  targetValue: number;
  repsValid: number;
  repsInvalid: number;
  formRating: 'good' | 'needs_adjustment' | 'optimal';
  verificationMethod: VerificationType;
  verificationStrength: VerificationStrength;
  startedAt: string;
  completedAt?: string;
  evidenceUrl?: string;
  evidenceNotes?: string;
}

export interface ChallengeParticipant {
  id: string;
  userId: string;
  name: string;
  avatarColor: string;
  avatarUrl?: string;
  status: 'invited' | 'join_requested' | 'payment_pending' | 'joined' | 'active' | 'completed' | 'winner' | 'loser' | 'disqualified' | 'paid_out' | 'refunded';
  currentDay: number;
  progressPercentage: number;
  streak: number;
  bestStreak: number;
  completedDays: number[];
  rank: number;
  stakeAmount: number;
  payoutAmount: number;
  isVerified: boolean;
  lastActivityAt?: string;
}

export interface ChallengeEvent {
  id: string;
  challengeId: string;
  userId?: string;
  userName: string;
  eventType: 'join' | 'leave' | 'complete_day' | 'streak_milestone' | 'rank_change' | 'session_verified' | 'announcement';
  title: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface WalletAccount {
  userId: string;
  currency: string;
  withdrawableBalance: number;
  challengeWinnings: number;
  creatorRewards: number;
  pendingRewards: number;
  nuraPoints: number;
  xp: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'entry_fee' | 'payout' | 'creator_reward' | 'points_credit' | 'refund' | 'withdrawal';
  amount: number;
  currency: string;
  challengeId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'reversed' | 'disputed';
  referenceId: string;
  notes?: string;
  createdAt: string;
}
