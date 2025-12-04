import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FIRECRAWL_API_KEY) {
      throw new Error('FIRECRAWL_API_KEY is not configured');
    }

    console.log('Fetching ESPN Hollinger stats via Firecrawl API...');

    // Use Firecrawl API directly instead of SDK (Deno compatibility)
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'http://insider.espn.com/nba/hollinger/statistics',
        formats: ['markdown'],
      }),
    });

    if (!scrapeResponse.ok) {
      const errorText = await scrapeResponse.text();
      console.error('Firecrawl API error:', scrapeResponse.status, errorText);
      throw new Error(`Firecrawl API error: ${scrapeResponse.status}`);
    }

    const scrapeResult = await scrapeResponse.json();
    
    if (!scrapeResult.success || !scrapeResult.data?.markdown) {
      console.error('Scrape failed:', scrapeResult);
      throw new Error('Failed to scrape ESPN Hollinger page');
    }

    console.log('Scrape successful, parsing for Sengun...');

    const markdown = scrapeResult.data.markdown;
    
    // Parse the markdown table to find Sengun's row
    const lines = markdown.split('\n');
    let sengunData: Record<string, unknown> | null = null;

    for (const line of lines) {
      if (line.toLowerCase().includes('sengun')) {
        console.log('Found Sengun line:', line);
        
        const parts = line.split('|').map((p: string) => p.trim()).filter((p: string) => p.length > 0);
        
        if (parts.length >= 12) {
          const rank = parseInt(parts[0]) || null;
          const per = parseFloat(parts[parts.length - 3]) || null;
          const va = parseFloat(parts[parts.length - 2]) || null;
          const ewa = parseFloat(parts[parts.length - 1]) || null;
          const gp = parseInt(parts[2]) || null;
          const mpg = parseFloat(parts[3]) || null;
          const tsPercent = parseFloat(parts[4]?.replace('.', '0.')) || null;
          const usg = parseFloat(parts[7]) || null;

          sengunData = {
            rank,
            per,
            va,
            ewa,
            gp,
            mpg,
            ts_percent: tsPercent,
            usg,
            raw_line: line,
          };
          
          console.log('Parsed Sengun data:', sengunData);
          break;
        }
      }
    }

    // Alternative parsing via regex
    if (!sengunData) {
      const sengunMatch = markdown.match(/(\d+)\s+\|?\s*Alperen Sengun[^|]*\|?\s*(\d+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)\s*\|?\s*([\d.]+)/i);
      
      if (sengunMatch) {
        sengunData = {
          rank: parseInt(sengunMatch[1]),
          gp: parseInt(sengunMatch[2]),
          mpg: parseFloat(sengunMatch[3]),
          ts_percent: parseFloat(sengunMatch[4]),
          per: parseFloat(sengunMatch[11]),
          va: parseFloat(sengunMatch[12]),
          ewa: parseFloat(sengunMatch[13]) || null,
        };
        console.log('Parsed Sengun via regex:', sengunData);
      }
    }

    if (!sengunData) {
      console.log('Could not find Sengun. Markdown preview:', markdown.substring(0, 2000));
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Could not find Alperen Sengun in Hollinger stats',
        preview: markdown.substring(0, 2000)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update database
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const { data: athlete, error: athleteError } = await supabase
        .from('athlete_profiles')
        .select('id')
        .eq('slug', 'alperen-sengun')
        .single();

      if (athlete && !athleteError) {
        const currentSeason = '2024-25';
        
        const { error: updateError } = await supabase
          .from('athlete_season_stats')
          .upsert({
            athlete_id: athlete.id,
            competition: 'NBA',
            season: currentSeason,
            rankings: {
              per_rank: sengunData.rank,
              per: sengunData.per,
              va: sengunData.va,
              ewa: sengunData.ewa,
            },
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'athlete_id,competition,season',
          });

        if (updateError) {
          console.error('Failed to update season stats:', updateError);
        } else {
          console.log('Successfully updated Hollinger stats in database');
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: sengunData,
      message: 'Hollinger stats fetched successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching Hollinger stats:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
