import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertTriangle, Calendar, TrendingUp, User, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

interface AthleteProfile {
  id: string;
  name: string;
  slug: string;
  sport: string;
  team: string;
  league: string;
  photo_url: string | null;
  national_photo_url: string | null;
  action_photo_url: string | null;
  position: string;
  jersey_number: number | null;
}

interface SeasonStats {
  id: string;
  athlete_id: string;
  season: string;
  competition: string;
  games_played: number | null;
  games_started: number | null;
  stats: any;
}

interface DailyUpdate {
  id: string;
  athlete_id: string;
  date: string;
  played: boolean;
  match_result: string | null;
  opponent: string | null;
  competition: string | null;
  home_away: string | null;
  stats: any;
  rating: number | null;
  minutes_played: number | null;
  injury_status: string;
  injury_details: string | null;
}

interface TransferRumor {
  id: string;
  athlete_id: string;
  rumor_date: string;
  headline: string;
  summary: string | null;
  source: string | null;
  source_url: string | null;
  reliability: string;
  status: string;
}

interface UpcomingMatch {
  id: string;
  athlete_id: string;
  match_date: string;
  opponent: string;
  competition: string;
  home_away: string | null;
}

const AthleteProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [athlete, setAthlete] = useState<AthleteProfile | null>(null);
  const [seasonStats, setSeasonStats] = useState<SeasonStats[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [transferRumors, setTransferRumors] = useState<TransferRumor[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        // Fetch athlete profile
        const { data: athleteData } = await supabase
          .from("athlete_profiles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (!athleteData) {
          setLoading(false);
          return;
        }

        setAthlete(athleteData);

        // Fetch related data
        const [statsRes, updatesRes, rumorsRes, matchesRes] = await Promise.all([
          supabase.from("athlete_season_stats").select("*").eq("athlete_id", athleteData.id).order("season", { ascending: false }),
          supabase.from("athlete_daily_updates").select("*").eq("athlete_id", athleteData.id).order("date", { ascending: false }),
          supabase.from("athlete_transfer_rumors").select("*").eq("athlete_id", athleteData.id).order("rumor_date", { ascending: false }),
          supabase.from("athlete_upcoming_matches").select("*").eq("athlete_id", athleteData.id).gte("match_date", new Date().toISOString()).order("match_date"),
        ]);

        if (statsRes.data) setSeasonStats(statsRes.data);
        if (updatesRes.data) setDailyUpdates(updatesRes.data);
        if (rumorsRes.data) setTransferRumors(rumorsRes.data);
        if (matchesRes.data) setUpcomingMatches(matchesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const getInjuryColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "questionable": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "doubtful": return "bg-orange-100 text-orange-700 border-orange-300";
      case "out": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getReliabilityBadge = (reliability: string) => {
    switch (reliability) {
      case "tier_1": return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "tier_2": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "tier_3": return "bg-orange-100 text-orange-700 border-orange-300";
      case "speculation": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const latestUpdate = dailyUpdates[0];
  const currentInjuryStatus = latestUpdate?.injury_status || "healthy";

  // Calculate quick season summary
  const currentSeasonStats = seasonStats[0];
  
  const matchHistory = dailyUpdates.filter(u => u.played);
  const injuryHistory = dailyUpdates.filter(u => u.injury_status && u.injury_status !== "healthy");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-custom py-8">
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-custom py-8">
          <Link to="/section/sports/turkish-stars" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Turkish Stars
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-2">Athlete Not Found</h1>
            <p className="text-muted-foreground">The athlete you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container-custom py-6">
        {/* BACK LINK */}
        <Link to="/section/sports/turkish-stars" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Turkish Stars
        </Link>

        {/* HERO SECTION WITH ACTION PHOTO BACKGROUND */}
        <div className="relative mb-8 rounded-xl overflow-hidden min-h-[180px] md:min-h-[200px]">
          {/* Action Photo Background */}
          {athlete.action_photo_url && (
            <div className="absolute inset-0 z-0">
              <img 
                src={athlete.action_photo_url} 
                alt={`${athlete.name} in action`}
                className="w-full h-full object-cover object-[center_20%]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/50 to-background/30" />
            </div>
          )}
          
          <Card className={`relative z-10 p-6 md:p-8 ${athlete.action_photo_url ? 'bg-transparent border-transparent' : 'bg-card border-border'}`}>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar - National Photo */}
              <div className="flex-shrink-0">
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-4 border-accent/30 mx-auto md:mx-0 shadow-xl">
                  {(athlete.national_photo_url || athlete.photo_url) ? (
                    <img 
                      src={athlete.national_photo_url || athlete.photo_url || ''} 
                      alt={athlete.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                    />
                  ) : (
                    <User className="w-16 h-16 text-muted-foreground" />
                  )}
                  {athlete.jersey_number && (
                    <div className="absolute -bottom-1 -right-1 bg-accent text-accent-foreground text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                      {athlete.jersey_number}
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="text-2xl">🇹🇷</span>
                  {athlete.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <Badge variant="outline" className="text-sm bg-background/80">{athlete.team}</Badge>
                  <Badge variant="outline" className="text-sm bg-background/80">{athlete.league}</Badge>
                  <Badge variant="outline" className="text-sm bg-background/80">{athlete.position}</Badge>
                  {athlete.jersey_number && (
                    <Badge variant="outline" className="text-sm bg-background/80">#{athlete.jersey_number}</Badge>
                  )}
                </div>

                {/* Current Status */}
                {currentInjuryStatus !== "healthy" && (
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <Badge className={`${getInjuryColor(currentInjuryStatus)} border capitalize`}>
                      {currentInjuryStatus}
                    </Badge>
                    {latestUpdate?.injury_details && (
                      <span className="text-sm text-muted-foreground">({latestUpdate.injury_details})</span>
                    )}
                  </div>
                )}

                {/* Quick Season Stats */}
                {currentSeasonStats && (
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                      <div className="text-2xl font-bold text-foreground">{currentSeasonStats.games_played || 0}</div>
                      <div className="text-xs text-muted-foreground uppercase">Games</div>
                    </div>
                    {athlete.sport === "basketball" && currentSeasonStats.stats && (
                      <>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.ppg?.toFixed(1) || "—"}</div>
                          <div className="text-xs text-muted-foreground uppercase">PPG</div>
                        </div>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.rpg?.toFixed(1) || "—"}</div>
                          <div className="text-xs text-muted-foreground uppercase">RPG</div>
                        </div>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.apg?.toFixed(1) || "—"}</div>
                          <div className="text-xs text-muted-foreground uppercase">APG</div>
                        </div>
                      </>
                    )}
                    {athlete.sport === "football" && currentSeasonStats.stats && (
                      <>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.goals || 0}</div>
                          <div className="text-xs text-muted-foreground uppercase">Goals</div>
                        </div>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.assists || 0}</div>
                          <div className="text-xs text-muted-foreground uppercase">Assists</div>
                        </div>
                        <div className="text-center bg-background/80 rounded-lg px-3 py-2">
                          <div className="text-2xl font-bold text-foreground">{currentSeasonStats.stats.avg_rating?.toFixed(1) || "—"}</div>
                          <div className="text-xs text-muted-foreground uppercase">Avg Rating</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* UPCOMING MATCHES */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Upcoming Matches
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {upcomingMatches.map((match) => (
                <Card key={match.id} className="flex-shrink-0 p-4 min-w-[200px] bg-card border-border">
                  <div className="font-semibold text-foreground">
                    {match.home_away === "home" ? "vs" : "@"} {match.opponent}
                  </div>
                  <div className="text-sm text-muted-foreground">{match.competition}</div>
                  <div className="text-sm text-accent mt-2">
                    {format(new Date(match.match_date), "MMM d, h:mm a")}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TABBED CONTENT */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="w-full justify-start mb-6 bg-secondary overflow-x-auto">
            <TabsTrigger value="stats" className="flex-1 sm:flex-none">Season Stats</TabsTrigger>
            <TabsTrigger value="history" className="flex-1 sm:flex-none">Match History</TabsTrigger>
            <TabsTrigger value="transfers" className="flex-1 sm:flex-none">Transfer News</TabsTrigger>
            <TabsTrigger value="injuries" className="flex-1 sm:flex-none">Injury History</TabsTrigger>
          </TabsList>

          {/* TAB 1: Season Stats */}
          <TabsContent value="stats">
            {seasonStats.length > 0 ? (
              <div className="space-y-6">
                {seasonStats.map((stat) => (
                  <Card key={stat.id} className="p-6 bg-card border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-foreground">{stat.season}</h3>
                      <Badge variant="outline">{stat.competition}</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <div className="text-xl font-bold text-foreground">{stat.games_played || 0}</div>
                        <div className="text-xs text-muted-foreground">GP</div>
                      </div>
                      <div className="text-center p-3 bg-secondary rounded-lg">
                        <div className="text-xl font-bold text-foreground">{stat.games_started || 0}</div>
                        <div className="text-xs text-muted-foreground">GS</div>
                      </div>
                      {athlete.sport === "basketball" && stat.stats && (
                        <>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.ppg?.toFixed(1) || "—"}</div>
                            <div className="text-xs text-muted-foreground">PPG</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.rpg?.toFixed(1) || "—"}</div>
                            <div className="text-xs text-muted-foreground">RPG</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.apg?.toFixed(1) || "—"}</div>
                            <div className="text-xs text-muted-foreground">APG</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.fg_pct ? `${(stat.stats.fg_pct * 100).toFixed(1)}%` : "—"}</div>
                            <div className="text-xs text-muted-foreground">FG%</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.three_pct ? `${(stat.stats.three_pct * 100).toFixed(1)}%` : "—"}</div>
                            <div className="text-xs text-muted-foreground">3P%</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.ft_pct ? `${(stat.stats.ft_pct * 100).toFixed(1)}%` : "—"}</div>
                            <div className="text-xs text-muted-foreground">FT%</div>
                          </div>
                        </>
                      )}
                      {athlete.sport === "football" && stat.stats && (
                        <>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.goals || 0}</div>
                            <div className="text-xs text-muted-foreground">Goals</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.assists || 0}</div>
                            <div className="text-xs text-muted-foreground">Assists</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.minutes || 0}</div>
                            <div className="text-xs text-muted-foreground">Minutes</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.shots || 0}</div>
                            <div className="text-xs text-muted-foreground">Shots</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.pass_pct ? `${stat.stats.pass_pct}%` : "—"}</div>
                            <div className="text-xs text-muted-foreground">Pass%</div>
                          </div>
                          <div className="text-center p-3 bg-secondary rounded-lg">
                            <div className="text-xl font-bold text-foreground">{stat.stats.avg_rating?.toFixed(1) || "—"}</div>
                            <div className="text-xs text-muted-foreground">Rating</div>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">No season stats available yet.</p>
              </Card>
            )}
          </TabsContent>

          {/* TAB 2: Match History */}
          <TabsContent value="history">
            {matchHistory.length > 0 ? (
              <div className="space-y-2">
                {matchHistory.map((match) => (
                  <Card key={match.id} className="bg-card border-border overflow-hidden">
                    <button
                      onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground w-20">
                          {format(new Date(match.date), "MMM d")}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {match.home_away === "home" ? "vs" : "@"} {match.opponent}
                          </div>
                          <div className="text-sm text-muted-foreground">{match.competition}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-foreground">{match.match_result || "—"}</div>
                          {match.rating && (
                            <div className="text-sm text-accent">{match.rating.toFixed(1)} rating</div>
                          )}
                        </div>
                        {expandedMatch === match.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                    
                    {expandedMatch === match.id && match.stats && (
                      <div className="px-4 pb-4 pt-2 border-t border-border bg-secondary/30">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {athlete.sport === "basketball" && (
                            <>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.points ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">PTS</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.rebounds ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">REB</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.assists ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">AST</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.steals ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">STL</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.blocks ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">BLK</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.minutes_played ?? "—"}'</div>
                                <div className="text-xs text-muted-foreground">MIN</div>
                              </div>
                            </>
                          )}
                          {athlete.sport === "football" && (
                            <>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.goals ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Goals</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.assists ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Assists</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.shots ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">Shots</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.tackles ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">Tackles</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.stats.pass_pct ? `${match.stats.pass_pct}%` : "—"}</div>
                                <div className="text-xs text-muted-foreground">Pass%</div>
                              </div>
                              <div className="text-center">
                                <div className="font-bold text-foreground">{match.minutes_played ?? "—"}'</div>
                                <div className="text-xs text-muted-foreground">MIN</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">No match history available yet.</p>
              </Card>
            )}
          </TabsContent>

          {/* TAB 3: Transfer News */}
          <TabsContent value="transfers">
            {transferRumors.length > 0 ? (
              <div className="space-y-4">
                {transferRumors.map((rumor) => (
                  <Card key={rumor.id} className="p-6 bg-card border-border">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <Badge className={`${getReliabilityBadge(rumor.reliability)} border capitalize`}>
                        {rumor.reliability.replace("_", " ")}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(rumor.rumor_date), "MMM d, yyyy")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{rumor.headline}</h3>
                    {rumor.summary && (
                      <p className="text-muted-foreground mb-3">{rumor.summary}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Source: {rumor.source || "Unknown"}</span>
                      {rumor.source_url && (
                        <a
                          href={rumor.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          Read more →
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">No transfer news available.</p>
              </Card>
            )}
          </TabsContent>

          {/* TAB 4: Injury History */}
          <TabsContent value="injuries">
            {injuryHistory.length > 0 ? (
              <div className="space-y-2">
                {injuryHistory.map((update) => (
                  <Card key={update.id} className="p-4 bg-card border-border flex items-center gap-4">
                    <div className="text-sm text-muted-foreground w-24">
                      {format(new Date(update.date), "MMM d, yyyy")}
                    </div>
                    <Badge className={`${getInjuryColor(update.injury_status)} border capitalize`}>
                      {update.injury_status}
                    </Badge>
                    {update.injury_details && (
                      <span className="text-foreground">{update.injury_details}</span>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center bg-card border-border">
                <p className="text-muted-foreground">No injury history recorded.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default AthleteProfilePage;
