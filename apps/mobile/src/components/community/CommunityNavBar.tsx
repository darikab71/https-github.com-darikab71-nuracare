import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Compass, Trophy, Users, MessageSquare } from 'lucide-react-native';
import { CommunityPrimaryTab } from '../../types/communityTypes';

interface CommunityNavBarProps {
  activeTab: CommunityPrimaryTab;
  onSelectTab: (tab: CommunityPrimaryTab) => void;
  unreadCount?: number;
  hasActiveChallenge?: boolean;
}

export default function CommunityNavBar({
  activeTab,
  onSelectTab,
  unreadCount = 0,
  hasActiveChallenge = false,
}: CommunityNavBarProps) {
  const tabs = [
    {
      key: 'discovery' as const,
      label: 'Discovery',
      Icon: Compass,
    },
    {
      key: 'challenges' as const,
      label: 'Challenges',
      Icon: Trophy,
      showActivityDot: hasActiveChallenge,
    },
    {
      key: 'community' as const,
      label: 'Community',
      Icon: Users,
    },
    {
      key: 'inbox' as const,
      label: 'Inbox',
      Icon: MessageSquare,
      badgeCount: unreadCount,
    },
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.navContent}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const { Icon } = tab;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.navItem}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} Tab`}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Icon
                  size={20}
                  color={isActive ? '#16a34a' : '#64748b'}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />

                {/* Challenge Activity Dot */}
                {tab.showActivityDot && !isActive && (
                  <View style={styles.activityDot} />
                )}

                {/* Inbox Unread Badge */}
                {tab.badgeCount && tab.badgeCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {tab.badgeCount > 9 ? '9+' : tab.badgeCount}
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {tab.label}
              </Text>

              {/* Active Indicator Bar */}
              {isActive && <View style={styles.activePill} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  iconWrapper: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: '#f0fdf4',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 2,
    letterSpacing: 0.1,
  },
  navLabelActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  activePill: {
    position: 'absolute',
    bottom: -4,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#16a34a',
  },
  activityDot: {
    position: 'absolute',
    top: 3,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#16a34a',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadBadge: {
    position: 'absolute',
    top: 1,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
});
