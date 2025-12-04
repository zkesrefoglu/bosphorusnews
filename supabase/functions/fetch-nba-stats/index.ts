import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BALLDONTLIE_BASE_URL = 'https://api.balldontlie.io/v1';

async function fetchWithAuth(url: string, apiKey: string): Promise<any> {
  console.log(`Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Balldontlie API error: ${response.status}`, errorText);
    throw new Error(`Balldontlie API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function findSengunPlayerId(apiKey: string): Promise<number | null> {
  const data = await fetchWithAuth(`${BALLDONTLIE_BASE_URL}/players?search=Sengun`, apiKey);
  
  const sengun = data.data?.find((player: any) => 
    player.last_name?.toLowerCase().includes('sengun') || 
    player.first_name?.toLowerCase().includes('alperen')
  );
  
  return sengun?.id || null;
}

async function fetchPlayerStats(playerId: number, apiKey: string, season: number = 2025): Promise<any[]> {
  const data = await fetchWithAuth(
    `${BALLDONTLIE_BASE_URL}/stats?player_id=${playerId}&season=${season}&per_page=100`,
    apiKey
  );
  
  return data.data || [];
}

async function fetchSeasonAverages(playerId: number, apiKey: string, season: number = 2025): Promise<any> {
  const data = await fetchWithAuth(
    `${BALLDONTLIE_BASE_URL}/season_averages?player_id=${playerId}&season=${season}`,
    apiKey
  );
  
  return data.data?.[0] || null;
}

async function fetchRecentGames(teamId: number, apiKey: string): Promise<any[]> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];
  
  const data = await fetchWithAuth(
    `${BALLDONTLIE_BASE_URL}/games?team_ids[]=${teamId}&start_date=${startDate}&end_date=${endDate}&per_page=20`,
    apiKey
  );
  
  return data.data || [];
}

// Fetch player injury status (ALL-STAR tier)
async function fetchPlayerInjuries(playerId: number, apiKey: string): Promise<any | null> {
  try {
    const data = await fetchWithAuth(
      `${BALLDONTLIE_BASE_URL}/injuries?player_ids[]=${playerId}`,
      apiKey
    );
    
    // Return most recent injury if exists
    const injuries = data.data || [];
    if (injuries.length > 0) {
      const injury = injuries[0];
      return {
        status: injury.status || 'unknown',
        comment: injury.comment || null,
        return_date: injury.return_date || null,
      };
    }
    return null;
  } catch (error) {
    console.log('Could not fetch injuries (may require higher tier):', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('BALLDONTLIE_API_KEY');
    if (!apiKey) {
      throw new Error('BALLDONTLIE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting NBA stats fetch for Alperen Sengun...');

    // Get Alperen Sengun from database
    const { data: athlete, error: athleteError } = await supabase
      .from('athlete_profiles')
      .select('id, slug, balldontlie_id, name')
      .eq('slug', 'alperen-sengun')
      .single();

    if (athleteError || !athlete) {
      throw new Error(`Athlete not found: ${athleteError?.message || 'No data'}`);
    }

    let playerId = athlete.balldontlie_id;

    // If no balldontlie_id stored, search for it
    if (!playerId) {
      console.log('Searching for Sengun player ID...');
      playerId = await findSengunPlayerId(apiKey);
      
      if (playerId) {
        // Update the athlete profile with the found ID
        await supabase
          .from('athlete_profiles')
          .update({ balldontlie_id: playerId })
          .eq('id', athlete.id);
        
        console.log(`Found and saved Sengun player ID: ${playerId}`);
      } else {
        throw new Error('Could not find Alperen Sengun in Balldontlie API');
      }
    }

    console.log(`Using player ID: ${playerId}`);

    // Fetch player stats for current season (2025-26 season uses 2025)
    const currentSeason = new Date().getFullYear();
    const nbaSeasonYear = new Date().getMonth() >= 9 ? currentSeason : currentSeason - 1; // NBA season starts in October
    const playerStats = await fetchPlayerStats(playerId, apiKey, nbaSeasonYear);
    console.log(`Found ${playerStats.length} game stats for ${nbaSeasonYear}-${nbaSeasonYear + 1} season`);

    // Process game stats into daily updates
    for (const stat of playerStats) {
      const game = stat.game;
      if (!game) continue;

      const isHome = stat.team?.id === game.home_team?.id;
      const opponent = isHome 
        ? (game.visitor_team?.full_name || game.visitor_team?.name || 'Unknown')
        : (game.home_team?.full_name || game.home_team?.name || 'Unknown');
      const teamScore = isHome ? game.home_team_score : game.visitor_team_score;
      const opponentScore = isHome ? game.visitor_team_score : game.home_team_score;

      const matchDate = game.date ? new Date(game.date).toISOString().split('T')[0] : null;
      
      if (!matchDate) continue;

      // Determine if player actually played - ensure it's always a boolean
      const minutesStr = stat.min || '0';
      const minutesPlayed = typeof minutesStr === 'string' 
        ? parseInt(minutesStr.split(':')[0]) || 0 
        : (typeof minutesStr === 'number' ? minutesStr : 0);
      const didPlay = minutesPlayed > 0;

      const { error: updateError } = await supabase
        .from('athlete_daily_updates')
        .upsert({
          athlete_id: athlete.id,
          date: matchDate,
          opponent: opponent,
          competition: 'NBA',
          home_away: isHome ? 'home' : 'away',
          match_result: teamScore !== undefined && opponentScore !== undefined 
            ? `${teamScore}-${opponentScore}` 
            : null,
          played: didPlay, // Always boolean now
          minutes_played: minutesPlayed,
          injury_status: 'healthy',
          stats: {
            points: stat.pts || 0,
            rebounds: stat.reb || 0,
            assists: stat.ast || 0,
            steals: stat.stl || 0,
            blocks: stat.blk || 0,
            turnovers: stat.turnover || 0,
            plus_minus: stat.plus_minus || 0,
            fg_made: stat.fgm || 0,
            fg_attempted: stat.fga || 0,
            fg_pct: stat.fg_pct || 0,
            fg3_made: stat.fg3m || 0,
            fg3_attempted: stat.fg3a || 0,
            fg3_pct: stat.fg3_pct || 0,
            ft_made: stat.ftm || 0,
            ft_attempted: stat.fta || 0,
            ft_pct: stat.ft_pct || 0,
            offensive_rebounds: stat.oreb || 0,
            defensive_rebounds: stat.dreb || 0,
            personal_fouls: stat.pf || 0,
            fouls_drawn: stat.pfd || 0,
          },
        }, {
          onConflict: 'athlete_id,date',
          ignoreDuplicates: false,
        });

      if (updateError) {
        console.error(`Error upserting daily update for ${matchDate}:`, updateError);
      }
    }

    // Fetch and store season averages
    const seasonAverages = await fetchSeasonAverages(playerId, apiKey, nbaSeasonYear);
    
    if (seasonAverages) {
      const { error: statsError } = await supabase
        .from('athlete_season_stats')
        .upsert({
          athlete_id: athlete.id,
          season: `${nbaSeasonYear}-${(nbaSeasonYear + 1).toString().slice(-2)}`,
          competition: 'NBA',
          games_played: seasonAverages.games_played || 0,
          games_started: seasonAverages.games_played || 0, // API doesn't provide starts separately
          stats: {
            ppg: seasonAverages.pts || 0,
            rpg: seasonAverages.reb || 0,
            apg: seasonAverages.ast || 0,
            spg: seasonAverages.stl || 0,
            bpg: seasonAverages.blk || 0,
            mpg: seasonAverages.min ? parseFloat(seasonAverages.min) : 0,
            fg_pct: seasonAverages.fg_pct || 0,
            fg3_pct: seasonAverages.fg3_pct || 0,
            ft_pct: seasonAverages.ft_pct || 0,
            turnovers: seasonAverages.turnover || 0,
          },
        }, {
          onConflict: 'athlete_id,season,competition',
          ignoreDuplicates: false,
        });

      if (statsError) {
        console.error(`Error upserting season stats:`, statsError);
      }
    }

    // Fetch current injury status
    let injuryInfo = null;
    try {
      injuryInfo = await fetchPlayerInjuries(playerId, apiKey);
      console.log('Injury status:', injuryInfo);
      
      // Update the most recent daily update with injury info
      if (injuryInfo) {
        const today = new Date().toISOString().split('T')[0];
        await supabase
          .from('athlete_daily_updates')
          .update({
            injury_status: injuryInfo.status === 'Out' ? 'injured' : 
                          injuryInfo.status === 'Questionable' ? 'doubtful' :
                          injuryInfo.status === 'Probable' ? 'minor' : 'healthy',
            injury_details: injuryInfo.comment || null,
          })
          .eq('athlete_id', athlete.id)
          .order('date', { ascending: false })
          .limit(1);
      }
    } catch (injuryError) {
      console.log('Injury fetch failed (may need higher tier):', injuryError);
    }

    console.log('NBA stats fetch completed');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      athlete: athlete.name,
      player_id: playerId,
      games_processed: playerStats.length,
      season_averages: seasonAverages ? {
        ppg: seasonAverages.pts,
        rpg: seasonAverages.reb,
        apg: seasonAverages.ast,
        games: seasonAverages.games_played,
      } : null,
      injury_status: injuryInfo,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in fetch-nba-stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
