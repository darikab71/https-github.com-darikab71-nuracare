import { useState, useEffect } from 'react';

export type ConnectivityStatus =
  | 'ONLINE'
  | 'SYNCING'
  | 'RECONNECTING'
  | 'OFFLINE'
  | 'SERVER_UNAVAILABLE'
  | 'MAINTENANCE';

class NetworkMonitor {
  private status: ConnectivityStatus = 'ONLINE';
  private listeners: ((status: ConnectivityStatus) => void)[] = [];
  private checkInterval: any = null;
  private consecutiveFailures = 0;

  constructor() {
    this.startPinging();
  }

  public getStatus(): ConnectivityStatus {
    return this.status;
  }

  public subscribe(listener: (status: ConnectivityStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.status);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(newStatus: ConnectivityStatus) {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.listeners.forEach((l) => l(newStatus));
    }
  }

  public async checkConnectivity(): Promise<ConnectivityStatus> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);

      // Lightweight ping to remote-config or health check
      const res = await fetch('https://nuracare.pro.et/remote-config.json?ping=' + Date.now(), {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timer);

      if (res.ok || res.status === 304) {
        if (this.status === 'OFFLINE' || this.status === 'RECONNECTING') {
          this.notify('SYNCING');
          setTimeout(() => this.notify('ONLINE'), 1500);
        } else {
          this.notify('ONLINE');
        }
        this.consecutiveFailures = 0;
        return 'ONLINE';
      } else if (res.status === 503) {
        this.notify('MAINTENANCE');
        return 'MAINTENANCE';
      } else {
        this.notify('SERVER_UNAVAILABLE');
        return 'SERVER_UNAVAILABLE';
      }
    } catch {
      this.consecutiveFailures++;
      if (this.consecutiveFailures >= 2) {
        this.notify('OFFLINE');
      } else {
        this.notify('RECONNECTING');
      }
      return 'OFFLINE';
    }
  }

  private startPinging() {
    this.checkConnectivity();
    this.checkInterval = setInterval(() => {
      this.checkConnectivity();
    }, 15000);
  }

  public destroy() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.listeners = [];
  }
}

export const networkMonitor = new NetworkMonitor();

export function useNetworkState() {
  const [status, setStatus] = useState<ConnectivityStatus>(networkMonitor.getStatus());

  useEffect(() => {
    return networkMonitor.subscribe((newStatus) => {
      setStatus(newStatus);
    });
  }, []);

  return {
    status,
    isOnline: status === 'ONLINE' || status === 'SYNCING',
    isOffline: status === 'OFFLINE',
    isReconnecting: status === 'RECONNECTING',
    isSyncing: status === 'SYNCING',
  };
}
