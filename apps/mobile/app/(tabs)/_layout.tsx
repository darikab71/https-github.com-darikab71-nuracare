import { Tabs, useRouter, useSegments } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, CalendarCheck, Pill, Heart, Users, MessageCircle } from 'lucide-react-native';

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Show floating chat button permanently on all tabs EXCEPT index (Home)
  // segments for tabs is usually ['(tabs)', 'checkups'] etc.
  const activeTabRoute = segments[1] || 'index';
  const showFloatingChat = activeTabRoute !== 'index';

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#16a34a',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopColor: '#e2e8f0',
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerShown: true,
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTitleStyle: {
            color: '#0f172a',
            fontWeight: '700',
          },
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
          style={styles.floatingChatBtn}
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
});

