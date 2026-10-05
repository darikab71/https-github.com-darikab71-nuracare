export type NuraToolCategory =
  | 'profile'
  | 'routine'
  | 'medication'
  | 'habit'
  | 'lifestyle'
  | 'challenge'
  | 'community'
  | 'digital_wellbeing'
  | 'notification'
  | 'wallet'
  | 'search';

export interface NuraToolDefinition {
  name: string;
  category: NuraToolCategory;
  description: string;
  requiresConfirmation: boolean;
  confirmationMessageTemplate?: (params: any) => string;
  parametersSchema: Record<string, { type: string; description: string; required?: boolean }>;
}

export interface NuraToolResult {
  success: boolean;
  action: string;
  resourceId?: string;
  data?: any;
  message: string;
  error?: string;
}

export interface NuraActionStep {
  toolName: string;
  params: any;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'needs_confirmation';
  result?: NuraToolResult;
  confirmationPrompt?: string;
}

export interface NuraAgentPlan {
  intent: string;
  summary: string;
  steps: NuraActionStep[];
}

export const NURA_TOOLS: Record<string, NuraToolDefinition> = {
  // 1. ROUTINE TOOLS
  'routine.create': {
    name: 'routine.create',
    category: 'routine',
    description: 'Creates a new daily wellness routine with items and scheduled time',
    requiresConfirmation: false,
    parametersSchema: {
      title: { type: 'string', description: 'Name of the routine (e.g. Morning Reset, Evening Wind-Down)', required: true },
      timeOfDay: { type: 'string', description: 'Time in 24h format (e.g. 07:00, 21:30)', required: true },
      category: { type: 'string', description: 'Category: Morning, Work, Evening, Night' },
      items: { type: 'array', description: 'List of actionable steps' },
      reminderEnabled: { type: 'boolean', description: 'Whether to trigger notifications' },
    }
  },
  'routine.list': {
    name: 'routine.list',
    category: 'routine',
    description: 'Lists all daily routines configured for the user',
    requiresConfirmation: false,
    parametersSchema: {}
  },
  'routine.complete': {
    name: 'routine.complete',
    category: 'routine',
    description: 'Marks a daily routine as completed for today',
    requiresConfirmation: false,
    parametersSchema: {
      routineId: { type: 'string', description: 'ID of the routine to complete', required: true },
      notes: { type: 'string', description: 'Optional completion reflection' }
    }
  },

  // 2. MEDICATION TOOLS (Modifications require explicit confirmation)
  'medication.list': {
    name: 'medication.list',
    category: 'medication',
    description: 'Retrieves current active medications and today schedule',
    requiresConfirmation: false,
    parametersSchema: {}
  },
  'medication.event.record': {
    name: 'medication.event.record',
    category: 'medication',
    description: 'Records whether a medication dose was taken, skipped, or snoozed',
    requiresConfirmation: false,
    parametersSchema: {
      medicationId: { type: 'string', description: 'ID of the medication', required: true },
      status: { type: 'string', description: 'taken, skipped, or snoozed', required: true },
      time: { type: 'string', description: 'Scheduled time' }
    }
  },
  'medication.schedule.update': {
    name: 'medication.schedule.update',
    category: 'medication',
    description: 'Updates medication dose timing. ALWAYS requires explicit user confirmation.',
    requiresConfirmation: true,
    confirmationMessageTemplate: (p) => `Update schedule for ${p.medicationName || 'medication'} from ${p.oldTime || 'current time'} to ${p.newTime}?`,
    parametersSchema: {
      medicationId: { type: 'string', description: 'ID of the medication', required: true },
      newTime: { type: 'string', description: 'New scheduled time', required: true }
    }
  },

  // 3. HABIT TOOLS
  'habit.create': {
    name: 'habit.create',
    category: 'habit',
    description: 'Creates a new recurring wellness habit',
    requiresConfirmation: false,
    parametersSchema: {
      name: { type: 'string', description: 'Name of the habit', required: true },
      category: { type: 'string', description: 'Category' }
    }
  },
  'habit.complete': {
    name: 'habit.complete',
    category: 'habit',
    description: 'Marks a habit as completed for today',
    requiresConfirmation: false,
    parametersSchema: {
      habitId: { type: 'string', description: 'ID of the habit', required: true }
    }
  },

  // 4. DIGITAL WELLBEING TOOLS
  'digital_wellbeing.get_summary': {
    name: 'digital_wellbeing.get_summary',
    category: 'digital_wellbeing',
    description: 'Retrieves today screen time, top app, focus time, and digital balance score',
    requiresConfirmation: false,
    parametersSchema: {}
  },
  'digital_wellbeing.start_focus': {
    name: 'digital_wellbeing.start_focus',
    category: 'digital_wellbeing',
    description: 'Starts a user-requested focus session with specified duration',
    requiresConfirmation: false,
    parametersSchema: {
      durationMinutes: { type: 'number', description: 'Duration in minutes', required: true },
      presetName: { type: 'string', description: 'Deep Work, Mental Reset, Bedtime Sanctuary' }
    }
  },
  'digital_wellbeing.stop_focus': {
    name: 'digital_wellbeing.stop_focus',
    category: 'digital_wellbeing',
    description: 'Stops the active focus session',
    requiresConfirmation: false,
    parametersSchema: {}
  },
  'digital_wellbeing.set_limit': {
    name: 'digital_wellbeing.set_limit',
    category: 'digital_wellbeing',
    description: 'Sets a daily usage time limit for a specific application',
    requiresConfirmation: false,
    parametersSchema: {
      appName: { type: 'string', description: 'App name (e.g. Instagram, TikTok, YouTube)', required: true },
      limitMinutes: { type: 'number', description: 'Daily limit in minutes', required: true }
    }
  },
  'digital_wellbeing.create_rule': {
    name: 'digital_wellbeing.create_rule',
    category: 'digital_wellbeing',
    description: 'Creates a deterministic digital wellbeing rule (WHEN -> THEN -> UNTIL)',
    requiresConfirmation: false,
    parametersSchema: {
      ruleName: { type: 'string', description: 'Name of rule', required: true },
      triggerType: { type: 'string', description: 'app_usage, time_of_day, session_duration', required: true },
      target: { type: 'string', description: 'Target app or time' },
      action: { type: 'string', description: 'show_warning, block_app, start_sleep' }
    }
  },

  // 5. CHALLENGE TOOLS
  'challenge.create': {
    name: 'challenge.create',
    category: 'challenge',
    description: 'Creates a measurable, verifiable challenge (free or stake-based). Staked challenges require user confirmation.',
    requiresConfirmation: false,
    parametersSchema: {
      title: { type: 'string', description: 'Title of the challenge', required: true },
      description: { type: 'string', description: 'Challenge description' },
      category: { type: 'string', description: 'physical, sleep, digital_wellbeing, hydration, habits, social, nura_360', required: true },
      mode: { type: 'string', description: 'solo, 1v1, friends, group, team, race, survival, streak_battle' },
      durationDays: { type: 'number', description: 'Duration in days', required: true },
      objectives: { type: 'array', description: 'List of verifiable objectives' },
      isMonetary: { type: 'boolean', description: 'Whether the challenge requires a monetary entry fee' },
      entryFee: { type: 'number', description: 'Entry stake amount (e.g. 100 ETB)' },
      currency: { type: 'string', description: 'Currency code e.g. ETB, USD' },
      isPrivate: { type: 'boolean', description: 'Whether challenge is private to invitees' }
    }
  },
  'challenge.search': {
    name: 'challenge.search',
    category: 'challenge',
    description: 'Searches wellness challenges by keyword or category',
    requiresConfirmation: false,
    parametersSchema: {
      query: { type: 'string', description: 'Search term', required: true }
    }
  },
  'challenge.get': {
    name: 'challenge.get',
    category: 'challenge',
    description: 'Retrieves complete challenge details, prize pool, and objectives',
    requiresConfirmation: false,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of the challenge', required: true }
    }
  },
  'challenge.list': {
    name: 'challenge.list',
    category: 'challenge',
    description: 'Lists user active, upcoming, or completed challenges',
    requiresConfirmation: false,
    parametersSchema: {
      filter: { type: 'string', description: 'active, completed, created_by_me, trending' }
    }
  },
  'challenge.join': {
    name: 'challenge.join',
    category: 'challenge',
    description: 'Enrolls the user in a wellness challenge. Requires confirmation if entry fee > 0.',
    requiresConfirmation: false,
    confirmationMessageTemplate: (p) => `Join "${p.challengeTitle || 'Challenge'}" with entry fee of ${p.entryFee || 0} ${p.currency || 'ETB'}?`,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of challenge to join', required: true },
      entryFee: { type: 'number', description: 'Entry fee if monetary' },
      currency: { type: 'string', description: 'Currency code' }
    }
  },
  'challenge.start_session': {
    name: 'challenge.start_session',
    category: 'challenge',
    description: 'Starts an active verification session (camera reps, run GPS, focus timer, or location check-in)',
    requiresConfirmation: false,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of challenge', required: true },
      objectiveId: { type: 'string', description: 'ID of objective being tackled', required: true },
      verificationMethod: { type: 'string', description: 'device, camera, location, mutual, evidence' }
    }
  },
  'challenge.submit_verification': {
    name: 'challenge.submit_verification',
    category: 'challenge',
    description: 'Submits verified reps, duration, location check-in, or evidence proof for a session',
    requiresConfirmation: false,
    parametersSchema: {
      sessionId: { type: 'string', description: 'ID of live session', required: true },
      challengeId: { type: 'string', description: 'ID of challenge', required: true },
      repsValid: { type: 'number', description: 'Number of validated reps' },
      measurementValue: { type: 'number', description: 'Measured value (e.g. km, minutes)' },
      evidenceUrl: { type: 'string', description: 'Uploaded photo/video proof URL if evidence-based' }
    }
  },
  'challenge.get_leaderboard': {
    name: 'challenge.get_leaderboard',
    category: 'challenge',
    description: 'Retrieves live leaderboard rankings and progress for a challenge',
    requiresConfirmation: false,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of challenge', required: true }
    }
  },
  'challenge.get_activity': {
    name: 'challenge.get_activity',
    category: 'challenge',
    description: 'Retrieves real-time event feed for a challenge',
    requiresConfirmation: false,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of challenge', required: true }
    }
  },
  'challenge.invite': {
    name: 'challenge.invite',
    category: 'challenge',
    description: 'Generates invite code and share link for a challenge',
    requiresConfirmation: false,
    parametersSchema: {
      challengeId: { type: 'string', description: 'ID of challenge', required: true }
    }
  },

  // 6. WALLET & REWARDS TOOLS
  'wallet.get_balance': {
    name: 'wallet.get_balance',
    category: 'wallet',
    description: 'Retrieves user wallet balances: withdrawable earnings, winnings, creator rewards, Nura points, and XP',
    requiresConfirmation: false,
    parametersSchema: {}
  },
  'wallet.get_transactions': {
    name: 'wallet.get_transactions',
    category: 'wallet',
    description: 'Retrieves ledger transaction history for stakes, winnings, and creator rewards',
    requiresConfirmation: false,
    parametersSchema: {
      limit: { type: 'number', description: 'Number of transactions to fetch' }
    }
  },

  // 6. COMMUNITY TOOLS (Public posting requires confirmation)
  'community.post.create': {
    name: 'community.post.create',
    category: 'community',
    description: 'Publishes a post to the NuraCare community. ALWAYS requires confirmation.',
    requiresConfirmation: true,
    confirmationMessageTemplate: (p) => `Publish this post to the community?\n\n"${p.content}"`,
    parametersSchema: {
      content: { type: 'string', description: 'Text content of the post', required: true },
      category: { type: 'string', description: 'Wellness category' }
    }
  },

  // 7. NOTIFICATION TOOLS
  'notification.schedule': {
    name: 'notification.schedule',
    category: 'notification',
    description: 'Schedules a local reminder notification',
    requiresConfirmation: false,
    parametersSchema: {
      title: { type: 'string', description: 'Notification title', required: true },
      body: { type: 'string', description: 'Notification message', required: true },
      time: { type: 'string', description: 'Time of day e.g. 20:00', required: true }
    }
  }
};
