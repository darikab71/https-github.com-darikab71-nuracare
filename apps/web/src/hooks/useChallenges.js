/**
 * useChallenges — Real Supabase-backed hook for all challenge operations.
 * Follows the same pattern as useSupabase.js:
 *   - Authenticated users: Supabase (challenges, participants, wallet, events)
 *   - Guest users: localStorage with same data shape
 * All financial mutations require server confirmation before updating local state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PLATFORM_FEE_PCT = 10.0;
const CREATOR_REWARD_PCT = 2.0;
const GUEST_CHALLENGES_KEY = 'nc_v2_challenges';
const GUEST_WALLET_KEY = 'nc_v2_wallet';
const GUEST_TRANSACTIONS_KEY = 'nc_v2_transactions';
const GUEST_PARTICIPANTS_KEY = 'nc_v2_participants';
const GUEST_EVENTS_KEY = 'nc_v2_events';

function genId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function genInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'NURA-' + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function calcPool(grossPool) {
  const platform = (grossPool * PLATFORM_FEE_PCT) / 100;
  const creator = (grossPool * CREATOR_REWARD_PCT) / 100;
  const prize = grossPool - platform - creator;
  return { grossPool, platformAllocation: platform, creatorReward: creator, prizePool: Math.max(0, prize) };
}

// ─── GUEST STORAGE HELPERS ────────────────────────────────────────────────────
function guestLoad(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; }
}
function guestSave(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useChallenges() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const isGuest = !user || userId === 'guest';

  const [challenges, setChallenges] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Realtime subscription ref
  const realtimeRef = useRef(null);

  // ── LOAD ──────────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      if (isGuest) {
        _loadGuest();
      } else {
        await _loadSupabase();
      }
    } catch (e) {
      console.error('[useChallenges] load error', e);
      setError(e.message);
      _loadGuest(); // fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  function _loadGuest() {
    const storedChallenges = guestLoad(GUEST_CHALLENGES_KEY, []);
    const seeded = storedChallenges.length > 0 ? storedChallenges : _seedGuestChallenges();
    setChallenges(seeded);

    const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []);
    setMyParticipations(parts.filter(p => p.user_id === userId));

    const w = guestLoad(GUEST_WALLET_KEY + '_' + userId, _defaultWallet(userId));
    setWallet(w);

    const txns = guestLoad(GUEST_TRANSACTIONS_KEY + '_' + userId, []);
    setTransactions(txns);
  }

  async function _loadSupabase() {
    // Load challenges
    const { data: chs } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (chs && chs.length > 0) {
      setChallenges(chs.map(_normalizeChallenge));
    } else {
      // Seed initial challenges if DB is empty
      const seeded = _seedGuestChallenges();
      setChallenges(seeded);
      // Try to persist seeds
      _persistSeedsToSupabase(seeded);
    }

    // Load participations
    const { data: parts } = await supabase
      .from('challenge_members')
      .select('*')
      .eq('user_id', user.id);
    if (parts) setMyParticipations(parts);

    // Load or create wallet
    const { data: w } = await supabase
      .from('wallet_accounts')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (w) {
      setWallet(_normalizeWallet(w));
    } else {
      // Create wallet
      const def = _defaultWallet(user.id);
      await supabase.from('wallet_accounts').upsert({ user_id: user.id, ...def });
      setWallet(def);
    }

    // Load transactions
    const { data: txns } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (txns) setTransactions(txns);
  }

  async function _persistSeedsToSupabase(seeds) {
    if (!user) return;
    for (const ch of seeds) {
      try {
        await supabase.from('challenges').upsert({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          category: ch.category,
          mode: ch.mode,
          objectives: ch.objectives,
          rules: ch.rules,
          status: ch.status,
          is_monetary: ch.is_monetary,
          entry_fee: ch.entry_fee,
          currency: ch.currency,
          gross_pool: ch.gross_pool,
          prize_pool: ch.prize_pool,
          invite_code: ch.invite_code,
          is_private: ch.is_private,
          start_date: ch.start_date,
          end_date: ch.end_date,
          creator_id: user.id,
        });
      } catch (e) { /* non-critical */ }
    }
  }

  function _defaultWallet(uid) {
    return {
      user_id: uid,
      currency: 'ETB',
      withdrawable_balance: 0,
      challenge_winnings: 0,
      creator_rewards: 0,
      pending_rewards: 0,
      nura_points: 250,
      xp: 0,
    };
  }

  function _normalizeWallet(w) {
    return {
      user_id: w.user_id,
      currency: w.currency || 'ETB',
      withdrawable_balance: parseFloat(w.withdrawable_balance || 0),
      challenge_winnings: parseFloat(w.challenge_winnings || 0),
      creator_rewards: parseFloat(w.creator_rewards || 0),
      pending_rewards: parseFloat(w.pending_rewards || 0),
      nura_points: parseInt(w.nura_points || 250),
      xp: parseInt(w.xp || 0),
    };
  }

  function _normalizeChallenge(ch) {
    return {
      id: ch.id,
      title: ch.title,
      description: ch.description || '',
      category: ch.category || 'physical',
      mode: ch.mode || 'group',
      objectives: ch.objectives || [],
      rules: ch.rules || {},
      status: ch.status || 'active',
      is_monetary: ch.is_monetary || false,
      entry_fee: parseFloat(ch.entry_fee || 0),
      currency: ch.currency || 'ETB',
      gross_pool: parseFloat(ch.gross_pool || 0),
      prize_pool: parseFloat(ch.prize_pool || 0),
      platform_fee_pct: parseFloat(ch.platform_fee_pct || PLATFORM_FEE_PCT),
      creator_reward_pct: parseFloat(ch.creator_reward_pct || CREATOR_REWARD_PCT),
      invite_code: ch.invite_code,
      is_private: ch.is_private || false,
      start_date: ch.start_date,
      end_date: ch.end_date,
      participant_count: ch.participant_count || 0,
      image_url: ch.image_url || _defaultImage(ch.category),
      difficulty: ch.difficulty || 'Moderate',
      creator_id: ch.creator_id,
      created_at: ch.created_at,
      duration_days: ch.duration_days || 7,
      verification_method: ch.verification_method || 'device',
      xp_reward: ch.xp_reward || 100,
      points_reward: ch.points_reward || 50,
    };
  }

  useEffect(() => { loadAll(); }, [user]);

  // ── REALTIME subscription for challenges ─────────────────────────────────
  useEffect(() => {
    if (isGuest) return;

    const channel = supabase
      .channel('challenges_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setChallenges(prev => [_normalizeChallenge(payload.new), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setChallenges(prev => prev.map(c => c.id === payload.new.id ? _normalizeChallenge(payload.new) : c));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_members', filter: `user_id=eq.${user?.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMyParticipations(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setMyParticipations(prev => prev.map(p => p.challenge_id === payload.new.challenge_id ? payload.new : p));
        }
      })
      .subscribe();

    realtimeRef.current = channel;
    return () => { if (realtimeRef.current) supabase.removeChannel(realtimeRef.current); };
  }, [user]);

  // ── JOIN CHALLENGE ─────────────────────────────────────────────────────────
  const joinChallenge = useCallback(async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Challenge not found' };
    if (isParticipant(challengeId)) return { success: false, error: 'Already joined' };

    // Check funds for monetary challenges
    if (challenge.is_monetary && challenge.entry_fee > 0) {
      const bal = wallet?.withdrawable_balance || 0;
      if (bal < challenge.entry_fee) {
        return { success: false, error: `Insufficient funds. You need ${challenge.entry_fee} ETB but have ${bal.toFixed(2)} ETB.` };
      }
    }

    const participantRecord = {
      id: genId('part'),
      challenge_id: challengeId,
      user_id: userId,
      status: 'active',
      streak: 0,
      best_streak: 0,
      completed_days: [],
      stake_amount: challenge.is_monetary ? challenge.entry_fee : 0,
      payout_amount: 0,
      rank: null,
      last_activity_at: new Date().toISOString(),
      joined_at: new Date().toISOString(),
    };

    if (isGuest) {
      // Guest: localStorage
      const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []);
      parts.push(participantRecord);
      guestSave(GUEST_PARTICIPANTS_KEY, parts);
      setMyParticipations(prev => [...prev, participantRecord]);

      // Deduct entry fee from guest wallet
      if (challenge.is_monetary && challenge.entry_fee > 0) {
        _guestDeductWallet(challenge.entry_fee, 'entry_fee', `Entry fee: ${challenge.title}`, challengeId);
      }

      // Update challenge pool
      _guestUpdatePool(challengeId, challenge.entry_fee);

      // Award join XP
      _guestAddXP(10);

      return { success: true };
    }

    // Authenticated: Supabase
    try {
      // 1. Deduct entry fee via wallet transaction (server-side atomicity)
      if (challenge.is_monetary && challenge.entry_fee > 0) {
        const txRef = genId('ref');
        const { error: txErr } = await supabase.from('wallet_transactions').insert({
          user_id: user.id,
          type: 'entry_fee',
          amount: -challenge.entry_fee,
          currency: challenge.currency,
          challenge_id: challengeId,
          status: 'completed',
          reference_id: txRef,
          notes: `Entry fee: ${challenge.title}`,
        });
        if (txErr) return { success: false, error: 'Payment failed: ' + txErr.message };

        // Update wallet balance
        await supabase.from('wallet_accounts')
          .update({ withdrawable_balance: (wallet.withdrawable_balance - challenge.entry_fee) })
          .eq('user_id', user.id);
      }

      // 2. Insert participant record
      const { error: partErr } = await supabase.from('challenge_members').insert({
        challenge_id: challengeId,
        user_id: user.id,
        status: 'active',
        stake_amount: challenge.is_monetary ? challenge.entry_fee : 0,
      });
      if (partErr) return { success: false, error: 'Failed to join: ' + partErr.message };

      // 3. Update gross pool & participant count
      const newPool = challenge.gross_pool + challenge.entry_fee;
      const pools = calcPool(newPool);
      await supabase.from('challenges').update({
        gross_pool: newPool,
        prize_pool: pools.prizePool,
        participant_count: (challenge.participant_count || 0) + 1,
      }).eq('id', challengeId);

      // 4. Insert event
      await supabase.from('challenge_events').insert({
        challenge_id: challengeId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'A user',
        event_type: 'join',
        title: `${user.user_metadata?.full_name || 'A new participant'} joined`,
      });

      // Update local state
      setMyParticipations(prev => [...prev, participantRecord]);
      setChallenges(prev => prev.map(c => c.id === challengeId ? {
        ...c,
        gross_pool: newPool,
        prize_pool: pools.prizePool,
        participant_count: (c.participant_count || 0) + 1,
      } : c));
      if (challenge.is_monetary) {
        setWallet(prev => prev ? { ...prev, withdrawable_balance: prev.withdrawable_balance - challenge.entry_fee } : prev);
      }

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [challenges, wallet, user, isGuest, userId]);

  // ── LEAVE CHALLENGE ────────────────────────────────────────────────────────
  const leaveChallenge = useCallback(async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return { success: false, error: 'Not found' };
    if (challenge.status === 'active' && challenge.is_monetary) {
      return { success: false, error: 'Cannot leave an active monetary challenge. Contact support if there is an issue.' };
    }

    if (isGuest) {
      const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []);
      guestSave(GUEST_PARTICIPANTS_KEY, parts.filter(p => !(p.challenge_id === challengeId && p.user_id === userId)));
      setMyParticipations(prev => prev.filter(p => p.challenge_id !== challengeId));
      return { success: true };
    }

    const { error } = await supabase.from('challenge_members')
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', user.id);
    if (error) return { success: false, error: error.message };
    setMyParticipations(prev => prev.filter(p => p.challenge_id !== challengeId));
    return { success: true };
  }, [challenges, user, isGuest, userId]);

  // ── CREATE CHALLENGE ───────────────────────────────────────────────────────
  const createChallenge = useCallback(async (definition) => {
    if (!definition.title?.trim()) return { success: false, error: 'Title is required' };
    if (!definition.objectives?.length) return { success: false, error: 'At least one objective is required' };

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (definition.duration_days || 7));

    const pool = definition.is_monetary
      ? calcPool((definition.entry_fee || 0) * 1) // initial pool with just creator's stake
      : { grossPool: 0, platformAllocation: 0, creatorReward: 0, prizePool: 0 };

    const ch = {
      id: genId('ch'),
      title: definition.title.trim(),
      description: definition.description || '',
      category: definition.category || 'physical',
      mode: definition.mode || 'solo',
      objectives: definition.objectives || [],
      rules: definition.rules || {},
      status: 'joining',
      is_monetary: definition.is_monetary || false,
      entry_fee: definition.entry_fee || 0,
      currency: 'ETB',
      gross_pool: pool.grossPool,
      prize_pool: pool.prizePool,
      platform_fee_pct: PLATFORM_FEE_PCT,
      creator_reward_pct: CREATOR_REWARD_PCT,
      invite_code: genInviteCode(),
      is_private: definition.is_private || false,
      start_date: definition.start_date || now.toISOString().split('T')[0],
      end_date: definition.end_date || endDate.toISOString().split('T')[0],
      participant_count: 1,
      image_url: definition.image_url || _defaultImage(definition.category),
      difficulty: definition.difficulty || 'Moderate',
      creator_id: userId,
      created_at: now.toISOString(),
      duration_days: definition.duration_days || 7,
      verification_method: definition.verification_method || 'device',
      xp_reward: definition.xp_reward || 150,
      points_reward: definition.points_reward || 75,
    };

    if (isGuest) {
      const stored = guestLoad(GUEST_CHALLENGES_KEY, []);
      stored.unshift(ch);
      guestSave(GUEST_CHALLENGES_KEY, stored);
      setChallenges(prev => [ch, ...prev]);

      // Auto-join creator
      const part = {
        id: genId('part'), challenge_id: ch.id, user_id: userId, status: 'active',
        streak: 0, best_streak: 0, completed_days: [], stake_amount: 0,
        joined_at: new Date().toISOString(),
      };
      const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []);
      parts.push(part);
      guestSave(GUEST_PARTICIPANTS_KEY, parts);
      setMyParticipations(prev => [...prev, part]);
      _guestAddXP(25);

      return { success: true, challenge: ch };
    }

    try {
      const { data, error } = await supabase.from('challenges').insert({
        id: ch.id,
        creator_id: user.id,
        title: ch.title,
        description: ch.description,
        category: ch.category,
        mode: ch.mode,
        objectives: ch.objectives,
        rules: ch.rules,
        status: ch.status,
        is_monetary: ch.is_monetary,
        entry_fee: ch.entry_fee,
        currency: ch.currency,
        gross_pool: ch.gross_pool,
        prize_pool: ch.prize_pool,
        invite_code: ch.invite_code,
        is_private: ch.is_private,
        start_date: ch.start_date,
        end_date: ch.end_date,
      }).select().single();

      if (error) return { success: false, error: error.message };

      const created = _normalizeChallenge(data);
      setChallenges(prev => [created, ...prev]);

      // Auto-join creator
      await supabase.from('challenge_members').insert({
        challenge_id: created.id, user_id: user.id, status: 'active', stake_amount: 0,
      });
      setMyParticipations(prev => [...prev, {
        challenge_id: created.id, user_id: user.id, status: 'active',
        streak: 0, completed_days: [], joined_at: new Date().toISOString(),
      }]);

      return { success: true, challenge: created };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user, isGuest, userId]);

  // ── RECORD DAILY PROGRESS ──────────────────────────────────────────────────
  const recordProgress = useCallback(async (challengeId, dayNumber, verificationResult) => {
    const participation = myParticipations.find(p => p.challenge_id === challengeId);
    if (!participation) return { success: false, error: 'Not a participant' };

    const challenge = challenges.find(c => c.id === challengeId);
    const completedDays = participation.completed_days || [];
    if (completedDays.includes(dayNumber)) return { success: false, error: 'Day already recorded' };

    const newDays = [...completedDays, dayNumber].sort((a, b) => a - b);
    const streak = _calcStreak(newDays);
    const bestStreak = Math.max(participation.best_streak || 0, streak);
    const completionRate = Math.round((newDays.length / (challenge?.duration_days || 7)) * 100);

    const updates = {
      completed_days: newDays,
      streak,
      best_streak: bestStreak,
      last_activity_at: new Date().toISOString(),
    };

    if (isGuest) {
      const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []);
      const updated = parts.map(p =>
        p.challenge_id === challengeId && p.user_id === userId ? { ...p, ...updates } : p
      );
      guestSave(GUEST_PARTICIPANTS_KEY, updated);
      setMyParticipations(prev => prev.map(p =>
        p.challenge_id === challengeId ? { ...p, ...updates } : p
      ));
      _guestAddXP(25);
      _guestAddEvent(challengeId, 'complete_day', `Day ${dayNumber} completed!`);
      return { success: true, streak, completionRate };
    }

    try {
      await supabase.from('challenge_members').update(updates)
        .eq('challenge_id', challengeId).eq('user_id', user.id);

      // Insert challenge session record
      await supabase.from('challenge_sessions').insert({
        challenge_id: challengeId,
        user_id: user.id,
        objective_id: verificationResult?.objectiveId || 'daily',
        status: verificationResult?.verified ? 'verified' : 'needs_review',
        measurement_value: verificationResult?.value || 0,
        target_value: verificationResult?.target || 0,
        reps_valid: verificationResult?.repsValid || 0,
        verification_method: verificationResult?.method || 'device',
        verification_strength: verificationResult?.strength || 'device',
        completed_at: new Date().toISOString(),
      });

      // Insert event
      await supabase.from('challenge_events').insert({
        challenge_id: challengeId,
        user_id: user.id,
        user_name: user.user_metadata?.full_name || 'A participant',
        event_type: 'complete_day',
        title: `Completed Day ${dayNumber}`,
        details: { day: dayNumber, streak, completionRate },
      });

      // Award XP
      await supabase.from('wallet_accounts')
        .update({ xp: (wallet?.xp || 0) + 25 })
        .eq('user_id', user.id);

      setMyParticipations(prev => prev.map(p =>
        p.challenge_id === challengeId ? { ...p, ...updates } : p
      ));
      setWallet(prev => prev ? { ...prev, xp: (prev.xp || 0) + 25 } : prev);

      return { success: true, streak, completionRate };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [myParticipations, challenges, wallet, user, isGuest, userId]);

  // ── WALLET OPERATIONS ──────────────────────────────────────────────────────
  const depositFunds = useCallback(async (amount, method) => {
    if (amount <= 0) return { success: false, error: 'Invalid amount' };

    if (isGuest) {
      const w = guestLoad(GUEST_WALLET_KEY + '_' + userId, _defaultWallet(userId));
      const updated = { ...w, withdrawable_balance: (w.withdrawable_balance || 0) + amount };
      guestSave(GUEST_WALLET_KEY + '_' + userId, updated);
      setWallet(updated);
      const txns = guestLoad(GUEST_TRANSACTIONS_KEY + '_' + userId, []);
      txns.unshift({ id: genId('tx'), type: 'deposit', amount, currency: 'ETB', method, status: 'completed', created_at: new Date().toISOString(), notes: `Deposit via ${method}` });
      guestSave(GUEST_TRANSACTIONS_KEY + '_' + userId, txns);
      setTransactions(prev => [...txns.slice(0, 1), ...prev]);
      return { success: true };
    }

    try {
      const txRef = genId('ref');
      const { error } = await supabase.from('wallet_transactions').insert({
        user_id: user.id, type: 'deposit', amount, currency: 'ETB',
        status: 'completed', reference_id: txRef, notes: `Deposit via ${method}`,
      });
      if (error) return { success: false, error: error.message };

      const newBal = (wallet?.withdrawable_balance || 0) + amount;
      await supabase.from('wallet_accounts').update({ withdrawable_balance: newBal }).eq('user_id', user.id);
      setWallet(prev => prev ? { ...prev, withdrawable_balance: newBal } : prev);
      setTransactions(prev => [{ id: txRef, type: 'deposit', amount, notes: `Deposit via ${method}`, status: 'completed', created_at: new Date().toISOString() }, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [wallet, user, isGuest, userId]);

  const withdrawFunds = useCallback(async (amount, method, account) => {
    const bal = wallet?.withdrawable_balance || 0;
    if (amount <= 0) return { success: false, error: 'Invalid amount' };
    if (amount > bal) return { success: false, error: `Insufficient funds. Available: ${bal.toFixed(2)} ETB` };

    if (isGuest) {
      const w = guestLoad(GUEST_WALLET_KEY + '_' + userId, _defaultWallet(userId));
      const updated = { ...w, withdrawable_balance: w.withdrawable_balance - amount };
      guestSave(GUEST_WALLET_KEY + '_' + userId, updated);
      setWallet(updated);
      const txns = guestLoad(GUEST_TRANSACTIONS_KEY + '_' + userId, []);
      txns.unshift({ id: genId('tx'), type: 'withdrawal', amount: -amount, currency: 'ETB', method, status: 'completed', created_at: new Date().toISOString() });
      guestSave(GUEST_TRANSACTIONS_KEY + '_' + userId, txns);
      setTransactions(prev => [txns[0], ...prev]);
      return { success: true };
    }

    try {
      const txRef = genId('ref');
      const { error } = await supabase.from('wallet_transactions').insert({
        user_id: user.id, type: 'withdrawal', amount: -amount, currency: 'ETB',
        status: 'completed', reference_id: txRef, notes: `Withdrawal to ${method} ${account}`,
      });
      if (error) return { success: false, error: error.message };
      const newBal = bal - amount;
      await supabase.from('wallet_accounts').update({ withdrawable_balance: newBal }).eq('user_id', user.id);
      setWallet(prev => prev ? { ...prev, withdrawable_balance: newBal } : prev);
      setTransactions(prev => [{ id: txRef, type: 'withdrawal', amount: -amount, notes: `Withdrawal to ${method}`, status: 'completed', created_at: new Date().toISOString() }, ...prev]);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [wallet, user, isGuest, userId]);

  // ── LEADERBOARD ────────────────────────────────────────────────────────────
  const getLeaderboard = useCallback(async (challengeId) => {
    if (isGuest) {
      const parts = guestLoad(GUEST_PARTICIPANTS_KEY, []).filter(p => p.challenge_id === challengeId);
      return parts
        .map(p => ({ ...p, completion_rate: Math.round(((p.completed_days?.length || 0) / 7) * 100) }))
        .sort((a, b) => (b.completion_rate - a.completion_rate) || (b.streak - a.streak))
        .map((p, i) => ({ ...p, rank: i + 1 }));
    }
    const { data } = await supabase
      .from('challenge_members')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('streak', { ascending: false });
    return (data || []).map((p, i) => ({ ...p, rank: i + 1 }));
  }, [isGuest]);

  // ── EVENTS FEED ────────────────────────────────────────────────────────────
  const getChallengeEvents = useCallback(async (challengeId) => {
    if (isGuest) {
      const ev = guestLoad(GUEST_EVENTS_KEY, {});
      return (ev[challengeId] || []).slice(0, 30);
    }
    const { data } = await supabase
      .from('challenge_events')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false })
      .limit(30);
    return data || [];
  }, [isGuest]);

  // ── SUBMIT DISPUTE ─────────────────────────────────────────────────────────
  const submitDispute = useCallback(async (challengeId, reason, details) => {
    if (isGuest) return { success: true, message: 'Dispute recorded locally.' };
    const { error } = await supabase.from('challenge_disputes').insert({
      challenge_id: challengeId, user_id: user.id, reason,
      evidence_url: details?.evidenceUrl || null, status: 'open',
    });
    return error ? { success: false, error: error.message } : { success: true };
  }, [user, isGuest]);

  // ── HELPERS ────────────────────────────────────────────────────────────────
  function isParticipant(challengeId) {
    return myParticipations.some(p => p.challenge_id === challengeId);
  }

  function getMyParticipation(challengeId) {
    return myParticipations.find(p => p.challenge_id === challengeId) || null;
  }

  function _calcStreak(sortedDays) {
    if (!sortedDays.length) return 0;
    const last = sortedDays[sortedDays.length - 1];
    let streak = 0;
    for (let d = last; d >= 1; d--) {
      if (sortedDays.includes(d)) streak++;
      else break;
    }
    return streak;
  }

  function _guestDeductWallet(amount, type, notes, challengeId) {
    const w = guestLoad(GUEST_WALLET_KEY + '_' + userId, _defaultWallet(userId));
    w.withdrawable_balance = Math.max(0, (w.withdrawable_balance || 0) - amount);
    guestSave(GUEST_WALLET_KEY + '_' + userId, w);
    setWallet(w);
    const txns = guestLoad(GUEST_TRANSACTIONS_KEY + '_' + userId, []);
    txns.unshift({ id: genId('tx'), type, amount: -amount, currency: 'ETB', challenge_id: challengeId, status: 'completed', notes, created_at: new Date().toISOString() });
    guestSave(GUEST_TRANSACTIONS_KEY + '_' + userId, txns);
    setTransactions(txns);
  }

  function _guestAddXP(amount) {
    const w = guestLoad(GUEST_WALLET_KEY + '_' + userId, _defaultWallet(userId));
    w.xp = (w.xp || 0) + amount;
    w.nura_points = (w.nura_points || 0) + Math.floor(amount / 5);
    guestSave(GUEST_WALLET_KEY + '_' + userId, w);
    setWallet(w);
  }

  function _guestUpdatePool(challengeId, entryFee) {
    const stored = guestLoad(GUEST_CHALLENGES_KEY, []);
    const updated = stored.map(c => {
      if (c.id === challengeId) {
        const newGross = (c.gross_pool || 0) + entryFee;
        const pools = calcPool(newGross);
        return { ...c, gross_pool: newGross, prize_pool: pools.prizePool, participant_count: (c.participant_count || 0) + 1 };
      }
      return c;
    });
    guestSave(GUEST_CHALLENGES_KEY, updated);
    setChallenges(updated);
  }

  function _guestAddEvent(challengeId, eventType, title) {
    const ev = guestLoad(GUEST_EVENTS_KEY, {});
    if (!ev[challengeId]) ev[challengeId] = [];
    ev[challengeId].unshift({ id: genId('evt'), challenge_id: challengeId, event_type: eventType, title, user_name: 'You', created_at: new Date().toISOString() });
    guestSave(GUEST_EVENTS_KEY, ev);
  }

  return {
    challenges,
    myParticipations,
    wallet,
    transactions,
    loading,
    error,
    isParticipant,
    getMyParticipation,
    joinChallenge,
    leaveChallenge,
    createChallenge,
    recordProgress,
    depositFunds,
    withdrawFunds,
    getLeaderboard,
    getChallengeEvents,
    submitDispute,
    reload: loadAll,
    calcPool,
  };
}

// ─── SEED CHALLENGES ──────────────────────────────────────────────────────────
function _defaultImage(category) {
  const imgs = {
    physical: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    sleep: 'https://images.unsplash.com/photo-1631739085561-e4bfe1bf1e2b?w=800&auto=format&fit=crop&q=80',
    digital_wellbeing: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    hydration: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    habits: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    social: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    nura_360: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  };
  return imgs[category] || imgs.physical;
}

function _seedGuestChallenges() {
  const now = new Date();
  const end7 = new Date(now); end7.setDate(end7.getDate() + 7);
  const end14 = new Date(now); end14.setDate(end14.getDate() + 14);
  const end10 = new Date(now); end10.setDate(end10.getDate() + 10);

  const seeds = [
    {
      id: 'seed_morning_warrior',
      title: '7-Day Morning Warrior',
      description: 'Wake at 5:30 AM, gym check-in, run 2 km, and 30 push-ups every day for 7 days. Camera + GPS verified.',
      category: 'physical', mode: 'group', difficulty: 'Advanced',
      objectives: [
        { id: 'o1', label: 'Wake at 5:30 AM', type: 'wake_time', target: '5:30', unit: 'time', verification_method: 'device' },
        { id: 'o2', label: 'Gym check-in', type: 'location_checkin', target: 'gym', unit: 'check-in', verification_method: 'location' },
        { id: 'o3', label: 'Run 2 km', type: 'run_distance', target: 2, unit: 'km', verification_method: 'device' },
        { id: 'o4', label: '30 push-ups', type: 'pushups', target: 30, unit: 'reps', verification_method: 'camera' },
      ],
      status: 'active', is_monetary: true, entry_fee: 100, currency: 'ETB',
      gross_pool: 4200, prize_pool: 3696, platform_fee_pct: 10, creator_reward_pct: 2,
      invite_code: 'NURA-7DAY', is_private: false, participant_count: 42,
      image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
      duration_days: 7, verification_method: 'camera',
      start_date: now.toISOString().split('T')[0], end_date: end7.toISOString().split('T')[0],
      xp_reward: 350, points_reward: 200, creator_id: 'system', created_at: now.toISOString(),
    },
    {
      id: 'seed_screen_detox',
      title: 'Zero Night Screen Sanctuary',
      description: 'No social media or streaming after 10:30 PM for 14 days. Synced with device wellbeing.',
      category: 'digital_wellbeing', mode: 'group', difficulty: 'Moderate',
      objectives: [
        { id: 'o1', label: 'Zero restricted screen time after 10:30 PM', type: 'screen_time_limit', target: 0, unit: 'minutes', verification_method: 'device' },
      ],
      status: 'active', is_monetary: false, entry_fee: 0, currency: 'ETB',
      gross_pool: 0, prize_pool: 0, platform_fee_pct: 10, creator_reward_pct: 2,
      invite_code: 'NURA-SCRN', is_private: false, participant_count: 88,
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
      duration_days: 14, verification_method: 'device',
      start_date: now.toISOString().split('T')[0], end_date: end14.toISOString().split('T')[0],
      xp_reward: 200, points_reward: 100, creator_id: 'system', created_at: now.toISOString(),
    },
    {
      id: 'seed_hydration',
      title: '3-Liter Hydration Ladder',
      description: 'Hit 3 liters of verified water intake daily for 10 days. Evidence-verified.',
      category: 'hydration', mode: 'ladder', difficulty: 'Easy',
      objectives: [
        { id: 'o1', label: '3L daily hydration', type: 'hydration', target: 3000, unit: 'ml', verification_method: 'evidence' },
      ],
      status: 'active', is_monetary: true, entry_fee: 50, currency: 'ETB',
      gross_pool: 3250, prize_pool: 2860, platform_fee_pct: 10, creator_reward_pct: 2,
      invite_code: 'NURA-H2O', is_private: false, participant_count: 65,
      image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
      duration_days: 10, verification_method: 'evidence',
      start_date: now.toISOString().split('T')[0], end_date: end10.toISOString().split('T')[0],
      xp_reward: 250, points_reward: 125, creator_id: 'system', created_at: now.toISOString(),
    },
    {
      id: 'seed_sunrise_run',
      title: 'Addis Sunrise 5km Run',
      description: 'Morning 5km outdoor run verified with GPS speed validation. 14-day streak battle.',
      category: 'physical', mode: 'streak_battle', difficulty: 'Moderate',
      objectives: [
        { id: 'o1', label: 'Run 5 km', type: 'run_distance', target: 5, unit: 'km', verification_method: 'device' },
      ],
      status: 'active', is_monetary: true, entry_fee: 100, currency: 'ETB',
      gross_pool: 3900, prize_pool: 3432, platform_fee_pct: 10, creator_reward_pct: 2,
      invite_code: 'NURA-RUN5', is_private: false, participant_count: 39,
      image_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
      duration_days: 14, verification_method: 'device',
      start_date: now.toISOString().split('T')[0], end_date: end14.toISOString().split('T')[0],
      xp_reward: 400, points_reward: 200, creator_id: 'system', created_at: now.toISOString(),
    },
    {
      id: 'seed_nura_360',
      title: 'Nura 360 — Total Wellness Week',
      description: 'Multi-system challenge: 8K steps + 30min workout + 2L water + screen limit + bedtime routine.',
      category: 'nura_360', mode: 'group', difficulty: 'Advanced',
      objectives: [
        { id: 'o1', label: '8,000 steps', type: 'steps', target: 8000, unit: 'steps', verification_method: 'device' },
        { id: 'o2', label: '30-min workout', type: 'workout_duration', target: 30, unit: 'minutes', verification_method: 'device' },
        { id: 'o3', label: '2L hydration', type: 'hydration', target: 2000, unit: 'ml', verification_method: 'evidence' },
        { id: 'o4', label: 'Max 2h screen time', type: 'screen_time_limit', target: 120, unit: 'minutes', verification_method: 'device' },
        { id: 'o5', label: 'Bedtime by 11 PM', type: 'bedtime', target: '23:00', unit: 'time', verification_method: 'device' },
      ],
      status: 'active', is_monetary: false, entry_fee: 0, currency: 'ETB',
      gross_pool: 0, prize_pool: 0, platform_fee_pct: 10, creator_reward_pct: 2,
      invite_code: 'NURA-360', is_private: false, participant_count: 27,
      image_url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
      duration_days: 7, verification_method: 'device',
      start_date: now.toISOString().split('T')[0], end_date: end7.toISOString().split('T')[0],
      xp_reward: 500, points_reward: 300, creator_id: 'system', created_at: now.toISOString(),
    },
  ];

  guestSave(GUEST_CHALLENGES_KEY, seeds);
  return seeds;
}
