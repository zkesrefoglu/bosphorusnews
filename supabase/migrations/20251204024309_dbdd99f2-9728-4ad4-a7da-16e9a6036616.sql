-- Add api_football_id column to athlete_profiles for API-Football integration
ALTER TABLE public.athlete_profiles ADD COLUMN IF NOT EXISTS api_football_id integer;