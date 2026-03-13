-- Add viajante-specific fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS regions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_duration text,
  ADD COLUMN IF NOT EXISTS additional_preferences text;
