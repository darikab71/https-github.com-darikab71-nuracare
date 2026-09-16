import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Image,
  Dimensions,
  Modal,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AvatarLocomotionOverlayProps {
  visible: boolean;
  character: 'nura' | 'nuri';
  onComplete: () => void;
}

export default function AvatarLocomotionOverlay({
  visible,
  character,
  onComplete,
}: AvatarLocomotionOverlayProps) {
  const progress = useRef(new Animated.Value(0)).current;
  const squashX = useRef(new Animated.Value(1)).current;
  const squashY = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      progress.setValue(0);
      opacity.setValue(1);

      // Classic Cartoon Sequence: Anticipation -> Arc Travel -> Landing
      Animated.sequence([
        // Step 1: Anticipation Squash (Character crouches down before leaping)
        Animated.parallel([
          Animated.timing(squashX, {
            toValue: 1.25,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(squashY, {
            toValue: 0.8,
            duration: 100,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        // Step 2: Uncoil & Spring Stretch
        Animated.parallel([
          Animated.timing(squashX, {
            toValue: 0.9,
            duration: 120,
            useNativeDriver: true,
          }),
          Animated.timing(squashY, {
            toValue: 1.15,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
        // Step 3: Arc Path down to Chat tab (650ms)
        Animated.timing(progress, {
          toValue: 1,
          duration: 650,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Landing settle
        setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            onComplete();
          });
        }, 120);
      });
    }
  }, [visible]);

  if (!visible) return null;

  // Arc path from (x: centerX, y: 190) down to (x: rightSideChatTab, y: SCREEN_HEIGHT - 65)
  const startX = SCREEN_WIDTH / 2 - 40;
  const endX = SCREEN_WIDTH / 2 + 18; // Over Chat tab
  const startY = 180;
  const endY = SCREEN_HEIGHT - 130;

  const translateX = progress.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [startX, startX + 30, endX - 10, endX],
  });

  const translateY = progress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [startY, startY + (endY - startY) * 0.45 - 20, endY],
  });

  const rotate = progress.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: ['0deg', '8deg', '-4deg', '0deg'],
  });

  const scale = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.95, 1.1, 1],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Animated.View
        style={[
          styles.flyingCharacterWrap,
          {
            opacity,
            transform: [
              { translateX },
              { translateY },
              { rotate },
              { scale },
              { scaleX: squashX },
              { scaleY: squashY },
            ],
          },
        ]}
      >
        <Image
          source={
            character === 'nura'
              ? require('../../../assets/avatars/nura_avatar.jpg')
              : require('../../../assets/avatars/nuri_avatar.jpg')
          }
          style={styles.flyingImage}
          resizeMode="cover"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flyingCharacterWrap: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#16a34a',
    backgroundColor: '#ffffff',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 9999,
  },
  flyingImage: {
    width: '100%',
    height: '100%',
  },
});
