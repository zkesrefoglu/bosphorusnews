import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// FotMob Player IDs for Turkish football stars
const FOTMOB_PLAYERS: Record<string, number> = {
  'arda-guler': 1029513,
  'kenan-yildiz': 1160874,
  'ferdi-kadioglu': 793498,
  'can-uzun': 1188462,
  'berke-ozer': 1022456,
};

interface PlayerData {
  slug: string;
  fotmobId: number;
  athleteId?: string;
}

async function fetchFotMobPlayerData(playerId: number): Promise<any> {
  const url = `https://www.fotmob.com/api/playerData?id=${playerId}`;
  console.log(`Fetching FotMob data for player ${playerId}...`);
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`FotMob API error for player ${playerId}:`, response.status);
    return null;
  }

  return response.json();
}

function parseRecentMatches(playerData: any): any[] {
  const matches: any[] = [];
  
  try {
    const recentMatches = playerData?.recentMatches || [];
    
    for (const match of recentMatches.slice(0, 5)) {
      matches.push({
        date: match.matchDate?.utcTime ? new Date(match.matchDate.utcTime).toISOString().split('T')[0] : null,
        opponent: match.opponentTeamName || 'Unknown',
        competition: match.leagueName || 'Unknown',
        home_away: match.isHomeTeam ? 'home' : 'away',
        match_result: match.teamScore !== undefined && match.opponentScore !== undefined 
          ? `${match.teamScore}-${match.opponentScore}` 
          : null,
        played: match.minutesPlayed > 0,
        minutes_played: match.minutesPlayed || 0,
        rating: match.rating?.num || null,
        stats: {
          goals: match.goals || 0,
          assists: match.assists || 0,
          shots: match.shots || 0,
          passes: match.passes || 0,
          key_passes: match.keyPasses || 0,
          tackles: match.tackles || 0,
          interceptions: match.interceptions || 0,
        },
      });
    }
  } catch (error) {
    console.error('Error parsing recent matches:', error);
  }
  
  return matches;
}

function parseSeasonStats(playerData: any): any[] {
  const seasonStats: any[] = [];
  
  try {
    const mainLeague = playerData?.primaryTeam?.teamName || 'Unknown';
    const statSeasons = playerData?.statSeasons || [];
    
    for (const season of statSeasons) {
      const tournaments = season?.tournaments || [];
      for (const tournament of tournaments) {
        seasonStats.push({
          season: season?.seasonName || '2024/25',
          competition: tournament?.name || mainLeague,
          games_played: tournament?.appearances || 0,
          games_started: tournament?.started || 0,
          stats: {
            goals: tournament?.goals || 0,
            assists: tournament?.assists || 0,
            minutes: tournament?.minutesPlayed || 0,
            yellow_cards: tournament?.yellowCards || 0,
            red_cards: tournament?.redCards || 0,
            rating: tournament?.rating || null,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error parsing season stats:', error);
  }
  
  return seasonStats;
}

function parseUpcomingMatches(playerData: any): any[] {
  const upcoming: any[] = [];
  
  try {
    const fixtures = playerData?.fixtures || [];
    const now = new Date();
    
    for (const fixture of fixtures) {
      const matchDate = fixture?.matchDate?.utcTime ? new Date(fixture.matchDate.utcTime) : null;
      if (matchDate && matchDate > now) {
        upcoming.push({
          match_date: matchDate.toISOString(),
          opponent: fixture.opponentTeamName || 'Unknown',
          competition: fixture.leagueName || 'Unknown',
          home_away: fixture.isHomeTeam ? 'home' : 'away',
        });
      }
    }
  } catch (error) {
    console.error('Error parsing upcoming matches:', error);
  }
  
  return upcoming.slice(0, 5);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting football stats fetch...');

    // Get all football athletes from database
    const { data: athletes, error: athletesError } = await supabase
      .from('athlete_profiles')
      .select('id, slug, fotmob_id, name')
      .eq('sport', 'football')
      .not('fotmob_id', 'is', null);

    if (athletesError) {
      throw new Error(`Error fetching athletes: ${athletesError.message}`);
    }

    console.log(`Found ${athletes?.length || 0} football athletes with FotMob IDs`);

    const results: any[] = [];

    for (const athlete of athletes || []) {
      try {
        console.log(`Processing ${athlete.name} (FotMob ID: ${athlete.fotmob_id})...`);
        
        const playerData = await fetchFotMobPlayerData(athlete.fotmob_id);
        
        if (!playerData) {
          console.log(`No data returned for ${athlete.name}`);
          results.push({ athlete: athlete.name, status: 'no_data' });
          continue;
        }

        // Parse and upsert recent matches as daily updates
        const recentMatches = parseRecentMatches(playerData);
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

        // Parse and upsert season stats
        const seasonStats = parseSeasonStats(playerData);
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

        // Parse and upsert upcoming matches
        const upcomingMatches = parseUpcomingMatches(playerData);
        
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

        // Add a small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (playerError: any) {
        console.error(`Error processing ${athlete.name}:`, playerError);
        results.push({ athlete: athlete.name, status: 'error', error: playerError?.message || 'Unknown error' });
      }
    }

    console.log('Football stats fetch completed');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
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
