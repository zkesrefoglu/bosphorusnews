import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API-Football base URL
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

// Current season
const CURRENT_SEASON = 2024;

// Team IDs for Turkish players' teams
const TEAM_IDS: Record<string, number> = {
  'Real Madrid': 541,
  'Juventus': 496,
  'Brighton': 51,
  'Eintracht Frankfurt': 169,
  'Lille': 79,
};

// Player name mappings to handle Turkish characters
const PLAYER_NAME_VARIANTS: Record<string, string[]> = {
  'Arda Guler': ['Arda Güler', 'Guler', 'Güler'],
  'Kenan Yildiz': ['Kenan Yıldız', 'Yildiz', 'Yıldız'],
  'Ferdi Kadioglu': ['Ferdi Kadıoğlu', 'Kadioglu', 'Kadıoğlu'],
  'Can Uzun': ['Can Uzun', 'Uzun'],
  'Berke Ozer': ['Berke Özer', 'Ozer', 'Özer'],
};

interface ApiFootballResponse {
  response: any[];
  errors: any;
  results: number;
}

async function fetchApiFootball(endpoint: string, apiKey: string): Promise<ApiFootballResponse | null> {
  const url = `${API_FOOTBALL_BASE}${endpoint}`;
  console.log(`Fetching API-Football: ${endpoint}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      console.error(`API-Football error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error('API-Football errors:', data.errors);
      return null;
    }

    return data;
  } catch (error) {
    console.error('API-Football fetch error:', error);
    return null;
  }
}

async function findPlayerInTeam(
  teamId: number, 
  playerName: string, 
  apiKey: string
): Promise<number | null> {
  console.log(`Searching for ${playerName} in team ${teamId}...`);
  
  // Get team squad
  const squadData = await fetchApiFootball(
    `/players/squads?team=${teamId}`,
    apiKey
  );
  
  if (!squadData || !squadData.response || squadData.response.length === 0) {
    console.log(`No squad data for team ${teamId}`);
    return null;
  }

  const squad = squadData.response[0]?.players || [];
  
  // Get name variants to search for
  const nameVariants = PLAYER_NAME_VARIANTS[playerName] || [playerName];
  const searchTerms = [playerName, ...nameVariants].map(n => n.toLowerCase());
  
  // Also add last name variations
  const lastName = playerName.split(' ').pop()?.toLowerCase();
  if (lastName) {
    searchTerms.push(lastName);
  }
  
  console.log(`Looking for: ${searchTerms.join(', ')}`);
  
  for (const player of squad) {
    const playerNameLower = player.name?.toLowerCase() || '';
    
    for (const term of searchTerms) {
      if (playerNameLower.includes(term) || term.includes(playerNameLower)) {
        console.log(`Found player: ${player.name} (ID: ${player.id})`);
        return player.id;
      }
    }
  }
  
  console.log(`Player ${playerName} not found in team squad`);
  return null;
}

async function searchPlayerByName(name: string, apiKey: string): Promise<number | null> {
  console.log(`Searching for player: ${name}`);
  
  // Get name variants
  const nameVariants = PLAYER_NAME_VARIANTS[name] || [name];
  
  for (const variant of nameVariants) {
    const searchData = await fetchApiFootball(
      `/players?search=${encodeURIComponent(variant)}&season=${CURRENT_SEASON}`,
      apiKey
    );
    
    if (searchData && searchData.response && searchData.response.length > 0) {
      // Find Turkish player
      for (const result of searchData.response) {
        if (result.player?.nationality === 'Turkey') {
          console.log(`Found Turkish player: ${result.player.name} (ID: ${result.player.id})`);
          return result.player.id;
        }
      }
      // Return first result if no Turkish player
      const player = searchData.response[0].player;
      console.log(`Found player: ${player.name} (ID: ${player.id})`);
      return player.id;
    }
  }
  
  console.log(`Could not find player: ${name}`);
  return null;
}

function parsePlayerStats(data: ApiFootballResponse, athleteName: string): { 
  seasonStats: any[]
} {
  const seasonStats: any[] = [];
  
  try {
    const playerResponse = data.response?.[0];
    if (!playerResponse) {
      console.log(`No player data found for ${athleteName}`);
      return { seasonStats };
    }

    const statistics = playerResponse.statistics || [];
    
    for (const stat of statistics) {
      const league = stat.league;
      const games = stat.games;
      const goals = stat.goals;
      const passes = stat.passes;
      const tackles = stat.tackles;
      const cards = stat.cards;

      seasonStats.push({
        season: `${league?.season || CURRENT_SEASON}/${(league?.season || CURRENT_SEASON) + 1}`.slice(-7),
        competition: league?.name || 'Unknown',
        games_played: games?.appearences || 0,
        games_started: games?.lineups || 0,
        stats: {
          goals: goals?.total || 0,
          assists: goals?.assists || 0,
          minutes: games?.minutes || 0,
          yellow_cards: cards?.yellow || 0,
          red_cards: cards?.red || 0,
          rating: games?.rating ? parseFloat(games.rating) : null,
          shots_total: stat.shots?.total || 0,
          shots_on_target: stat.shots?.on || 0,
          passes_total: passes?.total || 0,
          passes_accuracy: passes?.accuracy || 0,
          key_passes: passes?.key || 0,
          tackles: tackles?.total || 0,
          interceptions: tackles?.interceptions || 0,
          dribbles_success: stat.dribbles?.success || 0,
          dribbles_attempts: stat.dribbles?.attempts || 0,
        },
      });
    }
  } catch (error) {
    console.error(`Error parsing player stats for ${athleteName}:`, error);
  }
  
  return { seasonStats };
}

async function fetchTeamFixtures(
  apiKey: string, 
  teamName: string,
  type: 'next' | 'last'
): Promise<any[]> {
  const fixtures: any[] = [];
  
  try {
    let teamId = TEAM_IDS[teamName];
    
    if (!teamId) {
      console.log(`No cached team ID for ${teamName}, searching...`);
      const teamSearch = await fetchApiFootball(`/teams?search=${encodeURIComponent(teamName)}`, apiKey);
      teamId = teamSearch?.response?.[0]?.team?.id;
      
      if (teamId) {
        console.log(`Found team ID ${teamId} for ${teamName}`);
      }
    }
    
    if (!teamId) {
      console.log(`Could not find team ID for ${teamName}`);
      return fixtures;
    }

    const fixturesData = await fetchApiFootball(
      `/fixtures?team=${teamId}&${type}=5`,
      apiKey
    );
    
    if (fixturesData && fixturesData.response) {
      for (const fixture of fixturesData.response) {
        const isHome = fixture.teams?.home?.id === teamId;
        const opponent = isHome ? fixture.teams?.away?.name : fixture.teams?.home?.name;
        const homeScore = fixture.goals?.home ?? 0;
        const awayScore = fixture.goals?.away ?? 0;
        
        fixtures.push({
          date: fixture.fixture?.date ? new Date(fixture.fixture.date).toISOString().split('T')[0] : null,
          match_date: fixture.fixture?.date,
          opponent: opponent || 'Unknown',
          competition: fixture.league?.name || 'Unknown',
          home_away: isHome ? 'home' : 'away',
          match_result: type === 'last' ? `${homeScore}-${awayScore}` : null,
          played: fixture.fixture?.status?.short === 'FT',
        });
      }
    }
  } catch (error) {
    console.error('Error fetching fixtures:', error);
  }
  
  return fixtures;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apiFootballKey = Deno.env.get('API_FOOTBALL_KEY');
    
    if (!apiFootballKey) {
      throw new Error('API_FOOTBALL_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting football stats fetch with API-Football...');

    // Get all football athletes from database
    const { data: athletes, error: athletesError } = await supabase
      .from('athlete_profiles')
      .select('id, slug, api_football_id, name, team')
      .eq('sport', 'football');

    if (athletesError) {
      throw new Error(`Error fetching athletes: ${athletesError.message}`);
    }

    console.log(`Found ${athletes?.length || 0} football athletes`);

    const results: any[] = [];

    for (const athlete of athletes || []) {
      try {
        let playerId = athlete.api_football_id;
        
        // If no API-Football ID, try to find the player
        if (!playerId) {
          console.log(`No API-Football ID for ${athlete.name}, searching...`);
          
          // First try team squad search
          const teamId = TEAM_IDS[athlete.team];
          if (teamId) {
            playerId = await findPlayerInTeam(teamId, athlete.name, apiFootballKey);
          }
          
          // Fallback to name search
          if (!playerId) {
            playerId = await searchPlayerByName(athlete.name, apiFootballKey);
          }
          
          if (playerId) {
            // Save the found ID to database
            const { error: updateError } = await supabase
              .from('athlete_profiles')
              .update({ api_football_id: playerId })
              .eq('id', athlete.id);
            
            if (updateError) {
              console.error(`Failed to save API-Football ID for ${athlete.name}:`, updateError);
            } else {
              console.log(`Saved API-Football ID ${playerId} for ${athlete.name}`);
            }
          } else {
            console.log(`Could not find ${athlete.name} in API-Football`);
            results.push({ athlete: athlete.name, status: 'not_found' });
            continue;
          }
        }

        console.log(`Processing ${athlete.name} (API-Football ID: ${playerId})...`);
        
        // Fetch player statistics for current season
        const playerData = await fetchApiFootball(
          `/players?id=${playerId}&season=${CURRENT_SEASON}`,
          apiFootballKey
        );
        
        // Parse player stats
        const { seasonStats } = playerData ? parsePlayerStats(playerData, athlete.name) : { seasonStats: [] };
        
        // Fetch recent matches (team-based)
        const recentMatches = await fetchTeamFixtures(apiFootballKey, athlete.team, 'last');

        // Upsert recent matches as daily updates
        for (const match of recentMatches) {
          if (match.date) {
            const { error: updateError } = await supabase
              .from('athlete_daily_updates')
              .upsert({
                athlete_id: athlete.id,
                date: match.date,
                opponent: match.opponent,
                competition: match.competition,
                home_away: match.home_away,
                match_result: match.match_result,
                played: match.played,
                minutes_played: null,
                rating: null,
                stats: {},
              }, {
                onConflict: 'athlete_id,date',
                ignoreDuplicates: false,
              });

            if (updateError) {
              console.error(`Error upserting daily update for ${athlete.name}:`, updateError);
            }
          }
        }

        // Upsert season stats
        for (const stats of seasonStats) {
          const { error: statsError } = await supabase
            .from('athlete_season_stats')
            .upsert({
              athlete_id: athlete.id,
              season: stats.season,
              competition: stats.competition,
              games_played: stats.games_played,
              games_started: stats.games_started,
              stats: stats.stats,
            }, {
              onConflict: 'athlete_id,season,competition',
              ignoreDuplicates: false,
            });

          if (statsError) {
            console.error(`Error upserting season stats for ${athlete.name}:`, statsError);
          }
        }

        // Fetch and upsert upcoming matches
        const upcomingMatches = await fetchTeamFixtures(apiFootballKey, athlete.team, 'next');
        
        // Delete old upcoming matches for this athlete
        await supabase
          .from('athlete_upcoming_matches')
          .delete()
          .eq('athlete_id', athlete.id);

        for (const match of upcomingMatches) {
          if (match.match_date) {
            const { error: matchError } = await supabase
              .from('athlete_upcoming_matches')
              .insert({
                athlete_id: athlete.id,
                match_date: match.match_date,
                opponent: match.opponent,
                competition: match.competition,
                home_away: match.home_away,
              });

            if (matchError) {
              console.error(`Error inserting upcoming match for ${athlete.name}:`, matchError);
            }
          }
        }

        results.push({
          athlete: athlete.name,
          api_football_id: playerId,
          status: 'success',
          matches_processed: recentMatches.length,
          upcoming_matches: upcomingMatches.length,
          season_stats: seasonStats.length,
        });

        // Add a small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (playerError: any) {
        console.error(`Error processing ${athlete.name}:`, playerError);
        results.push({ athlete: athlete.name, status: 'error', error: playerError?.message || 'Unknown error' });
      }
    }

    console.log('Football stats fetch completed');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      api: 'API-Football',
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in fetch-football-stats:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
