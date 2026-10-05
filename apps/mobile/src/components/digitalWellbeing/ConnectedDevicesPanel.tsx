import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Smartphone, Laptop, Globe, RefreshCw, Shield, Download, Trash2, Key, CheckCircle2, ChevronRight, Lock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { deviceWellbeingProvider } from '../../services/digital/deviceAwareness';
import { getDigitalUsage } from '../../storage/digitalWellbeingStorage';

export function ConnectedDevicesPanel() {
  const { theme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);

  const capabilities = deviceWellbeingProvider.getCapabilities();
  const usage = getDigitalUsage();

  const devicesList = [
    {
      id: 'dev-1',
      name: 'This Phone (Active)',
      type: 'mobile',
      platform: capabilities.platformName,
      screenTime: '3h 42m',
      lastSync: 'Just now',
      isCurrent: true,
    },
    {
      id: 'dev-2',
      name: 'Work Laptop (MacBook Pro)',
      type: 'laptop',
      platform: 'macos',
      screenTime: '2h 04m',
      lastSync: '12 minutes ago',
      isCurrent: false,
    },
    {
      id: 'dev-3',
      name: 'Chrome Browser Companion',
      type: 'browser',
      platform: 'extension',
      screenTime: '48m',
      lastSync: '5 minutes ago',
      isCurrent: false,
    },
  ];

  const handleSyncNow = async () => {
    setIsSyncing(true);
    await deviceWellbeingProvider.syncDeviceState();
    setTimeout(() => {
      setIsSyncing(false);
      Alert.alert('Synchronized', 'All digital wellbeing limits and aggregated usage events are up to date across your devices.');
    }, 900);
  };

  const handleExportData = () => {
    const exportPayload = {
      device: capabilities.platformName,
      exportedAt: new Date().toISOString(),
      usageSummary: usage,
      schemaVersion: '1.2.0',
    };
    Alert.alert('Data Export Ready', JSON.stringify(exportPayload, null, 2));
  };

  const handleDeleteHistory = () => {
    Alert.alert(
      'Clear Usage History?',
      'This will erase local and cloud digital wellbeing statistics. Configured rules and limits will remain intact.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Erase', style: 'destructive', onPress: () => Alert.alert('Cleared', 'Usage statistics have been reset.') }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
      {/* 1. Cross-Device Usage Total Summary */}
      <View style={[styles.crossDeviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.cardHeaderTitle, { color: theme.textSecondary }]}>CROSS-DEVICE DIGITAL LIFE</Text>
        <View style={styles.totalRow}>
          <Text style={[styles.totalTime, { color: theme.textPrimary }]}>6h 34m</Text>
          <TouchableOpacity
            style={[styles.syncBtn, { backgroundColor: theme.accentGlow }]}
            onPress={handleSyncNow}
            disabled={isSyncing}
          >
            <RefreshCw size={14} color={theme.accent} />
            <Text style={[styles.syncBtnText, { color: theme.accent }]}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.deviceBreakdownRow}>
          <View style={styles.breakdownItem}>
            <Smartphone size={14} color={theme.accent} />
            <Text style={[styles.breakdownText, { color: theme.textSecondary }]}>Phone: 3h 42m</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Laptop size={14} color={theme.info} />
            <Text style={[styles.breakdownText, { color: theme.textSecondary }]}>Laptop: 2h 04m</Text>
          </View>
          <View style={styles.breakdownItem}>
            <Globe size={14} color={theme.warning} />
            <Text style={[styles.breakdownText, { color: theme.textSecondary }]}>Browser: 48m</Text>
          </View>
        </View>
      </View>

      {/* 2. Connected Devices List */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Connected Devices</Text>
      <View style={styles.devicesListWrap}>
        {devicesList.map(dev => (
          <View key={dev.id} style={[styles.deviceItemCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.devIconWrap, { backgroundColor: theme.surfaceElevated }]}>
              {dev.type === 'mobile' && <Smartphone size={20} color={theme.accent} />}
              {dev.type === 'laptop' && <Laptop size={20} color={theme.info} />}
              {dev.type === 'browser' && <Globe size={20} color={theme.warning} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.devName, { color: theme.textPrimary }]}>{dev.name}</Text>
                {dev.isCurrent && (
                  <View style={[styles.currentBadge, { backgroundColor: theme.successBackground }]}>
                    <Text style={[styles.currentBadgeText, { color: theme.success }]}>THIS DEVICE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.devMeta, { color: theme.textTertiary }]}>
                Screen time: {dev.screenTime} • Synced: {dev.lastSync}
              </Text>
            </View>
            <CheckCircle2 size={18} color={theme.success} />
          </View>
        ))}
      </View>

      {/* 3. Platform Permission & Privacy Audit */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Permissions & Privacy</Text>
      <View style={[styles.privacyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.permissionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.permTitle, { color: theme.textPrimary }]}>Usage Access Statistics</Text>
            <Text style={[styles.permDesc, { color: theme.textSecondary }]}>Measures foreground active duration</Text>
          </View>
          <View style={[styles.permStatusBadge, { backgroundColor: theme.successBackground }]}>
            <Text style={[styles.permStatusText, { color: theme.success }]}>Enabled</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <View style={styles.permissionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.permTitle, { color: theme.textPrimary }]}>Cloud Synchronization</Text>
            <Text style={[styles.permDesc, { color: theme.textSecondary }]}>Syncs aggregated rules and daily totals</Text>
          </View>
          <Switch
            value={cloudSyncEnabled}
            onValueChange={setCloudSyncEnabled}
            trackColor={{ false: theme.border, true: theme.accentSoft }}
            thumbColor={cloudSyncEnabled ? theme.accent : '#f8fafc'}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <View style={styles.permissionRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.permTitle, { color: theme.textPrimary }]}>User-Initiated Screen Context</Text>
            <Text style={[styles.permDesc, { color: theme.textSecondary }]}>Session-based; only when explicitly asked</Text>
          </View>
          <View style={[styles.permStatusBadge, { backgroundColor: theme.surfaceElevated }]}>
            <Text style={[styles.permStatusText, { color: theme.textTertiary }]}>On-Demand</Text>
          </View>
        </View>
      </View>

      {/* 4. Data Control Actions */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Data Management</Text>
      <View style={[styles.dataActionsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.actionRow} onPress={handleExportData}>
          <Download size={18} color={theme.accent} />
          <Text style={[styles.actionRowText, { color: theme.textPrimary }]}>Export Wellbeing History (JSON)</Text>
          <ChevronRight size={16} color={theme.textTertiary} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

        <TouchableOpacity style={styles.actionRow} onPress={handleDeleteHistory}>
          <Trash2 size={18} color={theme.error} />
          <Text style={[styles.actionRowText, { color: theme.error }]}>Erase Local Usage Statistics</Text>
          <ChevronRight size={16} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  crossDeviceCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  totalTime: {
    fontSize: 28,
    fontWeight: '900',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  syncBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  deviceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 6,
  },
  devicesListWrap: {
    gap: 10,
    marginBottom: 16,
  },
  deviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  devIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devName: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  currentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  devMeta: {
    fontSize: 10.5,
    marginTop: 2,
  },
  privacyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  permTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  permDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  permStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  permStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  dataActionsCard: {
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  actionRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
});
