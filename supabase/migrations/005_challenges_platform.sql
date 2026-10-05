-- 005_challenges_platform.sql
-- NuraCare Challenges: Real Production Platform Schema
-- Extends challenges with 7 Categories, 10 Modes, Verification Engine, Wallets & Financial Ledger

-- 1. Upgrade Challenges Table
ALTER TABLE public.challenges 
  ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES auth.users ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'group',
  ADD COLUMN IF NOT EXISTS objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_monetary BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS entry_fee NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ETB',
  ADD COLUMN IF NOT EXISTS gross_pool NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_pct NUMERIC NOT NULL DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS creator_reward_pct NUMERIC NOT NULL DEFAULT 2.0,
  ADD COLUMN IF NOT EXISTS prize_pool NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS winner_rules JSONB NOT NULL DEFAULT '{"type": "split_all_verified_completers"}'::jsonb,
  ADD COLUMN IF NOT EXISTS invite_code TEXT,
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE DEFAULT CURRENT_DATE + INTERVAL '7 days';

CREATE INDEX IF NOT EXISTS idx_challenges_status ON public.challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON public.challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_invite_code ON public.challenges(invite_code);

-- 2. Upgrade Challenge Members / Participants Table
ALTER TABLE public.challenge_members
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS best_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS completed_days INTEGER[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS stake_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_amount NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rank INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_challenge_members_status ON public.challenge_members(challenge_id, status);

-- 3. Live Challenge Sessions (Exercise, Run, Sleep, Focus, Routine tracking)
CREATE TABLE IF NOT EXISTS public.challenge_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  objective_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('ready', 'calibrating', 'live', 'paused', 'completed', 'verified', 'needs_review', 'failed')),
  measurement_value NUMERIC NOT NULL DEFAULT 0,
  target_value NUMERIC NOT NULL DEFAULT 0,
  reps_valid INTEGER NOT NULL DEFAULT 0,
  reps_invalid INTEGER NOT NULL DEFAULT 0,
  form_rating TEXT DEFAULT 'good',
  verification_method TEXT NOT NULL DEFAULT 'device' CHECK (verification_method IN ('device', 'camera', 'location', 'mutual', 'evidence', 'self_reported')),
  verification_strength TEXT NOT NULL DEFAULT 'device' CHECK (verification_strength IN ('device', 'camera', 'location', 'mutual', 'evidence', 'self_reported')),
  evidence_url TEXT,
  evidence_notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_challenge_sessions_user_ch ON public.challenge_sessions(user_id, challenge_id);
ALTER TABLE public.challenge_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own challenge sessions"
  ON public.challenge_sessions FOR ALL USING (auth.uid() = user_id);

-- 4. Real-time Challenge Events Feed
CREATE TABLE IF NOT EXISTS public.challenge_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('join', 'leave', 'complete_day', 'streak_milestone', 'rank_change', 'session_verified', 'announcement')),
  title TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_challenge_events_ch ON public.challenge_events(challenge_id, created_at DESC);
ALTER TABLE public.challenge_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone in challenge can view events"
  ON public.challenge_events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert events"
  ON public.challenge_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Wallet Accounts & Real Financial Ledger
CREATE TABLE IF NOT EXISTS public.wallet_accounts (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT 'ETB',
  withdrawable_balance NUMERIC NOT NULL DEFAULT 0.00 CHECK (withdrawable_balance >= 0),
  challenge_winnings NUMERIC NOT NULL DEFAULT 0.00 CHECK (challenge_winnings >= 0),
  creator_rewards NUMERIC NOT NULL DEFAULT 0.00 CHECK (creator_rewards >= 0),
  pending_rewards NUMERIC NOT NULL DEFAULT 0.00 CHECK (pending_rewards >= 0),
  nura_points INTEGER NOT NULL DEFAULT 250 CHECK (nura_points >= 0),
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.wallet_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and manage own wallet"
  ON public.wallet_accounts FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'entry_fee', 'payout', 'creator_reward', 'points_credit', 'refund', 'withdrawal')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  challenge_id UUID REFERENCES public.challenges ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'reversed', 'disputed')),
  reference_id TEXT UNIQUE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON public.wallet_transactions(user_id, created_at DESC);
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- 6. Challenge Disputes
CREATE TABLE IF NOT EXISTS public.challenge_disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.challenges ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.challenge_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own disputes"
  ON public.challenge_disputes FOR ALL USING (auth.uid() = user_id);
