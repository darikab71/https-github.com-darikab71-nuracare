import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

/**
 * WebUpdateToast
 * Periodically checks /version.json to detect when a new web deployment is available.
 * Displays a subtle, non-intrusive notification prompting the user to refresh.
 */
export default function WebUpdateToast() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [latestVersion, setLatestVersion] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Current web bundle boot timestamp
    const bootTime = Date.now();

    const checkWebVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        
        const localVersion = localStorage.getItem('nuracare_web_version') || '1.0.3';
        if (data.appVersion && data.appVersion !== localVersion) {
          setLatestVersion(data.appVersion);
          setHasUpdate(true);
        }
      } catch {}
    };

    // Check 10 seconds after boot, then every 5 minutes
    const initialTimer = setTimeout(checkWebVersion, 10000);
    const interval = setInterval(checkWebVersion, 300000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  if (!hasUpdate || dismissed) return null;

  const handleRefresh = () => {
    if (latestVersion) {
      localStorage.setItem('nuracare_web_version', latestVersion);
    }
    window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 999999,
        background: '#131e17',
        color: '#ffffff',
        padding: '12px 18px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(34, 197, 94, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        fontFamily: 'var(--font, sans-serif)',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'rgba(34, 197, 94, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#4ade80',
        }}
      >
        <Sparkles size={16} />
      </div>

      <div>
        <div style={{ fontWeight: 700, color: '#f0fdf4' }}>New NuraCare Version Ready</div>
        <div style={{ color: '#86efac', fontSize: '11px' }}>
          {latestVersion ? `Version ${latestVersion} is live` : 'An update has been deployed'}
        </div>
      </div>

      <button
        onClick={handleRefresh}
        style={{
          marginLeft: 8,
          background: '#16a34a',
          color: '#ffffff',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '10px',
          fontSize: '12px',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <RefreshCw size={12} /> Refresh
      </button>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#9ca3af',
          cursor: 'pointer',
          padding: 4,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
