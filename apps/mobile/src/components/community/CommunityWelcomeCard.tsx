import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Users, Sparkles, PlusCircle, Video, Image as ImageIcon } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { LocalImages } from '../../assets/images';

interface CommunityWelcomeCardProps {
  onOpenCreatePost: () => void;
  onExploreChallenges: () => void;
}

export default function CommunityWelcomeCard({
  onOpenCreatePost,
  onExploreChallenges,
}: CommunityWelcomeCardProps) {
  const { theme, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.imageWrap}>
        <Image
          source={LocalImages.beHealthy}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        <View style={styles.badgeWrap}>
          <View style={[styles.badge, { backgroundColor: 'rgba(11, 16, 15, 0.75)', borderColor: theme.borderSubtle }]}>
            <Users size={12} color={theme.accent} />
            <Text style={[styles.badgeText, { color: theme.accent }]}>5,200+ Mindful Explorers</Text>
          </View>
        </View>

        <View style={styles.headerTextWrap}>
          <Text style={styles.heroTitle}>Welcome to NuraCare Community</Text>
          <Text style={styles.heroSubtitle}>
            Share daily habits, gym nutrition, mobility videos & holistic wisdom together.
          </Text>
        </View>
      </View>

      {/* Action Buttons Bar */}
      <View style={[styles.actionBar, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.borderSubtle }]}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: theme.accent }]}
          onPress={onOpenCreatePost}
          activeOpacity={0.85}
        >
          <PlusCircle size={15} color="#ffffff" />
          <Text style={styles.createBtnText}>Share Post & Media</Text>
        </TouchableOpacity>

        <View style={styles.mediaPillsRow}>
          <TouchableOpacity
            style={[styles.mediaPill, { borderColor: theme.borderSubtle, backgroundColor: theme.surface }]}
            onPress={onOpenCreatePost}
            activeOpacity={0.75}
          >
            <ImageIcon size={13} color={theme.accent} />
            <Text style={[styles.mediaPillText, { color: theme.textSecondary }]}>Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaPill, { borderColor: theme.borderSubtle, backgroundColor: theme.surface }]}
            onPress={onOpenCreatePost}
            activeOpacity={0.75}
          >
            <Video size={13} color="#f59e0b" />
            <Text style={[styles.mediaPillText, { color: theme.textSecondary }]}>Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrap: {
    height: 148,
    position: 'relative',
    justifyContent: 'space-between',
    padding: 14,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  badgeWrap: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  headerTextWrap: {
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#e2e8f0',
    marginTop: 2,
    lineHeight: 16,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  mediaPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  mediaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  mediaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
