import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Search,
  X,
  Sparkles,
  Plus,
  Check,
  Leaf,
  Flower2,
  Flame,
  Droplets,
  Coffee,
  Heart,
  Activity,
  Users,
  Eye,
  BookOpen,
  MessageCircle,
  Home,
  CalendarCheck,
  Pill,
} from 'lucide-react-native';
import { DISCOVERY_ITEMS, DiscoveryItem } from '../src/data/discoveryData';

const FALLBACK_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Pfefferminze_natur_peppermint.jpg/400px-Pfefferminze_natur_peppermint.jpg';

const AVAILABLE_TAGS = [
  'ethiopian',
  'stress',
  'sleep',
  'immunity',
  'energy',
  'digestion',
  'heart',
  'traditional',
  'spice',
  'superfood',
];

export default function DiscoveryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'local'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<DiscoveryItem | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredFeed = useMemo(() => {
    return DISCOVERY_ITEMS.filter((item) => {
      // 1. Tab check
      if (activeTab === 'local' && !item.tags.includes('ethiopian')) {
        return false;
      }
      // 2. Tags filter
      if (selectedTags.length > 0) {
        const matchesTag = selectedTags.some((tag) => item.tags.includes(tag));
        if (!matchesTag) return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBenefit = item.benefit.toLowerCase().includes(q);
        const matchesPrep = item.preparation?.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCat = item.categoryLabel.toLowerCase().includes(q);
        return matchesName || matchesBenefit || matchesPrep || matchesTags || matchesCat;
      }
      return true;
    });
  }, [activeTab, selectedTags, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityLabel="Back to Home"
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.pageTitle}>Discovery Feed</Text>
          <Text style={styles.pageSubtitle}>Your personalized, dynamic health knowledge</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#64748b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Damakesse, Moringa, sleep, stress..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
              <X size={16} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Switcher (Matching Web: Explore All vs Local Superfoods) */}
        <View style={styles.tabSwitchContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={[styles.tabButton, activeTab === 'all' && styles.tabButtonActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabButtonText, activeTab === 'all' && styles.tabButtonTextActive]}>
              Explore All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('local')}
            style={[styles.tabButton, activeTab === 'local' && styles.tabButtonActive]}
            activeOpacity={0.75}
          >
            <Text style={[styles.tabButtonText, activeTab === 'local' && styles.tabButtonTextActive]}>
              Local Superfoods
            </Text>
          </TouchableOpacity>
        </View>

        {/* Follow your interests (Interactive Tags matching Web) */}
        <View style={styles.interestsContainer}>
          <Text style={styles.interestsHeading}>Follow your interests:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollRow}
          >
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.interestChip, isSelected && styles.interestChipActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.75}
                >
                  {isSelected ? (
                    <Check size={13} color="#15803d" />
                  ) : (
                    <Plus size={13} color="#64748b" />
                  )}
                  <Text style={[styles.interestChipText, isSelected && styles.interestChipTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {activeTab === 'local' ? 'Nutritional Breakdown' : 'Articles & Guides'}
          </Text>
          <Text style={styles.feedCountText}>
            {filteredFeed.length} {filteredFeed.length === 1 ? 'item' : 'items'}
          </Text>
        </View>

        {/* Discovery Cards Grid (With 160px Image like Web) */}
        <View style={styles.cardsList}>
          {filteredFeed.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.webCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.85}
            >
              {/* Cover Image */}
              <View style={styles.cardImageContainer}>
                <Image
                  source={{ uri: item.image || FALLBACK_IMAGE }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.categoryBadgeOverlay}>
                  <Text style={styles.categoryBadgeText}>
                    {item.categoryLabel.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Card Body */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeaderTitleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <Text style={styles.cardBenefit}>{item.benefit}</Text>

                {/* Local Nutritional Highlight if Ethiopian */}
                {item.tags.includes('ethiopian') && (
                  <View style={styles.nutritionalHighlight}>
                    <Text style={styles.nutritionalHighlightText}>
                      <Text style={{ fontWeight: '800' }}>Nutritional Highlight: </Text>
                      Rich in highland minerals, fiber, and natural botanical bio-compounds.
                    </Text>
                  </View>
                )}

                {/* Tag Pills */}
                <View style={styles.cardTagsRow}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={styles.smallTag}>
                      <Text style={styles.smallTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Constant Bottom Navigation Bar Dock */}
      <View style={styles.bottomNavDock}>
        <TouchableOpacity
          style={styles.navDockItem}
          onPress={() => router.push('/(tabs)')}
          activeOpacity={0.7}
        >
          <Home size={20} color="#64748b" />
          <Text style={styles.navDockLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navDockItem}
          onPress={() => router.push('/(tabs)/checkups')}
          activeOpacity={0.7}
        >
          <CalendarCheck size={20} color="#64748b" />
          <Text style={styles.navDockLabel}>Checkups</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navDockItem}
          onPress={() => router.push('/(tabs)/medication')}
          activeOpacity={0.7}
        >
          <Pill size={20} color="#64748b" />
          <Text style={styles.navDockLabel}>Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navDockItem}
          onPress={() => router.push('/(tabs)/lifestyle')}
          activeOpacity={0.7}
        >
          <Heart size={20} color="#64748b" />
          <Text style={styles.navDockLabel}>Lifestyle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navDockItem}
          onPress={() => router.push('/(tabs)/community')}
          activeOpacity={0.7}
        >
          <Users size={20} color="#64748b" />
          <Text style={styles.navDockLabel}>Community</Text>
        </TouchableOpacity>
      </View>

      {/* Detail Modal */}
      {selectedItem && (
        <Modal
          visible={!!selectedItem}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalCoverContainer}>
                <Image
                  source={{ uri: selectedItem.image || FALLBACK_IMAGE }}
                  style={styles.modalCoverImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedItem(null)}
                  activeOpacity={0.8}
                >
                  <X size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ maxHeight: 380 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 18 }}
              >
                <View style={styles.modalCategoryBadge}>
                  <Text style={styles.modalCategoryBadgeText}>
                    {selectedItem.categoryLabel}
                  </Text>
                </View>

                <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                <Text style={styles.modalBenefit}>{selectedItem.benefit}</Text>

                {selectedItem.preparation && (
                  <View style={styles.modalPrepBox}>
                    <Text style={styles.modalPrepHeading}>Traditional Preparation & Use</Text>
                    <Text style={styles.modalPrepText}>{selectedItem.preparation}</Text>
                  </View>
                )}

                <View style={styles.modalTagsRow}>
                  {selectedItem.tags.map((tag) => (
                    <View key={tag} style={styles.modalTagChip}>
                      <Text style={styles.modalTagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.modalChatBtn}
                  onPress={() => {
                    setSelectedItem(null);
                    router.push('/chat');
                  }}
                  activeOpacity={0.88}
                >
                  <MessageCircle size={18} color="#ffffff" />
                  <Text style={styles.modalChatBtnText}>
                    Ask Nura About {selectedItem.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 44,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 90,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.85)',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0f172a',
    paddingVertical: 0,
  },
  searchClearBtn: {
    padding: 4,
  },

  // Tab switcher
  tabSwitchContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    paddingBottom: 10,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#16a34a',
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#15803d',
    fontWeight: '800',
  },

  // Interest tags
  interestsContainer: {
    marginBottom: 16,
  },
  interestsHeading: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },
  tagsScrollRow: {
    gap: 8,
    paddingRight: 10,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  interestChipActive: {
    backgroundColor: 'rgba(240, 253, 244, 0.9)',
    borderColor: '#16a34a',
  },
  interestChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  interestChipTextActive: {
    color: '#15803d',
    fontWeight: '800',
  },

  // Section title
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  feedCountText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },

  // Web Cards List
  cardsList: {
    gap: 16,
  },
  webCard: {
    backgroundColor: 'rgba(240, 253, 244, 0.72)',
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: 'rgba(187, 247, 208, 0.8)',
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadgeOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(187, 247, 208, 0.8)',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.4,
  },
  cardBody: {
    padding: 16,
  },
  cardHeaderTitleRow: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  cardBenefit: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  nutritionalHighlight: {
    backgroundColor: '#dcfce7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  nutritionalHighlightText: {
    fontSize: 11.5,
    color: '#14532d',
    lineHeight: 16,
  },
  cardTagsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  smallTag: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.8,
    borderColor: 'rgba(187, 247, 208, 0.65)',
  },
  smallTagText: {
    fontSize: 10.5,
    color: '#15803d',
    fontWeight: '600',
  },

  // Constant Bottom Nav Dock
  bottomNavDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  navDockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navDockLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },

  // Detail Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalCoverContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  modalCoverImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  modalCategoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalBenefit: {
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPrepBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 16,
  },
  modalPrepHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  modalPrepText: {
    fontSize: 12,
    color: '#14532d',
    lineHeight: 18,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  modalTagChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  modalTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  modalChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 14,
    paddingVertical: 13,
    shadowColor: '#16a34a',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  modalChatBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
