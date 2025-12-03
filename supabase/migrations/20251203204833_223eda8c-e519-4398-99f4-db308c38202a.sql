-- Add new columns for national and action photos
ALTER TABLE public.athlete_profiles 
ADD COLUMN national_photo_url text,
ADD COLUMN action_photo_url text;