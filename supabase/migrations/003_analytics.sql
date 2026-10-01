-- 003_analytics.sql
-- Migration: Analytics events table for technical and product telemetry

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  platform TEXT NOT NULL,           -- 'android', 'ios', 'web'
  app_version TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON public.analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_platform ON public.analytics_events (platform);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events (created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- Allow anonymous and authenticated client ingestion
CREATE POLICY "Allow ingest of analytics events"
  ON public.analytics_events FOR INSERT WITH CHECK (true);
