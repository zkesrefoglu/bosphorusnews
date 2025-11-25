import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Cloud, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TickerData {
  usdTry: number;
  eurTry: number;
  bist100: {
    price: number;
    change: number;
    changePercent: number;
  };
  weather: {
    temp: number;
    description: string;
  };
  timestamp: string;
  cached?: boolean;
}

interface PreviousData {
  usdTry: number;
  eurTry: number;
  bist100: number;
}

export const LiveTicker = () => {
  const [data, setData] = useState<TickerData | null>(null);
  const [previousData, setPreviousData] = useState<PreviousData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    // Load cached data from localStorage on mount
    const cached = localStorage.getItem('ticker-data');
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setData(parsedData);
        setLoading(false);
      } catch (e) {
        console.error('Error parsing cached ticker data:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: tickerData, error } = await supabase.functions.invoke('fetch-ticker-data');

        if (error) throw error;

        if (tickerData && !tickerData.error) {
          // Store previous values for trend calculation
          if (data) {
            setPreviousData({
              usdTry: data.usdTry,
              eurTry: data.eurTry,
              bist100: data.bist100.price,
            });
          }

          setData(tickerData);
          setLastUpdated(new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }));

          // Persist to localStorage
          localStorage.setItem('ticker-data', JSON.stringify(tickerData));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(interval);
  }, [data]);

  const getTrendIcon = (current: number, previous: number | undefined) => {
    if (!previous) return <Minus className="w-3 h-3 text-muted-foreground" />;
    if (current > previous) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
  };

  const getChangePercent = (current: number, previous: number | undefined) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2);
  };

  if (loading || !data) {
    return (
      <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-3 text-xs font-medium">
      {/* USD/TRY */}
      <div 
        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors opacity-0 group relative"
        style={{ 
          animation: 'slideInFromRight 0.8s ease-out 0.2s forwards',
        }}
      >
        <span className="text-muted-foreground">$/₺</span>
        <span className="text-foreground font-semibold">{data.usdTry.toFixed(2)}</span>
        {getTrendIcon(data.usdTry, previousData?.usdTry)}
        {previousData && getChangePercent(data.usdTry, previousData.usdTry) && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            {getChangePercent(data.usdTry, previousData.usdTry)}%
          </span>
        )}
      </div>

      {/* EUR/TRY */}
      <div 
        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors opacity-0 group relative"
        style={{ 
          animation: 'slideInFromRight 0.8s ease-out 0.4s forwards',
        }}
      >
        <span className="text-muted-foreground">€/₺</span>
        <span className="text-foreground font-semibold">{data.eurTry.toFixed(2)}</span>
        {getTrendIcon(data.eurTry, previousData?.eurTry)}
        {previousData && getChangePercent(data.eurTry, previousData.eurTry) && (
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
            {getChangePercent(data.eurTry, previousData.eurTry)}%
          </span>
        )}
      </div>

      {/* BIST 100 */}
      <div 
        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors opacity-0 group relative"
        style={{ 
          animation: 'slideInFromRight 0.8s ease-out 0.6s forwards',
        }}
      >
        <span className="text-muted-foreground">BIST</span>
        <span className="text-foreground font-semibold">{data.bist100.price.toFixed(0)}</span>
        {data.bist100.changePercent > 0 ? (
          <TrendingUp className="w-3 h-3 text-green-500" />
        ) : data.bist100.changePercent < 0 ? (
          <TrendingDown className="w-3 h-3 text-red-500" />
        ) : (
          <Minus className="w-3 h-3 text-muted-foreground" />
        )}
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          {data.bist100.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Weather */}
      <div 
        className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors opacity-0"
        style={{ 
          animation: 'slideInFromRight 0.8s ease-out 0.8s forwards',
        }}
      >
        <Cloud className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground font-semibold">{data.weather.temp}°C</span>
        <span className="text-muted-foreground text-[10px]">{data.weather.description}</span>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div 
          className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground opacity-0"
          style={{ 
            animation: 'slideInFromRight 0.8s ease-out 1s forwards',
          }}
        >
          Son: {lastUpdated}
        </div>
      )}

      <style>{`
        @keyframes slideInFromRight {
          0% {
            transform: translateX(100px);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
