-- 002_lifestyle_content.sql
-- Migration: Lifestyle articles, modular programs, and user lifestyle progress

CREATE TABLE IF NOT EXISTS public.lifestyle_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'NuraCare Health Sciences',
  image_url TEXT,
  read_time_minutes INTEGER DEFAULT 4,
  tags TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lifestyle_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active lifestyle articles"
  ON public.lifestyle_articles FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.lifestyle_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  level TEXT DEFAULT 'All Levels',
  duration_days INTEGER DEFAULT 7,
  download_size_bytes BIGINT DEFAULT 0,
  curriculum JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lifestyle_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active programs"
  ON public.lifestyle_programs FOR SELECT USING (is_active = true);

CREATE TABLE IF NOT EXISTS public.user_program_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.lifestyle_programs ON DELETE CASCADE NOT NULL,
  completed_days INTEGER[] DEFAULT '{}'::integer[],
  current_day INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, program_id)
);

ALTER TABLE public.user_program_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own program progress"
  ON public.user_program_progress FOR ALL USING (auth.uid() = user_id);
