import 'react-native-gesture-handler';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWellnessStore, useAuthStore } from '../src/store';
import { startBackgroundSyncLoop } from '../src/services/supabase/syncEngine';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ProfileProvider, useProfile } from '../src/context/ProfileContext';

import * as SplashScreen from 'expo-splash-screen';
import { checkForAppUpdates } from '../src/services/versionCheck';

SplashScreen.preventAutoHideAsync().catch(() => {});

function InnerLayout() {
  const { user, loading: authLoading } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;
  const { profile, loading: profileLoading } = useProfile();
  const { loadWellnessData } = useWellnessStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    // Hard failsafe: ensure splash screen ALWAYS hides within 1.2s regardless of any async logic
    const splashFailsafe = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1200);

    async function prepare() {
      try {
        await loadWellnessData();
        startBackgroundSyncLoop();
      } catch (e) {
        console.warn('Initialization error:', e);
      } finally {
        setIsReady(true);
        clearTimeout(splashFailsafe);
        await SplashScreen.hideAsync().catch(() => {});
        // Check for updates in the background without blocking UI
        setTimeout(() => {
          checkForAppUpdates(false);
        }, 3000);
      }
    }
    prepare();

    return () => clearTimeout(splashFailsafe);
  }, []);

  useEffect(() => {
    if (!isReady || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isGuest = currentUser?.id && String(currentUser.id).startsWith('guest_');
    
    if (!currentUser && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (currentUser) {
      if (isGuest) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
        return;
      }

      if (profileLoading) return;
      
      const needsOnboarding = !profile || !profile.name || profile._fallback || (Array.isArray(profile.conditions) === false && !profile.age);
      
      if (needsOnboarding && (segments as any)[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding/step1');
      } else if (!needsOnboarding && inAuthGroup) {
        // Redirect away from login/onboarding if already signed in and setup
        router.replace('/(tabs)');
      }
    }
  }, [currentUser, profile, authLoading, profileLoading, segments, isReady]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen name="devices" options={{ headerShown: false }} />
      <Stack.Screen name="records" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-center" options={{ headerShown: false }} />
      <Stack.Screen name="consent-settings" options={{ headerShown: false }} />
      <Stack.Screen name="permissions-management" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="legal" options={{ headerShown: false }} />
      <Stack.Screen name="checkin-modal" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}

import FloatingNatureBackground from '../src/components/ambient/FloatingNatureBackground';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <FloatingNatureBackground showSoundToggle={false}>
          <InnerLayout />
        </FloatingNatureBackground>
      </ProfileProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#166534', marginBottom: 12 }}>NuraCare</Text>
      <Text style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
        The app encountered a startup issue. Tap the button below to reload cleanly.
      </Text>
      <TouchableOpacity
        onPress={retry}
        style={{
          backgroundColor: '#16a34a',
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 12,
          elevation: 2,
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>Reload App</Text>
      </TouchableOpacity>
    </View>
  );
}
