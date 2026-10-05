import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Trophy,
  ShieldCheck,
  Sparkles,
  Clock,
  TrendingUp,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { WalletAccount, WalletTransaction } from '../../types/communityTypes';
import { challengeEngine } from '../../services/challenge/challengeEngine';

interface WalletRewardsModalProps {
  visible: boolean;
  onClose: () => void;
  onDepositPress?: () => void;
  onWalletUpdated?: (wallet: WalletAccount) => void;
}

const DEFAULT_WALLET: WalletAccount = {
  userId: 'user_me',
  currency: 'ETB',
  withdrawableBalance: 420.0,
  challengeWinnings: 350.0,
  creatorRewards: 70.0,
  pendingRewards: 100.0,
  nuraPoints: 850,
  xp: 1240,
  updatedAt: new Date().toISOString(),
};

export default function WalletRewardsModal({
  visible,
  onClose,
  onDepositPress,
  onWalletUpdated,
}: WalletRewardsModalProps) {
  const { theme, isDark } = useTheme();
  const [wallet, setWallet] = useState<WalletAccount>(() => {
    return challengeEngine.getWallet('user_me') || DEFAULT_WALLET;
  });
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [selectedTab, setSelectedTab] = useState<'balance' | 'deposit' | 'withdraw' | 'ledger' | 'rules'>('balance');

  // Interactive Form States
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState<'Telebirr' | 'CBE Birr'>('Telebirr');
  const [depositPhone, setDepositPhone] = useState('0911234567');

  const [withdrawAmount, setWithdrawAmount] = useState('100');
  const [withdrawMethod, setWithdrawMethod] = useState<'Telebirr' | 'CBE Birr'>('Telebirr');
  const [withdrawPhone, setWithdrawPhone] = useState('0911234567');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      const currentWallet = challengeEngine.getWallet('user_me') || DEFAULT_WALLET;
      setWallet(currentWallet);
      setSelectedTab('balance');

      setTransactions([
        {
          id: 'tx_1',
          userId: 'user_me',
          type: 'payout',
          amount: 280.00,
          currency: 'ETB',
          status: 'completed',
          challengeId: 'ch_squats_1',
          referenceId: 'ref_payout_1',
          notes: '100 Squats Morning War - Verified finisher payout (88% prize pool share)',
          createdAt: '2026-10-02T08:30:00Z',
        },
        {
          id: 'tx_2',
          userId: 'user_me',
          type: 'creator_reward',
          amount: 70.00,
          currency: 'ETB',
          status: 'completed',
          challengeId: 'ch_run_5k',
          referenceId: 'ref_creator_1',
          notes: 'Daily 5km Hydration Run - 2% Creator Royalty reward',
          createdAt: '2026-09-30T17:15:00Z',
        },
        {
          id: 'tx_3',
          userId: 'user_me',
          type: 'entry_fee',
          amount: -100.00,
          currency: 'ETB',
          status: 'completed',
          challengeId: 'ch_squats_1',
          referenceId: 'ref_entry_1',
          notes: '100 Squats Morning War - Entry stake reserved in escrow',
          createdAt: '2026-09-25T06:00:00Z',
        },
      ]);
    }
  }, [visible]);

  const handleDepositClick = () => {
    if (onDepositPress) {
      onDepositPress();
    } else {
      setSelectedTab('deposit');
    }
  };

  const handleWithdrawClick = () => {
    setSelectedTab('withdraw');
  };

  const executeDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid deposit amount greater than 0 ETB.' });
      return;
    }

    const currentWallet = wallet || challengeEngine.getWallet('user_me') || DEFAULT_WALLET;
    const newBalance = currentWallet.withdrawableBalance + amt;
    const updatedWallet: WalletAccount = {
      ...currentWallet,
      withdrawableBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentWallet.userId || 'user_me',
      type: 'deposit',
      amount: amt,
      currency: 'ETB',
      status: 'completed',
      referenceId: `ref_dep_${Date.now()}`,
      notes: `Deposit via ${depositMethod} (${depositPhone || 'Direct'})`,
      createdAt: new Date().toISOString(),
    };

    setWallet(updatedWallet);
    setTransactions((prev) => [newTx, ...prev]);
    challengeEngine.saveWallet(updatedWallet);
    if (onWalletUpdated) onWalletUpdated(updatedWallet);

    setSelectedTab('balance');
    setFeedback({
      type: 'success',
      message: `Successfully deposited ${amt.toFixed(2)} ETB via ${depositMethod}!`,
    });
    setTimeout(() => setFeedback(null), 4500);
  };

  const executeWithdrawal = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid withdrawal amount greater than 0 ETB.' });
      return;
    }

    const currentWallet = wallet || challengeEngine.getWallet('user_me') || DEFAULT_WALLET;

    if (amt > currentWallet.withdrawableBalance) {
      setFeedback({
        type: 'error',
        message: `Cannot withdraw ${amt.toFixed(2)} ETB. Available balance is ${currentWallet.withdrawableBalance.toFixed(2)} ETB.`,
      });
      return;
    }

    const newBalance = currentWallet.withdrawableBalance - amt;
    const updatedWallet: WalletAccount = {
      ...currentWallet,
      withdrawableBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: currentWallet.userId || 'user_me',
      type: 'withdrawal',
      amount: -amt,
      currency: 'ETB',
      status: 'completed',
      referenceId: `ref_wth_${Date.now()}`,
      notes: `Withdrawal to ${withdrawMethod} (${withdrawPhone || 'Direct'})`,
      createdAt: new Date().toISOString(),
    };

    setWallet(updatedWallet);
    setTransactions((prev) => [newTx, ...prev]);
    challengeEngine.saveWallet(updatedWallet);
    if (onWalletUpdated) onWalletUpdated(updatedWallet);

    setSelectedTab('balance');
    setFeedback({
      type: 'success',
      message: `Withdrawal of ${amt.toFixed(2)} ETB to ${withdrawMethod} processed successfully!`,
    });
    setTimeout(() => setFeedback(null), 4500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
        <View style={[styles.walletSheet, { backgroundColor: theme.background }]}>
          <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.headerIconWrap, { backgroundColor: `${theme.accent}15` }]}>
              <Wallet size={20} color={theme.accent} />
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Stakes & Rewards</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Verified Escrow & Ledgers
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Feedback Banner */}
        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              {
                backgroundColor: feedback.type === 'success' ? '#16a34a' : '#dc2626',
              },
            ]}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} color="#ffffff" />
            ) : (
              <AlertCircle size={18} color="#ffffff" />
            )}
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={[styles.tabBar, { borderBottomColor: theme.borderSubtle }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['balance', 'deposit', 'withdraw', 'ledger', 'rules'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBtn,
                  selectedTab === tab && { borderBottomColor: theme.accent, borderBottomWidth: 2.5 },
                ]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: selectedTab === tab ? theme.textPrimary : theme.textSecondary },
                    selectedTab === tab && { fontWeight: '800' },
                  ]}
                >
                  {tab === 'balance'
                    ? 'My Wallet'
                    : tab === 'deposit'
                    ? 'Deposit'
                    : tab === 'withdraw'
                    ? 'Withdraw'
                    : tab === 'ledger'
                    ? 'Transactions'
                    : 'Economics'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* ======================================================== */}
          {/* TAB 1: BALANCE & OVERVIEW                                */}
          {/* ======================================================== */}
          {selectedTab === 'balance' && (
            <>
              {/* Primary Balance Card */}
              <View style={[styles.balanceCard, { backgroundColor: theme.accentDeep }]}>
                <View style={styles.balanceTopRow}>
                  <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
                  <View style={styles.verifiedTag}>
                    <ShieldCheck size={12} color="#22c55e" />
                    <Text style={styles.verifiedTagText}>Escrow Protected</Text>
                  </View>
                </View>

                <Text style={styles.balanceAmount}>
                  {wallet?.withdrawableBalance.toFixed(2) ?? '0.00'}{' '}
                  <Text style={styles.currencyCode}>{wallet?.currency || 'ETB'}</Text>
                </Text>

                <View style={styles.balanceActionsRow}>
                  <TouchableOpacity
                    style={styles.withdrawBtn}
                    onPress={handleWithdrawClick}
                    activeOpacity={0.85}
                  >
                    <ArrowUpRight size={16} color="#ffffff" />
                    <Text style={styles.withdrawBtnText}>Withdraw</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.depositBtn}
                    onPress={handleDepositClick}
                    activeOpacity={0.85}
                  >
                    <ArrowDownLeft size={16} color="#0f172a" />
                    <Text style={styles.depositBtnText}>Deposit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sub-balances breakdown */}
              <View style={styles.subBalancesGrid}>
                <View style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Trophy size={18} color="#eab308" />
                  <Text style={[styles.subCardLabel, { color: theme.textSecondary }]}>Challenge Winnings</Text>
                  <Text style={[styles.subCardValue, { color: theme.textPrimary }]}>
                    {wallet?.challengeWinnings.toFixed(2)} ETB
                  </Text>
                </View>

                <View style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Sparkles size={18} color="#a855f7" />
                  <Text style={[styles.subCardLabel, { color: theme.textSecondary }]}>Creator Rewards</Text>
                  <Text style={[styles.subCardValue, { color: theme.textPrimary }]}>
                    {wallet?.creatorRewards.toFixed(2)} ETB
                  </Text>
                </View>

                <View style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <Clock size={18} color="#38bdf8" />
                  <Text style={[styles.subCardLabel, { color: theme.textSecondary }]}>Pending in Escrow</Text>
                  <Text style={[styles.subCardValue, { color: theme.textPrimary }]}>
                    {wallet?.pendingRewards.toFixed(2)} ETB
                  </Text>
                </View>

                <View style={[styles.subCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                  <TrendingUp size={18} color="#22c55e" />
                  <Text style={[styles.subCardLabel, { color: theme.textSecondary }]}>Nura Points / XP</Text>
                  <Text style={[styles.subCardValue, { color: theme.textPrimary }]}>
                    {wallet?.nuraPoints} pts • {wallet?.xp} XP
                  </Text>
                </View>
              </View>

              {/* Security Banner */}
              <View style={[styles.securityNotice, { backgroundColor: `${theme.accent}10`, borderColor: `${theme.accent}25` }]}>
                <ShieldCheck size={20} color={theme.accent} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.securityNoticeTitle, { color: theme.textPrimary }]}>100% Anti-Cheat Escrow</Text>
                  <Text style={[styles.securityNoticeBody, { color: theme.textSecondary }]}>
                    Challenge stakes are locked in tamper-proof escrow. Payouts release only after real-time verification validation. Self-reported claims are strictly prohibited from prize pools.
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* ======================================================== */}
          {/* TAB 2: DEPOSIT VIEW                                      */}
          {/* ======================================================== */}
          {selectedTab === 'deposit' && (
            <View style={[styles.actionViewCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.actionViewHeader}>
                <View style={[styles.sheetActionIcon, { backgroundColor: 'rgba(22, 163, 74, 0.15)' }]}>
                  <ArrowDownLeft size={22} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionSheetTitle, { color: theme.textPrimary }]}>Top Up Staking Balance</Text>
                  <Text style={[styles.actionSheetSubtitle, { color: theme.textSecondary }]}>
                    Instant deposit via Telebirr or CBE Birr
                  </Text>
                </View>
              </View>

              {/* Method Selector */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Select Payment Gateway</Text>
              <View style={styles.methodRow}>
                <TouchableOpacity
                  style={[
                    styles.methodCard,
                    { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                    depositMethod === 'Telebirr' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.12)' },
                  ]}
                  onPress={() => setDepositMethod('Telebirr')}
                  activeOpacity={0.85}
                >
                  <Smartphone size={22} color={depositMethod === 'Telebirr' ? '#0284c7' : '#64748b'} />
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: depositMethod === 'Telebirr' ? '#0284c7' : theme.textPrimary },
                    ]}
                  >
                    Telebirr
                  </Text>
                  <Text style={styles.methodBadge}>0% Fee • Instant</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodCard,
                    { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                    depositMethod === 'CBE Birr' && { borderColor: '#b45309', backgroundColor: 'rgba(180, 83, 9, 0.12)' },
                  ]}
                  onPress={() => setDepositMethod('CBE Birr')}
                  activeOpacity={0.85}
                >
                  <Building2 size={22} color={depositMethod === 'CBE Birr' ? '#b45309' : '#64748b'} />
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: depositMethod === 'CBE Birr' ? '#b45309' : theme.textPrimary },
                    ]}
                  >
                    CBE Birr
                  </Text>
                  <Text style={styles.methodBadge}>0% Fee • Instant</Text>
                </TouchableOpacity>
              </View>

              {/* Account / Phone */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>
                {depositMethod} Phone Number
              </Text>
              <TextInput
                style={[
                  styles.sheetInput,
                  { backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.borderSubtle },
                ]}
                value={depositPhone}
                onChangeText={setDepositPhone}
                placeholder="09XXXXXXXX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />

              {/* Amount presets */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Quick Amount (ETB)</Text>
              <View style={styles.presetsRow}>
                {['50', '100', '250', '500', '1000'].map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    style={[
                      styles.presetChip,
                      { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                      depositAmount === amt && styles.presetChipActive,
                    ]}
                    onPress={() => setDepositAmount(amt)}
                  >
                    <Text
                      style={[
                        styles.presetChipText,
                        { color: depositAmount === amt ? '#ffffff' : theme.textSecondary },
                      ]}
                    >
                      +{amt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Or Enter Custom Amount (ETB)</Text>
              <TextInput
                style={[
                  styles.sheetInput,
                  { backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.borderSubtle },
                ]}
                value={depositAmount}
                onChangeText={setDepositAmount}
                placeholder="Enter amount in ETB"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />

              {/* Action Buttons */}
              <View style={styles.actionCardBtns}>
                <TouchableOpacity
                  style={[styles.sheetConfirmBtn, { backgroundColor: '#16a34a' }]}
                  onPress={executeDeposit}
                  activeOpacity={0.85}
                >
                  <ArrowDownLeft size={18} color="#ffffff" />
                  <Text style={styles.sheetConfirmBtnText}>
                    Deposit {depositAmount ? `${parseFloat(depositAmount) || 0} ETB` : ''} via {depositMethod}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetCancelBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => setSelectedTab('balance')}
                >
                  <Text style={[styles.sheetCancelBtnText, { color: theme.textSecondary }]}>Back to Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 3: WITHDRAW VIEW                                     */}
          {/* ======================================================== */}
          {selectedTab === 'withdraw' && (
            <View style={[styles.actionViewCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <View style={styles.actionViewHeader}>
                <View style={[styles.sheetActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <ArrowUpRight size={22} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionSheetTitle, { color: theme.textPrimary }]}>Withdraw Winnings</Text>
                  <Text style={[styles.actionSheetSubtitle, { color: '#16a34a', fontWeight: '700' }]}>
                    Available Balance: {wallet?.withdrawableBalance.toFixed(2)} ETB
                  </Text>
                </View>
              </View>

              {/* Method Selector */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Payout Destination</Text>
              <View style={styles.methodRow}>
                <TouchableOpacity
                  style={[
                    styles.methodCard,
                    { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                    withdrawMethod === 'Telebirr' && { borderColor: '#0284c7', backgroundColor: 'rgba(2, 132, 199, 0.12)' },
                  ]}
                  onPress={() => setWithdrawMethod('Telebirr')}
                  activeOpacity={0.85}
                >
                  <Smartphone size={22} color={withdrawMethod === 'Telebirr' ? '#0284c7' : '#64748b'} />
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: withdrawMethod === 'Telebirr' ? '#0284c7' : theme.textPrimary },
                    ]}
                  >
                    Telebirr
                  </Text>
                  <Text style={styles.methodBadge}>Direct Transfer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodCard,
                    { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                    withdrawMethod === 'CBE Birr' && { borderColor: '#b45309', backgroundColor: 'rgba(180, 83, 9, 0.12)' },
                  ]}
                  onPress={() => setWithdrawMethod('CBE Birr')}
                  activeOpacity={0.85}
                >
                  <Building2 size={22} color={withdrawMethod === 'CBE Birr' ? '#b45309' : '#64748b'} />
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: withdrawMethod === 'CBE Birr' ? '#b45309' : theme.textPrimary },
                    ]}
                  >
                    CBE Birr
                  </Text>
                  <Text style={styles.methodBadge}>Direct Transfer</Text>
                </TouchableOpacity>
              </View>

              {/* Account / Phone */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>
                {withdrawMethod} Account / Phone
              </Text>
              <TextInput
                style={[
                  styles.sheetInput,
                  { backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.borderSubtle },
                ]}
                value={withdrawPhone}
                onChangeText={setWithdrawPhone}
                placeholder="09XXXXXXXX"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />

              {/* Quick percentage shortcuts */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Quick Amount</Text>
              <View style={styles.presetsRow}>
                {[
                  { label: '25%', factor: 0.25 },
                  { label: '50%', factor: 0.5 },
                  { label: '75%', factor: 0.75 },
                  { label: '100% Max', factor: 1.0 },
                ].map((p) => {
                  const maxVal = wallet?.withdrawableBalance || 0;
                  const calculated = Math.floor(maxVal * p.factor);
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[
                        styles.presetChip,
                        { backgroundColor: isDark ? '#1e293b' : '#f8fafc', borderColor: theme.borderSubtle },
                      ]}
                      onPress={() => setWithdrawAmount(calculated.toString())}
                    >
                      <Text style={[styles.presetChipText, { color: theme.textSecondary }]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Amount */}
              <Text style={[styles.sheetSectionLabel, { color: theme.textPrimary }]}>Withdraw Amount (ETB)</Text>
              <TextInput
                style={[
                  styles.sheetInput,
                  { backgroundColor: isDark ? '#1e293b' : '#f8fafc', color: theme.textPrimary, borderColor: theme.borderSubtle },
                ]}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                placeholder="Enter amount to withdraw"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />

              {/* Action Buttons */}
              <View style={styles.actionCardBtns}>
                <TouchableOpacity
                  style={[styles.sheetConfirmBtn, { backgroundColor: '#2563eb' }]}
                  onPress={executeWithdrawal}
                  activeOpacity={0.85}
                >
                  <ArrowUpRight size={18} color="#ffffff" />
                  <Text style={styles.sheetConfirmBtnText}>
                    Withdraw {withdrawAmount ? `${parseFloat(withdrawAmount) || 0} ETB` : ''} to {withdrawMethod}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.sheetCancelBtn, { borderColor: theme.borderSubtle }]}
                  onPress={() => setSelectedTab('balance')}
                >
                  <Text style={[styles.sheetCancelBtnText, { color: theme.textSecondary }]}>Back to Wallet</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TRANSACTIONS / LEDGER                             */}
          {/* ======================================================== */}
          {selectedTab === 'ledger' && (
            <View style={styles.ledgerList}>
              {transactions.map((tx) => (
                <View
                  key={tx.id}
                  style={[styles.transactionItem, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}
                >
                  <View style={styles.txIconWrap}>
                    {tx.amount > 0 ? (
                      <ArrowDownLeft size={18} color="#22c55e" />
                    ) : (
                      <ArrowUpRight size={18} color="#f87171" />
                    )}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.txTitle, { color: theme.textPrimary }]}>{tx.notes || tx.type}</Text>
                    <Text style={[styles.txTime, { color: theme.textSecondary }]}>
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.txAmount,
                      { color: tx.amount > 0 ? '#22c55e' : theme.textPrimary },
                    ]}
                  >
                    {tx.amount > 0 ? `+${tx.amount.toFixed(2)}` : tx.amount.toFixed(2)} {tx.currency}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* ======================================================== */}
          {/* TAB 5: TRANSPARENT ECONOMICS                             */}
          {/* ======================================================== */}
          {selectedTab === 'rules' && (
            <View style={styles.rulesContainer}>
              <View style={[styles.economicsCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.econHeader, { color: theme.textPrimary }]}>Transparent Pool Economics</Text>
                <Text style={[styles.econDesc, { color: theme.textSecondary }]}>
                  Every staked challenge operates on deterministic, verifiable mathematics:
                </Text>

                <View style={styles.splitBreakdown}>
                  <View style={styles.splitRow}>
                    <Text style={[styles.splitLabel, { color: theme.textPrimary }]}>Prize Pool (Finisher Distribution)</Text>
                    <Text style={[styles.splitValue, { color: '#22c55e' }]}>88%</Text>
                  </View>
                  <Text style={[styles.splitSub, { color: theme.textSecondary }]}>
                    Evenly distributed or tier-distributed among all members who fully pass verification criteria.
                  </Text>

                  <View style={[styles.splitRow, { marginTop: 14 }]}>
                    <Text style={[styles.splitLabel, { color: theme.textPrimary }]}>Platform Operations & Anti-Cheat</Text>
                    <Text style={[styles.splitValue, { color: theme.accent }]}>10%</Text>
                  </View>
                  <Text style={[styles.splitSub, { color: theme.textSecondary }]}>
                    Funds edge ML pose detection inference, GPS integrity verification, and payment gateway fees.
                  </Text>

                  <View style={[styles.splitRow, { marginTop: 14 }]}>
                    <Text style={[styles.splitLabel, { color: theme.textPrimary }]}>Creator Royalty</Text>
                    <Text style={[styles.splitValue, { color: '#a855f7' }]}>2%</Text>
                  </View>
                  <Text style={[styles.splitSub, { color: theme.textSecondary }]}>
                    Rewarded to the challenge organizer for curating an active, motivating habit group.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
          </SafeAreaView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  walletSheet: {
    width: '100%',
    height: '92%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { 
      marginHorizontal: 'auto', 
      maxWidth: 600, 
      maxHeight: '90%', 
      borderRadius: 24, 
      alignSelf: 'center',
      marginTop: 'auto',
      marginBottom: 'auto'
    } : {}),
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  tabBtnText: {
    fontSize: 14,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  verifiedTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 16,
    letterSpacing: -0.5,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  balanceActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  withdrawBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  depositBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  depositBtnText: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 14,
  },
  subBalancesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  subCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  subCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  subCardValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginTop: 4,
  },
  securityNoticeTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  securityNoticeBody: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  actionViewCard: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  actionViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sheetActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  actionSheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sheetSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 6,
  },
  methodTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  methodBadge: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  sheetInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  presetChipActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionCardBtns: {
    marginTop: 20,
    gap: 10,
  },
  sheetConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  sheetConfirmBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  sheetCancelBtn: {
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  feedbackBanner: {
    marginHorizontal: 16,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
  },
  feedbackText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  ledgerList: {
    gap: 10,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  txIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  txTime: {
    fontSize: 11,
    marginTop: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  rulesContainer: {
    gap: 16,
  },
  economicsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  econHeader: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  econDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  splitBreakdown: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  splitValue: {
    fontSize: 16,
    fontWeight: '900',
  },
  splitSub: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
});
