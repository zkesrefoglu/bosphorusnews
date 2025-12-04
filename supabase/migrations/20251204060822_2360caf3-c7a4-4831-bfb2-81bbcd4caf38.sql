-- Add rankings field to athlete_season_stats for storing NBA rankings
ALTER TABLE public.athlete_season_stats
ADD COLUMN rankings jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.athlete_season_stats.rankings IS 'Stores league rankings for stats like ppg_rank, rpg_rank, apg_rank, bpg_rank, spg_rank';