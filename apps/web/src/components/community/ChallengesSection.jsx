import React, { useState } from 'react';
import * as Icons from 'lucide-react';

const INITIAL_CHALLENGES = [
  {
    id: 'ch-squats-1',
    title: '100 Deep Squats Morning War',
    category: 'physical',
    description: 'Crush 30 squats every morning before 9:00 AM. Form is verified in real-time with pose geometry landmark tracking.',
    creator: 'Coach Dawit',
    creatorBadge: 'Trainer',
    participantsCount: 42,
    durationDays: 7,
    difficulty: 'Challenging',
    startDate: 'Active Now',
    endDate: 'In 5 days',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Maintain hips below parallel (<= 85° knee angle)',
      'No pauses greater than 4 seconds between repetitions',
      'Record session daily before 10:00 AM',
    ],
    dailyGoal: '30 camera-verified deep squats',
    currentDay: 2,
    streak: 2,
    isJoined: true,
    isCompleted: false,
    completedDays: [1, 2],
    coverColor: '#16a34a',
    mode: '1v1',
    verificationType: 'camera',
    verificationStrength: 'camera',
    isMonetary: true,
    entryFee: 100,
    currency: 'ETB',
    grossPool: 4200,
    prizePool: 3696,
  },
  {
    id: 'ch-screen-1',
    title: 'Zero Night Screen Sanctuary',
    category: 'digital_wellbeing',
    description: 'Lock away all social media & video streaming apps after 10:30 PM. Synchronized via background device wellbeing service.',
    creator: 'Nura Health AI',
    creatorBadge: 'Official',
    participantsCount: 88,
    durationDays: 14,
    difficulty: 'Moderate',
    startDate: 'Active Now',
    endDate: 'In 12 days',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Zero unlocks of restricted apps between 10:30 PM and 6:30 AM',
      'Phone placed in sleep mode',
    ],
    dailyGoal: '0 minutes restricted screen time past 10:30 PM',
    currentDay: 1,
    streak: 1,
    isJoined: false,
    isCompleted: false,
    completedDays: [],
    coverColor: '#0284c7',
    mode: 'group',
    verificationType: 'device',
    verificationStrength: 'device',
    isMonetary: false,
    entryFee: 0,
    currency: 'ETB',
    grossPool: 0,
    prizePool: 0,
  },
  {
    id: 'ch-hydro-1',
    title: '3-Liter Daily Hydration Ladder',
    category: 'hydration',
    description: 'Hit 3 liters of verified water intake daily. Maintain kidney health and high cellular energy levels.',
    creator: 'Dr. Bethlehem',
    creatorBadge: 'Physician',
    participantsCount: 65,
    durationDays: 10,
    difficulty: 'Easy',
    startDate: 'Active Now',
    endDate: 'In 8 days',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Log each 500ml glass with verified time-stamped proof',
      'First 500ml consumed within 30 minutes of waking',
    ],
    dailyGoal: '3,000 ml pure water logged',
    currentDay: 3,
    streak: 3,
    isJoined: true,
    isCompleted: false,
    completedDays: [1, 2, 3],
    coverColor: '#38bdf8',
    mode: 'ladder',
    verificationType: 'evidence',
    verificationStrength: 'evidence',
    isMonetary: true,
    entryFee: 50,
    currency: 'ETB',
    grossPool: 3250,
    prizePool: 2860,
  },
  {
    id: 'ch-gym-1',
    title: 'Addis Sunrise 5km Run',
    category: 'physical',
    description: 'Morning 5km outdoor jog verified with anti-spoof speed validation and GPS geofence tracking.',
    creator: 'Addis Athletics Network',
    creatorBadge: 'Organizer',
    participantsCount: 39,
    durationDays: 14,
    difficulty: 'Moderate',
    startDate: 'Active Now',
    endDate: 'In 11 days',
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80',
    rules: [
      'Average pace between 4:30 and 8:30 min/km',
      'GPS route telemetry must be continuous',
    ],
    dailyGoal: '5.0 km verified run',
    currentDay: 4,
    streak: 4,
    isJoined: false,
    isCompleted: false,
    completedDays: [],
    coverColor: '#16a34a',
    mode: 'streak_battle',
    verificationType: 'location',
    verificationStrength: 'location',
    isMonetary: true,
    entryFee: 100,
    currency: 'ETB',
    grossPool: 3900,
    prizePool: 3432,
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Icons.Sparkles },
  { id: 'physical', label: 'Physical', icon: Icons.Flame },
  { id: 'sleep', label: 'Sleep', icon: Icons.Moon },
  { id: 'digital_wellbeing', label: 'Screen Time', icon: Icons.Smartphone },
  { id: 'hydration', label: 'Hydration', icon: Icons.Droplets },
  { id: 'social', label: 'Social & Athletics', icon: Icons.Users },
];

export default function ChallengesSection() {
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stakeFilter, setStakeFilter] = useState('all');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');

  // Modal States
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNuraAiModal, setShowNuraAiModal] = useState(false);

  // Nura AI Challenge Architect State
  const [nuraPrompt, setNuraPrompt] = useState('');
  const [isNuraGenerating, setIsNuraGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 'msg-0', sender: 'nura', text: "Hi! I'm Nura, your AI Architect. What kind of habit or challenge would you like to build today? I'll set up the anti-cheat sensors and pool rules automatically." }
  ]);
  const chatScrollRef = useRef(null);
  const nuraTimeoutRef = useRef(null);

  useEffect(() => { return () => { if (nuraTimeoutRef.current) clearTimeout(nuraTimeoutRef.current); } }, []);
  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [chatMessages, isNuraGenerating]);
  const [generatedChallenge, setGeneratedChallenge] = useState(null);

  // Wallet State & Tabs
  const [walletTab, setWalletTab] = useState('balance'); // 'balance' | 'deposit' | 'withdraw' | 'transactions'
  const [wallet, setWallet] = useState({
    withdrawableBalance: 420.0,
    challengeWinnings: 350.0,
    creatorRewards: 70.0,
    pendingRewards: 100.0,
    nuraPoints: 850,
    xp: 1240,
    currency: 'ETB',
  });
  const [depositAmount, setDepositAmount] = useState('100');
  const [depositMethod, setDepositMethod] = useState('telebirr'); // 'telebirr' | 'cbe'
  const [depositPhone, setDepositPhone] = useState('0911234567');
  const [withdrawAmount, setWithdrawAmount] = useState('200');
  const [withdrawMethod, setWithdrawMethod] = useState('telebirr');
  const [withdrawAccount, setWithdrawAccount] = useState('0911234567');
  const [transactions, setTransactions] = useState([
    { id: 'tx-1', type: 'deposit', amount: 300, method: 'Telebirr', date: 'Yesterday', status: 'Completed' },
    { id: 'tx-2', type: 'payout', amount: 120, method: 'Squat War Prize Pool', date: '3 days ago', status: 'Completed' },
  ]);

  // Create Challenge Wizard State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('physical');
  const [newVerification, setNewVerification] = useState('camera');
  const [newIsMonetary, setNewIsMonetary] = useState(false);
  const [newEntryFee, setNewEntryFee] = useState('50');

  // Filter logic
  const filtered = challenges.filter((c) => {
    if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
    if (stakeFilter === 'free' && c.isMonetary) return false;
    if (stakeFilter === 'staked' && !c.isMonetary) return false;
    return true;
  });

  const handleToggleJoin = (ch) => {
    if (ch.isMonetary && !ch.isJoined) {
      const confirmJoin = window.confirm(
        `Join Staked Challenge: "${ch.title}"?\n\nEntry Fee: ${ch.entryFee} ETB\nGross Pool: ${ch.grossPool + ch.entryFee} ETB\nFinisher Prize Pool (88%): ${Math.round((ch.grossPool + ch.entryFee) * 0.88)} ETB\n\nStakes are locked in anti-cheat escrow and distributed among verified finishers. Authorize stake?`
      );
      if (!confirmJoin) return;
    }

    setChallenges((prev) =>
      prev.map((item) => {
        if (item.id === ch.id) {
          const nextJoined = !item.isJoined;
          return {
            ...item,
            isJoined: nextJoined,
            participantsCount: nextJoined ? item.participantsCount + 1 : item.participantsCount - 1,
            grossPool: item.isMonetary
              ? nextJoined
                ? item.grossPool + item.entryFee
                : item.grossPool - item.entryFee
              : 0,
            prizePool: item.isMonetary
              ? nextJoined
                ? Math.round((item.grossPool + item.entryFee) * 0.88)
                : Math.round((item.grossPool - item.entryFee) * 0.88)
              : 0,
          };
        }
        return item;
      })
    );

    if (selectedChallenge && selectedChallenge.id === ch.id) {
      setSelectedChallenge((prev) => ({
        ...prev,
        isJoined: !prev.isJoined,
        participantsCount: !prev.isJoined ? prev.participantsCount + 1 : prev.participantsCount - 1,
      }));
    }
  };

  // AI Architect Generation
  const handleGenerateWithNura = (customPrompt = '') => {
    const text = (customPrompt || nuraPrompt).toLowerCase().trim();
    setIsNuraGenerating(true);

    setTimeout(() => {
      let title = '100 Deep Squats Morning War';
      let category = 'physical';
      let verificationType = 'camera';
      let isMonetary = true;
      let entryFee = 100;
      let description = 'Camera-verified morning squat challenge with real-time pose estimation anti-cheat.';
      let imageUrl = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80';

      if (text.includes('step') || text.includes('walk') || text.includes('10k') || text.includes('10,000')) {
        title = '10,000 Daily Steps Marathon';
        category = 'physical';
        verificationType = 'device';
        isMonetary = false;
        entryFee = 0;
        description = 'Daily step goal verified directly through pedometer sensor data with anti-tamper telemetry.';
        imageUrl = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80';
      } else if (text.includes('water') || text.includes('hydration') || text.includes('drink') || text.includes('3l')) {
        title = '3L Pure Hydration Habit';
        category = 'hydration';
        verificationType = 'evidence';
        isMonetary = true;
        entryFee = 50;
        description = 'Logged 3-liter hydration milestones with time-stamped proof and community accountability.';
        imageUrl = 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80';
      } else if (text.includes('sleep') || text.includes('bed') || text.includes('screen') || text.includes('detox')) {
        title = 'Digital Wellbeing Detox 2h';
        category = 'digital_wellbeing';
        verificationType = 'device';
        isMonetary = false;
        entryFee = 0;
        description = 'Limit non-work screen time under 2 hours daily with verifiable OS focus mode metrics.';
        imageUrl = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80';
      } else if (text.includes('run') || text.includes('5k') || text.includes('jog')) {
        title = 'Daily 5km Sunrise Run';
        category = 'physical';
        verificationType = 'location';
        isMonetary = true;
        entryFee = 100;
        description = 'GPS geofenced 5km outdoor running route verified with anti-spoof speed validation.';
        imageUrl = 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80';
      } else if (text.length > 0) {
        title = (customPrompt || nuraPrompt).trim();
        description = 'Verifiable habit challenge created with Nura AI. Verifies daily consistency with anti-cheat protection.';
      }

      const created = {
        id: 'ch_ai_' + Date.now(),
        title,
        description,
        category,
        verificationType,
        verificationStrength: verificationType,
        mode: 'streak_battle',
        durationDays: 14,
        difficulty: 'Moderate',
        startDate: 'Active Now',
        endDate: 'In 14 days',
        rules: ['Complete daily requirement with verification proof', 'Anti-cheat checks must pass daily'],
        dailyGoal: title,
        currentDay: 1,
        completedDays: [1],
        participantsCount: 1,
        creator: 'You',
        isJoined: true,
        isCompleted: false,
        streak: 1,
        coverColor: '#16a34a',
        isMonetary,
        entryFee,
        prizePool: isMonetary ? Math.round(entryFee * 10 * 0.88) : 0,
        grossPool: isMonetary ? entryFee * 10 : 0,
        currency: 'ETB',
        imageUrl,
      };

      setGeneratedChallenge(created);
      setIsNuraGenerating(false);
    }, 350);
  };

  const handleLaunchGenerated = () => {
    if (!generatedChallenge) return;
    setChallenges([generatedChallenge, ...challenges]);
    setShowNuraAiModal(false);
    setGeneratedChallenge(null);
    setNuraPrompt('');
    alert(`Challenge "${generatedChallenge.title}" successfully launched and active!`);
  };

  // Wallet Handlers
  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }
    const newBal = wallet.withdrawableBalance + amt;
    setWallet((prev) => ({ ...prev, withdrawableBalance: newBal }));
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        type: 'deposit',
        amount: amt,
        method: depositMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr',
        date: 'Just now',
        status: 'Completed',
      },
      ...prev,
    ]);
    alert(`Successfully deposited ${amt} ETB via ${depositMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'}. New balance: ${newBal.toFixed(2)} ETB.`);
    setWalletTab('balance');
  };

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }
    if (amt > wallet.withdrawableBalance) {
      alert(`Insufficient funds. Your withdrawable balance is ${wallet.withdrawableBalance.toFixed(2)} ETB.`);
      return;
    }
    const newBal = wallet.withdrawableBalance - amt;
    setWallet((prev) => ({ ...prev, withdrawableBalance: newBal }));
    setTransactions((prev) => [
      {
        id: 'tx-' + Date.now(),
        type: 'withdrawal',
        amount: amt,
        method: withdrawMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr',
        date: 'Just now',
        status: 'Completed',
      },
      ...prev,
    ]);
    alert(`Successfully withdrew ${amt} ETB to ${withdrawAccount} via ${withdrawMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'}.`);
    setWalletTab('balance');
  };

  // Manual Create Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const fee = newIsMonetary ? parseFloat(newEntryFee) || 50 : 0;
    const gross = fee * 1;
    const prize = Math.round(gross * 0.88);

    const created = {
      id: 'ch_' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Verifiable habit challenge.',
      creator: 'You',
      creatorBadge: 'Host',
      participantsCount: 1,
      durationDays: 7,
      difficulty: 'Moderate',
      startDate: 'Active Now',
      endDate: 'In 7 days',
      rules: ['Follow real-time verification rules', 'Maintain consistent daily log'],
      dailyGoal: 'Daily verified session',
      currentDay: 1,
      streak: 1,
      isJoined: true,
      isCompleted: false,
      completedDays: [1],
      coverColor: '#16a34a',
      mode: 'group',
      verificationType: newVerification,
      verificationStrength: newVerification,
      isMonetary: newIsMonetary,
      entryFee: fee,
      currency: 'ETB',
      grossPool: gross,
      prizePool: prize,
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    };

    setChallenges([created, ...challenges]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
    alert('Challenge successfully created and published!');
  };

  const renderBadge = (strength) => {
    switch (strength) {
      case 'camera':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
            <Icons.Camera size={12} /> Camera Verified
          </span>
        );
      case 'device':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(2, 132, 199, 0.15)', color: '#0284c7', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
            <Icons.Smartphone size={12} /> Device Verified
          </span>
        );
      case 'location':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(147, 51, 234, 0.15)', color: '#9333ea', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
            <Icons.MapPin size={12} /> Location GPS
          </span>
        );
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(100, 116, 139, 0.15)', color: '#64748b', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
            <Icons.ShieldCheck size={12} /> Certified Proof
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Action & Verified Challenges</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Transform wellness goals into measurable competitions with anti-cheat protection.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Wallet Balance Pill */}
          <button
            onClick={() => {
              setWalletTab('balance');
              setShowWalletModal(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--white)',
              border: '1px solid var(--border)',
              padding: '8px 14px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <Icons.Wallet size={16} color="var(--green)" />
            <span>{wallet.withdrawableBalance.toFixed(0)} ETB</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {wallet.nuraPoints} pts</span>
          </button>

          {/* Create Button */}
        </div>
      </div>

      {/* "Create with Nura AI" Banner */}
      <div
        onClick={() => {
          setShowCreateModal(true);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(34, 197, 94, 0.06) 100%)',
          border: '1px solid rgba(22, 163, 74, 0.3)',
          borderRadius: 16,
          padding: '16px 20px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: 'rgba(22, 163, 74, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.Sparkles size={22} color="var(--green)" />
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 800 }}>Create with Nura AI Architect</h4>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
              Type any goal or habit. Nura automatically configures telemetry, anti-cheat verifications, and prize pools.
            </p>
          </div>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--green)',
            color: '#fff',
            border: 'none',
            padding: '10px 16px',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          <Icons.Wand2 size={15} /> Create with Nura <Icons.ArrowRight size={14} />
        </button>
      </div>

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                borderRadius: 12,
                border: isSelected ? '1px solid var(--green)' : '1px solid var(--border)',
                background: isSelected ? 'rgba(22, 163, 74, 0.12)' : 'var(--white)',
                color: isSelected ? 'var(--green)' : 'var(--text-muted)',
                fontWeight: isSelected ? 800 : 600,
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} /> {cat.label}
            </button>
          );
        })}
      </div>

      {/* Free vs Staked Toggle Filter */}
      <div style={{ display: 'flex', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content', gap: 6 }}>
        {['all', 'free', 'staked'].map((st) => (
          <button
            key={st}
            onClick={() => setStakeFilter(st)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: 'none',
              background: stakeFilter === st ? 'var(--green)' : 'transparent',
              color: stakeFilter === st ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {st === 'all' ? 'All Formats' : st === 'free' ? 'Free (XP & Badges)' : 'Staked (ETB Prize Pool)'}
          </button>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 2-COLUMN SIDE-BY-SIDE CHALLENGES GRID WITH PICTURES       */}
      {/* ======================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((ch) => (
          <div
            key={ch.id}
            onClick={() => setSelectedChallenge(ch)}
            style={{
              background: 'var(--white)',
              border: '1px solid var(--border)',
              borderRadius: 18,
              overflow: 'hidden',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {/* Picture Hero Header */}
            <div style={{ position: 'relative', height: 136, width: '100%', background: '#0f172a' }}>
              <img
                src={ch.imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80'}
                alt={ch.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)',
                }}
              />
              {/* Badges on top of Image */}
              <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: 'rgba(0,0,0,0.65)', color: '#ffffff', padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                  {renderBadge(ch.verificationStrength)}
                </span>
                {ch.isMonetary ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#16a34a', color: '#ffffff', padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                    <Icons.Trophy size={11} /> {ch.prizePool.toLocaleString()} ETB
                  </span>
                ) : (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff', padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                    Free Challenge
                  </span>
                )}
              </div>

              {/* Title & Category over image footer */}
              <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: '#4ade80', fontWeight: 800 }}>
                  {ch.category.replace('_', ' ')}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', margin: '2px 0 0 0', textShadow: '0 1px 3px rgba(0,0,0,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ch.title}
                </h3>
              </div>
            </div>

            {/* Card Content Body */}
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ch.description}
              </p>

              {/* Meta stats */}
              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icons.Users size={12} color="var(--green)" /> {ch.participantsCount}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icons.Clock size={12} /> {ch.durationDays}d
                </span>
                {ch.isJoined && ch.streak > 0 && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ea580c', fontWeight: 700 }}>
                    <Icons.Flame size={12} /> {ch.streak}d streak
                  </span>
                )}
              </div>

              {/* Action Button Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>By {ch.creator}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleJoin(ch);
                  }}
                  style={{
                    background: ch.isJoined ? 'rgba(22, 163, 74, 0.12)' : 'var(--green)',
                    color: ch.isJoined ? 'var(--green)' : '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {ch.isJoined ? 'Joined ✓' : ch.isMonetary ? `Stake ${ch.entryFee} ETB` : 'Join Challenge'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* NURA AI CHALLENGE ARCHITECT MODAL                        */}
      {/* ======================================================== */}
      {showNuraAiModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(22, 163, 74, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Sparkles size={20} color="var(--green)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Nura AI Challenge Architect</h3>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Automated anti-cheat habit synthesizer</div>
                </div>
              </div>
              <button
                onClick={() => setShowNuraAiModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              {/* Chat Bubble Nura */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Sparkles size={18} color="#fff" />
                </div>
                <div style={{ flex: 1, background: 'var(--bg)', padding: 14, borderRadius: 18, borderTopLeftRadius: 4 }}>
                  <div style={{ color: 'var(--text)', fontSize: 14, lineHeight: '1.5' }}>
                    Hi! I'm Nura, your AI Architect. What kind of habit or challenge would you like to build today? I'll set up the anti-cheat sensors and pool rules automatically.
                  </div>
                </div>
              </div>

              {/* Chat Bubble User (Input) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ background: 'var(--green)', padding: 12, borderRadius: 18, borderTopRightRadius: 4, width: '85%' }}>
                  <textarea
                    placeholder="e.g. 50 push-ups daily, 3L water, or 10,000 steps"
                    value={nuraPrompt}
                    onChange={(e) => setNuraPrompt(e.target.value)}
                    style={{ width: '100%', minHeight: 40, border: 'none', background: 'transparent', color: '#fff', fontSize: 14, outline: 'none', resize: 'none' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      onClick={() => handleGenerateWithNura()}
                      disabled={isNuraGenerating}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {isNuraGenerating ? 'Analyzing...' : 'Send to Nura'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Inspiration Chips */}
            {!generatedChallenge && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18, paddingLeft: 12 }}>
                {[
                  '100 Deep Squats',
                  '10,000 Daily Steps',
                  '3L Pure Hydration',
                  'Zero Screen Night',
                  'Daily 5km Run',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setNuraPrompt(chip);
                      handleGenerateWithNura(chip);
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 16,
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Live Generated Preview Card */}
            {generatedChallenge && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Sparkles size={18} color="#fff" />
                </div>
                <div style={{ flex: 1, background: 'var(--bg)', padding: 14, borderRadius: 18, borderTopLeftRadius: 4 }}>
                  <div style={{ color: 'var(--text)', fontSize: 14, lineHeight: '1.5', marginBottom: 12 }}>
                    I've architected a verifiable blueprint for you! Take a look below.
                  </div>
                  <div
                    style={{
                      border: '1px solid rgba(22, 163, 74, 0.3)',
                      background: 'rgba(22, 163, 74, 0.04)',
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10 }}>
                  <img
                    src={generatedChallenge.imageUrl}
                    alt={generatedChallenge.title}
                    style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 800, textTransform: 'uppercase' }}>
                      Blueprint Ready • {renderBadge(generatedChallenge.verificationStrength)}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2 }}>{generatedChallenge.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {generatedChallenge.durationDays} days • {generatedChallenge.isMonetary ? `${generatedChallenge.entryFee} ETB Stake` : 'Free Challenge'}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {generatedChallenge.description}
                </p>
              </div>
            </div>
          </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setShowNuraAiModal(false)}
                style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--white)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleLaunchGenerated}
                disabled={!generatedChallenge}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: 'none',
                  background: generatedChallenge ? 'var(--green)' : '#94a3b8',
                  color: '#ffffff',
                  fontWeight: 800,
                  cursor: generatedChallenge ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Icons.Rocket size={15} /> Launch Challenge Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* COMPLETE FUNCTIONAL WALLET & REWARDS MODAL (DEPOSIT/WITHDRAW) */}
      {/* ======================================================== */}
      {showWalletModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 520,
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Wallet size={20} color="var(--green)" />
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Wallet & Stakes Escrow</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            {/* Sub Tabs */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg)', padding: 4, borderRadius: 12, marginBottom: 18 }}>
              {[
                { id: 'balance', label: 'My Wallet', icon: Icons.CreditCard },
                { id: 'deposit', label: 'Deposit', icon: Icons.ArrowDownCircle },
                { id: 'withdraw', label: 'Withdraw', icon: Icons.ArrowUpCircle },
                { id: 'transactions', label: 'History', icon: Icons.History },
              ].map((t) => {
                const TabIcon = t.icon;
                const isActive = walletTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setWalletTab(t.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 0',
                      borderRadius: 8,
                      border: 'none',
                      background: isActive ? 'var(--green)' : 'transparent',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <TabIcon size={14} /> {t.label}
                  </button>
                );
              })}
            </div>

            {/* TAB 1: BALANCE OVERVIEW */}
            {walletTab === 'balance' && (
              <div>
                <div
                  style={{
                    background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                    color: '#ffffff',
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.9 }}>Available Withdrawable Balance</div>
                  <div style={{ fontSize: 32, fontWeight: 900, margin: '8px 0' }}>
                    {wallet.withdrawableBalance.toFixed(2)} <span style={{ fontSize: 16 }}>{wallet.currency}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button
                      onClick={() => setWalletTab('deposit')}
                      style={{
                        flex: 1,
                        background: '#ffffff',
                        color: '#0f172a',
                        border: 'none',
                        padding: '10px 0',
                        borderRadius: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <Icons.Plus size={15} /> Deposit Funds
                    </button>
                    <button
                      onClick={() => setWalletTab('withdraw')}
                      style={{
                        flex: 1,
                        background: 'rgba(255, 255, 255, 0.25)',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 0',
                        borderRadius: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        fontSize: 13,
                      }}
                    >
                      <Icons.ArrowUpCircle size={15} /> Withdraw Winnings
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Challenge Winnings</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{wallet.challengeWinnings} ETB</div>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Nura Points & XP</div>
                    <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{wallet.nuraPoints} pts • {wallet.xp} XP</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  <strong>Escrow Security:</strong> All challenge stakes are held in transparent smart escrow. Payouts (88%) release automatically to verified finishers.
                </div>
              </div>
            )}

            {/* TAB 2: DEPOSIT */}
            {walletTab === 'deposit' && (
              <form onSubmit={handleDepositSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Deposit Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('telebirr')}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: depositMethod === 'telebirr' ? '2px solid var(--green)' : '1px solid var(--border)',
                        background: depositMethod === 'telebirr' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Telebirr
                    </button>
                    <button
                      type="button"
                      onClick={() => setDepositMethod('cbe')}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: depositMethod === 'cbe' ? '2px solid var(--green)' : '1px solid var(--border)',
                        background: depositMethod === 'cbe' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      CBE Birr
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Phone / Account Number</label>
                  <input
                    type="text"
                    value={depositPhone}
                    onChange={(e) => setDepositPhone(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Deposit Amount (ETB)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4 }}
                  />
                </div>

                {/* Amount Quick Presets */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {['50', '100', '250', '500', '1000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDepositAmount(preset)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      +{preset}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  style={{
                    background: 'var(--green)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  Confirm Deposit ({depositAmount} ETB)
                </button>
              </form>
            )}

            {/* TAB 3: WITHDRAW */}
            {walletTab === 'withdraw' && (
              <form onSubmit={handleWithdrawSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Withdrawal Destination</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('telebirr')}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: withdrawMethod === 'telebirr' ? '2px solid var(--green)' : '1px solid var(--border)',
                        background: withdrawMethod === 'telebirr' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Telebirr
                    </button>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('cbe')}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: withdrawMethod === 'cbe' ? '2px solid var(--green)' : '1px solid var(--border)',
                        background: withdrawMethod === 'cbe' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg)',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      CBE Birr
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700 }}>Account / Phone Number</label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4 }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: 12, fontWeight: 700 }}>Withdraw Amount (ETB)</label>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max: {wallet.withdrawableBalance.toFixed(2)} ETB</span>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4 }}
                  />
                </div>

                {/* Percentage Chips */}
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0.25, 0.5, 0.75, 1.0].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setWithdrawAmount((wallet.withdrawableBalance * pct).toFixed(0))}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  Withdraw to {withdrawMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'}
                </button>
              </form>
            )}

            {/* TAB 4: TRANSACTIONS */}
            {walletTab === 'transactions' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg)',
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{tx.method}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.date} • {tx.status}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: tx.type === 'deposit' ? 'var(--green)' : '#0284c7', fontSize: 14 }}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount} ETB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CREATE CHALLENGE MODAL (WITH PROMINENT VISIBLE BUTTONS)  */}
      {/* ======================================================== */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <form
            onSubmit={handleCreateSubmit}
            style={{
              background: 'var(--white)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 500,
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Create New Challenge</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Challenge Title</label>
              <input
                type="text"
                placeholder="e.g. 50 Push-ups Daily"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4, fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4, fontSize: 13 }}
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700 }}>Anti-Cheat Verification Engine</label>
              <select
                value={newVerification}
                onChange={(e) => setNewVerification(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4, fontSize: 13 }}
              >
                <option value="camera">Camera Verified (Pose Detection AI)</option>
                <option value="device">Device Verified (Pedometer / Screen Time)</option>
                <option value="location">Location GPS (Gym Route Geofence)</option>
                <option value="evidence">Evidence Proof (Time-stamped photo / log)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <input
                type="checkbox"
                id="isMonetaryCheck"
                checked={newIsMonetary}
                onChange={(e) => setNewIsMonetary(e.target.checked)}
              />
              <label htmlFor="isMonetaryCheck" style={{ fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Stake Financial Entry (ETB Prize Pool)
              </label>
            </div>

            {newIsMonetary && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 700 }}>Entry Stake (ETB)</label>
                <input
                  type="number"
                  value={newEntryFee}
                  onChange={(e) => setNewEntryFee(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', marginTop: 4, fontSize: 13 }}
                />
              </div>
            )}

            {/* HIGH VISIBILITY SUBMIT AND NEXT BUTTON */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--white)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 0',
                    borderRadius: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontSize: 14,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                  }}
                >
                  Launch & Publish Challenge
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setTimeout(() => setShowNuraAiModal(true), 150);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(22, 163, 74, 0.1)',
                  color: 'var(--green)',
                  border: 'none',
                  padding: '12px 0',
                  borderRadius: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                <Icons.Sparkles size={16} /> Create with Nura AI Chat
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CHALLENGE DETAILS MODAL */}
      {selectedChallenge && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              background: 'var(--white)',
              borderRadius: 20,
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {renderBadge(selectedChallenge.verificationStrength)}
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• {selectedChallenge.durationDays} Days</span>
              </div>
              <button
                onClick={() => setSelectedChallenge(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div style={{ width: '100%', height: 180, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              <img
                src={selectedChallenge.imageUrl}
                alt={selectedChallenge.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 8px 0' }}>{selectedChallenge.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              {selectedChallenge.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created by {selectedChallenge.creator}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{selectedChallenge.participantsCount} active participants</div>
              </div>

              <button
                onClick={() => handleToggleJoin(selectedChallenge)}
                style={{
                  background: selectedChallenge.isJoined ? 'rgba(22, 163, 74, 0.12)' : 'var(--green)',
                  color: selectedChallenge.isJoined ? 'var(--green)' : '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                {selectedChallenge.isJoined ? 'Joined ✓' : selectedChallenge.isMonetary ? `Stake ${selectedChallenge.entryFee} ETB` : 'Join Challenge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
