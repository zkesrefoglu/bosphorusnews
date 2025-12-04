import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('BALLDONTLIE_API_KEY');
    if (!apiKey) {
      throw new Error('BALLDONTLIE_API_KEY not configured');
    }

    console.log('Searching for Sengun on Balldontlie API...');

    const response = await fetch('https://api.balldontlie.io/v1/players?search=Sengun', {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Balldontlie API error:', response.status, errorText);
      throw new Error(`Balldontlie API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Balldontlie response:', JSON.stringify(data, null, 2));

    const sengun = data.data?.find((player: any) => 
      player.last_name?.toLowerCase().includes('sengun') || 
      player.first_name?.toLowerCase().includes('alperen')
    );

    if (sengun) {
      console.log('Found Alperen Sengun:', sengun);
      
      // Update the athlete_profiles table with the balldontlie_id
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('athlete_profiles')
        .update({ balldontlie_id: sengun.id })
        .eq('slug', 'alperen-sengun');

      if (updateError) {
        console.error('Error updating athlete profile:', updateError);
      } else {
        console.log('Updated Alperen Sengun with balldontlie_id:', sengun.id);
      }

      return new Response(JSON.stringify({
        success: true,
        player: {
          id: sengun.id,
          first_name: sengun.first_name,
          last_name: sengun.last_name,
          team: sengun.team?.full_name,
          position: sengun.position,
          jersey_number: sengun.jersey_number,
        },
        message: `Found Alperen Sengun with ID: ${sengun.id}. Updated athlete_profiles table.`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Sengun not found in search results',
      raw_data: data,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
