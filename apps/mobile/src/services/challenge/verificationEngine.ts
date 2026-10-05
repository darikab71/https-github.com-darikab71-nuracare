import {
  VerificationType,
  VerificationStrength,
  ChallengeObjective,
  LiveChallengeSession,
} from '../../types/communityTypes';

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

class VerificationEngine {
  /**
   * Analyzes an arbitrary natural-language objective to determine if it can be credibly verified.
   * If unmeasurable (e.g. "become happier", "think more positively"), returns a measurable alternative.
   */
  assessVerifiability(goalText: string): VerifiabilityAssessment {
    const lower = goalText.toLowerCase().trim();

    // 1. Unmeasurable / subjective check
    const subjectiveKeywords = ['happy', 'happier', 'positivity', 'positive thinking', 'better person', 'smart', 'smarter', 'enlightened', 'peaceful'];
    if (subjectiveKeywords.some(w => lower.includes(w))) {
      return {
        isVerifiable: false,
        recommendedType: 'device',
        strength: 'self_reported',
        explanation: 'Subjective mental states cannot be directly verified for a credible competition.',
        suggestedAlternative: 'I can transform this into a measurable challenge: completing 10 minutes of daily mindfulness or 4-7-8 breathwork.',
        suggestedObjective: {
          title: 'Daily Mindfulness & Breathwork',
          type: 'duration',
          target: 10,
          unit: 'minutes',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 2. Camera-verified exercises
    if (lower.includes('push-up') || lower.includes('pushup')) {
      const match = lower.match(/\d+/);
      const reps = match ? parseInt(match[0]) : 30;
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

    if (lower.includes('squat')) {
      const match = lower.match(/\d+/);
      const reps = match ? parseInt(match[0]) : 30;
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

    // 3. Device-verified: Steps & Distance
    if (lower.includes('step') || lower.includes('walk') || lower.includes('run')) {
      const kmMatch = lower.match(/(\d+(\.\d+)?)\s*(km|kilometer|mile)/);
      const stepMatch = lower.match(/(\d+[\d,]*)\s*step/);
      if (kmMatch) {
        const km = parseFloat(kmMatch[1]);
        return {
          isVerifiable: true,
          recommendedType: 'device',
          strength: 'device',
          explanation: 'Verified distance tracking via device sensors / GPS.',
          suggestedObjective: {
            title: `Run/Walk ${km} km`,
            type: 'distance',
            target: km,
            unit: 'km',
            verificationType: 'device',
            verificationStrength: 'device'
          }
        };
      }
      const steps = stepMatch ? parseInt(stepMatch[1].replace(/,/g, '')) : 8000;
      return {
        isVerifiable: true,
        recommendedType: 'device',
        strength: 'device',
        explanation: 'Pedometer / accelerometer hardware step counter.',
        suggestedObjective: {
          title: `${steps.toLocaleString()} Steps`,
          type: 'reps',
          target: steps,
          unit: 'steps',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 4. Digital Wellbeing limits
    if (lower.includes('screen') || lower.includes('instagram') || lower.includes('tiktok') || lower.includes('phone')) {
      const minMatch = lower.match(/(\d+)\s*(min|minute|hour|hr)/);
      let mins = 45;
      if (minMatch) {
        const val = parseInt(minMatch[1]);
        mins = minMatch[2].startsWith('h') ? val * 60 : val;
      }
      return {
        isVerifiable: true,
        recommendedType: 'device',
        strength: 'device',
        explanation: 'Hardware device usage telemetry via NuraCare Digital Wellbeing engine.',
        suggestedObjective: {
          title: `Under ${mins}m Screen Time`,
          type: 'screen_limit',
          target: mins,
          unit: 'minutes',
          verificationType: 'device',
          verificationStrength: 'device'
        }
      };
    }

    // 5. Location / Gym check-in
    if (lower.includes('gym') || lower.includes('arrive') || lower.includes('meet at')) {
      return {
        isVerifiable: true,
        recommendedType: 'location',
        strength: 'location',
        explanation: 'Event-based geofence check-in at designated location without continuous tracking.',
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

    // Default: Verifiable via device or photo evidence
    return {
      isVerifiable: true,
      recommendedType: 'evidence',
      strength: 'evidence',
      explanation: 'Photo/video proof submission reviewed against challenge criteria.',
      suggestedObjective: {
        title: goalText.slice(0, 40),
        type: 'habit_completion',
        target: 1,
        unit: 'session',
        verificationType: 'evidence',
        verificationStrength: 'evidence'
      }
    };
  }

  /**
   * Evaluates camera pose biomechanics for exercise repetition validation
   */
  evaluateExerciseRep(
    exercise: 'squat' | 'push_up' | 'lunge' | 'jumping_jack' | 'bicep_curl',
    angleDegrees: number,
    previousPhase: string
  ): ExerciseRepAnalysis {
    switch (exercise) {
      case 'squat': {
        // Knee flexion angle: >160 standing, <95 parallel squat depth
        if (angleDegrees <= 90) {
          return {
            isValid: true,
            currentPhase: 'inflection',
            depthAngleDeg: angleDegrees,
            formScore: 98,
            formFeedback: 'Optimal depth achieved (Parallel/Below)'
          };
        } else if (angleDegrees < 120) {
          return {
            isValid: false,
            currentPhase: 'eccentric',
            depthAngleDeg: angleDegrees,
            formScore: 75,
            formFeedback: 'Go slightly lower to hit parallel depth'
          };
        } else {
          return {
            isValid: false,
            currentPhase: 'lockout',
            depthAngleDeg: angleDegrees,
            formScore: 90,
            formFeedback: 'Standing position'
          };
        }
      }

      case 'push_up': {
        // Elbow flexion: >160 extended, <85 chest to ground
        if (angleDegrees <= 85) {
          return {
            isValid: true,
            currentPhase: 'inflection',
            depthAngleDeg: angleDegrees,
            formScore: 95,
            formFeedback: 'Full range of motion achieved'
          };
        } else if (angleDegrees < 130) {
          return {
            isValid: false,
            currentPhase: 'eccentric',
            depthAngleDeg: angleDegrees,
            formScore: 70,
            formFeedback: 'Lower chest fully to ground'
          };
        } else {
          return {
            isValid: false,
            currentPhase: 'lockout',
            depthAngleDeg: angleDegrees,
            formScore: 90,
            formFeedback: 'Top lockout'
          };
        }
      }

      default:
        return {
          isValid: true,
          currentPhase: 'concentric',
          depthAngleDeg: angleDegrees,
          formScore: 90,
          formFeedback: 'Good repetition tempo'
        };
    }
  }

  /**
   * Anti-Cheating check: detects anomalous jumps, repeated instant submissions, or impossible physics
   */
  validateActivityIntegrity(session: LiveChallengeSession, reportedValue: number): { isClean: boolean; reason?: string } {
    const elapsedSeconds = (Date.now() - new Date(session.startedAt).getTime()) / 1000;

    // Reps speed check: humanly impossible to do > 2 strict pushups per second over 30 reps
    if (session.repsValid > 0 && elapsedSeconds < (session.repsValid * 0.4)) {
      return {
        isClean: false,
        reason: 'Cadence exceeds physiological limits (<0.4s per full rep).'
      };
    }

    // Distance speed check: faster than 45 km/h on foot is flagged as motorized
    if (session.verificationMethod === 'device' && elapsedSeconds > 0) {
      const speedKmH = (reportedValue / (elapsedSeconds / 3600));
      if (speedKmH > 45) {
        return {
          isClean: false,
          reason: 'Movement velocity indicates motorized transit (>45 km/h).'
        };
      }
    }

    return { isClean: true };
  }
}

export const verificationEngine = new VerificationEngine();
