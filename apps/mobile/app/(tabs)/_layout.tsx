import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, CalendarCheck, Pill, Heart, Users, MessageCircle, User } from 'lucide-react-native';
import { useProfile } from '../../src/context/ProfileContext';
import { useTheme } from '../../src/context/ThemeContext';
import ThemeToggleButton from '../../src/components/theme/ThemeToggleButton';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { profile } = useProfile();
  const { theme, isDark } = useTheme();

  // Show floating chat button permanently on all tabs EXCEPT index (Home)
  const activeTabRoute = segments[1] || 'index';
  const showFloatingChat = activeTabRoute !== 'index';

  // Profile avatar header right icon constant for all 5 tabs
  const renderHeaderRight = () => {
    const initial = profile?.name ? profile.name[0].toUpperCase() : 'G';
    return (
      <TouchableOpacity
        onPress={() => router.push('/profile')}
        style={styles.headerProfileBtn}
        activeOpacity={0.8}
        accessibilityLabel="Open Profile"
      >
        <View style={[styles.headerAvatarCircle, { backgroundColor: theme.accent }]}>
          <Text style={styles.headerAvatarText}>
            {initial}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.navActive,
          tabBarInactiveTintColor: theme.navInactive,
          tabBarStyle: {
            backgroundColor: theme.navBackground,
            borderTopColor: theme.navBorder,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerShown: true,
          headerTitleAlign: 'center', // Centered title on all 5 tabs
          headerLeft: () => (
            <View style={{ paddingLeft: 16 }}>
              <ThemeToggleButton size={18} />
            </View>
          ),
          headerStyle: {
            backgroundColor: theme.navBackground,
            elevation: isDark ? 0 : 1,
            shadowColor: '#000',
            shadowOpacity: isDark ? 0 : 0.03,
            shadowRadius: 4,
            borderBottomColor: theme.navBorder,
            borderBottomWidth: 1,
          },
          headerTitleStyle: {
            color: theme.textPrimary,
            fontWeight: '800',
            fontSize: 17,
          },
          headerRight: renderHeaderRight, // Constant profile icon at top right on all 5 tabs
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="checkups"
          options={{
            title: 'Daily Checkup',
            tabBarLabel: 'Checkups',
            tabBarIcon: ({ color, size }) => <CalendarCheck size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="medication"
          options={{
            title: 'Medication',
            tabBarLabel: 'Medication',
            tabBarIcon: ({ color, size }) => <Pill size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="lifestyle"
          options={{
            title: 'Lifestyle',
            tabBarLabel: 'Lifestyle',
            tabBarIcon: ({ color, size }) => <Heart size={size || 22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Community',
            tabBarLabel: 'Community',
            tabBarIcon: ({ color, size }) => <Users size={size || 22} color={color} />,
          }}
        />
        {/* Hide wellness from tabs if accessed via legacy route */}
        <Tabs.Screen
          name="wellness"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Persistent Floating Chat Launcher on the 4 tabs except Home */}
      {showFloatingChat && (
        <TouchableOpacity
          style={[styles.floatingChatBtn, { backgroundColor: theme.accent, shadowColor: theme.accent }]}
          onPress={() => router.push('/chat')}
          activeOpacity={0.88}
          accessibilityLabel="Open Nura Chat"
        >
          <MessageCircle size={24} color="#ffffff" />
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
  floatingChatBtn: {
    position: 'absolute',
    bottom: 74, // Located right above the 62px bottom tab bar
    right: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  headerProfileBtn: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerAvatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

