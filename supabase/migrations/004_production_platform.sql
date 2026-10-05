-- 004_production_platform.sql
-- Production Platform Migration: Routines, Habits, Challenges, Notifications, Digital Wellbeing, Nura Memory & Audit Logs

-- 1. Daily Routines Table
CREATE TABLE IF NOT EXISTS public.daily_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  time_of_day TEXT NOT NULL, -- e.g. '07:00'
  category TEXT NOT NULL DEFAULT 'Morning', -- 'Morning', 'Work', 'Evening', 'Night'
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of items e.g. ['Drink 500ml water', 'Stretching']
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=Mon, 7=Sun
  reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_routines_user_time ON public.daily_routines(user_id, time_of_day);
ALTER TABLE public.daily_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own daily routines"
  ON public.daily_routines FOR ALL USING (auth.uid() = user_id);

-- 2. Routine Completions Table
CREATE TABLE IF NOT EXISTS public.routine_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.daily_routines ON DELETE CASCADE NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  notes TEXT,
  UNIQUE(user_id, routine_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_routine_completions ON public.routine_completions(user_id, completion_date);
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own routine completions"
  ON public.routine_completions FOR ALL USING (auth.uid() = user_id);

-- 3. Habits & Habit Logs
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  target_frequency TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly'
  target_count INTEGER NOT NULL DEFAULT 1,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habits"
  ON public.habits FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits ON DELETE CASCADE NOT NULL,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, habit_id, logged_date)
);

ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own habit logs"
  ON public.habit_logs FOR ALL USING (auth.uid() = user_id);

-- 4. Challenges & Challenge Participation
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Wellness',
  duration_days INTEGER NOT NULL DEFAULT 30,
  difficulty TEXT NOT NULL DEFAULT 'Moderate',
  participants_count INTEGER NOT NULL DEFAULT 1,
  banner_url TEXT,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.challenge_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges ON DELETE CASCADE NOT NULL,
  current_day INTEGER NOT NULL DEFAULT 1,
  progress_percentage NUMERIC NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own challenge memberships"
  ON public.challenge_members FOR ALL USING (auth.uid() = user_id);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'system', 'community', 'routine', 'medication', 'digital_wellbeing'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update own notifications"
  ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- 6. Digital Wellbeing Profiles & Cross-Device Sync
CREATE TABLE IF NOT EXISTS public.digital_wellbeing_profiles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  daily_screen_target_minutes INTEGER NOT NULL DEFAULT 240,
  automation_level TEXT NOT NULL DEFAULT 'balanced' CHECK (automation_level IN ('gentle', 'balanced', 'strict')),
  strict_mode_pin TEXT,
  sleep_schedule JSONB DEFAULT '{"start": "22:30", "end": "06:30", "enabled": true}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.digital_wellbeing_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own digital wellbeing profile"
  ON public.digital_wellbeing_profiles FOR ALL USING (auth.uid() = user_id);

-- 7. Nura Long-Term Memory & Audit Logs
CREATE TABLE IF NOT EXISTS public.nura_memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'preference', -- 'preference', 'health_fact', 'goal', 'context'
  fact TEXT NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.nura_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own Nura memories"
  ON public.nura_memories FOR ALL USING (auth.uid() = user_id);

-- Nura Tool Audit Trail (Auditable agent execution)
CREATE TABLE IF NOT EXISTS public.nura_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_name TEXT NOT NULL,
  parameters JSONB DEFAULT '{}'::jsonb,
  result JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'requires_confirmation', 'rejected')),
  execution_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_nura_audit_user ON public.nura_audit_logs(user_id, created_at);
ALTER TABLE public.nura_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own Nura audit logs"
  ON public.nura_audit_logs FOR SELECT USING (auth.uid() = user_id);
