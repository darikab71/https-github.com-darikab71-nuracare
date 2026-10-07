import { ChallengeStakeConfig } from './types';

export const PLATFORM_FEE_PERCENTAGE = 10.0;
export const CREATOR_REWARD_PERCENTAGE = 2.0;

/**
 * Deterministically calculates the economic breakdown of a free or staked challenge pool.
 * Formula:
 * - Platform Fee: 10%
 * - Creator Reward: 2%
 * - Finisher Prize Pool: 88%
 */
export function calculatePoolEconomics(
  entryFee: number,
  participantsCount: number,
  platformFeePct: number = PLATFORM_FEE_PERCENTAGE,
  creatorRewardPct: number = CREATOR_REWARD_PERCENTAGE
): ChallengeStakeConfig {
  const isMonetary = entryFee > 0;
  const count = Math.max(1, participantsCount);
  const grossPool = isMonetary ? entryFee * count : 0;
  
  const platformFee = isMonetary ? (grossPool * platformFeePct) / 100 : 0;
  const creatorReward = isMonetary ? (grossPool * creatorRewardPct) / 100 : 0;
  const prizePool = isMonetary ? Math.max(0, grossPool - platformFee - creatorReward) : 0;

  return {
    isMonetary,
    entryFee,
    currency: 'ETB',
    grossPool,
    platformFeePct,
    creatorRewardPct,
    prizePool: Math.round(prizePool * 100) / 100,
    winnerRules: {
      type: 'split_all_verified_completers'
    }
  };
}

/**
 * Calculates equal settlement payout for verified completers.
 */
export function calculateSettlementPayout(
  prizePool: number,
  verifiedCompletersCount: number
): { payoutPerFinisher: number; remainder: number } {
  if (verifiedCompletersCount <= 0 || prizePool <= 0) {
    return { payoutPerFinisher: 0, remainder: 0 };
  }
  const rawShare = Math.floor((prizePool / verifiedCompletersCount) * 100) / 100;
  const totalAllocated = rawShare * verifiedCompletersCount;
  const remainder = Math.round((prizePool - totalAllocated) * 100) / 100;

  return {
    payoutPerFinisher: rawShare,
    remainder
  };
}
