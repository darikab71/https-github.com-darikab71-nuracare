import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  ShieldCheck,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CommunityChallenge, LiveChallengeSession } from '../../types/communityTypes';
import { challengeEngine } from '../../services/challenge/challengeEngine';
import { verificationEngine, ExerciseRepAnalysis } from '../../services/challenge/verificationEngine';

interface ActiveChallengeSessionModalProps {
  visible: boolean;
  challenge: CommunityChallenge;
  onClose: () => void;
  onSessionComplete: (completedSession: LiveChallengeSession) => void;
}

export default function ActiveChallengeSessionModal({
  visible,
  challenge,
  onClose,
  onSessionComplete,
}: ActiveChallengeSessionModalProps) {
  const { theme, isDark } = useTheme();

  // Session State
  const [session, setSession] = useState<LiveChallengeSession | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [validReps, setValidReps] = useState<number>(0);
  const [invalidReps, setInvalidReps] = useState<number>(0);
  const [currentAngle, setCurrentAngle] = useState<number>(175);
  const [phase, setPhase] = useState<'eccentric' | 'concentric' | 'lockout' | 'inflection'>('lockout');
  const [formFeedback, setFormFeedback] = useState<string>('Ready in position');
  const [formScore, setFormScore] = useState<number>(95);
  const [distanceKm, setDistanceKm] = useState<number>(0.0);

  const timerRef = useRef<any>(null);

  const isExercise = challenge.category === 'Fitness' || challenge.category === 'physical';
  const targetReps = challenge.objectives?.[0]?.target || 25;
  const unit = challenge.objectives?.[0]?.unit || (isExercise ? 'reps' : 'mins');

  // Initialize or reset session when opened
  useEffect(() => {
    if (visible) {
      challengeEngine
        .startSession(
          challenge.id,
          challenge.objectives?.[0]?.id || 'obj_1',
          challenge.verificationType || 'camera',
          targetReps,
          'user_me'
        )
        .then((newSession) => {
          setSession(newSession);
          setIsActive(true);
          setElapsedSeconds(0);
          setValidReps(0);
          setInvalidReps(0);
          setDistanceKm(0.0);
          setFormFeedback('AI Pose Tracking Activated');
        });
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsActive(false);
    }
  }, [visible]);

  // Elapsed timer tick
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
        if (!isExercise) {
          // Increment subtle simulated distance for run/walk challenges
          setDistanceKm((prev) => parseFloat((prev + 0.003).toFixed(3)));
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isExercise]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Evaluates simulated rep angle changes (representing pose landmark updates)
   */
  const handlePerformRep = (exerciseType: 'squat' | 'push_up' = 'squat') => {
    if (!isActive) return;

    // Simulate standard movement arc: descent (deep angle) then ascent
    const deepAngle = exerciseType === 'squat' ? 82 : 75; // Passing proper depth
    setCurrentAngle(deepAngle);

    const analysis: ExerciseRepAnalysis = verificationEngine.evaluateExerciseRep(
      exerciseType,
      deepAngle,
      phase
    );

    setPhase(analysis.currentPhase);
    setFormScore(analysis.formScore);
    setFormFeedback(analysis.formFeedback);

    // Complete the rep
    setTimeout(() => {
      setCurrentAngle(175);
      setPhase('lockout');
      if (analysis.isValid) {
        const nextValid = validReps + 1;
        setValidReps(nextValid);
        setFormFeedback('Rep counted! Clean form');
        if (session) {
          challengeEngine.updateSessionReps(session.id, nextValid, invalidReps, analysis.formScore);
        }
      } else {
        const nextInvalid = invalidReps + 1;
        setInvalidReps(nextInvalid);
        setFormFeedback('Partial rep: Increase range of motion');
        if (session) {
          challengeEngine.updateSessionReps(session.id, validReps, nextInvalid, analysis.formScore);
        }
      }
    }, 450);
  };

  const handleFinishSession = () => {
    if (!session) return;
    setIsActive(false);

    challengeEngine.completeSession(session.id, validReps).then(() => {
      challengeEngine.creditRewards('user_me', 60, 150);

      const completedSession: LiveChallengeSession = {
        ...session,
        measurementValue: validReps,
        repsValid: validReps,
        repsInvalid: invalidReps,
        status: 'verified',
        completedAt: new Date().toISOString(),
      };

      onSessionComplete(completedSession);
      Alert.alert(
        'Session Verified & Logged!',
        `Great effort! ${validReps} verified reps completed with ${formScore}% form accuracy.\n+60 Nura Points & +150 XP awarded!`,
        [{ text: 'Continue', onPress: onClose }]
      );
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
          <View style={{ flex: 1 }}>
            <View style={styles.verifiedHeaderBadge}>
              <ShieldCheck size={14} color="#16a34a" />
              <Text style={styles.verifiedBadgeText}>
                {challenge.verificationStrength === 'camera' ? 'Camera Verified Pose AI' : 'Live Verified Session'}
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
              {challenge.title}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}>
            <X size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Main Visual Viewport */}
          <View style={[styles.viewportCard, { backgroundColor: isDark ? '#090d16' : '#0f172a' }]}>
            {/* Overlay Status Bar */}
            <View style={styles.viewportHeader}>
              <View style={styles.liveIndicatorWrap}>
                <View style={[styles.liveDot, { backgroundColor: isActive ? '#ef4444' : '#64748b' }]} />
                <Text style={styles.liveText}>{isActive ? 'LIVE RECORDING' : 'PAUSED'}</Text>
              </View>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>{formatTimer(elapsedSeconds)}</Text>
              </View>
            </View>

            {/* Pose Skeleton Wireframe Visualizer */}
            <View style={styles.skeletonContainer}>
              <Camera size={38} color="#38bdf8" style={styles.cameraIconBg} />

              {/* Graphical Angle Ring */}
              <View style={styles.angleGraphicCircle}>
                <Text style={styles.angleDegreesText}>{currentAngle}°</Text>
                <Text style={styles.angleSubtext}>
                  {phase === 'eccentric' ? 'DESCENT' : phase === 'concentric' ? 'ASCENT' : 'LOCKOUT'}
                </Text>
              </View>

              <Text style={styles.formFeedbackPrompt}>{formFeedback}</Text>
            </View>

            {/* Metrics Bar at bottom of viewport */}
            <View style={styles.viewportFooter}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>VERIFIED</Text>
                <Text style={[styles.metricValue, { color: '#22c55e' }]}>{validReps}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>INVALID</Text>
                <Text style={[styles.metricValue, { color: '#f87171' }]}>{invalidReps}</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>FORM</Text>
                <Text style={[styles.metricValue, { color: '#38bdf8' }]}>{formScore}%</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>TARGET</Text>
                <Text style={[styles.metricValue, { color: '#ffffff' }]}>{targetReps}</Text>
              </View>
            </View>
          </View>

          {/* Real-time Guidance Card */}
          <View style={[styles.guidanceCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
            <View style={styles.guidanceHeader}>
              <Activity size={18} color="#16a34a" />
              <Text style={[styles.guidanceTitle, { color: theme.textPrimary }]}>Movement Form & Integrity</Text>
            </View>
            <Text style={[styles.guidanceBody, { color: theme.textSecondary }]}>
              Position your phone 2 meters away at hip level. Maintain full range of motion. Each rep is certified via real-time geometric landmark analysis.
            </Text>

            {/* Quick Demo / Manual Action for testing */}
            <TouchableOpacity
              style={[styles.repActionBtn, { backgroundColor: theme.accentDeep }]}
              onPress={() => handlePerformRep('squat')}
              activeOpacity={0.85}
            >
              <Zap size={18} color="#ffffff" />
              <Text style={styles.repActionBtnText}>Detect & Complete Rep</Text>
            </TouchableOpacity>
          </View>

          {/* Rewards Preview */}
          <View style={[styles.rewardCard, { backgroundColor: `${theme.accent}12`, borderColor: `${theme.accent}30` }]}>
            <Award size={20} color={theme.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.rewardTitle, { color: theme.textPrimary }]}>Verified Challenge Stakes</Text>
              <Text style={[styles.rewardSubtitle, { color: theme.textSecondary }]}>
                Completing this session advances your rank on the leaderboard and unlocks daily completion points.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: theme.borderSubtle, backgroundColor: theme.surfaceElevated }]}>
          <TouchableOpacity
            style={[styles.pauseBtn, { borderColor: theme.borderSubtle }]}
            onPress={() => setIsActive(!isActive)}
            activeOpacity={0.8}
          >
            {isActive ? <Pause size={20} color={theme.textPrimary} /> : <Play size={20} color={theme.textPrimary} />}
            <Text style={[styles.pauseBtnText, { color: theme.textPrimary }]}>{isActive ? 'Pause' : 'Resume'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.finishBtn, { backgroundColor: '#16a34a' }]}
            onPress={handleFinishSession}
            activeOpacity={0.88}
          >
            <CheckCircle2 size={20} color="#ffffff" />
            <Text style={styles.finishBtnText}>Finish & Verify</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  verifiedHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  viewportCard: {
    borderRadius: 24,
    height: 380,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  viewportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveIndicatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  timerText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  skeletonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconBg: {
    opacity: 0.2,
    marginBottom: 12,
  },
  angleGraphicCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#38bdf8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
  },
  angleDegreesText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
  },
  angleSubtext: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 1,
  },
  formFeedbackPrompt: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 10,
    borderRadius: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  guidanceCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  guidanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  guidanceTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  guidanceBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  repActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
  },
  repActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  rewardCard: {
    marginTop: 14,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  rewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  pauseBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  finishBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
