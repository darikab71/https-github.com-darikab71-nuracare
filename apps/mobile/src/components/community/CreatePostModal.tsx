import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  Image as ImageIcon,
  Video,
  Play,
  Trash2,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { CommunityDiscussion, MediaItem } from '../../types/communityTypes';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: Partial<CommunityDiscussion>) => void;
}

import { LocalImages } from '../../assets/images';

const PRESET_PHOTOS = [
  { label: 'Gym Meal Bowl', url: 'local:healthyLifestyle', source: LocalImages.healthyLifestyle },
  { label: 'Workout Station', url: 'local:beHealthy', source: LocalImages.beHealthy },
  { label: 'Morning Calm', url: 'local:chamomile', source: LocalImages.chamomile },
  { label: 'Herbal Wellness', url: 'local:naturalRemedies', source: LocalImages.naturalRemedies },
];

const PRESET_VIDEOS = [
  {
    label: 'Scapular Mobility (0:45)',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-athlete-working-out-with-dumbbells-44222-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    duration: '0:45',
  },
  {
    label: '4-7-8 Breath Reset (1:15)',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-meditating-in-nature-41584-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    duration: '1:15',
  },
];

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: CreatePostModalProps) {
  const { theme, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [groupName, setGroupName] = useState('Athletic Performance & Gym Nutrition');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showPicker, setShowPicker] = useState<'photo' | 'video' | null>(null);

  if (!visible) return null;

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Incomplete Post', 'Please provide both a title and description for your post.');
      return;
    }

    const newPost: Partial<CommunityDiscussion> = {
      id: 'disc-user-' + Date.now(),
      title: title.trim(),
      content: content.trim(),
      groupName,
      author: 'You (Explorer)',
      authorBadge: 'Member',
      avatarColor: theme.accent,
      timeAgo: 'Just now',
      supportCount: 1,
      userSupported: true,
      commentCount: 0,
      replies: [],
      media: selectedMedia ? [selectedMedia] : [],
    };

    onSubmit(newPost);
    setTitle('');
    setContent('');
    setSelectedMedia(null);
    setShowPicker(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surfaceModal, borderColor: theme.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.borderSubtle }]}>
            <View>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Create Community Post</Text>
              <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                Share stories, gym nutrition, photos & videos
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.surfaceElevated }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>POST TITLE</Text>
            <TextInput
              style={[styles.titleInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="e.g. My post-workout teff protein routine..."
              placeholderTextColor={theme.placeholderText}
              value={title}
              onChangeText={setTitle}
            />

            {/* Content Input */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>YOUR EXPERIENCE & ADVICE</Text>
            <TextInput
              style={[styles.bodyInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.inputText }]}
              placeholder="Share details, macro breakdown, routine steps, or questions..."
              placeholderTextColor={theme.placeholderText}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Attached Media Preview */}
            {selectedMedia && (
              <View style={[styles.previewCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewTypeRow}>
                    {selectedMedia.type === 'video' ? (
                      <Video size={14} color="#f59e0b" />
                    ) : (
                      <ImageIcon size={14} color={theme.accent} />
                    )}
                    <Text style={[styles.previewTypeText, { color: theme.textPrimary }]}>
                      Attached {selectedMedia.type === 'video' ? `Video (${selectedMedia.duration})` : 'Photo'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.removeMediaBtn}
                    onPress={() => setSelectedMedia(null)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Trash2 size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.mediaThumbnailWrap}>
                  <Image
                    source={{ uri: selectedMedia.thumbnailUrl || selectedMedia.url }}
                    style={styles.mediaThumbnail}
                    resizeMode="cover"
                  />
                  {selectedMedia.type === 'video' && (
                    <View style={styles.playOverlay}>
                      <Play size={20} color="#ffffff" fill="#ffffff" />
                      <Text style={styles.durationText}>{selectedMedia.duration}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Attachment Actions Bar */}
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>ATTACH MEDIA</Text>
            <View style={styles.attachRow}>
              <TouchableOpacity
                style={[
                  styles.attachBtn,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                  showPicker === 'photo' && { borderColor: theme.accent, backgroundColor: theme.accentDeep },
                ]}
                onPress={() => setShowPicker(showPicker === 'photo' ? null : 'photo')}
                activeOpacity={0.8}
              >
                <ImageIcon size={16} color={theme.accent} />
                <Text style={[styles.attachBtnText, { color: theme.textPrimary }]}>Attach Picture</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.attachBtn,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle },
                  showPicker === 'video' && { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.14)' },
                ]}
                onPress={() => setShowPicker(showPicker === 'video' ? null : 'video')}
                activeOpacity={0.8}
              >
                <Video size={16} color="#f59e0b" />
                <Text style={[styles.attachBtnText, { color: theme.textPrimary }]}>Attach Video</Text>
              </TouchableOpacity>
            </View>

            {/* Photo Selector Presets */}
            {showPicker === 'photo' && (
              <View style={[styles.pickerBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.pickerTitle, { color: theme.textSecondary }]}>Select or Upload Photo:</Text>
                <View style={styles.presetList}>
                  {PRESET_PHOTOS.map((p, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.presetItem}
                      onPress={() => {
                        setSelectedMedia({ type: 'image', url: p.url, caption: p.label });
                        setShowPicker(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={p.source || { uri: p.url }} style={styles.presetImg} />
                      <Text style={[styles.presetLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Video Selector Presets */}
            {showPicker === 'video' && (
              <View style={[styles.pickerBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSubtle }]}>
                <Text style={[styles.pickerTitle, { color: theme.textSecondary }]}>Select or Upload Video:</Text>
                <View style={styles.presetList}>
                  {PRESET_VIDEOS.map((v, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.presetItem}
                      onPress={() => {
                        setSelectedMedia({
                          type: 'video',
                          url: v.url,
                          thumbnailUrl: v.thumbnailUrl,
                          duration: v.duration,
                          caption: v.label,
                        });
                        setShowPicker(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: v.thumbnailUrl }} style={styles.presetImg} />
                      <View style={styles.miniPlayIcon}>
                        <Play size={10} color="#ffffff" fill="#ffffff" />
                      </View>
                      <Text style={[styles.presetLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Submit Button */}
          <View style={[styles.footer, { borderTopColor: theme.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.publishBtn, { backgroundColor: theme.accent }]}
              onPress={handlePublish}
              activeOpacity={0.85}
            >
              <Text style={styles.publishBtnText}>Publish to Community</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    gap: 8,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 6,
    marginBottom: 4,
  },
  titleInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    fontSize: 14,
  },
  bodyInput: {
    minHeight: 88,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 13.5,
    lineHeight: 18,
  },
  attachRow: {
    flexDirection: 'row',
    gap: 10,
  },
  attachBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  attachBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  pickerBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  pickerTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetList: {
    flexDirection: 'row',
    gap: 10,
  },
  presetItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  presetImg: {
    width: '100%',
    height: 64,
    borderRadius: 10,
    marginBottom: 4,
  },
  miniPlayIcon: {
    position: 'absolute',
    top: 24,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    marginVertical: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  removeMediaBtn: {
    padding: 4,
  },
  mediaThumbnailWrap: {
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  publishBtn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
