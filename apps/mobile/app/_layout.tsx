import 'react-native-gesture-handler';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack, router, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { useWellnessStore, useAuthStore } from '../src/store';
import { startBackgroundSyncLoop } from '../src/services/supabase/syncEngine';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ProfileProvider, useProfile } from '../src/context/ProfileContext';

import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { checkForAppUpdates } from '../src/services/versionCheck';
import { useRemoteConfigStore } from '../src/store/remoteConfigStore';
import MaintenanceScreen from '../src/components/system/MaintenanceScreen';
import ForceUpdateScreen from '../src/components/system/ForceUpdateScreen';
import ConnectivityBanner from '../src/components/system/ConnectivityBanner';
import { analytics } from '../src/services/analytics';

SplashScreen.preventAutoHideAsync().catch(() => {});

function InnerLayout() {
  const { user, loading: authLoading } = useAuth();
  const { user: storeUser } = useAuthStore();
  const currentUser = user || storeUser;
  const { profile, loading: profileLoading } = useProfile();
  const { loadWellnessData } = useWellnessStore();
  const { config } = useRemoteConfigStore();
  const [isReady, setIsReady] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    // Hard failsafe: ensure splash screen ALWAYS hides within 1.2s regardless of any async logic
    const splashFailsafe = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1200);

    async function prepare() {
      try {
        useAuthStore.getState().loadUser();
        useRemoteConfigStore.getState().initialize();
        useRemoteConfigStore.getState().syncRemoteConfig();
        await loadWellnessData();
        startBackgroundSyncLoop();
        analytics.track('app_opened');
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
      // Ensure default guest session so user can explore all tabs freely
      const guest = {
        id: 'guest_nura',
        name: 'Nura Explorer',
        fastingMode: 'Orthodox Christian (Tsom)',
      };
      useAuthStore.getState().setUser(guest);
      return;
    } else if (currentUser) {
      if (isGuest) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        }
        return;
      }

      if (profileLoading) return;
      
      // If user is already authenticated and viewing login, go to tabs
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [currentUser, profile, authLoading, profileLoading, segments, isReady]);

  // 1. Maintenance Mode check (server-driven kill switch / maintenance)
  if (config?.emergency?.maintenanceMode) {
    return (
      <MaintenanceScreen
        message={config.emergency.maintenanceMessage}
        estimatedMinutes={config.emergency.estimatedDowntimeMinutes}
      />
    );
  }

  // 2. Forced Update check (server-driven Level 3 update)
  const currentCode = Constants.expoConfig?.android?.versionCode || 4;
  const minCode = config?.updateManifest?.minSupportedVersionCode || 1;
  const isOutdated = currentCode < minCode || (config?.updateManifest?.updateRequired && currentCode < (config.updateManifest.latestVersionCode || 4));

  if (isOutdated && config?.updateManifest) {
    return (
      <ForceUpdateScreen
        latestVersion={config.updateManifest.latestVersion}
        releaseNotes={config.updateManifest.releaseNotes}
        downloadUrl={config.updateManifest.downloadUrl}
        isRequired={true}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ConnectivityBanner />
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
        <Stack.Screen name="discovery" options={{ headerShown: false }} />
        <Stack.Screen name="checkin-modal" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="subscription" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
    </View>
  );
}

import FloatingNatureBackground from '../src/components/ambient/FloatingNatureBackground';
import { ThemeProvider } from '../src/context/ThemeContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider>
          <FloatingNatureBackground showSoundToggle={true}>
            <InnerLayout />
          </FloatingNatureBackground>
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#ffffff' }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#166534', marginBottom: 12 }}>NuraCare</Text>
      <Text style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 16, lineHeight: 20 }}>
        The app encountered a startup issue. Tap the button below to reload cleanly.
      </Text>
      {error?.message ? (
        <View style={{ backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', padding: 12, borderRadius: 8, marginBottom: 20, maxWidth: '90%' }}>
          <Text style={{ color: '#dc2626', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
            {error.message}
          </Text>
        </View>
      ) : null}
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
