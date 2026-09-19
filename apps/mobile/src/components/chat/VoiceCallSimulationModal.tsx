import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

interface VoiceCallSimulationModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenChat: () => void;
  characterName?: string;
}

export default function VoiceCallSimulationModal({
  visible,
  onClose,
  onOpenChat,
  characterName = 'Nura',
}: VoiceCallSimulationModalProps) {
  const { theme, isDark } = useTheme();
  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [captionIndex, setCaptionIndex] = useState(0);

  // Animation values
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.6)).current;
  const waveAnim3 = useRef(new Animated.Value(0.9)).current;
  const waveAnim4 = useRef(new Animated.Value(0.4)).current;
  const waveAnim5 = useRef(new Animated.Value(0.7)).current;

  const captions = [
    `"Hello! I'm ${characterName}. How is your body feeling right now?"`,
    `"I see your biological recovery balance is steady today."`,
    `"Remember to relax your shoulders and take a slow, deep breath."`,
    `"I'm here whenever you need guidance or want to reflect on your wellness."`,
  ];

  // Call timer and connection simulation
  useEffect(() => {
    let timer: any = null;
    let connectTimeout: any = null;
    let captionInterval: any = null;

    if (visible) {
      setCallStatus('ringing');
      setSeconds(0);
      setCaptionIndex(0);

      // Connect after 1.8 seconds
      connectTimeout = setTimeout(() => {
        setCallStatus('connected');
      }, 1800);

      // Duration counter
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);

      // Rotate simulated voice captions
      captionInterval = setInterval(() => {
        setCaptionIndex((prev) => (prev + 1) % captions.length);
      }, 4500);

      // Pulse animation loops for avatar soundwaves
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim1, {
              toValue: 1.35,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim1, {
              toValue: 1,
              duration: 1600,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.55,
              duration: 2200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 2200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Waveform bars loop
      const waveLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, { toValue: 1, duration: 350, useNativeDriver: false }),
            Animated.timing(waveAnim1, { toValue: 0.2, duration: 350, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim2, { toValue: 0.2, duration: 420, useNativeDriver: false }),
            Animated.timing(waveAnim2, { toValue: 1, duration: 420, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim3, { toValue: 0.9, duration: 300, useNativeDriver: false }),
            Animated.timing(waveAnim3, { toValue: 0.3, duration: 300, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim4, { toValue: 0.3, duration: 480, useNativeDriver: false }),
            Animated.timing(waveAnim4, { toValue: 0.85, duration: 480, useNativeDriver: false }),
          ]),
          Animated.sequence([
            Animated.timing(waveAnim5, { toValue: 1, duration: 390, useNativeDriver: false }),
            Animated.timing(waveAnim5, { toValue: 0.25, duration: 390, useNativeDriver: false }),
          ]),
        ])
      );

      pulseLoop.start();
      waveLoop.start();
    }

    return () => {
      if (timer) clearInterval(timer);
      if (connectTimeout) clearTimeout(connectTimeout);
      if (captionInterval) clearInterval(captionInterval);
    };
  }, [visible]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setCallStatus('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleEndCall}>
      <View style={styles.backdrop}>
        <View style={[styles.callCard, { backgroundColor: theme.surfaceModal, borderColor: theme.border, borderWidth: 1 }]}>
          {/* Top Security Pill */}
          <View style={[styles.securityPill, { backgroundColor: theme.accentGlow, borderColor: theme.accentSecondary + '40' }]}>
            <ShieldCheck size={13} color="#16a34a" />
            <Text style={styles.securityPillText}>Private AI Health Companion Session</Text>
          </View>

          {/* Avatar with Pulsing Audio Aura */}
          <View style={styles.avatarStage}>
            {callStatus === 'connected' && (
              <>
                <Animated.View
                  style={[
                    styles.pulsingRing,
                    styles.ringOuter,
                    { transform: [{ scale: pulseAnim2 }] },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.pulsingRing,
                    styles.ringInner,
                    { transform: [{ scale: pulseAnim1 }] },
                  ]}
                />
              </>
            )}

            <View style={styles.avatarCircle}>
              <Image
                source={require('../../../assets/avatars/nura_avatar.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Caller Details */}
          <Text style={[styles.callerName, { color: theme.textPrimary }]}>{characterName}</Text>
          <Text style={[styles.callStatusText, { color: theme.textSecondary }]}>
            {callStatus === 'ringing'
              ? 'Connecting voice channel...'
              : callStatus === 'ended'
              ? 'Call Ended'
              : `Connected • ${formatTimer(seconds)}`}
          </Text>

          {/* Live Voice Audio Waveform Equalizer */}
          {callStatus === 'connected' && (
            <View style={styles.waveformRow}>
              {[waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5].map((anim, idx) => (
                <Animated.View
                  key={idx}
                  style={[
                    styles.waveBar,
                    {
                      backgroundColor: theme.accent,
                      height: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 28],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Subtitle Caption */}
          {callStatus === 'connected' && (
            <View style={[styles.captionBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
              <Sparkles size={14} color={theme.accent} />
              <Text style={[styles.captionText, { color: theme.textPrimary }]}>{captions[captionIndex]}</Text>
            </View>
          )}

          {/* Call Controls */}
          <View style={styles.controlsRow}>
            {/* Mute Mic */}
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: theme.surfaceElevated }, isMuted && { backgroundColor: theme.errorBackground, borderColor: theme.error, borderWidth: 1 }]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.8}
            >
              {isMuted ? <MicOff size={20} color="#dc2626" /> : <Mic size={20} color={theme.textPrimary} />}
              <Text style={[styles.controlBtnLabel, { color: theme.textSecondary }]}>{isMuted ? 'Muted' : 'Mute'}</Text>
            </TouchableOpacity>

            {/* End Call (Primary Red Action) */}
            <TouchableOpacity
              style={styles.endCallBtn}
              onPress={handleEndCall}
              activeOpacity={0.85}
            >
              <PhoneOff size={24} color="#ffffff" />
            </TouchableOpacity>

            {/* Speaker Toggle */}
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: theme.surfaceElevated }, isSpeaker && { backgroundColor: theme.accentDeep, borderColor: theme.accent, borderWidth: 1 }]}
              onPress={() => setIsSpeaker(!isSpeaker)}
              activeOpacity={0.8}
            >
              {isSpeaker ? <Volume2 size={20} color={theme.accent} /> : <VolumeX size={20} color={theme.textTertiary} />}
              <Text style={[styles.controlBtnLabel, { color: theme.textSecondary }]}>{isSpeaker ? 'Speaker' : 'Earpiece'}</Text>
            </TouchableOpacity>
          </View>

          {/* Switch to Text Chat button */}
          <TouchableOpacity
            style={styles.switchToChatBtn}
            onPress={() => {
              onClose();
              onOpenChat();
            }}
            activeOpacity={0.85}
          >
            <MessageSquare size={16} color={theme.accent} />
            <Text style={[styles.switchToChatText, { color: theme.accent }]}>Switch to Text Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  callCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
    marginBottom: 24,
  },
  securityPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a',
  },
  avatarStage: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  pulsingRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 2,
  },
  ringInner: {
    width: 110,
    height: 110,
    borderColor: 'rgba(34, 197, 94, 0.35)',
    backgroundColor: 'rgba(240, 253, 244, 0.3)',
  },
  ringOuter: {
    width: 130,
    height: 130,
    borderColor: 'rgba(34, 197, 94, 0.18)',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  callerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  callStatusText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 16,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    marginBottom: 16,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: '#16a34a',
  },
  captionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
    maxWidth: 320,
  },
  captionText: {
    fontSize: 13,
    color: '#334155',
    fontStyle: 'italic',
    lineHeight: 18,
    flex: 1,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 20,
    width: '100%',
  },
  controlBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    gap: 2,
  },
  controlBtnActive: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  controlBtnLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  endCallBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  switchToChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchToChatText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
  },
});
