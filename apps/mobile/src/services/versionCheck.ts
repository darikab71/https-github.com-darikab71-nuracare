import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

const VERSION_CHECK_URL = 'https://nuracare.pro.et/version.json';

export async function checkForAppUpdates(showUpToDateAlert = false) {
  if (Platform.OS === 'web') return;

  try {
    const currentVersion = Constants.expoConfig?.version || '1.0.0';
    const currentVersionCode = Constants.expoConfig?.android?.versionCode || 1;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return;

    const remote = await res.json();
    const remoteVersionCode = remote.versionCode || 1;
    const remoteVersion = remote.appVersion || '1.0.0';

    const hasUpdate = remoteVersionCode > currentVersionCode || (remoteVersion !== currentVersion && remoteVersionCode >= currentVersionCode);

    if (hasUpdate) {
      Alert.alert(
        '🚀 New Update Available',
        `A new version (${remoteVersion}) of NuraCare is available.\n\nWhat's New:\n${remote.releaseNotes || 'Bug fixes and performance improvements.'}`,
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'Update Now', 
            onPress: () => {
              const url = remote.downloadUrl || `${remote.websiteUrl || 'https://nuracare.pro.et'}`;
              Linking.openURL(url).catch(() => {});
            } 
          }
        ]
      );
    } else if (showUpToDateAlert) {
      Alert.alert('✅ Up to Date', `You are using the latest version of NuraCare (${currentVersion}).`);
    }
  } catch (err) {
    // Non-blocking background check
    if (showUpToDateAlert) {
      Alert.alert('Notice', 'Unable to reach the update server right now. Please check again later.');
    }
  }
}