import React, { useState, useRef, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCommunityRealtime } from '@/hooks/useCommunityRealtime';

const INITIAL_POSTS = [
  {
    id: 'post-video-1',
    type: 'video_demo',
    author: 'Coach Dawit (Athletic Specialist)',
    authorBadge: 'Trainer',
    avatarColor: '#ea580c',
    timeAgo: '45m ago',
    title: '🏋️‍♂️ Squat Depth & Core Bracing Tutorial (Video)',
    content: 'Quick 45-second demonstration on maintaining neutral spine and glute activation out of the bottom position. Notice the foot torque against the floor before descending.',
    videoUrl: 'https://example.com/squat-demo.mp4',
    videoPoster: '/hero.png',
    videoDuration: '▶ 0:45',
    likes: 68,
    comments: 19,
    userLiked: true,
  },
  {
    id: 'post-photo-1',
    type: 'post',
    author: 'Selamawit B.',
    avatarColor: '#16a34a',
    timeAgo: '1h ago',
    title: '🥗 Post-Gym Habesha Recovery Fuel',
    content: 'Just smashed leg day! Refueling with high-protein Shiro, steamed Gomen, roasted chickpeas, and a cold Telba flaxseed shake. 34g plant protein.',
    imageUrl: '/natural remidies.jfif',
    likes: 84,
    comments: 12,
    userLiked: false,
  },
  {
    id: 'post-video-2',
    type: 'video_demo',
    author: 'Nutritionist Bethlehem',
    authorBadge: 'Dietitian',
    avatarColor: '#8b5cf6',
    timeAgo: '3h ago',
    title: '🥣 High-Protein Beso Smoothie Prep (Video)',
    content: 'How to make a 32g protein pre-workout Beso shake with roasted barley, plant milk, flaxseed, and cinnamon. Takes under 2 minutes.',
    videoUrl: 'https://example.com/beso-recipe.mp4',
    videoPoster: '/healthy life style.jfif',
    videoDuration: '▶ 1:15',
    likes: 114,
    comments: 28,
    userLiked: true,
  },
  {
    id: 'post-1',
    type: 'post',
    author: 'Sarah M.',
    avatarColor: '#ec4899',
    timeAgo: '4h ago',
    content: '🔥 Finished my 7-day hydration challenge!\n\nMaintained 92% hydration consistency this week. Energy levels have visibly normalized during morning routines.',
    imageUrl: '/healthy life style.jfif',
    likes: 36,
    comments: 9,
    userLiked: false,
  },
  {
    id: 'post-2',
    type: 'challenge',
    author: 'NuraCare Health Team',
    authorBadge: 'Official',
    avatarColor: '#16a34a',
    timeAgo: '6h ago',
    title: '7-Day Hydration Challenge',
    content: 'Reach your daily water target 7 days in a row. Sync with your local wellness group and earn the Hydrated Pioneer badge.',
    likes: 58,
    comments: 14,
    userLiked: true,
    challengeData: {
      participants: 312,
      progressPercent: 80,
      joined: false,
    },
  },
  {
    id: 'post-3',
    type: 'story',
    author: 'Dr. Yared (Wellness Contributor)',
    authorBadge: 'Nutritionist',
    avatarColor: '#8b5cf6',
    timeAgo: '1d ago',
    title: 'Ethiopian Wellness Tip 🇪🇹',
    content: 'How traditional Teff-based meals can fit seamlessly into a balanced nutrition and glycemic control routine. Teff contains resistant starch that supports a diverse microbiome.',
    imageUrl: '/ashwaganda.jfif',
    likes: 92,
    comments: 21,
    userLiked: false,
    storyLinkText: 'Read Full Cultural Nutrition Guide',
  },
  {
    id: 'post-4',
    type: 'announcement',
    author: 'NuraCare Community',
    authorBadge: 'Verified',
    avatarColor: '#0284c7',
    timeAgo: '1d ago',
    title: 'Community Wellness Challenge',
    content: 'New community challenge starting this Monday: "Morning Eskesta & Walk (10,000 steps)". Join your regional group to participate.',
    likes: 41,
    comments: 5,
    userLiked: false,
  },
];

const INITIAL_GROUPS = [
  {
    id: 'grp-1',
    name: 'Running Ethiopia 🇪🇹',
    category: 'Cardio & Athletics',
    icon: '🏃',
    membersCount: '12.4K',
    description: 'For Ethiopian runners sharing routes, morning distance goals, motivation, and regional half-marathons.',
    privacy: 'Public',
    joined: true,
  },
  {
    id: 'grp-2',
    name: 'Addis Fitness 👟',
    category: 'Workouts & Gyms',
    icon: '👟',
    membersCount: '8.2K',
    description: 'Active gym-goers and fitness enthusiasts discussing workout splits, local training centers, and recovery.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-3',
    name: 'Healthy Ethiopian Cooking 🥗',
    category: 'Nutrition & Tsom',
    icon: '🥗',
    membersCount: '15.1K',
    description: 'Sharing healthy recipes: high-protein Shiro, low-oil Misir, Telba smoothies, and nutritious fasting meals.',
    privacy: 'Public',
    joined: true,
  },
  {
    id: 'grp-4',
    name: 'Mindfulness & Stress 🧘',
    category: 'Mental Wellness',
    icon: '🧘',
    membersCount: '6.3K',
    description: 'Daily breathwork reflections, meditation tips, stress resilience techniques, and mindful living.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-5',
    name: 'Hydration Challenge 💧',
    category: 'Habit Building',
    icon: '💧',
    membersCount: '9.8K',
    description: 'Accountability group for maintaining optimal daily hydration and sharing water tracking milestones.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-6',
    name: 'Muscle Building 💪',
    category: 'Strength Training',
    icon: '💪',
    membersCount: '4.5K',
    description: 'Hypertrophy principles, bodyweight calisthenics, and plant-based protein pairing during fasting.',
    privacy: 'Public',
    joined: false,
  },
  {
    id: 'grp-7',
    name: 'Healthy Lifestyle 🌿',
    category: 'General Wellness',
    icon: '🌿',
    membersCount: '11.0K',
    description: 'Holistic wellness tips, restorative sleep routines, and sustainable lifestyle habit changes.',
    privacy: 'Public',
    joined: false,
  },
];

const INITIAL_THREADS = [
  {
    id: 'thread-1',
    senderName: 'Hana T.',
    avatarText: 'HT',
    avatarBg: '#0284c7',
    lastMessage: 'See you at the morning walk tomorrow at Entoto!',
    timeAgo: '2m',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'them', text: 'Hey! Are you still participating in the 10k step challenge?', time: '9:40 AM' },
      { id: 'm2', sender: 'me', text: 'Yes, absolutely! Logged 6,000 steps so far today.', time: '9:42 AM' },
      { id: 'm3', sender: 'them', text: 'See you at the morning walk tomorrow at Entoto!', time: '9:45 AM' },
    ],
  },
  {
    id: 'thread-2',
    senderName: 'Abel K.',
    avatarText: 'AK',
    avatarBg: '#16a34a',
    lastMessage: 'Great job on the hydration challenge!',
    timeAgo: '15m',
    unreadCount: 0,
    messages: [
      { id: 'm20', sender: 'them', text: 'Saw your update on the feed!', time: 'Yesterday' },
      { id: 'm21', sender: 'them', text: 'Great job on the hydration challenge!', time: '10:00 AM' },
    ],
  },
  {
    id: 'thread-3',
    senderName: 'Running Ethiopia',
    avatarText: 'RE',
    avatarBg: '#f59e0b',
    lastMessage: 'New challenge announcement: Weekend 5K group run.',
    timeAgo: '1h',
    unreadCount: 2,
    messages: [
      { id: 'm30', sender: 'them', text: 'Moderator: Please review the route map for Saturday morning.', time: '8:00 AM' },
      { id: 'm31', sender: 'them', text: 'New challenge announcement: Weekend 5K group run.', time: '8:30 AM' },
    ],
  },
];

export default function CommunityPage({ profile }) {
  const { user } = useAuth();
  const { posts: realtimePosts, createPost: realtimeCreatePost, toggleLike: realtimeToggleLike } = useCommunityRealtime(user);

  // Top 3-Section Navigation: Feed | Groups | Messages
  const [activeSection, setActiveSection] = useState('feed');

  // Feed State
  const [localPosts, setLocalPosts] = useState(INITIAL_POSTS);

  const posts = useMemo(() => {
    if (!realtimePosts || realtimePosts.length === 0) return localPosts;
    const remoteMapped = realtimePosts.map(rp => ({
      id: rp.id,
      type: rp.mediaType === 'video' ? 'video_demo' : 'post',
      author: rp.authorName,
      authorBadge: 'Member',
      avatarColor: '#16a34a',
      timeAgo: 'Recently',
      title: rp.category ? `${rp.category} Reflection` : undefined,
      content: rp.content,
      imageUrl: rp.mediaType === 'image' ? rp.mediaUrl : undefined,
      videoUrl: rp.mediaType === 'video' ? rp.mediaUrl : undefined,
      videoPoster: rp.mediaType === 'video' ? '/hero.png' : undefined,
      videoDuration: rp.mediaType === 'video' ? '▶ Video' : undefined,
      likes: rp.likesCount,
      comments: rp.commentsCount,
      userLiked: rp.userLiked,
    }));
    return [...remoteMapped, ...localPosts];
  }, [realtimePosts, localPosts]);

  const [newPostText, setNewPostText] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [attachedMedia, setAttachedMedia] = useState(null); // { url, type: 'image'|'video', name, duration }
  const [showPostModal, setShowPostModal] = useState(false);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Groups State
  const [groups, setGroups] = useState(INITIAL_GROUPS);

  // Messages State
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThread, setActiveThread] = useState(INITIAL_THREADS[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Privacy Settings
  const [whoCanMessage, setWhoCanMessage] = useState('Group members');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleLike = (postId) => {
    realtimeToggleLike(postId);
    setLocalPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const liked = !p.userLiked;
          return {
            ...p,
            userLiked: liked,
            likes: liked ? p.likes + 1 : p.likes - 1,
          };
        }
        return p;
      })
    );
  };

  const toggleJoinChallenge = (postId) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.challengeData) {
          const isJoined = !p.challengeData.joined;
          return {
            ...p,
            challengeData: {
              ...p.challengeData,
              joined: isJoined,
              participants: isJoined
                ? p.challengeData.participants + 1
                : p.challengeData.participants - 1,
            },
          };
        }
        return p;
      })
    );
  };

  const toggleGroupJoin = (groupId) => {
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, joined: !g.joined } : g))
    );
  };

  const handleFileUpload = (e, mediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setAttachedMedia({
      url: objectUrl,
      type: mediaType,
      name: file.name,
      duration: mediaType === 'video' ? '▶ Video Clip' : null
    });
  };

  const handleCreatePost = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newPostText.trim() && !attachedMedia) return;
    const newPost = {
      id: 'post_' + Date.now(),
      type: attachedMedia?.type === 'video' ? 'video_demo' : 'post',
      author: profile?.name || 'You',
      avatarColor: '#16a34a',
      timeAgo: 'Just now',
      title: newPostTitle.trim() || undefined,
      content: newPostText.trim(),
      imageUrl: attachedMedia?.type === 'image' ? attachedMedia.url : undefined,
      videoUrl: attachedMedia?.type === 'video' ? attachedMedia.url : undefined,
      videoPoster: attachedMedia?.type === 'video' ? '/healthy life style.jfif' : undefined,
      videoDuration: attachedMedia?.type === 'video' ? '▶ Video' : undefined,
      likes: 0,
      comments: 0,
      userLiked: false,
    };
    realtimeCreatePost(
      newPostText.trim(),
      'General',
      attachedMedia ? { url: attachedMedia.url, type: attachedMedia.type } : null
    );
    setLocalPosts([newPost, ...localPosts]);
    setNewPostText('');
    setNewPostTitle('');
    setAttachedMedia(null);
    setShowPostModal(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeThread) return;
    const newMsg = {
      id: 'm_' + Date.now(),
      sender: 'me',
      text: chatMessage.trim(),
      time: 'Just now',
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        return {
          ...t,
          lastMessage: newMsg.text,
          timeAgo: 'Just now',
          messages: [...t.messages, newMsg],
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setActiveThread(prev => ({
      ...prev,
      lastMessage: newMsg.text,
      messages: [...prev.messages, newMsg],
    }));
    setChatMessage('');
  };

  const filteredThreads = threads.filter(
    t =>
      t.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page active" style={{ maxWidth: 1040, margin: '0 auto', paddingBottom: 60 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icons.Users size={28} color="var(--green)" /> Community Sanctuary
          </h1>
          <p className="page-subtitle">Connect, share wellness habits, gym routines, and join community challenges.</p>
        </div>
        <button
          className="btn-outline-sm"
          onClick={() => setShowPrivacyModal(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <Icons.ShieldCheck size={16} color="var(--green)" /> Privacy & Safety
        </button>
      </div>

      {/* COMMUNITY WELCOME HERO BANNER */}
      <div style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)',
        color: '#ffffff',
        boxShadow: '0 12px 36px rgba(6, 95, 70, 0.16)',
        display: 'flex',
        minHeight: 210
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/be healthy.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 25%',
          opacity: 0.38,
          mixBlendMode: 'luminosity',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(6, 95, 70, 0.95) 0%, rgba(4, 120, 87, 0.84) 50%, rgba(5, 150, 105, 0.45) 100%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '26px 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(10px)',
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 10
            }}>
              <Icons.Sparkles size={13} color="#86efac" />
              <span>NuraCare Health Circle</span>
            </div>

            <h2 style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: 'var(--font-head)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Welcome to the NuraCare Community 🌿
            </h2>

            <p style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 16px 0',
              maxWidth: 620,
              lineHeight: 1.5
            }}>
              Join over 41,000+ members sharing authentic health transformations, athletic gym workouts, cultural Ethiopian recipes, and mutual accountability.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              backdropFilter: 'blur(10px)',
              padding: '7px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.Users size={16} color="#4ade80" />
              <span>41.8K Members Active</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              backdropFilter: 'blur(10px)',
              padding: '7px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.ShieldCheck size={16} color="#60a5fa" />
              <span>100% Medical Privacy Safe</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              backdropFilter: 'blur(10px)',
              padding: '7px 14px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.Flame size={16} color="#fbbf24" />
              <span>128 Active Challenges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal 3-Section Top Segmented Navigation */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          marginBottom: 24,
          background: 'var(--surface)',
          borderRadius: 14,
          padding: 6,
          gap: 8,
        }}
      >
        <button
          onClick={() => setActiveSection('feed')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'feed' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'feed' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'feed' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.Rss size={18} /> Feed & Stories
        </button>

        <button
          onClick={() => setActiveSection('groups')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'groups' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'groups' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'groups' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.Users size={18} /> Wellness Groups ({groups.length})
        </button>

        <button
          onClick={() => setActiveSection('messages')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: 'none',
            background: activeSection === 'messages' ? 'var(--green-light)' : 'transparent',
            color: activeSection === 'messages' ? 'var(--green-dark)' : 'var(--text-muted)',
            fontWeight: activeSection === 'messages' ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icons.MessageSquare size={18} /> Messages
          {threads.reduce((a, b) => a + b.unreadCount, 0) > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 10,
                padding: '2px 7px',
              }}
            >
              {threads.reduce((a, b) => a + b.unreadCount, 0)}
            </span>
          )}
        </button>
      </div>

      {/* SECTION 1: FEED */}
      {activeSection === 'feed' && (
        <div>
          {/* Post Composer Card with Photo & Video Actions */}
          <div
            className="dash-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              marginBottom: 20,
              padding: '18px 20px',
            }}
          >
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
              onClick={() => setShowPostModal(true)}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  background: 'var(--green)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {profile?.name ? profile.name[0].toUpperCase() : 'U'}
              </div>
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 24,
                  padding: '10px 18px',
                  color: 'var(--text-muted)',
                  fontSize: 14,
                }}
              >
                Share a gym achievement, meal photo, workout video, or habit win...
              </div>
            </div>

            {/* Quick Action Buttons for Photo & Video */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Hidden File Inputs */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => { handleFileUpload(e, 'image'); setShowPostModal(true); }} 
                />
                <input 
                  type="file" 
                  ref={videoInputRef} 
                  accept="video/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => { handleFileUpload(e, 'video'); setShowPostModal(true); }} 
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(22, 163, 74, 0.08)',
                    border: '1px solid rgba(22, 163, 74, 0.2)',
                    color: '#15803d',
                    padding: '6px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icons.Image size={15} color="#16a34a" /> Add Photo
                </button>

                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(234, 88, 12, 0.08)',
                    border: '1px solid rgba(234, 88, 12, 0.2)',
                    color: '#c2410c',
                    padding: '6px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icons.Video size={15} color="#ea580c" /> Add Video
                </button>
              </div>

              <button 
                className="btn-primary" 
                onClick={() => setShowPostModal(true)} 
                style={{ padding: '8px 18px', fontSize: 13 }}
              >
                + Create Post
              </button>
            </div>
          </div>

          {/* Privacy Notice Banner */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 12,
              padding: '12px 18px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#166534',
            }}
          >
            <Icons.ShieldCheck size={18} color="#16a34a" />
            <span>
              <strong>Privacy Assurance:</strong> Medications, clinical diagnoses, and daily checkup ratings are permanently private and never shared to the community.
            </span>
          </div>

          {/* Posts Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {posts.map(post => (
              <div key={post.id} className="dash-card" style={{ padding: 22 }}>
                {/* Author row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: post.avatarColor,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {post.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 15 }}>{post.author}</strong>
                      {post.authorBadge && (
                        <span
                          style={{
                            background: 'var(--green-light)',
                            color: 'var(--green-dark)',
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 8,
                            fontWeight: 700,
                          }}
                        >
                          {post.authorBadge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{post.timeAgo}</span>
                  </div>
                </div>

                {/* Title if present */}
                {post.title && (
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 17, color: 'var(--text)' }}>
                    {post.title}
                  </h3>
                )}

                {/* Body Content */}
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-line', margin: '0 0 16px 0' }}>
                  {post.content}
                </p>

                {/* ATTACHED PHOTO RENDERING */}
                {post.imageUrl && (
                  <div style={{
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 16,
                    border: '1px solid var(--border)',
                    maxHeight: 380,
                    background: '#000'
                  }}>
                    <img 
                      src={post.imageUrl} 
                      alt="" 
                      style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }} 
                    />
                  </div>
                )}

                {/* ATTACHED VIDEO RENDERING */}
                {(post.videoUrl || post.type === 'video_demo') && (
                  <div style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    marginBottom: 16,
                    border: '1px solid var(--border)',
                    background: '#0f172a',
                    maxHeight: 380
                  }}>
                    {post.videoPoster ? (
                      <div 
                        style={{ position: 'relative', cursor: 'pointer' }}
                        onClick={() => alert('▶ Playing video demonstration: ' + (post.title || 'Workout Tutorial'))}
                      >
                        <img 
                          src={post.videoPoster} 
                          alt="Video Demonstration" 
                          style={{ width: '100%', height: 260, objectFit: 'cover', opacity: 0.85, display: 'block' }} 
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0, 0, 0, 0.28)'
                        }}>
                          <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                            transition: 'transform 0.2s'
                          }}>
                            <Icons.Play size={28} color="#ffffff" style={{ marginLeft: 3 }} />
                          </div>
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: 12,
                          right: 12,
                          background: 'rgba(0, 0, 0, 0.8)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}>
                          <Icons.Video size={13} color="#ea580c" />
                          <span>{post.videoDuration || '▶ Video'}</span>
                        </div>
                      </div>
                    ) : (
                      <video 
                        src={post.videoUrl} 
                        controls 
                        style={{ width: '100%', maxHeight: 320, display: 'block' }} 
                      />
                    )}
                  </div>
                )}

                {/* Challenge Card */}
                {post.challengeData && (
                  <div
                    style={{
                      background: 'var(--surface-light, #f8fafc)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span>👥 {post.challengeData.participants} participants</span>
                      <strong style={{ color: 'var(--green)' }}>{post.challengeData.progressPercent}% Target</strong>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                      <div style={{ height: '100%', width: `${post.challengeData.progressPercent}%`, background: 'var(--green)' }} />
                    </div>
                    <button
                      onClick={() => toggleJoinChallenge(post.id)}
                      className={post.challengeData.joined ? 'btn-outline-sm' : 'btn-primary'}
                      style={{ padding: '8px 18px', fontSize: 13 }}
                    >
                      {post.challengeData.joined ? 'Joined Challenge ✓' : 'Join Challenge'}
                    </button>
                  </div>
                )}

                {/* Post Footer Actions */}
                <div style={{ display: 'flex', gap: 24, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <button
                    onClick={() => toggleLike(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: post.userLiked ? '#ef4444' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.Heart size={18} fill={post.userLiked ? '#ef4444' : 'transparent'} />
                    {post.likes}
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.MessageCircle size={18} />
                    {post.comments} Comments
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                    }}
                  >
                    <Icons.Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: GROUPS */}
      {activeSection === 'groups' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, margin: '0 0 6px 0' }}>Ethiopian Wellness Communities</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>
              Join topic-focused groups to stay motivated and share routines.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 16 }}>
            {groups.map(g => (
              <div key={g.id} className="dash-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 32 }}>{g.icon}</span>
                    <span
                      style={{
                        fontSize: 11,
                        background: 'var(--surface-light, #f1f5f9)',
                        padding: '4px 8px',
                        borderRadius: 8,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                      }}
                    >
                      {g.privacy}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: 17 }}>{g.name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 8 }}>
                    {g.category} • {g.membersCount} members
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                    {g.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleGroupJoin(g.id)}
                  className={g.joined ? 'btn-outline-sm' : 'btn-primary'}
                  style={{ marginTop: 18, width: '100%', justifyContent: 'center' }}
                >
                  {g.joined ? 'Joined Community ✓' : 'Join Group'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: MESSAGES */}
      {activeSection === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, minHeight: 460 }}>
          {/* Threads List */}
          <div className="dash-card" style={{ padding: 16 }}>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <Icons.Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredThreads.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveThread(t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    borderRadius: 10,
                    cursor: 'pointer',
                    background: activeThread?.id === t.id ? 'var(--green-light)' : 'transparent',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: t.avatarBg,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {t.avatarText}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: 14 }}>{t.senderName}</strong>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.timeAgo}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.lastMessage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Conversation Pane */}
          {activeThread ? (
            <div className="dash-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: activeThread.avatarBg,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                  }}
                >
                  {activeThread.avatarText}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 15 }}>{activeThread.senderName}</h4>
                  <span style={{ fontSize: 11, color: 'var(--green-dark)' }}>Active now • Encrypted channel</span>
                </div>
              </div>

              {/* Messages scroll */}
              <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 280 }}>
                {activeThread.messages.map(m => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === 'me' ? 'flex-end' : 'flex-start',
                      background: m.sender === 'me' ? 'var(--green)' : 'var(--surface-light, #f1f5f9)',
                      color: m.sender === 'me' ? '#fff' : 'var(--text)',
                      padding: '10px 16px',
                      borderRadius: 14,
                      maxWidth: '75%',
                      fontSize: 13,
                    }}
                  >
                    <div>{m.text}</div>
                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.7,
                        marginTop: 4,
                        textAlign: m.sender === 'me' ? 'right' : 'left',
                      }}
                    >
                      {m.time}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  display: 'flex',
                  padding: 12,
                  borderTop: '1px solid var(--border)',
                  gap: 10,
                }}
              >
                <input
                  type="text"
                  placeholder="Write a supportive message..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 20,
                    border: '1px solid var(--border)',
                    outline: 'none',
                    fontSize: 13,
                  }}
                />
                <button className="btn-primary" type="submit" style={{ borderRadius: 20, padding: '8px 18px' }}>
                  Send
                </button>
              </form>
            </div>
          ) : (
            <div className="dash-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a conversation to start messaging.
            </div>
          )}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay open" onClick={() => { setShowPostModal(false); setAttachedMedia(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 540, borderRadius: 20, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Share with Community</h3>
              <button
                onClick={() => { setShowPostModal(false); setAttachedMedia(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Post Title (Optional, e.g. 'Leg Day Milestone', 'Healthy Teff Recipe')"
              value={newPostTitle}
              onChange={e => setNewPostTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: 14,
                marginBottom: 12,
              }}
            />

            <textarea
              placeholder="What healthy habit, gym routine, or wellness encouragement are you sharing?"
              value={newPostText}
              onChange={e => setNewPostText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 110,
                padding: 12,
                borderRadius: 10,
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: 14,
                marginBottom: 14,
                resize: 'vertical'
              }}
            />

            {/* LIVE ATTACHED MEDIA PREVIEW */}
            {attachedMedia && (
              <div style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                marginBottom: 14,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                padding: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12
              }}>
                {attachedMedia.type === 'image' ? (
                  <img 
                    src={attachedMedia.url} 
                    alt="Attached preview" 
                    style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: 8, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Play size={24} color="#ea580c" />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {attachedMedia.type === 'image' ? '📷 Photo Attached' : '🎥 Video Attached'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{attachedMedia.name}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedMedia(null)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: 'none',
                    color: '#ef4444',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Remove
                </button>
              </div>
            )}

            {/* Media Upload Buttons & Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input 
                  type="file" 
                  id="modalPhotoInput" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFileUpload(e, 'image')} 
                />
                <input 
                  type="file" 
                  id="modalVideoInput" 
                  accept="video/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFileUpload(e, 'video')} 
                />

                <button
                  type="button"
                  onClick={() => document.getElementById('modalPhotoInput')?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(22, 163, 74, 0.08)',
                    border: '1px solid rgba(22, 163, 74, 0.2)',
                    color: '#15803d',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icons.Image size={15} color="#16a34a" /> Add Photo
                </button>

                <button
                  type="button"
                  onClick={() => document.getElementById('modalVideoInput')?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgba(234, 88, 12, 0.08)',
                    border: '1px solid rgba(234, 88, 12, 0.2)',
                    color: '#c2410c',
                    padding: '8px 14px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icons.Video size={15} color="#ea580c" /> Add Video
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  className="btn-outline-sm" 
                  onClick={() => { setShowPostModal(false); setAttachedMedia(null); }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleCreatePost}
                  disabled={!newPostText.trim() && !attachedMedia}
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay open" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 460 }}>
            <h3 style={{ margin: '0 0 8px 0' }}>Community Privacy Settings</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              Control who can interact with you in the NuraCare community.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 8 }}>
                Who can send you direct messages?
              </label>
              {['Everyone', 'People I follow', 'Group members', 'Nobody'].map(opt => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: whoCanMessage === opt ? 'var(--green-light)' : 'transparent',
                    marginBottom: 4,
                  }}
                >
                  <input
                    type="radio"
                    name="msgPrivacy"
                    checked={whoCanMessage === opt}
                    onChange={() => setWhoCanMessage(opt)}
                  />
                  <span style={{ fontSize: 13, fontWeight: whoCanMessage === opt ? 700 : 500 }}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>

            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 10,
                padding: 12,
                fontSize: 12,
                color: '#92400e',
                lineHeight: 1.5,
                marginBottom: 18,
              }}
            >
              🔒 <strong>Absolute Protection:</strong> Your medication schedules, symptoms, and checkup answers will NEVER appear in community feeds.
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowPrivacyModal(false)}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
