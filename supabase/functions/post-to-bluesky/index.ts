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

async function uploadImageToBluesky(session: BlueskySession, imageUrl: string): Promise<any> {
  try {
    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status);
      return null;
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Upload to Bluesky
    const uploadResponse = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': imageBlob.type,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      console.error('Failed to upload image to Bluesky:', await uploadResponse.text());
      return null;
    }

    const result = await uploadResponse.json();
    return result.blob;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
}

async function createBlueskyPost(
  session: BlueskySession, 
  title: string, 
  articleUrl: string, 
  excerpt: string,
  imageBlob?: any
): Promise<any> {
  // Build post text: title or excerpt + link + brand, respecting Bluesky limits
  const baseText = `${title} | Bosphorus News Network`;
  const urlPart = `\n\n${articleUrl}`;
  const maxLength = 300;

  let middle = excerpt ? `\n\n${excerpt}` : '';
  let fullText = baseText + middle + urlPart;

  if (fullText.length > maxLength) {
    if (!excerpt) {
      const allowedBaseLength = maxLength - urlPart.length - 3; // 3 for '...'
      const truncatedBase = allowedBaseLength > 0
        ? baseText.slice(0, allowedBaseLength) + '...'
        : baseText;
      fullText = truncatedBase + urlPart;
    } else {
      const fixedLength = baseText.length + urlPart.length + 5; // 5 for "\n\n" and "..."
      const allowedExcerptLength = maxLength - fixedLength;

      if (allowedExcerptLength <= 0) {
        fullText = baseText + urlPart;
      } else {
        const truncatedExcerpt = excerpt.slice(0, allowedExcerptLength) + '...';
        middle = `\n\n${truncatedExcerpt}`;
        fullText = baseText + middle + urlPart;
      }
    }
  }

  const record: any = {
    text: fullText,
    createdAt: new Date().toISOString(),
    $type: 'app.bsky.feed.post',
  };
  // Add link card embed with thumbnail
  if (articleUrl) {
    record.embed = {
      $type: 'app.bsky.embed.external',
      external: {
        uri: articleUrl,
        title: title,
        description: excerpt || '',
      }
    };

    // Add thumbnail if available
    if (imageBlob) {
      record.embed.external.thumb = imageBlob;
    }
  }

  const response = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessJwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: record,
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
    const { title, slug, excerpt, image_url } = await req.json();

    if (!title || !slug) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title and slug' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Construct the article URL using the site's domain
    const siteUrl = Deno.env.get('SITE_URL') || 'https://bosphorusnewsnetwork.com';
    const articleUrl = `${siteUrl}/article/${slug}`;
    
    console.log('Posting to Bluesky with link card:', { title, articleUrl, excerpt, image_url });
    
    const session = await authenticateBluesky();
    
    // Upload image if provided
    let imageBlob = null;
    if (image_url) {
      imageBlob = await uploadImageToBluesky(session, image_url);
    }
    
    // Create post with link card embed
    const result = await createBlueskyPost(session, title, articleUrl, excerpt || '', imageBlob);

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
