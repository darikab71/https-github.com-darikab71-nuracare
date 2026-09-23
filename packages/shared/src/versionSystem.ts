/**
 * NuraCare Version Compatibility & Update Classification System
 * Evaluates client vs. server versions across Android, iOS, and Web.
 */

export interface VersionManifest {
  appVersion: string;
  versionCode: number;
  minSupportedVersion: string;
  minSupportedVersionCode: number;
  releaseDate: string;
  downloadUrl?: string;
  releaseNotes?: string;
}

export type UpdateLevel = 
  | 'LEVEL_1_SERVER_ONLY'     // No app store or binary update; cloud changes propagate silently
  | 'LEVEL_2_OPTIONAL_UPDATE'  // Client works, but newer version exists; show gentle update card/modal
  | 'LEVEL_3_REQUIRED_UPDATE'; // Client is below minimum supported threshold; full screen block

export function evaluateUpdateRequirement(
  clientVersionCode: number,
  manifest: VersionManifest
): { level: UpdateLevel; isRequired: boolean; isOptional: boolean } {
  // Level 3: Installed version is strictly below minimum supported threshold
  if (clientVersionCode < manifest.minSupportedVersionCode) {
    return { level: 'LEVEL_3_REQUIRED_UPDATE', isRequired: true, isOptional: false };
  }

  // Level 2: Newer version exists, but current version meets minimum threshold
  if (clientVersionCode < manifest.versionCode) {
    return { level: 'LEVEL_2_OPTIONAL_UPDATE', isRequired: false, isOptional: true };
  }

  // Level 1: Client is fully up-to-date
  return { level: 'LEVEL_1_SERVER_ONLY', isRequired: false, isOptional: false };
}
