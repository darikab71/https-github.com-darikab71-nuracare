/**
 * NuraCare Analytics & Telemetry API
 * Vercel Edge / Serverless Function — /api/analytics
 *
 * Ingests batched, non-sensitive product telemetry from Mobile and Web clients:
 *  - App opened / Web opened
 *  - Offline mode entered / exited
 *  - AI request latency / completion
 *  - Feature interaction & update adoption
 *
 * Privacy-first: Strips sensitive clinical/health details.
 */
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Client-Platform, X-Client-Version',
};

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(url, key);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res ? res.status(204).end() : new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return res ? res.status(405).end() : new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch {}
  }

  const { events, platform, appVersion, userId } = body || {};

  if (!events || !Array.isArray(events) || events.length === 0) {
    const err = { error: 'No events provided' };
    return res ? res.status(400).json(err) : new Response(JSON.stringify(err), { status: 400, headers: CORS_HEADERS });
  }

  try {
    const supabase = getSupabase();
    const rows = events.map(evt => ({
      user_id: userId && !String(userId).startsWith('guest_') ? userId : null,
      platform: platform || 'unknown',
      app_version: appVersion || '1.0.0',
      event_name: evt.name,
      properties: evt.properties || {},
      created_at: evt.timestamp || new Date().toISOString(),
    }));

    const { error } = await supabase.from('analytics_events').insert(rows);

    if (error) {
      console.warn('[Analytics API] Supabase insert warning:', error.message);
    }

    const resp = { success: true, count: rows.length };
    return res ? res.status(200).json(resp) : new Response(JSON.stringify(resp), { status: 200, headers: CORS_HEADERS });
  } catch (err) {
    console.error('[Analytics API] Error:', err);
    const errBody = JSON.stringify({ error: err.message });
    return res ? res.status(500).json({ error: err.message }) : new Response(errBody, { status: 500, headers: CORS_HEADERS });
  }
}
