import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Download, ArrowUp, Sparkles } from 'lucide-react-native';

interface Props {
  latestVersion: string;
  releaseNotes?: string;
  downloadUrl: string;
  isRequired?: boolean;
}

/**
 * ForceUpdateScreen
 *
 * Full-screen blocker shown when app versionCode < config.updateManifest.minSupportedVersionCode.
 * Cannot be bypassed. "Later" is only shown for optional updates (Level 2).
 */
export default function ForceUpdateScreen({
  latestVersion,
  releaseNotes,
  downloadUrl,
  isRequired = true,
}: Props) {
  const handleUpdate = () => {
    Linking.openURL(downloadUrl).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />

      {/* Logo */}
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <Text style={styles.brandName}>NuraCare</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <ArrowUp size={52} color="#16a34a" />
      </View>

      {/* Badge */}
      <View style={styles.badge}>
        <Sparkles size={12} color="#16a34a" style={{ marginRight: 5 }} />
        <Text style={styles.badgeText}>v{latestVersion} Available</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {isRequired ? 'Update Required' : 'New Update Available'}
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {isRequired
          ? 'This version of NuraCare is no longer supported. Please update to continue.'
          : `A new version of NuraCare is available with improvements and new features.`}
      </Text>

      {/* Release Notes */}
      {releaseNotes && (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>What's New</Text>
          <Text style={styles.notesText}>{releaseNotes}</Text>
        </View>
      )}

      {/* Update Button */}
      <TouchableOpacity
        style={styles.updateButton}
        onPress={handleUpdate}
        activeOpacity={0.88}
      >
        <Download size={18} color="#ffffff" style={{ marginRight: 8 }} />
        <Text style={styles.updateText}>Update Now</Text>
      </TouchableOpacity>

      {/* Platform hint */}
      <Text style={styles.platformHint}>
        {Platform.OS === 'android'
          ? 'Tap to download the latest APK'
          : 'Opens App Store to update'}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 52,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  brandName: {
    color: '#14532d',
    fontSize: 20,
    fontWeight: '800',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  badgeText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#14532d',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b7c59',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  notesBox: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#d1fae5',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  updateText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  platformHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
