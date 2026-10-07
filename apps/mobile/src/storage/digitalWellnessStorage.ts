// Re-export shim → canonical implementation lives in src/storage/digitalWellbeingStorage.ts
// digitalWellnessStorage was a duplicate of digitalWellbeingStorage; all callers use
// the Wellbeing variant. This file is kept for backward import compatibility only.
export * from './digitalWellbeingStorage';
