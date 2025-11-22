import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlueskySession {
  accessJwt: string;
  refreshJwt: string;
  handle: string;
  did: string;
}

async function authenticateBluesky(): Promise<BlueskySession> {
  const identifier = Deno.env.get('BLUESKY_IDENTIFIER');
  const password = Deno.env.get('BLUESKY_PASSWORD');

  if (!identifier || !password) {
    throw new Error('Missing Bluesky credentials');
  }

  const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      identifier: identifier,
      password: password,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Bluesky authentication failed:', error);
    throw new Error(`Failed to authenticate with Bluesky: ${response.status}`);
  }

  return await response.json();
}

async function createBlueskyPost(session: BlueskySession, text: string): Promise<any> {
  const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: text,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to create Bluesky post:', error);
    throw new Error(`Failed to create post: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, slug } = await req.json();

    if (!title || !slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and slug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the article URL
    const articleUrl = `https://your-site.com/article/${slug}`;
    
    // Format the post text (Bluesky has a 300 character limit)
    const postText = `${title}\n\n${articleUrl}`;
    
    if (postText.length > 300) {
      // Truncate title if needed
      const maxTitleLength = 300 - articleUrl.length - 5; // 5 for "\n\n" and "..."
      const truncatedTitle = title.substring(0, maxTitleLength) + '...';
      const finalPostText = `${truncatedTitle}\n\n${articleUrl}`;
      
      console.log('Post truncated to:', finalPostText);
      
      const session = await authenticateBluesky();
      const result = await createBlueskyPost(session, finalPostText);
      
      return new Response(
        JSON.stringify({ success: true, post: result, truncated: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Posting to Bluesky:', postText);
    
    const session = await authenticateBluesky();
    const result = await createBlueskyPost(session, postText);

    return new Response(
      JSON.stringify({ success: true, post: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in post-to-bluesky function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
