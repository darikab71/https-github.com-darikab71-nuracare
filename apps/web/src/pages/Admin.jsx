import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Server,
  Zap,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Bell,
  Cpu,
  Lock,
} from 'lucide-react';

export default function AdminDashboard({ onBack }) {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState('NuraCare scheduled maintenance in progress.');
  const [featureFlags, setFeatureFlags] = useState({
    community: true,
    nura_chat: true,
    nura_voice: false,
    lifestyle_content: true,
    mental_wellness: true,
    wearable_sync: true,
    media_uploads: true,
    offline_ai_cache: true,
  });
  const [systemStats, setSystemStats] = useState({
    aiLatency: '240ms',
    realtimeConnections: 42,
    todayCheckins: 128,
    activeVersion: '1.0.3 (Code 4)',
    minSupported: '1.0.0 (Code 1)',
  });
  const [toastMsg, setToastMsg] = useState(null);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleFlag = (key) => {
    const nextVal = !featureFlags[key];
    setFeatureFlags((prev) => ({ ...prev, [key]: nextVal }));
    showNotification(`Feature flag "${key}" set to ${nextVal ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleToggleMaintenance = () => {
    const nextState = !maintenanceMode;
    setMaintenanceMode(nextState);
    showNotification(
      nextState
        ? '⚠️ MAINTENANCE MODE ACTIVATED across all clients'
        : '✅ Maintenance mode deactivated. Platform is live.'
    );
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'var(--font)' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            background: '#14532d',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            zIndex: 99999,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: '#dcfce7', borderRadius: 10, color: '#16a34a' }}>
              <Server size={24} />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
              NuraCare Platform Control Center
            </h1>
          </div>
          <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 14 }}>
            Centralized runtime configuration, live feature rollout, and platform telemetry.
          </p>
        </div>

        {onBack && (
          <button className="btn-outline-sm" onClick={onBack} style={{ cursor: 'pointer' }}>
            ← Return to App
          </button>
        )}
      </div>

      {/* Health Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: 'var(--card-bg, #ffffff)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', marginBottom: 8 }}>
            <Activity size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>AI Router</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Operational</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Avg Latency: {systemStats.aiLatency}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284c7', marginBottom: 8 }}>
            <Zap size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Realtime Hub</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Replicating</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Channels: {systemStats.realtimeConnections} Active</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6366f1', marginBottom: 8 }}>
            <Layers size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Active Version</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{systemStats.activeVersion}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Min Allowed: {systemStats.minSupported}</div>
        </div>

        <div style={{ background: 'var(--card-bg, #ffffff)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: maintenanceMode ? '#dc2626' : '#16a34a', marginBottom: 8 }}>
            <ShieldAlert size={18} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>Platform State</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: maintenanceMode ? '#dc2626' : '#16a34a' }}>
            {maintenanceMode ? 'MAINTENANCE' : 'ALL SYSTEMS LIVE'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {maintenanceMode ? 'Clients Locked' : 'Full Online Experience'}
          </div>
        </div>
      </div>

      {/* Emergency Kill Switch & Maintenance Mode */}
      <div
        style={{
          background: maintenanceMode ? '#fef2f2' : 'var(--card-bg, #ffffff)',
          border: `1.5px solid ${maintenanceMode ? '#f87171' : 'var(--border)'}`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: maintenanceMode ? '#dc2626' : 'var(--text)' }}>
              <AlertTriangle size={20} color={maintenanceMode ? '#dc2626' : '#f59e0b'} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Emergency Maintenance Switch</h3>
            </div>
            <p style={{ margin: '8px 0 16px', color: 'var(--text-muted)', fontSize: 14, maxWidth: '650px', lineHeight: 1.5 }}>
              Activating maintenance mode immediately instructs both Mobile and Web clients to display the full-screen
              maintenance lock screen on their next ping cycle (~15-30s).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="text"
                value={maintenanceNotice}
                onChange={(e) => setMaintenanceNotice(e.target.value)}
                placeholder="Custom downtime message..."
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  minWidth: '320px',
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          <button
            onClick={handleToggleMaintenance}
            style={{
              padding: '12px 24px',
              borderRadius: 12,
              background: maintenanceMode ? '#16a34a' : '#dc2626',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            {maintenanceMode ? 'Deactivate Maintenance (Go Live)' : 'Activate Maintenance Mode'}
          </button>
        </div>
      </div>

      {/* Centralized Feature Flags */}
      <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border)', borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
          Runtime Feature Toggles (Zero Binary Rebuild)
        </h3>
        <p style={{ margin: '0 0 20px', color: 'var(--text-muted)', fontSize: 14 }}>
          Enable or disable capabilities on the fly across Mobile and Web without republishing to the App Store.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {Object.entries(featureFlags).map(([key, isEnabled]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 14,
                background: isEnabled ? 'rgba(22, 163, 74, 0.05)' : 'var(--bg, #f8fafc)',
                border: `1px solid ${isEnabled ? 'rgba(22, 163, 74, 0.3)' : 'var(--border)'}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 11, color: isEnabled ? '#16a34a' : 'var(--text-muted)' }}>
                  {isEnabled ? '● Active in production' : '○ Disabled remotely'}
                </div>
              </div>

              <button
                onClick={() => handleToggleFlag(key)}
                style={{
                  background: isEnabled ? '#16a34a' : '#9ca3af',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
