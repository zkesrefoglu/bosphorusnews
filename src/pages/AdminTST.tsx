import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw, Plus, Pencil, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface Athlete {
  id: string;
  name: string;
  slug: string;
  sport: string;
  team: string;
  league: string;
  position: string;
  jersey_number: number | null;
  photo_url: string | null;
  team_logo_url: string | null;
  action_photo_url: string | null;
  national_photo_url: string | null;
  fotmob_id: number | null;
  balldontlie_id: number | null;
}

interface DailyUpdate {
  id: string;
  athlete_id: string;
  date: string;
  opponent: string | null;
  competition: string | null;
  home_away: string | null;
  match_result: string | null;
  played: boolean;
  minutes_played: number | null;
  rating: number | null;
  stats: any;
  injury_status: string | null;
  injury_details: string | null;
}

interface TransferRumor {
  id: string;
  athlete_id: string;
  headline: string;
  summary: string | null;
  source: string | null;
  source_url: string | null;
  reliability: string | null;
  status: string | null;
  rumor_date: string;
}

interface UpcomingMatch {
  id: string;
  athlete_id: string;
  match_date: string;
  opponent: string;
  competition: string;
  home_away: string | null;
}

interface LiveMatch {
  id: string;
  athlete_id: string;
  opponent: string;
  competition: string;
  kickoff_time: string;
  match_status: string;
  home_away: string | null;
  current_minute: number | null;
  home_score: number | null;
  away_score: number | null;
  athlete_stats: any;
  last_event: string | null;
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

export default function AdminTST() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [dailyUpdates, setDailyUpdates] = useState<DailyUpdate[]>([]);
  const [transferRumors, setTransferRumors] = useState<TransferRumor[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [seasonStats, setSeasonStats] = useState<SeasonStats[]>([]);
  const [syncStatus, setSyncStatus] = useState<{ football: string; nba: string }>({ football: 'idle', nba: 'idle' });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');
    if (!hasAdminRole) {
      toast({ title: 'Access Denied', description: 'Admin privileges required', variant: 'destructive' });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    loadAllData();
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      loadAthletes(),
      loadDailyUpdates(),
      loadTransferRumors(),
      loadUpcomingMatches(),
      loadLiveMatches(),
      loadSeasonStats(),
    ]);
    setLoading(false);
  };

  const loadAthletes = async () => {
    const { data } = await supabase.from('athlete_profiles').select('*').order('name');
    if (data) setAthletes(data as Athlete[]);
  };

  const loadDailyUpdates = async () => {
    const { data } = await supabase.from('athlete_daily_updates').select('*').order('date', { ascending: false }).limit(50);
    if (data) setDailyUpdates(data as DailyUpdate[]);
  };

  const loadTransferRumors = async () => {
    const { data } = await supabase.from('athlete_transfer_rumors').select('*').order('rumor_date', { ascending: false });
    if (data) setTransferRumors(data as TransferRumor[]);
  };

  const loadUpcomingMatches = async () => {
    const { data } = await supabase.from('athlete_upcoming_matches').select('*').order('match_date');
    if (data) setUpcomingMatches(data as UpcomingMatch[]);
  };

  const loadLiveMatches = async () => {
    const { data } = await supabase.from('athlete_live_matches').select('*').order('kickoff_time');
    if (data) setLiveMatches(data as LiveMatch[]);
  };

  const loadSeasonStats = async () => {
    const { data } = await supabase.from('athlete_season_stats').select('*').order('season', { ascending: false });
    if (data) setSeasonStats(data as SeasonStats[]);
  };

  const getAthleteName = (athleteId: string) => {
    return athletes.find(a => a.id === athleteId)?.name || 'Unknown';
  };

  const triggerSync = async (type: 'football' | 'nba') => {
    const functionName = type === 'football' ? 'fetch-football-stats' : 'fetch-nba-stats';
    setSyncStatus(prev => ({ ...prev, [type]: 'syncing' }));
    
    try {
      const { data, error } = await supabase.functions.invoke(functionName);
      
      if (error) throw error;
      
      setSyncStatus(prev => ({ ...prev, [type]: 'success' }));
      toast({ title: 'Sync Complete', description: `${type === 'football' ? 'Football' : 'NBA'} stats updated successfully` });
      loadAllData();
      
      setTimeout(() => setSyncStatus(prev => ({ ...prev, [type]: 'idle' })), 3000);
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncStatus(prev => ({ ...prev, [type]: 'error' }));
      toast({ title: 'Sync Failed', description: error.message, variant: 'destructive' });
      
      setTimeout(() => setSyncStatus(prev => ({ ...prev, [type]: 'idle' })), 3000);
    }
  };

  const testBalldontlie = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-balldontlie');
      if (error) throw error;
      
      toast({ 
        title: 'Test Complete', 
        description: data.success ? `Found: ${data.player?.first_name} ${data.player?.last_name} (ID: ${data.player?.id})` : data.message 
      });
      loadAthletes();
    } catch (error: any) {
      toast({ title: 'Test Failed', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold">Turkish Stars Tracker Admin</h1>
        </div>

        <Tabs defaultValue="athletes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="updates">Daily Updates</TabsTrigger>
            <TabsTrigger value="live">Live Matches</TabsTrigger>
            <TabsTrigger value="rumors">Rumors</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="stats">Season Stats</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>

          {/* Athletes Tab */}
          <TabsContent value="athletes">
            <Card>
              <CardHeader>
                <CardTitle>Athlete Profiles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>FotMob ID</TableHead>
                      <TableHead>Balldontlie ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {athletes.map((athlete) => (
                      <TableRow key={athlete.id}>
                        <TableCell className="font-medium">{athlete.name}</TableCell>
                        <TableCell>
                          <Badge variant={athlete.sport === 'basketball' ? 'default' : 'secondary'}>
                            {athlete.sport}
                          </Badge>
                        </TableCell>
                        <TableCell>{athlete.team}</TableCell>
                        <TableCell>{athlete.position}</TableCell>
                        <TableCell>{athlete.fotmob_id || '-'}</TableCell>
                        <TableCell>{athlete.balldontlie_id || '-'}</TableCell>
                        <TableCell>
                          <AthleteEditDialog athlete={athlete} onSave={loadAthletes} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Daily Updates Tab */}
          <TabsContent value="updates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daily Updates / Match Results</CardTitle>
                <DailyUpdateDialog athletes={athletes} onSave={loadDailyUpdates} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyUpdates.map((update) => (
                      <TableRow key={update.id}>
                        <TableCell>{update.date}</TableCell>
                        <TableCell>{getAthleteName(update.athlete_id)}</TableCell>
                        <TableCell>{update.opponent || '-'}</TableCell>
                        <TableCell>{update.competition || '-'}</TableCell>
                        <TableCell>{update.match_result || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {update.stats ? JSON.stringify(update.stats) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={update.injury_status === 'healthy' ? 'default' : 'destructive'}>
                            {update.injury_status || 'healthy'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Matches Tab */}
          <TabsContent value="live">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Live Matches</CardTitle>
                <LiveMatchDialog athletes={athletes} onSave={loadLiveMatches} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Minute</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveMatches.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>{getAthleteName(match.athlete_id)}</TableCell>
                        <TableCell>{match.opponent}</TableCell>
                        <TableCell>{match.competition}</TableCell>
                        <TableCell>
                          <Badge variant={match.match_status === 'live' ? 'destructive' : 'secondary'}>
                            {match.match_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{match.home_score ?? 0} - {match.away_score ?? 0}</TableCell>
                        <TableCell>{match.current_minute || '-'}'</TableCell>
                        <TableCell>
                          <LiveMatchEditDialog match={match} onSave={loadLiveMatches} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {liveMatches.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No live matches
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transfer Rumors Tab */}
          <TabsContent value="rumors">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Transfer Rumors</CardTitle>
                <TransferRumorDialog athletes={athletes} onSave={loadTransferRumors} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Headline</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Reliability</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transferRumors.map((rumor) => (
                      <TableRow key={rumor.id}>
                        <TableCell>{rumor.rumor_date}</TableCell>
                        <TableCell>{getAthleteName(rumor.athlete_id)}</TableCell>
                        <TableCell className="max-w-[300px] truncate">{rumor.headline}</TableCell>
                        <TableCell>{rumor.source || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            rumor.reliability === 'tier_1' ? 'default' :
                            rumor.reliability === 'tier_2' ? 'secondary' :
                            'outline'
                          }>
                            {rumor.reliability || 'speculation'}
                          </Badge>
                        </TableCell>
                        <TableCell>{rumor.status || 'active'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upcoming Matches Tab */}
          <TabsContent value="upcoming">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Matches</CardTitle>
                <UpcomingMatchDialog athletes={athletes} onSave={loadUpcomingMatches} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Opponent</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Home/Away</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingMatches.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>{new Date(match.match_date).toLocaleString()}</TableCell>
                        <TableCell>{getAthleteName(match.athlete_id)}</TableCell>
                        <TableCell>{match.opponent}</TableCell>
                        <TableCell>{match.competition}</TableCell>
                        <TableCell>{match.home_away || '-'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={async () => {
                              await supabase.from('athlete_upcoming_matches').delete().eq('id', match.id);
                              loadUpcomingMatches();
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Season Stats Tab */}
          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Season Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Athlete</TableHead>
                      <TableHead>Season</TableHead>
                      <TableHead>Competition</TableHead>
                      <TableHead>Games Played</TableHead>
                      <TableHead>Stats</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {seasonStats.map((stat) => (
                      <TableRow key={stat.id}>
                        <TableCell>{getAthleteName(stat.athlete_id)}</TableCell>
                        <TableCell>{stat.season}</TableCell>
                        <TableCell>{stat.competition}</TableCell>
                        <TableCell>{stat.games_played || 0}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {stat.stats ? JSON.stringify(stat.stats) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sync Tab */}
          <TabsContent value="sync">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Football Stats Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fetches stats from FotMob API for: Arda Güler, Kenan Yıldız, Ferdi Kadıoğlu, Can Uzun, Berke Özer
                  </p>
                  <Button 
                    onClick={() => triggerSync('football')} 
                    disabled={syncStatus.football === 'syncing'}
                    className="w-full"
                  >
                    {syncStatus.football === 'syncing' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {syncStatus.football === 'success' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                    {syncStatus.football === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                    {syncStatus.football === 'idle' && <RefreshCw className="h-4 w-4 mr-2" />}
                    Sync Football Stats
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NBA Stats Sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Fetches stats from Balldontlie API for: Alperen Şengün
                  </p>
                  <Button 
                    onClick={() => triggerSync('nba')} 
                    disabled={syncStatus.nba === 'syncing'}
                    className="w-full"
                  >
                    {syncStatus.nba === 'syncing' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {syncStatus.nba === 'success' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                    {syncStatus.nba === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                    {syncStatus.nba === 'idle' && <RefreshCw className="h-4 w-4 mr-2" />}
                    Sync NBA Stats
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Test Balldontlie Connection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Search for Alperen Şengün and update his player ID
                  </p>
                  <Button onClick={testBalldontlie} variant="outline" className="w-full">
                    Test API & Find Sengun
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cron Job Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Football Stats:</span>
                      <Badge>Hourly at :00</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>NBA Stats:</span>
                      <Badge>Hourly at :30</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cron jobs run automatically. Use manual sync buttons above for immediate updates.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Dialog Components
function AthleteEditDialog({ athlete, onSave }: { athlete: Athlete; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState(athlete);

  const handleSave = async () => {
    const { error } = await supabase.from('athlete_profiles').update(formData).eq('id', athlete.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Athlete updated' });
      setOpen(false);
      onSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {athlete.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Team</Label>
              <Input value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} />
            </div>
            <div>
              <Label>League</Label>
              <Input value={formData.league} onChange={e => setFormData({...formData, league: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Position</Label>
              <Input value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} />
            </div>
            <div>
              <Label>Jersey #</Label>
              <Input type="number" value={formData.jersey_number || ''} onChange={e => setFormData({...formData, jersey_number: parseInt(e.target.value) || null})} />
            </div>
            <div>
              <Label>Sport</Label>
              <Select value={formData.sport} onValueChange={v => setFormData({...formData, sport: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="basketball">Basketball</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>FotMob ID</Label>
              <Input type="number" value={formData.fotmob_id || ''} onChange={e => setFormData({...formData, fotmob_id: parseInt(e.target.value) || null})} />
            </div>
            <div>
              <Label>Balldontlie ID</Label>
              <Input type="number" value={formData.balldontlie_id || ''} onChange={e => setFormData({...formData, balldontlie_id: parseInt(e.target.value) || null})} />
            </div>
          </div>
          <div>
            <Label>Photo URL</Label>
            <Input value={formData.photo_url || ''} onChange={e => setFormData({...formData, photo_url: e.target.value})} />
          </div>
          <div>
            <Label>Team Logo URL</Label>
            <Input value={formData.team_logo_url || ''} onChange={e => setFormData({...formData, team_logo_url: e.target.value})} />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}

function DailyUpdateDialog({ athletes, onSave }: { athletes: Athlete[]; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    athlete_id: '',
    date: new Date().toISOString().split('T')[0],
    opponent: '',
    competition: '',
    home_away: 'home',
    match_result: '',
    played: true,
    minutes_played: 0,
    rating: null as number | null,
    stats: '{}',
    injury_status: 'healthy',
    injury_details: '',
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('athlete_daily_updates').insert({
        ...formData,
        stats: JSON.parse(formData.stats || '{}'),
      });
      if (error) throw error;
      toast({ title: 'Added', description: 'Daily update added' });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Update</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Daily Update</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Athlete</Label>
              <Select value={formData.athlete_id} onValueChange={v => setFormData({...formData, athlete_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>
                  {athletes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Opponent</Label>
              <Input value={formData.opponent} onChange={e => setFormData({...formData, opponent: e.target.value})} />
            </div>
            <div>
              <Label>Competition</Label>
              <Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Home/Away</Label>
              <Select value={formData.home_away} onValueChange={v => setFormData({...formData, home_away: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Result</Label>
              <Input value={formData.match_result} onChange={e => setFormData({...formData, match_result: e.target.value})} placeholder="2-1" />
            </div>
            <div>
              <Label>Minutes</Label>
              <Input type="number" value={formData.minutes_played} onChange={e => setFormData({...formData, minutes_played: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <div>
            <Label>Stats (JSON)</Label>
            <Textarea value={formData.stats} onChange={e => setFormData({...formData, stats: e.target.value})} placeholder='{"goals": 1, "assists": 0}' />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Injury Status</Label>
              <Select value={formData.injury_status} onValueChange={v => setFormData({...formData, injury_status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="questionable">Questionable</SelectItem>
                  <SelectItem value="injured">Injured</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Injury Details</Label>
              <Input value={formData.injury_details} onChange={e => setFormData({...formData, injury_details: e.target.value})} />
            </div>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Add Update</Button>
      </DialogContent>
    </Dialog>
  );
}

function LiveMatchDialog({ athletes, onSave }: { athletes: Athlete[]; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    athlete_id: '',
    opponent: '',
    competition: '',
    kickoff_time: new Date().toISOString().slice(0, 16),
    match_status: 'scheduled',
    home_away: 'home',
    home_score: 0,
    away_score: 0,
    current_minute: 0,
    athlete_stats: '{}',
    last_event: '',
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('athlete_live_matches').insert({
        ...formData,
        athlete_stats: JSON.parse(formData.athlete_stats || '{}'),
      });
      if (error) throw error;
      toast({ title: 'Added', description: 'Live match created' });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Live Match</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Live Match</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Athlete</Label>
              <Select value={formData.athlete_id} onValueChange={v => setFormData({...formData, athlete_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>
                  {athletes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Kickoff Time</Label>
              <Input type="datetime-local" value={formData.kickoff_time} onChange={e => setFormData({...formData, kickoff_time: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Opponent</Label>
              <Input value={formData.opponent} onChange={e => setFormData({...formData, opponent: e.target.value})} />
            </div>
            <div>
              <Label>Competition</Label>
              <Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.match_status} onValueChange={v => setFormData({...formData, match_status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="halftime">Halftime</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Home/Away</Label>
              <Select value={formData.home_away} onValueChange={v => setFormData({...formData, home_away: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minute</Label>
              <Input type="number" value={formData.current_minute} onChange={e => setFormData({...formData, current_minute: parseInt(e.target.value) || 0})} />
            </div>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Create Match</Button>
      </DialogContent>
    </Dialog>
  );
}

function LiveMatchEditDialog({ match, onSave }: { match: LiveMatch; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...match,
    athlete_stats: JSON.stringify(match.athlete_stats || {}),
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('athlete_live_matches').update({
        ...formData,
        athlete_stats: JSON.parse(formData.athlete_stats || '{}'),
      }).eq('id', match.id);
      if (error) throw error;
      toast({ title: 'Updated', description: 'Live match updated' });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    await supabase.from('athlete_live_matches').delete().eq('id', match.id);
    setOpen(false);
    onSave();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Live Match</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={formData.match_status} onValueChange={v => setFormData({...formData, match_status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="halftime">Halftime</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Minute</Label>
              <Input type="number" value={formData.current_minute || 0} onChange={e => setFormData({...formData, current_minute: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Last Event</Label>
              <Input value={formData.last_event || ''} onChange={e => setFormData({...formData, last_event: e.target.value})} placeholder="Goal, Assist..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Home Score</Label>
              <Input type="number" value={formData.home_score || 0} onChange={e => setFormData({...formData, home_score: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <Label>Away Score</Label>
              <Input type="number" value={formData.away_score || 0} onChange={e => setFormData({...formData, away_score: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <div>
            <Label>Athlete Stats (JSON)</Label>
            <Textarea value={formData.athlete_stats} onChange={e => setFormData({...formData, athlete_stats: e.target.value})} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">Save</Button>
          <Button variant="destructive" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TransferRumorDialog({ athletes, onSave }: { athletes: Athlete[]; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    athlete_id: '',
    headline: '',
    summary: '',
    source: '',
    source_url: '',
    reliability: 'speculation',
    status: 'active',
    rumor_date: new Date().toISOString().split('T')[0],
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('athlete_transfer_rumors').insert(formData);
      if (error) throw error;
      toast({ title: 'Added', description: 'Transfer rumor added' });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Rumor</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Transfer Rumor</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Athlete</Label>
              <Select value={formData.athlete_id} onValueChange={v => setFormData({...formData, athlete_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
                <SelectContent>
                  {athletes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.rumor_date} onChange={e => setFormData({...formData, rumor_date: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Headline</Label>
            <Input value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
          </div>
          <div>
            <Label>Summary</Label>
            <Textarea value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Source</Label>
              <Input value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
            </div>
            <div>
              <Label>Source URL</Label>
              <Input value={formData.source_url} onChange={e => setFormData({...formData, source_url: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Reliability</Label>
              <Select value={formData.reliability} onValueChange={v => setFormData({...formData, reliability: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tier_1">Tier 1 (Highly Reliable)</SelectItem>
                  <SelectItem value="tier_2">Tier 2 (Reliable)</SelectItem>
                  <SelectItem value="tier_3">Tier 3 (Less Reliable)</SelectItem>
                  <SelectItem value="speculation">Speculation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="denied">Denied</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Add Rumor</Button>
      </DialogContent>
    </Dialog>
  );
}

function UpcomingMatchDialog({ athletes, onSave }: { athletes: Athlete[]; onSave: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    athlete_id: '',
    match_date: new Date().toISOString().slice(0, 16),
    opponent: '',
    competition: '',
    home_away: 'home',
  });

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('athlete_upcoming_matches').insert(formData);
      if (error) throw error;
      toast({ title: 'Added', description: 'Upcoming match added' });
      setOpen(false);
      onSave();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-2" />Add Match</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Upcoming Match</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label>Athlete</Label>
            <Select value={formData.athlete_id} onValueChange={v => setFormData({...formData, athlete_id: v})}>
              <SelectTrigger><SelectValue placeholder="Select athlete" /></SelectTrigger>
              <SelectContent>
                {athletes.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date/Time</Label>
            <Input type="datetime-local" value={formData.match_date} onChange={e => setFormData({...formData, match_date: e.target.value})} />
          </div>
          <div>
            <Label>Opponent</Label>
            <Input value={formData.opponent} onChange={e => setFormData({...formData, opponent: e.target.value})} />
          </div>
          <div>
            <Label>Competition</Label>
            <Input value={formData.competition} onChange={e => setFormData({...formData, competition: e.target.value})} />
          </div>
          <div>
            <Label>Home/Away</Label>
            <Select value={formData.home_away} onValueChange={v => setFormData({...formData, home_away: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="away">Away</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} className="w-full">Add Match</Button>
      </DialogContent>
    </Dialog>
  );
}
