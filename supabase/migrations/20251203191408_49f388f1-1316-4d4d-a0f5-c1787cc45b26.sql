-- =============================================
-- TURKISH STARS ATHLETE TRACKER TABLES
-- =============================================

-- 1. athlete_profiles table
CREATE TABLE public.athlete_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sport text NOT NULL CHECK (sport IN ('basketball', 'football')),
  team text NOT NULL,
  league text NOT NULL,
  photo_url text,
  position text NOT NULL,
  jersey_number integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_athlete_profiles_updated_at
  BEFORE UPDATE ON public.athlete_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. athlete_daily_updates table
CREATE TABLE public.athlete_daily_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  played boolean NOT NULL DEFAULT false,
  match_result text,
  opponent text,
  competition text,
  home_away text CHECK (home_away IN ('home', 'away', 'neutral')),
  stats jsonb DEFAULT '{}',
  rating decimal(3,1),
  minutes_played integer,
  injury_status text DEFAULT 'healthy' CHECK (injury_status IN ('healthy', 'questionable', 'doubtful', 'out')),
  injury_details text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, date)
);

ALTER TABLE public.athlete_daily_updates ENABLE ROW LEVEL SECURITY;

-- 3. athlete_transfer_rumors table
CREATE TABLE public.athlete_transfer_rumors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  rumor_date date NOT NULL DEFAULT CURRENT_DATE,
  headline text NOT NULL,
  summary text,
  source text,
  source_url text,
  reliability text DEFAULT 'speculation' CHECK (reliability IN ('tier_1', 'tier_2', 'tier_3', 'speculation')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'denied', 'expired')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_transfer_rumors ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_athlete_transfer_rumors_updated_at
  BEFORE UPDATE ON public.athlete_transfer_rumors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. athlete_upcoming_matches table
CREATE TABLE public.athlete_upcoming_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  match_date timestamp with time zone NOT NULL,
  opponent text NOT NULL,
  competition text NOT NULL,
  home_away text CHECK (home_away IN ('home', 'away', 'neutral')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.athlete_upcoming_matches ENABLE ROW LEVEL SECURITY;

-- 5. athlete_season_stats table
CREATE TABLE public.athlete_season_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES public.athlete_profiles(id) ON DELETE CASCADE,
  season text NOT NULL,
  competition text NOT NULL,
  stats jsonb DEFAULT '{}',
  games_played integer DEFAULT 0,
  games_started integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(athlete_id, season, competition)
);

ALTER TABLE public.athlete_season_stats ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_athlete_season_stats_updated_at
  BEFORE UPDATE ON public.athlete_season_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- athlete_profiles policies
CREATE POLICY "Anyone can view athlete profiles"
  ON public.athlete_profiles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert athlete profiles"
  ON public.athlete_profiles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update athlete profiles"
  ON public.athlete_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete athlete profiles"
  ON public.athlete_profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- athlete_daily_updates policies
CREATE POLICY "Anyone can view athlete daily updates"
  ON public.athlete_daily_updates FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert athlete daily updates"
  ON public.athlete_daily_updates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update athlete daily updates"
  ON public.athlete_daily_updates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete athlete daily updates"
  ON public.athlete_daily_updates FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- athlete_transfer_rumors policies
CREATE POLICY "Anyone can view athlete transfer rumors"
  ON public.athlete_transfer_rumors FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert athlete transfer rumors"
  ON public.athlete_transfer_rumors FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update athlete transfer rumors"
  ON public.athlete_transfer_rumors FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete athlete transfer rumors"
  ON public.athlete_transfer_rumors FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- athlete_upcoming_matches policies
CREATE POLICY "Anyone can view athlete upcoming matches"
  ON public.athlete_upcoming_matches FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert athlete upcoming matches"
  ON public.athlete_upcoming_matches FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update athlete upcoming matches"
  ON public.athlete_upcoming_matches FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete athlete upcoming matches"
  ON public.athlete_upcoming_matches FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- athlete_season_stats policies
CREATE POLICY "Anyone can view athlete season stats"
  ON public.athlete_season_stats FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert athlete season stats"
  ON public.athlete_season_stats FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update athlete season stats"
  ON public.athlete_season_stats FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete athlete season stats"
  ON public.athlete_season_stats FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_athlete_profiles_sport ON public.athlete_profiles(sport);
CREATE INDEX idx_athlete_profiles_slug ON public.athlete_profiles(slug);
CREATE INDEX idx_athlete_daily_updates_athlete_date ON public.athlete_daily_updates(athlete_id, date DESC);
CREATE INDEX idx_athlete_transfer_rumors_athlete ON public.athlete_transfer_rumors(athlete_id);
CREATE INDEX idx_athlete_transfer_rumors_status ON public.athlete_transfer_rumors(status);
CREATE INDEX idx_athlete_upcoming_matches_date ON public.athlete_upcoming_matches(match_date);
CREATE INDEX idx_athlete_upcoming_matches_athlete ON public.athlete_upcoming_matches(athlete_id);
CREATE INDEX idx_athlete_season_stats_athlete_season ON public.athlete_season_stats(athlete_id, season);