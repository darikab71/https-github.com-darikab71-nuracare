/**
 * NuraCare Conversation Memory API
 * Vercel Edge / Serverless Function — /api/memory
 *
 * Persists and retrieves structured conversation summaries for cross-session & cross-device continuity.
 * Allows Nura AI to remember user background, ongoing health goals, and past advice
 * whether user logs in via Mobile App or Web.
 */
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key);
}

export default async function handler(req, res) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return res ? res.status(204).end() : new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const supabase = getSupabaseAdmin();

  // GET /api/memory?user_id=xyz
  if (req.method === 'GET') {
    const userId = (req.query && req.query.user_id) || (new URL(req.url, 'http://localhost').searchParams.get('user_id'));
    if (!userId) {
      const err = { error: 'Missing user_id query parameter' };
      return res ? res.status(400).json(err) : new Response(JSON.stringify(err), { status: 400, headers: CORS_HEADERS });
    }

    try {
      // Query recent sessions with memory summaries
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name, messages, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('[Memory API] Supabase select error:', error.message);
        return res ? res.status(200).json({ summaries: [] }) : new Response(JSON.stringify({ summaries: [] }), { headers: CORS_HEADERS });
      }

      // Extract summaries from messages
      const summaries = [];
      for (const session of data || []) {
        if (Array.isArray(session.messages)) {
          const summaryMsg = session.messages.find(m => m.isSummary || m.role === 'system_summary');
          if (summaryMsg) {
            summaries.push({
              sessionId: session.id,
              sessionName: session.name,
              summary: summaryMsg.content,
              updatedAt: session.updated_at,
            });
          }
        }
      }

      const body = JSON.stringify({ summaries });
      return res ? res.status(200).json({ summaries }) : new Response(body, { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    } catch (err) {
      console.error('[Memory API] Error:', err);
      const errBody = JSON.stringify({ error: err.message, summaries: [] });
      return res ? res.status(500).json({ error: err.message }) : new Response(errBody, { status: 500, headers: CORS_HEADERS });
    }
  }

  // POST /api/memory
  if (req.method === 'POST') {
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      try { bodyData = JSON.parse(bodyData); } catch {}
    }

    const { userId, sessionId, summary, sessionName } = bodyData || {};
    if (!userId || !summary) {
      const err = { error: 'userId and summary are required' };
      return res ? res.status(400).json(err) : new Response(JSON.stringify(err), { status: 400, headers: CORS_HEADERS });
    }

    try {
      const activeSessionId = sessionId || `session_${userId}_${Date.now()}`;
      
      // Update session with summary marker
      const { error } = await supabase
        .from('sessions')
        .upsert({
          id: activeSessionId,
          user_id: userId,
          name: sessionName || 'Consultation Summary',
          messages: [
            { role: 'system_summary', content: summary, isSummary: true, timestamp: new Date().toISOString() }
          ],
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.warn('[Memory API] Upsert error:', error.message);
      }

      const resp = { success: true, message: 'Memory persisted' };
      return res ? res.status(200).json(resp) : new Response(JSON.stringify(resp), { status: 200, headers: CORS_HEADERS });
    } catch (err) {
      console.error('[Memory API] POST error:', err);
      const errBody = JSON.stringify({ error: err.message });
      return res ? res.status(500).json({ error: err.message }) : new Response(errBody, { status: 500, headers: CORS_HEADERS });
    }
  }

  return res ? res.status(405).end() : new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
}
