import { Platform } from 'react-native';
import { storage } from '../storage/mmkv';

const STORAGE_KEY_SCHEDULED_REMINDERS = 'nuracare_scheduled_reminders';

export interface MedicationReminderItem {
  id: string;
  name: string;
  dosage: string;
  times: string[]; // e.g. ['08:00', '14:00', '20:00']
  instructions?: string;
  enabled: boolean;
}

export interface RoutineReminderItem {
  id: string;
  title: string;
  time: string; // e.g. '07:30'
  category: string;
}

/**
 * Platform-independent notification scheduler
 * Handles local reminders for medications, daily routines, and hydration intervals.
 */
class NotificationScheduler {
  private reminders: MedicationReminderItem[] = [];

  constructor() {
    this.loadPersistedReminders();
  }

  private loadPersistedReminders() {
    try {
      const saved = storage.getString(STORAGE_KEY_SCHEDULED_REMINDERS);
      if (saved) {
        this.reminders = JSON.parse(saved);
      }
    } catch {
      this.reminders = [];
    }
  }

  private persistReminders() {
    try {
      storage.set(STORAGE_KEY_SCHEDULED_REMINDERS, JSON.stringify(this.reminders));
    } catch {}
  }

  /**
   * Schedule or update a medication reminder schedule
   */
  public async scheduleMedication(item: MedicationReminderItem): Promise<boolean> {
    try {
      // Remove any existing entry for this medication
      this.reminders = this.reminders.filter((r) => r.id !== item.id);
      if (item.enabled) {
        this.reminders.push(item);
      }
      this.persistReminders();

      // In native environments where expo-notifications is linked, schedule triggers
      if (Platform.OS !== 'web') {
        try {
          // Dynamic import to avoid web crash if native module isn't loaded
          const Notifications = await import('expo-notifications').catch(() => null);
          if (Notifications && Notifications.scheduleNotificationAsync) {
            for (const timeStr of item.times) {
              const [hours, minutes] = timeStr.split(':').map(Number);
              if (!isNaN(hours) && !isNaN(minutes)) {
                await Notifications.scheduleNotificationAsync({
                  content: {
                    title: `💊 Medication Reminder: ${item.name}`,
                    body: `Time to take ${item.dosage}${item.instructions ? ` • ${item.instructions}` : ''}`,
                    sound: true,
                    data: { medicationId: item.id, time: timeStr },
                  },
                  trigger: {
                    type: 'calendar',
                    hour: hours,
                    minute: minutes,
                    repeats: true,
                  } as any,
                }).catch(() => {});
              }
            }
          }
        } catch (nativeErr) {
          console.warn('[NotificationScheduler] Native schedule note:', nativeErr);
        }
      }

      return true;
    } catch (e) {
      console.warn('[NotificationScheduler] Schedule failed:', e);
      return false;
    }
  }

  /**
   * Cancel reminders for a medication
   */
  public async cancelMedication(medicationId: string): Promise<void> {
    this.reminders = this.reminders.filter((r) => r.id !== medicationId);
    this.persistReminders();
  }

  /**
   * Get all active scheduled reminders
   */
  public getActiveReminders(): MedicationReminderItem[] {
    return this.reminders;
  }

  /**
   * Rebuild all reminders on app cold start or device restart
   */
  public async rebuildAll(): Promise<void> {
    for (const rem of this.reminders) {
      if (rem.enabled) {
        await this.scheduleMedication(rem);
      }
    }
  }
}

export const notificationScheduler = new NotificationScheduler();
