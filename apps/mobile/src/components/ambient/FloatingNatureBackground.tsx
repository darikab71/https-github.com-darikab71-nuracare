import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
let Audio: any = null;
try {
  Audio = require('expo-av')?.Audio;
} catch (e) {
  // Safe fallback if expo-av is not linked in native build
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingNatureBackgroundProps {
  children?: React.ReactNode;
  showSoundToggle?: boolean;
  intensity?: 'gentle' | 'vibrant';
}

/**
 * Website's Exact Emerald Gradient Vector Leaf
 */
const WebLeafSVG = ({ size = 26, id = 0 }: { size?: number; id?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id={`leaf-grad-${id}`} x1="4" y1="2" x2="20" y2="22">
        <Stop offset="0" stopColor="#86EFAC" />
        <Stop offset="1" stopColor="#22C55E" />
      </LinearGradient>
    </Defs>
    <Path
      d="M12 2C7.5 2 4 5.5 4 10C4 16 12 22 12 22C12 22 20 16 20 10C20 5.5 16.5 2 12 2Z"
      fill={`url(#leaf-grad-${id})`}
    />
    <Path
      d="M12 22C12 10 12 2 12 2"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <Path
      d="M12 12C9 8 7 6 8 4"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth={0.8}
      strokeLinecap="round"
    />
  </Svg>
);

const LEAF_COUNT = 8;

export default function FloatingNatureBackground({
  children,
}: FloatingNatureBackgroundProps) {
  // Leaf animations - 8 floating leaves with unique coordinates and drift
  const leavesAnim = useRef(
    Array.from({ length: LEAF_COUNT }).map(() => ({
      translateY: new Animated.Value(SCREEN_HEIGHT + 20),
      translateX: new Animated.Value(Math.random() * SCREEN_WIDTH),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(0.3 + Math.random() * 0.5),
      size: 20 + Math.floor(Math.random() * 14),
    }))
  ).current;

  // Air breeze stream animations
  const windAnim1 = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const windAnim2 = useRef(new Animated.Value(-SCREEN_WIDTH * 1.5)).current;
  const windOpacity = useRef(new Animated.Value(0.25)).current;

  // Ambient sound ref
  const soundRef = useRef<Audio.Sound | null>(null);

  // Initialize and loop leaf & air breeze animations
  useEffect(() => {
    let isMounted = true;
    const timers: any[] = [];

    // 1. Vector Leaves Floating Animation
    leavesAnim.forEach((leaf, idx) => {
      const duration = 9000 + (idx * 2000);
      const delay = idx * 900;

      const animateLeaf = () => {
        if (!isMounted) return;
        leaf.translateY.setValue(SCREEN_HEIGHT + 30);
        leaf.translateX.setValue((idx * (SCREEN_WIDTH / LEAF_COUNT)) + (Math.random() * 30 - 15));

        Animated.parallel([
          Animated.timing(leaf.translateY, {
            toValue: -50,
            duration,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.sequence([
            Animated.timing(leaf.rotate, {
              toValue: 1,
              duration: duration / 2,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(leaf.rotate, {
              toValue: 2,
              duration: duration / 2,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished && isMounted) animateLeaf();
        });
      };

      const timer = setTimeout(() => animateLeaf(), delay);
      timers.push(timer);
    });

    // 2. Air / Wind Breeze Flow Animation
    const animateWind = () => {
      if (!isMounted) return;
      windAnim1.setValue(-SCREEN_WIDTH);
      windAnim2.setValue(-SCREEN_WIDTH * 1.5);

      Animated.parallel([
        Animated.timing(windAnim1, {
          toValue: SCREEN_WIDTH * 1.2,
          duration: 9000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(windAnim2, {
          toValue: SCREEN_WIDTH * 1.5,
          duration: 12000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.sequence([
          Animated.timing(windOpacity, { toValue: 0.5, duration: 4500, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(windOpacity, { toValue: 0.15, duration: 4500, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start(({ finished }) => {
        if (finished && isMounted) animateWind();
      });
    };

    animateWind();

    return () => {
      isMounted = false;
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  // Ambient sound always on in background
  useEffect(() => {
    let isMounted = true;

    async function initSound() {
      try {
        if (!Audio?.Sound) return;
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/530/530697_11234978-lq.mp3' },
          { isLooping: true, volume: 0.3, shouldPlay: true }
        );

        if (isMounted) {
          soundRef.current = sound;
          await sound.playAsync().catch(() => {});
        } else {
          await sound.unloadAsync().catch(() => {});
        }
      } catch (err) {
        // Safe non-blocking fallback
      }
    }

    initSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Calm Base */}
      <View style={styles.calmBase} />

      {/* Flowing Air / Wind Stream 1 */}
      <Animated.View
        style={[
          styles.windLineWrap,
          {
            top: 130,
            opacity: windOpacity,
            transform: [{ translateX: windAnim1 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.5} height={60} viewBox="0 0 500 60">
          <Path
            d="M 0 30 Q 120 5 250 30 T 500 30"
            fill="none"
            stroke="rgba(34, 197, 94, 0.22)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Flowing Air / Wind Stream 2 */}
      <Animated.View
        style={[
          styles.windLineWrap,
          {
            top: 350,
            opacity: windOpacity,
            transform: [{ translateX: windAnim2 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.8} height={80} viewBox="0 0 600 80">
          <Path
            d="M 0 40 Q 150 70 300 40 T 600 40"
            fill="none"
            stroke="rgba(16, 185, 129, 0.18)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Website's Exact Floating Vector Leaves */}
      {leavesAnim.map((leaf, idx) => {
        const spin = leaf.rotate.interpolate({
          inputRange: [0, 1, 2],
          outputRange: ['0deg', '180deg', '360deg'],
        });

        return (
          <Animated.View
            key={idx}
            pointerEvents="none"
            style={[
              styles.leaf,
              {
                opacity: leaf.opacity,
                transform: [
                  { translateX: leaf.translateX },
                  { translateY: leaf.translateY },
                  { rotate: spin },
                ],
              },
            ]}
          >
            <WebLeafSVG size={leaf.size} id={idx} />
          </Animated.View>
        );
      })}

      {/* Child Content */}
      <View style={styles.contentWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  calmBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8fafc',
  },
  windLineWrap: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  leaf: {
    position: 'absolute',
    zIndex: 2,
  },
  contentWrap: {
    flex: 1,
    zIndex: 10,
  },
});
