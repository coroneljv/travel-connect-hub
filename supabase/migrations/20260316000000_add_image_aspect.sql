-- Add image_aspect column to community_posts for adaptive layout
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS image_aspect real;
