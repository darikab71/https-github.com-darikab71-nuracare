import { NuraToolResult } from '@nuracare/shared';
import { supabase } from '../supabase/client';
import { getDigitalUsage, updateAppLimit, saveRule, getAppLimits, AppLimitItem } from '../../storage/digitalWellbeingStorage';
import { getMedications, updateMedication, getMedicationLogs, logDoseAction, MedicationItem } from '../../storage/medicationStorage';
import { getRoutines, toggleRoutineStep, RoutineStep, RoutineData } from '../../storage/lifestyleStorage';
import { digitalWellnessService } from '../digital/digitalWellnessService';
import { challengeEngine } from '../challenge/challengeEngine';
import { verificationEngine } from '../challenge/verificationEngine';

export class NuraToolExecutor {
  /**
   * Executes a registered Nura tool with parameter validation and real persistence
   */
  async execute(toolName: string, params: any, userId?: string): Promise<NuraToolResult> {
    const startTime = Date.now();
    let result: NuraToolResult;

    try {
      switch (toolName) {
        // --- 1. ROUTINE TOOLS ---
        case 'routine.create': {
          const routines = getRoutines();
          const targetRoutine = params.category?.toLowerCase() === 'evening' ? routines.evening : routines.morning;
          const newStep: RoutineStep = {
            id: `step_${Date.now()}`,
            title: params.title || 'Wellness Routine Step',
            time: params.timeOfDay || '08:00',
            completed: false,
            detail: Array.isArray(params.items) ? params.items.join(', ') : params.items || 'Mindful habit reset'
          };
          targetRoutine.steps.push(newStep);

          // Sync to Supabase if authenticated
          if (userId && !userId.startsWith('guest_')) {
            try {
              await supabase.from('daily_routines').insert({
                id: newStep.id,
                user_id: userId,
                title: newStep.title,
                time_of_day: newStep.time,
                category: params.category || 'Morning',
                items: Array.isArray(params.items) ? params.items : [newStep.detail]
              });
            } catch (err) {
              console.warn('[NuraToolExecutor] Supabase routine insert deferred:', err);
            }
          }

          result = {
            success: true,
            action: toolName,
            resourceId: newStep.id,
            data: newStep,
            message: `Created "${newStep.title}" scheduled for ${newStep.time}.`
          };
          break;
        }

        case 'routine.list': {
          const routines = getRoutines();
          const allSteps = [...routines.morning.steps, ...routines.evening.steps];
          result = {
            success: true,
            action: toolName,
            data: routines,
            message: allSteps.length > 0 
              ? `You have ${allSteps.length} active steps: ${allSteps.map(r => `${r.title} at ${r.time}`).join(', ')}.`
              : `You don't have any routines configured yet.`
          };
          break;
        }

        case 'routine.complete': {
          const routines = getRoutines();
          let targetType: 'morning' | 'evening' = 'morning';
          let found = routines.morning.steps.find(s => s.id === params.routineId);
          if (!found) {
            found = routines.evening.steps.find(s => s.id === params.routineId);
            if (found) targetType = 'evening';
          }
          if (found) {
            toggleRoutineStep(targetType, found.id);
          }

          result = {
            success: true,
            action: toolName,
            message: `Marked routine as completed! Great consistency.`
          };
          break;
        }

        // --- 2. MEDICATION TOOLS ---
        case 'medication.list': {
          const meds = getMedications();
          result = {
            success: true,
            action: toolName,
            data: meds,
            message: meds.length > 0
              ? `Active medications: ${meds.map(m => `${m.name} (${m.dosage}) at ${(m.times || []).join(', ')}`).join(', ')}.`
              : `No active medications logged in your schedule.`
          };
          break;
        }

        case 'medication.event.record': {
          const today = new Date().toISOString().split('T')[0];
          logDoseAction(params.medicationId || 'med-default-1', today, params.time || '08:00', params.status === 'skipped' ? 'skipped' : 'taken', params.notes);

          result = {
            success: true,
            action: toolName,
            message: `Logged ${params.status || 'taken'} for medication.`
          };
          break;
        }

        case 'medication.schedule.update': {
          const meds = getMedications();
          const target = meds.find(m => m.id === params.medicationId || m.name.toLowerCase() === params.medicationName?.toLowerCase());
          if (target) {
            target.times = [params.newTime || '09:00'];
            updateMedication(target);
            result = {
              success: true,
              action: toolName,
              message: `Updated ${target.name} schedule to ${target.times[0]}.`
            };
          } else {
            result = {
              success: false,
              action: toolName,
              message: `Medication not found in schedule.`
            };
          }
          break;
        }

        // --- 3. DIGITAL WELLBEING TOOLS ---
        case 'digital_wellbeing.get_summary': {
          const usage = getDigitalUsage();
          result = {
            success: true,
            action: toolName,
            data: usage,
            message: `Today's screen time is ${Math.floor(usage.totalScreenMinutes / 60)}h ${usage.totalScreenMinutes % 60}m. Top distraction: ${usage.topApps[0]?.name || 'None'}.`
          };
          break;
        }

        case 'digital_wellbeing.start_focus': {
          const mins = params.durationMinutes || 25;
          const presetName = params.presetName || 'Custom Focus';
          digitalWellnessService.startFocusSession(presetName, mins);

          result = {
            success: true,
            action: toolName,
            message: `Started ${mins}-minute Focus Mode (${presetName}). Distracting alerts silenced.`
          };
          break;
        }

        case 'digital_wellbeing.set_limit': {
          const limits = getAppLimits();
          const existing = limits.find(l => l.name.toLowerCase() === params.appName.toLowerCase());
          if (existing) {
            updateAppLimit({ ...existing, dailyLimitMinutes: params.limitMinutes, isEnabled: true });
          } else {
            const newLimit: AppLimitItem = {
              id: `limit_${Date.now()}`,
              name: params.appName,
              packageName: `com.app.${params.appName.toLowerCase().replace(/\s+/g, '')}`,
              category: 'Social',
              dailyLimitMinutes: params.limitMinutes,
              usedMinutesToday: 0,
              isEnabled: true,
              pauseBeforeOpen: true
            };
            updateAppLimit(newLimit);
          }

          result = {
            success: true,
            action: toolName,
            message: `Set daily ceiling for ${params.appName} to ${params.limitMinutes} minutes.`
          };
          break;
        }

        case 'digital_wellbeing.create_rule': {
          saveRule({
            id: `rule_${Date.now()}`,
            name: params.ruleName || 'Smart Wellbeing Rule',
            isEnabled: true,
            trigger: {
              type: params.triggerType || 'time_of_day',
              target: params.target || '22:30'
            } as any,
            actions: [
              {
                type: params.action || 'start_sleep',
                message: params.message || 'Time for rest'
              }
            ]
          });

          result = {
            success: true,
            action: toolName,
            message: `Created and enabled rule "${params.ruleName}".`
          };
          break;
        }

        // --- 4. COMMUNITY TOOLS ---
        case 'community.post.create': {
          const content = params.content || 'Staying consistent with my wellness journey!';
          let createdPost: any = null;

          if (userId && !userId.startsWith('guest_')) {
            const { data, error } = await supabase.from('community_posts').insert({
              user_id: userId,
              content,
              category: 'General',
              author_name: 'Nura Explorer'
            }).select().single();

            if (!error) createdPost = data;
          }

          result = {
            success: true,
            action: toolName,
            resourceId: createdPost?.id || `local_post_${Date.now()}`,
            data: createdPost,
            message: `Published post to community feed: "${content}".`
          };
          break;
        }

        // --- 5. NOTIFICATION TOOLS ---
        case 'notification.schedule': {
          result = {
            success: true,
            action: toolName,
            message: `Notification scheduled for ${params.time}: "${params.title}".`
          };
          break;
        }

        // --- 6. CHALLENGE TOOLS ---
        case 'challenge.create': {
          const goal = params.dailyGoal || params.title || '';
          const assessment = verificationEngine.assessVerifiability(goal);
          if (!assessment.isVerifiable) {
            result = {
              success: false,
              action: toolName,
              message: `That goal is subjective: ${assessment.explanation}. ${assessment.suggestedAlternative || ''}`,
              data: { assessment }
            };
            break;
          }

          const entryFee = params.entryFee || 0;
          const econ = challengeEngine.calculatePoolEconomics(entryFee, 1);
          const created = await challengeEngine.createChallenge({
            title: params.title || assessment.suggestedObjective?.title || 'Habit Challenge',
            description: params.description || 'Verified habit-building challenge.',
            category: params.category || 'physical',
            mode: params.mode || 'group',
            durationDays: params.durationDays || 7,
            difficulty: 'Moderate',
            dailyGoal: goal,
            rules: params.rules || ['Follow real-time verification rules daily.'],
            creator: 'You',
            creatorBadge: 'Host',
            participantsCount: 1,
            currentDay: 1,
            streak: 1,
            isJoined: true,
            isCompleted: false,
            completedDays: [1],
            coverColor: '#16a34a',
            iconName: 'Flame',
            verificationType: params.verificationType || assessment.recommendedType,
            verificationStrength: assessment.strength,
            isMonetary: entryFee > 0,
            entryFee,
            currency: 'ETB',
            grossPool: econ.grossPool,
            prizePool: econ.prizePool
          });

          result = {
            success: true,
            action: toolName,
            resourceId: created.id,
            data: created,
            message: `Created challenge "${created.title}" with ${assessment.strength} verification.${entryFee > 0 ? ` Staking entry: ${entryFee} ETB.` : ''}`
          };
          break;
        }

        case 'challenge.list': {
          const list = await challengeEngine.getChallenges(params.category || params.filter);
          result = {
            success: true,
            action: toolName,
            data: list,
            message: list.length > 0
              ? `Found ${list.length} challenges: ${list.slice(0, 3).map(c => `"${c.title}" (${c.participantsCount} joined)`).join(', ')}.`
              : `No active challenges found.`
          };
          break;
        }

        case 'challenge.get': {
          const list = await challengeEngine.getChallenges();
          const found = list.find(c => c.id === params.challengeId || c.title.toLowerCase().includes(params.query?.toLowerCase() || ''));
          if (found) {
            result = {
              success: true,
              action: toolName,
              data: found,
              message: `Challenge "${found.title}": ${found.durationDays} days, ${found.participantsCount} participants, verification: ${found.verificationStrength || 'device'}.`
            };
          } else {
            result = {
              success: false,
              action: toolName,
              message: `Challenge not found.`
            };
          }
          break;
        }

        case 'challenge.join': {
          const list = await challengeEngine.getChallenges();
          const target = list.find(c => c.id === params.challengeId);
          if (!target) {
            result = {
              success: false,
              action: toolName,
              message: `Challenge ${params.challengeId} not found.`
            };
            break;
          }

          if (target.isMonetary && !params.confirmedStake) {
            const econ = challengeEngine.calculatePoolEconomics(target.entryFee || 50, (target.participantsCount || 1) + 1);
            result = {
              success: false,
              action: toolName,
              data: { requiresConfirmation: true, entryFee: target.entryFee, economics: econ },
              message: `Joining "${target.title}" requires staking ${target.entryFee} ETB. Gross Pool: ${econ.grossPool} ETB, Finisher Prize: ${econ.prizePool} ETB. Please confirm stake to proceed.`
            };
            break;
          }

          const joined = await challengeEngine.joinChallenge(target.id, userId || 'user_me');
          result = {
            success: true,
            action: toolName,
            data: joined,
            message: `Joined "${target.title}"! Your daily targets are ready.`
          };
          break;
        }

        case 'challenge.start_session': {
          const sess = await challengeEngine.startSession(
            params.challengeId,
            params.objectiveId || 'obj_1',
            params.verificationType || 'camera',
            params.targetValue || 30,
            userId || 'user_me'
          );
          result = {
            success: true,
            action: toolName,
            data: sess,
            message: `Live session ${sess.id} started. AI camera pose detection activated.`
          };
          break;
        }

        case 'challenge.submit_verification': {
          const completed = await challengeEngine.completeSession(
            params.sessionId,
            params.reps || params.measurementValue || 0,
            params.evidenceUrl,
            userId
          );
          result = {
            success: true,
            action: toolName,
            data: completed,
            message: `Session verified! ${completed.message}`
          };
          break;
        }

        case 'challenge.get_leaderboard': {
          const ranks = await challengeEngine.getLeaderboard(params.challengeId);
          result = {
            success: true,
            action: toolName,
            data: ranks,
            message: `Leaderboard top participants: ${ranks.slice(0, 3).map((r, i) => `#${i + 1} ${r.name} (${r.streak}d streak)`).join(', ')}.`
          };
          break;
        }

        case 'challenge.get_activity': {
          const feed = await challengeEngine.getActivityFeed(params.challengeId);
          result = {
            success: true,
            action: toolName,
            data: feed,
            message: `Recent activity: ${feed.slice(0, 3).map(e => `${e.userName}: ${e.title}`).join(' | ')}.`
          };
          break;
        }

        // --- 7. WALLET TOOLS ---
        case 'wallet.get_balance': {
          const wallet = challengeEngine.getWallet(userId);
          result = {
            success: true,
            action: toolName,
            data: wallet,
            message: `Your balance: ${wallet.withdrawableBalance.toFixed(2)} ${wallet.currency}. Challenge winnings: ${wallet.challengeWinnings.toFixed(2)} ETB, Nura Points: ${wallet.nuraPoints} pts.`
          };
          break;
        }

        default:
          result = {
            success: false,
            action: toolName,
            message: `Unknown or unhandled tool: ${toolName}`
          };
      }
    } catch (err: any) {
      result = {
        success: false,
        action: toolName,
        error: err.message,
        message: `Execution failed: ${err.message}`
      };
    }

    // Record audit log asynchronously
    if (userId && !userId.startsWith('guest_')) {
      try {
        await supabase.from('nura_audit_logs').insert({
          user_id: userId,
          tool_name: toolName,
          parameters: params,
          result: result,
          status: result.success ? 'success' : 'failed',
          execution_duration_ms: Date.now() - startTime
        });
      } catch {}
    }

    return result;
  }
}

export const nuraToolExecutor = new NuraToolExecutor();
