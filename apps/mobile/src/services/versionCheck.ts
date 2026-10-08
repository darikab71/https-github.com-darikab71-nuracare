import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

const VERSION_CHECK_URL = 'https://nuracare.pro.et/version.json';

export interface VersionManifest {
  appVersion: string;
  versionCode: number;
  minVersionCode?: number;
  forceUpdate?: boolean;
  releaseDate?: string;
  releaseNotes?: string;
  downloadUrl?: string;
  websiteUrl?: string;
  features?: Record<string, boolean>;
}

/**
 * Checks the remote version.json on every app launch.
 * Designed like PUBG Mobile:
 *  - Silent check in background, no spinner shown to user
 *  - If optional update → friendly "What's New" alert with Skip option
 *  - If forceUpdate === true → mandatory alert, user MUST update
 *  - minVersionCode → force-update if installed version is below minimum
 */
export async function checkForAppUpdates(showUpToDateAlert = false): Promise<VersionManifest | null> {
  if (Platform.OS === 'web') return null;

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

    if (!res.ok) return null;

    const remote: VersionManifest = await res.json();
    const remoteVersionCode = remote.versionCode || 1;
    const minCode = remote.minVersionCode || 1;

    const isBelowMinimum = currentVersionCode < minCode;
    const isForced = remote.forceUpdate === true || isBelowMinimum;
    const hasUpdate = remoteVersionCode > currentVersionCode;

    if (!hasUpdate) {
      if (showUpToDateAlert) {
        Alert.alert('✅ Up to Date', `You have the latest NuraCare (v${currentVersion}).`);
      }
      return remote;
    }

    const downloadUrl = (() => {
      let url = remote.downloadUrl || `${remote.websiteUrl || 'https://nuracare.pro.et'}/nuracare.apk`;
      if (url.startsWith('/')) url = `${remote.websiteUrl || 'https://nuracare.pro.et'}${url}`;
      return url;
    })();

    // Parse release notes into bullet points for display
    const notes = remote.releaseNotes || 'Performance improvements and bug fixes.';
    const noteLines = notes.split('\n').filter(Boolean).map(l => l.trim()).join('\n');

    const title = isForced
      ? '⚠️ Update Required'
      : `🚀 NuraCare v${remote.appVersion} Available`;

    const message = isForced
      ? `This version of NuraCare is no longer supported.\n\nPlease update to continue using the app.\n\n${noteLines}`
      : `What's New in v${remote.appVersion}:\n\n${noteLines}`;

    const buttons = isForced
      ? [
          {
            text: 'Update Now',
            onPress: () => Linking.openURL(downloadUrl).catch(() => {}),
          },
        ]
      : [
          { text: 'Later', style: 'cancel' as const },
          {
            text: 'Update Now',
            onPress: () => Linking.openURL(downloadUrl).catch(() => {}),
          },
        ];

    Alert.alert(title, message, buttons, {
      cancelable: !isForced,
    });

    return remote;
  } catch {
    // Silent fail — update check is non-blocking
    return null;
  }
}

/**
 * Returns feature flags from the remote manifest if cached,
 * or empty object if the version check hasn't run yet.
 */
export function getRemoteFeatures(manifest: VersionManifest | null): Record<string, boolean> {
  return manifest?.features || {};
}