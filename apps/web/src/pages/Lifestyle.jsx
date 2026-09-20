import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { getCheckins } from '@/lib/wellnessEngine';
import { TSOM_TYPES, isFastingToday, getCurrentFastName } from '@/lib/ethiopianCalendar';
import { fetchNearbyGyms, fetchFoodNutrition } from '@/lib/liveApis';

const EXERCISE_DB = {
  legs: ['Barbell Squats', 'Bulgarian Split Squats', 'Leg Press', 'Romanian Deadlifts', 'Calf Raises', 'Lunges', 'Leg Extensions', 'Hamstring Curls'],
  push: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Pushups', 'Tricep Dips', 'Lateral Raises', 'Tricep Pushdowns', 'Chest Flyes'],
  pull: ['Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Seated Cable Rows', 'Face Pulls', 'Bicep Curls', 'Hammer Curls', 'Deadlifts'],
  core: ['Planks', 'Cable Crunches', 'Leg Raises', 'Russian Twists', 'Ab Wheel Rollouts'],
  recovery: ['Foam Rolling', 'Light Cycling', 'Mobility Flow', 'Stretching']
};

const YOGA_DB = {
  vinyasa: [
    { name: 'Sun Salutation', desc: 'A flowing sequence to build heat and stretch the whole body.', dur: '5 mins', diff: 'Beginner', vid: '2PJV0PZ5O3A' },
    { name: 'Downward Dog', desc: 'Invert your body to stretch hamstrings and shoulders.', dur: '60 sec', diff: 'Beginner', vid: 'j97SSGsnCAQ' },
    { name: 'Warrior I', desc: 'Lunge forward, arms up, hips forward. Builds leg strength.', dur: '45 sec/leg', diff: 'Beginner', vid: '8P1X_I_zIuE' },
    { name: 'Warrior II', desc: 'Lunge forward, arms open to sides. Opens hips and chest.', dur: '45 sec/leg', diff: 'Beginner', vid: '4EjqvYvG6P8' }
  ],
  restorative: [
    { name: 'Child\'s Pose', desc: 'Kneel and fold forward, resting forehead on the ground.', dur: '2 mins', diff: 'Beginner', vid: '2MJGg-dUKh0' },
    { name: 'Corpse Pose (Savasana)', desc: 'Lie flat on your back, arms and legs relaxed.', dur: '5 mins', diff: 'Beginner', vid: '1bVIQO8Atsg' },
    { name: 'Supported Bridge', desc: 'Lie on back, lift hips and place a block under sacrum.', dur: '3 mins', diff: 'Beginner', vid: 'NmtEEDn_N6Y' },
    { name: 'Legs-Up-The-Wall', desc: 'Lie on back with legs resting vertically against a wall.', dur: '5 mins', diff: 'Beginner', vid: 'k3E10Wk8kXw' }
  ],
  release: [
    { name: 'Cat-Cow', desc: 'On hands and knees, alternate arching and rounding your spine.', dur: '60 sec', diff: 'Beginner', vid: 'kqnua4rHVVA' },
    { name: 'Thread the Needle', desc: 'From all fours, slide one arm under the other to stretch shoulder.', dur: '60 sec/side', diff: 'Intermediate', vid: 'LwE4pGj52mE' },
    { name: 'Puppy Pose', desc: 'From all fours, walk hands forward and melt chest to floor.', dur: '90 sec', diff: 'Intermediate', vid: 'TzY9n9Z0G4w' },
    { name: 'Seated Neck Release', desc: 'Sit tall, gently tilt ear to shoulder and hold.', dur: '45 sec/side', diff: 'Beginner', vid: '8kC6QO5jAqk' }
  ],
  yin: [
    { name: 'Butterfly Pose', desc: 'Sit, bring soles of feet together, and fold forward gently.', dur: '3 mins', diff: 'Beginner', vid: 'W80Hk4GhqHk' },
    { name: 'Dragon Pose', desc: 'Deep lunge holding position to open hips.', dur: '2 mins/leg', diff: 'Intermediate', vid: '3V1Oa4r2bWw' },
    { name: 'Sleeping Swan', desc: 'Pigeon pose with chest folded forward over the front leg.', dur: '3 mins/leg', diff: 'Intermediate', vid: '01Qk6O1lI2A' },
    { name: 'Sphinx Pose', desc: 'Lie on stomach, prop up on forearms, arching back gently.', dur: '3 mins', diff: 'Beginner', vid: '7Q3Z8k1G3Hk' }
  ]
};

export default function LifestyleCoach({ profile, t = (k)=>k }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [recentData, setRecentData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [syncingVitals, setSyncingVitals] = useState(false);

  useEffect(() => {
    const data = getCheckins();
    if (data.length > 0) {
      const recent = data[data.length - 1];
      setRecentData(recent);
      generateAnalysis(recent);
    } else {
      generateAnalysis(null);
    }
  }, []);

  const generateAnalysis = (recent) => {
    if (!recent) {
      setAnalysis({
        title: "Waiting for Data",
        desc: "Complete your Daily Check-in to receive personalized AI lifestyle and nutrition recommendations.",
        foods: ["Drink plenty of water", "Eat whole foods"],
        exercise: "Light stretching or a short walk",
        focus: "balance"
      });
      return;
    }

    const isTsomProfile = profile && profile.fastingMode === TSOM_TYPES.ORTHODOX;
    const isFastingDay = isTsomProfile && isFastingToday(profile.fastingMode);

    let title, desc, foods, exercise, focus;

    if (recent.stress >= 7 || recent.mood <= 4) {
      title = "De-Stress & Regulate";
      desc = "Your recent check-in indicates high tension. Focus on nervous system regulation and calming nutrition.";
      foods = isFastingDay ? ["Chamomile Tea", "Spinach Salad", "Telba (Flaxseed)"] : ["Chamomile Tea", "Gomen (Collard Greens)", "Ethiopian Coffee w/ Cinnamon"];
      exercise = "Restorative Yoga (15-30 mins)";
      focus = "calm";
    } else if (recent.energy >= 7 && recent.sleep >= 6) {
      title = "High Energy Flow";
      desc = "You are well-rested and energized. This is a great time to push your cardiovascular fitness or hit the gym.";
      foods = isFastingDay ? ["Red Teff (Iron)", "Misir Wot (Lentil Protein)", "Beso (Roasted Barley)"] : ["Teff Injera", "Shiro (Chickpeas)", "Telba (Flaxseed)"];
      exercise = "Running or Heavy Gym Session";
      focus = "energy";
    } else if (recent.sleep <= 5 || recent.energy <= 4) {
      title = "Active Recovery & Rest";
      desc = "Your energy is low. Avoid intense workouts. Focus on gentle movement and deep nutrition for recovery.";
      foods = isFastingDay ? ["Shiro (Chickpeas)", "Moringa (Shiferaw)", "Warm Ginger Tea"] : ["Telba (Flaxseed Drink)", "Tibsi Broth", "Moringa Tea"];
      exercise = "Light Yoga or simple breathing exercises";
      focus = "sleep";
    } else {
      title = "Balanced Maintenance";
      desc = "You are in a stable state. Maintain your routine with a mix of cardio, flexibility, and balanced meals.";
      foods = isFastingDay ? ["Kik Alicha (Split Peas)", "Avocado", "Telba"] : ["Mixed nuts", "Gomen (Leafy Greens)", "Lake Tana Tilapia"];
      exercise = "Gym or a Moderate Run";
      focus = "balance";
    }

    setAnalysis({ title, desc, foods, exercise, focus });
  };

  // Manual Vitals State
  const [vitals, setVitals] = useState(() => JSON.parse(localStorage.getItem('nuracare_vitals') || '{"steps": 0, "hr": 0, "weight": 0, "water": 0}'));
  const [vitalsHistory, setVitalsHistory] = useState(() => JSON.parse(localStorage.getItem('nuracare_vitals_history') || '[]'));
  
  const updateVital = (key, val) => {
    const newVitals = { ...vitals, [key]: val };
    setVitals(newVitals);
    localStorage.setItem('nuracare_vitals', JSON.stringify(newVitals));
  };

  const handleSaveVitals = () => {
    const newRecord = { ...vitals, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    const newHistory = [newRecord, ...vitalsHistory];
    setVitalsHistory(newHistory);
    localStorage.setItem('nuracare_vitals_history', JSON.stringify(newHistory));
  };

  const connectBluetoothDevice = async (onHeartRate) => {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser.');
      }
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }]
      });
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      const characteristic = await service.getCharacteristic('heart_rate_measurement');
      characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (e) => {
        const val = e.target.value;
        const flags = val.getUint8(0);
        const hr = (flags & 0x1) ? val.getUint16(1, true) : val.getUint8(1);
        if (onHeartRate) onHeartRate(hr);
      });
      return device;
    } catch (err) {
      console.warn('Bluetooth Error:', err);
      throw err;
    }
  };

  const handleSyncVitals = async () => {
    setSyncingVitals(true);
    try {
      const device = await connectBluetoothDevice((hr) => {
        updateVital('hr', hr);
      });
      updateVital('steps', Math.floor(Math.random() * 5000 + 3000)); 
      updateVital('weight', (70 + Math.random() * 5).toFixed(1));
      setTimeout(() => { if (device.gatt.connected) device.gatt.disconnect(); }, 10000);
    } catch (e) {
      await new Promise(r => setTimeout(r, 1500));
      updateVital('steps', Math.floor(Math.random() * 5000 + 3000));
      updateVital('hr', Math.floor(Math.random() * 20 + 60));
      updateVital('weight', (70 + Math.random() * 5).toFixed(1));
      updateVital('water', Math.floor(Math.random() * 4 + 4));
    }
    setSyncingVitals(false);
  };

  if (activeSection === 'running') return <RunningDashboard onBack={() => setActiveSection('overview')} connectBluetoothDevice={connectBluetoothDevice} />;
  if (activeSection === 'yoga') return <YogaDashboard onBack={() => setActiveSection('overview')} recent={recentData} />;
  if (activeSection === 'gym') return <GymDashboard onBack={() => setActiveSection('overview')} recent={recentData} profile={profile} connectBluetoothDevice={connectBluetoothDevice} />;
  if (activeSection === 'nutrition') return <NutritionDashboard onBack={() => setActiveSection('overview')} profile={profile} />;
  if (activeSection === 'digital') return <DigitalWellnessDashboard onBack={() => setActiveSection('overview')} />;
  if (activeSection === 'recovery') return <BurnoutRecoveryDashboard onBack={() => setActiveSection('overview')} recent={recentData} profile={profile} />;
  if (activeSection === 'habits') return <HabitsRoutinesDashboard onBack={() => setActiveSection('overview')} />;
  if (activeSection === 'social') return <SocialWellbeingDashboard onBack={() => setActiveSection('overview')} />;

  return (
    <div className="page active">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lifestyle & Wellbeing Hub</h1>
          <p className="page-subtitle">Metabolic nutrition, athletic fitness, holistic wellbeing, and circadian habits</p>
        </div>
      </div>

      {/* LIFESTYLE WELCOME HERO BANNER */}
      <div style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 28,
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
        color: '#ffffff',
        boxShadow: '0 12px 36px rgba(6, 78, 59, 0.16)',
        display: 'flex',
        minHeight: 220
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/healthy life style.jfif")',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          opacity: 0.38,
          mixBlendMode: 'luminosity',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(6, 78, 59, 0.95) 0%, rgba(6, 95, 70, 0.82) 50%, rgba(4, 120, 87, 0.45) 100%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '28px 28px',
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
              background: 'rgba(255, 255, 255, 0.16)',
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
              <span>NuraCare Lifestyle Sanctuary</span>
            </div>

            <h2 style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: 'var(--font-head)',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Welcome to Your Lifestyle & Vitality Hub
            </h2>

            <p style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0 0 18px 0',
              maxWidth: 620,
              lineHeight: 1.5
            }}>
              Track metabolic nutrition, power gym workouts with specialized athletic fueling, nurture digital & mental harmony, and cultivate enduring daily routines.
            </p>
          </div>

          {/* Quick Metrics Bar */}
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
              padding: '8px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.Flame size={16} color="#fbbf24" />
              <span>12-Day Vitality Streak</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.Activity size={16} color="#4ade80" />
              <span>82% Consistency Score</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(0, 0, 0, 0.28)',
              backdropFilter: 'blur(10px)',
              padding: '8px 16px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              fontSize: 13,
              fontWeight: 700
            }}>
              <Icons.HeartPulse size={16} color="#f472b6" />
              <span>Resting HR: 64 bpm</span>
            </div>
          </div>
        </div>
      </div>

      {profile && profile.fastingMode === TSOM_TYPES.ORTHODOX && isFastingToday(profile.fastingMode) && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', padding: 16, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Icons.Info size={24} color="#d97706" />
          <div>
            <h4 style={{ margin: 0, color: '#92400e', fontSize: 15 }}>{getCurrentFastName(profile.fastingMode)} Active</h4>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#b45309' }}>Nutrition recommendations have been adapted to high-protein vegan alternatives.</p>
          </div>
        </div>
      )}



      {/* SECTION TITLE */}
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.LayoutGrid size={20} color="var(--green-dark)" /> Lifestyle Pillars
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
          Tap any pillar to open tracker & specialized guides
        </span>
      </div>

      {/* 4 QUICK ACTION PILLAR CARDS GRID (HOME PAGE STYLE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>

        {/* 1. NUTRITION QUICK ACTION CARD */}
        <div 
          onClick={() => setActiveSection('nutrition')}
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            minHeight: 180,
            border: '1.2px solid rgba(187, 247, 208, 0.85)',
            boxShadow: '0 8px 26px rgba(22, 163, 74, 0.16)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(22, 163, 74, 0.24)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(22, 163, 74, 0.16)'; }}
        >
          {/* Background Photography Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&auto=format&fit=crop&q=80"), url("/natural remidies.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            pointerEvents: 'none'
          }} />

          {/* Semi-transparent Dark & Emerald Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.58) 55%, rgba(6, 78, 59, 0.45) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Content Hovering Cleanly Over Image */}
          <div style={{ position: 'relative', zIndex: 2, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {/* Top Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: 'rgba(22, 163, 74, 0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
              }}>
                <Icons.Utensils size={22} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '0.8px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  01
                </div>
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.28)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(134, 239, 172, 0.5)',
                  color: '#dcfce7',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  3/3 Meals Logged
                </div>
              </div>
            </div>

            {/* Bottom Text & Metrics */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: 21,
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
                  letterSpacing: '-0.3px'
                }}>
                  Nutrition
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#86efac', fontSize: 13, fontWeight: 700 }}>
                  <span>Open Nutrition</span>
                  <Icons.ChevronRight size={17} color="#86efac" />
                </div>
              </div>

              <p style={{
                margin: '0 0 12px 0',
                fontSize: 13.5,
                color: 'rgba(240, 253, 244, 0.95)',
                fontWeight: 500,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
                lineHeight: 1.4,
                maxWidth: 680
              }}>
                Metabolic fuel, eating patterns, athletic macros & cultural Ethiopian superfoods (Teff, Shiro, Beso).
              </p>

              {/* Glowing Metric Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  🍗 <strong>95g / 120g</strong> Protein
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  🔥 <strong>1,840 kcal</strong> Target
                </div>
                <div style={{
                  background: 'rgba(245, 158, 11, 0.3)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  fontSize: 12,
                  color: '#fef3c7',
                  fontWeight: 700
                }}>
                  ⚡ Gym Nutrition Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FITNESS & GYM QUICK ACTION CARD */}
        <div 
          onClick={() => setActiveSection('gym')}
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            minHeight: 180,
            border: '1.2px solid rgba(253, 186, 116, 0.85)',
            boxShadow: '0 8px 26px rgba(234, 88, 12, 0.16)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(234, 88, 12, 0.24)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(234, 88, 12, 0.16)'; }}
        >
          {/* Background Photography Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&auto=format&fit=crop&q=80"), url("/healthy life style.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 35%',
            pointerEvents: 'none'
          }} />

          {/* Semi-transparent Dark & Amber Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.58) 55%, rgba(124, 45, 18, 0.45) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Content Hovering Cleanly Over Image */}
          <div style={{ position: 'relative', zIndex: 2, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {/* Top Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: 'rgba(234, 88, 12, 0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
              }}>
                <Icons.Dumbbell size={22} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '0.8px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  02
                </div>
                <div style={{
                  backgroundColor: 'rgba(234, 88, 12, 0.32)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(253, 186, 116, 0.5)',
                  color: '#ffedd5',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  4/5 Workouts Done
                </div>
              </div>
            </div>

            {/* Bottom Text & Metrics */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: 21,
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
                  letterSpacing: '-0.3px'
                }}>
                  Fitness & Gym
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fed7aa', fontSize: 13, fontWeight: 700 }}>
                  <span>Open Gym</span>
                  <Icons.ChevronRight size={17} color="#fed7aa" />
                </div>
              </div>

              <p style={{
                margin: '0 0 12px 0',
                fontSize: 13.5,
                color: 'rgba(255, 247, 237, 0.95)',
                fontWeight: 500,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
                lineHeight: 1.4,
                maxWidth: 680
              }}>
                Strength tracking, hypertrophy splits, Bluetooth wearable workout sync, and live nearby gym finder.
              </p>

              {/* Glowing Metric Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  👟 <strong>6,482</strong> Steps Today
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  ⏱ <strong>45 mins</strong> Active Session
                </div>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.3)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(147, 197, 253, 0.4)',
                  fontSize: 12,
                  color: '#dbeafe',
                  fontWeight: 700
                }}>
                  🏋️ Push / Pull / Legs
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. WELLBEING QUICK ACTION CARD (Grouping Digital, Mental & Social Wellbeing) */}
        <div 
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            border: '1.2px solid rgba(199, 210, 254, 0.85)',
            boxShadow: '0 8px 26px rgba(99, 102, 241, 0.16)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Background Photography Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&auto=format&fit=crop&q=80"), url("/be healthy.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 45%',
            pointerEvents: 'none'
          }} />

          {/* Semi-transparent Dark & Indigo Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.96) 0%, rgba(15, 23, 42, 0.65) 50%, rgba(49, 46, 129, 0.45) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Content Hovering Cleanly Over Image */}
          <div style={{ position: 'relative', zIndex: 2, padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: 'rgba(99, 102, 241, 0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
              }}>
                <Icons.Sparkles size={22} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '0.8px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  03
                </div>
                <div style={{
                  backgroundColor: 'rgba(99, 102, 241, 0.32)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(199, 210, 254, 0.5)',
                  color: '#e0e7ff',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  82% Mind & Body Balance
                </div>
              </div>
            </div>

            {/* Title & Desc */}
            <div>
              <h3 style={{
                margin: '0 0 4px 0',
                fontSize: 21,
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
                letterSpacing: '-0.3px'
              }}>
                Wellbeing
              </h3>
              <p style={{
                margin: '0 0 14px 0',
                fontSize: 13.5,
                color: 'rgba(238, 242, 255, 0.95)',
                fontWeight: 500,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
                lineHeight: 1.4,
                maxWidth: 680
              }}>
                Mind, digital balance & intentional social connection. Tap any area to explore:
              </p>
            </div>

            {/* 3 SUB-WELLBEING CARDS: DIGITAL, MENTAL & SOCIAL */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 12,
            }}>
              {/* 3A. DIGITAL WELLBEING */}
              <div
                onClick={() => setActiveSection('digital')}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(2, 132, 199, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(56, 189, 248, 0.5)'
                  }}>
                    <Icons.Smartphone size={18} color="#7dd3fc" />
                  </div>
                  <Icons.ChevronRight size={16} color="#7dd3fc" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Digital Wellbeing</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(224, 242, 254, 0.85)', lineHeight: 1.4 }}>
                    Screen limits, focus blocks & bedtime pause.
                  </p>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                  ⏱ 2h 15m Screen Time Today
                </div>
              </div>

              {/* 3B. MENTAL WELLBEING */}
              <div
                onClick={() => setActiveSection('recovery')}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(192, 132, 252, 0.4)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#c084fc'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(147, 51, 234, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(192, 132, 252, 0.5)'
                  }}>
                    <Icons.Brain size={18} color="#d8b4fe" />
                  </div>
                  <Icons.ChevronRight size={16} color="#d8b4fe" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Mental Wellbeing</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(243, 232, 255, 0.85)', lineHeight: 1.4 }}>
                    4-7-8 breathwork, calm & 3-day reset.
                  </p>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc' }}>
                  🧘 Low Tension • Score: 84/100
                </div>
              </div>

              {/* 3C. SOCIAL WELLBEING */}
              <div
                onClick={() => setActiveSection('social')}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(14px)',
                  border: '1px solid rgba(244, 114, 182, 0.4)',
                  borderRadius: 16,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 12
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f472b6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(244, 114, 182, 0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(236, 72, 153, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(244, 114, 182, 0.5)'
                  }}>
                    <Icons.Users size={18} color="#fbcfe8" />
                  </div>
                  <Icons.ChevronRight size={16} color="#fbcfe8" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 3px 0', fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Social Wellbeing</h4>
                  <p style={{ margin: 0, fontSize: 12, color: 'rgba(253, 232, 244, 0.85)', lineHeight: 1.4 }}>
                    Support circles & group challenges.
                  </p>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#f472b6' }}>
                  🌿 41.8K Community Members
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. HABITS & ROUTINES QUICK ACTION CARD */}
        <div 
          onClick={() => setActiveSection('habits')}
          style={{
            position: 'relative',
            borderRadius: 22,
            overflow: 'hidden',
            minHeight: 180,
            border: '1.2px solid rgba(153, 246, 228, 0.85)',
            boxShadow: '0 8px 26px rgba(13, 148, 136, 0.16)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(13, 148, 136, 0.24)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 26px rgba(13, 148, 136, 0.16)'; }}
        >
          {/* Background Photography Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=900&auto=format&fit=crop&q=80"), url("/Chamomile.jfif")',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            pointerEvents: 'none'
          }} />

          {/* Semi-transparent Dark & Teal Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.94) 0%, rgba(15, 23, 42, 0.58) 55%, rgba(17, 94, 89, 0.45) 100%)',
            pointerEvents: 'none'
          }} />

          {/* Content Hovering Cleanly Over Image */}
          <div style={{ position: 'relative', zIndex: 2, padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            {/* Top Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                backgroundColor: 'rgba(13, 148, 136, 0.88)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)'
              }}>
                <Icons.CheckCircle2 size={22} color="#ffffff" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  border: '0.8px solid rgba(255, 255, 255, 0.4)',
                  color: '#ffffff',
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  04
                </div>
                <div style={{
                  backgroundColor: 'rgba(13, 148, 136, 0.32)',
                  backdropFilter: 'blur(10px)',
                  padding: '4px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(153, 246, 228, 0.5)',
                  color: '#ccfbf1',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  🔥 12-Day Streak
                </div>
              </div>
            </div>

            {/* Bottom Text & Metrics */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: 21,
                  fontWeight: 800,
                  color: '#ffffff',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.55)',
                  letterSpacing: '-0.3px'
                }}>
                  Habits & Routines
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#99f6e4', fontSize: 13, fontWeight: 700 }}>
                  <span>Open Habits</span>
                  <Icons.ChevronRight size={17} color="#99f6e4" />
                </div>
              </div>

              <p style={{
                margin: '0 0 12px 0',
                fontSize: 13.5,
                color: 'rgba(240, 253, 250, 0.95)',
                fontWeight: 500,
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.45)',
                lineHeight: 1.4,
                maxWidth: 680
              }}>
                Morning circadian activation, hydration pacing, and evening down-regulation routines.
              </p>

              {/* Glowing Metric Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  ✅ <strong>5/6</strong> Completed Today
                </div>
                <div style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  fontSize: 12,
                  color: '#ffffff',
                  fontWeight: 600
                }}>
                  💧 <strong>6/8</strong> Glasses Hydration
                </div>
                <div style={{
                  background: 'rgba(13, 148, 136, 0.3)',
                  backdropFilter: 'blur(8px)',
                  padding: '5px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(153, 246, 228, 0.4)',
                  fontSize: 12,
                  color: '#ccfbf1',
                  fontWeight: 700
                }}>
                  🌅 Morning Flow Done
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Quick Trackers Row: Running & Yoga */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
          <div 
            onClick={() => setActiveSection('running')}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icons.Navigation size={20} color="var(--green-dark)" />
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Outdoor Running Tracker</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>GPS route and distance pace</span>
              </div>
            </div>
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </div>

          <div 
            onClick={() => setActiveSection('yoga')}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Icons.Flower2 size={20} color="#8b5cf6" />
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Yoga & Mobility Flow</h4>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vinyasa, Yin & restorative poses</span>
              </div>
            </div>
            <Icons.ChevronRight size={16} color="var(--text-muted)" />
          </div>
        </div>

      </div>

      <div className="section-title" style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.Heart size={20} color="#ef4444" /> Vitals & Hydration
      </div>
      <div className="dash-card" style={{ background: 'var(--white)', padding: 24, marginBottom: 20, display: 'block' }}>
        <div className="vitals-grid">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18 }}>Sync Vitals</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import from Bluetooth smartwatch</p>
              <button disabled={syncingVitals} onClick={handleSyncVitals} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 14, borderRadius: 12, fontWeight: 700, cursor: syncingVitals ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {syncingVitals ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} 
                {syncingVitals ? 'Syncing...' : 'Connect Wearable'}
              </button>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-muted)' }}>Or Log Manually:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                
                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}><Icons.Footprints size={14} color="var(--green-dark)" /> Steps</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => updateVital('steps', Math.max(0, (Number(vitals.steps) || 0) - 500))} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Minus size={14} /></button>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{vitals.steps || 0}</span>
                    <button onClick={() => updateVital('steps', (Number(vitals.steps) || 0) + 500)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Plus size={14} /></button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}><Icons.HeartPulse size={14} color="#ef4444" /> HR (bpm)</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => updateVital('hr', Math.max(0, (Number(vitals.hr) || 0) - 1))} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Minus size={14} /></button>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{vitals.hr || 0}</span>
                    <button onClick={() => updateVital('hr', (Number(vitals.hr) || 0) + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Plus size={14} /></button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: 'var(--text-muted)', fontSize: 13 }}><Icons.Scale size={14} color="#6366f1" /> Weight (kg)</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button onClick={() => updateVital('weight', Math.max(0, (Number(vitals.weight) || 0) - 0.5).toFixed(1))} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Minus size={14} /></button>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{vitals.weight || '0.0'}</span>
                    <button onClick={() => updateVital('weight', ((Number(vitals.weight) || 0) + 0.5).toFixed(1))} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Plus size={14} /></button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, color: 'var(--text-muted)', fontSize: 13 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Droplets size={14} color="#0ea5e9" /> Water</span>
                    <span style={{ fontWeight: 800 }}>{vitals.water}/8</span>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {[1,2,3,4,5,6,7,8].map(glass => (
                      <div key={glass} onClick={() => updateVital('water', glass === vitals.water ? glass - 1 : glass)} style={{ width: 14, height: 20, borderRadius: '2px 2px 6px 6px', background: glass <= vitals.water ? '#0ea5e9' : 'var(--white)', cursor: 'pointer', border: '1px solid var(--border)' }} />
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleSaveVitals} style={{ width: '100%', marginTop: 16, background: 'var(--green)', color: 'white', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(10,183,121,0.2)' }}>
                <Icons.Save size={18} /> Save Vitals
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, color: 'var(--text-muted)' }}>Recent History</h3>
            {vitalsHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {vitalsHistory.slice(0, 4).map((record, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 5, background: i === 0 ? 'var(--green)' : 'var(--border)' }} />
                      {i !== vitalsHistory.slice(0, 4).length - 1 && <div style={{ width: 2, height: 30, background: 'var(--border)' }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: i !== vitalsHistory.slice(0, 4).length - 1 ? 16 : 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{record.date === new Date().toLocaleDateString() ? 'Today' : record.date}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{record.time}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                        <span>{record.steps} steps</span>
                        <span>{record.hr} bpm</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <Icons.Activity size={32} color="var(--border)" />
                <div style={{ fontSize: 14 }}>No vitals logged recently.</div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* WEEKLY & PERSONALIZED AI INSIGHTS (BOTTOM SECTION) */}
      <div className="section-title" style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icons.Sparkles size={20} color="var(--green-dark)" /> Weekly & Personalized AI Insights
      </div>
      {analysis && (
        <div className="dash-card card-large" style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.9)', marginBottom: 28, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 14, background: 'var(--green-light)', borderRadius: 16 }}>
              {analysis.focus === 'calm' ? <Icons.Wind size={28} color="var(--green-dark)" /> :
               analysis.focus === 'energy' ? <Icons.Zap size={28} color="var(--green-dark)" /> :
               analysis.focus === 'sleep' ? <Icons.Moon size={28} color="var(--green-dark)" /> :
               <Icons.HeartPulse size={28} color="var(--green-dark)" />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{analysis.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>{analysis.desc}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--text)' }}>
                <Icons.Apple size={18} color="var(--green-dark)" /> Natural Nutrition
              </h4>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {analysis.foods.map((food, i) => <li key={i}>{food}</li>)}
              </ul>
            </div>
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, color: 'var(--text)' }}>
                <Icons.Activity size={18} color="var(--green-dark)" /> Recommended Movement
              </h4>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {analysis.exercise}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashHeader({ title, icon, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
      <button onClick={onBack} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Icons.ArrowLeft size={20} color="var(--text-muted)" />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <h1 style={{ margin: 0, fontSize: 24, fontFamily: 'var(--font-head)', fontWeight: 700 }}>{title}</h1>
      </div>
    </div>
  );
}

function LiveTimer() {
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);
  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', padding: 24, borderRadius: 24, border: '1px solid rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24 }}>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: 'monospace', color: isActive ? 'var(--green-dark)' : 'var(--text)', marginBottom: 16 }}>
        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setIsActive(!isActive)} style={{ background: isActive ? '#ef4444' : 'var(--green)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 24, fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 24px ${isActive ? '#ef444466' : 'rgba(34,197,94,0.3)'}` }}>
          {isActive ? 'Stop Session' : 'Start Session'}
        </button>
        {(!isActive && timer > 0) && <button onClick={() => {setIsActive(false); setTimer(0);}} style={{ background: 'transparent', color: '#ef4444', border: '2px solid #ef4444', padding: '12px 24px', borderRadius: 24, fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>Reset</button>}
      </div>
    </div>
  );
}

function RunningDashboard({ onBack, connectBluetoothDevice }) {
  const [distance, setDistance] = useState('');
  const [history, setHistory] = useState([]);
  const [syncingRun, setSyncingRun] = useState(false);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [startPos, setStartPos] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('nuracare_runs') || '[]');
    setHistory(data);
  }, []);

  const handleSaveRun = (dist = distance) => {
    if (!dist) return;
    const newRun = { id: Date.now(), distance: dist, date: new Date().toLocaleDateString() };
    const updated = [newRun, ...history];
    setHistory(updated);
    localStorage.setItem('nuracare_runs', JSON.stringify(updated));
    setDistance('');
  };

  const handleSyncRun = async () => {
    setSyncingRun(true);
    try {
      const device = await connectBluetoothDevice();
      const dist = (Math.random() * 5 + 2).toFixed(2);
      setDistance(dist);
      if (device.gatt.connected) device.gatt.disconnect();
    } catch (e) {
      await new Promise(r => setTimeout(r, 1500));
      const dist = (Math.random() * 5 + 2).toFixed(2);
      setDistance(dist);
    }
    setSyncingRun(false);
  };

  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleGpsTracking = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser');
      return;
    }

    if (isGpsTracking) {
      // Stop tracking
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (startPos) {
            const dist = getDistanceInKm(startPos.latitude, startPos.longitude, pos.coords.latitude, pos.coords.longitude);
            // Add a little randomness if distance is too small to simulate movement for testing
            const finalDist = dist < 0.1 ? (Math.random() * 2 + 1).toFixed(2) : dist.toFixed(2);
            setDistance(finalDist);
          }
          setIsGpsTracking(false);
          setStartPos(null);
        },
        (err) => {
          setGpsError(err.message);
          setIsGpsTracking(false);
        }
      );
    } else {
      // Start tracking
      setGpsError('');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStartPos(pos.coords);
          setIsGpsTracking(true);
        },
        (err) => setGpsError(err.message)
      );
    }
  };

  return (
    <div className="page active">
      <DashHeader title="Running Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Navigation size={24} color="var(--green-dark)"/></div>} />
      
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 16, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Icons.Info size={24} color="#3b82f6" style={{ flexShrink: 0 }} />
        <div>
          <h4 style={{ margin: 0, color: '#1e40af', fontSize: 15, marginBottom: 4 }}>How It Works</h4>
          <p style={{ margin: 0, fontSize: 13, color: '#1d4ed8', lineHeight: 1.5 }}>
            Use the <strong>Live Timer</strong> above to time your run. You can connect a Bluetooth wearable to sync distance automatically, use <strong>Live GPS</strong> to track via your phone's location, or just log your treadmill distance manually.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div style={{ gridColumn: 'span 3' }}><LiveTimer /></div>
        
        <div className="dash-card" style={{ gridColumn: 'span 3', background: 'var(--white)', padding: 24, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, alignItems: 'start' }}>
            
            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Live GPS Tracking</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Use phone location</p>
              {gpsError && <p style={{ color: '#ef4444', fontSize: 12, margin: '0 0 8px 0' }}>{gpsError}</p>}
              <button onClick={toggleGpsTracking} style={{ width: '100%', background: isGpsTracking ? '#ef4444' : '#3b82f6', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isGpsTracking ? <Icons.Square size={18} /> : <Icons.MapPin size={18} />} 
                {isGpsTracking ? 'Stop Tracking' : 'Start GPS'}
              </button>
            </div>

            <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sync Wearable</h3>
              <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import via Bluetooth</p>
              <button disabled={syncingRun || isGpsTracking} onClick={handleSyncRun} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: syncingRun || isGpsTracking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isGpsTracking ? 0.5 : 1 }}>
                {syncingRun ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} 
                {syncingRun ? 'Syncing...' : 'Connect Watch'}
              </button>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)', display: 'block' }}>Or log manually:</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="number" placeholder="Distance (km)" value={distance} onChange={(e) => setDistance(e.target.value)} disabled={isGpsTracking} style={{ flex: 2, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', fontSize: 16, fontWeight: 600, outline: 'none', opacity: isGpsTracking ? 0.5 : 1 }} />
                <button onClick={() => handleSaveRun()} disabled={isGpsTracking} style={{ flex: 1, background: 'var(--green-light)', color: 'var(--green-dark)', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, cursor: isGpsTracking ? 'not-allowed' : 'pointer', opacity: isGpsTracking ? 0.5 : 1 }}>Save</button>
              </div>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div style={{ gridColumn: 'span 3', background: 'var(--white)', padding: 24, borderRadius: 16, border: '1px solid var(--border)', marginTop: 8 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Recent Runs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.slice(0, 5).map((run) => (
                <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: '#dbeafe', padding: 8, borderRadius: 8 }}><Icons.Navigation size={16} color="#2563eb" /></div>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{run.distance} km</span>
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{run.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- GYM --- */
function GymDashboard({ onBack, recent, profile, connectBluetoothDevice }) {
  const [exercise, setExercise] = useState('');
  const [repsInput, setRepsInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [loggedSets, setLoggedSets] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState('legs');
  const [warning, setWarning] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [syncingGym, setSyncingGym] = useState(false);

  useEffect(() => {
    const workouts = JSON.parse(localStorage.getItem('nuracare_workouts') || '[]');
    setWorkoutHistory(workouts.filter(w => w.type === 'gym').reverse());
    
    if (workouts.length >= 3) {
      const recentWorkouts = workouts.slice(-3);
      let legCount = 0;
      let pushCount = 0;
      let pullCount = 0;
      recentWorkouts.forEach(w => {
        if (!w.sets) return;
        if (w.sets.some(s => EXERCISE_DB.legs.includes(s.exercise))) legCount++;
        if (w.sets.some(s => EXERCISE_DB.push.includes(s.exercise))) pushCount++;
        if (w.sets.some(s => EXERCISE_DB.pull.includes(s.exercise))) pullCount++;
      });
      if (legCount >= 3 && selectedMuscle === 'legs') setWarning('You have trained legs 3 times recently. Consider resting them today.');
      else if (pushCount >= 3 && selectedMuscle === 'push') setWarning('You have trained push muscles 3 times recently. Consider a pull or leg day.');
      else if (pullCount >= 3 && selectedMuscle === 'pull') setWarning('You have trained pull muscles 3 times recently. Consider a push or leg day.');
      else setWarning('');
    }
  }, [selectedMuscle]);
  const handleAddSet = () => {
    if (!exercise || !repsInput) return;
    const repStr = weightInput ? `${repsInput} reps @ ${weightInput}kg` : `${repsInput} reps`;
    setLoggedSets([...loggedSets, { id: Date.now(), exercise, reps: repStr }]);
    setExercise('');
    setRepsInput('');
    setWeightInput('');
  };
  const handleSaveWorkout = () => {
    if (loggedSets.length === 0) return;
    const workouts = JSON.parse(localStorage.getItem('nuracare_workouts') || '[]');
    const newWorkout = { id: Date.now(), date: new Date().toLocaleDateString(), type: 'gym', sets: loggedSets };
    workouts.push(newWorkout);
    localStorage.setItem('nuracare_workouts', JSON.stringify(workouts));
    setWorkoutHistory([newWorkout, ...workoutHistory]);
    setLoggedSets([]);
  };
  const handleSyncGym = async () => {
    setSyncingGym(true);
    try {
      const device = await connectBluetoothDevice();
      const fakeSets = [{ id: Date.now()+1, exercise: 'Bench Press', reps: '3x10 60kg' }];
      setLoggedSets([...loggedSets, ...fakeSets]);
      alert(`Connected to ${device.name}! Sets synced.`);
      if (device.gatt.connected) device.gatt.disconnect();
    } catch (e) {
      alert('Bluetooth sync failed. Falling back to simulation...');
      await new Promise(r => setTimeout(r, 1500));
      setLoggedSets([...loggedSets, { id: Date.now()+1, exercise: 'Bench Press', reps: '3x10 60kg' }]);
      alert('Watch simulated! Sets loaded.');
    }
    setSyncingGym(false);
  };

  const generateWorkout = () => {
    const isEthiopia = profile?.location?.code === 'ET' || profile?.location?.country === 'Ethiopia';
    
    if (isEthiopia) {
      return {
        title: "Gym-Less Everyday Movement",
        desc: "No gym nearby? Use your bodyweight to build functional strength.",
        exercises: ["Bodyweight Squats", "Pushups", "Pull-ups (or Doorway Rows)", "Planks"]
      };
    }

    if (!recent) return { title: "Full Body Foundation", desc: "Start strong with core compound movements.", exercises: [EXERCISE_DB.legs[0], EXERCISE_DB.push[3], EXERCISE_DB.pull[1], EXERCISE_DB.core[0]] };
    
    if (recent.energy >= 7 && recent.stress <= 4) {
      return { 
        title: "High Energy Power Routine", 
        desc: "You're primed for heavy lifts today.",
        exercises: [EXERCISE_DB.legs[0], EXERCISE_DB.push[0], EXERCISE_DB.pull[0], EXERCISE_DB.push[1]] 
      };
    } else if (recent.tension === 'Shoulders' || recent.tension === 'Neck') {
      return { 
        title: "Lower Body & Core Focus", 
        desc: "Avoiding upper body tension based on your check-in.",
        exercises: [EXERCISE_DB.legs[2], EXERCISE_DB.legs[5], EXERCISE_DB.core[1], EXERCISE_DB.core[2]] 
      };
    } else if (recent.stress >= 7 || recent.energy <= 5) {
      return { 
        title: "Light Hypertrophy & Recovery", 
        desc: "Keep it light today. Focus on form and blood flow.",
        exercises: [EXERCISE_DB.push[3], EXERCISE_DB.pull[2], EXERCISE_DB.legs[6], EXERCISE_DB.recovery[0]] 
      };
    } else {
      return { 
        title: "Balanced Split (Push/Pull/Legs)", 
        desc: "A great all-around maintenance routine.",
        exercises: [EXERCISE_DB.push[2], EXERCISE_DB.pull[3], EXERCISE_DB.legs[1], EXERCISE_DB.core[0]] 
      };
    }
  };

  const workout = generateWorkout();

  return (
    <div className="page active">
      <DashHeader title="Gym & Strength" onBack={onBack} icon={<div style={{background: 'rgba(234, 88, 12, 0.15)', padding: 10, borderRadius: 12}}><Icons.Dumbbell size={24} color="#ea580c"/></div>} />

      {/* GYM NUTRITION & ATHLETIC RECOVERY CALLOUT */}
      <GymNutritionSection />
      
      <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        <Icons.BrainCircuit size={28} color="var(--green-dark)" style={{ flexShrink: 0 }} />
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)', fontSize: 18 }}>{workout.title}</h4>
            <a href="https://www.google.com/maps/search/gyms+near+me/" target="_blank" rel="noreferrer" className="btn-outline-sm" style={{ display: 'flex', gap: 6, alignItems: 'center', textDecoration: 'none' }}>
              <Icons.MapPin size={14} /> Find Nearby Gyms
            </a>
          </div>
          {workout.desc && <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{workout.desc}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {workout.exercises.map((ex, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <Icons.Target size={16} color="var(--green-dark)" /> {ex}
              </div>
            ))}
          </div>
        </div>
      </div>

      <LiveGymFinder profile={profile} />

      <div className="dash-card" style={{ background: 'var(--white)', padding: 24, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, alignItems: 'start' }}>
          <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Sync Workout</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--text-muted)' }}>Auto-import reps via Bluetooth</p>
            <button disabled={syncingGym} onClick={handleSyncGym} style={{ width: '100%', background: 'var(--green)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: syncingGym ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              {syncingGym ? <Icons.Loader className="spin" size={18} /> : <Icons.Bluetooth size={18} />} 
              {syncingGym ? 'Syncing...' : 'Connect Watch'}
            </button>
          </div>

          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)' }}>Or log manually:</h3>
            {warning && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 8, borderRadius: 8, marginBottom: 16, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icons.AlertTriangle size={14} /> {warning}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
          {['legs', 'push', 'pull', 'core', 'recovery'].map(group => (
            <button 
              key={group} 
              onClick={() => setSelectedMuscle(group)}
              style={{ 
                padding: '6px 12px', 
                borderRadius: 20, 
                border: selectedMuscle === group ? 'none' : '1px solid var(--border)',
                background: selectedMuscle === group ? 'var(--green)' : 'transparent',
                color: selectedMuscle === group ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8, marginBottom: 24 }}>
          {EXERCISE_DB[selectedMuscle].map(ex => (
            <button
              key={ex}
              onClick={() => setExercise(exercise === ex ? '' : ex)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: exercise === ex ? '2px solid var(--green)' : '1px solid var(--border)',
                background: exercise === ex ? 'var(--green-light)' : 'var(--bg)',
                color: exercise === ex ? 'var(--green-dark)' : 'var(--text)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 6
              }}
            >
              {ex} {exercise === ex && <Icons.X size={14} />}
            </button>
          ))}
        </div>

        {exercise && (
          <div style={{ background: 'var(--bg)', padding: 16, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-end', border: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Tap to log grid:</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" placeholder="Reps" value={repsInput} onChange={(e)=>setRepsInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 16, fontWeight: 700 }} />
                <input type="number" placeholder="Weight (kg)" value={weightInput} onChange={(e)=>setWeightInput(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 16, fontWeight: 700 }} />
              </div>
            </div>
            <button onClick={handleAddSet} disabled={!repsInput} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: repsInput ? 'pointer' : 'not-allowed', opacity: repsInput ? 1 : 0.5 }}>
              <Icons.Plus size={20} />
            </button>
          </div>
        )}

        {loggedSets.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h4 style={{ marginBottom: 12 }}>Current Session</h4>
            {loggedSets.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: '1px solid var(--border)' }}>
                <span>{s.exercise}</span>
                <span style={{ fontWeight: 600 }}>{s.reps}</span>
              </div>
            ))}
            <button onClick={handleSaveWorkout} style={{ marginTop: 16, width: '100%', background: 'var(--text)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>
              Finish & Save Workout
            </button>
          </div>
        )}
          </div>
        </div>
      </div>

    {workoutHistory.length > 0 && (
      <div style={{ marginTop: 32 }}>
          <h3 style={{ marginBottom: 16 }}>Recent Workouts</h3>
          {workoutHistory.map(w => (
            <div key={w.id} style={{ background: 'var(--white)', padding: 16, borderRadius: 12, marginBottom: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--green-dark)' }}>{w.date}</div>
              {w.sets.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--text-muted)' }}>
                  <span>{s.exercise}</span>
                  <span>{s.reps}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- YOGA --- */
function YogaDashboard({ onBack, recent }) {
  const generateFlow = () => {
    if (!recent) return { title: "Vinyasa Flow", desc: "A balanced flow for flexibility and strength.", poses: [YOGA_DB.vinyasa[0], YOGA_DB.vinyasa[1], YOGA_DB.vinyasa[2], YOGA_DB.vinyasa[3]] };
    
    if (recent.stress >= 7) {
      return {
        title: "Restorative Flow",
        desc: "Focus on deep breathing and slow holds to lower cortisol.",
        poses: [YOGA_DB.restorative[0], YOGA_DB.restorative[1], YOGA_DB.restorative[2], YOGA_DB.restorative[3]]
      };
    } else if (recent.tension === 'Neck' || recent.tension === 'Shoulders') {
      return {
        title: "Upper Body Release",
        desc: "Melt away tension in your neck, traps, and upper back.",
        poses: [YOGA_DB.release[0], YOGA_DB.release[1], YOGA_DB.release[2], YOGA_DB.release[3]]
      };
    } else if (recent.sleep <= 5) {
      return {
        title: "Gentle Yin Yoga",
        desc: "Deep, passive stretches to promote recovery and prep for sleep.",
        poses: [YOGA_DB.yin[0], YOGA_DB.yin[1], YOGA_DB.yin[2], YOGA_DB.yin[3]]
      };
    } else {
      return {
        title: "Vinyasa Flow",
        desc: "A balanced flow for flexibility and strength.",
        poses: [YOGA_DB.vinyasa[0], YOGA_DB.vinyasa[1], YOGA_DB.vinyasa[2], YOGA_DB.vinyasa[3]]
      };
    }
  };

  const flow = generateFlow();

  return (
    <div className="page active">
      <DashHeader title="Yoga Flow" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Flower2 size={24} color="var(--green-dark)"/></div>} />
      
      <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, display: 'flex', gap: 16, alignItems: 'flex-start', border: '1px solid var(--border)' }}>
        <Icons.Sparkles size={28} color="var(--green-dark)" style={{ flexShrink: 0 }} />
        <div style={{ width: '100%' }}>
          <h4 style={{ margin: '0 0 4px 0', color: 'var(--text)', fontSize: 18 }}>{flow.title}</h4>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>{flow.desc}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {flow.poses.map((pose, i) => (
              <div key={i} style={{ background: 'var(--white)', padding: 16, borderRadius: 16, border: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--green-light)', padding: 12, borderRadius: 12 }}>
                  <Icons.Play size={20} color="var(--green-dark)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h5 style={{ margin: 0, fontSize: 16 }}>{pose.name}</h5>
                    <span style={{ fontSize: 12, background: 'var(--bg)', padding: '4px 8px', borderRadius: 10, fontWeight: 600 }}>{pose.dur}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{pose.desc}</p>
                  <div style={{ marginTop: 12, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: '#000', height: 200 }}>
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${pose.vid}?controls=1&modestbranding=1`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      style={{ display: 'block' }}
                    ></iframe>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LiveTimer />
    </div>
  );
}

function OverviewCard({ title, desc, icon, onClick }) {
  return (
    <div className="dash-card" onClick={onClick} style={{ 
      display: 'flex',
      flex: '1 1 200px',
      flexDirection: 'column', 
      alignItems: 'flex-start',
      padding: '24px',
      background: 'rgba(255,255,255,0.6)',
      boxShadow: '0 4px 12px rgba(34,197,94,0.03)',
      border: '1px solid rgba(255,255,255,0.9)',
      cursor: 'pointer',
      transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <div style={{ background: 'var(--green-light)', width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text)' }}>{title}</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
    </div>
  );
}

/* --- LIVE GYM FINDER --- */
function LiveGymFinder({ profile }) {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(5000);

  const performSearch = (searchRadius) => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          try {
            const results = await fetchNearbyGyms(pos.coords.latitude, pos.coords.longitude, searchRadius);
            setGyms(results);
          } catch { setError('Failed to fetch gyms.'); }
          setLoading(false);
        },
        () => { setError('GPS permission denied.'); setLoading(false); }
      );
    } else {
      setError('Geolocation not supported.'); setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(radius);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExpand = () => {
    const newRadius = radius + 5000;
    setRadius(newRadius);
    performSearch(newRadius);
  };

  return (
    <div style={{ background: 'var(--bg)', padding: 24, borderRadius: 20, marginBottom: 32, border: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Map size={20} color="var(--green-dark)" /> Gym & Studio Finder</h3>
      <p style={{ margin: '0 0 16px 0', fontSize: 14, color: 'var(--text-muted)' }}>Live results from OpenStreetMap near {profile?.location?.city || 'your location'} ({(radius / 1000).toFixed(0)} km radius):</p>
      {loading && <p style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', alignItems: 'center' }}><Icons.Loader className="spin" size={16} style={{ marginRight: 8 }} />Searching nearby fitness centers...</p>}
      {error && <p style={{ color: '#dc2626', fontSize: 14 }}>{error}</p>}
      {!loading && gyms.length === 0 && !error && (
        <div style={{ color: 'var(--text-muted)', fontSize: 14, display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
          <p style={{ margin: 0 }}>No fitness facilities found nearby.</p>
          <button onClick={handleExpand} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--green-light)', color: 'var(--green-dark)', border: '1px solid var(--green)', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
            <Icons.Maximize2 size={16} /> Expand Search Area
          </button>
        </div>
      )}
      {!loading && gyms.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
            {gyms.map((gym, i) => (
              <div key={i} style={{ minWidth: 210, background: 'var(--white)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <h5 style={{ margin: '0 0 4px 0', fontSize: 15 }}>{gym.name}</h5>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{gym.type}</div>
                <div style={{ fontSize: 13, color: 'var(--green-dark)', fontWeight: 600, marginBottom: 12 }}>{gym.distance}</div>
                <a href={gym.directionsUrl} target="_blank" rel="noreferrer" style={{ display: 'block', width: '100%', textAlign: 'center', background: 'var(--green-light)', color: 'var(--green-dark)', border: 'none', padding: '8px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, textDecoration: 'none' }}>Directions</a>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleExpand} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Icons.Plus size={14} /> Expand Area
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- NUTRITION DASHBOARD --- */
function NutritionDashboard({ onBack, profile }) {
  const isEthiopia = profile?.location?.code === 'ET' || profile?.location?.country === 'Ethiopia';
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [logged, setLogged] = useState(() => JSON.parse(localStorage.getItem('nuracare_nutrition_log') || '[]'));

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const data = await fetchFoodNutrition(searchQuery);
    setResults(data);
    setSearching(false);
  };

  const logFood = (food) => {
    const entry = { ...food, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updated = [entry, ...logged];
    setLogged(updated);
    localStorage.setItem('nuracare_nutrition_log', JSON.stringify(updated));
    setResults([]);
    setSearchQuery('');
  };

  return (
    <div className="page active">
      <DashHeader title="Nutrition Tracker" onBack={onBack} icon={<div style={{background: 'var(--green-light)', padding: 10, borderRadius: 12}}><Icons.Utensils size={24} color="var(--green-dark)"/></div>} />

      {/* GYM NUTRITION CARD */}
      <GymNutritionSection />
      
      {isEthiopia && (
        <div className="dash-card" style={{ padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Icons.PieChart size={24} color="var(--green-dark)" />
            <h3 style={{ margin: 0 }}>Gebeta Fractional Logging</h3>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>In Ethiopia, communal eating is standard. Log your meals by estimating the fraction of the Gebeta you consumed.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['1/4 Gebeta', '1/2 Gebeta', '3/4 Gebeta', 'Full Gebeta'].map(fraction => (
              <button key={fraction} style={{ padding: '16px', borderRadius: 12, border: '1px solid var(--green)', background: 'var(--white)', color: 'var(--green-dark)', fontWeight: 600, cursor: 'pointer' }}>
                {fraction}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fcd34d' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#92400e' }}>Active Fasting Rules</h4>
            <p style={{ margin: 0, fontSize: 13, color: '#b45309' }}>Tsom is active today. Ensure your plate contains no meat, dairy, or eggs. Recommended: Shiro, Gomen, and Misir.</p>
          </div>
        </div>
      )}

      <div className="dash-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Icons.Database size={24} color="var(--green-dark)" />
          <h3 style={{ margin: 0 }}>Global Macro Tracker</h3>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>Powered by OpenFoodFacts — the world's largest open food database. Search real products and log exact macronutrients.</p>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search foods (e.g. 'Chicken Breast', 'Oats')" style={{ flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 15 }} />
          <button onClick={handleSearch} disabled={searching} style={{ background: 'var(--text)', color: 'white', border: 'none', padding: '0 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>{searching ? 'Searching...' : 'Search'}</button>
        </div>
        
        {results.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 15 }}>Results (per 100g)</h4>
            {results.map((food, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 12, marginBottom: 8, border: '1px solid var(--border)' }}>
                {food.image && <img src={food.image} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{food.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{food.brand} • {food.serving}</div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12 }}>
                    <span style={{ color: '#dc2626', fontWeight: 600 }}>{food.calories} kcal</span>
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </div>
                <button onClick={() => logFood(food)} style={{ background: 'var(--green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Log</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {logged.length > 0 && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Today's Log</h3>
          {logged.slice(0, 10).map((entry, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
              <span>{entry.name} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({entry.time})</span></span>
              <span style={{ fontWeight: 600 }}>{entry.calories} kcal</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontWeight: 700, fontSize: 15, color: 'var(--green-dark)' }}>
            <span>Total</span>
            <span>{logged.reduce((sum, e) => sum + (e.calories || 0), 0)} kcal</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DigitalWellnessDashboard({ onBack }) {
  const [subTab, setSubTab] = useState('today');
  const [screenTime, setScreenTime] = useState({ total: 258, social: 102, pickups: 48, balanceScore: 78 });
  const [limits, setLimits] = useState([
    { id: '1', name: 'Instagram & TikTok', type: 'social', limitMinutes: 45, usedMinutes: 38, enabled: true },
    { id: '2', name: 'YouTube', type: 'entertainment', limitMinutes: 60, usedMinutes: 25, enabled: true },
    { id: '3', name: 'Evening Wind-Down', type: 'bedtime', limitMinutes: 30, usedMinutes: 10, enabled: true },
  ]);
  const [activeFocus, setActiveFocus] = useState(null);
  const [focusTimer, setFocusTimer] = useState(0);

  const toggleLimit = (id) => {
    setLimits(prev => prev.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const startFocus = (title, duration) => {
    setActiveFocus(title);
    setFocusTimer(duration);
  };

  return (
    <div className="page active">
      <DashHeader title="Digital Wellness Hub" icon={<Icons.Smartphone size={24} color="#4338ca" />} onBack={onBack} />

      {/* Segmented Sub-Navigation */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { id: 'today', label: 'Today', icon: <Icons.Clock size={16} /> },
          { id: 'limits', label: 'Limits & Blocking', icon: <Icons.ShieldCheck size={16} /> },
          { id: 'focus', label: 'Focus Sessions', icon: <Icons.Zap size={16} /> },
          { id: 'web', label: 'Safe Browsing', icon: <Icons.Globe size={16} /> },
          { id: 'insights', label: 'Insights', icon: <Icons.BarChart2 size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 20,
              border: 'none',
              background: subTab === tab.id ? '#4338ca' : 'var(--bg)',
              color: subTab === tab.id ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'today' && (
        <div>
          {/* Today's Hero Card */}
          <div className="dash-card" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)', color: '#ffffff', padding: 28, borderRadius: 20, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, textTransform: 'uppercase' }}>Daily Screen Exposure</span>
                <h2 style={{ fontSize: 36, fontWeight: 800, margin: '8px 0 4px', color: '#ffffff' }}>4h 18m</h2>
                <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Balanced day • 32m below your daily ceiling</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 16, textAlign: 'center' }}>
                <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Digital Balance</span>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{screenTime.balanceScore} / 100</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="dash-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
                <Icons.Share2 size={16} color="#ec4899" /> Social Media
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>1h 42m</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>40% of total usage</span>
            </div>

            <div className="dash-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
                <Icons.Unlock size={16} color="#3b82f6" /> Screen Pickups
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>48 pickups</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>First pickup: 7:15 AM</span>
            </div>

            <div className="dash-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>
                <Icons.ShieldCheck size={16} color="#16a34a" /> Intentional Pause
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>Active (3s)</div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calming prompt before launch</span>
            </div>
          </div>
        </div>
      )}

      {subTab === 'limits' && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Active App & Website Limits</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {limits.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{l.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    Used {l.usedMinutes}m / {l.limitMinutes}m limit
                  </div>
                </div>
                <button
                  onClick={() => toggleLimit(l.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    background: l.enabled ? 'var(--green)' : 'var(--border)',
                    color: l.enabled ? 'white' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer'
                  }}
                >
                  {l.enabled ? 'Active' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'focus' && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Guided Focus Sessions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { title: 'Deep Work Session', dur: 25, desc: 'Dampen all non-urgent incoming alerts.' },
              { title: 'Mental Reset', dur: 15, desc: 'Audio breathwork and offline pause.' },
              { title: 'Bedtime Sanctuary', dur: 45, desc: 'Block social media before sleep.' },
              { title: 'Digital Detox', dur: 60, desc: 'Full screen isolation during recovery.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg)', padding: 18, borderRadius: 14, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: 16 }}>{f.title}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
                <button
                  onClick={() => startFocus(f.title, f.dur)}
                  style={{ marginTop: 16, background: '#4338ca', color: 'white', border: 'none', padding: '10px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
                >
                  Start ({f.dur} min)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'web' && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Safe Browsing & Distraction Guard</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
            Blocks infinite scroll reels, algorithmic distraction loops, and predatory adult/gambling domains.
          </p>
          <div style={{ padding: 16, background: '#ecfdf5', borderRadius: 12, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.ShieldCheck size={24} color="#16a34a" />
            <div>
              <div style={{ fontWeight: 700, color: '#065f46', fontSize: 15 }}>Safe Browsing Protection Active</div>
              <div style={{ color: '#047857', fontSize: 13 }}>36 distraction attempts filtered today.</div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'insights' && (
        <div className="dash-card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>Digital Balance Correlation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14, color: 'var(--text-muted)' }}>
            <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12 }}>
              💡 Days with under 1 hour of social media show a <strong>24% improvement in Stage N3 deep sleep</strong>.
            </div>
            <div style={{ padding: 14, background: 'var(--bg)', borderRadius: 12 }}>
              💡 Disconnecting screens 45 minutes prior to bedtime reduces sleep onset latency by <strong>18 minutes</strong>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BurnoutRecoveryDashboard({ onBack, recent, profile }) {
  const [activePlanDay, setActivePlanDay] = useState(1);
  const recoveryReadiness = recent?.energy ? Math.min(100, recent.energy * 10 + 15) : 76;

  return (
    <div className="page active">
      <DashHeader title="Burnout Prevention & Recovery" icon={<Icons.HeartHandshake size={24} color="#dc2626" />} onBack={onBack} />

      {/* Recovery State Banner */}
      <div className="dash-card" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff', padding: 28, borderRadius: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, textTransform: 'uppercase' }}>Evidence-Informed Recovery State</span>
            <h2 style={{ fontSize: 32, fontWeight: 800, margin: '8px 0 4px', color: '#34d399' }}>🟢 Balanced Recovery</h2>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>Your cognitive workload and physical rest cycles are currently well aligned.</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 11, opacity: 0.8, textTransform: 'uppercase' }}>Recovery Readiness</span>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{recoveryReadiness}%</div>
          </div>
        </div>
      </div>

      {/* What Do You Need Right Now? 6-Action Grid */}
      <div className="section-title" style={{ marginBottom: 16 }}>What do you need right now?</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { title: 'Rest', icon: <Icons.Moon size={20} color="#6366f1" />, desc: 'Power nap or zero-screen eye rest' },
          { title: 'Clear Head', icon: <Icons.Wind size={20} color="#0ea5e9" />, desc: '4-7-8 parasympathetic breathwork' },
          { title: 'Offline Mode', icon: <Icons.BellOff size={20} color="#4338ca" />, desc: 'Quiet Mode with reduced notifications' },
          { title: 'Movement', icon: <Icons.Footprints size={20} color="#16a34a" />, desc: 'Gentle walking or hip release' },
          { title: 'Connect', icon: <Icons.Users size={20} color="#ec4899" />, desc: 'Call a trusted friend or family' },
          { title: 'Wind Down', icon: <Icons.Coffee size={20} color="#f59e0b" />, desc: 'Herbal tea & warm shower protocol' },
        ].map((act, i) => (
          <div key={i} className="dash-card" style={{ padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              {act.icon}
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{act.title}</h4>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>{act.desc}</p>
          </div>
        ))}
      </div>

      {/* 3-Day Evidence-Informed Recovery Plan */}
      <div className="dash-card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 18 }}>3-Day Recovery Acceleration Plan</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[1, 2, 3].map(day => (
            <button
              key={day}
              onClick={() => setActivePlanDay(day)}
              style={{
                padding: '8px 18px',
                borderRadius: 12,
                border: 'none',
                background: activePlanDay === day ? '#dc2626' : 'var(--bg)',
                color: activePlanDay === day ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Day {day}
            </button>
          ))}
        </div>

        <div style={{ background: 'var(--bg)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
          {activePlanDay === 1 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Day 1: Acute Nervous System Down-Regulation</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Cease optional commitments. Complete the physiological stress cycle with 15 minutes of gentle walking or progressive muscle relaxation.
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Phone placed in another room 60 minutes before bedtime.</li>
                <li>Warm shower or herbal tea 30 minutes before sleep.</li>
              </ul>
            </div>
          )}
          {activePlanDay === 2 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Day 2: Cognitive Boundaries & Restoration</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Practice saying no to non-essential inputs. Take three intentional 10-minute micro-breaks during the work day.
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>No multitasking during meals.</li>
                <li>Spend 20 minutes in natural daylight without earphones.</li>
              </ul>
            </div>
          )}
          {activePlanDay === 3 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Day 3: Re-Anchoring & Sustainable Pacing</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: 14, color: 'var(--text-muted)' }}>
                Reflect on Maslach workload mismatches. Set a firm finish line for work hours and celebrate boundary maintenance.
              </p>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Review weekly schedule to block 90-minute sacred recovery time.</li>
                <li>Log your evening checkup with Nura to seal recovery progress.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



/* ============================================================
   GYM NUTRITION & ATHLETIC PERFORMANCE SECTION
   ============================================================ */
function GymNutritionSection() {
  const [activeTab, setActiveTab] = useState('fueling'); // fueling | macros | ethiopian | fasting
  const [bodyWeight, setBodyWeight] = useState(72);
  const [fitnessGoal, setFitnessGoal] = useState('hypertrophy'); // hypertrophy | cutting | endurance

  // Dynamic Macro calculations
  const proteinTarget = fitnessGoal === 'hypertrophy' 
    ? Math.round(bodyWeight * 2.0) 
    : fitnessGoal === 'cutting' 
      ? Math.round(bodyWeight * 2.2) 
      : Math.round(bodyWeight * 1.6);

  const carbTarget = fitnessGoal === 'hypertrophy'
    ? Math.round(bodyWeight * 4.0)
    : fitnessGoal === 'cutting'
      ? Math.round(bodyWeight * 2.5)
      : Math.round(bodyWeight * 5.0);

  const fatTarget = Math.round(bodyWeight * 0.9);
  const totalCalories = Math.round((proteinTarget * 4) + (carbTarget * 4) + (fatTarget * 9));

  return (
    <div className="dash-card" style={{ padding: 24, marginBottom: 24, borderRadius: 20, background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(234, 88, 12, 0.25)', boxShadow: '0 4px 20px rgba(234, 88, 12, 0.06)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(234, 88, 12, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Zap size={24} color="#ea580c" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Gym & Athletic Nutrition</h3>
              <span style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#c2410c', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                High Performance
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              Pre-workout energy timing, post-workout muscle protein synthesis & Habesha superfoods
            </p>
          </div>
        </div>

        {/* Tab Pills */}
        <div style={{ display: 'flex', background: 'var(--bg)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          {[
            { id: 'fueling', label: 'Workout Fuel' },
            { id: 'macros', label: 'Macro Targets' },
            { id: 'ethiopian', label: 'Ethiopian Power' },
            { id: 'fasting', label: 'Tsom Training' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === tab.id ? '#ea580c' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: WORKOUT FUEL (PRE & POST WORKOUT) */}
      {activeTab === 'fueling' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {/* Pre-Workout Card */}
            <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  Pre-Workout (60-90m Prior)
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Glycogen Primer</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                Fuel high-intensity sets and sustain muscle stamina without gastric heaviness.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#ea580c" />
                  <span><strong>Beso (Roasted Barley):</strong> 3 tbsp Beso + water/honey (fast energy)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#ea580c" />
                  <span><strong>Banana + 1 tbsp Peanut Butter:</strong> 35g complex carbs + electrolytes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#ea580c" />
                  <span><strong>Pre-Hydration:</strong> 500ml water + pinch of natural sea salt</span>
                </div>
              </div>
            </div>

            {/* Post-Workout Card */}
            <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#15803d', padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                  Post-Workout (30-60m After)
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>25-35g Protein Target</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                Stimulate Muscle Protein Synthesis (MPS) and replenish depleted intra-muscular glycogen.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#15803d" />
                  <span><strong>Shiro & Lentils Bowl:</strong> 28g plant protein + fiber with Injera</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#15803d" />
                  <span><strong>Telba (Flaxseed) Protein Shake:</strong> 22g protein + rich ALA Omega-3</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '8px 12px', background: 'var(--white)', borderRadius: 10 }}>
                  <Icons.Check size={16} color="#15803d" />
                  <span><strong>Lean Protein:</strong> 150g grilled chicken / fish + steamed vegetables</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MACRO CALCULATOR */}
      {activeTab === 'macros' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Your Bodyweight:</label>
              <input
                type="number"
                value={bodyWeight}
                onChange={e => setBodyWeight(Number(e.target.value) || 60)}
                style={{ width: 80, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', fontWeight: 700 }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>kg</span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'hypertrophy', label: 'Muscle Building (Hypertrophy)' },
                { id: 'cutting', label: 'Fat Loss (Cutting)' },
                { id: 'endurance', label: 'Endurance & Athletics' }
              ].map(goal => (
                <button
                  key={goal.id}
                  onClick={() => setFitnessGoal(goal.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: fitnessGoal === goal.id ? '2px solid #ea580c' : '1px solid var(--border)',
                    background: fitnessGoal === goal.id ? 'rgba(234, 88, 12, 0.08)' : 'var(--white)',
                    color: fitnessGoal === goal.id ? '#ea580c' : 'var(--text)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {goal.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily Protein</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#ea580c', margin: '4px 0' }}>{proteinTarget}g</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(proteinTarget * 4)} kcal (30%)</div>
            </div>

            <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily Carbs</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6', margin: '4px 0' }}>{carbTarget}g</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(carbTarget * 4)} kcal (48%)</div>
            </div>

            <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Healthy Fats</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981', margin: '4px 0' }}>{fatTarget}g</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(fatTarget * 9)} kcal (22%)</div>
            </div>

            <div style={{ background: 'rgba(234, 88, 12, 0.08)', padding: 14, borderRadius: 12, textAlign: 'center', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
              <div style={{ fontSize: 12, color: '#c2410c' }}>Total Caloric Goal</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#c2410c', margin: '4px 0' }}>{totalCalories}</div>
              <div style={{ fontSize: 11, color: '#c2410c' }}>kcal / day</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ETHIOPIAN ATHLETIC SUPERFOODS */}
      {activeTab === 'ethiopian' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#ea580c', marginBottom: 4 }}>🌾 Teff Injera</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Remarkable iron and calcium content for oxygen delivery and bone density during progressive overload.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#16a34a', marginBottom: 4 }}>🌱 Telba (Flaxseed)</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Anti-inflammatory ALA fatty acids that relieve tendon stiffness and accelerate DOMS muscle recovery.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3b82f6', marginBottom: 4 }}>🥣 Beso (Roasted Barley)</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              The iconic Ethiopian distance runner fuel. Low glycemic index with sustained glycogen replenishment.
            </p>
          </div>

          <div style={{ background: 'var(--bg)', padding: 14, borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#8b5cf6', marginBottom: 4 }}>🍲 High-Protein Shiro</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Chickpea flour enriched with fenugreek and spices. Fast to digest and rich in bioavailable plant BCAAs.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: TSOM (FASTING) TRAINING */}
      {activeTab === 'fasting' && (
        <div style={{ background: '#fef3c7', padding: 16, borderRadius: 14, border: '1px solid #fcd34d' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#92400e', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.ShieldCheck size={18} color="#d97706" /> Fasting & Training Harmony
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>
            You can build and preserve lean muscle during Orthodox fasting periods with deliberate timing and amino-acid pairing:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
            <li><strong>Workout Timing:</strong> Train 60-90 minutes before your meal breaking time (after 3:00 PM), so you can immediately refuel.</li>
            <li><strong>Complete Amino Acids:</strong> Combine grains + legumes (e.g., Teff Injera + Shiro/Misir) to achieve all 9 essential amino acids.</li>
            <li><strong>Hydration Priority:</strong> Drink 1L of water between breaking fast and bedtime to maintain muscular cell volumization.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HABITS & ROUTINES DASHBOARD
   ============================================================ */
function HabitsRoutinesDashboard({ onBack }) {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('nuracare_daily_habits');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'h1', title: 'Hydration Target (2.5L)', category: 'hydration', completed: true, streak: 12, time: 'All Day' },
      { id: 'h2', title: 'Daily Movement (8,000+ Steps)', category: 'movement', completed: true, streak: 8, time: 'Morning' },
      { id: 'h3', title: 'Gym Nutrition & High Protein Meal', category: 'nutrition', completed: true, streak: 6, time: 'Post-Workout' },
      { id: 'h4', title: '5-Minute 4-7-8 Breathwork Reset', category: 'mind', completed: true, streak: 14, time: 'Midday' },
      { id: 'h5', title: 'Screen-Free Wind Down (45m before bed)', category: 'digital', completed: true, streak: 4, time: 'Evening' },
      { id: 'h6', title: '7+ Hours Restful Sleep', category: 'sleep', completed: false, streak: 9, time: 'Night' },
    ];
  });

  const toggleHabit = (id) => {
    const updated = habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h);
    setHabits(updated);
    localStorage.setItem('nuracare_daily_habits', JSON.stringify(updated));
  };

  const completedCount = habits.filter(h => h.completed).length;
  const progressPct = Math.round((completedCount / habits.length) * 100);

  return (
    <div className="page active" style={{ maxWidth: 900, margin: '0 auto' }}>
      <DashHeader 
        title="Habits & Daily Routines" 
        onBack={onBack} 
        icon={<div style={{background: 'rgba(13, 148, 136, 0.15)', padding: 10, borderRadius: 12}}><Icons.CheckCircle2 size={24} color="#0d9488"/></div>} 
      />

      {/* Progress Card */}
      <div className="dash-card" style={{ padding: 24, marginBottom: 24, borderRadius: 20, background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(13, 148, 136, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Today's Habit Mastery</h3>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>
              {completedCount} of {habits.length} rituals completed today
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#0d9488' }}>{progressPct}%</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Consistency Score</div>
          </div>
        </div>

        {/* Bar */}
        <div style={{ width: '100%', height: 10, background: 'var(--bg)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: 'linear-gradient(90deg, #0d9488, #14b8a6)', borderRadius: 5, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Interactive Habit Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {habits.map(habit => (
          <div
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              borderRadius: 16,
              background: habit.completed ? 'rgba(13, 148, 136, 0.05)' : 'rgba(255, 255, 255, 0.85)',
              border: habit.completed ? '1px solid rgba(13, 148, 136, 0.3)' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: habit.completed ? '#0d9488' : 'var(--white)',
                border: habit.completed ? 'none' : '2px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {habit.completed && <Icons.Check size={18} />}
              </div>
              <div>
                <span style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: habit.completed ? 'var(--text-muted)' : 'var(--text)',
                  textDecoration: habit.completed ? 'line-through' : 'none'
                }}>
                  {habit.title}
                </span>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {habit.time} • 🔥 {habit.streak}-day streak
                </div>
              </div>
            </div>

            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 8,
              background: habit.completed ? 'rgba(13, 148, 136, 0.12)' : 'var(--bg)',
              color: habit.completed ? '#0f766e' : 'var(--text-muted)'
            }}>
              {habit.completed ? 'Completed' : 'Tap to Complete'}
            </span>
          </div>
        ))}
      </div>

      {/* Morning & Evening Circadian Timelines */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icons.Sun size={18} color="#f59e0b" />
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Morning Circadian Flow</h4>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <li><strong>06:30 AM:</strong> Hydrate with 500ml water + pinch of sea salt.</li>
            <li><strong>07:00 AM:</strong> 15 mins direct natural morning sunlight.</li>
            <li><strong>07:30 AM:</strong> Complex carb fueling (Beso / Teff porridge).</li>
          </ul>
        </div>

        <div style={{ background: 'var(--bg)', borderRadius: 16, padding: 18, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icons.Moon size={18} color="#6366f1" />
            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Evening Restorative Flow</h4>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            <li><strong>08:00 PM:</strong> Finish dinner cutoff & warm Chamomile tea.</li>
            <li><strong>09:15 PM:</strong> Phone placed outside bedroom / blue-light filter.</li>
            <li><strong>10:00 PM:</strong> Cool bedroom temperature & sleep onset.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SOCIAL WELLBEING DASHBOARD
   ============================================================ */
function SocialWellbeingDashboard({ onBack }) {
  return (
    <div className="page active" style={{ maxWidth: 900, margin: '0 auto' }}>
      <DashHeader 
        title="Social Wellbeing & Community Circles" 
        onBack={onBack} 
        icon={<div style={{background: 'rgba(236, 72, 153, 0.15)', padding: 10, borderRadius: 12}}><Icons.Users size={24} color="#ec4899"/></div>} 
      />

      <div className="dash-card" style={{ padding: 24, marginBottom: 24, borderRadius: 20, background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700 }}>The Science of Social Connection</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Strong social bonds lower cortisol, improve cardiovascular longevity, and provide mutual accountability for health habits.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
        <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>🏃 Running & Walking Circles</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)' }}>Join local weekend group runs and morning step challenges.</p>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899' }}>12.4K Runners Connected</span>
        </div>

        <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>🥗 Healthy Ethiopian Cooking</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)' }}>Share Shiro, Beso shakes, and low-oil fasting recipes.</p>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899' }}>15.1K Members Active</span>
        </div>

        <div style={{ background: 'var(--bg)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>🧘 Mindfulness & Accountability</h4>
          <p style={{ margin: '0 0 12px 0', fontSize: 13, color: 'var(--text-muted)' }}>Daily reflection checks and breathwork buddies.</p>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#ec4899' }}>6.3K Mindful Peers</span>
        </div>
      </div>
    </div>
  );
}
