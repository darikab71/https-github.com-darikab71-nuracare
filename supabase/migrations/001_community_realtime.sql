-- 001_community_realtime.sql
-- Migration: Add media support and enable Supabase Realtime for community

-- 1. Extend community_posts with media & engagement attributes
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'none' CHECK (media_type IN ('none', 'image', 'video')),
  ADD COLUMN IF NOT EXISTS liked_by UUID[] DEFAULT '{}'::uuid[],
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];

-- 2. Create community_reactions table for fine-grained reactions (heart, inspire, salute, support)
CREATE TABLE IF NOT EXISTS public.community_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'heart',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read reactions."
  ON public.community_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own reactions."
  ON public.community_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reactions."
  ON public.community_reactions FOR DELETE USING (auth.uid() = user_id);

-- 3. Create community post comments table
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read comments."
  ON public.community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create own comments."
  ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments."
  ON public.community_comments FOR DELETE USING (auth.uid() = user_id);

-- 4. Enable Supabase Realtime publication on relevant tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND tablename = 'community_posts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND tablename = 'community_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
  END IF;
END $$;
