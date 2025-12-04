import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Clock, Trophy } from "lucide-react";
import { format } from "date-fns";

interface LiveMatch {
  id: string;
  athlete_id: string;
  opponent: string;
  competition: string;
  home_away: string | null;
  match_status: string;
  kickoff_time: string;
  current_minute: number;
  home_score: number;
  away_score: number;
  athlete_stats: any;
  last_event: string | null;
  athlete?: {
    name: string;
    team: string;
    sport: string;
    photo_url: string | null;
    slug: string;
  };
}

export const LiveMatchTracker = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveMatches = async () => {
      const { data, error } = await supabase
        .from('athlete_live_matches')
        .select(`
          *,
          athlete:athlete_profiles(name, team, sport, photo_url, slug)
        `)
        .in('match_status', ['live', 'halftime'])
        .order('kickoff_time', { ascending: true });

      if (error) {
        console.error('Error fetching live matches:', error);
      } else {
        setLiveMatches(data || []);
      }
      setLoading(false);
    };

    fetchLiveMatches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'athlete_live_matches'
        },
        (payload) => {
          console.log('Live match update:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newMatch = payload.new as LiveMatch;
            
            // Fetch athlete data for the updated match
            supabase
              .from('athlete_profiles')
              .select('name, team, sport, photo_url, slug')
              .eq('id', newMatch.athlete_id)
              .single()
              .then(({ data: athlete }) => {
                setLiveMatches(prev => {
                  const existingIndex = prev.findIndex(m => m.id === newMatch.id);
                  const matchWithAthlete = { ...newMatch, athlete };
                  
                  if (newMatch.match_status === 'finished' || newMatch.match_status === 'scheduled') {
                    // Remove finished/scheduled matches
                    return prev.filter(m => m.id !== newMatch.id);
                  }
                  
                  if (existingIndex >= 0) {
                    const updated = [...prev];
                    updated[existingIndex] = matchWithAthlete;
                    return updated;
                  } else {
                    return [...prev, matchWithAthlete];
                  }
                });
              });
          } else if (payload.eventType === 'DELETE') {
            setLiveMatches(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return null;
  }

  if (liveMatches.length === 0) {
    return null;
  }

  const getStatusBadge = (status: string, minute: number) => {
    switch (status) {
      case 'live':
        return (
          <Badge className="bg-red-500 text-white animate-pulse flex items-center gap-1">
            <Radio className="w-3 h-3" />
            LIVE {minute}'
          </Badge>
        );
      case 'halftime':
        return (
          <Badge className="bg-yellow-500 text-black flex items-center gap-1">
            <Clock className="w-3 h-3" />
            HT
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatScore = (match: LiveMatch) => {
    if (match.home_away === 'home') {
      return `${match.home_score} - ${match.away_score}`;
    } else {
      return `${match.away_score} - ${match.home_score}`;
    }
  };

  const formatStats = (match: LiveMatch) => {
    if (!match.athlete_stats) return null;
    const stats = match.athlete_stats;
    
    if (match.athlete?.sport === 'basketball') {
      return `${stats.points || 0} PTS | ${stats.rebounds || 0} REB | ${stats.assists || 0} AST`;
    } else {
      const parts = [];
      if (stats.goals > 0) parts.push(`${stats.goals} ⚽`);
      if (stats.assists > 0) parts.push(`${stats.assists} 🅰️`);
      if (parts.length === 0) return null;
      return parts.join(' | ');
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-xl font-bold text-foreground">Live Now</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {liveMatches.map((match) => (
          <Card 
            key={match.id} 
            className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30 hover:border-red-500/50 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                {match.athlete?.photo_url && (
                  <img 
                    src={match.athlete.photo_url} 
                    alt={match.athlete.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-red-500"
                  />
                )}
                <div>
                  <p className="font-bold text-foreground">{match.athlete?.name}</p>
                  <p className="text-xs text-muted-foreground">{match.athlete?.team}</p>
                </div>
              </div>
              {getStatusBadge(match.match_status, match.current_minute)}
            </div>

            <div className="text-center py-3 bg-background/50 rounded-lg mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                {match.home_away === 'home' ? match.athlete?.team : match.opponent} vs {match.home_away === 'away' ? match.athlete?.team : match.opponent}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {formatScore(match)}
              </p>
              {formatStats(match) && (
                <p className="text-sm text-accent mt-2 font-semibold">
                  {formatStats(match)}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {match.competition}
              </div>
              {match.last_event && (
                <span className="text-accent font-medium">
                  📢 {match.last_event}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
