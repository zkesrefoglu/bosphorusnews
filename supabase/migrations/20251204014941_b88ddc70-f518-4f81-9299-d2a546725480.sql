-- Add external API ID columns to athlete_profiles
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS fotmob_id integer;
ALTER TABLE athlete_profiles ADD COLUMN IF NOT EXISTS balldontlie_id integer;

-- Update with known FotMob IDs
UPDATE athlete_profiles SET fotmob_id = 1029513 WHERE slug = 'arda-guler';
UPDATE athlete_profiles SET fotmob_id = 1160874 WHERE slug = 'kenan-yildiz';
UPDATE athlete_profiles SET fotmob_id = 793498 WHERE slug = 'ferdi-kadioglu';
UPDATE athlete_profiles SET fotmob_id = 1188462 WHERE slug = 'can-uzun';
UPDATE athlete_profiles SET fotmob_id = 1022456 WHERE slug = 'berke-ozer';