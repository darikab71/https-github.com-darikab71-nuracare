import { NuraActionStep, NuraAgentPlan, NURA_TOOLS } from '@nuracare/shared';
import { nuraToolExecutor } from './nuraToolExecutor';

export interface AgentProcessResult {
  textResponse: string;
  plan?: NuraAgentPlan;
  executedSteps: NuraActionStep[];
  pendingConfirmation?: {
    toolName: string;
    params: any;
    prompt: string;
  };
}

export class NuraAgentEngine {
  /**
   * Plans and executes user intent using registered tools
   */
  async processUserMessage(
    userText: string,
    userId?: string
  ): Promise<AgentProcessResult> {
    const lower = userText.toLowerCase().trim();

    // 1. Detect Intent and Construct Action Plan
    const steps: NuraActionStep[] = [];

    // Pattern A: Multi-Action Request (e.g. "Prepare evening routine: focus at 7pm, water at 8pm, sleep mode at 10:30pm")
    if (lower.includes('prepare') && lower.includes('evening') || (lower.includes('focus') && lower.includes('sleep'))) {
      steps.push({
        toolName: 'routine.create',
        params: { title: 'Evening Wind-Down', timeOfDay: '19:00', category: 'Evening', items: ['Prepare for rest', 'Hydrate'] },
        status: 'pending'
      });
      steps.push({
        toolName: 'notification.schedule',
        params: { title: 'Hydration Anchor', body: 'Drink 300ml water before sleep window', time: '20:00' },
        status: 'pending'
      });
      steps.push({
        toolName: 'digital_wellbeing.create_rule',
        params: { ruleName: 'Evening Sleep Sanctuary', triggerType: 'time_of_day', target: '22:30', action: 'start_sleep' },
        status: 'pending'
      });
    }

    // Pattern B: Routine creation (e.g. "Create a morning routine at 7 AM")
    else if (lower.includes('create') && (lower.includes('routine') || lower.includes('morning') || lower.includes('evening'))) {
      const timeMatch = lower.match(/(\d{1,2}(:\d{2})?\s*(am|pm)?)/i);
      let time = '07:00';
      if (timeMatch) {
        const rawTime = timeMatch[0];
        if (rawTime.includes('pm')) {
          const hr = parseInt(rawTime);
          time = `${hr + 12}:00`;
        } else if (rawTime.includes(':')) {
          time = rawTime.replace(/am|pm|\s/gi, '');
        } else {
          time = `${rawTime.padStart(2, '0')}:00`;
        }
      }

      steps.push({
        toolName: 'routine.create',
        params: {
          title: lower.includes('morning') ? 'Morning Mobility & Vitality' : 'Custom Daily Routine',
          timeOfDay: time,
          category: lower.includes('morning') ? 'Morning' : 'General',
          items: ['Hydrate with 500ml water', 'Mindful respiration', 'Stretching']
        },
        status: 'pending'
      });
    }

    // Pattern C: Mark routine complete (e.g. "Mark my morning routine complete")
    else if (lower.includes('mark') && lower.includes('complete') && lower.includes('routine')) {
      steps.push({
        toolName: 'routine.complete',
        params: { routineId: 'routine_default' },
        status: 'pending'
      });
    }

    // Pattern D: List routines (e.g. "Show me my routines today")
    else if ((lower.includes('show') || lower.includes('what')) && lower.includes('routine')) {
      steps.push({
        toolName: 'routine.list',
        params: {},
        status: 'pending'
      });
    }

    // Pattern E: Focus Mode (e.g. "Start a 25-minute focus session")
    else if (lower.includes('focus') && (lower.includes('start') || lower.includes('session') || lower.includes('mode'))) {
      const numMatch = lower.match(/\d+/);
      const mins = numMatch ? parseInt(numMatch[0]) : 25;
      steps.push({
        toolName: 'digital_wellbeing.start_focus',
        params: { durationMinutes: mins, presetName: 'Deep Work' },
        status: 'pending'
      });
    }

    // Pattern F: Screen time summary (e.g. "How much screen time did I have today?", "Show my screen time")
    else if (lower.includes('screen time') || (lower.includes('screen') && lower.includes('usage'))) {
      steps.push({
        toolName: 'digital_wellbeing.get_summary',
        params: {},
        status: 'pending'
      });
    }

    // Pattern G: Set App Limit (e.g. "Set Instagram to 45 minutes")
    else if (lower.includes('limit') || (lower.includes('set') && (lower.includes('instagram') || lower.includes('tiktok') || lower.includes('youtube')))) {
      const appName = lower.includes('instagram') ? 'Instagram' : lower.includes('tiktok') ? 'TikTok' : lower.includes('youtube') ? 'YouTube' : 'Instagram';
      const numMatch = lower.match(/\d+/);
      const mins = numMatch ? parseInt(numMatch[0]) : 45;

      steps.push({
        toolName: 'digital_wellbeing.set_limit',
        params: { appName, limitMinutes: mins },
        status: 'pending'
      });
    }

    // Pattern H: Public community post (REQUIRES CONFIRMATION)
    else if (lower.includes('post') && (lower.includes('saying') || lower.includes('share') || lower.includes('create a post'))) {
      const content = userText.replace(/create a post saying|make a post saying|post saying|share a post saying/gi, '').trim();
      steps.push({
        toolName: 'community.post.create',
        params: { content: content || 'Finished my daily workout and feel energized!' },
        status: 'needs_confirmation',
        confirmationPrompt: `I drafted your post for the community:\n\n"${content || 'Finished my daily workout and feel energized!'}"\n\nWould you like me to publish it?`
      });
    }

    // Pattern I: Medication schedule update (REQUIRES CONFIRMATION)
    else if (lower.includes('medication') && (lower.includes('change') || lower.includes('update') || lower.includes('remind'))) {
      const numMatch = lower.match(/\d+/);
      const newHour = numMatch ? numMatch[0].padStart(2, '0') : '09';
      steps.push({
        toolName: 'medication.schedule.update',
        params: { medicationId: 'med_1', medicationName: 'Morning Vitamins', oldTime: '08:00', newTime: `${newHour}:00` },
        status: 'needs_confirmation',
        confirmationPrompt: `You asked to change your medication schedule. Please confirm updating your reminder from 08:00 to ${newHour}:00.`
      });
    }

    // Pattern J: Medication list (e.g. "Show my medication schedule")
    else if (lower.includes('medication')) {
      steps.push({
        toolName: 'medication.list',
        params: {},
        status: 'pending'
      });
    }

    // 2. If no matching action plan, return conversational guidance
    if (steps.length === 0) {
      return {
        textResponse: `I'm here to support your health and daily rhythm. You can ask me to manage routines, schedule focus sessions, track screen time, set app boundaries, or log medications.`,
        executedSteps: []
      };
    }

    // 3. Check for Confirmation Requirements
    const confirmationStep = steps.find(s => s.status === 'needs_confirmation');
    if (confirmationStep) {
      return {
        textResponse: confirmationStep.confirmationPrompt || 'This action requires your confirmation before proceeding.',
        plan: {
          intent: 'User-Authorized Action',
          summary: 'Pending user confirmation for sensitive or public action',
          steps
        },
        executedSteps: [],
        pendingConfirmation: {
          toolName: confirmationStep.toolName,
          params: confirmationStep.params,
          prompt: confirmationStep.confirmationPrompt || 'Please confirm to proceed.'
        }
      };
    }

    // 4. Execute Planned Steps Sequentially
    const executedSteps: NuraActionStep[] = [];
    const executionSummaries: string[] = [];

    for (const step of steps) {
      step.status = 'executing';
      const result = await nuraToolExecutor.execute(step.toolName, step.params, userId);
      step.result = result;
      step.status = result.success ? 'completed' : 'failed';
      executedSteps.push(step);
      executionSummaries.push(result.message);
    }

    // 5. Construct verified natural response
    const allSuccessful = executedSteps.every(s => s.status === 'completed');
    let naturalResponse = allSuccessful
      ? `Done. ${executionSummaries.join(' ')}`
      : `Some actions completed, but an issue occurred: ${executionSummaries.join(' ')}`;

    return {
      textResponse: naturalResponse,
      plan: {
        intent: 'Action Execution',
        summary: executionSummaries.join(' • '),
        steps: executedSteps
      },
      executedSteps
    };
  }
}

export const nuraAgentEngine = new NuraAgentEngine();
