import {
  VerificationType,
  VerificationStrength,
  ChallengeObjective
} from './types';

export interface VerifiabilityAssessment {
  isVerifiable: boolean;
  recommendedType: VerificationType;
  strength: VerificationStrength;
  explanation: string;
  suggestedAlternative?: string;
  suggestedObjective?: Partial<ChallengeObjective>;
}

export interface ExerciseRepAnalysis {
  isValid: boolean;
  currentPhase: 'eccentric' | 'concentric' | 'lockout' | 'inflection';
  depthAngleDeg: number;
  formScore: number; // 0 - 100
  formFeedback: string;
}

export interface AntiCheatCheckResult {
  passed: boolean;
  reason?: string;
  confidenceScore: number; // 0.0 - 1.0
}

export class SharedVerificationEngine {
  /**
   * Analyzes an arbitrary natural-language objective to determine if it can be credibly verified.
   * If unmeasurable (e.g. "become happier", "think more positively"), returns a measurable alternative.
   */
  assessVerifiability(goalText: string): VerifiabilityAssessment {
    const lower = (goalText || '').toLowerCase().trim();

    // 1. Unmeasurable / subjective check
    const subjectiveKeywords = [
      'happy', 'happier', 'happiness', 'positivity', 'positive thinking',
      'better person', 'smart', 'smarter', 'enlightened', 'peaceful',
      'feel better', 'be nicer', 'be kinder', 'love more', 'become rich'
    ];
    if (subjectiveKeywords.some(w => lower.includes(w))) {
      return {
        isVerifiable: false,
        recommendedType: 'device',
        strength: 'self_reported',
        explanation: 'Subjective mental states cannot be directly verified for a credible competition.',
        suggestedAlternative: 'I can transform this into a measurable challenge: completing 10 minutes of daily mindfulness or gratitude logging.',
        suggestedObjective: {
          title: 'Daily Mindfulness & Reflection',
          type: 'duration',
          target: 10,
          unit: 'minutes',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 2. Dangerous or harmful check
    const dangerousKeywords = ['no sleep', 'sleep deprivation', 'starve', 'no eating', 'fast for a week', 'self harm'];
    if (dangerousKeywords.some(w => lower.includes(w))) {
      return {
        isVerifiable: false,
        recommendedType: 'self_reported',
        strength: 'self_reported',
        explanation: 'This goal poses potential health risks and cannot be certified.',
        suggestedAlternative: 'I can create a healthy sleep schedule or balanced hydration challenge instead.',
        suggestedObjective: {
          title: 'Optimal Circadian Sleep',
          type: 'time_anchor',
          target: 8,
          unit: 'hours',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 3. Camera-verified exercises (Push-ups)
    if (lower.includes('push-up') || lower.includes('pushup')) {
      const match = lower.match(/\d+/);
      const reps = match ? parseInt(match[0], 10) : 30;
      return {
        isVerifiable: true,
        recommendedType: 'camera',
        strength: 'camera',
        explanation: 'Real-time on-device computer vision posture & rep tracking.',
        suggestedObjective: {
          title: `${reps} Push-ups`,
          type: 'reps',
          target: reps,
          unit: 'reps',
          verificationType: 'camera',
          verificationStrength: 'camera',
          exerciseType: 'push_up'
        }
      };
    }

    // 4. Camera-verified exercises (Squats)
    if (lower.includes('squat')) {
      const match = lower.match(/\d+/);
      const reps = match ? parseInt(match[0], 10) : 30;
      return {
        isVerifiable: true,
        recommendedType: 'camera',
        strength: 'camera',
        explanation: 'Hip-knee depth angle analysis via on-device camera tracking.',
        suggestedObjective: {
          title: `${reps} Deep Squats`,
          type: 'reps',
          target: reps,
          unit: 'reps',
          verificationType: 'camera',
          verificationStrength: 'camera',
          exerciseType: 'squat'
        }
      };
    }

    // 5. Camera-verified exercises (Lunges, Plank, Jumping Jacks)
    if (lower.includes('lunge')) {
      const match = lower.match(/\d+/);
      const reps = match ? parseInt(match[0], 10) : 20;
      return {
        isVerifiable: true,
        recommendedType: 'camera',
        strength: 'camera',
        explanation: 'Knee inflection & balance analysis via camera.',
        suggestedObjective: {
          title: `${reps} Lunges`,
          type: 'reps',
          target: reps,
          unit: 'reps',
          verificationType: 'camera',
          verificationStrength: 'camera',
          exerciseType: 'lunge'
        }
      };
    }

    if (lower.includes('plank')) {
      const match = lower.match(/\d+/);
      const seconds = match ? parseInt(match[0], 10) : 60;
      return {
        isVerifiable: true,
        recommendedType: 'camera',
        strength: 'camera',
        explanation: 'Isometric posture stability analysis via camera.',
        suggestedObjective: {
          title: `${seconds}s Isometric Plank`,
          type: 'duration',
          target: seconds,
          unit: 'seconds',
          verificationType: 'camera',
          verificationStrength: 'camera',
          exerciseType: 'plank'
        }
      };
    }

    // 6. Device-verified: Steps, Running, Walking
    if (lower.includes('step') || lower.includes('walk') || lower.includes('run') || lower.includes('jog')) {
      const kmMatch = lower.match(/(\d+(\.\d+)?)\s*(km|kilometer|mile)/);
      const stepMatch = lower.match(/(\d+[\d,]*)\s*step/);

      if (kmMatch) {
        const km = parseFloat(kmMatch[1]);
        return {
          isVerifiable: true,
          recommendedType: 'device',
          strength: 'device',
          explanation: 'Pedometer and GPS telemetry speed validation.',
          suggestedObjective: {
            title: `Run ${km} km`,
            type: 'distance',
            target: km,
            unit: 'km',
            verificationType: 'device',
            verificationStrength: 'device'
          }
        };
      }

      if (stepMatch) {
        const steps = parseInt(stepMatch[1].replace(/,/g, ''), 10);
        return {
          isVerifiable: true,
          recommendedType: 'device',
          strength: 'device',
          explanation: 'Pedometer hardware cadence step sensor validation.',
          suggestedObjective: {
            title: `${steps.toLocaleString()} Daily Steps`,
            type: 'reps',
            target: steps,
            unit: 'steps',
            verificationType: 'device',
            verificationStrength: 'device'
          }
        };
      }
    }

    // 7. Device-verified: Screen time & Focus
    if (lower.includes('screen') || lower.includes('instagram') || lower.includes('tiktok') || lower.includes('focus')) {
      const minMatch = lower.match(/(\d+)\s*(min|minute|hour|hr)/);
      let mins = 45;
      if (minMatch) {
        const val = parseInt(minMatch[1], 10);
        mins = minMatch[2].startsWith('h') ? val * 60 : val;
      }

      return {
        isVerifiable: true,
        recommendedType: 'device',
        strength: 'device',
        explanation: 'Synchronized OS device wellbeing and focus tracker.',
        suggestedObjective: {
          title: `Cap Screen Usage at ${mins} min`,
          type: 'screen_limit',
          target: mins,
          unit: 'minutes',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 8. Location-verified: Gym check-in
    if (lower.includes('gym') || lower.includes('fitness center') || lower.includes('workout center')) {
      return {
        isVerifiable: true,
        recommendedType: 'location',
        strength: 'location',
        explanation: 'Geofenced physical facility check-in verification.',
        suggestedObjective: {
          title: 'Gym Location Check-in',
          type: 'location_checkin',
          target: 1,
          unit: 'check-in',
          verificationType: 'location',
          verificationStrength: 'location',
          locationName: 'Designated Gym'
        }
      };
    }

    // 9. Evidence-verified: Hydration, Meals, Journaling
    if (lower.includes('water') || lower.includes('hydration') || lower.includes('drink')) {
      const lMatch = lower.match(/(\d+(\.\d+)?)\s*(l|liter)/);
      const liters = lMatch ? parseFloat(lMatch[1]) : 2.5;

      return {
        isVerifiable: true,
        recommendedType: 'evidence',
        strength: 'evidence',
        explanation: 'Logged hydration intake with photo/evidence verification.',
        suggestedObjective: {
          title: `${liters}L Daily Hydration`,
          type: 'duration',
          target: liters * 1000,
          unit: 'ml',
          verificationType: 'evidence',
          verificationStrength: 'evidence'
        }
      };
    }

    // Fallback: Default verifiable habit
    return {
      isVerifiable: true,
      recommendedType: 'self_reported',
      strength: 'self_reported',
      explanation: 'General wellness habit with self-reported milestone logs.',
      suggestedObjective: {
        title: goalText.trim(),
        type: 'habit_completion',
        target: 1,
        unit: 'session',
        verificationType: 'self_reported',
        verificationStrength: 'self_reported'
      }
    };
  }

  /**
   * Anti-Cheat Cadence & Velocity Validator
   * Protects against spoofed exercise repetitions and unnatural run speeds.
   */
  validateCadence(
    exerciseType: string,
    reps: number,
    durationSeconds: number
  ): AntiCheatCheckResult {
    if (durationSeconds <= 0) {
      return { passed: false, reason: 'Duration cannot be zero or negative.', confidenceScore: 0 };
    }

    // Minimum plausible seconds per repetition
    const MIN_SECONDS_PER_REP: Record<string, number> = {
      push_up: 0.8,
      squat: 1.0,
      lunge: 1.2,
      jumping_jack: 0.5,
      bicep_curl: 0.9,
    };

    const minSec = MIN_SECONDS_PER_REP[exerciseType] || 0.7;
    const requiredSeconds = reps * minSec;

    if (durationSeconds < requiredSeconds * 0.7) {
      return {
        passed: false,
        reason: `Repetition cadence (${(durationSeconds / reps).toFixed(2)}s/rep) exceeds human biomechanical limits for ${exerciseType}.`,
        confidenceScore: 0.1
      };
    }

    return { passed: true, confidenceScore: 0.95 };
  }

  /**
   * Validates GPS speed for outdoor running (rejects car/motorcycle spoofing)
   */
  validateRunPace(
    distanceKm: number,
    durationMinutes: number
  ): AntiCheatCheckResult {
    if (distanceKm <= 0 || durationMinutes <= 0) {
      return { passed: false, reason: 'Invalid distance or duration.', confidenceScore: 0 };
    }

    const paceMinPerKm = durationMinutes / distanceKm;
    const speedKmH = (distanceKm / durationMinutes) * 60;

    // Faster than world record marathon/sprint speed (approx 2:40 min/km or 25 km/h sustained)
    if (paceMinPerKm < 2.5 || speedKmH > 25.0) {
      return {
        passed: false,
        reason: `Pace of ${paceMinPerKm.toFixed(2)} min/km (${speedKmH.toFixed(1)} km/h) exceeds running threshold. Possible vehicular transport detected.`,
        confidenceScore: 0.2
      };
    }

    return { passed: true, confidenceScore: 0.98 };
  }
}

export const sharedVerificationEngine = new SharedVerificationEngine();
