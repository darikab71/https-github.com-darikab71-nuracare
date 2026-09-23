/**
 * NuraCare Remote Configuration API
 * Vercel Edge Function — /api/config
 *
 * Serves the server-driven remote configuration to NuraCare mobile clients.
 * Supports:
 *  - ETag-based caching (304 Not Modified for efficient polling)
 *  - Instant updates: edit REMOTE_CONFIG_JSON in Vercel env vars
 *  - No redeploy needed to change feature flags, maintenance mode, or update requirements
 *
 * Admin usage:
 *   1. Go to Vercel Dashboard → Project → Settings → Environment Variables
 *   2. Edit REMOTE_CONFIG_JSON with updated config JSON
 *   3. Changes take effect within the client's next polling cycle (~5 minutes)
 */
export const config = { runtime: 'edge' };

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, If-None-Match, X-Client-Version',
};

/** Built-in default — used if REMOTE_CONFIG_JSON env var is not set */
const DEFAULT_CONFIG = {
  version: 2,
  minSupportedAppVersion: '1.0.0',
  environment: 'production',
  updateManifest: {
    latestVersion: '1.0.3',
    latestVersionCode: 4,
    minSupportedVersionCode: 1,
    updateRequired: false,
    downloadUrl: 'https://expo.dev/artifacts/eas/GCgb_vM43BYMM1R1rOSYQgvpzfh5YqhNMdgXf9uEt0k.apk',
    releaseNotes: 'Updated Lifestyle hub, advanced priorities & routines, simplified community discovery.',
  },
  home: {
    greetingFormat: 'time_adaptive',
    refreshIntervalSeconds: 300,
    sections: [
      { id: 'sec_ai_insight', type: 'ai_insight', enabled: true, priority: 1, title: "Today's Insight", subtitle: 'Personalized wellness focus' },
      { id: 'sec_recovery', type: 'recovery', enabled: true, priority: 2, title: 'Recovery Score', subtitle: 'Based on sleep & resting heart rate' },
      { id: 'sec_sleep', type: 'sleep', enabled: true, priority: 3, title: 'Sleep Tracking', subtitle: 'Restorative sleep stages' },
      { id: 'sec_hydration', type: 'hydration', enabled: true, priority: 4, title: 'Hydration Target', subtitle: 'Daily water intake' },
      { id: 'sec_activity', type: 'activity', enabled: true, priority: 5, title: 'Daily Movement', subtitle: 'Steps and active burn' },
      { id: 'sec_nutrition', type: 'nutrition', enabled: true, priority: 6, title: 'Cultural Nutrition', subtitle: 'Ethiopian meal & fasting guidance' },
      { id: 'sec_mental_wellness', type: 'mental_wellness', enabled: true, priority: 7, title: 'Mindful Recovery', subtitle: 'Breathwork & stress reset', conditions: { requiredFeatureFlag: 'mental_wellness' } },
      { id: 'sec_quick_actions', type: 'quick_actions', enabled: true, priority: 8, title: 'Quick Access' },
    ],
  },
  features: {
    mental_wellness: true,
    wearable_sync: true,
    voice_companion: true,
    fasting_tracker: true,
    community_challenges: true,
    community: true,
    nura_chat: true,
    nura_voice: false,
    challenges: true,
    lifestyle_content: true,
    food_scanner: false,
    health_connect: false,
    offline_ai_cache: true,
    emergency_kill_switch: false,
    media_uploads: true,
    analytics: true,
  },
  community: {
    realtimeEnabled: true,
    mediaUploadsEnabled: true,
    maxPostLength: 500,
    welcomeBannerEnabled: true,
    welcomeBannerMessage: 'Welcome to the NuraCare Community! Share your wellness journey.',
  },
  ai: {
    enabled: true,
    supportedLanguages: ['en', 'am', 'om'],
    defaultTone: 'encouraging',
    maxContextTokens: 1200,
    safetyFilterLevel: 'strict',
  },
  emergency: {
    maintenanceMode: false,
    maintenanceMessage: 'NuraCare is undergoing scheduled maintenance. We\'ll be back shortly.',
    estimatedDowntimeMinutes: 30,
    killedFeatures: [],
  },
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  try {
    // Load config from env var (admin-editable without redeploy) or fall back to default
    let configPayload = DEFAULT_CONFIG;
    const envConfig = process.env.REMOTE_CONFIG_JSON;
    if (envConfig) {
      try {
        const parsed = JSON.parse(envConfig);
        // Merge env config on top of default (env wins)
        configPayload = { ...DEFAULT_CONFIG, ...parsed };
      } catch {
        console.error('[Config] Failed to parse REMOTE_CONFIG_JSON env var, using default.');
      }
    }

    // Stamp current timestamp
    configPayload = { ...configPayload, timestamp: new Date().toISOString() };

    const responseBody = JSON.stringify(configPayload);

    // ETag for efficient polling — clients send If-None-Match, we return 304 if unchanged
    const etag = `"${configPayload.version}-${Buffer.from(responseBody).length}"`;
    const clientEtag = req.headers.get('if-none-match');

    if (clientEtag === etag) {
      return new Response(null, {
        status: 304,
        headers: { ...CORS_HEADERS, ETag: etag },
      });
    }

    return new Response(responseBody, {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
        ETag: etag,
      },
    });
  } catch (err) {
    console.error('[Config] Handler error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}
