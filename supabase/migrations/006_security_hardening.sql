-- 006_security_hardening.sql
-- NuraCare Security Hardening Migration
-- Fixes critical RLS vulnerabilities:
--   1. wallet_accounts: clients must NOT be able to write balance directly
--   2. wallet_transactions: server (service role) must be able to INSERT; clients cannot
--   3. challenge status: only creator can update challenge status
--   4. Adds missing transaction types used by challenge-payment.js

-- ─── 1. Harden wallet_accounts RLS ───────────────────────────────────────────
-- Drop the overly-permissive FOR ALL policy
DROP POLICY IF EXISTS "Users can view and manage own wallet" ON public.wallet_accounts;

-- Clients may only READ their own wallet
CREATE POLICY "Users can read own wallet"
  ON public.wallet_accounts FOR SELECT USING (auth.uid() = user_id);

-- All writes (INSERT, UPDATE, DELETE) must come from server via service_role key
-- (service_role bypasses RLS entirely; no policy needed for service_role writes)
-- This makes it impossible for any client-side code to tamper with balances.

-- ─── 2. Harden wallet_transactions RLS ──────────────────────────────────────
-- Clients can read their own transactions
-- (SELECT policy already exists from 005; ensure it's there)
DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions"
  ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Clients CANNOT insert transactions — all inserts go via service_role API routes
-- No INSERT policy for anon/authenticated role = denied by default when RLS is enabled

-- ─── 3. Tighten challenge UPDATE rules ───────────────────────────────────────
-- Ensure only creator can update a challenge's sensitive fields (status, prize_pool)
-- Anyone can view challenges (SELECT stays as-is from migration 004)
DROP POLICY IF EXISTS "Creators can update own challenges" ON public.challenges;
CREATE POLICY "Creators can update own challenges"
  ON public.challenges FOR UPDATE
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- ─── 4. Add missing wallet transaction types for challenge-payment.js ─────────
-- The 005 migration had: 'deposit', 'entry_fee', 'payout', 'creator_reward', 'points_credit', 'refund', 'withdrawal'
-- challenge-payment.js uses: 'stake_entry', 'prize_payout', 'refund', 'creator_reward'
-- Fix: alter the type CHECK constraint to include the new types
ALTER TABLE public.wallet_transactions
  DROP CONSTRAINT IF EXISTS wallet_transactions_type_check;

ALTER TABLE public.wallet_transactions
  ADD CONSTRAINT wallet_transactions_type_check
  CHECK (type IN (
    'deposit',
    'withdrawal',
    'stake_entry',     -- participant entering a staked challenge
    'entry_fee',       -- alias kept for backward compatibility
    'payout',          -- alias kept
    'prize_payout',    -- winner settlement payout
    'creator_reward',  -- challenge creator's 2% cut
    'points_credit',
    'refund'
  ));

-- ─── 5. Fix challenge_sessions verification_method CHECK ─────────────────────
-- challenge-payment.js and challengeEngine use 'self_report' but the DB CHECK
-- constraint in 005 allowed 'self_reported'. Standardize to 'self_report'.
ALTER TABLE public.challenge_sessions
  DROP CONSTRAINT IF EXISTS challenge_sessions_verification_method_check;

ALTER TABLE public.challenge_sessions
  ADD CONSTRAINT challenge_sessions_verification_method_check
  CHECK (verification_method IN ('device', 'camera', 'location', 'mutual', 'evidence', 'self_report'));

ALTER TABLE public.challenge_sessions
  DROP CONSTRAINT IF EXISTS challenge_sessions_verification_strength_check;

ALTER TABLE public.challenge_sessions
  ADD CONSTRAINT challenge_sessions_verification_strength_check
  CHECK (verification_strength IN ('device', 'camera', 'location', 'mutual', 'evidence', 'self_report'));

-- ─── 6. Add missing current_day + progress_percentage columns to members ──────
ALTER TABLE public.challenge_members
  ADD COLUMN IF NOT EXISTS current_day INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC NOT NULL DEFAULT 0;

-- ─── 7. Index for leaderboard queries ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_challenge_members_rank
  ON public.challenge_members(challenge_id, progress_percentage DESC, streak DESC);
