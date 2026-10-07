/**
 * Nura NLU + Challenge Builder
 * Parses natural language into structured, verifiable challenge definitions.
 * This runs client-side; does NOT use setTimeout keyword matching.
 * Architecture: intent classification → entity extraction → verifiability check → structured output
 */

const VERIFICATION = {
  DEVICE: 'device',
  CAMERA: 'camera',
  LOCATION: 'location',
  MUTUAL: 'mutual',
  EVIDENCE: 'evidence',
  SELF_REPORTED: 'self_reported',
};

const STRENGTH_LABEL = {
  device: { label: 'Device Verified', icon: '🟢', color: '#16a34a' },
  camera: { label: 'Camera Verified', icon: '🟢', color: '#16a34a' },
  location: { label: 'Location Verified', icon: '🟢', color: '#16a34a' },
  mutual: { label: 'Mutual Verified', icon: '🟢', color: '#16a34a' },
  evidence: { label: 'Evidence Submitted', icon: '🟡', color: '#ca8a04' },
  self_reported: { label: 'Self-Reported', icon: '🔴', color: '#dc2626' },
};

export function getVerificationLabel(method) {
  return STRENGTH_LABEL[method] || STRENGTH_LABEL.self_reported;
}

// Terms that cannot be measured objectively
const UNMEASURABLE_TERMS = [
  { term: 'happier', suggestion: 'Complete a 10-minute mindfulness session each day' },
  { term: 'happiness', suggestion: 'Log 3 gratitude moments daily' },
  { term: 'feel better', suggestion: 'Complete a 20-minute morning walk each day' },
  { term: 'be nicer', suggestion: 'Perform one intentional kind act per day' },
  { term: 'be kinder', suggestion: 'Perform one intentional kind act per day' },
  { term: 'become rich', suggestion: 'Save a fixed amount every day and track it' },
  { term: 'love more', suggestion: 'Reach out to one person you care about each day' },
  { term: 'be healthy', suggestion: 'Log 30 minutes of daily movement verified by your device' },
  { term: 'get fit', suggestion: 'Complete a 30-minute workout daily for 14 days' },
];

const DANGEROUS_TERMS = [
  'no sleep', 'sleep deprivation', 'no eating', 'starve', 'not eat', 'fast for a week',
  'self harm', 'hurt myself', 'extreme fast',
];

/**
 * Main NLU parser — call with the user's raw text.
 * Returns one of:
 *   { type: 'UNMEASURABLE', term, suggestion }
 *   { type: 'DANGEROUS', suggestion }
 *   { type: 'PARSED', definition, participantNames, summary }
 *   { type: 'TOO_VAGUE', suggestion }
 */
export function parseChallenge(text) {
  const lower = text.toLowerCase().trim();
  if (!lower) return { type: 'TOO_VAGUE', suggestion: 'Tell me what you want to challenge yourself with.' };

  // Safety checks first
  for (const t of DANGEROUS_TERMS) {
    if (lower.includes(t)) {
      return {
        type: 'DANGEROUS',
        suggestion: 'That challenge could be harmful. I can create a safe wellness challenge instead — would you like a healthy sleep improvement or nutrition goal?',
      };
    }
  }

  // Unmeasurable detection
  for (const { term, suggestion } of UNMEASURABLE_TERMS) {
    if (lower.includes(term)) {
      return { type: 'UNMEASURABLE', term, suggestion };
    }
  }

  // ── ENTITY EXTRACTION ────────────────────────────────────────────────────
  const objectives = [];
  let category = 'physical';
  let primaryVerification = VERIFICATION.SELF_REPORTED;
  let imageUrl = null;
  let titleParts = [];

  // Duration
  let durationDays = 7;
  const dayMatch = lower.match(/(\d+)\s*-?\s*(day|week|month)/);
  if (dayMatch) {
    const num = parseInt(dayMatch[1]);
    const unit = dayMatch[2];
    durationDays = unit === 'week' ? num * 7 : unit === 'month' ? num * 30 : num;
  }

  // Participants / Mode
  let mode = 'solo';
  let isPublic = false;
  const participantNames = [];

  if (/\bme and\b|\bwith\s+\w+|\bmy friend\b/.test(lower)) {
    mode = 'friends';
    const nameMatch = lower.match(/(?:me and|with)\s+([a-z]+)/i);
    if (nameMatch) participantNames.push(nameMatch[1]);
  }
  if (/\bgroup\b|\beveryone\b|\bpublic\b|\bteam\b/.test(lower)) { mode = 'group'; isPublic = true; }
  if (/\bvs\b|\bhead.?to.?head\b|\b1v1\b/.test(lower)) mode = 'head_to_head';

  // Monetary
  let isMonetary = false, entryFee = 0;
  const moneyMatch = lower.match(/(\d+)\s*etb/i);
  if (moneyMatch) { isMonetary = true; entryFee = parseInt(moneyMatch[1]); }
  if (/\bstake\b|\bbet\b|\bmoney\b|\bwager\b/.test(lower) && !isMonetary) { isMonetary = true; entryFee = 100; }

  // ── OBJECTIVE PARSERS ─────────────────────────────────────────────────────

  // Wake time
  const wakeMatch = lower.match(/wake\s*(?:up\s*)?(?:at\s*)?((?:\d{1,2}(?::\d{2})?)\s*(?:am|pm)?)/i);
  if (wakeMatch) {
    objectives.push({
      id: `o_${Date.now()}_wake`, label: `Wake at ${wakeMatch[1].trim().toUpperCase()}`,
      type: 'wake_time', target: wakeMatch[1].trim(), unit: 'time',
      verification_method: VERIFICATION.DEVICE, strength: 'medium',
    });
    category = 'sleep'; _upgrade(VERIFICATION.DEVICE);
    titleParts.push(`${wakeMatch[1].trim().toUpperCase()} Wake`);
  }

  // Steps
  const stepsMatch = lower.match(/(\d[\d,]*)\s*steps?/i);
  if (stepsMatch) {
    const steps = parseInt(stepsMatch[1].replace(',', ''));
    objectives.push({
      id: `o_${Date.now()}_steps`, label: `${steps.toLocaleString()} daily steps`,
      type: 'steps', target: steps, unit: 'steps',
      verification_method: VERIFICATION.DEVICE, strength: 'strong',
    });
    category = 'physical'; _upgrade(VERIFICATION.DEVICE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${steps.toLocaleString()} Steps`);
  }

  // Running
  const runMatch = lower.match(/run\s+(?:at\s+least\s+)?(\d+(?:\.\d+)?)\s*km/i)
    || lower.match(/(\d+(?:\.\d+)?)\s*km\s+(?:run|jog)/i);
  if (runMatch) {
    const km = parseFloat(runMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_run`, label: `Run ${km} km`,
      type: 'run_distance', target: km, unit: 'km',
      verification_method: VERIFICATION.DEVICE, strength: 'strong',
    });
    category = 'physical'; _upgrade(VERIFICATION.DEVICE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${km}km Run`);
  }

  // Push-ups
  const pushMatch = lower.match(/(\d+)\s*push\s*-?\s*up/i);
  if (pushMatch) {
    const n = parseInt(pushMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_pushup`, label: `${n} push-ups`,
      type: 'pushups', target: n, unit: 'reps',
      verification_method: VERIFICATION.CAMERA, strength: 'strong',
    });
    category = 'physical'; _upgrade(VERIFICATION.CAMERA);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${n} Push-ups`);
  }

  // Squats
  const squatMatch = lower.match(/(\d+)\s*squats?/i);
  if (squatMatch) {
    const n = parseInt(squatMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_squat`, label: `${n} squats`,
      type: 'squats', target: n, unit: 'reps',
      verification_method: VERIFICATION.CAMERA, strength: 'strong',
    });
    if (primaryVerification === VERIFICATION.SELF_REPORTED) _upgrade(VERIFICATION.CAMERA);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${n} Squats`);
  }

  // Lunges
  const lungeMatch = lower.match(/(\d+)\s*lunges?/i);
  if (lungeMatch) {
    const n = parseInt(lungeMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_lunge`, label: `${n} lunges`,
      type: 'lunges', target: n, unit: 'reps',
      verification_method: VERIFICATION.CAMERA, strength: 'strong',
    });
    if (primaryVerification === VERIFICATION.SELF_REPORTED) _upgrade(VERIFICATION.CAMERA);
    titleParts.push(`${n} Lunges`);
  }

  // Workout duration
  const workoutMatch = lower.match(/(\d+)\s*min(?:ute)?s?\s*(?:workout|exercise|training)/i)
    || lower.match(/(?:workout|exercise|train)\s+(?:for\s+)?(\d+)\s*min/i);
  if (workoutMatch) {
    const mins = parseInt(workoutMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_workout`, label: `${mins}-minute workout`,
      type: 'workout_duration', target: mins, unit: 'minutes',
      verification_method: VERIFICATION.DEVICE, strength: 'strong',
    });
    category = 'physical'; _upgrade(VERIFICATION.DEVICE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${mins}min Workout`);
  }

  // Gym
  if (/\bgym\b/.test(lower)) {
    objectives.push({
      id: `o_${Date.now()}_gym`, label: 'Gym check-in',
      type: 'location_checkin', target: 'gym', unit: 'check-in',
      verification_method: VERIFICATION.LOCATION, strength: 'strong',
    });
    _upgrade(VERIFICATION.LOCATION);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80';
    titleParts.push('Gym');
  }

  // Hydration
  const waterMatch = lower.match(/(\d+(?:\.\d+)?)\s*l(?:iter)?s?\s*(?:of\s+)?water/i)
    || lower.match(/drink\s+(\d+(?:\.\d+)?)\s*l/i);
  if (waterMatch || /\bhydrat/i.test(lower)) {
    const liters = waterMatch ? parseFloat(waterMatch[1]) : 2;
    objectives.push({
      id: `o_${Date.now()}_water`, label: `${liters}L daily water`,
      type: 'hydration', target: liters * 1000, unit: 'ml',
      verification_method: VERIFICATION.EVIDENCE, strength: 'medium',
    });
    if (objectives.length === 1) category = 'hydration';
    _upgrade(VERIFICATION.EVIDENCE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${liters}L Water`);
  }

  // Screen time
  const screenMatch = lower.match(/(?:under|below|less\s+than)\s+(\d+)\s*min.*?(?:instagram|screen|social|tiktok|phone|app)/i)
    || lower.match(/(\d+)\s*min.*?screen\s*time/i)
    || lower.match(/screen\s*time.*?(\d+)\s*min/i);
  if (screenMatch || /\bdigital\s+detox\b|\bscreen\s+time\b/.test(lower)) {
    const limit = screenMatch ? parseInt(screenMatch[1]) : 120;
    objectives.push({
      id: `o_${Date.now()}_screen`, label: `Max ${limit}min screen time`,
      type: 'screen_time_limit', target: limit, unit: 'minutes',
      verification_method: VERIFICATION.DEVICE, strength: 'strong',
    });
    category = 'digital_wellbeing'; _upgrade(VERIFICATION.DEVICE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${limit}min Screen Limit`);
  }

  // Focus / Study
  const studyMatch = lower.match(/study\s+(?:for\s+)?(\d+)\s*(?:hour|hr)/i)
    || lower.match(/focus\s+(?:for\s+)?(\d+)\s*(?:hour|hr)/i)
    || lower.match(/read\s+(?:for\s+)?(\d+)\s*(?:hour|hr)/i);
  if (studyMatch) {
    const hours = parseFloat(studyMatch[1]);
    objectives.push({
      id: `o_${Date.now()}_study`, label: `${hours}h study session`,
      type: 'focus_session', target: hours * 60, unit: 'minutes',
      verification_method: VERIFICATION.DEVICE, strength: 'medium',
    });
    if (objectives.length === 1) category = 'habits';
    _upgrade(VERIFICATION.DEVICE);
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80';
    titleParts.push(`${hours}h Study`);
  }

  // Meditation
  if (/\bmeditat|\bmindful/i.test(lower)) {
    const minsMatch = lower.match(/(\d+)\s*min.*meditat/i);
    const mins = minsMatch ? parseInt(minsMatch[1]) : 10;
    objectives.push({
      id: `o_${Date.now()}_meditate`, label: `${mins}min meditation`,
      type: 'meditation', target: mins, unit: 'minutes',
      verification_method: VERIFICATION.SELF_REPORTED, strength: 'weak',
    });
    if (objectives.length === 1) category = 'habits';
    imageUrl = imageUrl || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80';
    titleParts.push('Meditation');
  }

  // Journaling
  if (/\bjournal|\bwrite.*day|\bdiary/i.test(lower)) {
    objectives.push({
      id: `o_${Date.now()}_journal`, label: 'Daily journaling',
      type: 'journaling', target: 1, unit: 'entry',
      verification_method: VERIFICATION.SELF_REPORTED, strength: 'weak',
    });
    if (objectives.length === 1) category = 'habits';
    titleParts.push('Journaling');
  }

  // Sleep by time / bedtime
  const bedtimeMatch = lower.match(/(?:sleep|bed)\s*by\s*((?:\d{1,2}(?::\d{2})?)\s*(?:am|pm)?)/i);
  if (bedtimeMatch) {
    objectives.push({
      id: `o_${Date.now()}_bedtime`, label: `In bed by ${bedtimeMatch[1].trim()}`,
      type: 'bedtime', target: bedtimeMatch[1].trim(), unit: 'time',
      verification_method: VERIFICATION.DEVICE, strength: 'medium',
    });
    if (objectives.length === 1) category = 'sleep';
    _upgrade(VERIFICATION.DEVICE);
    titleParts.push(`Bedtime by ${bedtimeMatch[1].trim()}`);
  }

  // If nothing parsed, try generic walkout / workout
  if (objectives.length === 0) {
    if (/\bwalk\b/.test(lower)) {
      objectives.push({
        id: `o_${Date.now()}_walk`, label: '30-minute daily walk',
        type: 'workout_duration', target: 30, unit: 'minutes',
        verification_method: VERIFICATION.DEVICE, strength: 'strong',
      });
      category = 'physical'; _upgrade(VERIFICATION.DEVICE);
      imageUrl = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80';
      titleParts.push('Daily Walk');
    } else {
      return {
        type: 'TOO_VAGUE',
        suggestion: 'Tell me more! What would you like to do — run, push-ups, meditate, drink water, limit screen time? I can build the challenge from there.',
      };
    }
  }

  // Nura 360 detection (multiple systems)
  const categories = [...new Set(objectives.map(o => _objCategory(o.type)))];
  if (categories.length >= 3) category = 'nura_360';

  // Build title
  const baseTitle = titleParts.slice(0, 3).join(' + ');
  const title = baseTitle
    ? `${baseTitle} — ${durationDays}-Day Challenge`
    : `${durationDays}-Day Wellness Challenge`;

  // Determine verification method label
  const verificationMethod = primaryVerification;
  const verLabel = getVerificationLabel(verificationMethod);

  const definition = {
    title,
    description: `${durationDays}-day challenge: ${objectives.map(o => o.label).join(', ')}`,
    category,
    mode,
    duration_days: durationDays,
    is_public: isPublic,
    is_private: !isPublic && mode === 'friends',
    is_monetary: isMonetary,
    entry_fee: entryFee,
    objectives,
    verification_method: verificationMethod,
    image_url: imageUrl || _defaultImage(category),
    xp_reward: 150 + durationDays * 10,
    points_reward: 75 + durationDays * 5,
    rules: {
      min_completion_rate: 80,
      winner_type: mode === 'race' ? 'first_to_complete' : 'all_verified_completers',
    },
  };

  // Build human-readable summary for Nura to present
  const summaryLines = [
    `**${definition.title}**`,
    '',
    ...objectives.map(o => {
      const vl = getVerificationLabel(o.verification_method);
      return `${vl.icon} ${o.label} *(${vl.label})*`;
    }),
    '',
    `⏱ **Duration:** ${durationDays} days`,
    `👥 **Mode:** ${mode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
    `🔐 **Primary verification:** ${verLabel.icon} ${verLabel.label}`,
    isMonetary
      ? `💰 **Entry fee:** ${entryFee} ETB per person`
      : `🆓 **Entry:** Free`,
  ];

  return {
    type: 'PARSED',
    definition,
    participantNames,
    summary: summaryLines.join('\n'),
  };

  function _upgrade(method) {
    const order = [VERIFICATION.DEVICE, VERIFICATION.CAMERA, VERIFICATION.LOCATION, VERIFICATION.MUTUAL, VERIFICATION.EVIDENCE, VERIFICATION.SELF_REPORTED];
    const curr = order.indexOf(primaryVerification);
    const next = order.indexOf(method);
    if (next < curr || primaryVerification === VERIFICATION.SELF_REPORTED) {
      primaryVerification = method;
    }
  }
}

function _objCategory(type) {
  if (['steps', 'run_distance', 'pushups', 'squats', 'lunges', 'workout_duration', 'location_checkin'].includes(type)) return 'physical';
  if (['wake_time', 'bedtime', 'sleep_duration'].includes(type)) return 'sleep';
  if (['screen_time_limit', 'focus_session'].includes(type)) return 'digital';
  if (['hydration'].includes(type)) return 'hydration';
  if (['meditation', 'journaling'].includes(type)) return 'habits';
  return 'other';
}

function _defaultImage(category) {
  const imgs = {
    physical: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80',
    sleep: 'https://images.unsplash.com/photo-1631739085561-e4bfe1bf1e2b?w=800&auto=format&fit=crop&q=80',
    digital_wellbeing: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    hydration: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    habits: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
    nura_360: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  };
  return imgs[category] || imgs.physical;
}

// Supported exercise types for camera verification
export const CAMERA_EXERCISES = ['pushups', 'squats', 'lunges', 'plank', 'jumping_jacks', 'situps', 'burpees'];

export const CATEGORY_META = {
  physical:          { label: 'Physical',         icon: 'Dumbbell',       color: '#16a34a', description: 'Steps, runs, workouts, strength' },
  sleep:             { label: 'Sleep',             icon: 'Moon',           color: '#7c3aed', description: 'Wake time, bedtime, sleep routines' },
  digital_wellbeing: { label: 'Digital Wellbeing', icon: 'Smartphone',     color: '#0ea5e9', description: 'Screen limits, focus, detox' },
  hydration:         { label: 'Hydration',         icon: 'Droplets',       color: '#0369a1', description: 'Daily water targets' },
  habits:            { label: 'Habits',            icon: 'BookOpen',       color: '#b45309', description: 'Reading, meditation, journaling' },
  social:            { label: 'Social',            icon: 'Users',          color: '#db2777', description: 'Meetups, group activities, events' },
  nura_360:          { label: 'Nura 360',          icon: 'Star',           color: '#ea580c', description: 'Multi-system total wellness' },
};

export const MODE_META = {
  solo:         { label: 'Solo',         icon: 'User',        description: 'Self vs personal goal' },
  head_to_head: { label: 'Head-to-Head', icon: 'Swords',      description: '1 vs 1 direct competition' },
  friends:      { label: 'Friends',      icon: 'UserPlus',    description: 'Private invited group' },
  group:        { label: 'Group',        icon: 'Users',       description: 'Open group challenge' },
  team_battle:  { label: 'Team Battle',  icon: 'Shield',      description: 'Team vs team' },
  race:         { label: 'Race',         icon: 'Zap',         description: 'First to finish wins' },
  survival:     { label: 'Survival',     icon: 'AlertTriangle', description: 'Maintain or get eliminated' },
  co_op:        { label: 'Co-Op',        icon: 'HandshakeIcon', description: 'Everyone works toward shared goal' },
  ladder:       { label: 'Ladder',       icon: 'TrendingUp',  description: 'Rise and fall based on performance' },
  streak_battle: { label: 'Streak Battle', icon: 'Flame',     description: 'Longest unbroken streak wins' },
};
