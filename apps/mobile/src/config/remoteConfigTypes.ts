/**
 * NuraCare Server-Driven UI (SDUI) & Remote Configuration Types
 *
 * Strict declarative schemas. Never contains executable JS or code strings.
 */

export type SectionType =
  | 'recovery'
  | 'sleep'
  | 'hydration'
  | 'nutrition'
  | 'activity'
  | 'ai_insight'
  | 'mental_wellness'
  | 'quick_actions'
  | 'health_vault_summary'
  | 'fasting_banner';

export interface SDUISection {
  id: string;
  type: SectionType;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  title?: string;
  subtitle?: string;
  badge?: string;
  payload?: Record<string, any>;
  // Visibility rules
  conditions?: {
    minAppVersion?: string;
    maxAppVersion?: string;
    timeOfDay?: ('morning' | 'afternoon' | 'evening' | 'night')[];
    minRecoveryScore?: number;
    maxRecoveryScore?: number;
    requiresFasting?: boolean;
    requiredFeatureFlag?: string;
  };
}

export interface FeatureFlags {
  // Core wellness features
  mental_wellness: boolean;
  wearable_sync: boolean;
  voice_companion: boolean;
  fasting_tracker: boolean;
  // Community
  community: boolean;
  community_challenges: boolean;
  challenges: boolean;
  media_uploads: boolean;
  // AI
  nura_chat: boolean;
  nura_voice: boolean;
  offline_ai_cache: boolean;
  // Lifestyle
  lifestyle_content: boolean;
  // Devices
  food_scanner: boolean;
  health_connect: boolean;
  // Platform
  analytics: boolean;
  // Kill switch — overrides all features when true
  emergency_kill_switch: boolean;
  // Allow any additional flags from server
  [key: string]: boolean;
}

/** Update manifest — controls 3-level update system */
export interface UpdateManifest {
  latestVersion: string;
  latestVersionCode: number;
  /** If current app versionCode < this, force update screen is shown (Level 3) */
  minSupportedVersionCode: number;
  /** If true AND current < latest, force update (Level 3). If false, optional Alert (Level 2). */
  updateRequired: boolean;
  downloadUrl: string;
  releaseNotes: string;
}

/** Community server-driven settings */
export interface CommunityConfig {
  realtimeEnabled: boolean;
  mediaUploadsEnabled: boolean;
  maxPostLength: number;
  welcomeBannerEnabled: boolean;
  welcomeBannerMessage: string;
}

export interface RemoteConfigPayload {
  version: number;
  minSupportedAppVersion: string;
  environment: 'production' | 'staging' | 'development';
  timestamp: string;
  etag?: string;
  updateManifest?: UpdateManifest;
  home: {
    greetingFormat: 'time_adaptive' | 'standard';
    refreshIntervalSeconds: number;
    sections: SDUISection[];
  };
  features: FeatureFlags;
  community?: CommunityConfig;
  ai: {
    enabled: boolean;
    supportedLanguages: ('en' | 'am' | 'om')[];
    defaultTone: 'encouraging' | 'clinical' | 'concise';
    maxContextTokens: number;
    safetyFilterLevel: 'strict' | 'moderate';
  };
  emergency: {
    maintenanceMode: boolean;
    maintenanceMessage?: string;
    estimatedDowntimeMinutes?: number;
    killedFeatures: string[];
  };
}
