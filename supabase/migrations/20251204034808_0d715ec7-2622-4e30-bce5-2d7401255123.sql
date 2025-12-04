-- Add social media columns to athlete_profiles
ALTER TABLE public.athlete_profiles
ADD COLUMN instagram TEXT,
ADD COLUMN official_link TEXT;