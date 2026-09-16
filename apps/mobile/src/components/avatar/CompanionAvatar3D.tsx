import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

interface CompanionAvatar3DProps {
  onStartChatTransition?: () => void;
  isTransitioning?: boolean;
}

export default function CompanionAvatar3D({
  onStartChatTransition,
  isTransitioning = false,
}: CompanionAvatar3DProps) {
  const router = useRouter();

  // Selected companion: 'nura' (female) or 'nuri' (male)
  const [character, setCharacter] = useState<'nura' | 'nuri'>('nura');
  const [speechText, setSpeechText] = useState<string | null>(null);

  // Animation values for classic cartoon kinematics
  const breathAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const squashStretchX = useRef(new Animated.Value(1)).current;
  const squashStretchY = useRef(new Animated.Value(1)).current;
  const bounceY = useRef(new Animated.Value(0)).current;

  // Continuous Classic Cartoon Breathing & Sway Loop
  useEffect(() => {
    // Breathing (Chest expansion & slight height rise)
    const breathLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle rhythmic head sway & 3D tilt
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: 3400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    breathLoop.start();
    swayLoop.start();

    return () => {
      breathLoop.stop();
      swayLoop.stop();
    };
  }, []);

  // Tap Interaction: Classic Cartoon Anticipation, Squash & Stretch
  const handleTapAvatar = () => {
    const quotes = character === 'nura' 
      ? [
          "Feeling balanced today!",
          "Remember to take 2 deep breaths.",
          "Your circadian rhythm is on track!",
          "I'm here whenever you need guidance."
        ]
      : [
          "Let's crush that daily movement goal!",
          "Hydration check! Grab a sip of water.",
          "Looking great today, champ!",
          "Ready for an afternoon posture reset?"
        ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    setSpeechText(quote);
    setTimeout(() => setSpeechText(null), 3200);

    // Anticipation (Squash down) -> Explosion (Stretch up) -> Settle
    Animated.sequence([
      // 1. Anticipation squash (wide & flat)
      Animated.parallel([
        Animated.timing(squashStretchX, {
          toValue: 1.15,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(squashStretchY, {
          toValue: 0.88,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: 8,
          duration: 120,
          useNativeDriver: true,
        }),
      ]),
      // 2. High-energy stretch upward
      Animated.parallel([
        Animated.timing(squashStretchX, {
          toValue: 0.90,
          duration: 180,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(squashStretchY, {
          toValue: 1.14,
          duration: 180,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: -16,
          duration: 180,
          useNativeDriver: true,
        }),
      ]),
      // 3. Natural elastic settle
      Animated.parallel([
        Animated.spring(squashStretchX, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(squashStretchY, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(bounceY, {
          toValue: 0,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Interpolations for 3D perspective transforms
  const breathingScaleY = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.03],
  });

  const breathingTranslateY = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const swayRotateZ = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-2.5deg', '2.5deg'],
  });

  const swayRotateY = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  return (
    <View style={styles.container}>
      {/* Dynamic 3D Atmospheric Aura */}
      <View style={styles.atmosphericGlowOuter} />
      <View style={styles.atmosphericGlowInner} />

      {/* Speech Bubble on Tap */}
      {speechText && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechBubbleText}>{speechText}</Text>
          <View style={styles.speechBubblePointer} />
        </View>
      )}

      {/* 3D Character Stage */}
      <TouchableOpacity
        onPress={handleTapAvatar}
        activeOpacity={0.92}
        style={styles.avatarTouchStage}
      >
        <Animated.View
          style={[
            styles.avatarRenderBox,
            {
              transform: [
                { translateY: Animated.add(breathingTranslateY, bounceY) },
                { scaleX: squashStretchX },
                { scaleY: Animated.multiply(squashStretchY, breathingScaleY) },
                { rotateZ: swayRotateZ },
                { perspective: 800 },
                { rotateY: swayRotateY },
              ],
            },
          ]}
        >
          {/* Avatar Image Source (Cut at waist) */}
          <View style={styles.avatarImageWrapper}>
            <Image
              source={
                character === 'nura'
                  ? require('../../../assets/avatars/nura_avatar.jpg')
                  : require('../../../assets/avatars/nuri_avatar.jpg')
              }
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Companion Switcher Pill (Discreet, Elegant Toggle) */}
      <View style={styles.companionSelectorRow}>
        <TouchableOpacity
          style={[
            styles.companionPill,
            character === 'nura' && styles.companionPillActive,
          ]}
          onPress={() => setCharacter('nura')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.companionPillText,
              character === 'nura' && styles.companionPillTextActive,
            ]}
          >
            NURA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.companionPill,
            character === 'nuri' && styles.companionPillActive,
          ]}
          onPress={() => setCharacter('nuri')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.companionPillText,
              character === 'nuri' && styles.companionPillTextActive,
            ]}
          >
            NURI
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 180, // Exactly inside the designated 180px area
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Soft atmospheric green glows
  atmosphericGlowOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  atmosphericGlowInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(187, 247, 208, 0.22)',
  },

  // Touch stage
  avatarTouchStage: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  avatarRenderBox: {
    width: 120,
    height: 126,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImageWrapper: {
    width: 108,
    height: 118,
    borderRadius: 54,
    overflow: 'hidden',
    borderWidth: 2.2,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Speech Bubble
  speechBubble: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 30,
    maxWidth: 200,
  },
  speechBubbleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
    textAlign: 'center',
  },
  speechBubblePointer: {
    position: 'absolute',
    bottom: -5,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#bbf7d0',
    transform: [{ rotate: '45deg' }],
  },

  // Companion Selector Pills
  companionSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(187, 247, 208, 0.7)',
    marginTop: 6,
    zIndex: 20,
  },
  companionPill: {
    paddingHorizontal: 10,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  companionPillActive: {
    backgroundColor: '#16a34a',
  },
  companionPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3,
  },
  companionPillTextActive: {
    color: '#ffffff',
  },
});
