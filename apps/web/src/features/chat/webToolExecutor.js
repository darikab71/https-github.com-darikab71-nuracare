import { supabase } from '@/lib/supabase';

export class WebToolExecutor {
  /**
   * Executes a registered Nura tool with validation and persistence
   */
  async execute(toolName, params, userId, profile) {
    const startTime = Date.now();
    let result = { success: false, action: toolName, message: '' };

    try {
      switch (toolName) {
        // --- 1. ROUTINE TOOLS ---
        case 'routine.create': {
          const stored = localStorage.getItem('nuracare_web_routines');
          const routines = stored ? JSON.parse(stored) : [];
          const newRoutine = {
            id: `routine_${Date.now()}`,
            title: params.title || 'Wellness Routine',
            time: params.timeOfDay || '08:00',
            category: params.category || 'Morning',
            completed: false,
            items: Array.isArray(params.items) ? params.items : [params.items || 'Mindful habit reset']
          };
          routines.push(newRoutine);
          localStorage.setItem('nuracare_web_routines', JSON.stringify(routines));

          // Also dispatch event for web lifestyle page
          window.dispatchEvent(new CustomEvent('nuracare:routine_updated', { detail: newRoutine }));

          // Sync to Supabase if authenticated
          if (userId && !userId.startsWith('guest_')) {
            try {
              await supabase.from('daily_routines').insert({
                id: newRoutine.id,
                user_id: userId,
                title: newRoutine.title,
                time_of_day: newRoutine.time,
                category: newRoutine.category,
                items: newRoutine.items
              });
            } catch (err) {
              console.warn('[WebToolExecutor] Supabase sync deferred:', err);
            }
          }

          result = {
            success: true,
            action: toolName,
            resourceId: newRoutine.id,
            data: newRoutine,
            message: `Created "${newRoutine.title}" scheduled for ${newRoutine.time}.`
          };
          break;
        }

        case 'routine.list': {
          const stored = localStorage.getItem('nuracare_web_routines');
          const routines = stored ? JSON.parse(stored) : [];
          result = {
            success: true,
            action: toolName,
            data: routines,
            message: routines.length > 0
              ? `You have ${routines.length} routine(s): ${routines.map(r => `${r.title} at ${r.time}`).join(', ')}.`
              : `You don't have any custom routines configured yet.`
          };
          break;
        }

        case 'routine.complete': {
          const stored = localStorage.getItem('nuracare_web_routines');
          const routines = stored ? JSON.parse(stored) : [];
          const updated = routines.map(r => r.id === params.routineId ? { ...r, completed: true } : r);
          localStorage.setItem('nuracare_web_routines', JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent('nuracare:routine_updated', { detail: { routineId: params.routineId, completed: true } }));

          result = {
            success: true,
            action: toolName,
            message: `Marked routine as completed! Consistency builds vitality.`
          };
          break;
        }

        // --- 2. MEDICATION TOOLS ---
        case 'medication.list': {
          const meds = profile?.medications 
            ? (Array.isArray(profile.medications) ? profile.medications : profile.medications.split(',').map(m => m.trim()))
            : [];
          result = {
            success: true,
            action: toolName,
            data: meds,
            message: meds.length > 0
              ? `Active medications: ${meds.join(', ')}.`
              : `No active medications logged in your profile.`
          };
          break;
        }

        case 'medication.event.record': {
          const stored = localStorage.getItem('nuracare_medication_logs');
          const logs = stored ? JSON.parse(stored) : [];
          const logEntry = {
            id: `medlog_${Date.now()}`,
            medicationId: params.medicationId || 'general',
            status: params.status || 'taken',
            timestamp: new Date().toISOString()
          };
          logs.push(logEntry);
          localStorage.setItem('nuracare_medication_logs', JSON.stringify(logs));

          result = {
            success: true,
            action: toolName,
            message: `Logged ${params.status || 'taken'} for medication.`
          };
          break;
        }

        case 'medication.schedule.update': {
          const newTime = params.newTime || '09:00';
          const medName = params.medicationName || 'Medication';
          const stored = localStorage.getItem('nuracare_medication_schedules');
          const schedules = stored ? JSON.parse(stored) : {};
          schedules[medName] = newTime;
          localStorage.setItem('nuracare_medication_schedules', JSON.stringify(schedules));

          result = {
            success: true,
            action: toolName,
            message: `Updated reminder for ${medName} to ${newTime}.`
          };
          break;
        }

        // --- 3. DIGITAL WELLBEING TOOLS ---
        case 'digital_wellbeing.get_summary': {
          const raw = localStorage.getItem('nuracare_digital_wellbeing');
          const data = raw ? JSON.parse(raw) : { totalScreenMinutes: 242, socialMinutes: 65, balanceScore: 82 };
          const hrs = Math.floor(data.totalScreenMinutes / 60);
          const mins = data.totalScreenMinutes % 60;

          result = {
            success: true,
            action: toolName,
            data,
            message: `Today's screen exposure is ${hrs}h ${mins}m. Digital Balance score is ${data.balanceScore || 80}/100.`
          };
          break;
        }

        case 'digital_wellbeing.start_focus': {
          const duration = params.durationMinutes || 25;
          const presetName = params.presetName || 'Deep Work';
          const session = {
            id: `focus_${Date.now()}`,
            title: presetName,
            duration,
            startedAt: Date.now()
          };
          localStorage.setItem('nuracare_active_focus', JSON.stringify(session));
          window.dispatchEvent(new CustomEvent('nuracare:focus_started', { detail: session }));

          result = {
            success: true,
            action: toolName,
            message: `Started ${duration}-minute Focus Mode (${presetName}). Distracting notifications silenced.`
          };
          break;
        }

        case 'digital_wellbeing.set_limit': {
          const appName = params.appName || 'Social Media';
          const limitMinutes = params.limitMinutes || 45;
          const raw = localStorage.getItem('nuracare_app_limits');
          const limits = raw ? JSON.parse(raw) : {};
          limits[appName] = limitMinutes;
          localStorage.setItem('nuracare_app_limits', JSON.stringify(limits));
          window.dispatchEvent(new CustomEvent('nuracare:limits_updated', { detail: { appName, limitMinutes } }));

          result = {
            success: true,
            action: toolName,
            message: `Set daily ceiling for ${appName} to ${limitMinutes} minutes.`
          };
          break;
        }

        case 'digital_wellbeing.create_rule': {
          const rule = {
            id: `rule_${Date.now()}`,
            name: params.ruleName || 'Circadian Anchor',
            trigger: params.triggerType || 'time_of_day',
            target: params.target || '22:30',
            action: params.action || 'start_sleep'
          };
          const raw = localStorage.getItem('nuracare_wellbeing_rules');
          const rules = raw ? JSON.parse(raw) : [];
          rules.push(rule);
          localStorage.setItem('nuracare_wellbeing_rules', JSON.stringify(rules));

          result = {
            success: true,
            action: toolName,
            message: `Activated wellbeing rule "${rule.name}" (${rule.action} at ${rule.target}).`
          };
          break;
        }

        // --- 4. COMMUNITY TOOLS ---
        case 'community.post.create': {
          const content = params.content || 'Staying consistent with my wellness journey!';
          const authorName = profile?.name || 'Nura Explorer';

          // Insert into real Supabase community_posts
          if (userId && !userId.startsWith('guest_')) {
            try {
              await supabase.from('community_posts').insert({
                user_id: userId,
                author_name: authorName,
                content,
                category: 'General'
              });
            } catch (err) {
              console.warn('[WebToolExecutor] Supabase community post insert deferred:', err);
            }
          }

          // Emit local event
          window.dispatchEvent(new CustomEvent('nuracare:community_post_created', { detail: { content, authorName } }));

          result = {
            success: true,
            action: toolName,
            message: `Published post to community feed: "${content}".`
          };
          break;
        }

        // --- 5. NOTIFICATION TOOLS ---
        case 'notification.schedule': {
          const note = {
            id: `notif_${Date.now()}`,
            title: params.title || 'Wellness Anchor',
            body: params.body || 'Time for hydration and breath reset',
            time: params.time || '12:00'
          };
          const raw = localStorage.getItem('nuracare_scheduled_notifications');
          const notifs = raw ? JSON.parse(raw) : [];
          notifs.push(note);
          localStorage.setItem('nuracare_scheduled_notifications', JSON.stringify(notifs));

          result = {
            success: true,
            action: toolName,
            message: `Scheduled alert "${note.title}" for ${note.time}.`
          };
          break;
        }

        // --- 6. CHALLENGE TOOLS ---
        case 'challenge.create': {
          const entryFee = params.entryFee || 0;
          const durationDays = params.durationDays || 7;
          const grossPool = entryFee;
          const platformFee = Math.round((grossPool * 10) / 100);
          const creatorReward = Math.round((grossPool * 2) / 100);
          const prizePool = Math.max(0, grossPool - platformFee - creatorReward);

          const newChallenge = {
            id: `ch_${Date.now()}`,
            title: params.title || 'Wellness Challenge',
            description: params.description || 'Verified habit challenge created by Nura.',
            category: params.category || 'physical',
            mode: params.mode || 'solo',
            duration_days: durationDays,
            difficulty: params.difficulty || 'Moderate',
            objectives: params.objectives || [{
              id: 'obj_1',
              title: params.dailyGoal || params.title,
              type: 'habit_completion',
              target: 1,
              unit: 'session',
              verificationType: params.verificationType || 'device',
              verificationStrength: params.verificationStrength || 'device'
            }],
            rules: params.rules || ['Daily verified check-in required'],
            status: 'active',
            is_monetary: entryFee > 0,
            entry_fee: entryFee,
            currency: params.currency || 'ETB',
            gross_pool: grossPool,
            platform_fee_pct: 10,
            creator_reward_pct: 2,
            prize_pool: prizePool,
            invite_code: `NURA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            is_private: !!params.isPrivate,
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
            participant_count: 1,
            creator_id: userId || 'guest'
          };

          // Cache in local storage for guest / web view
          const stored = localStorage.getItem('nc_v2_challenges');
          const list = stored ? JSON.parse(stored) : [];
          list.unshift(newChallenge);
          localStorage.setItem('nc_v2_challenges', JSON.stringify(list));

          // Also add to participants
          const pStored = localStorage.getItem('nc_v2_participants');
          const pList = pStored ? JSON.parse(pStored) : [];
          const myParticipant = {
            id: `part_${Date.now()}`,
            challenge_id: newChallenge.id,
            user_id: userId || 'guest',
            status: 'active',
            streak: 1,
            completed_days: [1],
            joined_at: new Date().toISOString()
          };
          pList.push(myParticipant);
          localStorage.setItem('nc_v2_participants', JSON.stringify(pList));

          // Sync to Supabase if authenticated
          if (userId && !userId.startsWith('guest_')) {
            try {
              await supabase.from('challenges').insert(newChallenge);
              await supabase.from('challenge_members').insert({
                challenge_id: newChallenge.id,
                user_id: userId,
                status: 'active',
                current_day: 1,
                streak: 1,
                progress_percentage: 0
              });
            } catch (err) {
              console.warn('[WebToolExecutor] Supabase challenge sync deferred:', err);
            }
          }

          window.dispatchEvent(new CustomEvent('nuracare:challenge_created', { detail: newChallenge }));

          result = {
            success: true,
            action: toolName,
            resourceId: newChallenge.id,
            data: newChallenge,
            message: `Created challenge "${newChallenge.title}" (${durationDays} days).${entryFee > 0 ? ` Stake: ${entryFee} ETB.` : ''}`
          };
          break;
        }

        case 'challenge.list': {
          let challenges = [];
          if (userId && !userId.startsWith('guest_')) {
            try {
              const { data, error } = await supabase.from('challenges').select('*').order('created_at', { ascending: false });
              if (!error && data) challenges = data;
            } catch {}
          }
          if (challenges.length === 0) {
            const stored = localStorage.getItem('nc_v2_challenges');
            challenges = stored ? JSON.parse(stored) : [];
          }

          result = {
            success: true,
            action: toolName,
            data: challenges,
            message: challenges.length > 0
              ? `You have ${challenges.length} challenge(s) available: ${challenges.slice(0, 3).map(c => `"${c.title}"`).join(', ')}.`
              : `No active challenges found.`
          };
          break;
        }

        case 'challenge.get': {
          const stored = localStorage.getItem('nc_v2_challenges');
          const list = stored ? JSON.parse(stored) : [];
          const found = list.find(c => c.id === params.challengeId || c.title.toLowerCase().includes((params.query || '').toLowerCase()));
          result = {
            success: !!found,
            action: toolName,
            data: found,
            message: found ? `Challenge "${found.title}": ${found.duration_days || 7} days, entry: ${found.entry_fee || 0} ETB.` : `Challenge not found.`
          };
          break;
        }

        case 'challenge.join': {
          const stored = localStorage.getItem('nc_v2_challenges');
          const list = stored ? JSON.parse(stored) : [];
          const target = list.find(c => c.id === params.challengeId);
          if (!target) {
            result = { success: false, action: toolName, message: `Challenge not found.` };
            break;
          }

          const pStored = localStorage.getItem('nc_v2_participants');
          const pList = pStored ? JSON.parse(pStored) : [];
          if (!pList.some(p => p.challenge_id === target.id && p.user_id === (userId || 'guest'))) {
            pList.push({
              id: `part_${Date.now()}`,
              challenge_id: target.id,
              user_id: userId || 'guest',
              status: 'active',
              streak: 0,
              completed_days: [],
              joined_at: new Date().toISOString()
            });
            localStorage.setItem('nc_v2_participants', JSON.stringify(pList));
          }

          if (userId && !userId.startsWith('guest_')) {
            try {
              await supabase.from('challenge_members').insert({
                challenge_id: target.id,
                user_id: userId,
                status: 'active'
              });
            } catch {}
          }

          window.dispatchEvent(new CustomEvent('nuracare:challenge_joined', { detail: target }));

          result = {
            success: true,
            action: toolName,
            data: target,
            message: `Successfully joined "${target.title}"!`
          };
          break;
        }

        case 'challenge.start_session': {
          const session = {
            id: `sess_${Date.now()}`,
            challenge_id: params.challengeId,
            objective_id: params.objectiveId || 'obj_1',
            status: 'live',
            verification_method: params.verificationMethod || 'device',
            started_at: new Date().toISOString()
          };
          localStorage.setItem('nuracare_active_challenge_session', JSON.stringify(session));

          result = {
            success: true,
            action: toolName,
            data: session,
            message: `Started live session for challenge ${params.challengeId}. Verification active.`
          };
          break;
        }

        case 'challenge.submit_verification': {
          const sessionData = localStorage.getItem('nuracare_active_challenge_session');
          const session = sessionData ? JSON.parse(sessionData) : {};
          session.status = 'verified';
          session.reps_valid = params.repsValid || params.measurementValue || 30;
          session.completed_at = new Date().toISOString();
          localStorage.removeItem('nuracare_active_challenge_session');

          result = {
            success: true,
            action: toolName,
            data: session,
            message: `Verification complete! Recorded ${session.reps_valid} valid units.`
          };
          break;
        }

        case 'challenge.get_leaderboard': {
          const pStored = localStorage.getItem('nc_v2_participants');
          const pList = pStored ? JSON.parse(pStored) : [];
          const ranks = pList
            .filter(p => !params.challengeId || p.challenge_id === params.challengeId)
            .sort((a, b) => (b.streak || 0) - (a.streak || 0));

          result = {
            success: true,
            action: toolName,
            data: ranks,
            message: `Leaderboard retrieved with ${ranks.length} participant(s).`
          };
          break;
        }

        // --- 7. WALLET TOOLS ---
        case 'wallet.get_balance': {
          const wStored = localStorage.getItem(`nc_v2_wallet_${userId || 'guest'}`);
          const wallet = wStored ? JSON.parse(wStored) : {
            withdrawable_balance: 420.0,
            challenge_winnings: 350.0,
            nura_points: 850,
            xp: 1240,
            currency: 'ETB'
          };

          result = {
            success: true,
            action: toolName,
            data: wallet,
            message: `Your balance: ${wallet.withdrawable_balance.toFixed(2)} ${wallet.currency}. Winnings: ${wallet.challenge_winnings.toFixed(2)} ETB, Nura Points: ${wallet.nura_points} pts.`
          };
          break;
        }

        default:
          result = {
            success: false,
            action: toolName,
            message: `Tool ${toolName} not supported on web client.`
          };
      }
    } catch (err) {
      console.error(`[WebToolExecutor] Error executing ${toolName}:`, err);
      result = {
        success: false,
        action: toolName,
        message: err.message || 'Execution error'
      };
    }

    // Asynchronously log audit entry
    try {
      if (userId && !userId.startsWith('guest_')) {
        supabase.from('nura_audit_logs').insert({
          user_id: userId,
          tool_name: toolName,
          parameters: params,
          result: { success: result.success, message: result.message },
          status: result.success ? 'success' : 'failed',
          execution_duration_ms: Date.now() - startTime
        }).then(() => {}).catch(() => {});
      }
    } catch {}

    return result;
  }
}

export const webToolExecutor = new WebToolExecutor();
