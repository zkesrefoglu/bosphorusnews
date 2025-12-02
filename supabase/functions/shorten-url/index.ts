import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();
    
    if (!slug) {
      throw new Error('Slug is required');
    }

    const bitlyToken = Deno.env.get('BITLY_API_TOKEN');
    if (!bitlyToken) {
      throw new Error('Bitly API token not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // The long URL points to our og-image edge function
    const longUrl = `${supabaseUrl}/functions/v1/og-image?slug=${encodeURIComponent(slug)}`;
    
    console.log('Creating short URL for:', longUrl);

    // Call Bitly API to shorten the URL
    const bitlyResponse = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${bitlyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        long_url: longUrl,
        domain: 'bit.ly',
      }),
    });

    if (!bitlyResponse.ok) {
      const errorData = await bitlyResponse.text();
      console.error('Bitly API error:', errorData);
      throw new Error(`Bitly API error: ${bitlyResponse.status}`);
    }

    const bitlyData = await bitlyResponse.json();
    const shortUrl = bitlyData.link;
    
    console.log('Generated short URL:', shortUrl);

    // Update the article with the short URL
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: updateError } = await supabase
      .from('news_articles')
      .update({ short_url: shortUrl })
      .eq('slug', slug);

    if (updateError) {
      console.error('Failed to update article with short URL:', updateError);
      // Don't throw - we still want to return the short URL even if update fails
    }

    return new Response(
      JSON.stringify({ shortUrl, success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in shorten-url function:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
