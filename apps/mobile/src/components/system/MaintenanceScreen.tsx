import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { ShieldAlert, RefreshCw, Wrench } from 'lucide-react-native';
import { useRemoteConfigStore } from '../../store/remoteConfigStore';

interface Props {
  message?: string;
  estimatedMinutes?: number;
}

/**
 * MaintenanceScreen
 *
 * Full-screen blocker shown when `config.emergency.maintenanceMode === true`.
 * Activated server-side by setting maintenanceMode: true in REMOTE_CONFIG_JSON.
 * Cannot be bypassed by the user.
 */
export default function MaintenanceScreen({ message, estimatedMinutes }: Props) {
  const { syncRemoteConfig } = useRemoteConfigStore();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const handleRetry = useCallback(async () => {
    setIsChecking(true);
    try {
      await syncRemoteConfig();
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  }, [syncRemoteConfig]);

  const displayMessage = message || "NuraCare is undergoing scheduled maintenance.\nWe'll be back shortly.";
  const eta = estimatedMinutes ? `Estimated downtime: ~${estimatedMinutes} min` : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Logo / Brand */}
      <View style={styles.brandRow}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <Text style={styles.brandName}>NuraCare</Text>
      </View>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Wrench size={56} color="#6ee7b7" />
      </View>

      {/* Title */}
      <Text style={styles.title}>Down for Maintenance</Text>

      {/* Message */}
      <Text style={styles.message}>{displayMessage}</Text>

      {/* ETA */}
      {eta && <Text style={styles.eta}>{eta}</Text>}

      {/* Last checked */}
      {lastChecked && (
        <Text style={styles.lastChecked}>Last checked: {lastChecked}</Text>
      )}

      {/* Retry Button */}
      <TouchableOpacity
        style={[styles.retryButton, isChecking && styles.retryButtonDisabled]}
        onPress={handleRetry}
        disabled={isChecking}
        activeOpacity={0.85}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <RefreshCw size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.retryText}>Check Again</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <ShieldAlert size={14} color="#6ee7b7" style={{ marginRight: 6 }} />
        <Text style={styles.footerText}>Your data is safe and secure during maintenance.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    position: 'absolute',
    top: 60,
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  brandName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 183, 0.3)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    color: '#a7f3d0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  eta: {
    fontSize: 13,
    color: '#6ee7b7',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  lastChecked: {
    fontSize: 12,
    color: 'rgba(167, 243, 208, 0.6)',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 40,
  },
  retryButtonDisabled: {
    opacity: 0.6,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
  },
  footerText: {
    color: '#6ee7b7',
    fontSize: 12,
  },
});
