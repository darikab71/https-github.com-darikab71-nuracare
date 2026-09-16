import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
  Line,
  Ellipse,
  Circle,
  G,
} from 'react-native-svg';

let Audio: any = null;
try {
  Audio = require('expo-av')?.Audio;
} catch (e) {
  // Safe fallback if expo-av is not linked
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FloatingNatureBackgroundProps {
  children?: React.ReactNode;
  showSoundToggle?: boolean;
  intensity?: 'gentle' | 'vibrant';
}

/**
 * 1. Realistic botanical leaf SVG with gentle organic curve, stem, and natural branching veins
 */
export const LeafSVG = ({ id }: { id: string | number }) => (
  <Svg width="100%" height="100%" viewBox="0 0 28 32">
    <Defs>
      <SvgLinearGradient id={`lg-${id}`} x1="3" y1="2" x2="25" y2="30">
        <Stop offset="0" stopColor="#4ade80" />
        <Stop offset="0.45" stopColor="#22c55e" />
        <Stop offset="1" stopColor="#15803d" />
      </SvgLinearGradient>
      <SvgLinearGradient id={`stem-${id}`} x1="14" y1="2" x2="14" y2="31">
        <Stop offset="0" stopColor="#bbf7d0" stopOpacity="0.8" />
        <Stop offset="1" stopColor="#166534" stopOpacity="0.9" />
      </SvgLinearGradient>
    </Defs>
    {/* Natural asymmetrical leaf body */}
    <Path
      d="M14 2C19.5 5.5 25 12 24.5 19C24 25.5 18 29.5 14 30C10 29.5 4 25.5 3.5 19C3 12 8.5 5.5 14 2Z"
      fill={`url(#lg-${id})`}
    />
    {/* Highlight shine along left leaf blade */}
    <Path
      d="M14 3C10.5 7 5.5 13.5 5 18.5C4.6 22 7.5 25.5 10.5 27.5C8 24.5 7 19.5 9 14.5C10.5 10.5 12.8 5.5 14 3Z"
      fill="rgba(255, 255, 255, 0.18)"
    />
    {/* Central vein / spine */}
    <Path
      d="M14 30C14 22 14.2 11 14 2"
      stroke={`url(#stem-${id})`}
      strokeWidth={1.3}
      strokeLinecap="round"
    />
    {/* Right lateral veins */}
    <Path d="M14 10C17 12 21 13 22.5 14.5" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} strokeLinecap="round"/>
    <Path d="M14 16C17.5 18 21.5 19.5 22.8 21" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} strokeLinecap="round"/>
    <Path d="M14 22C16.5 23.5 19 25 20 26.2" stroke="rgba(255,255,255,0.3)" strokeWidth={0.75} strokeLinecap="round"/>
    {/* Left lateral veins */}
    <Path d="M14 12C11 14 7 15 5.5 16.5" stroke="rgba(255,255,255,0.4)" strokeWidth={0.8} strokeLinecap="round"/>
    <Path d="M14 18C10.5 20 6.5 21.5 5.2 23" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} strokeLinecap="round"/>
    <Path d="M14 24C11.5 25.5 9 27 8 28.2" stroke="rgba(255,255,255,0.3)" strokeWidth={0.75} strokeLinecap="round"/>
  </Svg>
);

/**
 * 2. Flower SVG (Matching Web with rotating petals)
 */
export const FlowerSVG = ({ id }: { id: string | number }) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24">
    <Defs>
      <SvgRadialGradient id={`lg-${id}`} cx="50%" cy="50%" rx="50%" ry="50%">
        <Stop offset="0" stopColor="#FDE68A" />
        <Stop offset="1" stopColor="#F59E0B" />
      </SvgRadialGradient>
    </Defs>
    <Ellipse cx="12" cy="6" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    <G transform="rotate(60, 18, 9)">
      <Ellipse cx="18" cy="9" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    </G>
    <G transform="rotate(120, 18, 15)">
      <Ellipse cx="18" cy="15" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    </G>
    <G transform="rotate(180, 12, 18)">
      <Ellipse cx="12" cy="18" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    </G>
    <G transform="rotate(240, 6, 15)">
      <Ellipse cx="6" cy="15" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    </G>
    <G transform="rotate(300, 6, 9)">
      <Ellipse cx="6" cy="9" rx="3" ry="4.5" fill="#86EFAC" opacity={0.9} />
    </G>
    <Circle cx="12" cy="12" r="4" fill={`url(#lg-${id})`} />
  </Svg>
);

/**
 * 3. Droplet SVG (Pure morning dew droplet)
 */
export const DropletSVG = ({ id }: { id: string | number }) => (
  <Svg width="100%" height="100%" viewBox="0 0 24 24">
    <Defs>
      <SvgLinearGradient id={`lg-${id}`} x1="12" y1="2" x2="12" y2="22">
        <Stop offset="0" stopColor="#A7F3D0" />
        <Stop offset="1" stopColor="#059669" />
      </SvgLinearGradient>
    </Defs>
    <Path
      d="M12 22C16.4183 22 20 18.4183 20 14C20 9 12 2 12 2C12 2 4 9 4 14C4 18.4183 7.58172 22 12 22Z"
      fill={`url(#lg-${id})`}
    />
    <G transform="rotate(-20, 9, 13)">
      <Ellipse cx="9" cy="13" rx="2" ry="3" fill="rgba(255,255,255,0.3)" />
    </G>
  </Svg>
);

const svgTypes = ['leaf', 'leaf', 'flower', 'droplet'];

function renderSVG(type: string, id: string | number) {
  switch (type) {
    case 'flower':
      return <FlowerSVG id={id} />;
    case 'droplet':
      return <DropletSVG id={id} />;
    case 'leaf':
    default:
      return <LeafSVG id={id} />;
  }
}

const ELEMENT_COUNT = 24;

export default function FloatingNatureBackground({
  children,
  showSoundToggle = true,
}: FloatingNatureBackgroundProps) {
  const [isPlayingSound, setIsPlayingSound] = useState(true);

  // Elements configuration matching web FloatingLeaves
  const elementsConfig = useMemo(() => {
    return Array.from({ length: ELEMENT_COUNT }).map((_, i) => {
      const type = svgTypes[i % svgTypes.length];
      const size = 16 + Math.floor(Math.random() * 16);
      const startX = (i / ELEMENT_COUNT) * SCREEN_WIDTH + (Math.random() * 24 - 12);
      const driftX = (Math.random() * 70 + 35) * (i % 2 === 0 ? 1 : -1);
      const duration = 12000 + Math.random() * 8000;
      // Stagger initial progress across the whole vertical axis
      const initialProgress = (i / ELEMENT_COUNT) * 0.92 + Math.random() * 0.06;

      return {
        id: `el-${i}`,
        type,
        width: size,
        height: type === 'leaf' ? size * 1.15 : size,
        startX,
        driftX,
        duration,
        initialProgress,
        opacity: 0.45 + Math.random() * 0.35,
      };
    });
  }, []);

  const animatedValues = useRef(
    elementsConfig.map((cfg) => ({
      progress: new Animated.Value(cfg.initialProgress),
    }))
  ).current;

  // Breeze streams
  const windAnim1 = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const windAnim2 = useRef(new Animated.Value(-SCREEN_WIDTH * 1.5)).current;
  const windOpacity = useRef(new Animated.Value(0.2)).current;

  // Sound refs
  const soundRef = useRef<any>(null);
  const webAudioRef = useRef<any>(null);

  // Toggle sound handler
  const toggleSound = async () => {
    try {
      if (Platform.OS === 'web') {
        if (webAudioRef.current) {
          if (webAudioRef.current.paused) {
            await webAudioRef.current.play();
            setIsPlayingSound(true);
          } else {
            webAudioRef.current.pause();
            setIsPlayingSound(false);
          }
        }
      } else {
        if (soundRef.current) {
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded) {
            if (status.isPlaying) {
              await soundRef.current.pauseAsync();
              setIsPlayingSound(false);
            } else {
              await soundRef.current.playAsync();
              setIsPlayingSound(true);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Sound toggle error:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Falling 3D downward continuous motion loop
    elementsConfig.forEach((cfg, idx) => {
      const anim = animatedValues[idx].progress;

      const runFall = (startVal: number) => {
        if (!isMounted) return;
        anim.setValue(startVal);
        const remainingDuration = cfg.duration * (1 - startVal);

        Animated.timing(anim, {
          toValue: 1,
          duration: remainingDuration,
          useNativeDriver: Platform.OS !== 'web',
        }).start(({ finished }) => {
          if (finished && isMounted) {
            runFall(0);
          }
        });
      };

      runFall(cfg.initialProgress);
    });

    // Wind animation
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
          Animated.timing(windOpacity, { toValue: 0.4, duration: 4500, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(windOpacity, { toValue: 0.1, duration: 4500, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start(({ finished }) => {
        if (finished && isMounted) animateWind();
      });
    };

    animateWind();

    return () => {
      isMounted = false;
    };
  }, []);

  // Ambient sound setup with Web Audio fallback & Native Expo-AV
  useEffect(() => {
    let isMounted = true;

    // 1. Web HTML5 Audio setup (works in all modern browsers)
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const audio = new (window as any).Audio('https://cdn.freesound.org/previews/530/530697_11234978-lq.mp3');
        audio.loop = true;
        audio.volume = 0.55;
        webAudioRef.current = audio;

        const startAudio = () => {
          if (audio.paused) {
            audio.play().then(() => {
              if (isMounted) setIsPlayingSound(true);
            }).catch(() => {});
          }
        };

        startAudio();
        window.addEventListener('click', startAudio, { once: true });
        window.addEventListener('touchstart', startAudio, { once: true });
      } catch (err) {
        // Non-blocking
      }
    }

    // 2. Native Expo AV Audio setup
    async function initNativeSound() {
      if (Platform.OS === 'web' || !Audio?.Sound) return;
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://cdn.freesound.org/previews/530/530697_11234978-lq.mp3' },
          { isLooping: true, volume: 0.55, shouldPlay: true }
        );

        if (isMounted) {
          soundRef.current = sound;
          await sound.playAsync().catch(() => {});
          setIsPlayingSound(true);
        } else {
          await sound.unloadAsync().catch(() => {});
        }
      } catch (err) {
        // Safe non-blocking fallback
      }
    }

    initNativeSound();

    return () => {
      isMounted = false;
      if (webAudioRef.current) {
        webAudioRef.current.pause();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Background Calm Base */}
      <View style={styles.calmBase} />

      {/* Gentle Air / Breeze Stream 1 */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.windLineWrap,
          {
            top: 110,
            opacity: windOpacity,
            transform: [{ translateX: windAnim1 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.5} height={60} viewBox="0 0 500 60">
          <Path
            d="M 0 30 Q 120 5 250 30 T 500 30"
            fill="none"
            stroke="rgba(34, 197, 94, 0.2)"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Gentle Air / Breeze Stream 2 */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.windLineWrap,
          {
            top: 360,
            opacity: windOpacity,
            transform: [{ translateX: windAnim2 }],
          },
        ]}
      >
        <Svg width={SCREEN_WIDTH * 1.8} height={80} viewBox="0 0 600 80">
          <Path
            d="M 0 40 Q 150 70 300 40 T 600 40"
            fill="none"
            stroke="rgba(16, 185, 129, 0.16)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* Screen Content */}
      <View style={styles.contentWrap}>{children}</View>

      {/* 3D Falling Nature Elements floating above content */}
      {elementsConfig.map((el, idx) => {
        const anim = animatedValues[idx].progress;

        // Downward fall from -60 to SCREEN_HEIGHT + 60 (fall3D simulation)
        const translateY = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [-60, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT + 60],
        });

        // Lateral breeze sway (drift)
        const translateX = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [el.startX, el.startX + el.driftX, el.startX + el.driftX * 1.6],
        });

        // 3D rotation mimicking rotateX + rotateY + rotateZ
        const rotateZ = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: ['0deg', '90deg', '180deg'],
        });

        const scale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.85, 1.1, 0.9],
        });

        return (
          <Animated.View
            key={el.id}
            pointerEvents="none"
            style={[
              styles.element,
              {
                width: el.width,
                height: el.height,
                opacity: el.opacity,
                transform: [
                  { translateX },
                  { translateY },
                  { rotate: rotateZ },
                  { scale },
                ],
              },
            ]}
          >
            {renderSVG(el.type, el.id)}
          </Animated.View>
        );
      })}

      {/* Interactive Floating Sound Pill */}
      {showSoundToggle && (
        <TouchableOpacity
          style={styles.soundPill}
          onPress={toggleSound}
          activeOpacity={0.8}
          accessibilityLabel="Toggle Nature Ambience"
        >
          {isPlayingSound ? (
            <Volume2 size={15} color="#16a34a" />
          ) : (
            <VolumeX size={15} color="#94a3b8" />
          )}
          <Text style={[styles.soundPillText, { color: isPlayingSound ? '#16a34a' : '#64748b' }]}>
            {isPlayingSound ? 'Ambience ON' : 'Ambience OFF'}
          </Text>
        </TouchableOpacity>
      )}
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
  element: {
    position: 'absolute',
    zIndex: 20, // Above content
  },
  leaf: {
    position: 'absolute',
    zIndex: 20,
  },
  contentWrap: {
    flex: 1,
    zIndex: 2,
  },
  soundPill: {
    position: 'absolute',
    bottom: 74,
    left: 18,
    zIndex: 998,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  soundPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
