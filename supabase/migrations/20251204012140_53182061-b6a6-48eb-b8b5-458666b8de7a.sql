-- Create live matches table for real-time score tracking
CREATE TABLE public.athlete_live_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  athlete_id UUID NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  opponent TEXT NOT NULL,
  competition TEXT NOT NULL,
  home_away TEXT CHECK (home_away IN ('home', 'away')),
  match_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (match_status IN ('scheduled', 'live', 'halftime', 'finished')),
  kickoff_time TIMESTAMP WITH TIME ZONE NOT NULL,
  current_minute INTEGER DEFAULT 0,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  athlete_stats JSONB DEFAULT '{}',
  last_event TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.athlete_live_matches ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view live matches"
ON public.athlete_live_matches
FOR SELECT
USING (true);

-- Admin write access
CREATE POLICY "Admins can insert live matches"
ON public.athlete_live_matches
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update live matches"
ON public.athlete_live_matches
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete live matches"
ON public.athlete_live_matches
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_athlete_live_matches_updated_at
BEFORE UPDATE ON public.athlete_live_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_live_matches_athlete_id ON public.athlete_live_matches(athlete_id);
CREATE INDEX idx_live_matches_status ON public.athlete_live_matches(match_status);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.athlete_live_matches;