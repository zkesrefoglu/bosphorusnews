import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Cloud } from "lucide-react";

interface TickerData {
  usdTry: number;
  eurTry: number;
  bist100: number;
  weather: {
    temp: number;
    description: string;
  };
}

export const LiveTicker = () => {
  const [data, setData] = useState<TickerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch currency rates from exchangerate-api.com (free tier)
        const currencyResponse = await fetch(
          'https://api.exchangerate-api.com/v4/latest/USD'
        );
        const currencyData = await currencyResponse.json();
        
        // Fetch EUR/TRY rate
        const eurResponse = await fetch(
          'https://api.exchangerate-api.com/v4/latest/EUR'
        );
        const eurData = await eurResponse.json();

        // Fetch Istanbul weather from Open-Meteo (free, no API key needed)
        const weatherResponse = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul'
        );
        const weatherData = await weatherResponse.json();

        // Mock BIST 100 data (would need a real API or edge function for actual data)
        // You can replace this with a real API later
        const bist100Value = 9500 + Math.random() * 100;

        setData({
          usdTry: currencyData.rates.TRY,
          eurTry: eurData.rates.TRY,
          bist100: bist100Value,
          weather: {
            temp: weatherData.current.temperature_2m,
            description: getWeatherDescription(weatherData.current.weather_code),
          },
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    return 'Stormy';
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
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
        <span className="text-muted-foreground">$/₺</span>
        <span className="text-foreground font-semibold">{data.usdTry.toFixed(2)}</span>
        <TrendingUp className="w-3 h-3 text-green-500" />
      </div>

      {/* EUR/TRY */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
        <span className="text-muted-foreground">€/₺</span>
        <span className="text-foreground font-semibold">{data.eurTry.toFixed(2)}</span>
        <TrendingDown className="w-3 h-3 text-red-500" />
      </div>

      {/* BIST 100 */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
        <span className="text-muted-foreground">BIST</span>
        <span className="text-foreground font-semibold">{data.bist100.toFixed(0)}</span>
      </div>

      {/* Weather */}
      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded hover:bg-muted transition-colors animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
        <Cloud className="w-3 h-3 text-muted-foreground" />
        <span className="text-foreground font-semibold">{data.weather.temp}°C</span>
        <span className="text-muted-foreground text-[10px]">{data.weather.description}</span>
      </div>
    </div>
  );
};
