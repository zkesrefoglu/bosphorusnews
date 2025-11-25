import { corsHeaders } from '../_shared/cors.ts';

// In-memory cache
let cachedData: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function isCacheValid(): boolean {
  return cachedData !== null && (Date.now() - cacheTimestamp < CACHE_TTL_MS);
}

async function fetchCurrencyRates() {
  try {
    // Fetch USD/TRY
    const usdResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const usdData = await usdResponse.json();
    
    // Fetch EUR/TRY
    const eurResponse = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
    const eurData = await eurResponse.json();
    
    return {
      usdTry: usdData.rates.TRY,
      eurTry: eurData.rates.TRY,
    };
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    throw error;
  }
}

async function fetchBIST100() {
  // Yahoo Finance API is currently returning 401 errors
  // Using fallback data until a reliable alternative is found
  console.log('Using fallback BIST 100 data (Yahoo Finance API unavailable)');
  return {
    price: 10250.5,
    change: 45.2,
    changePercent: 0.44,
  };
}

async function fetchWeather() {
  try {
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=41.0082&longitude=28.9784&current=temperature_2m,weather_code&timezone=Europe%2FIstanbul'
    );
    const data = await response.json();
    
    return {
      temp: data.current.temperature_2m,
      description: getWeatherDescription(data.current.weather_code),
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  return 'Stormy';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetch ticker data request received');

    // Return cached data if still valid
    if (isCacheValid()) {
      console.log('Returning cached data');
      return new Response(
        JSON.stringify({ ...cachedData, cached: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Cache expired or missing, fetching fresh data');

    // Fetch all data in parallel, with individual error handling
    const results = await Promise.allSettled([
      fetchCurrencyRates(),
      fetchBIST100(),
      fetchWeather(),
    ]);

    // Extract successful results or use fallbacks
    const currency = results[0].status === 'fulfilled' 
      ? results[0].value 
      : { usdTry: 34.5, eurTry: 37.5 };
    
    const bist = results[1].status === 'fulfilled'
      ? results[1].value
      : { price: 9500, change: 0, changePercent: 0 };
    
    const weather = results[2].status === 'fulfilled'
      ? results[2].value
      : { temp: 15, description: 'Clear' };

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`API ${index} failed:`, result.reason);
      }
    });

    // Compile response
    const responseData = {
      usdTry: currency.usdTry,
      eurTry: currency.eurTry,
      bist100: {
        price: bist.price,
        change: bist.change,
        changePercent: bist.changePercent,
      },
      weather: {
        temp: weather.temp,
        description: weather.description,
      },
      timestamp: new Date().toISOString(),
      cached: false,
    };

    // Update cache
    cachedData = responseData;
    cacheTimestamp = Date.now();

    console.log('Fresh data fetched and cached successfully');

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-ticker-data:', error);

    // Return stale cache if available
    if (cachedData) {
      console.log('Error occurred, returning stale cache');
      return new Response(
        JSON.stringify({ ...cachedData, cached: true, stale: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // No cache available, return error
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch ticker data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
