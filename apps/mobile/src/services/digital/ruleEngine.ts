import {
  getRules,
  DigitalWellbeingRule,
  getAppLimits,
  getDigitalUsage,
  NuraIntervention,
  addNuraIntervention
} from '../../storage/digitalWellbeingStorage';

export interface StructuredWellbeingEvent {
  eventId: string;
  eventType: 'APP_LIMIT_REACHED' | 'OVERUSE_WARNING' | 'FOCUS_STARTED' | 'SLEEP_WINDOW_STARTED' | 'SESSION_EXCEEDED';
  appName?: string;
  category?: string;
  usageMinutes: number;
  limitMinutes?: number;
  timestamp: string;
  suggestedAction?: string;
}

export class DigitalWellbeingRuleEngine {
  /**
   * Evaluates all active deterministic rules against current device usage state
   */
  evaluateRules(): {
    triggeredRules: DigitalWellbeingRule[];
    actionsToExecute: string[];
    structuredEvents: StructuredWellbeingEvent[];
  } {
    const rules = getRules().filter(r => r.isEnabled);
    const limits = getAppLimits();
    const usage = getDigitalUsage();

    const triggeredRules: DigitalWellbeingRule[] = [];
    const actionsToExecute: string[] = [];
    const structuredEvents: StructuredWellbeingEvent[] = [];

    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHour}:${currentMinute}`;

    for (const rule of rules) {
      let isTriggered = false;

      // 1. App Usage Threshold Trigger
      if (rule.trigger.type === 'app_usage' && rule.trigger.appName && rule.trigger.thresholdMinutes) {
        const appLimit = limits.find(l => l.name.toLowerCase() === rule.trigger.appName?.toLowerCase());
        const appUsage = usage.topApps.find(a => a.name.toLowerCase() === rule.trigger.appName?.toLowerCase());
        const used = appLimit?.usedMinutesToday || appUsage?.minutes || 0;

        if (used >= rule.trigger.thresholdMinutes) {
          isTriggered = true;
          structuredEvents.push({
            eventId: `evt_${Date.now()}_${rule.id}`,
            eventType: 'APP_LIMIT_REACHED',
            appName: rule.trigger.appName,
            usageMinutes: used,
            limitMinutes: rule.trigger.thresholdMinutes,
            timestamp: now.toISOString(),
            suggestedAction: 'Offer 15-min focus session or graceful break'
          });
        }
      }

      // 2. Time of Day Trigger (e.g. 22:30 Bedtime)
      if (rule.trigger.type === 'time_of_day' && rule.trigger.timeOfDay) {
        if (currentTimeStr >= rule.trigger.timeOfDay) {
          isTriggered = true;
          structuredEvents.push({
            eventId: `evt_${Date.now()}_${rule.id}`,
            eventType: 'SLEEP_WINDOW_STARTED',
            usageMinutes: usage.totalScreenMinutes,
            timestamp: now.toISOString(),
            suggestedAction: 'Activate night sanctuary curfew'
          });
        }
      }

      // 3. Category Usage Trigger
      if (rule.trigger.type === 'category_usage' && rule.trigger.category && rule.trigger.thresholdMinutes) {
        const catKey = rule.trigger.category.toLowerCase() as keyof typeof usage.categories;
        const catUsed = usage.categories[catKey] || 0;
        if (catUsed >= rule.trigger.thresholdMinutes) {
          isTriggered = true;
          structuredEvents.push({
            eventId: `evt_${Date.now()}_${rule.id}`,
            eventType: 'OVERUSE_WARNING',
            category: rule.trigger.category,
            usageMinutes: catUsed,
            limitMinutes: rule.trigger.thresholdMinutes,
            timestamp: now.toISOString(),
            suggestedAction: 'Suggest parasympathetic breathwork reset'
          });
        }
      }

      if (isTriggered) {
        triggeredRules.push(rule);
        rule.actions.forEach(a => {
          actionsToExecute.push(a.type);

          // If warning or Nura pause action, create local Nura intervention
          if (a.type === 'show_warning' || a.type === 'show_nura_pause') {
            const intervention: NuraIntervention = {
              id: `interv_${Date.now()}_${rule.id}`,
              type: a.type === 'show_nura_pause' ? 'overuse_warning' : 'limit_reached',
              appName: rule.trigger.appName,
              message: a.message || `You've reached your configured ${rule.name} boundary. Take a mindful moment.`,
              actions: [
                { label: 'Start Focus', actionType: 'start_focus' },
                { label: 'Extend 10m', actionType: 'extend_10m' },
                { label: 'Dismiss', actionType: 'dismiss' }
              ],
              timestamp: now.toISOString(),
              dismissed: false
            };
            addNuraIntervention(intervention);
          }
        });
      }
    }

    return { triggeredRules, actionsToExecute, structuredEvents };
  }
}

export const ruleEngine = new DigitalWellbeingRuleEngine();
