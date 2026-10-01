import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNetworkState } from '@/hooks/useNetworkState';

export default function OfflineBanner() {
  const { isOnline, isSyncing } = useNetworkState();

  if (isOnline && !isSyncing) return null;

  return (
    <div
      style={{
        width: '100%',
        padding: '6px 16px',
        backgroundColor: isSyncing ? '#064e3b' : '#78350f',
        color: '#ffffff',
        fontSize: '12px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        position: 'sticky',
        top: 0,
        zIndex: 99999,
        transition: 'background-color 0.3s ease',
      }}
    >
      {isSyncing ? (
        <>
          <RefreshCw size={14} className="animate-spin" color="#6ee7b7" />
          <span>Back Online • Syncing your NuraCare data...</span>
        </>
      ) : (
        <>
          <WifiOff size={14} color="#fde68a" />
          <span>Offline Mode • Your daily check-ins, medication logs & routines are safely cached</span>
        </>
      )}
    </div>
  );
}
