import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Line, ComposedChart } from "recharts";

interface MatchData {
  id: string;
  date: string;
  opponent: string | null;
  rating: number | null;
  played: boolean;
}

interface RatingTrendChartProps {
  matches: MatchData[];
  maxMatches?: number;
}

// Calculate linear regression for trend line
const calculateTrendLine = (data: { index: number; rating: number | null }[]) => {
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.index, 0);
  const sumY = data.reduce((sum, d) => sum + (d.rating || 0), 0);
  const sumXY = data.reduce((sum, d) => sum + d.index * (d.rating || 0), 0);
  const sumXX = data.reduce((sum, d) => sum + d.index * d.index, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

export const RatingTrendChart = ({ matches, maxMatches = 15 }: RatingTrendChartProps) => {
  // Filter to played matches with ratings, sort oldest to newest for chart
  const chartData = matches
    .filter((m) => m.played && m.rating !== null)
    .slice(0, maxMatches)
    .reverse() // Oldest first for left-to-right progression
    .map((m, index) => ({
      index: index + 1,
      rating: m.rating,
      opponent: m.opponent || "Unknown",
      date: m.date,
    }));

  if (chartData.length < 2) {
    return null; // Need at least 2 points for a trend line
  }

  // Calculate linear regression trend line
  const { slope, intercept } = calculateTrendLine(chartData);
  const dataWithTrend = chartData.map((d) => ({
    ...d,
    trend: intercept + slope * d.index,
  }));

  // Determine trend direction from slope
  const trendDirection = slope > 0.02 ? "↑" : slope < -0.02 ? "↓" : "→";
  const trendColor = trendDirection === "↑" ? "text-emerald-500" : trendDirection === "↓" ? "text-red-500" : "text-muted-foreground";

  return (
    <div className="bg-background/80 rounded-lg p-3 min-w-[180px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground uppercase">Form Trend</span>
        <span className={`text-sm font-bold ${trendColor}`}>{trendDirection}</span>
      </div>
      <div className="h-[70px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataWithTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis domain={[5.5, 9]} hide />
            <ReferenceLine y={7} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-card border border-border rounded px-2 py-1 text-xs shadow-lg">
                      <div className="font-semibold text-foreground">vs {data.opponent}</div>
                      <div className="text-muted-foreground">Rating: {data.rating?.toFixed(1)}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fill="url(#ratingGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--accent))" }}
            />
            <Line
              type="linear"
              dataKey="trend"
              stroke="hsl(var(--foreground))"
              strokeWidth={1}
              dot={false}
              activeDot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
