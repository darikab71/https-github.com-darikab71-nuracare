import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { storage } from '../storage/mmkv';

const STORAGE_KEY_ANALYTICS_QUEUE = 'nuracare_analytics_queue';
const ANALYTICS_ENDPOINT = 'https://nuracare.pro.et/api/analytics';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

class AnalyticsService {
  private queue: AnalyticsEvent[] = [];
  private flushTimer: any = null;

  constructor() {
    this.loadPersistedQueue();
    // Flush periodically every 3 minutes
    this.flushTimer = setInterval(() => {
      this.flush();
    }, 180000);
  }

  private loadPersistedQueue() {
    try {
      const saved = storage.getString(STORAGE_KEY_ANALYTICS_QUEUE);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private persistQueue() {
    try {
      storage.set(STORAGE_KEY_ANALYTICS_QUEUE, JSON.stringify(this.queue.slice(-100)));
    } catch {}
  }

  public track(name: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: new Date().toISOString(),
    };

    this.queue.push(event);
    this.persistQueue();

    // If queue is getting large, flush immediately
    if (this.queue.length >= 10) {
      this.flush();
    }
  }

  public async flush(userId?: string) {
    if (this.queue.length === 0) return;

    const eventsToUpload = [...this.queue];
    const appVersion = Constants.expoConfig?.version || '1.0.3';

    try {
      const response = await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: eventsToUpload,
          platform: Platform.OS,
          appVersion,
          userId,
        }),
      });

      if (response.ok) {
        // Remove uploaded events
        this.queue = this.queue.slice(eventsToUpload.length);
        this.persistQueue();
      }
    } catch {
      // Offline: keep in queue for next flush
    }
  }
}

export const analytics = new AnalyticsService();
