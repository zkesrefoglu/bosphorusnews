import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API-Football base URL
const API_FOOTBALL_BASE = 'https://v3.football.api-sports.io';

// Current season
const CURRENT_SEASON = 2024;

// Team IDs for upcoming fixtures lookup
const TEAM_IDS: Record<string, number> = {
  'Real Madrid': 541,
  'Juventus': 496,
  'Brighton': 51,
  'Eintracht Frankfurt': 169,
  'Lille': 79,
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

function parsePlayerStats(data: ApiFootballResponse, athleteName: string): { 
  seasonStats: any[], 
  recentMatches: any[] 
} {
  const seasonStats: any[] = [];
  const recentMatches: any[] = [];
  
  try {
    const playerResponse = data.response?.[0];
    if (!playerResponse) {
      console.log(`No player data found for ${athleteName}`);
      return { seasonStats, recentMatches };
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
  
  return { seasonStats, recentMatches };
}

async function fetchPlayerFixtures(
  apiKey: string, 
  playerId: number, 
  teamName: string
): Promise<any[]> {
  const fixtures: any[] = [];
  
  try {
    // Get team ID
    const teamId = TEAM_IDS[teamName];
    if (!teamId) {
      console.log(`No team ID found for ${teamName}, searching...`);
      // Try to find team by name
      const teamSearch = await fetchApiFootball(`/teams?search=${encodeURIComponent(teamName)}`, apiKey);
      if (teamSearch?.response?.[0]?.team?.id) {
        const foundTeamId = teamSearch.response[0].team.id;
        console.log(`Found team ID ${foundTeamId} for ${teamName}`);
        
        // Fetch next 5 fixtures
        const fixturesData = await fetchApiFootball(
          `/fixtures?team=${foundTeamId}&next=5`,
          apiKey
        );
        
        if (fixturesData?.response) {
          for (const fixture of fixturesData.response) {
            const isHome = fixture.teams?.home?.id === foundTeamId;
            const opponent = isHome ? fixture.teams?.away?.name : fixture.teams?.home?.name;
            
            fixtures.push({
              match_date: fixture.fixture?.date,
              opponent: opponent || 'Unknown',
              competition: fixture.league?.name || 'Unknown',
              home_away: isHome ? 'home' : 'away',
            });
          }
        }
      }
    } else {
      // Use known team ID
      const fixturesData = await fetchApiFootball(
        `/fixtures?team=${teamId}&next=5`,
        apiKey
      );
      
      if (fixturesData?.response) {
        for (const fixture of fixturesData.response) {
          const isHome = fixture.teams?.home?.id === teamId;
          const opponent = isHome ? fixture.teams?.away?.name : fixture.teams?.home?.name;
          
          fixtures.push({
            match_date: fixture.fixture?.date,
            opponent: opponent || 'Unknown',
            competition: fixture.league?.name || 'Unknown',
            home_away: isHome ? 'home' : 'away',
          });
        }
      }
    }
  } catch (error) {
    console.error('Error fetching fixtures:', error);
  }
  
  return fixtures;
}

async function fetchRecentMatches(
  apiKey: string,
  playerId: number,
  teamName: string
): Promise<any[]> {
  const matches: any[] = [];
  
  try {
    // Get team ID
    let teamId = TEAM_IDS[teamName];
    if (!teamId) {
      const teamSearch = await fetchApiFootball(`/teams?search=${encodeURIComponent(teamName)}`, apiKey);
      teamId = teamSearch?.response?.[0]?.team?.id;
    }
    
    if (!teamId) {
      console.log(`Could not find team ID for ${teamName}`);
      return matches;
    }

    // Fetch last 5 fixtures
    const fixturesData = await fetchApiFootball(
      `/fixtures?team=${teamId}&last=5`,
      apiKey
    );
    
    if (fixturesData?.response) {
      for (const fixture of fixturesData.response) {
        const isHome = fixture.teams?.home?.id === teamId;
        const opponent = isHome ? fixture.teams?.away?.name : fixture.teams?.home?.name;
        const homeScore = fixture.goals?.home ?? 0;
        const awayScore = fixture.goals?.away ?? 0;
        
        matches.push({
          date: fixture.fixture?.date ? new Date(fixture.fixture.date).toISOString().split('T')[0] : null,
          opponent: opponent || 'Unknown',
          competition: fixture.league?.name || 'Unknown',
          home_away: isHome ? 'home' : 'away',
          match_result: `${homeScore}-${awayScore}`,
          played: fixture.fixture?.status?.short === 'FT',
          minutes_played: null, // Would need player-specific fixture data
          rating: null,
          stats: {}, // Would need player-specific fixture data
        });
      }
    }
  } catch (error) {
    console.error('Error fetching recent matches:', error);
  }
  
  return matches;
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
      .select('id, slug, api_football_id, fotmob_id, name, team')
      .eq('sport', 'football');

    if (athletesError) {
      throw new Error(`Error fetching athletes: ${athletesError.message}`);
    }

    console.log(`Found ${athletes?.length || 0} football athletes`);

    const results: any[] = [];

    for (const athlete of athletes || []) {
      try {
        const playerId = athlete.api_football_id || athlete.fotmob_id;
        
        if (!playerId) {
          console.log(`No API ID found for ${athlete.name}, will try to search...`);
          
          // Try to find player by name
          const searchData = await fetchApiFootball(
            `/players?search=${encodeURIComponent(athlete.name)}&season=${CURRENT_SEASON}`,
            apiFootballKey
          );
          
          if (searchData?.response?.[0]?.player?.id) {
            const foundId = searchData.response[0].player.id;
            console.log(`Found API-Football ID ${foundId} for ${athlete.name}`);
            
            // Update the database with the found ID
            await supabase
              .from('athlete_profiles')
              .update({ api_football_id: foundId })
              .eq('id', athlete.id);
            
            athlete.api_football_id = foundId;
          } else {
            console.log(`Could not find ${athlete.name} in API-Football`);
            results.push({ athlete: athlete.name, status: 'not_found' });
            continue;
          }
        }

        console.log(`Processing ${athlete.name} (API-Football ID: ${athlete.api_football_id})...`);
        
        // Fetch player statistics for current season
        const playerData = await fetchApiFootball(
          `/players?id=${athlete.api_football_id}&season=${CURRENT_SEASON}`,
          apiFootballKey
        );
        
        if (!playerData || playerData.results === 0) {
          console.log(`No data returned for ${athlete.name}`);
          results.push({ athlete: athlete.name, status: 'no_data' });
          continue;
        }

        // Parse player stats
        const { seasonStats } = parsePlayerStats(playerData, athlete.name);
        
        // Fetch recent matches (team-based)
        const recentMatches = await fetchRecentMatches(
          apiFootballKey,
          athlete.api_football_id,
          athlete.team
        );

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
                minutes_played: match.minutes_played,
                rating: match.rating,
                stats: match.stats,
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
        const upcomingMatches = await fetchPlayerFixtures(
          apiFootballKey,
          athlete.api_football_id,
          athlete.team
        );
        
        // First delete old upcoming matches for this athlete
        await supabase
          .from('athlete_upcoming_matches')
          .delete()
          .eq('athlete_id', athlete.id);

        for (const match of upcomingMatches) {
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

        results.push({
          athlete: athlete.name,
          status: 'success',
          matches_processed: recentMatches.length,
          upcoming_matches: upcomingMatches.length,
          season_stats: seasonStats.length,
        });

        // Add a small delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

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
