/**
 * Cloudflare Worker for Social Media Crawler Detection
 * 
 * This worker detects social media crawlers and redirects them to the og-image
 * edge function for proper article thumbnails.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to Cloudflare Dashboard → Workers & Pages → Create Worker
 * 2. Copy and paste this entire script
 * 3. Deploy the worker
 * 4. Go to your domain's Workers Routes
 * 5. Add route: bosphorusnews.com/article/* → select your worker
 */

// Social media crawler user agents
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'vkShare',
  'Applebot',
  'Googlebot',
  'bingbot',
  'Embedly',
  'Quora Link Preview',
  'Slack-ImgProxy',
  'redditbot',
];

// Your Supabase edge function URL
const OG_IMAGE_FUNCTION_URL = 'https://mxmarjrkwrqnhhipckzj.supabase.co/functions/v1/og-image';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    const pathname = url.pathname;

    // Only intercept article pages
    if (pathname.startsWith('/article/')) {
      // Check if request is from a social media crawler
      const isCrawler = CRAWLER_USER_AGENTS.some(agent => 
        userAgent.toLowerCase().includes(agent.toLowerCase())
      );

      if (isCrawler) {
        // Extract the slug from the URL (e.g., /article/my-article-slug -> my-article-slug)
        const slug = pathname.replace('/article/', '').split('/')[0];
        
        // Fetch the og-image response from your edge function
        const ogImageUrl = `${OG_IMAGE_FUNCTION_URL}?slug=${encodeURIComponent(slug)}`;
        
        try {
          const ogResponse = await fetch(ogImageUrl);
          
          // Return the og-image HTML with proper headers
          return new Response(await ogResponse.text(), {
            status: ogResponse.status,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
            },
          });
        } catch (error) {
          // If edge function fails, fall through to origin
          console.error('OG Image fetch failed:', error);
        }
      }
    }

    // For non-crawlers or non-article pages, pass through to origin
    return fetch(request);
  },
};
