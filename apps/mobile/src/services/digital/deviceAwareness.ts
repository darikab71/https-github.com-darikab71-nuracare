import { Platform } from 'react-native';
import { getDigitalUsage, getAppLimits, DigitalUsageSnapshot, AppLimitItem } from '../../storage/digitalWellbeingStorage';

export interface DeviceCapabilities {
  supportsAppUsage: boolean;
  supportsAppBlocking: boolean;
  supportsWebsiteBlocking: boolean;
  supportsSchedules: boolean;
  supportsScreenContext: boolean;
  supportsLocalNotifications: boolean;
  platformName: 'android' | 'ios' | 'web';
}

export interface PermissionStatusInfo {
  usageAccess: 'granted' | 'denied' | 'unsupported';
  notifications: 'granted' | 'denied' | 'unsupported';
  appRestrictions: 'granted' | 'denied' | 'unsupported';
  screenContext: 'granted' | 'denied' | 'unsupported';
  accessibilityService: 'granted' | 'denied' | 'unsupported';
}

export interface CurrentActivityStatus {
  appName: string;
  packageName: string;
  category: string;
  sessionDurationSeconds: number;
  todayDurationMinutes: number;
  dailyLimitMinutes?: number;
  remainingMinutes?: number;
  status: 'healthy' | 'warning' | 'limit_reached' | 'blocked';
}

export interface DeviceWellbeingProvider {
  getCapabilities(): DeviceCapabilities;
  getPermissions(): Promise<PermissionStatusInfo>;
  requestPermission(permission: keyof PermissionStatusInfo): Promise<boolean>;
  getCurrentActivity(): CurrentActivityStatus;
  getUsageSummary(): DigitalUsageSnapshot;
  blockApp(packageName: string, durationMinutes?: number): Promise<boolean>;
  unblockApp(packageName: string): Promise<boolean>;
  syncDeviceState(): Promise<{ success: boolean; timestamp: string }>;
}

class AndroidDeviceWellbeingProvider implements DeviceWellbeingProvider {
  getCapabilities(): DeviceCapabilities {
    return {
      supportsAppUsage: true,
      supportsAppBlocking: true,
      supportsWebsiteBlocking: true,
      supportsSchedules: true,
      supportsScreenContext: true,
      supportsLocalNotifications: true,
      platformName: 'android',
    };
  }

  async getPermissions(): Promise<PermissionStatusInfo> {
    return {
      usageAccess: 'granted',
      notifications: 'granted',
      appRestrictions: 'granted',
      screenContext: 'denied',
      accessibilityService: 'unsupported',
    };
  }

  async requestPermission(_permission: keyof PermissionStatusInfo): Promise<boolean> {
    return true;
  }

  getCurrentActivity(): CurrentActivityStatus {
    const limits = getAppLimits();
    const instaLimit = limits.find(l => l.name.toLowerCase().includes('instagram'));
    const used = instaLimit?.usedMinutesToday || 46;
    const limit = instaLimit?.dailyLimitMinutes || 50;
    const rem = Math.max(0, limit - used);

    return {
      appName: 'Instagram',
      packageName: 'com.instagram.android',
      category: 'Social Media',
      sessionDurationSeconds: 14 * 60 + 22,
      todayDurationMinutes: used,
      dailyLimitMinutes: limit,
      remainingMinutes: rem,
      status: rem === 0 ? 'limit_reached' : rem <= 10 ? 'warning' : 'healthy',
    };
  }

  getUsageSummary(): DigitalUsageSnapshot {
    return getDigitalUsage();
  }

  async blockApp(_packageName: string, _durationMinutes?: number): Promise<boolean> {
    return true;
  }

  async unblockApp(_packageName: string): Promise<boolean> {
    return true;
  }

  async syncDeviceState(): Promise<{ success: boolean; timestamp: string }> {
    return { success: true, timestamp: new Date().toISOString() };
  }
}

class IOSDeviceWellbeingProvider implements DeviceWellbeingProvider {
  getCapabilities(): DeviceCapabilities {
    return {
      supportsAppUsage: true,
      supportsAppBlocking: true,
      supportsWebsiteBlocking: false,
      supportsSchedules: true,
      supportsScreenContext: false,
      supportsLocalNotifications: true,
      platformName: 'ios',
    };
  }

  async getPermissions(): Promise<PermissionStatusInfo> {
    return {
      usageAccess: 'granted',
      notifications: 'granted',
      appRestrictions: 'granted',
      screenContext: 'unsupported',
      accessibilityService: 'unsupported',
    };
  }

  async requestPermission(_permission: keyof PermissionStatusInfo): Promise<boolean> {
    return true;
  }

  getCurrentActivity(): CurrentActivityStatus {
    return {
      appName: 'Instagram',
      packageName: 'com.burbn.instagram',
      category: 'Social Media',
      sessionDurationSeconds: 12 * 60 + 10,
      todayDurationMinutes: 42,
      dailyLimitMinutes: 45,
      remainingMinutes: 3,
      status: 'warning',
    };
  }

  getUsageSummary(): DigitalUsageSnapshot {
    return getDigitalUsage();
  }

  async blockApp(_packageName: string, _durationMinutes?: number): Promise<boolean> {
    return true;
  }

  async unblockApp(_packageName: string): Promise<boolean> {
    return true;
  }

  async syncDeviceState(): Promise<{ success: boolean; timestamp: string }> {
    return { success: true, timestamp: new Date().toISOString() };
  }
}

class WebDeviceWellbeingProvider implements DeviceWellbeingProvider {
  getCapabilities(): DeviceCapabilities {
    return {
      supportsAppUsage: false,
      supportsAppBlocking: false,
      supportsWebsiteBlocking: true,
      supportsSchedules: true,
      supportsScreenContext: true,
      supportsLocalNotifications: true,
      platformName: 'web',
    };
  }

  async getPermissions(): Promise<PermissionStatusInfo> {
    return {
      usageAccess: 'unsupported',
      notifications: 'granted',
      appRestrictions: 'unsupported',
      screenContext: 'denied',
      accessibilityService: 'unsupported',
    };
  }

  async requestPermission(_permission: keyof PermissionStatusInfo): Promise<boolean> {
    return true;
  }

  getCurrentActivity(): CurrentActivityStatus {
    return {
      appName: 'Chrome',
      packageName: 'browser.chrome',
      category: 'Browser',
      sessionDurationSeconds: 18 * 60 + 42,
      todayDurationMinutes: 72,
      dailyLimitMinutes: 90,
      remainingMinutes: 18,
      status: 'healthy',
    };
  }

  getUsageSummary(): DigitalUsageSnapshot {
    return getDigitalUsage();
  }

  async blockApp(_packageName: string, _durationMinutes?: number): Promise<boolean> {
    return false;
  }

  async unblockApp(_packageName: string): Promise<boolean> {
    return false;
  }

  async syncDeviceState(): Promise<{ success: boolean; timestamp: string }> {
    return { success: true, timestamp: new Date().toISOString() };
  }
}

export function createDeviceWellbeingProvider(): DeviceWellbeingProvider {
  if (Platform.OS === 'android') {
    return new AndroidDeviceWellbeingProvider();
  } else if (Platform.OS === 'ios') {
    return new IOSDeviceWellbeingProvider();
  } else {
    return new WebDeviceWellbeingProvider();
  }
}

export const deviceWellbeingProvider = createDeviceWellbeingProvider();
