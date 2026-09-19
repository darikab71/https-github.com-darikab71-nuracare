import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sparkles, CheckCircle2, Compass, HeartHandshake } from 'lucide-react-native';

interface CommunityMascotProps {
  mood?: 'curious' | 'celebrate' | 'welcome' | 'guide';
  message?: string;
  subtext?: string;
}

export default function CommunityMascot({
  mood = 'curious',
  message,
  subtext,
}: CommunityMascotProps) {
  const getMascotConfig = () => {
    switch (mood) {
      case 'celebrate':
        return {
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          accentColor: '#16a34a',
          Icon: CheckCircle2,
          defaultTitle: 'Nice work!',
          defaultSub: 'You are taking healthy steps forward.',
        };
      case 'welcome':
        return {
          bgColor: '#ecfdf5',
          borderColor: '#a7f3d0',
          accentColor: '#059669',
          Icon: HeartHandshake,
          defaultTitle: 'Welcome to the Community!',
          defaultSub: 'Find your people and build healthy habits together.',
        };
      case 'guide':
        return {
          bgColor: '#f8fafc',
          borderColor: '#e2e8f0',
          accentColor: '#475569',
          Icon: Compass,
          defaultTitle: 'Helpful Tip',
          defaultSub: 'Joining a challenge keeps you accountable with peers.',
        };
      case 'curious':
      default:
        return {
          bgColor: '#f0fdf4',
          borderColor: '#dcfce7',
          accentColor: '#16a34a',
          Icon: Sparkles,
          defaultTitle: 'Nothing here yet',
          defaultSub: 'Explore new opportunities to connect and grow.',
        };
    }
  };

  const config = getMascotConfig();
  const { Icon } = config;

  return (
    <View style={styles.container}>
      <View style={[styles.mascotCircle, { backgroundColor: config.bgColor, borderColor: config.borderColor }]}>
        {/* Cute Stylized Botanical Sprout Companion */}
        <View style={styles.sproutHead}>
          <View style={styles.leafLeft} />
          <View style={styles.leafRight} />
          <View style={styles.sproutFace}>
            {/* Friendly Mascot Eyes */}
            <View style={styles.eyeRow}>
              <View style={styles.mascotEye} />
              <View style={styles.mascotEye} />
            </View>
            <View style={styles.mascotSmile} />
          </View>
        </View>

        <View style={[styles.iconBadge, { backgroundColor: config.accentColor }]}>
          <Icon size={12} color="#ffffff" />
        </View>
      </View>

      <Text style={styles.titleText}>{message || config.defaultTitle}</Text>
      <Text style={styles.subtext}>{subtext || config.defaultSub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  mascotCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  sproutHead: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leafLeft: {
    position: 'absolute',
    top: -14,
    left: -4,
    width: 14,
    height: 10,
    backgroundColor: '#22c55e',
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    transform: [{ rotate: '-32deg' }],
  },
  leafRight: {
    position: 'absolute',
    top: -14,
    right: -4,
    width: 14,
    height: 10,
    backgroundColor: '#16a34a',
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    transform: [{ rotate: '32deg' }],
  },
  sproutFace: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#86efac',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#16a34a',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: -2,
  },
  mascotEye: {
    width: 3.5,
    height: 4.5,
    borderRadius: 2,
    backgroundColor: '#14532d',
  },
  mascotSmile: {
    width: 9,
    height: 4,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#14532d',
    marginTop: 2,
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtext: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});
