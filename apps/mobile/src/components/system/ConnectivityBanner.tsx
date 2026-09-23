import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { useNetworkState, ConnectivityStatus } from '../../services/connectivity/networkMonitor';

export default function ConnectivityBanner() {
  const { status } = useNetworkState();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [bannerType, setBannerType] = useState<'offline' | 'reconnecting' | 'syncing' | 'online'>('offline');

  useEffect(() => {
    if (status === 'OFFLINE') {
      setMessage('Offline • Personal routines & logs are active on this device');
      setBannerType('offline');
      setVisible(true);
    } else if (status === 'RECONNECTING') {
      setMessage('Connecting to NuraCare Cloud...');
      setBannerType('reconnecting');
      setVisible(true);
    } else if (status === 'SYNCING') {
      setMessage('Back Online • Syncing your records...');
      setBannerType('syncing');
      setVisible(true);
    } else if (status === 'ONLINE') {
      if (visible && (bannerType === 'offline' || bannerType === 'syncing')) {
        setMessage('Everything is up to date');
        setBannerType('online');
        const timer = setTimeout(() => setVisible(false), 2000);
        return () => clearTimeout(timer);
      } else {
        setVisible(false);
      }
    }
  }, [status]);

  if (!visible) return null;

  const bgColors = {
    offline: '#78350f',      // amber-900
    reconnecting: '#1e3a8a', // blue-900
    syncing: '#064e3b',      // emerald-900
    online: '#14532d',       // green-900
  };

  return (
    <View style={[styles.banner, { backgroundColor: bgColors[bannerType] }]}>
      <View style={styles.content}>
        {bannerType === 'offline' && <WifiOff size={14} color="#fde68a" style={styles.icon} />}
        {bannerType === 'reconnecting' && <ActivityIndicator size="small" color="#93c5fd" style={styles.icon} />}
        {bannerType === 'syncing' && <RefreshCw size={14} color="#6ee7b7" style={styles.icon} />}
        {bannerType === 'online' && <CheckCircle2 size={14} color="#86efac" style={styles.icon} />}
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    zIndex: 9999,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
