import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, AlertTriangle, Calendar, TrendingUp, ExternalLink, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isWithinInterval, addHours } from "date-fns";

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
  team_logo_url: string | null;
  position: string;
  jersey_number: number | null;
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

const TurkishStars = () => {
  const [athletes, setAthletes] = useState<AthleteProfile[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [transferRumors, setTransferRumors] = useState<TransferRumor[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [athletesRes, updatesRes, rumorsRes, matchesRes] = await Promise.all([
          supabase.from("athlete_profiles").select("*").order("name"),
          supabase.from("athlete_daily_updates").select("*").order("date", { ascending: false }),
          supabase.from("athlete_transfer_rumors").select("*").eq("status", "active").order("rumor_date", { ascending: false }),
          supabase.from("athlete_upcoming_matches").select("*").order("match_date"),
        ]);

        if (athletesRes.data) setAthletes(athletesRes.data);
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
  }, []);

  const getLatestUpdate = (athleteId: string): DailyUpdate | undefined => {
    return dailyUpdates.find((u) => u.athlete_id === athleteId);
  };

  const getLastMatch = (athleteId: string): DailyUpdate | undefined => {
    return dailyUpdates.find((u) => u.athlete_id === athleteId && u.played);
  };

  const getNextMatch = (athleteId: string): UpcomingMatch | undefined => {
    const now = new Date();
    return upcomingMatches.find(
      (m) => m.athlete_id === athleteId && new Date(m.match_date) > now
    );
  };

  const getAthlete = (athleteId: string): AthleteProfile | undefined => {
    return athletes.find((a) => a.id === athleteId);
  };

  const injuryAlerts = dailyUpdates.filter(
    (u) => u.injury_status !== "healthy" && athletes.find((a) => a.id === u.athlete_id)
  );

  const topRumors = transferRumors.filter(
    (r) => r.reliability === "tier_1" || r.reliability === "tier_2"
  );

  const next48Hours = upcomingMatches.filter((m) => {
    const matchDate = new Date(m.match_date);
    const now = new Date();
    return isWithinInterval(matchDate, { start: now, end: addHours(now, 48) });
  });

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

  const formatStats = (athlete: AthleteProfile, stats: any) => {
    if (!stats || typeof stats !== 'object' || Object.keys(stats).length === 0) return "—";
    
    if (athlete.sport === "basketball") {
      const pts = stats.points ?? stats.pts ?? "—";
      const reb = stats.rebounds ?? stats.reb ?? "—";
      const ast = stats.assists ?? stats.ast ?? "—";
      return `${pts}/${reb}/${ast}`;
    } else {
      const goals = stats.goals ?? 0;
      const assists = stats.assists ?? 0;
      return `${goals}G/${assists}A`;
    }
  };

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container-custom py-6">
        <Link to="/section/sports" className="inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sports
        </Link>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-headline font-bold flex items-center gap-3">
            <span className="text-4xl">🇹🇷</span>
            <span className="text-accent">
              Turkish Stars Tracker
            </span>
          </h1>
          <div className="text-muted-foreground text-sm font-ui uppercase tracking-wider">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </div>
        </div>

        {/* ALERTS SECTION */}
        {(injuryAlerts.length > 0 || topRumors.length > 0) && (
          <div className="mb-8 space-y-3">
            {injuryAlerts.map((alert) => {
              const athlete = getAthlete(alert.athlete_id);
              if (!athlete) return null;
              return (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-red-600">{athlete.name}</span>
                    <span className="text-foreground mx-2">—</span>
                    <span className="text-muted-foreground capitalize">{alert.injury_status}</span>
                    {alert.injury_details && (
                      <span className="text-muted-foreground ml-2">({alert.injury_details})</span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {topRumors.map((rumor) => {
              const athlete = getAthlete(rumor.athlete_id);
              if (!athlete) return null;
              return (
                <div
                  key={rumor.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200"
                >
                  <TrendingUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold text-orange-600">{athlete.name}</span>
                    <span className="text-foreground mx-2">—</span>
                    <span className="text-foreground">{rumor.headline}</span>
                    <Badge className={`ml-2 ${getReliabilityBadge(rumor.reliability)} text-xs border`}>
                      {rumor.reliability.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ATHLETE CARDS - Horizontal Rectangles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {athletes.map((athlete) => {
            const latestUpdate = getLatestUpdate(athlete.id);
            const nextMatch = getNextMatch(athlete.id);
            const injuryStatus = latestUpdate?.injury_status || "healthy";
            const sportEmoji = athlete.sport === "basketball" ? "🏀" : "⚽";

            return (
              <Link
                key={athlete.id}
                to={`/section/sports/turkish-stars/${athlete.slug}`}
                className="group block"
              >
                <Card className="bg-card border-border overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-accent/50 relative">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="flex items-stretch relative">
                    {/* 200x200 Profile Photo - Sharp Card Style */}
                    <div className="relative w-[180px] md:w-[200px] h-[200px] flex-shrink-0 bg-secondary overflow-hidden">
                      {athlete.photo_url ? (
                        <img 
                          src={athlete.photo_url} 
                          alt={athlete.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                          <User className="w-20 h-20 text-muted-foreground/50" />
                        </div>
                      )}
                      {/* Jersey Number Badge */}
                      {athlete.jersey_number && (
                        <div className="absolute top-3 left-3 bg-accent text-accent-foreground text-lg font-bold w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border-2 border-background">
                          {athlete.jersey_number}
                        </div>
                      )}
                      {/* Sport Emoji */}
                      <div className="absolute bottom-3 left-3 text-2xl drop-shadow-lg">
                        {sportEmoji}
                      </div>
                    </div>

                    {/* Middle Content: Info */}
                    <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
                      {/* Top: Name & Team */}
                      <div>
                        <h3 className="font-headline font-bold text-xl text-foreground truncate group-hover:text-accent transition-colors">
                          {athlete.name}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium">{athlete.team}</p>
                        <p className="text-xs text-muted-foreground/70">{athlete.position} • {athlete.league}</p>
                      </div>

                      {/* Middle: Status Badge */}
                      <div className="my-2">
                        <Badge className={`${getInjuryColor(injuryStatus)} border capitalize text-xs px-3 py-1`}>
                          {injuryStatus}
                        </Badge>
                      </div>

                      {/* Bottom: Next Match */}
                      <div className="pt-2 border-t border-border/50">
                        {nextMatch ? (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/70 font-ui">Next Match</div>
                            <div className="text-sm font-semibold text-foreground">
                              {nextMatch.home_away === "home" ? "vs" : "@"} {nextMatch.opponent}
                            </div>
                            <div className="text-xs text-accent font-medium">
                              {format(new Date(nextMatch.match_date), "MMM d, h:mm a")}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground/50 italic">No upcoming match</div>
                        )}
                      </div>
                    </div>

                    {/* Right Edge: Team Logo */}
                    <div className="w-[80px] md:w-[100px] flex-shrink-0 flex items-center justify-center bg-gradient-to-l from-secondary/50 to-transparent border-l border-border/30">
                      {athlete.team_logo_url ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <img 
                            src={athlete.team_logo_url} 
                            alt={`${athlete.team} logo`}
                            className="w-14 h-14 md:w-16 md:h-16 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-2xl">{sportEmoji}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* TRANSFER RUMORS */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-accent" />
              Transfer Rumors
            </h2>
            
            {transferRumors.length > 0 ? (
              <div className="space-y-4">
                {transferRumors.slice(0, 5).map((rumor) => {
                  const athlete = getAthlete(rumor.athlete_id);
                  if (!athlete) return null;
                  
                  return (
                    <div key={rumor.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-accent">{athlete.name}</span>
                        <Badge className={`${getReliabilityBadge(rumor.reliability)} border text-xs`}>
                          {rumor.reliability.replace("_", " ")}
                        </Badge>
                      </div>
                      <p className="text-foreground text-sm mb-2">{rumor.headline}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{rumor.source || "Unknown source"}</span>
                        <span>{format(new Date(rumor.rumor_date), "MMM d")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No active transfer rumors</p>
            )}
          </Card>

          {/* UPCOMING FIXTURES */}
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-headline font-bold mb-4 flex items-center gap-2 text-foreground">
              <Calendar className="w-5 h-5 text-accent" />
              Upcoming (48h)
            </h2>
            
            {next48Hours.length > 0 ? (
              <div className="space-y-3">
                {next48Hours.map((match) => {
                  const athlete = getAthlete(match.athlete_id);
                  if (!athlete) return null;
                  
                  return (
                    <div key={match.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary">
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{athlete.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {match.home_away === "home" ? "vs" : "@"} {match.opponent}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">{match.competition}</div>
                        <div className="text-xs text-accent">
                          {format(new Date(match.match_date), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No matches in the next 48 hours</p>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TurkishStars;
